import { z } from "zod";

import {
  acronymEntrySchema,
  activitySchema,
  conditionDefinitionSchema,
  gateSchema,
  invalidationRuleSchema,
  learnContentSchema,
  preConcealmentWorkflowSchema,
  quickViewSchema,
  relationshipSchema,
  sectionSchema,
  terminologyConceptSchema,
  uiStringSchema,
  versionInfoSchema,
  workflowSchema
} from "@/domain/schemas";

export const canonicalDatasetSchema = z
  .object({
    sections: z.array(sectionSchema),
    activities: z.array(activitySchema),
    quickViews: z.array(quickViewSchema),
    learnContent: z.array(learnContentSchema),
    relationships: z.array(relationshipSchema),
    gates: z.array(gateSchema),
    invalidationRules: z.array(invalidationRuleSchema),
    conditions: z.array(conditionDefinitionSchema),
    workflows: z.array(workflowSchema),
    preConcealmentWorkflows: z.array(preConcealmentWorkflowSchema),
    terminology: z.array(terminologyConceptSchema),
    acronyms: z.array(acronymEntrySchema),
    uiStrings: z.array(uiStringSchema),
    version: versionInfoSchema
  })
  .strict();

export type CanonicalDataset = z.infer<typeof canonicalDatasetSchema>;
export type CanonicalDatasetInput = z.input<typeof canonicalDatasetSchema>;
