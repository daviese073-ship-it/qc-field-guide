import { z } from "zod";

import { canonicalIdSchema, sourceReferenceSchema } from "./content";
import { localizedContentSchema, localizedStringSchema } from "./localization";

export const generalQcFieldWorkflowEntrySchema = z
  .object({
    sequence: z.number().int().positive(),
    action: localizedStringSchema,
    detail: localizedContentSchema
  })
  .strict();

export const generalQcAdditionalSectionSchema = z
  .object({
    title: localizedStringSchema,
    items: z.array(localizedContentSchema).min(1)
  })
  .strict();

export const generalQcProcessSchema = z
  .object({
    id: canonicalIdSchema,
    sequence: z.number().int().min(1).max(16),
    title: localizedStringSchema,
    summary: localizedContentSchema,
    whenToUse: localizedContentSchema,
    fieldWorkflow: z.array(generalQcFieldWorkflowEntrySchema).min(1),
    whatToCapture: z.array(localizedContentSchema).min(1),
    keyReminders: z.array(localizedContentSchema).min(1),
    commonMistakes: z.array(localizedContentSchema).min(1),
    typicalOutputs: z.array(localizedContentSchema).min(1),
    relatedProcessIds: z.array(canonicalIdSchema),
    additionalSections: z.array(generalQcAdditionalSectionSchema).optional(),
    sourceRef: sourceReferenceSchema.optional()
  })
  .strict();

export const generalQcQualityRecordElementSchema = z
  .object({
    key: localizedStringSchema,
    question: localizedContentSchema
  })
  .strict();

export const generalQcUniversalReferenceSchema = z
  .object({
    id: canonicalIdSchema,
    title: localizedStringSchema,
    fieldPrinciple: z.array(localizedStringSchema).length(6),
    beforeAnyInspection: z.array(localizedContentSchema).min(1),
    whenYouFindAProblem: z.array(localizedContentSchema).min(1),
    minimumUsefulQualityRecord: z
      .array(generalQcQualityRecordElementSchema)
      .min(1),
    importantLimitations: z.array(localizedContentSchema).min(1),
    sourceRef: sourceReferenceSchema.optional()
  })
  .strict();
