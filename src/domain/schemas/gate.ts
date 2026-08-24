import { z } from "zod";

import { nodeTagSchema } from "@/domain/schemas/activity";
import {
  canonicalIdSchema,
  contentBlocksSchema,
  sourceReferenceSchema
} from "@/domain/schemas/content";
import {
  localizedContentSchema,
  localizedStringSchema
} from "@/domain/schemas/localization";

export const gateTypeSchema = canonicalIdSchema;

export const gateSchema = z
  .object({
    id: canonicalIdSchema,
    title: localizedStringSchema,
    gateType: gateTypeSchema,
    tags: z.array(nodeTagSchema).optional(),
    purpose: localizedContentSchema.optional(),
    prerequisiteActivityIds: z.array(canonicalIdSchema).optional(),
    checkItems: contentBlocksSchema.optional(),
    blockingConditions: contentBlocksSchema.optional(),
    releaseCondition: localizedContentSchema.optional(),
    downstreamActivityIds: z.array(canonicalIdSchema).optional(),
    invalidationRuleIds: z.array(canonicalIdSchema).optional(),
    authorityNote: localizedContentSchema.optional(),
    sourceRef: sourceReferenceSchema.optional()
  })
  .strict();
