import { NewsService } from "../../../../../modules/news/news.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";
import { requireAdmin } from "../../../../../shared/auth/require-admin";

export async function GET() {
  try {
    await requireAdmin();
    // includeAll = true so admin gets all categories regardless of published news count
    const data = await NewsService.getCategories(true);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get admin news categories error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memuat kategori berita", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const result = await NewsService.createCategory(body);
    return ApiResponse.success(result, "Kategori berita berhasil ditambahkan", 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Create admin news category error:", error);
    return ApiResponse.error(
      `Terjadi kesalahan saat menambah kategori berita: ${error.message}`,
      500
    );
  }
}
