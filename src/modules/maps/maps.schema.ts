import { z } from "zod";

export const mapQuerySchema = z.object({
  categorySlug: z.string().optional(),
  locationId: z.string().optional(),
  q: z.string().optional(),
});

export type MapQueryDTO = z.infer<typeof mapQuerySchema>;
