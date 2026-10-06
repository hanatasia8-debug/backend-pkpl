export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Web Desa Serverless Backend API",
    version: "1.0.0",
    description: "Dokumentasi OpenAPI 3.0 resmi untuk layanan Backend Serverless Web Desa (Berita & Artikel, UMKM, Maps Geospasial, Potensi Desa, Profil & Statistik Desa, Banner, Admin Panel & Submissions, Pengaturan, Autentikasi, dan Storage).",
    contact: {
      name: "Tim Pengembang Web Desa",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development Server",
    },
  ],
  tags: [
    { name: "System", description: "Endpoint kesehatan, pengaturan website, status sistem, dan banner" },
    { name: "Auth", description: "Layanan autentikasi pengguna (Register, Login, Logout, Session Me)" },
    { name: "Admin", description: "Layanan manajemen admin (Persetujuan Berita & UMKM, CRUD Peta Geospasial, CRUD Berita/UMKM, & Settings)" },
    { name: "Profile", description: "Profil desa, visi misi, sejarah, perangkat desa, dan statistik publik" },
    { name: "News", description: "Pengelolaan publikasi berita, artikel, & galeri kegiatan desa" },
    { name: "Officials", description: "Pengelolaan dan profil perangkat/pemerintah desa" },
    { name: "UMKM", description: "Pengelolaan direktori dan pendaftaran UMKM" },
    { name: "Maps", description: "Data SIG dan lokasi geospasial peta desa" },
    { name: "Potentials", description: "Katalog potensi lokal desa" },
    { name: "Storage", description: "Pengunggahan berkas media" },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["System"],
        operationId: "getHealthStatus",
        summary: "Cek kesehatan API Serverless",
        description: "Mengembalikan status server dan koneksi database Prisma.",
        responses: {
          "200": { description: "API serverless berjalan dengan normal" },
        },
      },
    },
    "/api/public/settings": {
      get: {
        tags: ["System"],
        operationId: "getPublicSettings",
        summary: "Pengaturan Website & Kontak Desa",
        description: "Mengambil konfigurasi umum situs desa seperti nama website, logo, nomor kontak, email, alamat, dan media sosial.",
        responses: {
          "200": { description: "Pengaturan website berhasil diambil" },
        },
      },
    },
    "/api/public/banner": {
      get: {
        tags: ["System"],
        operationId: "getActiveBanners",
        summary: "Daftar Banner Aktif (Hero Carousel)",
        description: "Mengambil daftar slide banner aktif yang bersumber dari berita unggulan, potensi, atau pengaturan desa.",
        responses: {
          "200": { description: "Daftar banner aktif berhasil diambil" },
        },
      },
    },
    "/api/public/profil": {
      get: {
        tags: ["Profile"],
        operationId: "getVillageProfileWithStats",
        summary: "Profil Desa, Visi, Misi, Sejarah, Perangkat Desa & Statistik",
        description: "Mengambil profil utuh desa mencakup sambutan Kepala Desa, Visi & Misi, Sejarah Desa, daftar Perangkat Desa, dan statistik desa.",
        responses: {
          "200": { description: "Profil dan statistik desa berhasil diambil" },
        },
      },
    },
    "/api/admin/submissions": {
      get: {
        tags: ["Admin"],
        operationId: "getAdminPendingSubmissions",
        summary: "Daftar Antrean Pengajuan Warga (Berita & UMKM PENDING)",
        description: "Mengambil seluruh antrean pendaftaran berita dan UMKM dari warga yang berstatus PENDING untuk ditinjau admin.",
        responses: {
          "200": { description: "Daftar pengajuan PENDING berhasil diambil" },
        },
      },
    },
    "/api/admin/news/{id}/status": {
      patch: {
        tags: ["Admin"],
        operationId: "updateAdminNewsStatus",
        summary: "Persetujuan / Perubahan Status Berita (Approve/Reject)",
        description: "Mengubah status berita warga menjadi PUBLISHED atau REJECTED.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID berita",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", example: "PUBLISHED", enum: ["PUBLISHED", "REJECTED", "DRAFT", "PENDING"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Status berita berhasil diperbarui" },
        },
      },
    },
    "/api/admin/umkm/{id}/status": {
      patch: {
        tags: ["Admin"],
        operationId: "updateAdminUmkmStatus",
        summary: "Persetujuan / Perubahan Status UMKM (Approve/Reject)",
        description: "Mengubah status UMKM warga menjadi APPROVED atau REJECTED.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID UMKM",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", example: "APPROVED", enum: ["APPROVED", "REJECTED", "PENDING"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Status UMKM berhasil diperbarui" },
        },
      },
    },
    "/api/admin/maps/locations": {
      get: {
        tags: ["Admin"],
        operationId: "getAdminMapLocations",
        summary: "Daftar Seluruh Titik Lokasi Peta (Admin)",
        responses: {
          "200": { description: "Daftar lokasi peta berhasil diambil" },
        },
      },
      post: {
        tags: ["Admin"],
        operationId: "createAdminMapLocation",
        summary: "Tambah Titik Lokasi Peta Baru (Admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "mapCategoryId", "latitude", "longitude"],
                properties: {
                  name: { type: "string", example: "Balai Desa Pringgodani" },
                  mapCategoryId: { type: "string", example: "1" },
                  shortDescription: { type: "string", example: "Pusat pelayanan masyarakat desa." },
                  address: { type: "string", example: "Jl. Utama Desa No. 1" },
                  latitude: { type: "number", example: -7.981234 },
                  longitude: { type: "number", example: 112.631234 },
                  imageUrl: { type: "string", example: "https://example.com/balai-desa.jpg" },
                  googleMapsUrl: { type: "string", example: "https://maps.google.com/?q=-7.981234,112.631234" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Titik lokasi peta berhasil ditambahkan" },
        },
      },
    },
    "/api/admin/maps/locations/{id}": {
      put: {
        tags: ["Admin"],
        operationId: "updateAdminMapLocation",
        summary: "Edit Titik Lokasi & Koordinat Peta",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID titik lokasi peta",
          },
        ],
        responses: {
          "200": { description: "Titik lokasi peta diperbarui" },
        },
      },
      delete: {
        tags: ["Admin"],
        operationId: "deleteAdminMapLocation",
        summary: "Hapus Titik Lokasi Peta",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID titik lokasi peta",
          },
        ],
        responses: {
          "200": { description: "Titik lokasi peta terhapus" },
        },
      },
    },
    "/api/admin/maps/categories": {
      get: {
        tags: ["Admin"],
        operationId: "getAdminMapCategories",
        summary: "Daftar Kategori Peta Geospasial (Admin)",
        responses: {
          "200": { description: "Daftar kategori peta" },
        },
      },
      post: {
        tags: ["Admin"],
        operationId: "createAdminMapCategory",
        summary: "Tambah Kategori Peta Baru",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Fasilitas Umum" },
                  slug: { type: "string", example: "fasilitas-umum" },
                  icon: { type: "string", example: "building" },
                  color: { type: "string", example: "#10B981" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Kategori peta berhasil dibuat" },
        },
      },
    },
    "/api/admin/maps/categories/{id}": {
      put: {
        tags: ["Admin"],
        operationId: "updateAdminMapCategory",
        summary: "Edit Kategori Peta",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Kategori peta diperbarui" },
        },
      },
      delete: {
        tags: ["Admin"],
        operationId: "deleteAdminMapCategory",
        summary: "Hapus Kategori Peta",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Kategori peta terhapus" },
        },
      },
    },
    "/api/admin/news": {
      get: {
        tags: ["Admin"],
        operationId: "getAdminNewsList",
        summary: "Daftar Berita Seluruh Status (Admin)",
        responses: {
          "200": { description: "Daftar berita admin berhasil diambil" },
        },
      },
      post: {
        tags: ["Admin"],
        operationId: "createAdminNews",
        summary: "Tambah & Terbitkan Berita Baru oleh Admin",
        responses: {
          "201": { description: "Berita berhasil diterbitkan" },
        },
      },
    },
    "/api/admin/news/{id}": {
      delete: {
        tags: ["Admin"],
        operationId: "deleteAdminNews",
        summary: "Hapus Berita (Admin)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Berita berhasil dihapus" },
        },
      },
    },
    "/api/admin/umkm": {
      get: {
        tags: ["Admin"],
        operationId: "getAdminUmkmList",
        summary: "Daftar UMKM Seluruh Status (Admin)",
        responses: {
          "200": { description: "Daftar UMKM admin berhasil diambil" },
        },
      },
      post: {
        tags: ["Admin"],
        operationId: "createAdminUmkm",
        summary: "Tambah UMKM Baru oleh Admin",
        responses: {
          "201": { description: "UMKM berhasil ditambahkan" },
        },
      },
    },
    "/api/admin/umkm/{id}": {
      delete: {
        tags: ["Admin"],
        operationId: "deleteAdminUmkm",
        summary: "Hapus Data UMKM (Admin)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "UMKM berhasil dihapus" },
        },
      },
    },
    "/api/admin/settings": {
      put: {
        tags: ["Admin"],
        operationId: "updateAdminSettings",
        summary: "Memperbarui Pengaturan Website & Kontak Desa",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  websiteName: { type: "string", example: "Desa Pringgodani" },
                  logoUrl: { type: "string", example: "/logo.png" },
                  email: { type: "string", example: "info@pringgodani.desa.id" },
                  phone: { type: "string", example: "081234567890" },
                  address: { type: "string", example: "Jl. Raya Desa Pringgodani No. 1" },
                  facebook: { type: "string" },
                  instagram: { type: "string" },
                  youtube: { type: "string" },
                  tiktok: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Pengaturan website berhasil diperbarui" },
        },
      },
    },
    "/api/public/news": {
      get: {
        tags: ["News"],
        operationId: "getAllNewsList",
        summary: "Daftar Berita & Artikel Publik (Paginated & Filter)",
        description: "Mengambil daftar berita desa publik yang telah dipublikasikan dengan pagination, pencarian, dan penyaringan.",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 6 },
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "type",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "exclude",
            in: "query",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Daftar berita berhasil diambil" },
        },
      },
      post: {
        tags: ["News"],
        operationId: "createNewPost",
        summary: "Tambah Publikasi Berita / Artikel / Galeri Baru",
        responses: {
          "201": { description: "Berita berhasil dipublikasikan" },
        },
      },
    },
    "/api/public/news/register": {
      post: {
        tags: ["News"],
        operationId: "registerNewsSubmission",
        summary: "Pendaftaran Publikasi Berita oleh Warga",
        responses: {
          "201": { description: "Pengajuan berita berhasil disimpan" },
        },
      },
    },
    "/api/public/news/categories": {
      get: {
        tags: ["News"],
        operationId: "getNewsCategoriesList",
        summary: "Daftar Kategori Berita",
        responses: {
          "200": { description: "Daftar kategori berita berhasil diambil" },
        },
      },
    },
    "/api/public/news/types": {
      get: {
        tags: ["News"],
        operationId: "getNewsTypesList",
        summary: "Daftar Tipe Berita (Artikel, Galeri, dll)",
        responses: {
          "200": { description: "Daftar tipe berita berhasil diambil" },
        },
      },
    },
    "/api/public/news/{slug}": {
      get: {
        tags: ["News"],
        operationId: "getNewsBySlug",
        summary: "Detail Berita berdasarkan Slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Detail berita ditemukan" },
          "404": { description: "Berita tidak ditemukan" },
        },
      },
    },
    "/api/public/officials": {
      get: {
        tags: ["Officials"],
        operationId: "getVillageOfficials",
        summary: "Daftar Perangkat Desa",
        responses: {
          "200": { description: "Daftar perangkat desa berhasil diambil" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        operationId: "registerUserAccount",
        summary: "Registrasi Akun Pengguna Baru",
        responses: {
          "201": { description: "Akun pengguna berhasil dibuat" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        operationId: "loginUserAccount",
        summary: "Login Pengguna",
        responses: {
          "200": { description: "Login berhasil" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        operationId: "logoutUserSession",
        summary: "Logout / Keluar Sesi",
        responses: {
          "200": { description: "Berhasil keluar dari sesi" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        operationId: "getCurrentUserProfile",
        summary: "Ambil Profil Pengguna Saat Ini",
        responses: {
          "200": { description: "Profil pengguna ditemukan" },
        },
      },
    },
    "/api/public/umkm": {
      get: {
        tags: ["UMKM"],
        operationId: "getUmkmList",
        summary: "Daftar UMKM Publik (Paginated & Filter)",
        responses: {
          "200": { description: "Daftar UMKM berhasil diambil" },
        },
      },
    },
    "/api/public/umkm/categories": {
      get: {
        tags: ["UMKM"],
        operationId: "getUmkmCategoriesList",
        summary: "Daftar Kategori UMKM",
        responses: {
          "200": { description: "Daftar kategori berhasil diambil" },
        },
      },
    },
    "/api/public/umkm/register": {
      post: {
        tags: ["UMKM"],
        operationId: "registerNewUmkm",
        summary: "Pendaftaran UMKM Baru",
        responses: {
          "201": { description: "Pendaftaran UMKM berhasil diajukan" },
        },
      },
    },
    "/api/public/umkm/{slug}": {
      get: {
        tags: ["UMKM"],
        operationId: "getUmkmDetailBySlug",
        summary: "Detail UMKM berdasarkan Slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Detail UMKM ditemukan" },
        },
      },
    },
    "/api/public/maps/categories": {
      get: {
        tags: ["Maps"],
        operationId: "getMapCategoriesList",
        summary: "Daftar Kategori Peta Geospasial",
        responses: {
          "200": { description: "Daftar kategori peta" },
        },
      },
    },
    "/api/public/maps/locations": {
      get: {
        tags: ["Maps"],
        operationId: "getMapLocationsList",
        summary: "Daftar Titik Lokasi Peta Desa",
        responses: {
          "200": { description: "Daftar lokasi peta" },
        },
      },
    },
    "/api/public/potentials": {
      get: {
        tags: ["Potentials"],
        operationId: "getVillagePotentialsList",
        summary: "Daftar Potensi Lokal Desa",
        responses: {
          "200": { description: "Daftar potensi desa" },
        },
      },
    },
    "/api/public/potentials/{slug}": {
      get: {
        tags: ["Potentials"],
        operationId: "getPotentialDetailBySlug",
        summary: "Detail Potensi Desa berdasarkan Slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Detail potensi desa ditemukan" },
        },
      },
    },
    "/api/uploads": {
      post: {
        tags: ["Storage"],
        operationId: "uploadMediaFile",
        summary: "Upload Gambar ke Storage",
        responses: {
          "201": { description: "File berhasil diunggah" },
        },
      },
    },
  },
};
