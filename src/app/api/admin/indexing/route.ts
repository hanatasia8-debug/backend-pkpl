import { GoogleIndexingClient } from "../../../../modules/indexing/google-indexing.client";
import { IndexingService } from "../../../../modules/indexing/indexing.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { requireAdmin } from "../../../../shared/auth/require-admin";

export async function GET() {
  try {
    await requireAdmin();
    const info = GoogleIndexingClient.getClientInfo();
    const siteUrl =
      process.env.SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://lokalpringgodani.my.id";

    return ApiResponse.success({
      isConfigured: info.isConfigured,
      clientEmail: info.clientEmail,
      projectId: info.projectId,
      siteUrl,
      endpoint: "https://indexing.googleapis.com/v3/urlNotifications:publish",
    });
  } catch (error: any) {
    console.error("Get indexing status error:", error);
    return ApiResponse.error(
      error.message || "Gagal memeriksa status indexing",
      error.statusCode || 500,
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const action = body.action || "single";

    if (action === "reindex_all") {
      const summary = await IndexingService.reindexAllPublishedContent();
      return ApiResponse.success(
        summary,
        `Berhasil memproses sinkronisasi ${summary.totalUrls} URL ke antrean Google Indexing (${summary.successCount} sukses, ${summary.failureCount} gagal)`,
      );
    }

    const url = body.url?.trim();
    const type = body.type === "URL_DELETED" ? "URL_DELETED" : "URL_UPDATED";

    if (!url) {
      return ApiResponse.error("URL wajib diisi", 400);
    }

    const result = await IndexingService.publishCustomUrl(url, type);

    if (!result.success) {
      return ApiResponse.error(
        result.message || "Gagal mengirim notifikasi URL ke Google",
        result.status || 400,
      );
    }

    return ApiResponse.success(
      result,
      `URL ${url} berhasil dikirim ke Google Indexing queue (${type})`,
    );
  } catch (error: any) {
    console.error("Post indexing notification error:", error);
    return ApiResponse.error(
      error.message || "Terjadi kesalahan saat memproses permintaan indexing",
      error.statusCode || 500,
    );
  }
}
