import { prisma } from "../../../../../shared/db/client";
import { ApiResponse } from "../../../../../shared/utils/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type")?.toUpperCase() || "NEWS";
    const limitStr = searchParams.get("limit") || "5";
    const limit = Math.min(Math.max(parseInt(limitStr, 10) || 5, 1), 10);

    if (type === "UMKM") {
      const items = await prisma.umkm.findMany({
        where: { status: "PENDING" },
        select: {
          id: true,
          name: true,
          status: true,
        },
        orderBy: { id: "desc" },
        take: limit,
      });

      const formatted = items.map((u) => ({
        id: u.id.toString(),
        title: u.name,
        type: "UMKM" as const,
        status: u.status,
        createdAt: "Dalam Peninjauan",
      }));

      return ApiResponse.success({ items: formatted });
    }

    // Default to NEWS
    const items = await prisma.news.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        title: true,
        status: true,
        publishedAt: true,
      },
      orderBy: { id: "desc" },
      take: limit,
    });

    const formatted = items.map((n) => ({
      id: n.id.toString(),
      title: n.title,
      type: "NEWS" as const,
      status: n.status,
      createdAt: n.publishedAt
        ? `Diajukan ${new Date(n.publishedAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })}`
        : "Dalam Peninjauan",
    }));

    return ApiResponse.success({ items: formatted });
  } catch (error: any) {
    console.error("Get pending submissions error:", error);
    return ApiResponse.error("Gagal mengambil daftar pengajuan pending", 500);
  }
}
