import { ValidationError } from "../errors/app-error";

export function getAllowedFrontendOrigin(request: Request): string {
  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin) {
    throw new ValidationError("Origin frontend tidak ditemukan.");
  }

  let origin: URL;
  try {
    origin = new URL(requestOrigin);
  } catch {
    throw new ValidationError("Origin frontend tidak valid.");
  }

  const configuredOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ALLOWED_ORIGINS || "").split(","),
  ];
  const allowedOrigins = configuredOrigins
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => {
      try {
        return new URL(value.trim()).origin;
      } catch {
        return "";
      }
    });
  const isLocalDevelopment =
    process.env.NODE_ENV === "development" &&
    (origin.hostname === "localhost" || origin.hostname === "127.0.0.1");

  if (!isLocalDevelopment && !allowedOrigins.includes(origin.origin)) {
    throw new ValidationError("Origin frontend tidak diizinkan untuk autentikasi.");
  }

  return origin.origin;
}
