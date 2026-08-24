import { z } from "zod";

import { localizedStringSchema } from "@/domain/schemas/localization";

export const sectionSchema = z
  .object({
    id: z.string().min(1),
    title: localizedStringSchema,
    description: localizedStringSchema.optional(),
    order: z.number().int().positive()
  })
  .strict();
