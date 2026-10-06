import { MapsService } from "../../../../../modules/maps/maps.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return ApiResponse.error("Parameter ID lokasi wajib diisi", 400);
    }

    const location = await MapsService.getLocationById(idStr);
    return ApiResponse.success(location);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil lokasi", 500);
  }
}
