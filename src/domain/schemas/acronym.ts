import { z } from "zod";

import {
  canonicalIdSchema,
  sourceReferenceSchema
} from "@/domain/schemas/content";
import {
  localizedContentSchema,
  localizedStringSchema
} from "@/domain/schemas/localization";
import {
  terminologyConfidenceSchema,
  terminologyStatusSchema
} from "@/domain/schemas/terminology";

const localizedStringArraySchema = z
  .object({
    en: z.array(z.string().min(1)).optional(),
    fr: z.array(z.string().min(1)).optional(),
    shared: z.array(z.string().min(1)).optional()
  })
  .strict();

export const acronymRelationTypeSchema = z.enum([
  "EXACT_EQUIVALENT",
  "SHARED_ACRONYM",
  "RELATED_NOT_EQUIVALENT",
  "ORGANIZATION_SPECIFIC"
]);

export const acronymEntrySchema = z
  .object({
    id: canonicalIdSchema,
    preferredLabel: localizedStringSchema.optional(),
    abbreviations: localizedStringArraySchema,
    fullForms: localizedStringArraySchema.optional(),
    definition: localizedContentSchema.optional(),
    relationType: acronymRelationTypeSchema,
    relatedConceptIds: z.array(canonicalIdSchema).optional(),
    relatedActivityIds: z.array(canonicalIdSchema).optional(),
    relatedWorkflowIds: z.array(canonicalIdSchema).optional(),
    relatedGateIds: z.array(canonicalIdSchema).optional(),
    aliases: z.array(z.string().min(1)).optional(),
    organizationSpecific: z.boolean().optional(),
    projectSpecific: z.boolean().optional(),
    provisional: z.boolean().optional(),
    status: z
      .object({
        en: terminologyStatusSchema.optional(),
        fr: terminologyStatusSchema.optional()
      })
      .strict()
      .optional(),
    confidence: terminologyConfidenceSchema.optional(),
    sourceRef: sourceReferenceSchema.optional()
  })
  .strict();
