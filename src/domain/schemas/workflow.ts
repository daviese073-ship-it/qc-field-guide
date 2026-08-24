import { z } from "zod";

import { conditionIdSchema } from "@/domain/schemas/condition";
import {
  canonicalIdSchema,
  contentBlocksSchema,
  sourceReferenceSchema
} from "@/domain/schemas/content";
import {
  localizedContentSchema,
  localizedStringSchema
} from "@/domain/schemas/localization";

export const workflowStageSchema = z
  .object({
    id: canonicalIdSchema,
    title: localizedStringSchema,
    description: localizedContentSchema.optional(),
    activityIds: z.array(canonicalIdSchema).optional(),
    gateIds: z.array(canonicalIdSchema).optional(),
    relationshipIds: z.array(canonicalIdSchema).optional(),
    conditionId: conditionIdSchema.optional()
  })
  .strict();

export const workflowSchema = z
  .object({
    id: canonicalIdSchema,
    title: localizedStringSchema,
    description: localizedContentSchema.optional(),
    stages: z.array(workflowStageSchema).optional(),
    activityIds: z.array(canonicalIdSchema).optional(),
    gateIds: z.array(canonicalIdSchema).optional(),
    relatedRelationshipIds: z.array(canonicalIdSchema).optional(),
    evidenceFocus: contentBlocksSchema.optional(),
    issuePath: contentBlocksSchema.optional(),
    flags: z.array(z.string().min(1)).optional(),
    sourceRef: sourceReferenceSchema.optional()
  })
  .strict();

export const preConcealmentWorkflowSchema = z
  .object({
    id: canonicalIdSchema,
    title: localizedStringSchema,
    gateIds: z.array(canonicalIdSchema).optional(),
    activityIds: z.array(canonicalIdSchema).optional(),
    criticalChecks: contentBlocksSchema.optional(),
    evidence: contentBlocksSchema.optional(),
    blockIf: contentBlocksSchema.optional(),
    nextActivityIds: z.array(canonicalIdSchema).optional(),
    sourceRef: sourceReferenceSchema.optional()
  })
  .strict();
