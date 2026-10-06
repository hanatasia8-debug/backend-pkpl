# 03. Spesifikasi REST API — Web Desa Pringgodani

Dokumen ini memuat daftar lengkap *endpoint* REST API, parameter permintaan (*request parameters*), struktur payload, format respons, dan kode galat (*error codes*).

---

## 1. Konvensi Dasar API

* **Base URL Produksi**: `https://api.pringgodani.desa.id/api` (atau via reverse-proxy Next.js `/api`)
* **Format Data**: JSON (`Content-Type: application/json`)
* **Header Autentikasi (Admin)**: `Authorization: Bearer <Supabase_JWT_Token>`

### Format Respons Berhasil
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Format Respons Gagal
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Pesan deskripsi kesalahan",
    "details": []
  }
}
```

---

## 2. Endpoint Publik (*Public API*)

*Semua endpoint publik dapat diakses tanpa token autentikasi.*

### A. Berita & Liputan Warga

| Metode | Endpoint | Deskripsi | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/news` | Mengambil daftar berita terbit | `page`, `limit`, `search`, `category`, `type` |
| `GET` | `/api/public/news/:slug` | Mengambil rincian artikel berita berdasarkan slug | — |
| `GET` | `/api/public/news/categories`| Mengambil daftar kategori berita publik | `all` (opsional: `true`/`false`) |
| `POST` | `/api/public/news/register` | Mengirimkan pengajuan artikel berita dari warga | Body JSON: `title`, `categoryId`, `authorName`, `phone`, `coverUrl`, `blocks`, dll |

### B. UMKM & Produk Unggulan

| Metode | Endpoint | Deskripsi | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/umkm` | Mengambil katalog UMKM publik yang disetujui | `page`, `limit`, `search`, `category` |
| `GET` | `/api/public/umkm/:slug` | Mengambil detail profil UMKM, galeri, & produk | — |
| `GET` | `/api/public/umkm/categories`| Mengambil daftar kategori UMKM publik | `all` (opsional: `true`/`false`) |
| `POST` | `/api/public/umkm/register` | Mendaftarkan usaha UMKM mandiri oleh warga | Body JSON: `name`, `ownerName`, `phone`, `address`, `categoryId`, `products`, dll |
| `GET` | `/api/public/products` | Mengambil daftar katalog seluruh produk UMKM | `page`, `limit`, `search`, `category` |
| `GET` | `/api/public/products/:id` | Mengambil detail satu produk komoditas | — |

### C. Peta Interaktif & Titik Geospasial

| Metode | Endpoint | Deskripsi | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/maps/locations` | Mengambil seluruh titik pin koordinat UMKM & fasilitas | `category`, `search` |
| `GET` | `/api/public/maps/categories`| Mengambil daftar kategori layer peta | — |

### D. Profil Desa, Statistik, & Pengaturan

| Metode | Endpoint | Deskripsi | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/profil` | Mengambil profil desa, visi misi, sejarah, sambutan kades | — |
| `GET` | `/api/public/officials` | Mengambil daftar struktur aparatur perangkat desa | — |
| `GET` | `/api/public/banners` | Mengambil banner gambar aktif untuk slider beranda | — |
| `GET` | `/api/public/settings` | Mengambil identitas web, logo, favicon, & link sosmed | — |
| `GET` | `/api/public/search` | Pencarian global lintas berita, UMKM, dan produk | `q` (kata kunci pencarian) |
| `GET` | `/api/public/submissions/:id`| Memeriksa status tiket pengajuan UMKM/berita warga | — |

---

## 3. Endpoint Administratif (*Admin API*)

*Semua endpoint administratif mewajibkan autentikasi Role Admin via Header `Authorization` atau Cookie Supabase.*

### A. Autentikasi Admin
* `POST /api/auth/login`: Masuk sebagai admin menggunakan email & password.
* `POST /api/auth/logout`: Menghapus sesi login admin.
* `GET /api/auth/session`: Memeriksa validitas sesi login admin yang sedang aktif.

### B. Manajemen Berita Admin
* `GET /api/admin/news`: Mengambil seluruh daftar berita (status `PUBLISHED`, `DRAFT`, `PENDING`, `REJECTED`).
* `POST /api/admin/news`: Membuat dan mempublikasikan berita baru langsung oleh admin.
* `GET /api/admin/news/:id`: Mengambil rincian lengkap data berita untuk formulir editor.
* `PUT /api/admin/news/:id`: Memperbarui data berita, kategori, atau blok konten artikel.
* `DELETE /api/admin/news/:id`: Menghapus berita secara permanen dari database.
* `GET /api/admin/news/categories`: Mengambil seluruh master kategori berita (termasuk tanpa artikel).
* `POST /api/admin/news/categories`: Menambahkan master kategori berita baru.

### C. Manajemen UMKM & Titik Peta Admin
* `GET /api/admin/umkm`: Mengambil daftar seluruh UMKM desa dengan berbagai status kurasi.
* `POST /api/admin/umkm`: Mendaftarkan dan mempublikasikan profil UMKM baru langsung oleh admin.
* `GET /api/admin/umkm/:id`: Mengambil rincian UMKM lengkap dengan galeri foto & produk untuk editor.
* `PUT /api/admin/umkm/:id`: Memperbarui profil UMKM, kategori, koordinat, galeri, dan produk.
* `DELETE /api/admin/umkm/:id`: Menghapus data profil UMKM secara permanen.
* `GET /api/admin/umkm/categories`: Mengambil seluruh master kategori usaha UMKM.
* `POST /api/admin/umkm/categories`: Menambahkan master kategori UMKM baru.
* `PUT /api/admin/maps/:id`: Memperbarui khusus titik koordinat geospasial (`latitude`, `longitude`, `mapsUrl`) dan alamat UMKM.

### D. Kurasi & Verifikasi Pengajuan Warga
* `GET /api/admin/submissions`: Mengambil daftar antrean pengajuan pendaftaran UMKM & berita dari warga.
* `PATCH /api/admin/submissions/:id/approve`: Menyetujui pengajuan warga sehingga langsung terbit di website publik.
* `PATCH /api/admin/submissions/:id/reject`: Menolak pengajuan warga dengan menyertakan pesan catatan revisi (`rejectionReason`).

### E. Media Upload & Utilitas Sistem
* `POST /api/uploads?category=umkm|news|profile|banners`: Mengunggah berkas gambar (`multipart/form-data`) ke Supabase Storage. Mengembalikan URL CDN publik.
* `POST /api/admin/indexing/google-request`: Mengirimkan permintaan pengindeksan (*Indexing API*) URL halaman ke Google Search Console.

---

## 4. Matriks Kode Status HTTP

| HTTP Code | Error Code | Arti / Penjelasan |
| :--- | :--- | :--- |
| `200 OK` | — | Permintaan berhasil diproses. |
| `201 Created` | — | Data baru berhasil dibuat ke database. |
| `400 Bad Request` | `VALIDATION_ERROR` | Format payload tidak sesuai skema validasi Zod. |
| `401 Unauthorized`| `UNAUTHORIZED` | Token autentikasi tidak ditemukan atau tidak valid. |
| `403 Forbidden` | `FORBIDDEN` | Akun pengguna tidak memiliki izin Role Admin. |
| `404 Not Found` | `NOT_FOUND` | Data dengan ID/slug yang diminta tidak ditemukan. |
| `409 Conflict` | `DUPLICATE_SLUG` | Slug URL atau data unik sudah digunakan oleh entitas lain. |
| `500 Internal Error`| `INTERNAL_ERROR` | Terjadi kesalahan tidak terduga pada server/database. |
