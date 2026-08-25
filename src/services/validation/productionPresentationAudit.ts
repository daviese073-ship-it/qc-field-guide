import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { CanonicalRegistries } from "@/domain/registries";
import type {
  Activity,
  ContentBlock,
  ContentItem,
  LearnContent,
  QuickView
} from "@/domain/types";

const expectedSectionCount = 14;
const expectedActivityCount = 139;

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

const quickContentFields = [
  "before",
  "inspect",
  "evidence",
  "watchFor",
  "dontMiss"
] as const;

const learnContentFields = [
  "whatIsThis",
  "whyItMatters",
  "howGoodWorkLooks",
  "criticalChecksExplained",
  "commonFailures",
  "interfacesAndSequence"
] as const;

const activityFieldSourceRefs = new Set([
  "qualityObjective",
  "applicability",
  "authorityNote",
  "specialistBoundary"
]);

export interface ProductionPresentationAuditReport {
  ok: boolean;
  errors: readonly string[];
  sectionCount: number;
  activityCount: number;
  quickViewCount: number;
  learnContentCount: number;
  activitiesWithQuickView: number;
  activitiesWithLearnContent: number;
  presentationItemCount: number;
  quickViewItemCount: number;
  learnContentItemCount: number;
  sourceLinkedPresentationItemCount: number;
  unresolvedSourceReferenceCount: number;
  orphanPresentationRecordCount: number;
  duplicatePresentationItemIdCount: number;
  emptyPresentationRecordCount: number;
  quickViewRequiredStructureGapCount: number;
  learnContentRequiredStructureGapCount: number;
  localizedPresentationValueCount: number;
  localizedPresentationEnCount: number;
  localizedPresentationFrCount: number;
  localizedPresentationReviewedFrCount: number;
  localizedPresentationProvisionalFrCount: number;
  localizedPresentationFallbackOnlyCount: number;
  missingFrenchStatusCount: number;
  workflowCount: number;
  preConcealmentWorkflowCount: number;
}

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
  ...(activity.specialistBoundary ? [activity.specialistBoundary] : [])
];

const collectQuickViewItems = (quickView: QuickView) =>
  quickContentFields.flatMap((field) => collectBlockItems(quickView[field]));

const collectLearnContentItems = (learnContent: LearnContent) =>
  learnContentFields.flatMap((field) => collectBlockItems(learnContent[field]));

const countPopulatedBlockFields = <T extends string>(
  fields: readonly T[],
  getBlocks: (field: T) => readonly ContentBlock[] | undefined
) => fields.filter((field) => collectBlockItems(getBlocks(field)).length > 0).length;

const hasResolvedSourceReference = (
  item: ContentItem,
  activity: Activity | undefined,
  activitySourceItemIds: ReadonlyMap<string, ReadonlySet<string>>
) => {
  const sourceActivityId = item.sourceRef?.section;
  const sourcePage = item.sourceRef?.page;

  if (!sourceActivityId || !sourcePage || sourceActivityId !== activity?.id) {
    return false;
  }

  return (
    activitySourceItemIds.get(sourceActivityId)?.has(sourcePage) ||
    activityFieldSourceRefs.has(sourcePage)
  );
};

