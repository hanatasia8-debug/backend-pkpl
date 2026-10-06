import { MapsService } from "../../../../../modules/maps/maps.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug") || undefined;
    const searchQuery = searchParams.get("q") || undefined;

    const locations = await MapsService.getLocations(categorySlug, searchQuery);
    const response = ApiResponse.success(locations);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil lokasi peta", 500);
  }
}
