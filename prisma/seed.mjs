import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Database Seeding for Web Desa Pringgodani...");

  // 1. Roles & Admin User
  console.log("1/6 Seeding Roles & Admin User...");
  const adminRole = await prisma.role.upsert({
    where: { id: BigInt(1) },
    update: { name: "ADMIN", description: "Administrator Platform Desa Pringgodani" },
    create: { id: BigInt(1), name: "ADMIN", description: "Administrator Platform Desa Pringgodani" },
  });

  const userRole = await prisma.role.upsert({
    where: { id: BigInt(2) },
    update: { name: "USER", description: "Warga / Pelaku UMKM Desa" },
    create: { id: BigInt(2), name: "USER", description: "Warga / Pelaku UMKM Desa" },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@pringgodani.desa.id";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "@AdminPringgodani142";
  let adminUuid = "00000000-0000-0000-0000-000000000001";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersList?.users?.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());

      if (existingUser) {
        adminUuid = existingUser.id;
        await supabaseAdmin.auth.admin.updateUserById(adminUuid, {
          password: adminPassword,
          email_confirm: true,
          user_metadata: { name: "Admin Desa Pringgodani" },
        });
        console.log(`   ✅ Synced Supabase Auth user: ${adminEmail}`);
      } else {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { name: "Admin Desa Pringgodani" },
        });
        if (!createError && newUser?.user) {
          adminUuid = newUser.user.id;
          console.log(`   ✅ Created Supabase Auth user: ${adminEmail}`);
        } else if (createError) {
          console.warn(`   ⚠️ Supabase Auth createUser: ${createError.message}`);
        }
      }
    } catch (err) {
      console.warn("   ⚠️ Supabase Auth admin API warning:", err.message);
    }
  }

  await prisma.user.upsert({
    where: { id: adminUuid },
    update: {
      name: "Admin Desa Pringgodani",
      email: adminEmail,
      roleId: adminRole.id,
    },
    create: {
      id: adminUuid,
      name: "Admin Desa Pringgodani",
      email: adminEmail,
      roleId: adminRole.id,
    },
  });
  console.log(`   ✅ Admin Database Record Ready: ${adminEmail}`);

  // 2. Website Setting
  console.log("2/6 Seeding Website Setting...");
  await prisma.websiteSetting.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      id: BigInt(1),
      websiteName: "Desa Pringgodani",
      logoUrl: "/images/logo-desa.png",
      faviconUrl: "/images/favicon.png",
      email: "info@pringgodani.desa.id",
      phone: "081234567890",
      address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kabupaten Malang, Jawa Timur 65179",
      facebook: "https://facebook.com/desapringgodani",
      instagram: "https://instagram.com/desapringgodani",
      youtube: "https://youtube.com/@desapringgodani",
      tiktok: "https://tiktok.com/@desapringgodani",
    },
  });

  // 3. Village Profile & Officials
  console.log("3/6 Seeding Village Profile & Officials...");
  let profile = await prisma.villageProfile.findFirst();
  if (!profile) {
    profile = await prisma.villageProfile.create({
      data: {
        villageName: "Desa Pringgodani",
        headGreeting: "Selamat datang di portal resmi Desa Pringgodani. Kami berdedikasi melayani dan memajukan potensi desa bersama seluruh warga.",
        headPhoto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
        aboutText: "Desa Pringgodani merupakan kawasan asri dan produktif di Kecamatan Bantur, Kabupaten Malang, dengan potensi unggulan pertanian jeruk manis dan aneka UMKM kreatif.",
        address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kabupaten Malang",
        phone: "081234567890",
        email: "pemdes@pringgodani.desa.id",
      },
    });

    await prisma.villageOfficial.createMany({
      data: [
        {
          villageProfileId: profile.id,
          name: "Drs. H. Sugeng Riyadi",
          position: "Kepala Desa",
          photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
          email: "kades@pringgodani.desa.id",
          greeting: "Selamat datang di portal informasi resmi Desa Pringgodani.",
        },
        {
          villageProfileId: profile.id,
          name: "Siti Rahmawati, S.AP",
          position: "Sekretaris Desa",
          photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
          email: "sekdes@pringgodani.desa.id",
          greeting: "Pelayanan administrasi publik yang responsif dan transparan adalah prioritas kami.",
        },
        {
          villageProfileId: profile.id,
          name: "Bambang Kurniawan",
          position: "Kasi Pemerintahan",
          photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
          email: "pem@pringgodani.desa.id",
          greeting: "Siap melayani kebutuhan dokumen dan kependudukan warga desa.",
        },
      ],
    });
  }

  // 4. News Categories, Types & Sample News
  console.log("4/6 Seeding News Categories & Sample News...");
  const catKegiatan = await prisma.newsCategory.upsert({
    where: { slug: "kegiatan-desa" },
    update: { name: "Kegiatan Desa", description: "Liputan kegiatan kemasyarakatan, sosial, dan kebudayaan warga desa" },
    create: { name: "Kegiatan Desa", slug: "kegiatan-desa", description: "Liputan kegiatan kemasyarakatan, sosial, dan kebudayaan warga desa" },
  });

  const catPembangunan = await prisma.newsCategory.upsert({
    where: { slug: "pembangunan" },
    update: { name: "Pembangunan", description: "Informasi proyek infrastruktur dan sarana prasarana desa" },
    create: { name: "Pembangunan", slug: "pembangunan", description: "Informasi proyek infrastruktur dan sarana prasarana desa" },
  });

  const catEkonomi = await prisma.newsCategory.upsert({
    where: { slug: "ekonomi-umkm" },
    update: { name: "Ekonomi & UMKM", description: "Kabar perkembangan usaha lokal dan pemberdayaan ekonomi warga" },
    create: { name: "Ekonomi & UMKM", slug: "ekonomi-umkm", description: "Kabar perkembangan usaha lokal dan pemberdayaan ekonomi warga" },
  });

  const catPengumuman = await prisma.newsCategory.upsert({
    where: { slug: "pengumuman" },
    update: { name: "Pengumuman", description: "Pengumuman resmi dari Pemerintah Desa Pringgodani" },
    create: { name: "Pengumuman", slug: "pengumuman", description: "Pengumuman resmi dari Pemerintah Desa Pringgodani" },
  });

  const catKesehatan = await prisma.newsCategory.upsert({
    where: { slug: "kesehatan-posyandu" },
    update: { name: "Kesehatan & Posyandu", description: "Layanan posyandu, kesehatan ibu-anak, dan kebersihan desa" },
    create: { name: "Kesehatan & Posyandu", slug: "kesehatan-posyandu", description: "Layanan posyandu, kesehatan ibu-anak, dan kebersihan desa" },
  });

  const typeArtikel = await prisma.newsType.upsert({
    where: { slug: "artikel" },
    update: { name: "Artikel Berita", description: "Format publikasi tulisan berita berparagraf" },
    create: { name: "Artikel Berita", slug: "artikel", description: "Format publikasi tulisan berita berparagraf" },
  });

  const typeGaleri = await prisma.newsType.upsert({
    where: { slug: "galeri-foto" },
    update: { name: "Galeri Foto", description: "Format publikasi album dokumentasi kegiatan" },
    create: { name: "Galeri Foto", slug: "galeri-foto", description: "Format publikasi album dokumentasi kegiatan" },
  });

  const news1 = await prisma.news.upsert({
    where: { slug: "kerja-bakti-pembersihan-irigasi-desa" },
    update: {},
    create: {
      newsCategoryId: catKegiatan.id,
      newsTypeId: typeArtikel.id,
      title: "Kerja Bakti Massal Pembersihan Saluran Irigasi Desa",
      slug: "kerja-bakti-pembersihan-irigasi-desa",
      excerpt: "Ratusan warga Desa Pringgodani kompak melaksanakan kerja bakti pembersihan alur irigasi sawah menjelang musim tanam.",
      status: "PUBLISHED",
      publishedAt: new Date("2026-08-01T08:00:00Z"),
    },
  });

  const artDetail1 = await prisma.articleDetail.upsert({
    where: { newsId: news1.id },
    update: {},
    create: {
      newsId: news1.id,
    },
  });

  const existingBlocks = await prisma.articleBlock.count({ where: { articleDetailId: artDetail1.id } });
  if (existingBlocks === 0) {
    await prisma.articleBlock.createMany({
      data: [
        {
          articleDetailId: artDetail1.id,
          subHeading: "Semangat Gotong Royong Warga",
          content: "Pada Minggu pagi, ratusan warga antusias membawa cangkul dan pembersih rumput untuk merapikan alur irigasi utama desa. Kegiatan ini dipimpin langsung oleh Kepala Desa.",
          imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
          sortOrder: 1,
        },
        {
          articleDetailId: artDetail1.id,
          subHeading: "Dampak Positif bagi Pertanian Desa",
          content: "Dengan irigasi yang lancar, pasokan air menuju perkebunan dan sawah warga terjamin lancar sehingga hasil panen mendatang diperkirakan optimal.",
          imageUrl: null,
          sortOrder: 2,
        },
      ],
    });
  }

  // 5. UMKM Categories
  console.log("5/6 Seeding UMKM Categories...");
  const umkmCatKuliner = await prisma.umkmCategory.upsert({
    where: { slug: "kuliner" },
    update: { name: "Kuliner", description: "Aneka kuliner olahan makanan & minuman khas desa" },
    create: { name: "Kuliner", slug: "kuliner", description: "Aneka kuliner olahan makanan & minuman khas desa" },
  });

  const umkmCatKerajinan = await prisma.umkmCategory.upsert({
    where: { slug: "kerajinan" },
    update: { name: "Kerajinan & Seni", description: "Kerajinan tangan, batik, dan karya seni warga desa" },
    create: { name: "Kerajinan", slug: "kerajinan", description: "Kerajinan tangan, batik, dan karya seni warga desa" },
  });

  const umkmCatPertanian = await prisma.umkmCategory.upsert({
    where: { slug: "pertanian" },
    update: { name: "Pertanian & Perkebunan", description: "Hasil bumi, jeruk manis, dan produk tani desa" },
    create: { name: "Pertanian", slug: "pertanian", description: "Hasil bumi, jeruk manis, dan produk tani desa" },
  });

  const umkmCatJasa = await prisma.umkmCategory.upsert({
    where: { slug: "jasa-perdagangan" },
    update: { name: "Jasa & Perdagangan", description: "Penyedia jasa, toko kelontong, dan perdagangan lokal" },
    create: { name: "Jasa & Perdagangan", slug: "jasa-perdagangan", description: "Penyedia jasa, toko kelontong, dan perdagangan lokal" },
  });

  const umkmCatFashion = await prisma.umkmCategory.upsert({
    where: { slug: "fashion-tekstil" },
    update: { name: "Fashion & Tekstil", description: "Pakaian, konveksi, dan produk tekstil lokal" },
    create: { name: "Fashion & Tekstil", slug: "fashion-tekstil", description: "Pakaian, konveksi, dan produk tekstil lokal" },
  });

  // 6. Sample UMKMs & Products
  console.log("6/6 Seeding Sample UMKMs & Products...");
  const umkm1 = await prisma.umkm.upsert({
    where: { slug: "tempe-balado-pringgodani" },
    update: {},
    create: {
      umkmCategoryId: umkmCatKuliner.id,
      name: "Tempe Balado Pringgodani",
      slug: "tempe-balado-pringgodani",
      ownerName: "Ibu Sulastri",
      description: "Produsen keripik tempe balado renyah khas Desa Pringgodani dengan bumbu rempah alami pilihan.",
      phone: "081234567891",
      email: "tempe.balado@gmail.com",
      address: "Dusun Krajan RT 02 RW 01, Desa Pringgodani",
      coverUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      latitude: -8.2811,
      longitude: 112.5664,
      mapsUrl: "https://maps.app.goo.gl/sample-link-tempe",
      since: 2018,
      openDay: "Senin - Sabtu",
      status: "APPROVED",
      publishedAt: new Date(),
    },
  });

  const existingProducts = await prisma.product.count({ where: { umkmId: umkm1.id } });
  if (existingProducts === 0) {
    await prisma.product.createMany({
      data: [
        {
          umkmId: umkm1.id,
          name: "Keripik Tempe Balado Pedas Manis (250g)",
          description: "Keripik tempe balado gurih dengan baluran bumbu pedas manis renyah.",
          price: 15000,
          imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        },
        {
          umkmId: umkm1.id,
          name: "Keripik Tempe Original Daun Jeruk (200g)",
          description: "Renyah tempe asli dengan aroma segar daun jeruk alami.",
          price: 13000,
          imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
        },
      ],
    });
  }

  console.log("✅ Seeding Database Web Desa Pringgodani Selesai Sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
