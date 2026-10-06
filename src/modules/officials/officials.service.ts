import { OfficialsRepository } from "./officials.repository";
import { createOfficialSchema, CreateOfficialDTO } from "./officials.schema";
import { ValidationError, NotFoundError } from "../../shared/errors/app-error";

export class OfficialsService {
  static async getOfficials(profileIdStr?: string, searchQuery?: string) {
    let profileId: bigint | undefined;
    if (profileIdStr) {
      try {
        profileId = BigInt(profileIdStr);
      } catch {
        throw new ValidationError("ID profil desa tidak valid");
      }
    }

    return OfficialsRepository.findAll(profileId, searchQuery);
  }

  static async getOfficialById(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new ValidationError("ID perangkat desa tidak valid");
    }

    const official = await OfficialsRepository.findById(id);
    if (!official) {
      throw new NotFoundError(`Perangkat desa dengan ID ${idStr} tidak ditemukan`);
    }

    return official;
  }

  static async createOfficial(input: unknown) {
    const validation = createOfficialSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0].message,
        validation.error.flatten()
      );
    }

    const data: CreateOfficialDTO = validation.data;

    let profileId: bigint;
    if (data.villageProfileId) {
      try {
        profileId = BigInt(data.villageProfileId);
      } catch {
        throw new ValidationError("ID profil desa tidak valid");
      }
    } else {
      profileId = await OfficialsRepository.getDefaultProfileId();
    }

    const official = await OfficialsRepository.create({
      villageProfileId: profileId,
      name: data.name,
      position: data.position,
      photoUrl: data.photoUrl,
      email: data.email || null,
      greeting: data.greeting || null,
    });

    return official;
  }
}
