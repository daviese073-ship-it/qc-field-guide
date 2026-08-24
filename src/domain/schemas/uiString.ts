import { z } from "zod";

export const uiStringCategorySchema = z.enum([
  "navigation",
  "mode",
  "fieldLabel",
  "systemMessage"
]);

export const uiStringSchema = z
  .object({
    id: z.string().min(1),
    en: z.string().min(1),
    fr: z.string().min(1).optional(),
    category: uiStringCategorySchema.optional()
  })
  .strict();
