import { z } from "zod";

export const translationStatusSchema = z.enum([
  "missing",
  "provisional",
  "validated"
]);

export const localizedStringSchema = z
  .object({
    en: z.string().min(1),
    fr: z.string().min(1).optional(),
    status: z
      .object({
        en: translationStatusSchema.optional(),
        fr: translationStatusSchema.optional()
      })
      .strict()
      .optional()
  })
  .strict();

export const localizedContentSchema = localizedStringSchema;
