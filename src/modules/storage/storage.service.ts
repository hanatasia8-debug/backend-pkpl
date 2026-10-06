import { createAdminClient } from "../../shared/supabase/server";
import { ValidationError, AppError } from "../../shared/errors/app-error";
import fs from "fs";
import path from "path";

export class StorageService {
  static async uploadFile(file: File | null, category?: string) {
    if (!file) {
      throw new ValidationError("Tidak ada file yang diunggah");
    }

    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    if (file.size > MAX_SIZE) {
      throw new ValidationError("Ukuran file maksimal adalah 15MB");
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/heic",
      "image/heif",
      "image/avif",
    ];
    if (!file.type || !allowedTypes.includes(file.type.toLowerCase())) {
      throw new ValidationError(
        "Format file tidak didukung. Harap unggah berkas gambar yang valid (JPG, PNG, WEBP, HEIC, GIF, AVIF)"
      );
    }

    // Determine target bucket based on category & environment variables
    const cat = (category || "").toLowerCase().trim();
    let targetBucket = process.env.SUPABASE_STORAGE_BUCKET_PROFILE || "village-profile";

    if (cat === "umkm") {
      targetBucket = process.env.SUPABASE_STORAGE_BUCKET_UMKM || "umkm";
    } else if (cat === "news" || cat === "berita") {
      targetBucket = process.env.SUPABASE_STORAGE_BUCKET_NEWS || "news";
    } else if (cat === "profile" || cat === "village" || cat === "potensi") {
      targetBucket = process.env.SUPABASE_STORAGE_BUCKET_PROFILE || "village-profile";
    }

    const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);
    const storageProvider =
      process.env.STORAGE_PROVIDER ||
      (process.env.NODE_ENV === "production" || isVercel ? "supabase" : "local");

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    let finalContentType = file.type;
    let finalExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    // Validation-First:
    // If the file is already WebP and size is <= 450 KB, it is already well-compressed (e.g. from frontend).
    // We preserve the buffer untouched to avoid multi-generation lossy degradation!
    const isAlreadyOptimized =
      file.type === "image/webp" && file.size <= 450 * 1024;

    if (!isAlreadyOptimized && file.type !== "image/gif") {
      try {
        const sharpModule = await import("sharp").then((m) => m.default || m);
        const image = sharpModule(buffer);
        const metadata = await image.metadata();

        const needsResize =
          Boolean(metadata.width && metadata.width > 1920) ||
          Boolean(metadata.height && metadata.height > 1920);

        let pipeline = image.rotate(); // Auto-orient EXIF rotation
        if (needsResize) {
          pipeline = pipeline.resize({
            width: 1920,
            height: 1920,
            fit: "inside",
            withoutEnlargement: true,
          });
        }

        buffer = await pipeline.webp({ quality: 82, effort: 4 }).toBuffer();
        finalContentType = "image/webp";
        finalExtension = "webp";
        console.log(
          `[StorageService] Berkas berhasil dioptimasi: ${(file.size / 1024).toFixed(1)} KB -> ${(buffer.length / 1024).toFixed(1)} KB (-${(((file.size - buffer.length) / file.size) * 100).toFixed(1)}%)`
        );
      } catch (err: any) {
        console.warn("[StorageService] Sharp optimization skipped (using original file):", err.message);
      }
    }

    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const uniqueFileName = `${Date.now()}_${cleanFileName}.${finalExtension}`;

    if (storageProvider === "local" && !isVercel) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", targetBucket);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, uniqueFileName);
      fs.writeFileSync(filePath, buffer);

