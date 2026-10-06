# Web Desa Pringgodani Backend

[![Next.js](https://img.shields.io/badge/Next.js-16.2.12-black.svg?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9.1-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![Database](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E.svg?logo=supabase)](https://supabase.com/)
[![Access](https://img.shields.io/badge/Access-Private%20%2F%20Proprietary-red.svg)](#-license)

---

## 📚 [DOKUMENTASI TEKNIS LENGKAP]
Panduan teknis dan operasional backend terperinci tersedia di folder [`docs/`](./docs/):
* 🏛️ [**01. Arsitektur Backend & Keamanan**](./docs/01-backend-architecture.md) — Pola Clean Architecture, Route Handlers, Service, & RBAC.
* 🗄️ [**02. Basis Data & Prisma ORM**](./docs/02-database-and-prisma.md) — Skema PostgreSQL, Diagram ERD Mermaid, Migrasi, & Seed.
* 🌐 [**03. Spesifikasi REST API**](./docs/03-api-reference.md) — Daftar lengkap Endpoint Public & Admin.
* 💻 [**04. Panduan Setup Lokal & Variabel .env**](./docs/04-local-setup-and-env.md) — Cara menjalankan di komputer lokal & troubleshooting.
* 🚀 [**05. Panduan Deployment & Supabase**](./docs/05-deployment-and-supabase.md) — Konfigurasi Vercel Serverless & Supabase Cloud.

---

## 📋 [PROJECT INFO]
* **Project Name**: `web-desa`
* **One Line Description**: Backend RESTful API modern, serverless, dan berkinerja tinggi berbasis Next.js App Router, Prisma ORM, dan Supabase PostgreSQL untuk pengelolaan data publik desa, katalog UMKM, produk unggulan, berita warga, peta interaktif, serta profil pemerintahan Desa Pringgodani.
* **Problem Statement**: Desa Pringgodani membutuhkan sistem informasi terpadu yang aman, tangguh, dan hemat biaya untuk mendigitalkan potensi ekonomi lokal, mengelola direktori UMKM, memfasilitasi pengajuan berita/usaha warga secara transparan, serta menyajikan navigasi peta wilayah tanpa membebani biaya server fisik yang mahal.
* **Target Users**: Warga dan pelaku UMKM Desa Pringgodani (pendaftaran usaha & pengajuan berita), Perangkat Desa / Administrator (verifikasi pengajuan, kurasi konten, & manajemen profil), serta Wisatawan / Masyarakat Luas (pencarian produk lokal, berita desa, dan direktori peta).

---

## ⚡ [FEATURES]
* 🏪 **Direktori & Pendaftaran UMKM Mandiri**: Registrasi usaha warga publik dengan validasi skema Zod, status kurasi (`PENDING`, `APPROVED`, `REJECTED`), katalog produk olahan, galeri foto usaha, jam operasional, dan tautan Google Maps asli (`mapsUrl`).
* 🗺️ **Peta Interaktif Desa (Maps Service)**: Penyajian titik lokasi UMKM dan fasilitas desa berbasis koordinat geospasial (Latitude/Longitude) lengkap dengan filter kategori dan pencarian terintegrasi.
* 📰 **Manajemen Berita & Galeri Foto**: Publikasi artikel berstruktur teks (sub-heading & blocks) maupun album galeri kegiatan desa, didukung penandaan relasi (*tagged relations*) UMKM dan produk terkait.
* 🛡️ **Zero-Trust Security & RBAC**: Proteksi seluruh endpoint administratif dengan middleware otentikasi Supabase Auth JWT, validasi role admin, dan konfigurasi CORS lintas domain.
* 📱 **Automated WhatsApp Follow-up**: Generator tautan WhatsApp otomatis untuk notifikasi penolakan dengan catatan revisi, konfirmasi persetujuan, dan pemesanan produk langsung ke pedagang.
* ⚡ **Vercel Serverless & Edge CDN Optimization**: Connection pooling singleton adaptif untuk warm serverless container, optimasi batching query `Promise.all`, dan caching Vercel Edge Network (`Cache-Control: s-maxage`) berlatensi < 20ms.
* 🖼️ **Media Storage & Upload**: Pengunggahan file media (banner, galeri, foto produk) langsung ke Supabase Cloud Storage dengan manajemen folder terisolasi.
* 📖 **Interactive Swagger / OpenAPI Docs**: Dokumentasi API interaktif bawaan yang dapat diakses langsung pada endpoint `/docs` dan `/api/docs/spec`.

---

## 💻 [TECH STACK]
* **Backend Framework**: Next.js 16.2.12 (App Router & Route Handlers), React 19
* **Language**: TypeScript 5
* **Database**: PostgreSQL (Supabase Cloud Database / Local Docker PostgreSQL)
* **ORM & Driver**: Prisma ORM 7.9.1 dengan `@prisma/adapter-pg` & `pg` (Node-Postgres Connection Pool)
* **Authentication**: Supabase Auth (JWT Bearer Token & HTTP Session Cookies)
* **Storage**: Supabase Cloud Storage Buckets
* **Schema Validation**: Zod 4
* **Documentation**: Swagger UI & OpenAPI 3.0 Specification

---

## 🏗️ [ARCHITECTURE]

### System Overview
Backend ini mengadopsi pola **Modular Clean Architecture & Serverless REST API**, memisahkan layer Route Handlers, Service (Business Logic), Repository (Database Access via Prisma), dan Shared Utilities.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Client App                      │
│        (Next.js Web / Admin Dashboard / Mobile Client)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              web-desa (Vercel Serverless API)               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐  │
│  │   Middleware    │ │  Route Handlers │ │ Services / DTO│  │
│  │ (CORS & Proxy)  │ │ (Validation/Zod)│ │(Business Logic│  │
│  └─────────────────┘ └─────────────────┘ └───────┬───────┘  │
│                                                  │          │
│                      Prisma ORM (@prisma/adapter-pg)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ TCP / SSL Connection Pool
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                   │
│   (Tabel: umkm, products, news, village_profile, settings)  │
└─────────────────────────────────────────────────────────────┘
```

### Main Modules
1. **`umkm`**: Manajemen kategori usaha, registrasi publik, katalog produk, galeri, dan kurasi status UMKM.
2. **`maps`**: Penyajian data titik lokasi, koordinat geospasial, kategori peta, dan resolving alamat.
3. **`news`**: Pengelolaan artikel berita, block-content builder, album galeri foto, dan tagging relasi.
4. **`products`**: Pengelolaan katalog produk, filter rentang harga, dan pemesanan WhatsApp.
5. **`profile`**: Pengelolaan data visi-misi, sejarah desa, profil kepala desa, dan aparatur pemerintah desa.
6. **`settings`**: Konfigurasi identitas website, kontak balai desa, logo, dan tautan sosial media resmi.
7. **`storage`**: Layanan upload dan kompresi file media ke Supabase Storage.
8. **`auth`**: Layanan login admin, validasi sesi, me-endpoint, dan logout.

### Data Flow Summary
1. **Pendaftaran UMKM Publik**:
   * Pengguna publik mengirimkan data form registrasi via `POST /api/public/umkm/register`.
   * Skema divalidasi oleh Zod (`registerUmkmSchema`).
   * Service menyimpan data ke tabel `umkm` dengan status awal `PENDING`.
2. **Review & Kurasi oleh Admin**:
   * Admin memeriksa daftar pengajuan melalui `GET /api/admin/submissions`.
   * Admin menyetujui (`status: APPROVED`) atau menolak (`status: REJECTED`) disertai catatan perbaikan.
   * Sistem otomatis membuat template pesan notifikasi WhatsApp untuk pelaku usaha.
3. **Penyajian Data Publik Ter-cache**:
   * Pengunjung mengakses direktori publik (`/api/public/umkm`, `/api/public/profil`, dll).
   * Vercel Edge CDN mengembalikan respons tercepat melalui header `s-maxage` tanpa membebani database PostgreSQL.

---

## ⚙️ [INSTALLATION]

### 1. Clone Repo
```bash
git clone https://github.com/pemdes-pringgodani/web-desa.git
cd web-desa
```

### 2. Install Dependencies
Pastikan Node.js (v18.x atau v20.x+) sudah terpasang di komputer Anda:
```bash
npm install
```

### 3. Env Setup
Salin berkas template environment:
```bash
cp .env.example .env
```
Isi konfigurasi kredensial database Supabase dan auth (lihat bagian [ENV VARIABLES]).

### 4. Database Setup & Seeding
Sinkronkan skema Prisma ke database dan jalankan seeding data awal desa:
```bash
npx prisma db push
node prisma/seed.mjs
```

### 5. Run Dev Command
Jalankan server backend lokal:
```bash
npm run dev
```
Backend akan aktif di `http://localhost:3000`. Dokumentasi OpenAPI Swagger dapat diakses di `http://localhost:3000/docs`.

---

## 🔑 [ENV VARIABLES]

Aplikasi membutuhkan environment variables berikut:

| Nama Variabel | Penjelasan Singkat | Contoh Nilai |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string PostgreSQL Supabase (Pooler) | `postgresql://postgres.xxx:pass@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `PORT` | Port server lokal (default: 3000) | `3000` |
| `NODE_ENV` | Mode lingkungan aplikasi | `development` / `production` |
| `FRONTEND_URL` | Origin domain frontend yang diizinkan CORS | `http://localhost:3001` / `https://desa.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Key Supabase | `eyJhbGciOiJIUzI1NiIsIn...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key Supabase (Admin backend) | `eyJhbGciOiJIUzI1NiIsIn...` |
| `SUPABASE_STORAGE_BUCKET_UMKM` | Nama bucket storage untuk UMKM | `umkm` |
| `SUPABASE_STORAGE_BUCKET_NEWS` | Nama bucket storage untuk Berita | `news` |
| `SUPABASE_STORAGE_BUCKET_PROFILE` | Nama bucket storage untuk Profil Desa | `village-profile` |

---

## 🏃 [RUN COMMANDS]

* **Menjalankan Mode Development**:
  ```bash
  npm run dev
  ```
* **Membangun Production Build**:
  ```bash
  npm run build
  ```
* **Menjalankan Production Server**:
  ```bash
  npm start
  ```
* **Sinkronisasi Skema Prisma ke Database**:
  ```bash
  npx prisma db push
  ```
* **Menjalankan Seeding Data Awal**:
  ```bash
  node prisma/seed.mjs
  ```
* **Menjalankan TypeScript Typecheck**:
  ```bash
  npx tsc --noEmit
  ```

---

## 🌐 [API]

* **Base URL**: `http://localhost:3000/api`
* **Swagger Documentation UI**: `http://localhost:3000/docs`
* **Auth Method**: `Authorization: Bearer <ACCESS_TOKEN>` & Supabase Auth Cookies

### Main Endpoints Summary

#### 🔑 Authentication (`/api/auth`)
* `POST /api/auth/login` : Autentikasi admin, menghasilkan sesi dan access token.
* `GET /api/auth/me` : Memeriksa profil dan hak akses admin yang sedang aktif.
* `POST /api/auth/logout` : Menghapus sesi autentikasi admin.

#### 🏪 Direktori UMKM Publik (`/api/public/umkm`)
* `GET /api/public/umkm` : Mengambil daftar UMKM terbit (*pagination, filter kategori, search*).
* `GET /api/public/umkm/[slug]` : Mengambil detail lengkap UMKM, galeri, produk, dan lokasi maps.
* `GET /api/public/umkm/categories` : Mengambil daftar kategori UMKM yang tersedia.
* `POST /api/public/umkm/register` : Mendaftarkan pengajuan UMKM baru oleh warga.

#### 🛒 Produk UMKM Publik (`/api/public/products`)
* `GET /api/public/products` : Mengambil katalog produk unggulan desa (*filter harga, kategori*).
* `GET /api/public/products/[id]` : Melihat detail produk beserta info kontak pedagang.

#### 📰 Berita & Galeri Publik (`/api/public/news`)
* `GET /api/public/news` : Mengambil artikel berita dan album galeri terbit.
* `GET /api/public/news/[slug]` : Membaca detail berita, blocks isi, atau galeri foto.
* `GET /api/public/news/categories` : Mengambil daftar kategori berita.
* `POST /api/public/news/register` : Mengajukan berita baru dari masyarakat.

#### 🗺️ Peta & Geospasial Publik (`/api/public/maps`)
* `GET /api/public/maps` : Mengambil semua titik lokasi terverifikasi beserta koordinatnya.
* `GET /api/public/maps/categories` : Mengambil kategori penanda peta.
* `GET /api/public/maps/location` : Mengambil data lokasi berdasarkan parameter pencarian.

#### 🏛️ Profil Desa & Identitas (`/api/public/profil` & `/api/public/settings`)
* `GET /api/public/profil` : Mengambil data profil desa, sambutan kepala desa, aparatur, dan statistik.
* `GET /api/public/settings` : Mengambil konfigurasi identitas website, logo, dan sosial media.

#### ⚙️ Admin Management (`/api/admin/*`) `[PROTECTED]`
* `GET /api/admin/submissions` : Mengambil semua pengajuan UMKM dan Berita yang berstatus pending.
* `PATCH /api/admin/umkm/[id]/status` : Menyetujui atau menolak pengajuan UMKM.
* `PATCH /api/admin/news/[id]/status` : Menyetujui atau menolak pengajuan Berita.
* `GET|POST|PUT|DELETE /api/admin/umkm` : CRUD penuh seluruh data UMKM dan produk.
* `GET|POST|PUT|DELETE /api/admin/news` : CRUD penuh artikel berita dan galeri foto.
* `PUT /api/admin/profil` : Memperbarui data profil desa dan aparatur pemerintah.
* `PUT /api/admin/settings` : Memperbarui pengaturan website desa.
* `POST /api/uploads` : Mengunggah berkas gambar ke cloud storage.

---

## 📁 [PROJECT STRUCTURE]

Berikut adalah struktur direktori utama pada repositori `web-desa`:

```
web-desa/
├── prisma/
│   ├── schema.prisma                  # Skema database PostgreSQL (18 model relasi)
│   └── seed.mjs                       # Database seeder resmi
├── src/
│   ├── app/
│   │   ├── api/                       # Next.js Route Handlers (REST Endpoints)
│   │   │   ├── admin/                 # Endpoint terproteksi khusus Admin
│   │   │   ├── auth/                  # Endpoint otentikasi login/me/logout
│   │   │   ├── docs/                  # Endpoint OpenAPI spec & Swagger
│   │   │   ├── public/                # Endpoint data publik (UMKM, Berita, Maps, Profil)
│   │   │   └── uploads/               # Endpoint upload file media
│   │   ├── docs/                      # Halaman UI Swagger Documentation
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── modules/                       # Domain Modules (Clean Architecture)
│   │   ├── auth/                      # Layanan autentikasi & session
│   │   ├── maps/                      # Service & repository peta desa
│   │   ├── news/                      # Service, repository & skema Zod berita
│   │   ├── products/                  # Service, repository & skema produk
│   │   ├── profile/                   # Service & repository profil & aparatur
│   │   ├── settings/                  # Service & repository setting website
│   │   ├── storage/                   # Service upload file ke Supabase Storage
│   │   └── umkm/                      # Service, repository & skema Zod UMKM
│   ├── proxy.ts                       # Middleware keamanan CORS & routing proxy
│   └── shared/                        # Komponen utilitas bersama
│       ├── auth/                      # Helper requireAdmin() & token verify
│       ├── db/                        # PrismaClient & Pool singleton (client.ts)
│       ├── errors/                    # Custom AppError & Exception Handler
│       └── utils/                     # Response formatter, slug, & helper WhatsApp
├── .env.example                       # Contoh template environment variables
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # Konfigurasi TypeScript
└── README.md                          # Dokumentasi resmi proyek
```

---

## 📝 [NOTES / DECISIONS]

* **Serverless Connection Pooling**: Menggunakan `@prisma/adapter-pg` dengan `pg.Pool` yang disingletonkan pada `globalThis.pool` dengan batas `max: 2` koneksi per lambda container di production. Hal ini mencegah *connection pool exhaustion* pada Supabase.
* **Vercel Edge Network Caching**: Menggunakan header `Cache-Control: public, s-maxage=120, stale-while-revalidate=300` pada seluruh endpoint publik agar respons disajikan instan dari Edge CDN (< 20ms) tanpa membebani database.
* **Single Source of Truth Maps URL**: Standarisasi field tunggal `maps_url` (`mapsUrl`) di seluruh database, repository, dan skema Zod untuk menjamin integritas navigasi lokasi tanpa fallback koordinat yang menyesatkan.

---

## 🗺️ [ROADMAP]
- [ ] Integrasi analitik kunjungan profil UMKM dan klik navigasi lokasi.
- [ ] Notifikasi otomatis via WhatsApp Gateway API / Webhook saat status pengajuan warga diverifikasi.
- [ ] Fitur export data laporan statistik UMKM desa ke format PDF / Excel.

---

## 📄 [LICENSE]
Proyek ini bersifat **Private & Proprietary** khusus untuk Pemerintah Desa Pringgodani. Hak cipta dilindungi undang-undang. Dilarang menggandakan, mendistribusikan, memodifikasi, atau mempublikasikan kode sumber ini tanpa izin tertulis dari pemilik proyek.
