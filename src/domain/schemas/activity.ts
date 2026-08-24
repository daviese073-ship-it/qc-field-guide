import { z } from "zod";

import {
  canonicalIdSchema,
  contentBlocksSchema,
  contentItemSchema,
  sourceReferenceSchema
} from "@/domain/schemas/content";
import {
  localizedContentSchema,
  localizedStringSchema
} from "@/domain/schemas/localization";

export const nodeTagSchema = z.enum([
  "activity",
  "umbrella",
  "interface",
  "gate",
  "preConcealment",
  "testing",
  "commissioning",
  "highControl",
  "traceabilityCritical",
  "closeout",
  "closeoutHub",
  "acceptanceGate",
  "specialistInterface",
  "interfaceHub",
  "testingHub"
]);

export const statusFamilySchema = z.enum([
  "ActivityStatus",
  "GateStatus",
  "DeficiencyStatus",
  "NCStatus",
  "TestStatus",
  "AcceptanceStatus"
]);

export const userVisibleFlagSchema = z.enum([
  "highControl",
  "traceabilityCritical",
  "specialistInterface",
  "preConcealment",
  "acceptanceGate"
]);

const inspectionSchema = z
  .object({
    before: contentBlocksSchema.optional(),
    during: contentBlocksSchema.optional(),
    after: contentBlocksSchema.optional(),
    testing: contentBlocksSchema.optional()
  })
  .strict();

const issuesSchema = z
  .object({
    commonDeficiencies: contentBlocksSchema.optional(),
    escalationTriggers: contentBlocksSchema.optional()
  })
  .strict();

const communicationsSchema = z
  .object({
    before: contentBlocksSchema.optional(),
    during: contentBlocksSchema.optional(),
    issueEscalation: contentBlocksSchema.optional(),
    after: contentBlocksSchema.optional()
  })
  .strict();

const outputsSchema = z
  .object({
    records: contentBlocksSchema.optional(),
    acceptanceEvidence: contentBlocksSchema.optional(),
    followUp: contentBlocksSchema.optional()
  })
  .strict();

const activitySearchRefsSchema = z
  .object({
    aliasesEn: z.array(z.string().min(1)).optional(),
    aliasesFr: z.array(z.string().min(1)).optional(),
    acronyms: z.array(canonicalIdSchema).optional(),
    keywords: z.array(z.string().min(1)).optional()
  })
  .strict();

const activityLogicSchema = z
  .object({
    statusFamily: statusFamilySchema.optional(),
    gateIds: z.array(canonicalIdSchema).optional(),
    invalidationRuleIds: z.array(canonicalIdSchema).optional()
  })
  .strict();

export const activitySchema = z
  .object({
    id: canonicalIdSchema,
    sectionId: canonicalIdSchema,
    title: localizedStringSchema,
    nodeTags: z.array(nodeTagSchema).default(["activity"]),
    qualityObjective: localizedContentSchema.optional(),
    applicability: localizedContentSchema.optional(),
    authorityNote: localizedContentSchema.optional(),
    requirements: contentBlocksSchema.optional(),
    planning: contentBlocksSchema.optional(),
    documentControl: contentBlocksSchema.optional(),
    materialControl: contentBlocksSchema.optional(),
    inspection: inspectionSchema.optional(),
    evidence: contentBlocksSchema.optional(),
    issues: issuesSchema.optional(),
    correctiveAction: contentBlocksSchema.optional(),
    verification: contentBlocksSchema.optional(),
    closureCriteria: contentBlocksSchema.optional(),
    communications: communicationsSchema.optional(),
    outputs: outputsSchema.optional(),
    reportingAnalysis: contentBlocksSchema.optional(),
    qualityCheckpoint: contentBlocksSchema.optional(),
    specialistBoundary: contentItemSchema.optional(),
    flags: z.array(userVisibleFlagSchema).optional(),
    searchRefs: activitySearchRefsSchema.optional(),
    terminologyRefs: z.array(canonicalIdSchema).optional(),
    logic: activityLogicSchema.optional(),
    sourceRef: sourceReferenceSchema.optional()
  })
  .strict();
