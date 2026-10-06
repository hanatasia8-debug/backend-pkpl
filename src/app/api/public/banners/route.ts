import { BannerService } from "../../../../modules/banner/banner.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function GET() {
  try {
    const data = await BannerService.getActiveBanners();
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get active banners error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar banner", 500);
  }
}
