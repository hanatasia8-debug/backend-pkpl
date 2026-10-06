import crypto from "crypto";

export type IndexingNotificationType = "URL_UPDATED" | "URL_DELETED";

export interface IndexingNotificationResult {
  url: string;
  type: IndexingNotificationType;
  success: boolean;
  status?: number;
  message?: string;
  notifyTime?: string;
}

/**
 * Production-grade Google Indexing API v3 Client
 * - Zero external dependencies (uses native Node.js crypto for RS256 JWT)
 * - Strict 5-second timeout to prevent any thread blockage
 * - In-memory OAuth2 token caching with automatic pre-expiry refresh
 * - Defensive error handling: never throws unhandled errors
 */
export class GoogleIndexingClient {
  private static cachedToken: string | null = null;
  private static tokenExpiresAt = 0; // Unix timestamp in ms

  private static getCredentials() {
    const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL?.trim();
    let privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY?.trim();

    if (!clientEmail || !privateKey) {
      return null;
    }

    // Fix escaped newlines if passed in .env (e.g. "\\n" -> "\n")
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    return {
      clientEmail,
      privateKey,
      projectId: process.env.GOOGLE_INDEXING_PROJECT_ID?.trim() || "lokal-desa",
    };
  }

  public static isConfigured(): boolean {
    return Boolean(this.getCredentials());
  }

  public static getClientInfo() {
    const creds = this.getCredentials();
    return {
      isConfigured: Boolean(creds),
      clientEmail: creds?.clientEmail || null,
      projectId: creds?.projectId || null,
    };
  }

  /**
   * Generates a signed RS256 JWT assertion and exchanges it for a Google OAuth2 access token.
   * Caches token in memory for ~50 minutes to avoid redundant OAuth network calls.
   */
  private static async getAccessToken(): Promise<string | null> {
    const creds = this.getCredentials();
    if (!creds) return null;

    // Use cached token if valid for at least another 5 minutes
    const nowMs = Date.now();
    if (this.cachedToken && this.tokenExpiresAt - nowMs > 5 * 60 * 1000) {
      return this.cachedToken;
    }

    try {
      const nowSec = Math.floor(nowMs / 1000);
      const expSec = nowSec + 3600; // 1 hour validity

      const header = {
        alg: "RS256",
        typ: "JWT",
      };

      const payload = {
        iss: creds.clientEmail,
        scope: "https://www.googleapis.com/auth/indexing",
        aud: "https://oauth2.googleapis.com/token",
        exp: expSec,
        iat: nowSec,
      };

      const base64UrlEncode = (obj: Record<string, any>) =>
        Buffer.from(JSON.stringify(obj))
          .toString("base64")
          .replace(/=/g, "")
          .replace(/\+/g, "-")
          .replace(/\//g, "_");

      const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;

      const signer = crypto.createSign("RSA-SHA256");
      signer.update(unsignedToken);
      const signature = signer
        .sign(creds.privateKey, "base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      const signedJwt = `${unsignedToken}.${signature}`;

      // Exchange JWT for Google OAuth2 Bearer Access Token with 5s timeout
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: signedJwt,
        }).toString(),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.warn(
          `[GoogleIndexing] Failed to exchange token (${response.status}): ${errorText}`,
        );
        return null;
      }

      const tokenData = (await response.json()) as {
        access_token?: string;
        expires_in?: number;
      };
      if (tokenData.access_token) {
        this.cachedToken = tokenData.access_token;
        this.tokenExpiresAt = nowMs + (tokenData.expires_in || 3600) * 1000;
        return this.cachedToken;
      }
    } catch (err: any) {
      console.warn(
        `[GoogleIndexing] Error during OAuth token exchange: ${err.message || err}`,
      );
    }

    return null;
  }

  /**
   * Publishes a single URL notification to Google Indexing API v3
   */
  public static async publishNotification(
    url: string,
    type: IndexingNotificationType = "URL_UPDATED",
  ): Promise<IndexingNotificationResult> {
    if (!url || !/^https?:\/\//i.test(url)) {
      return {
        url,
        type,
        success: false,
        message: "Invalid absolute URL format",
      };
    }

    const creds = this.getCredentials();
    const token = await this.getAccessToken();
    if (!token || !creds) {
      return {
        url,
        type,
        success: false,
        message:
          "Google Indexing Service Account not configured or token exchange failed",
      };
    }

    try {
      const response = await fetch(
        "https://indexing.googleapis.com/v3/urlNotifications:publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: url.trim(),
            type,
          }),
          signal: AbortSignal.timeout(5000),
        },
      );

      const responseBody = (await response.json().catch(() => ({}))) as any;

      if (response.ok) {
        return {
          url,
          type,
          success: true,
          status: response.status,
          message: "Successfully published to Google Indexing queue",
          notifyTime:
            responseBody?.urlNotificationMetadata?.latestUpdate?.notifyTime,
        };
      }

      let errMsg =
        responseBody?.error?.message ||
        `Google API error (HTTP ${response.status})`;

      if (
        response.status === 403 &&
        (errMsg.includes("Permission denied") ||
          errMsg.includes("verify the URL ownership") ||
          errMsg.includes("ownership"))
      ) {
        errMsg =
          "Izin Ditolak Google: Email Service Account (" +
          (creds.clientEmail || "google-indexer@lokal-desa.iam.gserviceaccount.com") +
          ") belum didaftarkan sebagai 'Owner' di Google Search Console untuk domain " +
          new URL(url).origin +
          ". Silakan tambahkan email tersebut di Search Console > Settings > Users and permissions.";
      } else if (
        errMsg.includes("Indexing API has not been used") ||
        errMsg.includes("disabled")
      ) {
        errMsg =
          "Google Indexing API belum diaktifkan di Google Cloud Console untuk project '" +
          creds.projectId +
          "'. Silakan aktifkan Indexing API di console.cloud.google.com.";
      }

      console.warn(`[GoogleIndexing] Publish failed for ${url}: ${errMsg}`);

      return {
        url,
        type,
        success: false,
        status: response.status,
        message: errMsg,
      };
    } catch (err: any) {
      console.warn(
        `[GoogleIndexing] Network error for ${url}: ${err.message || err}`,
      );
      return {
        url,
        type,
        success: false,
        message: err.message || "Network timeout / connection error",
      };
    }
  }
}
