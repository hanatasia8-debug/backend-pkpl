import { prisma } from "../../shared/db/client";

export class ProfileRepository {
  static async getVillageProfile() {
    return prisma.villageProfile.findFirst({
      include: {
        officials: {
          orderBy: { id: "asc" },
        },
      },
    });
  }
}
