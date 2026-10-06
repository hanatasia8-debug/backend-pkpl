import { z } from "zod";

export const createOfficialSchema = z.object({
  villageProfileId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : String(val)),
    z.string().nullable().optional()
  ),
  name: z.string().min(1, "Nama pejabat desa wajib diisi"),
  position: z.string().min(1, "Jabatan wajib diisi"),
  photoUrl: z.string().min(1, "Foto pejabat desa wajib diunggah"),
  email: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().email("Format email tidak valid").nullable().optional()
  ),
  greeting: z.string().nullable().optional(),
});

export const getOfficialsQuerySchema = z.object({
  villageProfileId: z.string().optional(),
  q: z.string().optional(),
});

export type CreateOfficialDTO = z.infer<typeof createOfficialSchema>;
export type GetOfficialsQueryDTO = z.infer<typeof getOfficialsQuerySchema>;
