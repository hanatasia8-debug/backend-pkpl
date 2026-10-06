import { SearchService } from "../../../../modules/search/search.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("search") || "";

    const data = await SearchService.globalSearch(query);
    const response = ApiResponse.success(data);
    response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Global search error:", error);
    return ApiResponse.error("Terjadi kesalahan saat melakukan pencarian", 500);
  }
}
