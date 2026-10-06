import { AdminProfilRepository } from "./admin-profil.repository";

export class AdminProfilService {
  static async getProfil() {
    return AdminProfilRepository.getVillageProfile();
  }

  static async updateProfil(payload: any) {
    return AdminProfilRepository.updateVillageProfile(payload);
  }

  static async addOfficial(payload: any) {
    return AdminProfilRepository.addOfficial(payload);
  }

  static async updateOfficial(id: string, payload: any) {
    return AdminProfilRepository.updateOfficial(id, payload);
  }

  static async deleteOfficial(id: string) {
    return AdminProfilRepository.deleteOfficial(id);
  }
}
