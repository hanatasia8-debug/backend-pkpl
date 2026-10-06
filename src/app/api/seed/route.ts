import { NextResponse } from "next/server";
import { prisma } from "../../../shared/db/client";
import crypto from "crypto";

// Database Seed Endpoint for Next.js App Route

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (process.env.NODE_ENV === "production" && token !== process.env.SEED_ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: "Akses seeding ditolak di lingkungan produksi" },
        { status: 403 }
      );
    }

    // 1. Roles
    let superAdminRole = await prisma.role.findFirst({ where: { name: "SUPER_ADMIN" } });
    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({ data: { name: "SUPER_ADMIN" } });
    }

    // 2. Admin User
    const existingAdmin = await prisma.user.findFirst({
      where: { email: "admin@pringgodani.desa.id" },
    });
    if (!existingAdmin) {
      const hash = crypto.createHash("sha256").update("AdminPringgodani123!").digest("hex");
      await prisma.user.create({
        data: {
          id: "00000000-0000-0000-0000-000000000001",
          roleId: superAdminRole.id,
          name: "Administrator Pringgodani",
          email: "admin@pringgodani.desa.id",
        },
      });
    }

    // 3. Website Setting
    const existingSetting = await prisma.websiteSetting.findFirst();
    if (!existingSetting) {
      await prisma.websiteSetting.create({
        data: {
          websiteName: "LokalUMKM Desa Pringgodani",
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
    }

    // 4. Village Profile
    const existingProfile = await prisma.villageProfile.findFirst();
    if (!existingProfile) {
      await prisma.villageProfile.create({
        data: {
          villageName: "Desa Pringgodani",
          headGreeting: "Pemerintah Desa Pringgodani berkomitmen penuh mendukung pertumbuhan dan digitalisasi UMKM lokal...",
          headPhoto: "https://pringgondaniblog.wordpress.com/wp-content/uploads/2017/07/dsc_0607.jpg",
          address: "Jl. Raya Desa Pringgodani No. 1, Bantur, Malang",
          phone: "081234567890",
          email: "info@pringgodani.desa.id",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Seeding data berhasil disinkronisasi!",
    });
  } catch (error: any) {
    console.error("API Seeding Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
