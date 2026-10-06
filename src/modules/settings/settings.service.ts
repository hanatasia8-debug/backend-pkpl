import { SettingsRepository } from "./settings.repository";

export class SettingsService {
  static async getSettings() {
    const raw = await SettingsRepository.getSetting();

    const resolvedLogoUrl =
      !raw?.logoUrl || raw.logoUrl === "/images/logo-desa.png"
        ? "/images/logo.png"
        : raw.logoUrl;

    const settings: Record<string, unknown> = {
      website_name: raw?.websiteName || "Lokal Pringgodani",
      logo_url: resolvedLogoUrl,
      favicon_url: raw?.faviconUrl || "/favicon.ico",
      contact_email: raw?.email || "info@pringgodani.desa.id",
      contact_phone: raw?.phone || "081234567890",
      address: raw?.address || "Jl. Raya Desa Pringgodani No. 1",
      social_facebook: raw?.facebook || null,
      social_instagram: raw?.instagram || null,
      social_youtube: raw?.youtube || null,
      social_tiktok: raw?.tiktok || null,
      jumlah_dusun: 4,
    };

    return { settings };
  }

  static async updateSettings(input: {
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
    const updated = await SettingsRepository.updateSetting(input);
    return this.getSettings();
  }
}
