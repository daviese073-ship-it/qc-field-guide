import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { CanonicalRegistries } from "@/domain/registries";
import type {
  Activity,
  ContentBlock,
  ContentItem,
  LocalizedContent,
  PreConcealmentWorkflow,
  Workflow
} from "@/domain/types";

const expectedSectionCount = 14;
const expectedActivityCount = 139;

export const expectedProductionWorkflowIds = [
  "WF-CON-01",
  "WF-WALL-01",
  "WF-CEILING-01",
  "WF-ROOF-01",
  "WF-ROOF-02",
  "WF-UG-01",
  "WF-EQP-01",
  "WF-EQP-02",
  "WF-TST-01",
  "WF-FIRE-01",
  "WF-DEF-01",
  "WF-FINAL-01"
] as const;

export const expectedProductionPreConcealmentWorkflowIds = [
  "PC-CON-01",
  "PC-WALL-01",
  "PC-CEILING-01",
  "PC-ROOF-01",
  "PC-UG-01",
  "PC-FIRE-01",
  "PC-MEP-01"
] as const;

const activityBlockFields = [
  "requirements",
  "planning",
  "documentControl",
  "materialControl",
  "evidence",
  "correctiveAction",
  "verification",
  "closureCriteria",
  "reportingAnalysis",
  "qualityCheckpoint"
] as const;

const workflowContentFields = ["evidenceFocus", "issuePath"] as const;
const preConcealmentContentFields = [
  "criticalChecks",
  "evidence",
  "blockIf"
] as const;

const activityFieldSourceRefs = new Set([
  "qualityObjective",
  "applicability",
  "authorityNote",
  "specialistBoundary"
]);

const forbiddenProjectQmsFields = [
  "approvedBy",
  "releasedBy",
  "signedBy",
  "approvalTimestamp",
  "actualStatus",
  "projectReleaseNumber",
  "inspectorAcceptance",
  "clientApproval",
  "signature",
  "completedAt",
  "completedBy"
] as const;

const languageSpecificIdPattern = /(?:^|[-_/])(en|fr)(?:$|[-_/])/i;

export interface ProductionWorkflowAuditReport {
  ok: boolean;
  errors: readonly string[];
  sectionCount: number;
  activityCount: number;
  workflowCount: number;
  preConcealmentWorkflowCount: number;
  activitiesWithWorkflowData: number;
  activitiesWithoutWorkflowData: number;
  activitiesWithPreConcealmentData: number;
  activitiesWithoutPreConcealmentData: number;
  workflowContentItemCount: number;
  preConcealmentContentItemCount: number;
  sourceLinkedWorkflowItemCount: number;
  unresolvedSourceReferenceCount: number;
  duplicateWorkflowIdCount: number;
  duplicatePreConcealmentIdCount: number;
  duplicateWorkflowItemIdCount: number;
  emptyWorkflowRecordCount: number;
  emptyPreConcealmentRecordCount: number;
  invalidReferenceCount: number;
  incorrectPreConcealmentApplicabilityCount: number;
  localizedWorkflowValueCount: number;
  localizedWorkflowEnCount: number;
  localizedWorkflowFrCount: number;
  localizedWorkflowProvisionalFrCount: number;
  localizedWorkflowValidatedFrCount: number;
  localizedWorkflowFallbackOnlyCount: number;
  missingFrenchStatusCount: number;
  sourceLimitedWorkflowGapCount: number;
  sourceLimitedPreConcealmentGapCount: number;
  languageSpecificIdCount: number;
}

const countDuplicates = (ids: readonly string[]) => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }

  return duplicates.size;
};

const collectBlockItems = (blocks: readonly ContentBlock[] | undefined) => {
  const items: ContentItem[] = [];

  for (const block of blocks ?? []) {
    switch (block.type) {
      case "paragraph":
      case "notice":
        items.push(block.item);
        break;
      case "bulletList":
      case "checkList":
        items.push(...block.items);
        break;
      case "example":
      case "referenceList":
      case "subheading":
        break;
    }
  }

  return items;
};

