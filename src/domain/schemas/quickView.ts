import { z } from "zod";

import {
  canonicalIdSchema,
  contentBlocksSchema
} from "@/domain/schemas/content";
import { localizedContentSchema } from "@/domain/schemas/localization";

export const quickGateNextSchema = z
  .object({
    gateIds: z.array(canonicalIdSchema).optional(),
    nextActivityIds: z.array(canonicalIdSchema).optional(),
    note: localizedContentSchema.optional()
  })
  .strict();

export const quickViewSchema = z
  .object({
    activityId: canonicalIdSchema,
    before: contentBlocksSchema.optional(),
    inspect: contentBlocksSchema.optional(),
    evidence: contentBlocksSchema.optional(),
    watchFor: contentBlocksSchema.optional(),
    dontMiss: contentBlocksSchema.optional(),
    gateNext: quickGateNextSchema.optional(),
    priorityRelationshipIds: z.array(canonicalIdSchema).optional(),
    specialistAlert: localizedContentSchema.optional(),
    invalidationAlert: localizedContentSchema.optional(),
    qcThinkEnabled: z.boolean().optional()
  })
  .strict();
