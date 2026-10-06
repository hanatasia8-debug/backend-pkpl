import { NewsService } from "../../../../../modules/news/news.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await NewsService.createNews({
      ...body,
      status: "PENDING",
    });

    return ApiResponse.success(
      result,
      "Berita berhasil diajukan dan menunggu persetujuan admin.",
      201
    );
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Create news register error:", error);
    return ApiResponse.error(`Terjadi kesalahan saat mendaftarkan berita: ${error.message}`, 500);
  }
}
