import { UmkmService } from "../../../../modules/umkm/umkm.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 8;
    const category =
      searchParams.get("category") ||
      searchParams.get("categorySlug") ||
      searchParams.get("kategori") ||
      undefined;
    const search =
      searchParams.get("search") ||
      searchParams.get("q") ||
      searchParams.get("cari") ||
      undefined;
    const exclude = searchParams.get("exclude") || undefined;
    const sort = searchParams.get("sort") || undefined;

    // Public endpoint must always enforce APPROVED status only
    const data = await UmkmService.getAllUmkm({
      page,
      limit,
      category,
      search,
      exclude,
      status: "APPROVED",
      sort,
    });

    const response = ApiResponse.success(data);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get UMKM list error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar UMKM", 500);
  }
}
