import { ProfileRepository } from "./profile.repository";
import { prisma } from "../../shared/db/client";

export class ProfileService {
  static async getProfileWithStats() {
    const rawProfile = await ProfileRepository.getVillageProfile();
    const [umkmCount, productCount, newsCount] = await Promise.all([
      prisma.umkm.count({ where: { status: "APPROVED" } }),
      prisma.product.count({ where: { umkm: { status: "APPROVED" } } }),
      prisma.news.count({ where: { status: "PUBLISHED" } }),
    ]);

    if (!rawProfile) {
      return {
        profile: {
          villageName: "Desa Pringgodani",
          headGreeting: "Pemerintah Desa Pringgodani berkomitmen penuh mendukung kemajuan potensi desa bersama seluruh warga.",
          headPhoto: "/images/placeholder-avatar.jpg",
          headName: "Kepala Desa Pringgodani",
          headPosition: "Kepala Desa",
          aboutText: "",
          address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kab. Malang, Jawa Timur",
          phone: "081234567890",
          email: "info@pringgodani.desa.id",
          officials: [],
        },
        stats: {
          umkmCount,
          productCount,
          newsCount,
          dusunCount: 4,
        },
      };
    }

    const headOfficial = rawProfile.officials.find((o) =>
      o.position.toLowerCase().includes("kepala desa")
    ) || rawProfile.officials[0];

    const profile = {
      villageName: rawProfile.villageName || "Desa Pringgodani",
      headGreeting: rawProfile.headGreeting || "",
      headPhoto: rawProfile.headPhoto || headOfficial?.photoUrl || "/images/placeholder-avatar.jpg",
      headName: headOfficial?.name || "Kepala Desa Pringgodani",
      headPosition: headOfficial?.position || "Kepala Desa",
      aboutText: rawProfile.aboutText || "",
      address: rawProfile.address,
      phone: rawProfile.phone,
      email: rawProfile.email,
      officials: rawProfile.officials.map((o) => ({
        id: o.id.toString(),
        name: o.name,
        position: o.position,
        photo: o.photoUrl,
        photoUrl: o.photoUrl,
        greeting: o.greeting || undefined,
        email: o.email || undefined,
      })),
    };

    return {
      profile,
      stats: {
        umkmCount,
        productCount,
        newsCount,
        dusunCount: 4,
      },
    };
  }
}