      const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
      return { url: `${backendUrl}/uploads/${targetBucket}/${uniqueFileName}`, bucket: targetBucket };
    } else {
      const supabase = createAdminClient();
      let { error } = await supabase.storage
        .from(targetBucket)
        .upload(uniqueFileName, buffer, {
          contentType: finalContentType,
          upsert: true,
        });

      // If bucket does not exist, attempt to auto-create public bucket and retry
      if (error && (error.message.includes("Bucket not found") || error.message.includes("not found"))) {
        console.log(`[StorageService] Bucket '${targetBucket}' belum ada, membuat bucket otomatis...`);
        try {
          await supabase.storage.createBucket(targetBucket, { public: true });
          const retry = await supabase.storage
            .from(targetBucket)
            .upload(uniqueFileName, buffer, {
              contentType: finalContentType,
              upsert: true,
            });
          error = retry.error;
        } catch (bucketErr: any) {
          console.warn(`[StorageService] Gagal membuat bucket '${targetBucket}':`, bucketErr.message);
        }
      }

      if (error) {
        throw new AppError(`Gagal mengunggah berkas ke Supabase Storage (bucket: ${targetBucket}): ${error.message}`, 500);
      }

      const { data: publicUrlData } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(uniqueFileName);

      return { url: publicUrlData.publicUrl, bucket: targetBucket };
    }
  }

  /**
   * Deletes a single file or multiple files from Supabase Storage and/or local storage.
   */
  static async deleteFile(urlOrPath?: string | null): Promise<void> {
    if (!urlOrPath) return;
    await this.deleteFiles([urlOrPath]);
  }

  /**
   * Deletes multiple files from Supabase Storage and/or local storage given their public URLs.
   */
  static async deleteFiles(urlsOrPaths: (string | null | undefined)[]): Promise<void> {
    const validUrls = urlsOrPaths.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
    if (validUrls.length === 0) return;

    // Group files by Supabase bucket
    const supabaseBucketFiles: Record<string, string[]> = {};
    const localFiles: { bucket: string; filePath: string }[] = [];

    for (const rawUrl of validUrls) {
      const url = rawUrl.trim();

      // Check if it's a Supabase storage URL
      // Format: .../storage/v1/object/public/{bucket}/{filePath} or .../storage/v1/object/authenticated/{bucket}/{filePath}
      const supabaseMatch = url.match(/\/storage\/v1\/object\/(?:public|authenticated)\/([^/]+)\/(.+)$/);
      if (supabaseMatch) {
        const bucket = supabaseMatch[1];
        const filePath = decodeURIComponent(supabaseMatch[2]);
        if (!supabaseBucketFiles[bucket]) {
          supabaseBucketFiles[bucket] = [];
        }
        supabaseBucketFiles[bucket].push(filePath);
        continue;
      }

      // Check if it's a local /uploads/{bucket}/{filePath} URL
      const localMatch = url.match(/\/uploads\/([^/]+)\/(.+)$/);
      if (localMatch) {
        const bucket = localMatch[1];
        const filePath = decodeURIComponent(localMatch[2]);
        localFiles.push({ bucket, filePath });
        continue;
      }
    }

    // 1. Delete from local storage if any (with strict path traversal guard)
    const baseUploadDir = path.resolve(process.cwd(), "public", "uploads");
    for (const { bucket, filePath } of localFiles) {
      try {
        const safeBucket = bucket.replace(/[^a-zA-Z0-9_-]/g, "");
        const safeFilePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "");
        const fullPath = path.resolve(baseUploadDir, safeBucket, safeFilePath);

        if (fullPath.startsWith(baseUploadDir) && fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err: any) {
        console.warn(`[StorageService] Failed to delete local file ${bucket}/${filePath}:`, err.message);
      }
    }

    // 2. Delete from Supabase Storage buckets
    const bucketEntries = Object.entries(supabaseBucketFiles);
    if (bucketEntries.length > 0) {
      try {
        const supabase = createAdminClient();
        for (const [bucket, files] of bucketEntries) {
          if (files.length > 0) {
            const { error } = await supabase.storage.from(bucket).remove(files);
            if (error) {
              console.warn(`[StorageService] Supabase remove warning for bucket '${bucket}':`, error.message);
            } else {
              console.log(`[StorageService] Successfully removed ${files.length} file(s) from bucket '${bucket}'`);
            }
          }
        }
      } catch (err: any) {
        console.warn("[StorageService] Error connecting to Supabase Storage for deletion:", err.message);
      }
    }
  }
}
