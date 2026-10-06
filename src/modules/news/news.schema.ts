import { z } from "zod";

export const articleBlockSchema = z.object({
  subHeading: z.string().nullable().optional(),
  content: z.string().optional().nullable(),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.preprocess(
    (val) => (val === undefined || val === null ? 0 : Number(val)),
    z.number().int()
  ),
});

export const galleryImageSchema = z.object({
  imageUrl: z.string().optional().nullable(),
  imageDescription: z.string().nullable().optional(),
  sortOrder: z.preprocess(
    (val) => (val === undefined || val === null ? 0 : Number(val)),
    z.number().int()
  ),
});

export const baseCreateNewsSchema = z.object({
  title: z.string().min(1, "Judul berita wajib diisi"),
  newsCategoryId: z.preprocess((val) => String(val ?? ""), z.string().min(1, "Kategori berita wajib dipilih")),
  newCategoryName: z.string().optional().nullable(),
  newsTypeId: z.preprocess((val) => String(val ?? ""), z.string().min(1, "Tipe berita wajib dipilih")),
  newTypeName: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  coverCaption: z.string().optional().nullable(),
  villagePotentialId: z.preprocess(
    (val) => (val ? String(val) : null),
    z.string().optional().nullable()
  ),
  excerpt: z.string().optional().nullable(),
  coverUrl: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED"]).default("PENDING"),
  publishedAt: z.preprocess(
    (val) => (val ? new Date(String(val)) : new Date()),
    z.date().optional()
  ),
  blocks: z.array(articleBlockSchema).optional(),
  galleryImages: z.array(galleryImageSchema).optional(),
  taggedUmkmIds: z.array(z.string()).optional(),
  taggedProductIds: z.array(z.string()).optional(),
  taggedPotentialIds: z.array(z.string()).optional(),
});

export type CreateNewsDTO = z.infer<typeof baseCreateNewsSchema>;

export const updateNewsSchema = baseCreateNewsSchema.partial();
export type UpdateNewsDTO = z.infer<typeof updateNewsSchema>;
