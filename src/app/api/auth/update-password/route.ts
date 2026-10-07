import { AuthService } from "../../../../modules/auth/auth.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await AuthService.updatePassword(body);
    return ApiResponse.success(result, result.message);
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Gagal memperbarui kata sandi:", error);
    return ApiResponse.error("Terjadi kesalahan saat memperbarui kata sandi", 500);
  }
}
