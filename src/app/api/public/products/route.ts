import { ProductsService } from "../../../../modules/products/products.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      category:
        searchParams.get("category") ||
        searchParams.get("categorySlug") ||
        searchParams.get("kategori") ||
        undefined,
      search:
        searchParams.get("search") ||
        searchParams.get("q") ||
        searchParams.get("cari") ||
        undefined,
      umkmSlug:
        searchParams.get("umkmSlug") ||
        searchParams.get("umkm") ||
        undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      sort: searchParams.get("sort") || undefined,
    };

    const data = await ProductsService.getAllProducts(params);
    const response = ApiResponse.success(data);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get public products error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar produk", 500);
  }
}
