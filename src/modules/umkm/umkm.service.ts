import { UmkmRepository, FindAllUmkmParams } from "./umkm.repository";
import { RegisterUmkmDTO, registerUmkmSchema } from "./umkm.schema";
import { generateCategorySlug, generateUmkmSlug } from "../../shared/utils/slug";
import { ValidationError, NotFoundError } from "../../shared/errors/app-error";
import { prisma } from "../../shared/db/client";
import { IndexingService } from "../indexing/indexing.service";

// UMKM service for management and public discovery

export class UmkmService {
  static async getCategories(includeAll = false) {
    const categories = await UmkmRepository.findAllCategories(includeAll);
    return { items: categories };
  }

  static async createCategory(data: { name: string; description?: string }) {
    if (!data.name || !data.name.trim()) {
      throw new ValidationError("Nama kategori UMKM wajib diisi");
    }
    const cleanName = data.name.trim();
    const existing = await UmkmRepository.findCategoryByName(cleanName);
    if (existing) {
      return {
        id: existing.id.toString(),
        name: existing.name,
        slug: existing.slug,
        description: existing.description,
      };
    }
    const slug = await generateCategorySlug(cleanName);
    const created = await UmkmRepository.createCategory({
      name: cleanName,
      slug,
      description: data.description?.trim() || null,
    });
    return {
      id: created.id.toString(),
      name: created.name,
      slug: created.slug,
      description: created.description,
    };
  }

  static async getUmkmById(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID UMKM tidak valid");
    }
    const u = await prisma.umkm.findUnique({
      where: { id },
      include: {
        category: true,
        galleries: true,
        products: true,
      },
    });

    if (!u) {
      throw new NotFoundError(`UMKM dengan ID '${idStr}' tidak ditemukan`);
    }

