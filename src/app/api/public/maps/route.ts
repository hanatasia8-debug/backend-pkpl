import { MapsService } from "../../../../modules/maps/maps.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug") || searchParams.get("category") || undefined;
    const searchQuery = searchParams.get("q") || searchParams.get("search") || undefined;

    const locations = await MapsService.getLocations(categorySlug, searchQuery);
    const response = ApiResponse.success(locations);
    response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil data peta", 500);
  }
}
