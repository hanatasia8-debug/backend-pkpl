import { UmkmService } from "../../../../modules/umkm/umkm.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";
import { requireAdmin } from "../../../../shared/auth/require-admin";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 1000;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || "ALL";

    const data = await UmkmService.getAllUmkm({
      page,
      limit,
      category,
      search,
      status,
    });
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar UMKM admin", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const result = await UmkmService.registerUmkm(body);
    return ApiResponse.success(result, "UMKM berhasil ditambahkan oleh Admin", 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Create admin UMKM error:", error);
    return ApiResponse.error(`Terjadi kesalahan saat menambah UMKM: ${error.message}`, 500);
  }
}
