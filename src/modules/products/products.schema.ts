import { z } from "zod";

export const findAllProductsSchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 12), z.number().int().min(1).max(50).default(12)),
  category: z.string().optional(),
  search: z.string().optional(),
  umkmSlug: z.string().optional(),
  minPrice: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
  maxPrice: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().optional()),
  sort: z.enum(["newest", "price_asc", "price_desc", "name_asc"]).default("newest"),
});

export type FindAllProductsParams = z.infer<typeof findAllProductsSchema>;

export const createProductSchema = z.object({
  umkmId: z.string().min(1, "ID UMKM wajib diisi"),
  name: z.string().min(1, "Nama produk wajib diisi"),
  description: z.string().min(1, "Deskripsi produk wajib diisi"),
  price: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().nullable().optional()
  ),
  imageUrl: z.string().nullable().optional(),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().omit({ umkmId: true });
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
