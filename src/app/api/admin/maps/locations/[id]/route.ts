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
    const result = await MapsService.updateLocation(id, body);
    return ApiResponse.success(result, "Lokasi peta berhasil diperbarui");
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Update map location error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memperbarui lokasi peta", 500);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await MapsService.deleteLocation(id);
    return ApiResponse.success(null, "Lokasi peta berhasil dihapus");
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Delete map location error:", error);
    return ApiResponse.error("Terjadi kesalahan saat menghapus lokasi peta", 500);
  }
}
