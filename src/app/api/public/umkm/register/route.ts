import { NextResponse } from "next/server";
import { UmkmService } from "../../../../../modules/umkm/umkm.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await UmkmService.registerUmkm(body);

    return ApiResponse.success(
      result,
      "UMKM berhasil didaftarkan dan menunggu verifikasi admin.",
      201
    );
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Register UMKM error:", error);
    return ApiResponse.error(`Terjadi kesalahan saat memproses pendaftaran: ${error.message}`, 500);
  }
}