export const auditProductionPresentationDataset = (
  dataset: CanonicalDataset,
  registries: CanonicalRegistries
): ProductionPresentationAuditReport => {
  const errors: string[] = [];
  const activities = registries.activities.getAll();
  const quickViews = registries.quickViews.getAll();
  const learnContent = registries.learnContent.getAll();
  const activitySourceItemIds = new Map<string, Set<string>>();
  const presentationItemIds = new Set<string>();
  const duplicatePresentationItemIds = new Set<string>();
  let quickViewItemCount = 0;
  let learnContentItemCount = 0;
  let sourceLinkedPresentationItemCount = 0;
  let unresolvedSourceReferenceCount = 0;
  let orphanPresentationRecordCount = 0;
  let emptyPresentationRecordCount = 0;
  let quickViewRequiredStructureGapCount = 0;
  let learnContentRequiredStructureGapCount = 0;
  let localizedPresentationValueCount = 0;
  let localizedPresentationEnCount = 0;
  let localizedPresentationFrCount = 0;
  let localizedPresentationReviewedFrCount = 0;
  let localizedPresentationProvisionalFrCount = 0;
  let missingFrenchStatusCount = 0;

  for (const activity of activities) {
    activitySourceItemIds.set(
      activity.id,
      new Set(collectActivitySourceItems(activity).map((item) => item.id))
    );
  }

  const auditPresentationItem = (
    item: ContentItem,
    activity: Activity | undefined,
    context: string
  ) => {
    if (presentationItemIds.has(item.id)) {
      duplicatePresentationItemIds.add(item.id);
    }
    presentationItemIds.add(item.id);

    localizedPresentationValueCount += 1;
    if (item.text.en) localizedPresentationEnCount += 1;
    if (item.text.fr) localizedPresentationFrCount += 1;
    if (item.text.status?.fr === "validated") {
      localizedPresentationReviewedFrCount += 1;
    }
    if (item.text.status?.fr === "provisional") {
      localizedPresentationProvisionalFrCount += 1;
    }
    if (item.text.fr && !item.text.status?.fr) {
      missingFrenchStatusCount += 1;
    }

    if (hasResolvedSourceReference(item, activity, activitySourceItemIds)) {
      sourceLinkedPresentationItemCount += 1;
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
  if (activities.length !== expectedActivityCount) {
    errors.push(
      `Expected ${expectedActivityCount} production activities; found ${activities.length}.`
    );
  }
  if (quickViews.length !== expectedActivityCount) {
    errors.push(
      `Expected ${expectedActivityCount} QuickView records; found ${quickViews.length}.`
    );
  }
  if (learnContent.length !== expectedActivityCount) {
    errors.push(
      `Expected ${expectedActivityCount} LearnContent records; found ${learnContent.length}.`
    );
  }

  for (const quickView of quickViews) {
    const activity = registries.activities.getById(quickView.activityId);
    const items = collectQuickViewItems(quickView);
    quickViewItemCount += items.length;

    if (!activity) {
      orphanPresentationRecordCount += 1;
      errors.push(
        `QuickView "${quickView.activityId}" does not resolve to an activity.`
      );
      continue;
    }
    if (items.length === 0) {
      emptyPresentationRecordCount += 1;
      errors.push(`QuickView "${quickView.activityId}" has no content items.`);
    }
    if (
      countPopulatedBlockFields(quickContentFields, (field) => quickView[field]) <
      4
    ) {
      quickViewRequiredStructureGapCount += 1;
    }

    for (const item of items) {
      auditPresentationItem(item, activity, `QuickView "${quickView.activityId}"`);
    }
  }

  for (const learn of learnContent) {
    const activity = registries.activities.getById(learn.activityId);
    const items = collectLearnContentItems(learn);
    learnContentItemCount += items.length;

    if (!activity) {
      orphanPresentationRecordCount += 1;
      errors.push(
        `LearnContent "${learn.activityId}" does not resolve to an activity.`
      );
      continue;
    }
    if (items.length === 0) {
      emptyPresentationRecordCount += 1;
      errors.push(`LearnContent "${learn.activityId}" has no content items.`);
    }
    if (
      countPopulatedBlockFields(learnContentFields, (field) => learn[field]) < 5
    ) {
      learnContentRequiredStructureGapCount += 1;
    }

    for (const item of items) {
      auditPresentationItem(item, activity, `LearnContent "${learn.activityId}"`);
    }
  }

  if (duplicatePresentationItemIds.size > 0) {
    errors.push(
      `Found ${duplicatePresentationItemIds.size} duplicate presentation content item IDs.`
    );
  }
  if (missingFrenchStatusCount > 0) {
    errors.push(
      `Found ${missingFrenchStatusCount} presentation values with French text but no French status.`
    );
  }
  if (localizedPresentationValueCount !== localizedPresentationFrCount) {
    errors.push(
      `Expected French text for every presentation value; found ${localizedPresentationFrCount}/${localizedPresentationValueCount}.`
    );
  }
  return {
    ok: errors.length === 0,
    errors,
    sectionCount: dataset.sections.length,
    activityCount: activities.length,
    quickViewCount: quickViews.length,
    learnContentCount: learnContent.length,
    activitiesWithQuickView: quickViews.filter((quickView) =>
      registries.activities.has(quickView.activityId)
    ).length,
    activitiesWithLearnContent: learnContent.filter((learn) =>
      registries.activities.has(learn.activityId)
    ).length,
    presentationItemCount: quickViewItemCount + learnContentItemCount,
    quickViewItemCount,
    learnContentItemCount,
    sourceLinkedPresentationItemCount,
    unresolvedSourceReferenceCount,
    orphanPresentationRecordCount,
    duplicatePresentationItemIdCount: duplicatePresentationItemIds.size,
    emptyPresentationRecordCount,
    quickViewRequiredStructureGapCount,
    learnContentRequiredStructureGapCount,
    localizedPresentationValueCount,
    localizedPresentationEnCount,
    localizedPresentationFrCount,
    localizedPresentationReviewedFrCount,
    localizedPresentationProvisionalFrCount,
    localizedPresentationFallbackOnlyCount:
      localizedPresentationValueCount - localizedPresentationFrCount,
    missingFrenchStatusCount,
    workflowCount: dataset.workflows.length,
    preConcealmentWorkflowCount: dataset.preConcealmentWorkflows.length
  };
};

export const formatProductionPresentationAuditReport = (
  report: ProductionPresentationAuditReport
) => {
  const lines = report.ok
    ? ["Phase 014 production presentation audit passed."]
    : [
        "Phase 014 production presentation audit failed.",
        ...report.errors.map((error) => `- ${error}`)
      ];

  return [
    ...lines,
    `Sections processed: ${report.sectionCount}`,
    `Activities processed: ${report.activityCount}`,
    `QuickView records: ${report.quickViewCount}`,
    `LearnContent records: ${report.learnContentCount}`,
    `Activities with QuickView/LearnContent: ${report.activitiesWithQuickView}/${report.activitiesWithLearnContent}`,
    `Presentation content items: ${report.presentationItemCount}`,
    `QuickView/LearnContent items: ${report.quickViewItemCount}/${report.learnContentItemCount}`,
    `Source-linked presentation items: ${report.sourceLinkedPresentationItemCount}`,
    `Unresolved source references: ${report.unresolvedSourceReferenceCount}`,
    `Orphan presentation records: ${report.orphanPresentationRecordCount}`,
    `Duplicate presentation item IDs: ${report.duplicatePresentationItemIdCount}`,
    `Empty presentation records: ${report.emptyPresentationRecordCount}`,
    `QuickView/Learn structure gaps: ${report.quickViewRequiredStructureGapCount}/${report.learnContentRequiredStructureGapCount}`,
    `Presentation EN/FR coverage: ${report.localizedPresentationEnCount}/${report.localizedPresentationFrCount}`,
    `Presentation reviewed/provisional/fallback: ${report.localizedPresentationReviewedFrCount}/${report.localizedPresentationProvisionalFrCount}/${report.localizedPresentationFallbackOnlyCount}`,
    `Missing French presentation statuses: ${report.missingFrenchStatusCount}`,
    `Workflow/PreConcealment records: ${report.workflowCount}/${report.preConcealmentWorkflowCount}`
  ].join("\n");
};
