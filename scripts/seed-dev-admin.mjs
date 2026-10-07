import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

async function main() {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.DEV_ADMIN_SEED_CONFIRM !== "LOCAL_ONLY"
  ) {
    throw new Error(
      "Refusing to seed the test admin. Set NODE_ENV=development and DEV_ADMIN_SEED_CONFIRM=LOCAL_ONLY only for a non-production Supabase project.",
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const connectionString = process.env.DATABASE_URL;
  if (!supabaseUrl || !serviceRoleKey || !connectionString) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and DATABASE_URL are required.",
    );
  }

  let parsedSupabaseUrl;
  try {
    parsedSupabaseUrl = new URL(supabaseUrl);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be an absolute HTTP or HTTPS URL, for example https://<project-ref>.supabase.co.",
    );
  }
  if (parsedSupabaseUrl.protocol !== "http:" && parsedSupabaseUrl.protocol !== "https:") {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must use the HTTP or HTTPS protocol.",
    );
  }

  const email = process.env.SEED_ADMIN_EMAIL || "admin@pringgodani.desa.id";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin123";
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const pool = new Pool({ connectionString, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const expectedRoles = [
      { id: 1n, name: "ADMIN", description: "Local development administrator" },
      { id: 2n, name: "USER", description: "Registered user awaiting approval" },
    ];
    for (const role of expectedRoles) {
      const [roleById, roleByName] = await Promise.all([
        prisma.role.findUnique({ where: { id: role.id } }),
        prisma.role.findFirst({
          where: { name: { equals: role.name, mode: "insensitive" } },
        }),
      ]);
      if (
        (roleById && roleById.name.toUpperCase() !== role.name) ||
        (roleByName && roleByName.id !== role.id)
      ) {
        throw new Error(
          `Role mapping conflict: Supabase auth expects roles ADMIN=1 and USER=2, but ${role.name} conflicts with the existing roles table. Resolve the role mapping before creating the test user.`,
        );
      }
      if (!roleById) {
        await prisma.role.create({ data: role });
      }
    }
    await pool.query(
      `SELECT setval(pg_get_serial_sequence('"roles"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "roles"), 1), true)`,
    );

    const { data: userPage, error: listError } =
      await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) throw listError;

    const existingUser = userPage.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    const { data: authData, error: authError } = existingUser
      ? await supabase.auth.admin.updateUserById(existingUser.id, {
          password,
          email_confirm: true,
          user_metadata: { ...existingUser.user_metadata, name: "Admin Lokal" },
        })
      : await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name: "Admin Lokal" },
        });
    if (authError) {
      if (typeof authError.status === "number" && authError.status >= 500) {
        throw new Error(
          `Supabase Auth returned HTTP ${authError.status} while ${
            existingUser ? "updating" : "creating"
          } the admin user. The Auth service and admin API key are reachable; check the Supabase project's Auth logs for the server-side failure, then retry.`,
          { cause: authError },
        );
      }
      throw authError;
    }
    if (!authData.user) throw new Error("Supabase did not return the admin user.");

    const adminRole = await prisma.role.findUniqueOrThrow({
      where: { id: 1n },
    });
    const databaseUser = await prisma.user.findUnique({ where: { email } });
    if (databaseUser && databaseUser.id !== authData.user.id) {
      throw new Error(
        "The Supabase user ID differs from the existing database record; resolve this mapping manually.",
      );
    }

    await prisma.user.upsert({
      where: { email },
      update: { name: "Admin Lokal", roleId: adminRole.id },
      create: {
        id: authData.user.id,
        name: "Admin Lokal",
        email,
        roleId: adminRole.id,
      },
    });
    console.log(`Local development admin is ready: ${email}`);
    console.log(
      process.env.SEED_ADMIN_PASSWORD
        ? "Use the password configured in SEED_ADMIN_PASSWORD."
        : "Development-only password: Admin123",
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Failed to seed local admin:", error);
  process.exitCode = 1;
});
