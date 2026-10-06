# Dokumentasi Teknis Backend — Web Desa Pringgodani

Selamat datang di repositori dokumentasi teknis resmi untuk **Backend REST API Website Desa Pringgodani**. Dokumen ini disusun secara rinci dan terstruktur untuk membantu pengembang (*developer*), *maintainer*, dan tim teknis dalam memahami arsitektur, skema basis data, spesifikasi API, serta prosedur operasional sistem.

---

## 🧭 Daftar Isi Dokumentasi

| Dokumen | Deskripsi Topik |
| :--- | :--- |
| [**01. Arsitektur Backend**](./01-backend-architecture.md) | Pola *Modular Clean Architecture*, Route Handlers, Service Layer, Repository Layer, Validasi Zod, dan Otorisasi Keamanan RBAC. |
| [**02. Basis Data & Prisma ORM**](./02-database-and-prisma.md) | Skema PostgreSQL, Diagram Relasi Entitas (ERD Mermaid), Model Prisma, Siklus Hidup Status Data, Migrasi, dan *Database Seeding*. |
| [**03. Spesifikasi REST API**](./03-api-reference.md) | Referensi lengkap seluruh *endpoint* REST API Publik & Admin (Request/Response, Parameter, Header Auth, dan Error Codes). |
| [**04. Panduan Setup Lokal & Environment**](./04-local-setup-and-env.md) | Prasyarat, instalasi dependensi, panduan konfigurasi variabel lingkungan (`.env`), menjalankan server dev, dan *troubleshooting*. |
| [**05. Panduan Deployment & Supabase**](./05-deployment-and-supabase.md) | Deployment ke Vercel Serverless, konfigurasi Supabase Cloud PostgreSQL (Connection Pooling), Supabase Storage Buckets, dan *maintenance*. |

---

## 📌 Ringkasan Teknis Singkat

* **Teknologi Utama**: Next.js 16 (App Router Route Handlers), React 19, TypeScript 5.
* **ORM & Basis Data**: Prisma ORM 7.9 dengan `@prisma/adapter-pg` dan Supabase PostgreSQL.
* **Autentikasi & Keamanan**: Supabase Auth (JWT Bearer Token / HTTP Cookie), Middleware Role Admin (`requireAdmin`), Skema Validasi Zod.
* **Media & Penyimpanan**: Supabase Cloud Storage dengan kategori terisolasi (`umkm`, `news`, `profile`, `banners`).
* **Dokumentasi Interaktif**: Swagger UI terintegrasi pada rute `/docs` dan spesifikasi OpenAPI 3.0 pada `/api/docs/spec`.

---

## 🚀 Alur Kerja Pengembang (*Quick Links*)

1. Untuk memulai instalasi di komputer lokal, ikuti [04. Panduan Setup Lokal & Environment](./04-local-setup-and-env.md).
2. Untuk melihat relasi antar tabel data desa, pelajari [02. Basis Data & Prisma ORM](./02-database-and-prisma.md).
3. Untuk mengintegrasikan frontend dengan backend, lihat [03. Spesifikasi REST API](./03-api-reference.md).
