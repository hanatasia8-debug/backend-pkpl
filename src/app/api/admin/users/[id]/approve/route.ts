import { requireAdmin } from "../../../../../../shared/auth/require-admin";
import { prisma } from "../../../../../../shared/db/client";
import { createAdminClient } from "../../../../../../shared/supabase/server";
import { AppError, NotFoundError } from "../../../../../../shared/errors/app-error";
import { ApiResponse } from "../../../../../../shared/utils/response";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError("Permintaan akun tidak ditemukan.");
    }

    const supabase = createAdminClient();
    const { data: authUser, error: authLookupError } =
      await supabase.auth.admin.getUserById(id);
    if (authLookupError) throw authLookupError;
    if (authUser.user.app_metadata.admin_access_requested !== true) {
      throw new NotFoundError("Permintaan persetujuan akun tidak ditemukan.");
    }

    const adminRole = await prisma.role.findFirst({
      where: { name: { equals: "ADMIN", mode: "insensitive" } },
    });
    if (!adminRole) {
      throw new AppError("Role ADMIN belum tersedia.", 500);
    }

    await prisma.user.update({
      where: { id },
      data: { roleId: adminRole.id },
    });
    const { error: metadataError } =
      await supabase.auth.admin.updateUserById(id, {
        app_metadata: { admin_access_requested: false },
      });
    if (metadataError) {
      console.error("Akses admin disetujui, tetapi penanda permintaan gagal dibersihkan:", metadataError);
    }
    return ApiResponse.success({ id }, "Akses admin disetujui.");
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Gagal menyetujui permintaan akses admin:", error);
    return ApiResponse.error("Gagal menyetujui permintaan akses admin", 500);
  }
}
