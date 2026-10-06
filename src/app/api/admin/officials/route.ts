import { prisma } from "../../../../shared/db/client";
import { ApiResponse } from "../../../../shared/utils/response";
import { requireAdmin } from "../../../../shared/auth/require-admin";

export async function GET() {
  try {
    const officials = await prisma.villageOfficial.findMany({
      orderBy: { id: "asc" },
    });
    const formatted = officials.map((o) => ({
      id: o.id.toString(),
      name: o.name,
      position: o.position,
      photoUrl: o.photoUrl,
      email: o.email || "",
      greeting: o.greeting || "",
    }));
    return ApiResponse.success(formatted);
  } catch (error: any) {
    console.error("Get officials error:", error);
    return ApiResponse.error("Gagal mengambil daftar perangkat desa", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { name, position, photoUrl, email, greeting } = body;

    if (!name || !position) {
      return ApiResponse.error("Nama dan Jabatan wajib diisi", 400);
    }

    let profile = await prisma.villageProfile.findFirst();
    if (!profile) {
      profile = await prisma.villageProfile.create({
        data: {
          villageName: "Desa Pringgodani",
          headGreeting: "Selamat datang di portal LokalUMKM Desa Pringgodani.",
          headPhoto: "/images/kepala-desa.jpg",
          address: "Jl. Raya Desa Pringgodani No. 1, Bantur, Malang",
          phone: "081234567890",
        },
      });
    }

    const created = await prisma.villageOfficial.create({
      data: {
        villageProfileId: profile.id,
        name,
        position,
        photoUrl:
          photoUrl ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
        email: email || null,
        greeting: greeting || null,
      },
    });

    return ApiResponse.success({
      id: created.id.toString(),
      name: created.name,
      position: created.position,
      photoUrl: created.photoUrl,
      email: created.email || "",
      greeting: created.greeting || "",
    });
  } catch (error: any) {
    console.error("Create official error:", error);
    return ApiResponse.error("Gagal menambahkan perangkat desa", 500);
  }
}
