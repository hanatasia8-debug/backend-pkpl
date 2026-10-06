import { StorageService } from "../../../modules/storage/storage.service";
import { ApiResponse } from "../../../shared/utils/response";
import { AppError } from "../../../shared/errors/app-error";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin") || "*";

  try {
    const { searchParams } = new URL(request.url);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoryParam =
      searchParams.get("category") ||
      searchParams.get("folder") ||
      (formData.get("category") as string | null) ||
      (formData.get("folder") as string | null) ||
      undefined;

    const result = await StorageService.uploadFile(file, categoryParam);
    const res = ApiResponse.success(result, "File berhasil diunggah", 201);
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    return res;
  } catch (error: any) {
    if (error instanceof AppError) {
      const res = ApiResponse.error(error.message, error.statusCode, error.errors);
      res.headers.set("Access-Control-Allow-Origin", origin);
      return res;
    }
    console.error("Upload API error:", error);
    const res = ApiResponse.error(
      error?.message || "Terjadi kesalahan saat mengunggah berkas",
      500
    );
    res.headers.set("Access-Control-Allow-Origin", origin);
    return res;
  }
}

