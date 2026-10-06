import { OfficialsService } from "../../../../modules/officials/officials.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("villageProfileId") || undefined;
    const query = searchParams.get("q") || undefined;

    const officials = await OfficialsService.getOfficials(profileId, query);
    return ApiResponse.success(officials);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil data perangkat desa", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await OfficialsService.createOfficial(body);

    return ApiResponse.success(
      result,
      "Perangkat desa berhasil ditambahkan.",
      201
    );
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Create official error:", error);
    return ApiResponse.error(`Terjadi kesalahan saat menambahkan perangkat desa: ${error.message}`, 500);
  }
}
