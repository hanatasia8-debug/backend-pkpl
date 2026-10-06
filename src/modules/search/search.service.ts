import { prisma } from "../../shared/db/client";

export class SearchService {
  static async globalSearch(queryString?: string) {
    if (!queryString || !queryString.trim()) {
      return {
        query: "",
        totalMatches: 0,
        umkms: [],
        products: [],
        potentials: [],
        news: [],
      };
    }

    const query = queryString.trim();

    const [umkmsRaw, productsRaw, newsRaw] = await Promise.all([
      prisma.umkm.findMany({
        where: {
          status: "APPROVED",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          category: true,
          _count: {
            select: { products: true },
          },
        },
        take: 6,
        orderBy: { id: "desc" },
      }),

      prisma.product.findMany({
        where: {
          umkm: {
            status: "APPROVED",
          },
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          umkm: {
            select: {
              id: true,
              name: true,
              slug: true,
              phone: true,
              address: true,
            },
          },
        },
        take: 6,
        orderBy: { id: "desc" },
      }),

      prisma.news.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          category: true,
          type: true,
        },
        take: 6,
        orderBy: { publishedAt: "desc" },
      }),
    ]);

    const umkms = umkmsRaw.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      slug: u.slug,
      category: u.category?.name || "UMKM",
      description: u.description,
      address: u.address,
      phone: u.phone,
      coverUrl: u.coverUrl || "/images/placeholder-umkm.jpg",
      totalProducts: u._count.products,
    }));

    const products = productsRaw.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      description: p.description,
      price: p.price ? Number(p.price) : null,
      imageUrl: p.imageUrl || "/images/placeholder-product.jpg",
      umkm: {
        id: p.umkm.id.toString(),
        name: p.umkm.name,
        slug: p.umkm.slug,
      },
    }));

    const news = newsRaw.map((n) => ({
      id: n.id.toString(),
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt,
      coverUrl: n.coverUrl || "/images/placeholder-news.jpg",
      category: n.category?.name || "Berita",
      type: n.type?.name || "Artikel",
      publishedAt: n.publishedAt?.toISOString() || null,
    }));

    const totalMatches = umkms.length + products.length + news.length;

    return {
      query,
      totalMatches,
      umkms,
      products,
      potentials: [],
      news,
    };
  }
}
