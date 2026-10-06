import { MapsService } from "../../../../../modules/maps/maps.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";
import { requireAdmin } from "../../../../../shared/auth/require-admin";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await MapsService.getCategories();
    return ApiResponse.success(categories);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar kategori peta", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const result = await MapsService.createCategory(body);
    return ApiResponse.success(result, "Kategori peta berhasil ditambahkan", 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Create map category error:", error);
    return ApiResponse.error(`Terjadi kesalahan saat menambah kategori peta: ${error.message}`, 500);
  }
}
