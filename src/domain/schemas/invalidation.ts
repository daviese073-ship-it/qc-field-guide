import { z } from "zod";

import { conditionIdSchema } from "@/domain/schemas/condition";
import {
  canonicalIdSchema,
  contentBlocksSchema,
  sourceReferenceSchema
} from "@/domain/schemas/content";
import { localizedContentSchema } from "@/domain/schemas/localization";

export const invalidationSeveritySchema = z.enum(["low", "medium", "high"]);

export const invalidationActionSchema = z.enum([
  "FLAG_FOR_REVIEW",
  "REOPEN_ACTIVITY",
  "REOPEN_GATE",
  "INVALIDATE_TEST",
  "UPDATE_RECORD_REQUIRED"
]);

export const invalidationRuleSchema = z
  .object({
    id: canonicalIdSchema,
    trigger: localizedContentSchema,
    affectedActivityIds: z.array(canonicalIdSchema).optional(),
    affectedGateIds: z.array(canonicalIdSchema).optional(),
    affectedNodeIds: z.array(canonicalIdSchema).optional(),
    reason: localizedContentSchema.optional(),
    recheckGuidance: contentBlocksSchema.optional(),
    severity: invalidationSeveritySchema,
    actions: z.array(invalidationActionSchema).optional(),
    conditionId: conditionIdSchema.optional(),
    smallestDefensibleScope: localizedContentSchema.optional(),
    sourceRef: sourceReferenceSchema.optional()
  })
  .strict();
