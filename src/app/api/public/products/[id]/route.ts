import { ProductsService } from "../../../../../modules/products/products.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await ProductsService.getProductById(id);
    const response = ApiResponse.success(data);
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get product detail error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil detail produk", 500);
  }
}
