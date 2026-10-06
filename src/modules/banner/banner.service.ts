import { prisma } from "../../shared/db/client";

export interface BannerDto {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
}

export class BannerService {
  static async getActiveBanners() {
    const newsItems = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      include: {
        articleDetail: {
          include: { blocks: true },
        },
        galleryDetail: {
          include: { images: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
    });

    const items: BannerDto[] = [];

    newsItems.forEach((n, idx) => {
      const cover =
        n.coverUrl ||
        n.articleDetail?.blocks?.find((b) => b.imageUrl)?.imageUrl ||
        n.galleryDetail?.images?.[0]?.imageUrl ||
        "/images/placeholder-news.jpg";

      items.push({
        id: `banner-news-${n.id}`,
        title: n.title,
        imageUrl: cover,
        linkUrl: `/berita/${n.slug}`,
        order: idx,
      });
    });

    return { items };
  }
}
