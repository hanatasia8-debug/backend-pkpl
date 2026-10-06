# 04. Panduan Setup Lokal & Environment — Web Desa Pringgodani

Dokumen ini memandu pengembang untuk menyiapkan lingkungan pengembangan lokal (*Local Development Environment*), mengonfigurasi berkas `.env`, menjalankan migrasi Prisma, dan menyelesaikan kendala umum (*troubleshooting*).

---

## 1. Prasyarat Sistem (*Prerequisites*)

Sebelum memulai, pastikan perangkat Anda telah terpasang:
* **Node.js**: Versi `20.x` LTS atau lebih baru.
* **Package Manager**: `npm` (bawaan Node.js) atau `pnpm`.
* **Git**: Untuk manajemen versi repositori.
* **Basis Data PostgreSQL**: Akun proyek di [Supabase Cloud](https://supabase.com) atau PostgreSQL lokal via Docker.

---

## 2. Langkah-Langkah Instalasi

### Langkah 1: Kloning & Masuk ke Folder Proyek
```bash
cd web-desa
```

### Langkah 2: Menginstal Seluruh Dependensi
```bash
npm install
```

### Langkah 3: Menyiapkan File Konfigurasi `.env`
Salin template konfigurasi `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Sesuaikan nilai-nilai variabel di dalam `.env` (lihat rincian pada Bagian 3).

### Langkah 4: Generate Prisma Client & Sinkronkan Database
```bash
# 1. Menghasilkan Prisma Client TypeScript
npx prisma generate

# 2. Sinkronkan skema ke database PostgreSQL
npx prisma db push

# 3. (Opsional) Mengisi data awal master kategori, profil desa, & sample
npx prisma db seed
```

### Langkah 5: Menjalankan Server Development
```bash
npm run dev
```
Backend API akan aktif berjalan pada port default: `http://localhost:3000`.
Dokumentasi interaktif Swagger dapat diakses di browser pada: `http://localhost:3000/docs`.

---

## 3. Rincian Variabel Lingkungan (`.env`)

| Nama Variabel | Wajib? | Deskripsi & Contoh Nilai |
| :--- | :---: | :--- |
| `DATABASE_URL` | **Ya** | URL koneksi PostgreSQL. Pada Supabase, gunakan Port `6543` (*Transaction Pooler*).<br>`postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | **Ya** | URL koneksi langsung ke PostgreSQL Port `5432` tanpa pooler (dibutuhkan Prisma CLI).<br>`postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | **Ya** | URL endpoint proyek Supabase Anda.<br>`https://xyzprojectid.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Ya** | Kunci anonim publik Supabase.<br>`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Ya** | Kunci Service Role rahasia Supabase untuk bypass RLS pada backend.<br>`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `ADMIN_SECRET_KEY` | **Ya** | Kunci rahasia internal untuk proteksi rute khusus admin. |
| `NODE_ENV` | Opsional | Nilai: `development` atau `production`. |
| `APP_URL` | Opsional | URL origin backend (default: `http://localhost:3000`). |

> [!CAUTION]
> Jangan pernah membagikan atau melakukan `git commit` pada berkas `.env` asli yang berisi password atau `SUPABASE_SERVICE_ROLE_KEY`.

---

## 4. Perintah Pengujian & Pengecekan Tipe

Untuk memastikan kode bebas dari kesalahan sebelum melakukan commit atau push:

```bash
# Memeriksa kepatuhan tipe TypeScript (harus menghasilkan exit code 0)
npx tsc --noEmit

# Memeriksa format dan aturan linting
npm run lint

# Membuka Prisma Studio GUI di browser
npx prisma studio
```

---

## 5. Panduan Pemecahan Masalah (*Troubleshooting*)

### 1. `Error: P1001: Can't reach database server at ...`
* **Penyebab**: Koneksi internet terputus, password database salah, atau Supabase project sedang dalam status *Paused*.
* **Solusi**: Periksa status proyek di Supabase Dashboard, pastikan password pada `DATABASE_URL` benar (perhatikan jika ada karakter khusus, gunakan *URL encoding*).

### 2. `Type error: Property 'xxx' does not exist on type 'PrismaClient'`
* **Penyebab**: Prisma Client belum di-generate ulang setelah `schema.prisma` diubah.
* **Solusi**: Jalankan perintah `npx prisma generate` lalu restart terminal.

### 3. `Port 3000 is already in use`
* **Penyebab**: Terdapat proses Node.js lain yang masih berjalan di port 3000.
* **Solusi**: Hentikan proses lama dengan perintah:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```
  atau jalankan backend pada port alternatif: `PORT=3005 npm run dev`.
