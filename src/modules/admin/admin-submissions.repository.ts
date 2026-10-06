import { prisma } from "../../shared/db/client";

export class AdminSubmissionsRepository {
  static async getPendingSubmissions() {
    const [pendingNews, pendingUmkm] = await Promise.all([
      prisma.news.findMany({
        where: { status: "PENDING" },
        include: {
          category: true,
          type: true,
          articleDetail: {
            include: {
              blocks: { orderBy: { sortOrder: "asc" } },
            },
          },
          galleryDetail: {
            include: {
              images: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.umkm.findMany({
        where: { status: "PENDING" },
        include: {
          category: true,
          products: true,
          galleries: true,
        },
        orderBy: { id: "desc" },
      }),
    ]);

    const newsSubmissions = pendingNews.map((n) => {
      const cover =
        n.coverUrl ||
        n.articleDetail?.blocks?.find((b) => b.imageUrl)?.imageUrl ||
        n.galleryDetail?.images?.[0]?.imageUrl ||
        "/images/placeholder-news.jpg";

      const contentBlocks =
        n.articleDetail?.blocks?.map((b) => ({
          subHeading: b.subHeading || undefined,
          content: b.content,
          imageUrl: b.imageUrl || undefined,
        })) || [];

      return {
        id: n.id.toString(),
        type: "NEWS" as const,
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt,
        summary: n.excerpt,
        categoryName: n.category?.name || "Kabar UMKM",
        coverUrl: cover,
        coverImage: cover,
        contentBlocks,
        submittedAt: n.publishedAt
          ? n.publishedAt.toISOString()
          : new Date().toISOString(),
        status: n.status,
      };
    });

    const umkmSubmissions = pendingUmkm.map((u) => ({
      id: u.id.toString(),
      type: "UMKM" as const,
      name: u.name,
      slug: u.slug,
      ownerName: u.ownerName,
      categoryName: u.category?.name || "UMKM",
      description: u.description,
      phone: u.phone,
      email: u.email || undefined,
      address: u.address,
      latitude: u.latitude !== null ? Number(u.latitude) : -8.2811,
      longitude: u.longitude !== null ? Number(u.longitude) : 112.5664,
      mapsUrl: u.mapsUrl || undefined,
      since: u.since || undefined,
      openDay: u.openDay || undefined,
      startTime: u.startTime
        ? u.startTime.toISOString().substring(11, 16)
        : undefined,
      endTime: u.endTime
        ? u.endTime.toISOString().substring(11, 16)
        : undefined,
      coverUrl: u.coverUrl || "/images/placeholder-umkm.jpg",
      galleries: u.galleries?.map((g) => g.imageUrl) || [],
      products: u.products?.map((p) => ({
        name: p.name,
        price: p.price ? Number(p.price) : 0,
        description: p.description,
        imageUrl: p.imageUrl || undefined,
      })),
      submittedAt: new Date().toISOString(),
      status: u.status,
    }));

    return {
      news: newsSubmissions,
      umkm: umkmSubmissions,
      totalPending: newsSubmissions.length + umkmSubmissions.length,
    };
  }

  static async updateNewsStatus(
    id: string,
    status: "PUBLISHED" | "REJECTED" | "DRAFT" | "PENDING",
    rejectionReason?: string
  ) {
    const newsId = BigInt(id);
    const reason = status === "REJECTED" ? rejectionReason || null : null;

    return prisma.news.update({
      where: { id: newsId },
      data: {
        status,
        rejectionReason: reason,
        publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      },
    });
  }

  static async updateUmkmStatus(
    id: string,
    status: "APPROVED" | "REJECTED" | "PENDING" | "DRAFT",
    rejectionReason?: string
  ) {
    const umkmId = BigInt(id);
    const reason = status === "REJECTED" ? rejectionReason || null : null;

    return prisma.umkm.update({
      where: { id: umkmId },
      data: {
        status,
        rejectionReason: reason,
        publishedAt: status === "APPROVED" ? new Date() : undefined,
      },
    });
  }
}
