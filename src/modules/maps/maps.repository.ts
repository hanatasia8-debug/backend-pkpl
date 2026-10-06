import { prisma } from "../../shared/db/client";
import { formatWhatsAppNumber, createWhatsAppLink } from "../../shared/utils/whatsapp";

export class MapsRepository {
  static async findCategories() {
    const categories = await prisma.umkmCategory.findMany({
      where: {
        umkms: {
          some: {
            status: "APPROVED",
            latitude: { not: null },
            longitude: { not: null },
          },
        },
      },
      include: {
        _count: {
          select: {
            umkms: {
              where: {
                status: "APPROVED",
                latitude: { not: null },
                longitude: { not: null },
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
      name: c.name,
      slug: c.slug,
      count: c._count.umkms,
      icon: "store",
      color: "#16a34a",
    }));
  }

  static async findLocations(categorySlug?: string, searchQuery?: string) {
    const where: any = {
      AND: [
        {
          status: { in: ["APPROVED", "approved", "Approved"] },
          latitude: { not: null },
          longitude: { not: null },
        },
      ],
    };

    if (categorySlug && categorySlug !== "all") {
      where.AND.push({ category: { slug: categorySlug } });
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim();
      where.AND.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    const locations = await prisma.umkm.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return locations.map((loc) => {
      const waFormatted = formatWhatsAppNumber(loc.phone);
      const waTemplate = `Halo ${loc.name}, saya melihat lokasi toko Anda di Peta LokalUMKM Pringgodani dan ingin bertanya.`;
      const waLink = createWhatsAppLink(loc.phone, waTemplate);

      return {
        id: loc.id.toString(),
        name: loc.name,
        slug: loc.slug,
        categoryId: loc.umkmCategoryId.toString(),
        categoryName: loc.category?.name || "UMKM",
        categorySlug: loc.category?.slug || "umkm",
        shortDescription: loc.description,
        description: loc.description,
        address: loc.address,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        googleMapsUrl: loc.mapsUrl || null,
        mapsUrl: loc.mapsUrl || null,
        imageUrl: loc.coverUrl || "/images/placeholder-umkm.jpg",
        coverUrl: loc.coverUrl || "/images/placeholder-umkm.jpg",
        phone: loc.phone,
        whatsappFormatted: waFormatted,
        whatsappLink: waLink,
        totalProducts: loc._count.products,
        category: loc.category
          ? {
              id: loc.category.id.toString(),
              name: loc.category.name,
              slug: loc.category.slug,
              icon: "store",
              color: "#16a34a",
            }
          : undefined,
      };
    });
  }

  static async findLocationById(id: bigint) {
    const loc = await prisma.umkm.findUnique({
      where: { id },
      include: {
        category: true,
        products: true,
        galleries: true,
      },
    });

    if (!loc) return null;

    return {
      id: loc.id.toString(),
      name: loc.name,
      slug: loc.slug,
      categoryName: loc.category?.name || "UMKM",
      categorySlug: loc.category?.slug || "umkm",
      description: loc.description,
      address: loc.address,
      latitude: loc.latitude ? Number(loc.latitude) : null,
      longitude: loc.longitude ? Number(loc.longitude) : null,
      mapsUrl: loc.mapsUrl,
      coverUrl: loc.coverUrl || "/images/placeholder-umkm.jpg",
      phone: loc.phone,
      products: loc.products.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price ? Number(p.price) : null,
        imageUrl: p.imageUrl,
      })),
      galleries: loc.galleries.map((g) => g.imageUrl),
    };
  }

  static async resolveLocation(query: string) {
    const loc = await prisma.umkm.findFirst({
      where: {
        status: "APPROVED",
        latitude: { not: null },
        longitude: { not: null },
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
      },
    });

    if (!loc) return null;

    return {
      id: loc.id.toString(),
      name: loc.name,
      slug: loc.slug,
      categoryName: loc.category?.name || "UMKM",
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      address: loc.address,
      mapsUrl: loc.mapsUrl,
      coverUrl: loc.coverUrl || "/images/placeholder-umkm.jpg",
    };
  }
}
