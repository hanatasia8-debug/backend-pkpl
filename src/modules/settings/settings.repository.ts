import { prisma } from "../../shared/db/client";

export class SettingsRepository {
  static async getSetting() {
    return prisma.websiteSetting.findFirst();
  }

  static async updateSetting(data: {
    websiteName?: string;
    logoUrl?: string;
    faviconUrl?: string;
    email?: string;
    phone?: string;
    address?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  }) {
    const existing = await prisma.websiteSetting.findFirst();
    if (existing) {
      return prisma.websiteSetting.update({
        where: { id: existing.id },
        data,
      });
    }
    return prisma.websiteSetting.create({
      data: {
        websiteName: data.websiteName || "Desa Pringgodani",
        logoUrl: data.logoUrl || "/logo.png",
        faviconUrl: data.faviconUrl || "/favicon.ico",
        email: data.email || "info@pringgodani.desa.id",
        phone: data.phone || "081234567890",
        address: data.address || "Jl. Raya Desa Pringgodani No. 1",
        facebook: data.facebook || null,
        instagram: data.instagram || null,
        youtube: data.youtube || null,
        tiktok: data.tiktok || null,
      },
    });
  }
}
