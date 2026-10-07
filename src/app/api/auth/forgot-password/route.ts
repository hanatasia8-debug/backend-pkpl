import { AuthService } from "../../../../modules/auth/auth.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";
import { checkRateLimit } from "../../../../shared/utils/rate-limiter";
import { getAllowedFrontendOrigin } from "../../../../shared/auth/frontend-origin";

export async function POST(request: Request) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown-client";
    const limitCheck = checkRateLimit(`password-recovery:${clientIp}`, 3, 60 * 1000);
    if (!limitCheck.allowed) {
      return ApiResponse.error(
        `Terlalu banyak permintaan reset. Coba lagi dalam ${limitCheck.retryAfterSeconds} detik.`,
        429,
      );
    }

    const body = await request.json();
    const origin = getAllowedFrontendOrigin(request);
    const redirectTo = new URL(
      "/api/auth/callback?next=%2Fadmin%2Freset-password",
      origin,
    ).toString();
    const result = await AuthService.requestPasswordRecovery(body, redirectTo);
    return ApiResponse.success(result, result.message);
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Gagal meminta pemulihan kata sandi:", error);
    return ApiResponse.error("Terjadi kesalahan saat meminta pemulihan kata sandi", 500);
  }
}
