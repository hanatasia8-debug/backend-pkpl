import { prisma } from "../../../../../shared/db/client";
import { ApiResponse } from "../../../../../shared/utils/response";
import { requireAdmin } from "../../../../../shared/auth/require-admin";
import { StorageService } from "../../../../../modules/storage/storage.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const officialId = BigInt(id);
    const body = await request.json();
    const { name, position, photoUrl, email, greeting } = body;

    const updated = await prisma.villageOfficial.update({
      where: { id: officialId },
      data: {
        ...(name ? { name } : {}),
        ...(position ? { position } : {}),
        ...(photoUrl ? { photoUrl } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(greeting !== undefined ? { greeting } : {}),
      },
    });

    return ApiResponse.success({
      id: updated.id.toString(),
      name: updated.name,
      position: updated.position,
      photoUrl: updated.photoUrl,
      email: updated.email || "",
      greeting: updated.greeting || "",
    });
  } catch (error: any) {
    console.error("Update official error:", error);
    return ApiResponse.error("Gagal memperbarui perangkat desa", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const officialId = BigInt(id);

    const existing = await prisma.villageOfficial.findUnique({
      where: { id: officialId },
      select: { photoUrl: true },
    });

    await prisma.villageOfficial.delete({
      where: { id: officialId },
    });

    if (existing?.photoUrl) {
      await StorageService.deleteFile(existing.photoUrl);
    }

    return ApiResponse.success({ success: true, message: "Perangkat desa berhasil dihapus" });
  } catch (error: any) {
    console.error("Delete official error:", error);
    return ApiResponse.error("Gagal menghapus perangkat desa", 500);
  }
}
