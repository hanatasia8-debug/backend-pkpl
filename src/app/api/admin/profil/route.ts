import { AdminProfilRepository } from "../../../../modules/admin/admin-profil.repository";
import { ApiResponse } from "../../../../shared/utils/response";
import { requireAdmin } from "../../../../shared/auth/require-admin";

export async function GET() {
  try {
    const data = await AdminProfilRepository.getVillageProfile();
    return ApiResponse.success(data);
  } catch (error: any) {
    console.error("Get admin profil error:", error);
    return ApiResponse.error("Gagal mengambil profil admin", 500);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const result = await AdminProfilRepository.updateVillageProfile(body);
    return ApiResponse.success(result, "Profil desa berhasil diperbarui");
  } catch (error: any) {
    console.error("Update admin profil error:", error);
    return ApiResponse.error("Gagal memperbarui profil desa", 500);
  }
}
