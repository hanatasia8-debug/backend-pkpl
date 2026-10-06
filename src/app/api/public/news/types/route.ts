import { NewsService } from "../../../../../modules/news/news.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";

export async function GET() {
  try {
    const types = await NewsService.getTypes();
    return ApiResponse.success(types);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil tipe berita", 500);
  }
}
