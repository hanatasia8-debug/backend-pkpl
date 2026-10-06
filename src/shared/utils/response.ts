import { NextResponse } from "next/server";

export function serializeBigInt<T>(data: T): any {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export class ApiResponse {
  static success<T>(data: T, message?: string, statusCode: number = 200) {
    const time = new Date().toLocaleTimeString("id-ID");
    console.log(`[${time}] ✅ Response ${statusCode}: ${message || "Success"}`);
    const payload = serializeBigInt({
      success: true,
      ...(message ? { message } : {}),
      data,
    });
    return NextResponse.json(payload, { status: statusCode });
  }

  static error(message: string, statusCode: number = 500, errors?: any) {
    const time = new Date().toLocaleTimeString("id-ID");
    console.error(`[${time}] ❌ Response Error ${statusCode}: ${message}`, errors ? JSON.stringify(errors) : "");
    
    // In production, mask raw unhandled 500 internal errors to avoid leaking database schema/stack traces
    const isProduction = process.env.NODE_ENV === "production";
    const userFacingMessage =
      statusCode >= 500 && isProduction && !message.startsWith("Terjadi kesalahan")
        ? "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi."
        : message;

    const payload = {
      success: false,
      error: userFacingMessage,
      ...(errors && !isProduction ? { details: errors } : errors ? { details: "Terjadi kesalahan validasi" } : {}),
    };
    return NextResponse.json(payload, { status: statusCode });
  }
}
