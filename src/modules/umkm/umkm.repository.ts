import { prisma } from "../../shared/db/client";
import { formatWhatsAppNumber, createWhatsAppLink } from "../../shared/utils/whatsapp";
import { StorageService } from "../storage/storage.service";

export interface FindAllUmkmParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  exclude?: string;
  status?: string;
  potentialSlug?: string;
  sort?: string;
}

export class UmkmRepository {
  static async findAllCategories(includeAll = false) {
    const where: any = {};

    if (!includeAll) {
      where.umkms = {
        some: {
          status: { in: ["APPROVED", "approved", "Approved"] },
        },
      };
    }

    const categories = await prisma.umkmCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            umkms: {
              where: {
                status: { in: ["APPROVED", "approved", "Approved"] },
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories.map((c) => ({
      id: c.id.toString(),
      value: c.name.toUpperCase().replace(/[^A-Z0-9]/g, "_"),
      slug: c.slug,
      label: c.name,
      name: c.name,
      description: c.description,
      umkmCount: c._count.umkms,
    }));
  }

  static async findAllPaginated({
    page = 1,
    limit = 8,
    category,
    search,
    exclude,
    status = "APPROVED",
    potentialSlug,
    sort,
  }: FindAllUmkmParams = {}) {
    const where: any = { AND: [] };

    if (status && status !== "ALL") {
      where.AND.push({
        status: { in: [status, status.toUpperCase(), status.toLowerCase()] },
      });
    }

    if (category) {
      if (!isNaN(Number(category))) {
        where.AND.push({ umkmCategoryId: BigInt(category) });
      } else {
        where.AND.push({
          category: {
            slug: category,
          },
        });
      }
    }

    if (potentialSlug) {
      where.AND.push({
        potential: {
          slug: potentialSlug,
        },
      });
    }

    if (search && search.trim()) {
      const query = search.trim();
      where.AND.push({
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { ownerName: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
        ],
      });
    }

    if (exclude) {
      if (!isNaN(Number(exclude))) {
        where.AND.push({ id: { not: BigInt(exclude) } });
      } else {
        where.AND.push({ slug: { not: exclude } });
      }
    }

    let orderBy: any = { id: "desc" };
    if (sort === "publishedAt_desc" || sort === "newest") {
      orderBy = [{ publishedAt: "desc" }, { id: "desc" }];
    } else if (sort === "name_asc") {
      orderBy = { name: "asc" };
    } else if (sort === "name_desc") {
      orderBy = { name: "desc" };
    }

    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 8)));
    const skip = (safePage - 1) * safeLimit;

