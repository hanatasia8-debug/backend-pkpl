require("dotenv/config");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Clean Database Seeding (Master Categories Only) for LokalUMKM Pringgodani...\n");

  // 1. CLEAR EXISTING DATA (Clean wipe for fresh setup)
  console.log("🧹 1/7 Cleaning up existing records...");
  await prisma.newsProduct.deleteMany({});
  await prisma.newsUmkm.deleteMany({});
  await prisma.newsPotential.deleteMany({});
  await prisma.articleBlock.deleteMany({});
  await prisma.articleDetail.deleteMany({});
  await prisma.galleryImage.deleteMany({});
  await prisma.galleryDetail.deleteMany({});
  await prisma.news.deleteMany({});
  await prisma.newsCategory.deleteMany({});
  await prisma.newsType.deleteMany({});

  await prisma.product.deleteMany({});
  await prisma.umkmGallery.deleteMany({});
  await prisma.umkm.deleteMany({});
  await prisma.umkmCategory.deleteMany({});

  await prisma.villagePotential.deleteMany({});
  await prisma.villagePotentialCategory.deleteMany({});

  await prisma.villageOfficial.deleteMany({});
  await prisma.villageProfile.deleteMany({});
  await prisma.websiteSetting.deleteMany({});

  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  console.log("   ✅ Database cleared.\n");

  // 2. SEED ROLES
  console.log("🔑 2/7 Seeding System Roles...");
  const adminRole = await prisma.role.upsert({
    where: { id: BigInt(1) },
    update: { name: "ADMIN", description: "Administrator Platform LokalUMKM" },
    create: { id: BigInt(1), name: "ADMIN", description: "Administrator Platform LokalUMKM" },
  });

  const userRole = await prisma.role.upsert({
    where: { id: BigInt(2) },
    update: { name: "USER", description: "Pelaku UMKM / Warga Desa" },
    create: { id: BigInt(2), name: "USER", description: "Pelaku UMKM / Warga Desa" },
  });
  console.log("   ✅ Roles created: ADMIN, USER\n");

  // 3. SEED ADMIN USER
  console.log("👤 3/7 Seeding Admin User...");
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@pringgodani.desa.id";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
  let adminUuid = "00000000-0000-0000-0000-000000000001";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient: createDirectClient } = require("@supabase/supabase-js");
      const supabaseAdmin = createDirectClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersList?.users?.find((u) => u.email === adminEmail);

      if (existingUser) {
        adminUuid = existingUser.id;
        await supabaseAdmin.auth.admin.updateUserById(adminUuid, {
          password: adminPassword,
          email_confirm: true,
        });
        console.log(`   ✅ Synced Supabase Auth user: ${adminEmail}`);
      } else {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { name: "Admin LokalUMKM Pringgodani" },
        });
        if (!createError && newUser?.user) {
          adminUuid = newUser.user.id;
          console.log(`   ✅ Created Supabase Auth user: ${adminEmail}`);
        }
      }
    } catch (err) {
      console.log("   ⚠️ Supabase Auth bypass or error (using fallback UUID)");
    }
  }

  await prisma.user.upsert({
    where: { id: adminUuid },
    update: {
      name: "Admin LokalUMKM Pringgodani",
      email: adminEmail,
      roleId: adminRole.id,
    },
    create: {
      id: adminUuid,
      name: "Admin LokalUMKM Pringgodani",
      email: adminEmail,
      roleId: adminRole.id,
    },
  });
  console.log(`   ✅ Admin record ready: ${adminEmail}\n`);

  // 4. SEED WEBSITE SETTINGS & VILLAGE PROFILE
  console.log("🏛️ 4/7 Seeding Website Settings & Village Profile...");
  await prisma.websiteSetting.create({
    data: {
      websiteName: "LokalUMKM Pringgodani",
      logoUrl: "/images/logo.png",
      faviconUrl: "/images/favicon.png",
      email: "info@pringgodani.desa.id",
      phone: "081234567890",
      address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kab. Malang, Jawa Timur",
      facebook: "https://facebook.com/desapringgodani",
      instagram: "https://instagram.com/lokalumkm.pringgodani",
      youtube: "https://youtube.com/@desapringgodani",
      tiktok: "https://tiktok.com/@lokalumkm.pringgodani",
    },
  });

  const profile = await prisma.villageProfile.create({
    data: {
      villageName: "Desa Pringgodani",
      headGreeting:
        "Selamat datang di platform resmi LokalUMKM Desa Pringgodani. Inisiatif ini kami hadirkan sebagai wujud komitmen Pemerintah Desa dalam mempromosikan produk unggulan warga, mendukung daya saing UMKM lokal, dan menggerakkan roda perekonomian masyarakat secara mandiri dan berkelanjutan.",
      headPhoto: "/images/kepala-desa.jpg",
      address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kab. Malang",
      phone: "081234567890",
      email: "kontak@pringgodani.desa.id",
    },
  });

  await prisma.villageOfficial.create({
    data: {
      villageProfileId: profile.id,
      name: "Kepala Desa Pringgodani",
      position: "Kepala Desa",
      photoUrl: "/images/kepala-desa.jpg",
      email: "kades@pringgodani.desa.id",
      greeting: "Mari bersama dukung dan majukan produk lokal kebanggaan Desa Pringgodani.",
    },
  });
  console.log("   ✅ Website settings & Village Profile created.\n");

  // 5. SEED VILLAGE POTENTIAL CATEGORIES & BASE POTENTIALS
  console.log("🌾 5/7 Seeding Village Potential Categories & Base Potentials...");
  const potCatPertanian = await prisma.villagePotentialCategory.upsert({
    where: { slug: "pertanian-pangan" },
    update: { name: "Pertanian & Tanaman Pangan", description: "Lahan subur penghasil padi, jagung, dan aneka tanaman pangan berkualitas." },
    create: { name: "Pertanian & Tanaman Pangan", slug: "pertanian-pangan", description: "Lahan subur penghasil padi, jagung, dan aneka tanaman pangan berkualitas." },
  });

  const potCatPerkebunan = await prisma.villagePotentialCategory.upsert({
    where: { slug: "perkebunan-tebu" },
    update: { name: "Perkebunan & Industri Tebu", description: "Komoditas perkebunan tebu dan aneka hasil perkebunan rakyat." },
    create: { name: "Perkebunan & Industri Tebu", slug: "perkebunan-tebu", description: "Komoditas perkebunan tebu dan aneka hasil perkebunan rakyat." },
  });

  await prisma.villagePotential.create({
    data: {
      villagePotentialCategoryId: potCatPerkebunan.id,
      name: "Potensi Perkebunan Tebu Desa Pringgodani",
      slug: "potensi-perkebunan-tebu",
      summary: "Perkebunan tebu merupakan salah satu komoditas utama dan sumber mata pencaharian warga Desa Pringgodani yang menopang industri gula lokal.",
      description: "Desa Pringgodani memiliki hamparan perkebunan tebu rakyat yang luas dengan produktivitas tinggi. Potensi ini mendorong tumbuhnya berbagai usaha pengolahan gula tebu tradisional dan produk turunan yang dikelola langsung oleh kelompok tani dan UMKM desa.",
      coverUrl: "/images/potensi-tebu.jpg",
    },
  });

  await prisma.villagePotential.create({
    data: {
      villagePotentialCategoryId: potCatPertanian.id,
      name: "Potensi Pertanian Padi & Tanaman Pangan",
      slug: "potensi-pertanian-padi",
      summary: "Sektor pertanian tanaman pangan padi dan jagung di lahan subur Desa Pringgodani yang menyokong ketahanan pangan daerah.",
      description: "Pertanian tanaman pangan di Desa Pringgodani dikembangkan secara terpadu oleh para petani desa. Hasil panen padi berkualitas dan jagung menjadi modal dasar lahirnya berbagai produk olahan pangan dan camilan khas warga.",
      coverUrl: "/images/potensi-padi.jpg",
    },
  });
  console.log("   ✅ Village Potentials seeded.\n");

  // 6. SEED UMKM CATEGORIES
  console.log("🏪 6/7 Seeding UMKM Categories...");
  const umkmCategories = [
    { name: "Kuliner & Minuman Olahan", slug: "kuliner", description: "Makanan khas, aneka olahan, jajanan desa, warung makan, dan minuman lokal." },
    { name: "Kerajinan & Kriya", slug: "kerajinan", description: "Produk anyaman bambu, ukiran kayu, kerajinan tangan, dan suvenir desa." },
    { name: "Pertanian & Hasil Bumi", slug: "agribisnis", description: "Beras lokal, gula tebu, madu hutan, sayuran segar, dan hasil bumi warga." },
    { name: "Fashion & Konveksi", slug: "fashion", description: "Pakaian jadi, jasa jahit, busana muslim, dan aksesoris sandang." },
    { name: "Jasa & Layanan Warga", slug: "jasa", description: "Bengkel, pangkas rambut, jasa angkut, rental, dan layanan pertukangan." },
    { name: "Toko & Grosir", slug: "perdagangan", description: "Toko kelontong, sembako, perabot rumah tangga, dan kios warga." },
  ];

  for (const cat of umkmCategories) {
    await prisma.umkmCategory.create({
      data: cat,
    });
  }
  console.log(`   ✅ Seeded ${umkmCategories.length} UMKM Categories.\n`);

  // 7. SEED NEWS CATEGORIES & NEWS TYPES (Without Pengumuman)
  console.log("📰 7/7 Seeding News Categories & Types...");
  const newsTypes = [
    { name: "Artikel", slug: "article", description: "Format tulisan artikel dan liputan berita" },
    { name: "Galeri Foto", slug: "gallery", description: "Format dokumentasi album foto dan galeri visual" },
  ];

  for (const t of newsTypes) {
    await prisma.newsType.create({
      data: t,
    });
  }

  const newsCategories = [
    { name: "Kabar UMKM & Wirausaha", slug: "kabar-umkm", description: "Kisah inspiratif, profil pengusaha desa, dan perkembangan UMKM lokal." },
    { name: "Produk Lokal Baru", slug: "produk-lokal", description: "Peluncuran produk baru, inovasi kemasan, dan rekomendasi belanja warga." },
    { name: "Potensi & Komoditas Desa", slug: "potensi-desa", description: "Informasi perkembangan sektor perkebunan, pertanian, dan komoditas unggulan." },
    { name: "Pelatihan, Bazar & Event", slug: "event-pelatihan", description: "Jadwal bazar UMKM, pasar tumpah, pameran, serta workshop wirausaha desa." },
  ];

  for (const cat of newsCategories) {
    await prisma.newsCategory.create({
      data: cat,
    });
  }
  console.log(`   ✅ Seeded ${newsCategories.length} News Categories & ${newsTypes.length} News Types.\n`);

  console.log("🎉 Seeding Completed Successfully! All master categories are ready.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
