import { SettingsService } from "../../../../modules/settings/settings.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await SettingsService.getSettings();
    const response = ApiResponse.success(data);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get settings error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil pengaturan website", 500);
  }
}
