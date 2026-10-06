import type { NextConfig } from "next";

/**
 * Parses allowed development origins from ALLOWED_DEV_ORIGINS environment variable
 * and provides safe wildcards for local dev networks instead of hardcoded IPs.
 */
function getAllowedDevOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_DEV_ORIGINS
    ? process.env.ALLOWED_DEV_ORIGINS.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const defaultOrigins = [
    "localhost:*",
    "127.0.0.1:*",
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "*.local",
  ];

  return Array.from(new Set([...envOrigins, ...defaultOrigins]));
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "pringgondaniblog.wordpress.com" },
      { protocol: "https", hostname: "*.desa.id" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
