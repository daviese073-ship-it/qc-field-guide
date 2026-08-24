import { z } from "zod";

import {
  canonicalIdSchema,
  sourceReferenceSchema
} from "@/domain/schemas/content";
import {
  localizedContentSchema,
  localizedStringSchema
} from "@/domain/schemas/localization";

export const terminologyStatusSchema = z.enum([
  "validated",
  "provisional",
  "missing"
]);

export const terminologyConfidenceSchema = z.enum(["low", "medium", "high"]);

const localizedAliasesSchema = z
  .object({
    en: z.array(z.string().min(1)).optional(),
    fr: z.array(z.string().min(1)).optional()
  })
  .strict();

const preferredTermSchema = z
  .object({
    en: z.string().min(1),
    fr: z.string().min(1).optional()
  })
  .strict();

export const terminologyConceptSchema = z
  .object({
    id: canonicalIdSchema,
    discipline: z.string().min(1).optional(),
    preferred: preferredTermSchema,
    aliases: localizedAliasesSchema.optional(),
    definition: localizedContentSchema.optional(),
    contextNotes: localizedContentSchema.optional(),
    relatedActivityIds: z.array(canonicalIdSchema).optional(),
    relatedConceptIds: z.array(canonicalIdSchema).optional(),
    status: z
      .object({
        en: terminologyStatusSchema.optional(),
        fr: terminologyStatusSchema.optional()
      })
      .strict()
      .optional(),
    confidence: z
      .object({
        en: terminologyConfidenceSchema.optional(),
        fr: terminologyConfidenceSchema.optional()
      })
      .strict()
      .optional(),
    sourceRef: sourceReferenceSchema.optional()
  })
  .strict();

export const termReferenceSchema = z
  .object({
    conceptId: canonicalIdSchema,
    label: localizedStringSchema.optional()
  })
  .strict();
