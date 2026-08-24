import { z } from "zod";

import { conditionIdSchema } from "@/domain/schemas/condition";
import {
  localizedContentSchema,
  localizedStringSchema
} from "@/domain/schemas/localization";

export const canonicalIdSchema = z.string().min(1);

export const sourceReferenceSchema = z
  .object({
    build: z.string().min(1).optional(),
    document: z.string().min(1).optional(),
    section: z.string().min(1).optional(),
    page: z.string().min(1).optional(),
    note: localizedStringSchema.optional()
  })
  .strict();

export const authorityMetadataSchema = z
  .object({
    projectDocumentsGovern: z.boolean().optional(),
    specialistRequired: z.boolean().optional(),
    authorizedProcessRequired: z.boolean().optional(),
    note: localizedStringSchema.optional()
  })
  .strict();

export const highControlMetadataSchema = z
  .object({
    highControl: z.boolean().optional(),
    traceabilityCritical: z.boolean().optional(),
    evidenceRequired: z.boolean().optional(),
    note: localizedStringSchema.optional()
  })
  .strict();

export const contentItemSchema = z
  .object({
    id: canonicalIdSchema,
    text: localizedContentSchema,
    conditionId: conditionIdSchema.optional(),
    terminologyRefs: z.array(canonicalIdSchema).optional(),
    authority: authorityMetadataSchema.optional(),
    highControl: highControlMetadataSchema.optional(),
    sourceRef: sourceReferenceSchema.optional()
  })
  .strict();

export const practicalExampleSchema = z
  .object({
    id: canonicalIdSchema.optional(),
    situation: localizedContentSchema.optional(),
    observation: localizedContentSchema.optional(),
    qualityConcern: localizedContentSchema.optional(),
    reasoning: localizedContentSchema.optional(),
    actionPath: localizedContentSchema.optional(),
    closure: localizedContentSchema.optional(),
    lesson: localizedContentSchema.optional(),
    sourceRef: sourceReferenceSchema.optional()
  })
  .strict();

export const contentBlockSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("paragraph"),
      item: contentItemSchema
    })
    .strict(),
  z
    .object({
      type: z.literal("bulletList"),
      items: z.array(contentItemSchema).min(1)
    })
    .strict(),
  z
    .object({
      type: z.literal("checkList"),
      items: z.array(contentItemSchema).min(1)
    })
    .strict(),
  z
    .object({
      type: z.literal("subheading"),
      text: localizedStringSchema
    })
    .strict(),
  z
    .object({
      type: z.literal("notice"),
      tone: z.enum(["info", "caution", "authority", "highControl"]),
      item: contentItemSchema
    })
    .strict(),
  z
    .object({
      type: z.literal("example"),
      example: practicalExampleSchema
    })
    .strict(),
  z
    .object({
      type: z.literal("referenceList"),
      references: z.array(sourceReferenceSchema).min(1)
    })
    .strict()
]);

export const contentBlocksSchema = z.array(contentBlockSchema);