const collectActivitySourceItems = (activity: Activity) => [
  ...activityBlockFields.flatMap((field) => collectBlockItems(activity[field])),
  ...collectBlockItems(activity.inspection?.before),
  ...collectBlockItems(activity.inspection?.during),
  ...collectBlockItems(activity.inspection?.after),
  ...collectBlockItems(activity.inspection?.testing),
  ...collectBlockItems(activity.issues?.commonDeficiencies),
  ...collectBlockItems(activity.issues?.escalationTriggers),
  ...collectBlockItems(activity.communications?.before),
  ...collectBlockItems(activity.communications?.during),
  ...collectBlockItems(activity.communications?.issueEscalation),
  ...collectBlockItems(activity.communications?.after),
  ...collectBlockItems(activity.outputs?.records),
  ...collectBlockItems(activity.outputs?.acceptanceEvidence),
  ...collectBlockItems(activity.outputs?.followUp),
  ...(activity.specialistBoundary ? [activity.specialistBoundary] : [])
];

const collectWorkflowItems = (workflow: Workflow) =>
  workflowContentFields.flatMap((field) => collectBlockItems(workflow[field]));

const collectPreConcealmentItems = (workflow: PreConcealmentWorkflow) =>
  preConcealmentContentFields.flatMap((field) =>
    collectBlockItems(workflow[field])
  );

const collectWorkflowLocalizedValues = (workflow: Workflow) => [
  workflow.title,
  workflow.description,
  ...(workflow.stages ?? []).flatMap((stage) => [stage.title, stage.description])
];

const hasResolvedSourceReference = (
  item: ContentItem,
  registries: CanonicalRegistries,
  activitySourceItemIds: ReadonlyMap<string, ReadonlySet<string>>
) => {
  const sourceActivityId = item.sourceRef?.section;
  const sourcePage = item.sourceRef?.page;

  if (!sourceActivityId || !sourcePage) {
    return false;
  }

  return (
    registries.activities.has(sourceActivityId) &&
    (activitySourceItemIds.get(sourceActivityId)?.has(sourcePage) ||
      activityFieldSourceRefs.has(sourcePage))
  );
};

const auditLocalizedValue = (
  value: LocalizedContent | undefined,
  counts: {
    localizedWorkflowValueCount: number;
    localizedWorkflowEnCount: number;
    localizedWorkflowFrCount: number;
    localizedWorkflowProvisionalFrCount: number;
    localizedWorkflowValidatedFrCount: number;
    missingFrenchStatusCount: number;
  }
) => {
  if (!value) return;

  counts.localizedWorkflowValueCount += 1;
  if (value.en) counts.localizedWorkflowEnCount += 1;
  if (value.fr) counts.localizedWorkflowFrCount += 1;
  if (value.status?.fr === "provisional") {
    counts.localizedWorkflowProvisionalFrCount += 1;
  }
  if (value.status?.fr === "validated") {
    counts.localizedWorkflowValidatedFrCount += 1;
  }
  if (value.fr && !value.status?.fr) {
    counts.missingFrenchStatusCount += 1;
  }
};

const collectGateScopedActivityIds = (
  workflow: PreConcealmentWorkflow,
  registries: CanonicalRegistries
) =>
  new Set(
    (workflow.gateIds ?? []).flatMap((gateId) => {
      const gate = registries.gates.getById(gateId);

      return [
        ...(gate?.prerequisiteActivityIds ?? []),
        ...(gate?.downstreamActivityIds ?? [])
      ];
    })
  );

const hasForbiddenProjectQmsField = (record: unknown) => {
  const serialized = JSON.stringify(record);

  return forbiddenProjectQmsFields.find((field) =>
    serialized.includes(`"${field}"`)
  );
};

