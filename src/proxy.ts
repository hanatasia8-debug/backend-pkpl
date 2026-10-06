import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_DEV_ORIGINS = [
  "http://localhost:3001",
  "http://localhost:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3000",
];

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, "").toLowerCase();
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Server-to-server or same-origin requests

  const normalized = normalizeOrigin(origin);
  const configuredFrontend = process.env.FRONTEND_URL ? normalizeOrigin(process.env.FRONTEND_URL) : "";
  const corsAllowedEnv = process.env.CORS_ALLOWED_ORIGINS?.split(",").map(normalizeOrigin).filter(Boolean) || [];

  const allowedSet = new Set<string>();

  if (configuredFrontend) {
    allowedSet.add(configuredFrontend);
  }

  corsAllowedEnv.forEach((o) => allowedSet.add(o));

  // In development, also include localhost dev ports
  if (process.env.NODE_ENV !== "production") {
    DEFAULT_DEV_ORIGINS.forEach((o) => allowedSet.add(normalizeOrigin(o)));
  }

  // Exact match with configured origins
  if (allowedSet.has(normalized)) return true;

  // Allow official village & project domains (*.lokalpringgodani.my.id, *.desa.id)
  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname;
    if (
      host === "lokalpringgodani.my.id" ||
      host.endsWith(".lokalpringgodani.my.id") ||
      host.endsWith(".desa.id")
    ) {
      return true;
    }

    if (host.endsWith(".vercel.app") && host.includes("pringgodani")) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");
  const acceptHeader = request.headers.get("accept") || "";
  const fetchMode = request.headers.get("sec-fetch-mode") || "";
  const allowed = isOriginAllowed(origin);
  const matchedOrigin = allowed && origin ? origin : (process.env.FRONTEND_URL || "*");

  // 1. Block Direct Browser Address Bar Navigation to Admin API Routes
  if (
    pathname.startsWith("/api/admin/") &&
    (fetchMode === "navigate" || (acceptHeader.includes("text/html") && !origin))
  ) {
    return NextResponse.json(
      { success: false, error: "Direct browser HTML navigation to Admin API endpoints is strictly prohibited." },
      { status: 403 }
    );
  }

  // 2. Handle Preflight OPTIONS request instantly
  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    if (
      !allowed &&
      !pathname.startsWith("/api/public/") &&
      !pathname.startsWith("/api/uploads") &&
      !pathname.startsWith("/api/docs") &&
      pathname !== "/api/health"
    ) {
      return new NextResponse(null, { status: 403 });
    }
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || matchedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Api-Version",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Log API Requests
  if (pathname.startsWith("/api/")) {
    const timestamp = new Date().toLocaleTimeString("id-ID");
    const query = request.nextUrl.search;
    console.log(`[${timestamp}] 🚀 ${request.method} ${pathname}${query} (Origin: ${origin || "none"})`);
  }

  // 3. Prepare response with Security & CORS headers
  const response = NextResponse.next({ request });

  // 4. Inject Security & CORS headers for API requests
  if (pathname.startsWith("/api/")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
    
    // For public endpoints, uploads, or whitelisted origins, set CORS headers
    if (
      allowed ||
      pathname.startsWith("/api/public/") ||
      pathname.startsWith("/api/uploads") ||
      pathname.startsWith("/api/docs") ||
      pathname === "/api/health"
    ) {
      response.headers.set("Access-Control-Allow-Origin", origin || matchedOrigin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Api-Version");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
