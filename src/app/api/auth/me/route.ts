import { AuthService } from "../../../../modules/auth/auth.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function GET() {
  try {
    const user = await AuthService.getCurrentUser();
    return ApiResponse.success(user);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Gagal mengambil profil pengguna", 500);
  }
}