export const auditProductionWorkflowDataset = (
  dataset: CanonicalDataset,
  registries: CanonicalRegistries
): ProductionWorkflowAuditReport => {
  const errors: string[] = [];
  const expectedWorkflowIds = new Set<string>(expectedProductionWorkflowIds);
  const expectedPreConcealmentIds = new Set<string>(
    expectedProductionPreConcealmentWorkflowIds
  );
  const activitySourceItemIds = new Map<string, Set<string>>();
  const workflowActivityIds = new Set<string>();
  const preConcealmentActivityIds = new Set<string>();
  const workflowContentItemIds = new Set<string>();
  const duplicateWorkflowContentItemIds = new Set<string>();
  const invalidReferenceMessages = new Set<string>();
  const counts = {
    localizedWorkflowValueCount: 0,
    localizedWorkflowEnCount: 0,
    localizedWorkflowFrCount: 0,
    localizedWorkflowProvisionalFrCount: 0,
    localizedWorkflowValidatedFrCount: 0,
    missingFrenchStatusCount: 0
  };
  let workflowContentItemCount = 0;
  let preConcealmentContentItemCount = 0;
  let sourceLinkedWorkflowItemCount = 0;
  let unresolvedSourceReferenceCount = 0;
  let emptyWorkflowRecordCount = 0;
  let emptyPreConcealmentRecordCount = 0;
  let incorrectPreConcealmentApplicabilityCount = 0;
  let sourceLimitedWorkflowGapCount = 0;
  let sourceLimitedPreConcealmentGapCount = 0;

  for (const activity of registries.activities.getAll()) {
    activitySourceItemIds.set(
      activity.id,
      new Set(collectActivitySourceItems(activity).map((item) => item.id))
    );
  }

  const auditItem = (item: ContentItem, context: string) => {
    if (workflowContentItemIds.has(item.id)) {
      duplicateWorkflowContentItemIds.add(item.id);
    }
    workflowContentItemIds.add(item.id);

    auditLocalizedValue(item.text, counts);

    if (hasResolvedSourceReference(item, registries, activitySourceItemIds)) {
      sourceLinkedWorkflowItemCount += 1;
    } else {
      unresolvedSourceReferenceCount += 1;
      errors.push(`${context} item "${item.id}" has unresolved sourceRef.`);
    }
  };

  if (dataset.sections.length !== expectedSectionCount) {
    errors.push(
      `Expected ${expectedSectionCount} production sections; found ${dataset.sections.length}.`
    );
  }
  if (registries.activities.getAll().length !== expectedActivityCount) {
    errors.push(
      `Expected ${expectedActivityCount} production activities; found ${registries.activities.getAll().length}.`
    );
  }

  const workflowIds = dataset.workflows.map((workflow) => workflow.id);
  const preConcealmentIds = dataset.preConcealmentWorkflows.map(
    (workflow) => workflow.id
  );
  const duplicateWorkflowIdCount = countDuplicates(workflowIds);
  const duplicatePreConcealmentIdCount = countDuplicates(preConcealmentIds);

  if (duplicateWorkflowIdCount > 0) {
    errors.push(`Found ${duplicateWorkflowIdCount} duplicate workflow IDs.`);
  }
  if (duplicatePreConcealmentIdCount > 0) {
    errors.push(
      `Found ${duplicatePreConcealmentIdCount} duplicate pre-concealment workflow IDs.`
    );
  }

  for (const id of expectedProductionWorkflowIds) {
    if (!dataset.workflows.some((workflow) => workflow.id === id)) {
      errors.push(`Missing production workflow ID "${id}".`);
    }
  }
  for (const workflow of dataset.workflows) {
    if (!expectedWorkflowIds.has(workflow.id)) {
      errors.push(`Unsupported production workflow ID "${workflow.id}".`);
    }
  }

  for (const id of expectedProductionPreConcealmentWorkflowIds) {
    if (
      !dataset.preConcealmentWorkflows.some((workflow) => workflow.id === id)
    ) {
      errors.push(`Missing production pre-concealment workflow ID "${id}".`);
    }
  }
  for (const workflow of dataset.preConcealmentWorkflows) {
    if (!expectedPreConcealmentIds.has(workflow.id)) {
      errors.push(
        `Unsupported production pre-concealment workflow ID "${workflow.id}".`
      );
    }
  }

  for (const workflow of dataset.workflows) {
    const forbiddenField = hasForbiddenProjectQmsField(workflow);
    if (forbiddenField) {
      errors.push(
        `Workflow "${workflow.id}" contains forbidden project-QMS field "${forbiddenField}".`
      );
    }
    if (workflow.sourceRef?.build !== "Build 5") {
      errors.push(`Workflow "${workflow.id}" is missing Build 5 provenance.`);
    }
    if (!(workflow.stages?.length && workflow.activityIds?.length)) {
      emptyWorkflowRecordCount += 1;
      errors.push(`Workflow "${workflow.id}" has no meaningful stage/activity data.`);
    }

    for (const value of collectWorkflowLocalizedValues(workflow)) {
      auditLocalizedValue(value, counts);
    }

    for (const activityId of workflow.activityIds ?? []) {
      workflowActivityIds.add(activityId);
      if (!registries.activities.has(activityId)) {
        invalidReferenceMessages.add(
          `Workflow "${workflow.id}" references missing activity "${activityId}".`
        );
      }
    }
    for (const gateId of workflow.gateIds ?? []) {
      if (!registries.gates.has(gateId)) {
        invalidReferenceMessages.add(
          `Workflow "${workflow.id}" references missing gate "${gateId}".`
        );
      }
    }
    for (const relationshipId of workflow.relatedRelationshipIds ?? []) {
      if (!registries.relationships.has(relationshipId)) {
        invalidReferenceMessages.add(
          `Workflow "${workflow.id}" references missing relationship "${relationshipId}".`
        );
      }
    }

    for (const stage of workflow.stages ?? []) {
      for (const activityId of stage.activityIds ?? []) {
        if (!registries.activities.has(activityId)) {
          invalidReferenceMessages.add(
            `Workflow "${workflow.id}" stage "${stage.id}" references missing activity "${activityId}".`
          );
        }
      }
      for (const gateId of stage.gateIds ?? []) {
        if (!registries.gates.has(gateId)) {
          invalidReferenceMessages.add(
            `Workflow "${workflow.id}" stage "${stage.id}" references missing gate "${gateId}".`
          );
        }
      }
      for (const relationshipId of stage.relationshipIds ?? []) {
        if (!registries.relationships.has(relationshipId)) {
          invalidReferenceMessages.add(
            `Workflow "${workflow.id}" stage "${stage.id}" references missing relationship "${relationshipId}".`
          );
        }
      }
      if (stage.conditionId && !registries.conditions.has(stage.conditionId)) {
        invalidReferenceMessages.add(
          `Workflow "${workflow.id}" stage "${stage.id}" references missing condition "${stage.conditionId}".`
        );
      }
    }

    const items = collectWorkflowItems(workflow);
    workflowContentItemCount += items.length;
    if (items.length < 4) {
      sourceLimitedWorkflowGapCount += 1;
    }
    for (const item of items) {
      auditItem(item, `Workflow "${workflow.id}"`);
    }
  }

  for (const workflow of dataset.preConcealmentWorkflows) {
    const forbiddenField = hasForbiddenProjectQmsField(workflow);
    if (forbiddenField) {
      errors.push(
        `PreConcealmentWorkflow "${workflow.id}" contains forbidden project-QMS field "${forbiddenField}".`
      );
    }
    if (workflow.sourceRef?.build !== "Build 5") {
      errors.push(
        `PreConcealmentWorkflow "${workflow.id}" is missing Build 5 provenance.`
      );
    }
    if (
      !(workflow.gateIds?.length && workflow.activityIds?.length) ||
      collectPreConcealmentItems(workflow).length === 0
    ) {
      emptyPreConcealmentRecordCount += 1;
      errors.push(
        `PreConcealmentWorkflow "${workflow.id}" has no meaningful gate/activity/check data.`
      );
    }

    auditLocalizedValue(workflow.title, counts);
    const allowedActivityIds = collectGateScopedActivityIds(workflow, registries);

    for (const gateId of workflow.gateIds ?? []) {
      const gate = registries.gates.getById(gateId);
      if (!gate) {
        invalidReferenceMessages.add(
          `PreConcealmentWorkflow "${workflow.id}" references missing gate "${gateId}".`
        );
        continue;
      }
      if (!gate.tags?.includes("preConcealment")) {
        incorrectPreConcealmentApplicabilityCount += 1;
        errors.push(
          `PreConcealmentWorkflow "${workflow.id}" references gate "${gateId}" without preConcealment tag.`
        );
      }
    }

    for (const activityId of workflow.activityIds ?? []) {
      preConcealmentActivityIds.add(activityId);
      if (!registries.activities.has(activityId)) {
        invalidReferenceMessages.add(
          `PreConcealmentWorkflow "${workflow.id}" references missing activity "${activityId}".`
        );
      }
      if (registries.activities.has(activityId) && !allowedActivityIds.has(activityId)) {
        incorrectPreConcealmentApplicabilityCount += 1;
        errors.push(
          `PreConcealmentWorkflow "${workflow.id}" references activity "${activityId}" outside its linked gate scope.`
        );
      }
    }

    for (const activityId of workflow.nextActivityIds ?? []) {
      if (!registries.activities.has(activityId)) {
        invalidReferenceMessages.add(
          `PreConcealmentWorkflow "${workflow.id}" references missing next activity "${activityId}".`
        );
      }
    }

    const items = collectPreConcealmentItems(workflow);
    preConcealmentContentItemCount += items.length;
    if (items.length < 6) {
      sourceLimitedPreConcealmentGapCount += 1;
    }
    for (const item of items) {
      auditItem(item, `PreConcealmentWorkflow "${workflow.id}"`);
    }
  }

  if (duplicateWorkflowContentItemIds.size > 0) {
    errors.push(
      `Found ${duplicateWorkflowContentItemIds.size} duplicate workflow content item IDs.`
    );
  }

  for (const message of invalidReferenceMessages) {
    errors.push(message);
  }

  if (counts.missingFrenchStatusCount > 0) {
    errors.push(
      `Found ${counts.missingFrenchStatusCount} workflow values with French text but no French status.`
    );
  }
  if (counts.localizedWorkflowFrCount !== counts.localizedWorkflowValueCount) {
    errors.push(
      `Expected French text for every workflow localized value; found ${counts.localizedWorkflowFrCount}/${counts.localizedWorkflowValueCount}.`
    );
  }
  if (sourceLinkedWorkflowItemCount !== workflowContentItemCount + preConcealmentContentItemCount) {
    errors.push(
      `Found ${unresolvedSourceReferenceCount} workflow/pre-concealment items with unresolved source references.`
    );
  }

  const allCanonicalIds = [
    ...workflowIds,
    ...preConcealmentIds,
    ...dataset.activities.map((activity) => activity.id)
  ];
  const languageSpecificIdCount = allCanonicalIds.filter((id) =>
    languageSpecificIdPattern.test(id)
  ).length;
  if (languageSpecificIdCount > 0) {
    errors.push(
      `Found ${languageSpecificIdCount} language-specific workflow/activity IDs.`
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    sectionCount: dataset.sections.length,
    activityCount: registries.activities.getAll().length,
    workflowCount: dataset.workflows.length,
    preConcealmentWorkflowCount: dataset.preConcealmentWorkflows.length,
    activitiesWithWorkflowData: workflowActivityIds.size,
    activitiesWithoutWorkflowData:
      registries.activities.getAll().length - workflowActivityIds.size,
    activitiesWithPreConcealmentData: preConcealmentActivityIds.size,
    activitiesWithoutPreConcealmentData:
      registries.activities.getAll().length - preConcealmentActivityIds.size,
    workflowContentItemCount,
    preConcealmentContentItemCount,
    sourceLinkedWorkflowItemCount,
    unresolvedSourceReferenceCount,
    duplicateWorkflowIdCount,
    duplicatePreConcealmentIdCount,
    duplicateWorkflowItemIdCount: duplicateWorkflowContentItemIds.size,
    emptyWorkflowRecordCount,
    emptyPreConcealmentRecordCount,
    invalidReferenceCount: invalidReferenceMessages.size,
    incorrectPreConcealmentApplicabilityCount,
    localizedWorkflowValueCount: counts.localizedWorkflowValueCount,
    localizedWorkflowEnCount: counts.localizedWorkflowEnCount,
    localizedWorkflowFrCount: counts.localizedWorkflowFrCount,
    localizedWorkflowProvisionalFrCount:
      counts.localizedWorkflowProvisionalFrCount,
    localizedWorkflowValidatedFrCount: counts.localizedWorkflowValidatedFrCount,
    localizedWorkflowFallbackOnlyCount:
      counts.localizedWorkflowValueCount - counts.localizedWorkflowFrCount,
    missingFrenchStatusCount: counts.missingFrenchStatusCount,
    sourceLimitedWorkflowGapCount,
    sourceLimitedPreConcealmentGapCount,
    languageSpecificIdCount
  };
};

export const formatProductionWorkflowAuditReport = (
  report: ProductionWorkflowAuditReport
) => {
  const lines = report.ok
    ? ["Phase 015 production workflow audit passed."]
    : [
        "Phase 015 production workflow audit failed.",
        ...report.errors.map((error) => `- ${error}`)
      ];

  return [
    ...lines,
    `Production sections: ${report.sectionCount}`,
    `Production activities: ${report.activityCount}`,
    `Workflow records: ${report.workflowCount}`,
    `PreConcealmentWorkflow records: ${report.preConcealmentWorkflowCount}`,
    `Activities with Workflow data: ${report.activitiesWithWorkflowData}`,
    `Activities without Workflow data: ${report.activitiesWithoutWorkflowData}`,
    `Activities with PreConcealmentWorkflow data: ${report.activitiesWithPreConcealmentData}`,
    `Activities without PreConcealmentWorkflow data: ${report.activitiesWithoutPreConcealmentData}`,
    `Workflow/PreConcealment content items: ${report.workflowContentItemCount}/${report.preConcealmentContentItemCount}`,
    `Source-linked workflow items: ${report.sourceLinkedWorkflowItemCount}`,
    `Unresolved source references: ${report.unresolvedSourceReferenceCount}`,
    `Duplicate Workflow/PreConcealment IDs: ${report.duplicateWorkflowIdCount}/${report.duplicatePreConcealmentIdCount}`,
    `Duplicate workflow item IDs: ${report.duplicateWorkflowItemIdCount}`,
    `Empty Workflow/PreConcealment records: ${report.emptyWorkflowRecordCount}/${report.emptyPreConcealmentRecordCount}`,
    `Invalid references: ${report.invalidReferenceCount}`,
    `Incorrect pre-concealment applicability: ${report.incorrectPreConcealmentApplicabilityCount}`,
    `Workflow localized EN/FR values: ${report.localizedWorkflowEnCount}/${report.localizedWorkflowFrCount}`,
    `Workflow localized validated/provisional/fallback: ${report.localizedWorkflowValidatedFrCount}/${report.localizedWorkflowProvisionalFrCount}/${report.localizedWorkflowFallbackOnlyCount}`,
    `Missing French workflow statuses: ${report.missingFrenchStatusCount}`,
    `Source-limited workflow/pre-concealment gaps: ${report.sourceLimitedWorkflowGapCount}/${report.sourceLimitedPreConcealmentGapCount}`,
    `Language-specific workflow/activity IDs: ${report.languageSpecificIdCount}`
  ].join("\n");
};
