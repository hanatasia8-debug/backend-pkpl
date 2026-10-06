import { prisma } from "../../../../../shared/db/client";
import { ApiResponse } from "../../../../../shared/utils/response";
import { checkRateLimit } from "../../../../../shared/utils/rate-limiter";

export async function GET(request: Request) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-client";
    const limitCheck = checkRateLimit(`status:${clientIp}`, 30, 60 * 1000); // 30 requests per minute

    if (!limitCheck.allowed) {
      return ApiResponse.error(
        `Terlalu banyak permintaan. Silakan tunggu ${limitCheck.retryAfterSeconds} detik.`,
        429
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type")?.toUpperCase();
    const id = searchParams.get("id");

    if (!type || !id) {
      return ApiResponse.error("Parameter type dan id wajib diisi", 400);
    }

    if (type === "UMKM") {
      let umkmId: bigint;
      try {
        umkmId = BigInt(id);
      } catch {
        return ApiResponse.error("ID UMKM tidak valid", 400);
      }

      const umkm: any = await prisma.umkm.findUnique({
        where: { id: umkmId },
        select: {
          id: true,
          name: true,
          status: true,
          rejectionReason: true,
        } as any,
      });

      if (!umkm) {
        return ApiResponse.error("Pengajuan UMKM tidak ditemukan", 404);
      }

      return ApiResponse.success({
        id: umkm.id.toString(),
        title: umkm.name,
        type: "UMKM",
        status: umkm.status,
        rejectionReason: umkm.rejectionReason || null,
      });
    }

    if (type === "NEWS") {
      let newsId: bigint;
      try {
        newsId = BigInt(id);
      } catch {
        return ApiResponse.error("ID Berita tidak valid", 400);
      }

      const news: any = await prisma.news.findUnique({
        where: { id: newsId },
        select: {
          id: true,
          title: true,
          status: true,
          rejectionReason: true,
        } as any,
      });

      if (!news) {
        return ApiResponse.error("Pengajuan Berita tidak ditemukan", 404);
      }

      return ApiResponse.success({
        id: news.id.toString(),
        title: news.title,
        type: "NEWS",
        status: news.status,
        rejectionReason: news.rejectionReason || null,
      });
    }

    return ApiResponse.error("Type pengajuan tidak valid (Gunakan UMKM atau NEWS)", 400);
  } catch (error: any) {
    console.error("Check submission status error:", error);
    return ApiResponse.error("Gagal mengecek status pengajuan", 500);
  }
}
