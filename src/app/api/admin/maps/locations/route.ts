import { MapsService } from "../../../../../modules/maps/maps.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";
import { requireAdmin } from "../../../../../shared/auth/require-admin";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug") || undefined;
    const q = searchParams.get("q") || undefined;

    const locations = await MapsService.getLocations(categorySlug, q);
    return ApiResponse.success(locations);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar lokasi peta", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const result = await MapsService.createLocation(body);
    return ApiResponse.success(result, "Lokasi peta berhasil ditambahkan", 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Create map location error:", error);
    return ApiResponse.error(`Terjadi kesalahan saat menambah lokasi peta: ${error.message}`, 500);
  }
}
