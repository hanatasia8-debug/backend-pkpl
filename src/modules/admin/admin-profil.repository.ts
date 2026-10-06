import { prisma } from "../../shared/db/client";

export class AdminProfilRepository {
  static async getVillageProfile() {
    const profile = await prisma.villageProfile.findFirst({
      include: {
        officials: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!profile) {
      return {
        villageName: "Desa Pringgodani",
        headName: "Kepala Desa Pringgodani",
        headPosition: "Kepala Desa",
        headPhoto: "/images/placeholder-avatar.jpg",
        headGreeting: "",
        aboutText: "",
        address: "Jl. Raya Desa Pringgodani No. 1, Bantur, Malang",
        phone: "081234567890",
        email: "info@pringgodani.desa.id",
        officials: [],
      };
    }

    const headOfficial = profile.officials.find((o) =>
      o.position.toLowerCase().includes("kepala desa")
    ) || profile.officials[0];

    return {
      villageName: profile.villageName,
      headName: headOfficial?.name || "Kepala Desa Pringgodani",
      headPosition: headOfficial?.position || "Kepala Desa",
      headPhoto: profile.headPhoto || headOfficial?.photoUrl || "/images/placeholder-avatar.jpg",
      headGreeting: profile.headGreeting || "",
      aboutText: profile.aboutText || "",
      address: profile.address,
      phone: profile.phone,
      email: profile.email || "info@pringgodani.desa.id",
      officials: profile.officials.map((o) => ({
        id: o.id.toString(),
        name: o.name,
        position: o.position,
        photoUrl: o.photoUrl,
        email: o.email || undefined,
        greeting: o.greeting || undefined,
      })),
    };
  }

  static async updateVillageProfile(payload: any) {
    const profile = await prisma.villageProfile.findFirst();

    const dataToUpdate: any = {};
    if (payload.villageName !== undefined) dataToUpdate.villageName = payload.villageName;
    if (payload.headGreeting !== undefined) dataToUpdate.headGreeting = payload.headGreeting;
    if (payload.headPhoto !== undefined) dataToUpdate.headPhoto = payload.headPhoto;
    if (payload.aboutText !== undefined) dataToUpdate.aboutText = payload.aboutText;
    if (payload.address !== undefined) dataToUpdate.address = payload.address;
    if (payload.phone !== undefined) dataToUpdate.phone = payload.phone;
    if (payload.email !== undefined) dataToUpdate.email = payload.email;

    if (profile) {
      await prisma.villageProfile.update({
        where: { id: profile.id },
        data: dataToUpdate,
      });

      if (payload.headName || payload.headPosition || payload.headPhoto) {
        try {
          const headOfficial = await prisma.villageOfficial.findFirst({
            where: {
              villageProfileId: profile.id,
              position: { contains: "Kepala Desa", mode: "insensitive" },
            },
          });

          if (headOfficial) {
            await prisma.villageOfficial.update({
              where: { id: headOfficial.id },
              data: {
                ...(payload.headName && { name: payload.headName }),
                ...(payload.headPosition && { position: payload.headPosition }),
                ...(payload.headPhoto && { photoUrl: payload.headPhoto }),
              },
            });
          }
        } catch (officialErr) {
          console.warn("Gagal memperbarui data perangkat Kepala Desa:", officialErr);
        }
      }
    } else {
      await prisma.villageProfile.create({
        data: {
          villageName: payload.villageName || "Desa Pringgodani",
          headGreeting: payload.headGreeting || "Selamat datang di website resmi Desa Pringgodani.",
          headPhoto: payload.headPhoto || "/images/kepala-desa.jpg",
          aboutText: payload.aboutText || null,
          address: payload.address || "Jl. Raya Desa Pringgodani No. 1, Bantur, Malang",
          phone: payload.phone || "081234567890",
          email: payload.email || "info@pringgodani.desa.id",
        },
      });
    }

    return { success: true };
  }

  static async addOfficial(payload: any) {
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
        name: payload.name,
        position: payload.position,
        photoUrl: payload.photoUrl || "",
        email: payload.email || null,
        greeting: payload.greeting || null,
      },
    });

    return {
      id: created.id.toString(),
      name: created.name,
      position: created.position,
      photoUrl: created.photoUrl,
      email: created.email || undefined,
    };
  }

  static async updateOfficial(id: string, payload: any) {
    const officialId = BigInt(id);
    const updated = await prisma.villageOfficial.update({
      where: { id: officialId },
      data: {
        ...(payload.name && { name: payload.name }),
        ...(payload.position && { position: payload.position }),
        ...(payload.photoUrl && { photoUrl: payload.photoUrl }),
        ...(payload.email !== undefined && { email: payload.email || null }),
        ...(payload.greeting !== undefined && { greeting: payload.greeting || null }),
      },
    });

    return {
      id: updated.id.toString(),
      name: updated.name,
      position: updated.position,
      photoUrl: updated.photoUrl,
    };
  }

  static async deleteOfficial(id: string) {
    const officialId = BigInt(id);
    await prisma.villageOfficial.delete({
      where: { id: officialId },
    });
    return { success: true };
  }
}
