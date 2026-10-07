import { createClient, createAdminClient } from "../../shared/supabase/server";
import { prisma } from "../../shared/db/client";
import {
  passwordRecoverySchema,
  passwordUpdateSchema,
  signInSchema,
  signUpSchema,
} from "./auth.schema";
import { ValidationError, AppError, UnauthorizedError } from "../../shared/errors/app-error";

export class AuthService {
  static async signUp(input: unknown, emailRedirectTo?: string) {
    const validation = signUpSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(validation.error.issues[0].message);
    }

    const { email, password, name } = validation.data;
    const resolvedEmailRedirectTo =
      emailRedirectTo ||
      (process.env.FRONTEND_URL
        ? new URL(
            "/api/auth/callback?next=%2Fadmin%2Flogin",
            process.env.FRONTEND_URL,
          ).toString()
        : process.env.NODE_ENV === "development"
          ? "http://localhost:3001/api/auth/callback?next=%2Fadmin%2Flogin"
          : undefined);
    if (!resolvedEmailRedirectTo) {
      throw new AppError("FRONTEND_URL wajib diatur untuk konfirmasi registrasi.", 500);
    }

    const userRole = await prisma.role.findFirst({
      where: { name: { equals: "USER", mode: "insensitive" } },
    });
    if (!userRole) {
      throw new AppError("Role USER belum tersedia. Jalankan seeding database terlebih dahulu.", 500);
    }
    if (userRole.id !== 2n) {
      throw new AppError(
        "Role USER harus memiliki ID 2 agar sesuai dengan trigger Supabase Auth. Periksa mapping tabel roles.",
        500,
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: resolvedEmailRedirectTo,
      },
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    if (!data.user) {
      throw new AppError("Supabase tidak mengembalikan data pengguna setelah registrasi", 500);
    }

    const adminClient = createAdminClient();
    const { error: markerError } =
      await adminClient.auth.admin.updateUserById(data.user.id, {
        app_metadata: { admin_access_requested: true },
      });
    if (markerError) {
      const { error: cleanupError } = await adminClient.auth.admin.deleteUser(
        data.user.id,
      );
      if (cleanupError) {
        console.error("Gagal membersihkan akun Supabase tanpa penanda permintaan admin:", cleanupError);
      }
      throw new AppError(
        "Akun dibuat tetapi permintaan akses admin tidak dapat dicatat.",
        500,
      );
    }

    try {
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          name,
          email: email.toLowerCase(),
          roleId: userRole.id,
        },
        create: {
          id: data.user.id,
          name,
          email: email.toLowerCase(),
          roleId: userRole.id,
        },
      });
    } catch (error) {
      const { error: cleanupError } = await adminClient.auth.admin.deleteUser(
        data.user.id,
      );
      if (cleanupError) {
        console.error("Gagal membersihkan akun Supabase setelah registrasi gagal:", cleanupError);
      }
      throw error;
    }

    return data.user;
  }

  static async signIn(input: unknown) {
    const inputRecord =
      typeof input === "object" && input !== null
        ? (input as Record<string, unknown>)
        : {};
    const requestedEmail =
      typeof inputRecord.email === "string" ? inputRecord.email.trim() : "";
    const isDevelopmentAlias =
      process.env.NODE_ENV === "development" &&
      requestedEmail.toLowerCase() === "admin";
    const email = isDevelopmentAlias
      ? process.env.SEED_ADMIN_EMAIL || "admin@pringgodani.desa.id"
      : requestedEmail;

    const validation = signInSchema.safeParse({
      email,
      password: inputRecord.password,
    });
    if (!validation.success) {
      throw new ValidationError(validation.error.issues[0].message);
    }

    const cleanEmail = validation.data.email.toLowerCase();
    const password = validation.data.password;
    const registeredUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { role: true },
    });
    const roleName = registeredUser?.role.name.toUpperCase();
    if (
      !registeredUser ||
      (roleName !== "ADMIN" &&
        roleName !== "SUPER_ADMIN" &&
        roleName !== "SUPERADMIN")
    ) {
      throw new UnauthorizedError(
        "Email atau kata sandi salah, atau akun belum disetujui sebagai admin.",
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    return { user: data.user, session: data.session };
  }

  static async requestPasswordRecovery(input: unknown, redirectTo: string) {
    const validation = passwordRecoverySchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(validation.error.issues[0].message);
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      validation.data.email,
      { redirectTo },
    );
    if (error) {
      throw new AppError(error.message, 400);
    }

    return { message: "Jika email terdaftar, instruksi pemulihan akan dikirim." };
  }

  static async updatePassword(input: unknown) {
    const validation = passwordUpdateSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(validation.error.issues[0].message);
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.updateUser({
      password: validation.data.password,
    });
    if (error) {
      throw new AppError(error.message, 400);
    }
    if (!data.user) {
      throw new UnauthorizedError("Sesi reset password tidak valid atau sudah kedaluwarsa.");
    }

    return { message: "Kata sandi berhasil diperbarui." };
  }

  static async signOut() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new AppError(error.message, 400);
    }

    return { message: "Berhasil keluar" };
  }

  static async getCurrentUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new UnauthorizedError("Pengguna belum terautentikasi");
    }

    return user;
  }
}