    const [rawItems, total] = await Promise.all([
      prisma.umkm.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy,
        skip,
        take: safeLimit,
      }),
      prisma.umkm.count({ where }),
    ]);

    const items = rawItems.map((u) => {
      const waFormatted = formatWhatsAppNumber(u.phone);
      const waTemplate = `Halo ${u.name}, saya melihat profil usaha Anda di Lokal Pringgodani dan ingin bertanya seputar produk/layanan Anda.`;
      const waLink = createWhatsAppLink(u.phone, waTemplate);

      return {
        id: u.id.toString(),
        name: u.name,
        slug: u.slug,
        category: u.category?.name || "UMKM",
        categorySlug: u.category?.slug || "umkm",
        categoryName: u.category?.name || "UMKM",
        description: u.description,
        coverUrl: u.coverUrl || "/images/placeholder-umkm.jpg",
        logo: u.coverUrl || "/images/placeholder-umkm.jpg",
        phone: u.phone,
        whatsappNumber: u.phone,
        whatsappFormatted: waFormatted,
        whatsappLink: waLink,
        email: u.email || null,
        address: u.address,
        mapsUrl: u.mapsUrl || null,
        latitude: u.latitude ? Number(u.latitude) : null,
        longitude: u.longitude ? Number(u.longitude) : null,
        ownerName: u.ownerName,
        since: u.since,
        openDay: u.openDay || null,
        startTime: u.startTime ? u.startTime.toISOString().substring(11, 16) : null,
        endTime: u.endTime ? u.endTime.toISOString().substring(11, 16) : null,
        status: u.status,
        rejectionReason: u.rejectionReason || null,
        totalProducts: u._count.products,
        publishedAt: u.publishedAt?.toISOString() || null,
        potential: null,
      };
    });

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  static async findBySlug(slug: string) {
    const u = await prisma.umkm.findUnique({
      where: { slug },
      include: {
        category: true,
        galleries: true,
        products: true,
        newsUmkms: {
          include: {
            news: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!u) return null;

    const waFormatted = formatWhatsAppNumber(u.phone);
    const waTemplate = `Halo ${u.name}, saya melihat profil usaha Anda di Lokal Pringgodani dan ingin bertanya seputar produk/layanan Anda.`;
    const waLink = createWhatsAppLink(u.phone, waTemplate);

    const relatedNews = u.newsUmkms
      .filter((nu) => nu.news.status === "PUBLISHED")
      .map((nu) => ({
        id: nu.news.id.toString(),
        title: nu.news.title,
        slug: nu.news.slug,
        excerpt: nu.news.excerpt,
        coverUrl: nu.news.coverUrl,
        category: nu.news.category.name,
        publishedAt: nu.news.publishedAt?.toISOString() || null,
      }));

    return {
      id: u.id.toString(),
      name: u.name,
      slug: u.slug,
      category: u.category?.name || "UMKM",
      categorySlug: u.category?.slug || "umkm",
      description: u.description,
      coverUrl: u.coverUrl || "/images/placeholder-umkm.jpg",
      logo: u.coverUrl || "/images/placeholder-umkm.jpg",
      phone: u.phone,
      whatsappNumber: u.phone,
      whatsappFormatted: waFormatted,
      whatsappLink: waLink,
      email: u.email || null,
      address: u.address,
      mapsUrl: u.mapsUrl || null,
      ownerName: u.ownerName,
      since: u.since,
      openDay: u.openDay || null,
      startTime: u.startTime ? u.startTime.toISOString().substring(11, 16) : null,
      endTime: u.endTime ? u.endTime.toISOString().substring(11, 16) : null,
      status: u.status,
      publishedAt: u.publishedAt?.toISOString() || null,
      latitude: u.latitude ? Number(u.latitude) : null,
      longitude: u.longitude ? Number(u.longitude) : null,
      gallery: u.galleries.map((g) => g.imageUrl),
      galleries: u.galleries.map((g) => ({
        id: g.id.toString(),
        imageUrl: g.imageUrl,
        caption: g.caption || null,
      })),
      products: u.products.map((p) => {
        const prodWa = `Halo ${u.name}, saya melihat produk "${p.name}" di Lokal Pringgodani dan ingin memesannya.`;
        return {
          id: p.id.toString(),
          name: p.name,
          productName: p.name,
          description: p.description,
          price: p.price ? Number(p.price) : null,
          imageUrl: p.imageUrl || "/images/placeholder-product.jpg",
          productPhoto: p.imageUrl || "/images/placeholder-product.jpg",
          whatsappLink: createWhatsAppLink(u.phone, prodWa),
        };
      }),
      potential: null,
      relatedNews,
    };
  }

  static async deleteUmkm(id: bigint) {
    // 1. Fetch images to delete from Supabase Storage
    const existing = await prisma.umkm.findUnique({
      where: { id },
      include: {
        products: { select: { imageUrl: true } },
        galleries: { select: { imageUrl: true } },
      },
    });

    const imageUrls: (string | null | undefined)[] = [];
    if (existing) {
      if (existing.coverUrl) imageUrls.push(existing.coverUrl);
      existing.products.forEach((p) => {
        if (p.imageUrl) imageUrls.push(p.imageUrl);
      });
      existing.galleries.forEach((g) => {
        if (g.imageUrl) imageUrls.push(g.imageUrl);
      });
    }

    // 2. Delete database records
    const deleted = await prisma.$transaction(async (tx) => {
      await tx.newsUmkm.deleteMany({ where: { umkmId: id } });
      await tx.product.deleteMany({ where: { umkmId: id } });
      await tx.umkmGallery.deleteMany({ where: { umkmId: id } });
      return tx.umkm.delete({ where: { id } });
    });

    // 3. Delete files from Supabase Storage safely
    if (imageUrls.length > 0) {
      await StorageService.deleteFiles(imageUrls);
    }

    return deleted;
  }

  static async findCategoryByName(name: string, tx?: any) {
    const client = tx || prisma;
    return client.umkmCategory.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }

  static async createCategory(
    data: { name: string; slug?: string; description?: string | null },
    tx?: any
  ) {
    const client = tx || prisma;
    const slug =
      data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return client.umkmCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
      },
    });
  }

  static async executeTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}