    return {
      id: u.id.toString(),
      name: u.name,
      slug: u.slug,
      umkmCategoryId: u.umkmCategoryId.toString(),
      categoryName: u.category?.name || "UMKM",
      categorySlug: u.category?.slug || "umkm",
      description: u.description,
      phone: u.phone,
      email: u.email,
      address: u.address,
      mapsUrl: u.mapsUrl || null,
      ownerName: u.ownerName,
      coverUrl: u.coverUrl || "/images/placeholder-umkm.jpg",
      status: u.status,
      rejectionReason: u.rejectionReason || null,
      since: u.since,
      openDay: u.openDay,
      startTime: u.startTime ? u.startTime.toISOString().substring(11, 16) : null,
      endTime: u.endTime ? u.endTime.toISOString().substring(11, 16) : null,
      latitude: u.latitude ? Number(u.latitude) : null,
      longitude: u.longitude ? Number(u.longitude) : null,
      galleries: u.galleries.map((g) => ({
        id: g.id.toString(),
        imageUrl: g.imageUrl,
        caption: g.caption,
      })),
      products: u.products.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price ? Number(p.price) : 0,
        description: p.description,
        imageUrl: p.imageUrl,
      })),
    };
  }

  static async updateUmkm(idStr: string, input: any) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new ValidationError("Format ID UMKM tidak valid");
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.umkm.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError(`UMKM dengan ID '${idStr}' tidak ditemukan`);
      }

      let umkmCategoryId = existing.umkmCategoryId;
      if (input.newCategoryName && input.newCategoryName.trim()) {
        const catName = input.newCategoryName.trim();
        const existingCat = await UmkmRepository.findCategoryByName(catName, tx);
        if (existingCat) {
          umkmCategoryId = existingCat.id;
        } else {
          const catSlug = await generateCategorySlug(catName, tx);
          const newCat = await UmkmRepository.createCategory(
            { name: catName, slug: catSlug },
            tx
          );
          umkmCategoryId = newCat.id;
        }
      } else if (input.umkmCategoryId && input.umkmCategoryId !== "other") {
        if (!isNaN(Number(input.umkmCategoryId))) {
          const parsedId = BigInt(input.umkmCategoryId);
          const found = await tx.umkmCategory.findUnique({ where: { id: parsedId } });
          if (found) {
            umkmCategoryId = found.id;
          }
        } else {
          const foundBySlugOrName = await tx.umkmCategory.findFirst({
            where: {
              OR: [
                { slug: input.umkmCategoryId },
                { name: { equals: input.umkmCategoryId, mode: "insensitive" } },
              ],
            },
          });
          if (foundBySlugOrName) {
            umkmCategoryId = foundBySlugOrName.id;
          }
        }
      } else if (input.categoryName && typeof input.categoryName === "string" && input.categoryName.trim()) {
        const foundByName = await tx.umkmCategory.findFirst({
          where: {
            OR: [
              { name: { equals: input.categoryName.trim(), mode: "insensitive" } },
              { slug: input.categoryName.trim() },
            ],
          },
        });
        if (foundByName) {
          umkmCategoryId = foundByName.id;
        }
      }

      const updated = await tx.umkm.update({
        where: { id },
        data: {
          umkmCategoryId,
          name: input.name ?? existing.name,
          ownerName: input.ownerName ?? existing.ownerName,
          description: input.description ?? existing.description,
          phone: input.phone ?? existing.phone,
          email: input.email !== undefined ? input.email : existing.email,
          address: input.address ?? existing.address,
          mapsUrl:
            input.mapsUrl !== undefined
              ? (input.mapsUrl?.trim() || null)
              : existing.mapsUrl,
          coverUrl: input.coverUrl ?? existing.coverUrl,
          status: input.status ? input.status.toUpperCase() : existing.status,
          rejectionReason:
            input.status === "APPROVED" || input.status === "DRAFT" || input.status === "PENDING"
              ? null
              : input.rejectionReason !== undefined
              ? input.rejectionReason
              : existing.rejectionReason,
          since: input.since !== undefined ? input.since : existing.since,
          openDay: input.openDay !== undefined ? input.openDay : existing.openDay,
          startTime: input.startTime ? new Date(`1970-01-01T${input.startTime}:00Z`) : existing.startTime,
          endTime: input.endTime ? new Date(`1970-01-01T${input.endTime}:00Z`) : existing.endTime,
          latitude: input.latitude !== undefined ? Number(input.latitude) : existing.latitude,
          longitude: input.longitude !== undefined ? Number(input.longitude) : existing.longitude,
          publishedAt:
            input.status === "APPROVED"
              ? existing.publishedAt || new Date()
              : existing.publishedAt,
        },
      });

      if (input.galleries) {
        await tx.umkmGallery.deleteMany({ where: { umkmId: id } });
        if (input.galleries.length > 0) {
          await tx.umkmGallery.createMany({
            data: input.galleries.map((g: any) => ({
              umkmId: id,
              imageUrl: typeof g === "string" ? g : g.imageUrl,
              caption: typeof g === "string" ? null : g.caption || null,
            })),
          });
        }
      }

      if (input.products) {
        await tx.product.deleteMany({ where: { umkmId: id } });
        if (input.products.length > 0) {
          await tx.product.createMany({
            data: input.products.map((prod: any) => ({
              umkmId: id,
              name: prod.name,
              description: prod.description,
              price: prod.price !== undefined && prod.price !== null ? prod.price : null,
              imageUrl: prod.imageUrl || null,
            })),
          });
        }
      }

      return updated;
    });

    if (result?.status === "APPROVED" && result?.slug) {
      IndexingService.notifyUmkmUpdated(result.slug);
    }

    return result;
  }

  static async getAllUmkm(params: FindAllUmkmParams) {
    return UmkmRepository.findAllPaginated(params);
  }

  static async getUmkmBySlug(slug: string, requireApproved = true) {
    const umkm = await UmkmRepository.findBySlug(slug);
    if (!umkm) {
      throw new NotFoundError(`UMKM dengan slug '${slug}' tidak ditemukan`);
    }
    if (requireApproved && !["APPROVED", "approved", "Approved"].includes(umkm.status)) {
      throw new NotFoundError(`UMKM '${slug}' tidak ditemukan atau belum dipublikasikan`);
    }
    return umkm;
  }

  static async deleteUmkm(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID UMKM tidak valid");
    }

    const existing = await prisma.umkm
      .findUnique({ where: { id }, select: { slug: true } })
      .catch(() => null);
    const deleted = await UmkmRepository.deleteUmkm(id);

    if (existing?.slug) {
      IndexingService.notifyUmkmDeleted(existing.slug);
    }

    return deleted;
  }

  static async registerUmkm(data: any) {
    if (!data.name || !data.ownerName || !data.description || !data.phone || !data.address) {
      throw new ValidationError("Harap lengkapi semua data wajib");
    }

    const result = await prisma.$transaction(async (tx) => {
      let finalCategoryId: bigint;

      if (data.newCategoryName && data.newCategoryName.trim()) {
        const catName = data.newCategoryName.trim();
        const existingCat = await UmkmRepository.findCategoryByName(catName, tx);
        if (existingCat) {
          finalCategoryId = existingCat.id;
        } else {
          const catSlug = await generateCategorySlug(catName, tx);
          const newCat = await UmkmRepository.createCategory(
            { name: catName, slug: catSlug },
            tx
          );
          finalCategoryId = newCat.id;
        }
      } else if (data.umkmCategoryId && data.umkmCategoryId !== "other") {
        try {
          const parsedId = BigInt(data.umkmCategoryId);
          const found = await tx.umkmCategory.findUnique({ where: { id: parsedId } });
          if (found) {
            finalCategoryId = found.id;
          } else {
            const defaultCat = await tx.umkmCategory.findFirst();
            if (!defaultCat) throw new NotFoundError("Kategori tidak valid");
            finalCategoryId = defaultCat.id;
          }
        } catch {
          const foundBySlug = await tx.umkmCategory.findFirst({
            where: {
              OR: [
                { slug: data.umkmCategoryId },
                { name: { equals: data.umkmCategoryId, mode: "insensitive" } },
              ],
            },
          });
          if (foundBySlug) {
            finalCategoryId = foundBySlug.id;
          } else {
            const defaultCat = await tx.umkmCategory.findFirst();
            if (!defaultCat) throw new NotFoundError("Kategori tidak valid");
            finalCategoryId = defaultCat.id;
          }
        }
      } else if (data.categoryName && typeof data.categoryName === "string" && data.categoryName.trim()) {
        const foundByName = await tx.umkmCategory.findFirst({
          where: {
            OR: [
              { name: { equals: data.categoryName.trim(), mode: "insensitive" } },
              { slug: data.categoryName.trim() },
            ],
          },
        });
        if (foundByName) {
          finalCategoryId = foundByName.id;
        } else {
          const defaultCat = await tx.umkmCategory.findFirst();
          if (!defaultCat) throw new NotFoundError("Kategori tidak valid");
          finalCategoryId = defaultCat.id;
        }
      } else {
        const defaultCat = await tx.umkmCategory.findFirst();
        if (!defaultCat) throw new NotFoundError("Kategori tidak valid");
        finalCategoryId = defaultCat.id;
      }

      const slug = await generateUmkmSlug(data.name, tx);

      const umkm = await tx.umkm.create({
        data: {
          name: data.name,
          ownerName: data.ownerName,
          umkmCategoryId: finalCategoryId,
          description: data.description,
          phone: data.phone,
          email: data.email || null,
          coverUrl: data.coverUrl || "/images/placeholder-umkm.jpg",
          address: data.address,
          latitude: data.latitude !== undefined && data.latitude !== null ? Number(data.latitude) : -8.2811,
          longitude: data.longitude !== undefined && data.longitude !== null ? Number(data.longitude) : 112.5664,
          mapsUrl: data.mapsUrl?.trim() || null,
          since: data.since,
          openDay: data.openDay || null,
          startTime: data.startTime ? new Date(`1970-01-01T${data.startTime}:00Z`) : null,
          endTime: data.endTime ? new Date(`1970-01-01T${data.endTime}:00Z`) : null,
          status: "PENDING",
          slug,
        },
      });

      if (data.galleries && data.galleries.length > 0) {
        await tx.umkmGallery.createMany({
          data: data.galleries.map((url: string) => ({
            umkmId: umkm.id,
            imageUrl: url,
          })),
        });
      }

      if (data.products && data.products.length > 0) {
        await tx.product.createMany({
          data: data.products.map((prod: any) => ({
            umkmId: umkm.id,
            name: prod.name,
            description: prod.description,
            price: prod.price !== undefined && prod.price !== null ? prod.price : null,
            imageUrl: prod.imageUrl || null,
          })),
        });
      }

      return umkm;
    });

    return result;
  }
}
