import { AdminSubmissionsService } from "../../../../modules/admin/admin-submissions.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";
import { requireAdmin } from "../../../../shared/auth/require-admin";

export async function GET() {
  try {
    await requireAdmin();
    const data = await AdminSubmissionsService.getSubmissions();
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get admin submissions error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar pengajuan", 500);
  }
}
