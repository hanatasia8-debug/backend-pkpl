import { requireAdmin } from "../../../../shared/auth/require-admin";
import { prisma } from "../../../../shared/db/client";
import { createAdminClient } from "../../../../shared/supabase/server";
import { AppError } from "../../../../shared/errors/app-error";
import { ApiResponse } from "../../../../shared/utils/response";

export async function GET() {
  try {
    await requireAdmin();
    const [users, authUsers] = await Promise.all([
      prisma.user.findMany({
      where: {
        role: { name: { equals: "USER", mode: "insensitive" } },
      },
      select: { id: true, name: true, email: true },
      orderBy: { email: "asc" },
      }),
      createAdminClient().auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);
    if (authUsers.error) throw authUsers.error;
    const pendingRequestIds = new Set(
      authUsers.data.users
        .filter((user) => user.app_metadata.admin_access_requested === true)
        .map((user) => user.id),
    );
    return ApiResponse.success(
      users.filter((user) => pendingRequestIds.has(user.id)),
    );
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Gagal memuat permintaan akses admin:", error);
    return ApiResponse.error("Gagal memuat permintaan akses admin", 500);
  }
}
