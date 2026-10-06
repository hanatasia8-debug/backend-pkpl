"use client";

import { useEffect, useState } from "react";

export default function SwaggerDocsPage() {
  const [loaded, setLoaded] = useState(false);
  const isProduction = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_SWAGGER !== "true";

  useEffect(() => {
    if (isProduction) return;

    // 1. Inject Swagger UI CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css";
    document.head.appendChild(link);

    // 2. Inject Swagger UI Bundle JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      setLoaded(true);
      if ((window as any).SwaggerUIBundle) {
        (window as any).SwaggerUIBundle({
          url: "/api/docs/spec",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            (window as any).SwaggerUIBundle.presets.apis,
            (window as any).SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [isProduction]);

  if (isProduction) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 text-2xl font-bold">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-white">404 - Access Restricted</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Dokumentasi Swagger API dinonaktifkan di lingkungan produksi demi alasan keamanan sistem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-6 border-b border-slate-800 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Web Desa - Interactive Swagger API Docs
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            OpenAPI 3.0 Serverless Backend Playground (Development Mode)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/health"
            target="_blank"
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-md hover:bg-emerald-600/30 transition-all"
          >
            GET /api/health
          </a>
          <a
            href="/api/docs/spec"
            target="_blank"
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 rounded-md hover:bg-slate-700 transition-all"
          >
            OpenAPI JSON Spec
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-4 overflow-hidden border border-slate-700">
        {!loaded && (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium text-sm">Memuat Swagger UI Bundle...</p>
          </div>
        )}
        <div id="swagger-ui"></div>
      </main>
    </div>
  );
}
