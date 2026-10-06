import { MapsService } from "../../../../../../modules/maps/maps.service";
import { ApiResponse } from "../../../../../../shared/utils/response";
import { AppError } from "../../../../../../shared/errors/app-error";
import { requireAdmin } from "../../../../../../shared/auth/require-admin";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const result = await MapsService.updateCategory(id, body);
    return ApiResponse.success(result, "Kategori peta berhasil diperbarui");
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Update map category error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memperbarui kategori peta", 500);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await MapsService.deleteCategory(id);
    return ApiResponse.success(null, "Kategori peta berhasil dihapus");
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Delete map category error:", error);
    return ApiResponse.error("Terjadi kesalahan saat menghapus kategori peta", 500);
  }
}
