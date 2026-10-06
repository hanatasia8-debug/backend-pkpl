export default function ApiLandingPage() {
  return (
    <div className="min-h-screen bg-[#09111e] text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-[#111c2e] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full">
            Serverless Backend API Active
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Web Desa API Server
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Layanan backend serverless berbasis Next.js App Router dengan arsitektur Feature-Sliced (UMKM, Maps/SIG, Potensi Desa, Auth, & Storage).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href="/docs"
            className="flex items-center justify-between p-4 bg-emerald-600/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-600/20 hover:border-emerald-500/50 transition-all group"
          >
            <div>
              <div className="font-semibold text-emerald-300 text-sm group-hover:text-emerald-200">
                Swagger UI Docs 🚀
              </div>
              <div className="text-xs text-slate-400">Playground API Interaktif</div>
            </div>
            <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">
              &rarr;
            </span>
          </a>

          <a
            href="/api/health"
            target="_blank"
            className="flex items-center justify-between p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all group"
          >
            <div>
              <div className="font-semibold text-slate-200 text-sm group-hover:text-white">
                Health Check 💚
              </div>
              <div className="text-xs text-slate-400">Status Server & DB</div>
            </div>
            <span className="text-slate-400 group-hover:translate-x-1 transition-transform">
              &rarr;
            </span>
          </a>
        </div>

        <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Version 1.0.0</span>
          <span>Next.js 16 Serverless</span>
        </div>
      </div>
    </div>
  );
}
