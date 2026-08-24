import { z } from "zod";

import { canonicalIdSchema } from "@/domain/schemas/content";

export const searchableObjectTypeSchema = z.enum([
  "section",
  "activity",
  "workflow",
  "preConcealment",
  "gate",
  "term",
  "acronym"
]);

export const searchIndexEntrySchema = z
  .object({
    objectId: canonicalIdSchema,
    objectType: searchableObjectTypeSchema,
    preferred: z
      .object({
        en: z.string().min(1).optional(),
        fr: z.string().min(1).optional()
      })
      .strict()
      .optional(),
    aliases: z
      .object({
        en: z.array(z.string().min(1)).optional(),
        fr: z.array(z.string().min(1)).optional()
      })
      .strict()
      .optional(),
    acronyms: z.array(z.string().min(1)).optional(),
    normalizedTerms: z.array(z.string().min(1)).optional(),
    tokens: z.array(z.string().min(1)).optional(),
    discipline: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    relationBoostIds: z.array(canonicalIdSchema).optional(),
    baseWeight: z.number().optional()
  })
  .strict();

export const searchMatchTypeSchema = z.enum([
  "preferred",
  "alias",
  "acronym",
  "normalized",
  "token",
  "fuzzy"
]);

export const searchResultSchema = z
  .object({
    objectId: canonicalIdSchema,
    objectType: searchableObjectTypeSchema,
    score: z.number(),
    matchType: searchMatchTypeSchema
  })
  .strict();
