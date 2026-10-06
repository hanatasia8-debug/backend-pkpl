import { UmkmService } from "../../../../../modules/umkm/umkm.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";
import { requireAdmin } from "../../../../../shared/auth/require-admin";

export async function GET() {
  try {
    await requireAdmin();
    // includeAll = true so admin gets all categories regardless of approved umkm count
    const data = await UmkmService.getCategories(true);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get admin UMKM categories error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memuat kategori UMKM", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const result = await UmkmService.createCategory(body);
    return ApiResponse.success(result, "Kategori UMKM berhasil ditambahkan", 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Create admin UMKM category error:", error);
    return ApiResponse.error(
      `Terjadi kesalahan saat menambah kategori UMKM: ${error.message}`,
      500
    );
  }
}
