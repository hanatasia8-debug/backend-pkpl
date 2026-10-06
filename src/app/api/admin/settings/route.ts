import { SettingsRepository } from "../../../../modules/settings/settings.repository";
import { ApiResponse } from "../../../../shared/utils/response";
import { requireAdmin } from "../../../../shared/auth/require-admin";
import { StorageService } from "../../../../modules/storage/storage.service";
import { IndexingService } from "../../../../modules/indexing/indexing.service";

export async function GET() {
  try {
    const raw = await SettingsRepository.getSetting();
    const data = {
      website_name: raw?.websiteName || "Lokal Pringgodani",
      logo_url: raw?.logoUrl || "/images/logo.png",
      favicon_url: raw?.faviconUrl || "/favicon.ico",
      contact_email: raw?.email || "info@pringgodani.desa.id",
      contact_phone: raw?.phone || "081234567890",
      address: raw?.address || "Jl. Raya Desa Pringgodani No. 1, Bantur, Malang",
      social_facebook: raw?.facebook || "",
      social_instagram: raw?.instagram || "",
      social_youtube: raw?.youtube || "",
      social_tiktok: raw?.tiktok || "",
      jumlah_dusun: 4,
    };
    return ApiResponse.success(data);
  } catch (error: any) {
    console.error("Get admin settings error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil pengaturan website", 500);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const websiteName = body.website_name;
    const logoUrl = body.logo_url;
    const faviconUrl = body.favicon_url;
    const email = body.contact_email;
    const phone = body.contact_phone;
    const address = body.address;
    const facebook = body.social_facebook;
    const instagram = body.social_instagram;
    const youtube = body.social_youtube;
    const tiktok = body.social_tiktok;

    const existing = await SettingsRepository.getSetting();

    // If logo was changed/removed and previous was a Supabase Storage file, clean it up
    if (existing?.logoUrl && logoUrl !== undefined && existing.logoUrl !== logoUrl) {
      await StorageService.deleteFile(existing.logoUrl);
    }

    // If favicon was changed/removed and previous was a Supabase Storage file, clean it up
    if (existing?.faviconUrl && faviconUrl !== undefined && existing.faviconUrl !== faviconUrl) {
      await StorageService.deleteFile(existing.faviconUrl);
    }

    await SettingsRepository.updateSetting({
      websiteName,
      logoUrl,
      faviconUrl,
      email,
      phone,
      address,
      facebook,
      instagram,
      youtube,
      tiktok,
    });

    const updated = await SettingsRepository.getSetting();
    const data = {
      website_name: updated?.websiteName || "Lokal Pringgodani",
      logo_url: updated?.logoUrl || "/images/logo.png",
      favicon_url: updated?.faviconUrl || "/favicon.ico",
      contact_email: updated?.email || "info@pringgodani.desa.id",
      contact_phone: updated?.phone || "081234567890",
      address: updated?.address || "Jl. Raya Desa Pringgodani No. 1, Bantur, Malang",
      social_facebook: updated?.facebook || "",
      social_instagram: updated?.instagram || "",
      social_youtube: updated?.youtube || "",
      social_tiktok: updated?.tiktok || "",
      jumlah_dusun: 4,
    };
    // Trigger auto-indexing for site-wide pages
    IndexingService.notifySiteUpdated();

    return ApiResponse.success(data, "Pengaturan website berhasil diperbarui");
  } catch (error: any) {
    console.error("Update admin settings error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memperbarui pengaturan website", 500);
  }
}
