"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../src/shared/db/client");
async function main() {
    console.log("🌱 Starting Database Seeding with Real WordPress Data for Web Desa Pringgodani...");
    // 1. Clear Existing Data (except UMKM to preserve test products)
    console.log("🧹 Clearing old news, potentials, and profiles...");
    await client_1.prisma.articleBlock.deleteMany({});
    await client_1.prisma.articleDetail.deleteMany({});
    await client_1.prisma.galleryImage.deleteMany({});
    await client_1.prisma.galleryDetail.deleteMany({});
    await client_1.prisma.news.deleteMany({});
    await client_1.prisma.potentialArticle.deleteMany({});
    await client_1.prisma.villagePotential.deleteMany({});
    await client_1.prisma.villageStatistic.deleteMany({});
    await client_1.prisma.statisticProfile.deleteMany({});
    await client_1.prisma.historyDetail.deleteMany({});
    await client_1.prisma.villageHistory.deleteMany({});
    await client_1.prisma.villageOfficial.deleteMany({});
    await client_1.prisma.villageProfile.deleteMany({});
    await client_1.prisma.villageMission.deleteMany({});
    await client_1.prisma.villageVision.deleteMany({});
    // 2. Website Setting
    console.log("1/7 Seeding Website Setting...");
    await client_1.prisma.websiteSetting.upsert({
        where: { id: BigInt(1) },
        update: {
            websiteName: "Desa Pringgodani",
            logoUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/logo-kab-malang.png",
            faviconUrl: "/favicon.ico",
            email: "info@pringgodani.desa.id",
            phone: "081234567890",
            address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kabupaten Malang, Jawa Timur 65179",
        },
        create: {
            id: BigInt(1),
            websiteName: "Desa Pringgodani",
            logoUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/logo-kab-malang.png",
            faviconUrl: "/favicon.ico",
            email: "info@pringgodani.desa.id",
            phone: "081234567890",
            address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kabupaten Malang, Jawa Timur 65179",
            facebook: "https://facebook.com/desapringgodani",
            instagram: "https://instagram.com/desapringgodani",
            youtube: "https://youtube.com/@desapringgodani",
            tiktok: "https://tiktok.com/@desapringgodani",
        },
    });
    // 3. Village Vision & 11 Missions from WordPress
    console.log("2/7 Seeding Real Visi & 11 Misi Desa...");
    const vision = await client_1.prisma.villageVision.create({
        data: {
            vision: "TERWUJUDNYA MASYARAKAT DAN APARATUR DESA YANG MUMPUNI DALAM MEWUJUDKAN KESEJAHTERAAN",
        },
    });
    await client_1.prisma.villageMission.createMany({
        data: [
            { villageVisionId: vision.id, mission: "Mewujudkan dan mengembangkan kegiatan keagamaan untuk menambah keimanan dan ketaqwaan kepada Tuhan Yang Maha Esa.", sortOrder: 1 },
            { villageVisionId: vision.id, mission: "Meningkatkan Pelayanan Kepada Masyarakat Yang Efisien, Demokratis, Adil Dan Merata.", sortOrder: 2 },
            { villageVisionId: vision.id, mission: "Meningkatkan peran serta masyarakat dalam bidang ekonomi, sosial, budaya, politik dalam rangka mendorong kemandirian masyarakat.", sortOrder: 3 },
            { villageVisionId: vision.id, mission: "Memberdayakan kelompok ekonomi konsumtif menjadi kelompok ekonomi produktif.", sortOrder: 4 },
            { villageVisionId: vision.id, mission: "Membangun kehidupan masyarakat yang lebih baik dan sejahtera melalui beberapa potensi yang ada.", sortOrder: 5 },
            { villageVisionId: vision.id, mission: "Meningkatkan kehidupan masyarakat yang semakin layak, adil dan merata serta memberi perhatian utama pada kebutuhan dasar dan terpenuhinya sarana prasarana umum.", sortOrder: 6 },
            { villageVisionId: vision.id, mission: "Mewujudkan dan mendorong terjadinya usaha-usaha kerukunan antar dan intern warga masyarakat yang disebabkan karena adanya perbedaan agama, keyakinan, organisasi, dan lainnya dalam suasana saling menghargai dan menghormati.", sortOrder: 7 },
            { villageVisionId: vision.id, mission: "Menata pemerintahan desa Pringgodani yang kompak dan bertanggung jawab dalam mengemban amanat masyarakat.", sortOrder: 8 },
            { villageVisionId: vision.id, mission: "Menumbuhkembangkan usaha kecil dan menengah.", sortOrder: 9 },
            { villageVisionId: vision.id, mission: "Membangun dan mendorong majunya bidang pendidikan baik formal maupun informal yang mudah diakses dan dinikmati seluruh warga masyarakat tanpa terkecuali yang mampu menghasilkan insan intelektual, inovatif dan enterpreneur (wirausahawan).", sortOrder: 10 },
            { villageVisionId: vision.id, mission: "Membangun dan mendorong usaha-usaha untuk pengembangan dan optimalisasi sektor pertanian, perkebunan, peternakan, dan perikanan, baik tahap produksi maupun tahap pengolahan hasilnya.", sortOrder: 11 },
        ],
    });
    // 4. Village Profile & Relational StatisticProfile / VillageStatistic
    console.log("3/7 Seeding Real Selayang Pandang & StatisticProfile...");
    const profile = await client_1.prisma.villageProfile.create({
        data: {
            villageVisionId: vision.id,
            structureImageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/j.png",
            address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kabupaten Malang",
            phone: "081234567890",
            email: "pemdes@pringgodani.desa.id",
        },
    });
    // Official Devices (Perangkat Desa)
    await client_1.prisma.villageOfficial.createMany({
        data: [
            {
                villageProfileId: profile.id,
                name: "H. Abdul Malek",
                position: "Kepala Desa Pringgodani",
                photoUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0607.jpg",
                email: "kades@pringgodani.desa.id",
                greeting: "Selamat datang di portal informasi resmi Desa Pringgodani. Kami berkomitmen mewujudkan masyarakat dan aparatur desa yang mumpuni dalam mewujudkan kesejahteraan.",
            },
            {
                villageProfileId: profile.id,
                name: "Bapak Ponimin",
                position: "Sekretaris Desa (Pak Carek)",
                photoUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/5e6f1-img_0047.jpg",
                email: "sekdes@pringgodani.desa.id",
                greeting: "Pelayanan publik yang efisien, transparan, dan inklusif adalah amanat utama kami.",
            },
        ],
    });
    // StatisticProfile 1: Gambaran Umum & Demografi
    const statGeneral = await client_1.prisma.statisticProfile.create({
        data: {
            villageProfileId: profile.id,
            title: "Gambaran Umum & Demografi Desa Pringgodani",
            description: "Desa Pringgodani merupakan satu desa di bawah lingkup kecamatan Bantur yang terletak 6 Km dari pusat kecamatan. Desa Pringgodani memiliki empat dusun, yaitu : dusun Krajan, dusun Sengon, dusun Sumber Bendo, dusun Sumber Walo serta memiliki 4 Rukun Warga (RW) dan 33 Rukun Tetangga (RT). Sebagian besar penduduk desa Pringgodani rata-rata berprofesi sebagai petani, pedagang, dan buruh tani.",
            sortOrder: 1,
        },
    });
    await client_1.prisma.villageStatistic.createMany({
        data: [
            { statisticProfileId: statGeneral.id, label: "Jumlah Penduduk", value: "7.968", unit: "Jiwa", sortOrder: 1 },
            { statisticProfileId: statGeneral.id, label: "Jumlah Dusun", value: "4", unit: "Dusun", sortOrder: 2 },
            { statisticProfileId: statGeneral.id, label: "Jumlah Rukun Warga (RW)", value: "4", unit: "RW", sortOrder: 3 },
            { statisticProfileId: statGeneral.id, label: "Jumlah Rukun Tetangga (RT)", value: "33", unit: "RT", sortOrder: 4 },
        ],
    });
    // StatisticProfile 2: Geografi & Batas Wilayah
    const statGeo = await client_1.prisma.statisticProfile.create({
        data: {
            villageProfileId: profile.id,
            title: "Geografi & Batas Wilayah",
            description: "Ditinjau dari lokasi dan topografi, Desa Pringgodani berada di kawasan dataran tinggi perbukitan Kecamatan Bantur (ketinggian 1.300 Mdpl) dengan tanah yang sangat subur untuk pertanian tebu, padi, dan holtikultura.",
            sortOrder: 2,
        },
    });
    await client_1.prisma.villageStatistic.createMany({
        data: [
            { statisticProfileId: statGeo.id, label: "Luas Wilayah", value: "12,25", unit: "km²", sortOrder: 1 },
            { statisticProfileId: statGeo.id, label: "Iklim", value: "Tropis", unit: "-", sortOrder: 2 },
            { statisticProfileId: statGeo.id, label: "Ketinggian Tempat", value: "1.300", unit: "Mdpl", sortOrder: 3 },
            { statisticProfileId: statGeo.id, label: "Jarak ke Pusat Kecamatan Bantur", value: "6", unit: "km", sortOrder: 4 },
            { statisticProfileId: statGeo.id, label: "Jarak ke Ibukota Kabupaten Malang", value: "40", unit: "km", sortOrder: 5 },
            { statisticProfileId: statGeo.id, label: "Jarak ke Ibukota Provinsi Jawa Timur", value: "103", unit: "km", sortOrder: 6 },
        ],
    });
    // StatisticProfile 3: Sumber Air & Infrastruktur Dasar
    const statWater = await client_1.prisma.statisticProfile.create({
        data: {
            villageProfileId: profile.id,
            title: "Sumber Air & Infrastruktur Dasar",
            description: "Kondisi ketersediaan sarana dan prasarana sumber air bersih untuk kebutuhan harian warga dan pengairan lahan di Desa Pringgodani.",
            sortOrder: 3,
        },
    });
    await client_1.prisma.villageStatistic.createMany({
        data: [
            { statisticProfileId: statWater.id, label: "Mata Air Alami", value: "8", unit: "Titik", sortOrder: 1 },
            { statisticProfileId: statWater.id, label: "Sumur Gali Warga", value: "8", unit: "Titik", sortOrder: 2 },
            { statisticProfileId: statWater.id, label: "Pelanggan PDAM", value: "3", unit: "Titik", sortOrder: 3 },
        ],
    });
    // StatisticProfile 4: Sarana & Prasarana Pendidikan
    const statEdu = await client_1.prisma.statisticProfile.create({
        data: {
            villageProfileId: profile.id,
            title: "Sarana & Prasarana Pendidikan",
            description: "Jumlah sarana dan prasarana lembaga pendidikan yang beroperasi melayani anak-anak di Desa Pringgodani.",
            sortOrder: 4,
        },
    });
    await client_1.prisma.villageStatistic.createMany({
        data: [
            { statisticProfileId: statEdu.id, label: "Play Group / PAUD", value: "3", unit: "Unit", sortOrder: 1 },
            { statisticProfileId: statEdu.id, label: "Taman Kanak-Kanak (TK)", value: "3", unit: "Unit", sortOrder: 2 },
            { statisticProfileId: statEdu.id, label: "Sekolah Dasar (SD)", value: "3", unit: "Unit", sortOrder: 3 },
            { statisticProfileId: statEdu.id, label: "Madrasah Ibtidaiyah (MI)", value: "2", unit: "Unit", sortOrder: 4 },
            { statisticProfileId: statEdu.id, label: "Madrasah Tsanawiyah (MTs)", value: "1", unit: "Unit", sortOrder: 5 },
        ],
    });
    // 5. News Categories & Types
    console.log("4/7 Seeding News Categories & NewsTypes...");
    const catKegiatan = await client_1.prisma.newsCategory.upsert({
        where: { id: BigInt(1) },
        update: { name: "Kegiatan Desa" },
        create: { id: BigInt(1), name: "Kegiatan Desa", description: "Liputan kegiatan sosial, pendidikan, dan kebudayaan desa" },
    });
    await client_1.prisma.newsCategory.upsert({
        where: { id: BigInt(2) },
        update: { name: "Pembangunan" },
        create: { id: BigInt(2), name: "Pembangunan", description: "Informasi infrastruktur dan sarana prasarana desa" },
    });
    const catPengumuman = await client_1.prisma.newsCategory.upsert({
        where: { id: BigInt(3) },
        update: { name: "Pengumuman" },
        create: { id: BigInt(3), name: "Pengumuman", description: "Pengumuman resmi dari Pemerintah Desa Pringgodani" },
    });
    await client_1.prisma.newsCategory.upsert({
        where: { id: BigInt(4) },
        update: { name: "Ekonomi & UMKM" },
        create: { id: BigInt(4), name: "Ekonomi & UMKM", description: "Kabar perkembangan ekonomi lokal dan usaha warga" },
    });
    const typeArtikel = await client_1.prisma.newsType.upsert({
        where: { slug: "artikel" },
        update: { name: "Artikel Berita" },
        create: { name: "Artikel Berita", slug: "artikel", description: "Format publikasi berita berparagraf dan berpenjelasan" },
    });
    const typeGaleri = await client_1.prisma.newsType.upsert({
        where: { slug: "galeri-foto" },
        update: { name: "Galeri Foto" },
        create: { name: "Galeri Foto", slug: "galeri-foto", description: "Format publikasi album foto dokumentasi kegiatan" },
    });
    // 6. Real Potentials from WordPress
    console.log("5/7 Seeding Real Village Potentials...");
    const potCatPertanian = await client_1.prisma.villagePotentialCategory.upsert({
        where: { slug: "pertanian-perkebunan" },
        update: { name: "Pertanian & Perkebunan" },
        create: { name: "Pertanian & Perkebunan", slug: "pertanian-perkebunan" },
    });
    const potTebu = await client_1.prisma.villagePotential.create({
        data: {
            villagePotentialCategoryId: potCatPertanian.id,
            name: "Potensi Perkebunan Tebu Pringgodani",
            slug: "potensi-perkebunan-tebu",
            summary: "Sebagian besar penduduk Desa Pringgodani menanam tebu sebagai komoditas utama yang disetorkan ke pabrik gula Malang dengan lalu lalang lebih dari 100 truk tebu per hari.",
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0559.jpg",
        },
    });
    const potPadi = await client_1.prisma.villagePotential.create({
        data: {
            villagePotentialCategoryId: potCatPertanian.id,
            name: "Potensi Pertanian Padi & Tanaman Pangan",
            slug: "potensi-pertanian-padi",
            summary: "Sektor pertanian tanaman pangan padi dan jagung di lahan subur Desa Pringgodani.",
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/28880683.jpg",
        },
    });
    // 7. Seeding 11 Real News Items (Artikel vs Galeri)
    console.log("6/7 Seeding 11 Real News Items from WordPress...");
    // 7A. GALERI FOTO (GalleryDetail & GalleryImage)
    // Galeri 1: KKN UNIKAMA 2016
    const newsKkn2016 = await client_1.prisma.news.create({
        data: {
            newsCategoryId: catKegiatan.id,
            newsTypeId: typeGaleri.id,
            title: "Kuliah Kerja Nyata (KKN) Universitas Kanjuruhan Malang 2016",
            slug: "kuliah-kerja-nyata-kkn-universitas-kanjuruhan-malang-2016",
            excerpt: "Album foto dokumentasi pengabdian dan perpisahan Kuliah Kerja Nyata (KKN) Universitas Kanjuruhan Malang angkatan 2016 di Desa Pringgodani.",
            status: "PUBLISHED",
            publishedAt: new Date("2017-07-19T04:11:06Z"),
        },
    });
    const galDetail2016 = await client_1.prisma.galleryDetail.create({
        data: {
            newsId: newsKkn2016.id,
            title: newsKkn2016.title,
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/92666-img_0250.jpg",
        },
    });
    await client_1.prisma.galleryImage.createMany({
        data: [
            { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/92666-img_0250.jpg", imageDescription: "Photo bersama orangtua kami di desa Pringgodani", sortOrder: 1 },
            { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/0ffc3-img_0587.jpg", imageDescription: "Photo penyerahan cenderamata oleh wakil kordes kepada Bapak Kepala Desa Pringgodani H. Abdul Malek", sortOrder: 2 },
            { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/621d9-img_0588.jpg", imageDescription: "Photo penyerahan cenderamata oleh kordes KKN waktu acara perpisahan bersama Bapak Kepala Desa H. Abdul Malek", sortOrder: 3 },
            { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/5e6f1-img_0047.jpg", imageDescription: "Photo bersama bapak Ponimin (pak Carek) waktu acara kader PKK desa Pringgodani", sortOrder: 4 },
            { galleryDetailId: galDetail2016.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0607.jpg", imageDescription: "Foto bersama perangkat desa dan camat Kecamatan Bantur", sortOrder: 5 },
        ],
    });
    // Galeri 2: KKN UNIKAMA 2017
    const newsKkn2017 = await client_1.prisma.news.create({
        data: {
            newsCategoryId: catKegiatan.id,
            newsTypeId: typeGaleri.id,
            title: "KULIAH KERJA NYATA (KKN) UNIVERSITAS KANJURUHAN MALANG 2017",
            slug: "kuliah-kerja-nyata-kkn-universitas-kanjuruhan-malang-2017",
            excerpt: "Album foto posko dan pengabdian 3 kelompok Kuliah Kerja Nyata (KKN) UNIKAMA 2017 di Desa Pringgodani.",
            status: "PUBLISHED",
            publishedAt: new Date("2017-07-23T14:55:46Z"),
        },
    });
    const galDetail2017 = await client_1.prisma.galleryDetail.create({
        data: {
            newsId: newsKkn2017.id,
            title: newsKkn2017.title,
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0626.jpg",
        },
    });
    await client_1.prisma.galleryImage.createMany({
        data: [
            { galleryDetailId: galDetail2017.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0626.jpg", imageDescription: "Posko Kelompok 1 (Ketua M. Rifai) di Dusun Krajan kediaman Ibu Sutini", sortOrder: 1 },
            { galleryDetailId: galDetail2017.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0633.jpg", imageDescription: "Posko Kelompok 2 (Ketua Mahbub) di Dusun Sumberbendo RT 20 kediaman Bapak Imam", sortOrder: 2 },
            { galleryDetailId: galDetail2017.id, imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0558.jpg", imageDescription: "Posko Kelompok 3 (Ketua Romi Mikhael) di Dusun Sumberbendo RT 18 kediaman Ibu Sumrati", sortOrder: 3 },
        ],
    });
    // 7B. ARTIKEL BERITA (ArticleDetail & ArticleBlock)
    // Artikel 1: Tasyakuran 17 Agustus & Perpisahan KKN
    const news1 = await client_1.prisma.news.create({
        data: {
            newsCategoryId: catKegiatan.id,
            newsTypeId: typeArtikel.id,
            title: "TASYAKURAN 17 AGUSTUS DAN PERPISAHAN KKN UNIKAMA 2017 KELOMPOK 3",
            slug: "tasyakuran-17-agustus-dan-perpisahan-kkn-unikama-2017-kelompok-3",
            excerpt: "Kegiatan ini merupakan tasyakuran memperingati 17 Agustus yang menjadi kegiatan rutin di hari kemerdekaan desa Pringgodani. Tasyakuran ini dihadiri oleh masyarakat desa Pringgodani, tokoh agama serta Peserta KKN UNIKAMA.",
            status: "PUBLISHED",
            publishedAt: new Date("2017-08-20T05:08:27Z"),
        },
    });
    const artDetail1 = await client_1.prisma.articleDetail.create({
        data: {
            newsId: news1.id,
            title: news1.title,
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170819-wa00131.jpg",
        },
    });
    await client_1.prisma.articleBlock.createMany({
        data: [
            {
                articleDetailId: artDetail1.id,
                subHeading: "Tasyakuran Kemerdekaan RI & Perpisahan KKN",
                content: "Kegiatan ini merupakan tasyakuran memperingati 17 Agustus yang menjadi kegiatan rutin di hari kemerdekaan desa Pringgodani. Tasyakuran ini dihadiri oleh masyarakat desa Pringgodani, tokoh-tokoh agama serta Peserta KKN Universitas Kanjuruhan Malang 2017 Kelompok 3.",
                imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170819-wa00131.jpg",
                sortOrder: 1,
            },
        ],
    });
    // Artikel 2: Pemasangan Papan PKK
    const news2 = await client_1.prisma.news.create({
        data: {
            newsCategoryId: catKegiatan.id,
            newsTypeId: typeArtikel.id,
            title: "PEMASANGAN PAPAN 10 PROGRAM POKOK PKK",
            slug: "pemasangan-papan-10-program-pokok-pkk",
            excerpt: "Pemasangan papan 10 Program Pokok PKK sebagai sarana sosialisasi dan pemberdayaan wanita di Desa Pringgodani.",
            status: "PUBLISHED",
            publishedAt: new Date("2017-08-20T05:03:06Z"),
        },
    });
    const artDetail2 = await client_1.prisma.articleDetail.create({
        data: {
            newsId: news2.id,
            title: news2.title,
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170819-wa0006.jpg",
        },
    });
    await client_1.prisma.articleBlock.createMany({
        data: [
            {
                articleDetailId: artDetail2.id,
                subHeading: "Sosialisasi 10 Program Pokok PKK",
                content: "Pemerintah Desa Pringgodani bersama kader tim penggerak PKK menempatkan papan imbauan 10 Program Pokok PKK di titik strategis desa demi mewujudkan keluarga sejahtera dan mandiri.",
                imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170819-wa0006.jpg",
                sortOrder: 1,
            },
        ],
    });
    // Artikel 3: Posyandu Lansia
    const news3 = await client_1.prisma.news.create({
        data: {
            newsCategoryId: catKegiatan.id,
            newsTypeId: typeArtikel.id,
            title: "Posyandu Lansia Desa Pringgodani",
            slug: "posyandu-lansia",
            excerpt: "Kegiatan rutin posyandu lansia untuk menjaga kesehatan para lansia di Desa Pringgodani.",
            status: "PUBLISHED",
            publishedAt: new Date("2017-08-10T12:10:49Z"),
        },
    });
    const artDetail3 = await client_1.prisma.articleDetail.create({
        data: {
            newsId: news3.id,
            title: news3.title,
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170809-wa0009.jpg",
        },
    });
    await client_1.prisma.articleBlock.createMany({
        data: [
            {
                articleDetailId: artDetail3.id,
                subHeading: "Pemeriksaan Kesehatan Berkala Lansia",
                content: "Posyandu lansia diadakan secara berkala memberikan layanan cek tensi, pemberian vitamin, suplemen kesehatan, serta senam sehat bagi lansia warga Desa Pringgodani.",
                imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170809-wa0009.jpg",
                sortOrder: 1,
            },
        ],
    });
    // Artikel 4: Penyuluhan Pendidikan MTs
    const news4 = await client_1.prisma.news.create({
        data: {
            newsCategoryId: catKegiatan.id,
            newsTypeId: typeArtikel.id,
            title: "Penyuluhan Pentingnya Pendidikan di MTs Bustanul Qur'ani Al-Ihsani",
            slug: "penyuluhan-pentingnya-pendidikan-di-mts-bustanul-qurani-al-ihsani",
            excerpt: "Sosialisasi pentingnya menuntut ilmu dan melanjutkan pendidikan setinggi-tingginya bagi generasi muda di MTs Bustanul Qur'ani Al-Ihsani.",
            status: "PUBLISHED",
            publishedAt: new Date("2017-07-25T10:59:50Z"),
        },
    });
    const artDetail4 = await client_1.prisma.articleDetail.create({
        data: {
            newsId: news4.id,
            title: news4.title,
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0559.jpg",
        },
    });
    await client_1.prisma.articleBlock.createMany({
        data: [
            {
                articleDetailId: artDetail4.id,
                subHeading: "Motivasi Belajar Siswa MTs",
                content: "Penyuluhan motivasi pendidikan diselenggarakan untuk memberikan semangat para siswa MTs Bustanul Qur'ani Al-Ihsani agar terdorong meraih cita-cita dan berkontribusi bagi kemajuan Desa Pringgodani.",
                imageUrl: null,
                sortOrder: 1,
            },
        ],
    });
    // Artikel 5: Lomba Voli Bantur
    const news5 = await client_1.prisma.news.create({
        data: {
            newsCategoryId: catKegiatan.id,
            newsTypeId: typeArtikel.id,
            title: "Lomba Voli Se-Kecamatan Bantur",
            slug: "lomba-voly-se-kecamatan-bantur",
            excerpt: "Tim bola voli Desa Pringgodani berpartisipasi meramaikan turnamen bola voli antar desa se-Kecamatan Bantur.",
            status: "PUBLISHED",
            publishedAt: new Date("2017-08-10T10:51:11Z"),
        },
    });
    const artDetail5 = await client_1.prisma.articleDetail.create({
        data: {
            newsId: news5.id,
            title: news5.title,
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0607.jpg",
        },
    });
    await client_1.prisma.articleBlock.createMany({
        data: [
            {
                articleDetailId: artDetail5.id,
                subHeading: "Semangat Olahraga Warga Desa",
                content: "Ajang lomba olahraga bola voli se-Kecamatan Bantur mempererat tali silaturahmi antar warga desa serta memupuk jiwa sportifitas pemuda.",
                imageUrl: null,
                sortOrder: 1,
            },
        ],
    });
    // Artikel 6: Imunisasi Campak & Rubella
    const news6 = await client_1.prisma.news.create({
        data: {
            newsCategoryId: catKegiatan.id,
            newsTypeId: typeArtikel.id,
            title: "Penyuluhan Imunisasi Campak dan Rubella Oleh Puskesmas Wonokerto",
            slug: "penyuluhan-imunisasi-campak-dan-rubella-oleh-puskesmas-wonokerto",
            excerpt: "Penyuluhan dan pelaksanaan imunisasi pencegahan penyakit campak dan rubella bagi balita dan anak-anak desa.",
            status: "PUBLISHED",
            publishedAt: new Date("2017-07-25T08:32:52Z"),
        },
    });
    const artDetail6 = await client_1.prisma.articleDetail.create({
        data: {
            newsId: news6.id,
            title: news6.title,
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170809-wa0009.jpg",
        },
    });
    await client_1.prisma.articleBlock.createMany({
        data: [
            {
                articleDetailId: artDetail6.id,
                subHeading: "Kesehatan Anak Indonesia Sehat",
                content: "Tim medis Puskesmas Wonokerto memberikan pemahaman mendalam kepada ibu-ibu desa mengenai pentingnya vaksinasi campak dan rubella demi kekebalan imun generasi penerus.",
                imageUrl: null,
                sortOrder: 1,
            },
        ],
    });
    // Artikel 7: Bimbingan Belajar
    const news7 = await client_1.prisma.news.create({
        data: {
            newsCategoryId: catKegiatan.id,
            newsTypeId: typeArtikel.id,
            title: "Program Bimbingan Belajar Anak-Anak Desa",
            slug: "bimbingan-belajar",
            excerpt: "Kegiatan bimbingan belajar gratis untuk anak-anak sekolah dasar di Desa Pringgodani.",
            status: "PUBLISHED",
            publishedAt: new Date("2017-07-25T08:13:54Z"),
        },
    });
    const artDetail7 = await client_1.prisma.articleDetail.create({
        data: {
            newsId: news7.id,
            title: news7.title,
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/28880683.jpg",
        },
    });
    await client_1.prisma.articleBlock.createMany({
        data: [
            {
                articleDetailId: artDetail7.id,
                subHeading: "Pendampingan Belajar Anak",
                content: "Program bimbingan belajar sore hari membantu siswa SD memahami pelajaran matematika, Bahasa Indonesia, dan IPA dengan suasana mengajar interaktif dan menyenangkan.",
                imageUrl: null,
                sortOrder: 1,
            },
        ],
    });
    // Artikel 8: Kesehatan Gigi SDN 01
    const news8 = await client_1.prisma.news.create({
        data: {
            newsCategoryId: catKegiatan.id,
            newsTypeId: typeArtikel.id,
            title: "Penyuluhan Pentingnya Kesehatan Gigi di SDN Pringgodani 01",
            slug: "penyuluhan-pentingnya-kesehatan-gigi-di-sdn-pringgodani-01",
            excerpt: "Edukasi sikat gigi benar dan perawatan kesehatan mulut sejak dini di SDN Pringgodani 01.",
            status: "PUBLISHED",
            publishedAt: new Date("2017-07-25T07:28:25Z"),
        },
    });
    const artDetail8 = await client_1.prisma.articleDetail.create({
        data: {
            newsId: news8.id,
            title: news8.title,
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0607.jpg",
        },
    });
    await client_1.prisma.articleBlock.createMany({
        data: [
            {
                articleDetailId: artDetail8.id,
                subHeading: "Pentingnya Menjaga Kebersihan Gigi",
                content: "Siswa-siswi SDN Pringgodani 01 diajarkan praktik cara menyikat gigi yang tepat serta pembagian sikat gigi dan pasta gigi gratis.",
                imageUrl: null,
                sortOrder: 1,
            },
        ],
    });
    // Artikel 9: First Blog Post / Pengenalan Portal
    const news9 = await client_1.prisma.news.create({
        data: {
            newsCategoryId: catPengumuman.id,
            newsTypeId: typeArtikel.id,
            title: "Pengenalan Portal Informasi Desa Pringgodani",
            slug: "first-blog-post",
            excerpt: "Peluncuran blog portal informasi publikasi kegiatan dan potensi resmi Desa Pringgodani.",
            status: "PUBLISHED",
            publishedAt: new Date("2017-07-05T07:38:51Z"),
        },
    });
    const artDetail9 = await client_1.prisma.articleDetail.create({
        data: {
            newsId: news9.id,
            title: news9.title,
            coverUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/logo-kab-malang.png",
        },
    });
    await client_1.prisma.articleBlock.createMany({
        data: [
            {
                articleDetailId: artDetail9.id,
                subHeading: "Selamat Datang di Portal Informasi Desa",
                content: "Selamat datang di website informasi Desa Pringgodani. Portal ini menjadi media publikasi resmi berbagai program pembangunan, profil wilayah, potensi lokal, serta agenda kegiatan masyarakat desa.",
                imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/logo-kab-malang.png",
                sortOrder: 1,
            },
        ],
    });
    // 8. Preserve UMKM Data
    console.log("7/7 Preserving UMKM Data & Map Locations...");
    const umkmCatKuliner = await client_1.prisma.umkmCategory.upsert({
        where: { slug: "kuliner" },
        update: {},
        create: { name: "Kuliner", slug: "kuliner", description: "Aneka kuliner olahan makanan & minuman khas desa" },
    });
    const umkm1 = await client_1.prisma.umkm.upsert({
        where: { slug: "kopi-pringgodani-asri" },
        update: {},
        create: {
            umkmCategoryId: umkmCatKuliner.id,
            villagePotentialId: potTebu.id,
            name: "Kopi Pringgodani Asri",
            slug: "kopi-pringgodani-asri",
            ownerName: "Ibu Nurhayati",
            description: "Produsen bubuk kopi biji roaster pilihan dengan aroma khas perbukitan Pringgodani.",
            phone: "081234567891",
            email: "kopipringgodani@gmail.com",
            address: "Dusun Krajan RT 02 / RW 01, Desa Pringgodani",
            coverUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
            latitude: -7.9812,
            longitude: 112.6315,
            openDay: "Senin - Sabtu",
            since: 2018,
            status: "APPROVED",
        },
    });
    const existingProducts = await client_1.prisma.product.findMany({ where: { umkmId: umkm1.id } });
    if (existingProducts.length === 0) {
        await client_1.prisma.product.createMany({
            data: [
                { umkmId: umkm1.id, name: "Kopi Robusta Pringgodani 250g", description: "Biji kopi robusta pilihan dipanggang sedang", price: 35000, imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" },
                { umkmId: umkm1.id, name: "Sirup Jeruk Manis Alami 500ml", description: "Sirup konsentrat buah jeruk manis asli", price: 25000, imageUrl: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80" },
            ],
        });
    }
    // Map Locations
    const mapCatFasilitas = await client_1.prisma.mapCategory.upsert({
        where: { slug: "fasilitas-umum" },
        update: {},
        create: { name: "Fasilitas Umum", slug: "fasilitas-umum", icon: "building", color: "#10B981" },
    });
    const mapCatPemerintahan = await client_1.prisma.mapCategory.upsert({
        where: { slug: "pemerintahan" },
        update: {},
        create: { name: "Pemerintahan", slug: "pemerintahan", icon: "account_balance", color: "#3B82F6" },
    });
    const mapCatPendidikan = await client_1.prisma.mapCategory.upsert({
        where: { slug: "pendidikan" },
        update: {},
        create: { name: "Pendidikan", slug: "pendidikan", icon: "school", color: "#F59E0B" },
    });
    await client_1.prisma.mapLocation.deleteMany({});
    await client_1.prisma.mapLocation.createMany({
        data: [
            {
                mapCategoryId: mapCatPemerintahan.id,
                name: "Balai Desa Pringgodani",
                shortDescription: "Kantor balai desa dan pusat pelayanan publik kependudukan Pringgodani.",
                imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0607.jpg",
                address: "Jl. Raya Desa Pringgodani No. 1",
                latitude: -7.98100000,
                longitude: 112.63100000,
                googleMapsUrl: "https://maps.google.com/?q=-7.9810,112.6310",
            },
            {
                mapCategoryId: mapCatPendidikan.id,
                name: "SD Negeri 1 Pringgodani",
                shortDescription: "Sekolah dasar negeri terakreditasi di lingkungan Desa Pringgodani.",
                imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
                address: "Jl. Pendidikan No. 5, Desa Pringgodani",
                latitude: -7.98300000,
                longitude: 112.63250000,
                googleMapsUrl: "https://maps.google.com/?q=-7.9830,112.6325",
            },
            {
                mapCategoryId: mapCatFasilitas.id,
                name: "Puskesmas Pembantu (Pustu) Pringgodani",
                shortDescription: "Pusat pelayanan kesehatan dasar dan posyandu warga desa.",
                imageUrl: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/08/img-20170809-wa0009.jpg",
                address: "Jl. Sehat No. 2, Desa Pringgodani",
                latitude: -7.98200000,
                longitude: 112.62950000,
                googleMapsUrl: "https://maps.google.com/?q=-7.9820,112.6295",
            },
        ],
    });
    console.log("✅ Database Seeding for Web Desa Pringgodani Selesai dengan Sukses!");
}
main()
    .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
})
    .finally(async () => {
    await client_1.prisma.$disconnect();
});
