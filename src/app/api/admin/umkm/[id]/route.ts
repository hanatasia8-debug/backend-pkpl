import { UmkmService } from "../../../../../modules/umkm/umkm.service";
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
    console.log("=== DEBUG BACKEND GET UMKM BY ID ===");
    console.log("Requested idStr:", id);
    const umkm = await UmkmService.getUmkmById(id);
    console.log("Found UMKM payload:", umkm);
    return ApiResponse.success(umkm);
  } catch (error: any) {
    console.error("DEBUG BACKEND: Get UMKM error:", error);
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat memuat detail UMKM", 500);
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
    const umkm = await UmkmService.updateUmkm(id, body);
    return ApiResponse.success(umkm, "UMKM berhasil diperbarui");
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Update UMKM error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memperbarui UMKM", 500);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await UmkmService.deleteUmkm(id);
    return ApiResponse.success(null, "UMKM berhasil dihapus");
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Delete UMKM error:", error);
    return ApiResponse.error("Terjadi kesalahan saat menghapus UMKM", 500);
  }
}
