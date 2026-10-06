import { AuthService } from "../../../../modules/auth/auth.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";
import { checkRateLimit } from "../../../../shared/utils/rate-limiter";

export async function POST(request: Request) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-client";
    const limitCheck = checkRateLimit(`login:${clientIp}`, 10, 60 * 1000); // 10 attempts per minute

    if (!limitCheck.allowed) {
      return ApiResponse.error(
        `Terlalu banyak percobaan login. Silakan tunggu ${limitCheck.retryAfterSeconds} detik lagi.`,
        429
      );
    }

    const body = await request.json();
    const { user, session } = await AuthService.signIn(body);

    const serializedUser = encodeURIComponent(JSON.stringify({
      name: user.user_metadata?.name || (user as any).name || "Admin Desa",
      email: user.email,
      role: "ADMIN",
    }));

    const payload = {
      ...user,
      access_token: session?.access_token,
      refresh_token: session?.refresh_token,
      session,
    };

    const response = ApiResponse.success(payload, "Login berhasil", 200);

    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    const sameSitePolicy = isProduction ? "None" : "Lax";
    const secureFlag = isProduction ? "; Secure" : "";

    response.headers.append(
      "Set-Cookie",
      `pringgodani_admin_session=${serializedUser}; Path=/; Max-Age=10800; SameSite=${sameSitePolicy}${secureFlag}`
    );
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat login", 500);
  }
}
