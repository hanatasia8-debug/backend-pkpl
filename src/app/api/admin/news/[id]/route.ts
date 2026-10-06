import { NewsService } from "../../../../../modules/news/news.service";
import { NewsRepository } from "../../../../../modules/news/news.repository";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";
import { requireAdmin } from "../../../../../shared/auth/require-admin";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const data = await NewsRepository.findById(id);
    if (!data) {
      return ApiResponse.error("Berita tidak ditemukan", 404);
    }
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get admin news detail error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memuat detail berita", 500);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const data = await NewsService.updateNews(id, body);
    return ApiResponse.success(data, "Berita berhasil diperbarui");
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Update news error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memperbarui berita", 500);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await NewsService.deleteNews(id);
    return ApiResponse.success(null, "Berita berhasil dihapus");
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Delete news error:", error);
    return ApiResponse.error("Terjadi kesalahan saat menghapus berita", 500);
  }
}
