import { ApiResponse } from "../../../shared/utils/response";
import { prisma } from "../../../shared/db/client";

export async function GET() {
  try {
    // Ping database to verify connection health
    await prisma.$queryRaw`SELECT 1`;

    return ApiResponse.success({
      status: "ok",
      version: "1.0.1",
      timestamp: new Date().toISOString(),
      service: "Web Desa Serverless Backend API",
      environment: process.env.NODE_ENV || "development",
      database: "connected",
    });
  } catch (error: any) {
    return ApiResponse.error(
      `Health check failed: ${error.message}`,
      503,
      { database: "disconnected" }
    );
  }
}
