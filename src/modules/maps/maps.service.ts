import { MapsRepository } from "./maps.repository";
import { UmkmRepository } from "../umkm/umkm.repository";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";
import { prisma } from "../../shared/db/client";
import { generateCategorySlug, generateUmkmSlug } from "../../shared/utils/slug";

// Maps service powered by Umkm geographic coordinates

export class MapsService {
  static async getCategories() {
    return MapsRepository.findCategories();
  }

  static async getLocations(categorySlug?: string, searchQuery?: string) {
    return MapsRepository.findLocations(categorySlug, searchQuery);
  }

  static async getLocationById(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID lokasi tidak valid");
    }

    const location = await MapsRepository.findLocationById(id);
    if (!location) {
      throw new NotFoundError(`Lokasi dengan ID ${idStr} tidak ditemukan`);
    }

    return location;
  }

  static async resolveLocation(query: string) {
    const location = await MapsRepository.resolveLocation(query);
    if (!location) {
      throw new NotFoundError(`Lokasi untuk pencarian '${query}' tidak ditemukan`);
    }
    return location;
  }

  static async createCategory(data: { name: string; slug?: string; description?: string }) {
    if (!data.name) {
      throw new ValidationError("Nama kategori wajib diisi");
    }
    const slug = data.slug || (await generateCategorySlug(data.name));
    return prisma.umkmCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
      },
    });
  }

  static async updateCategory(idStr: string, data: { name?: string; slug?: string; description?: string }) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID kategori tidak valid");
    }
    return prisma.umkmCategory.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID kategori tidak valid");
    }
    return prisma.umkmCategory.delete({
      where: { id },
    });
  }

  static async createLocation(data: any) {
    if (!data.name || data.latitude === undefined || data.longitude === undefined) {
      throw new ValidationError("Nama, latitude, dan longitude wajib diisi");
    }

    let categoryId = data.categoryId || data.mapCategoryId || data.umkmCategoryId;
    let finalCategoryId: bigint;

    if (!categoryId) {
      const defaultCat = await prisma.umkmCategory.findFirst();
      if (!defaultCat) {
        const createdCat = await prisma.umkmCategory.create({
          data: { name: "UMKM", slug: "umkm" },
        });
        finalCategoryId = createdCat.id;
      } else {
        finalCategoryId = defaultCat.id;
      }
    } else {
      finalCategoryId = BigInt(categoryId);
    }

    const slug = await generateUmkmSlug(data.name);

    return prisma.umkm.create({
      data: {
        name: data.name,
        slug,
        ownerName: data.ownerName || data.name,
        description: data.description || data.shortDescription || "",
        phone: data.phone || "081234567890",
        address: data.address || "Desa Pringgodani",
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        mapsUrl: data.googleMapsUrl || data.mapsUrl || null,
        coverUrl: data.imageUrl || data.coverUrl || "/images/placeholder-umkm.jpg",
        status: "APPROVED",
        umkmCategoryId: finalCategoryId,
      },
    });
  }

  static async updateLocation(idStr: string, data: any) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID lokasi tidak valid");
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description || data.shortDescription) updateData.description = data.description || data.shortDescription;
    if (data.address) updateData.address = data.address;
    if (data.latitude !== undefined) updateData.latitude = Number(data.latitude);
    if (data.longitude !== undefined) updateData.longitude = Number(data.longitude);
    if (data.mapsUrl || data.googleMapsUrl) updateData.mapsUrl = data.mapsUrl || data.googleMapsUrl;
    if (data.coverUrl || data.imageUrl) updateData.coverUrl = data.coverUrl || data.imageUrl;

    return prisma.umkm.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteLocation(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID lokasi tidak valid");
    }

    return UmkmRepository.deleteUmkm(id);
  }
}
