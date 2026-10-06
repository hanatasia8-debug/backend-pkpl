import { NewsService } from "../../../../modules/news/news.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";
import { requireAdmin } from "../../../../shared/auth/require-admin";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;
    const category = searchParams.get("category") || undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const status = searchParams.get("status") || undefined;

    const data = await NewsService.getAllNews({
      page,
      limit,
      category,
      type,
      search,
      status,
    });
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar berita admin", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const result = await NewsService.createNews({
      ...body,
      status: body.status || "PUBLISHED",
    });
    return ApiResponse.success(result, "Berita berhasil disimpan oleh Admin", 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Create admin news error:", error);
    return ApiResponse.error(`Terjadi kesalahan saat membuat berita: ${error.message}`, 500);
  }
}
