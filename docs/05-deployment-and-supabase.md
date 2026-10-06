# 05. Panduan Deployment & Supabase — Web Desa Pringgodani

Dokumen ini memandu proses *deployment* backend `web-desa` ke lingkungan produksi (*Production Environment*) menggunakan **Vercel Serverless** dan **Supabase Cloud Infrastructure**.

---

## 1. Arsitektur Infrastruktur Produksi

```mermaid
graph TD
    User([Pengguna / Internet]) -->|HTTPS Request| Cloudflare[DNS / Domain Desa]
    Cloudflare -->|Proxy SSL| Vercel[Vercel Serverless Edge Platform]
    
    subgraph Vercel_Deployment [Vercel Environment]
        Vercel -->|Route Handlers| NextApi[Next.js Serverless Functions]
        NextApi -->|Connection Pooling Pooler:6543| PgPool[Node pg Pool]
    end
    
    subgraph Supabase_Cloud [Supabase Cloud Project]
        PgPool -->|Prisma Adapter| SupaDB[(Supabase PostgreSQL 15)]
        NextApi -->|Upload / Delete Media| SupaStorage[(Supabase Storage Buckets)]
    end
```

---

## 2. Pengaturan Supabase Cloud

### A. Konfigurasi Database & Connection Pooler
1. Buka **Supabase Dashboard** → **Project Settings** → **Database**.
2. Salin *Connection String* pada bagian **Connection Pooling**:
   * Mode: **Transaction**
   * Port: **`6543`** (Gunakan ini untuk `DATABASE_URL`).
3. Salin *Direct Connection String* pada bagian **Direct Connection**:
   * Port: **`5432`** (Gunakan ini untuk `DIRECT_URL`).

### B. Konfigurasi Supabase Storage Buckets
Pastikan *Storage Buckets* berikut telah dibuat di Supabase Dashboard:
1. Buka menu **Storage** → **Create New Bucket**.
2. Buat bucket dengan nama:
   * `umkm` (Public Bucket: ON)
   * `news` (Public Bucket: ON)
   * `profile` (Public Bucket: ON)
   * `banners` (Public Bucket: ON)
3. Pada tab **Policies**, pastikan terdapat aturan *Select Policy* yang mengizinkan pembacaan publik (`public read access`).

---

## 3. Deployment ke Vercel

### Langkah 1: Hubungkan Repositori Git
1. Masuk ke [Vercel Dashboard](https://vercel.com).
2. Klik **Add New...** → **Project**, lalu pilih repositori Git `web-desa`.
3. Tentukan nama proyek (misal: `web-desa-backend`).

### Langkah 2: Konfigurasi Build & Environment Variables
Pada pengaturan proyek Vercel:
* **Framework Preset**: Next.js
* **Root Directory**: `./` (atau `web-desa` jika dalam monorepo)
* **Build Command**: `npx prisma generate && next build`
* **Output Directory**: `.next`

Tambahkan seluruh Environment Variables di menu **Settings** → **Environment Variables**:
```env
DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xyzprojectid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_SECRET_KEY=kunci_rahasia_admin_produksi
NODE_ENV=production
```

### Langkah 3: Deploy & Verifikasi Endpoint
1. Klik tombol **Deploy**.
2. Tunggu proses build selesai (~1-2 menit).
3. Setelah status *Ready*, uji endpoint kesehatan:
   ```bash
   curl -I https://your-backend.vercel.app/api/health
   ```
   Pastikan mengembalikan status `HTTP/2 200 OK`.

---

## 4. Konfigurasi Domain Kustom (*Custom Domain*)

Untuk menghubungkan domain resmi desa (misal: `api.pringgodani.desa.id`):
1. Buka Vercel Project Settings → **Domains**.
2. Tambahkan domain: `api.pringgodani.desa.id`.
3. Pada DNS Manager penyedia domain (cPanel/Cloudflare), tambahkan rekaman DNS:
   * **Type**: `CNAME`
   * **Name**: `api`
   * **Target**: `cname.vercel-dns.com`
4. Tunggu propagasi DNS dan verifikasi sertifikat SSL otomatis dari Vercel.

---

## 5. Prosedur Pemeliharaan & Cadangan Data (*Backup*)

### Cadangan Otomatis (*Automated Daily Backups*)
Supabase secara otomatis mencadangkan basis data setiap hari pada paket berbayar / Pro tier.

### Cadangan Manual Menggunakan `pg_dump`
Untuk membuat cadangan lokal sewaktu-waktu:
```bash
pg_dump "postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" -F c -b -v -f "backup_desa_pringgodani_$(date +%Y%m%d).dump"
```

### Pemulihan Data (*Restore*)
```bash
pg_restore -d "postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" -v "backup_desa_pringgodani_20260821.dump"
```
