import { prisma } from "../../shared/db/client";
import {
  GoogleIndexingClient,
  IndexingNotificationResult,
  IndexingNotificationType,
} from "./google-indexing.client";

export class IndexingService {
  private static getSiteUrl(): string {
    const raw = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
    return (raw || "https://lokalpringgodani.my.id").replace(/\/+$/, "");
  }

  /**
   * Safe non-blocking asynchronous executor.
   * Ensures that external indexing network calls never block database transactions or client responses.
   */
  private static notifyAsync(
    taskName: string,
    action: () => Promise<any>,
  ): void {
    Promise.resolve()
      .then(() => action())
      .catch((err) => {
        console.warn(
          `[IndexingService] Background notification failed for ${taskName}:`,
          err?.message || err,
        );
      });
  }

  /**
   * Triggers Google Indexing for a published news article
   */
  public static notifyNewsUpdated(slug: string): void {
    if (!slug) return;
    const siteUrl = this.getSiteUrl();
    this.notifyAsync(`News Updated (${slug})`, async () => {
      await Promise.allSettled([
        GoogleIndexingClient.publishNotification(
          `${siteUrl}/berita/${encodeURIComponent(slug)}`,
          "URL_UPDATED",
        ),
        GoogleIndexingClient.publishNotification(
          `${siteUrl}/berita`,
          "URL_UPDATED",
        ),
      ]);
    });
  }

  /**
   * Triggers Google Indexing for a deleted news article
   */
  public static notifyNewsDeleted(slug: string): void {
    if (!slug) return;
    const siteUrl = this.getSiteUrl();
    this.notifyAsync(`News Deleted (${slug})`, async () => {
      await GoogleIndexingClient.publishNotification(
        `${siteUrl}/berita/${encodeURIComponent(slug)}`,
        "URL_DELETED",
      );
    });
  }

  /**
   * Triggers Google Indexing for an approved/updated UMKM profile
   */
  public static notifyUmkmUpdated(slug: string): void {
    if (!slug) return;
    const siteUrl = this.getSiteUrl();
    this.notifyAsync(`UMKM Updated (${slug})`, async () => {
      await Promise.allSettled([
        GoogleIndexingClient.publishNotification(
          `${siteUrl}/umkm/${encodeURIComponent(slug)}`,
          "URL_UPDATED",
        ),
        GoogleIndexingClient.publishNotification(
          `${siteUrl}/umkm`,
          "URL_UPDATED",
        ),
      ]);
    });
  }

  /**
   * Triggers Google Indexing for a deleted UMKM
   */
  public static notifyUmkmDeleted(slug: string): void {
    if (!slug) return;
    const siteUrl = this.getSiteUrl();
    this.notifyAsync(`UMKM Deleted (${slug})`, async () => {
      await GoogleIndexingClient.publishNotification(
        `${siteUrl}/umkm/${encodeURIComponent(slug)}`,
        "URL_DELETED",
      );
    });
  }

  /**
   * Triggers Google Indexing for an updated product
   */
  public static notifyProductUpdated(id: string): void {
    if (!id) return;
    const siteUrl = this.getSiteUrl();
    this.notifyAsync(`Product Updated (${id})`, async () => {
      await Promise.allSettled([
        GoogleIndexingClient.publishNotification(
          `${siteUrl}/produk/${encodeURIComponent(id)}`,
          "URL_UPDATED",
        ),
        GoogleIndexingClient.publishNotification(
          `${siteUrl}/produk`,
          "URL_UPDATED",
        ),
      ]);
    });
  }

  /**
   * Triggers Google Indexing for a deleted product
   */
  public static notifyProductDeleted(id: string): void {
    if (!id) return;
    const siteUrl = this.getSiteUrl();
    this.notifyAsync(`Product Deleted (${id})`, async () => {
      await GoogleIndexingClient.publishNotification(
        `${siteUrl}/produk/${encodeURIComponent(id)}`,
        "URL_DELETED",
      );
    });
  }

  /**
   * Triggers Google Indexing for site-wide profile or settings changes
   */
  public static notifySiteUpdated(): void {
    const siteUrl = this.getSiteUrl();
    this.notifyAsync("Site Profile/Settings Updated", async () => {
      await Promise.allSettled([
        GoogleIndexingClient.publishNotification(`${siteUrl}/`, "URL_UPDATED"),
        GoogleIndexingClient.publishNotification(
          `${siteUrl}/profil`,
          "URL_UPDATED",
        ),
        GoogleIndexingClient.publishNotification(
          `${siteUrl}/peta`,
          "URL_UPDATED",
        ),
      ]);
    });
  }

  /**
   * Publishes a single custom URL directly (used by admin dashboard manual trigger)
   */
  public static async publishCustomUrl(
    url: string,
    type: IndexingNotificationType = "URL_UPDATED",
  ): Promise<IndexingNotificationResult> {
    return GoogleIndexingClient.publishNotification(url, type);
  }

  /**
   * Mass reindexes all active published content across the site.
   * Safely throttles requests in small chunks (5 URLs with 200ms pause)
   * to respect Google's quota and prevent 429 rate limit errors.
   */
  public static async reindexAllPublishedContent(): Promise<{
    totalUrls: number;
    successCount: number;
    failureCount: number;
    results: IndexingNotificationResult[];
  }> {
    const siteUrl = this.getSiteUrl();
    const urlsToIndex: string[] = [
      `${siteUrl}/`,
      `${siteUrl}/umkm`,
      `${siteUrl}/berita`,
      `${siteUrl}/produk`,
      `${siteUrl}/peta`,
      `${siteUrl}/profil`,
    ];

    try {
      // 1. Fetch published news
      const publishedNews = await prisma.news.findMany({
        where: {
          status: {
            in: ["PUBLISHED", "published", "Published"],
          },
        },
        select: { slug: true },
        take: 50,
      });
      publishedNews.forEach((n) => {
        if (n.slug) urlsToIndex.push(`${siteUrl}/berita/${encodeURIComponent(n.slug)}`);
      });

      // 2. Fetch approved UMKM
      const approvedUmkms = await prisma.umkm.findMany({
        where: {
          status: {
            in: ["APPROVED", "approved", "Approved"],
          },
        },
        select: { slug: true },
        take: 50,
      });
      approvedUmkms.forEach((u) => {
        if (u.slug) urlsToIndex.push(`${siteUrl}/umkm/${encodeURIComponent(u.slug)}`);
      });

      // 3. Fetch products
      const products = await prisma.product.findMany({
        select: { id: true },
        take: 50,
      });
      products.forEach((p) => {
        if (p.id) urlsToIndex.push(`${siteUrl}/produk/${p.id.toString()}`);
      });
    } catch (err) {
      console.warn(
        "[IndexingService] Error gathering URLs for reindex_all:",
        err,
      );
    }

    // Deduplicate URLs
    const uniqueUrls = Array.from(new Set(urlsToIndex));
    const results: IndexingNotificationResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Process in chunks of 5 with 200ms pause
    const chunkSize = 5;
    for (let i = 0; i < uniqueUrls.length; i += chunkSize) {
      const chunk = uniqueUrls.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map((url) =>
          GoogleIndexingClient.publishNotification(url, "URL_UPDATED"),
        ),
      );

      chunkResults.forEach((res) => {
        results.push(res);
        if (res.success) {
          successCount++;
        } else {
          failureCount++;
        }
      });

      // 200ms throttle delay between chunks
      if (i + chunkSize < uniqueUrls.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    return {
      totalUrls: uniqueUrls.length,
      successCount,
      failureCount,
      results,
    };
  }
}
