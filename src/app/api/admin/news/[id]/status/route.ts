import { AdminSubmissionsService } from "../../../../../../modules/admin/admin-submissions.service";
import { ApiResponse } from "../../../../../../shared/utils/response";
import { AppError } from "../../../../../../shared/errors/app-error";
import { requireAdmin } from "../../../../../../shared/auth/require-admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const status = body.status;
    const rejectionReason = body.rejectionReason || body.reason || null;

    const result = await AdminSubmissionsService.setNewsStatus(id, status, rejectionReason);
    return ApiResponse.success(result, `Status berita berhasil diperbarui menjadi ${status}`);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Update news status error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengubah status berita", 500);
  }
}
