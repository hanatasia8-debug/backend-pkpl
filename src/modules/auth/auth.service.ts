import { createClient, createAdminClient } from "../../shared/supabase/server";
import { signInSchema, signUpSchema } from "./auth.schema";
import { ValidationError, AppError, UnauthorizedError } from "../../shared/errors/app-error";

export class AuthService {
  static async signUp(input: unknown) {
    const validation = signUpSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(validation.error.issues[0].message);
    }

    const { email, password, name } = validation.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    return data.user;
  }

  static async signIn(input: unknown) {
    const validation = signInSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(validation.error.issues[0].message);
    }

    const { email, password } = validation.data;
    const supabase = createAdminClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    return { user: data.user, session: data.session };
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
