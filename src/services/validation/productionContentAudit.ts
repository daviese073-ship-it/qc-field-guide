import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { Activity, ContentBlock, ContentItem } from "@/domain/types";

const expectedSectionCount = 14;
const expectedActivityCount = 139;

const contentBlockFields = [
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

const laterPhaseCollections = [
  "workflows",
  "preConcealmentWorkflows"
] as const;

const placeholderPattern =
  /\b(coming soon|tbd|todo|lorem ipsum|placeholder)\b/i;
const leakedSourceNotePattern = /✓|module complete|build 2 .*status/i;

const isPresentString = (value: string | undefined): value is string =>
  typeof value === "string";

export interface ProductionContentAuditReport {
  ok: boolean;
  errors: readonly string[];
  sectionCount: number;
  activityCount: number;
  substantiveActivityCount: number;
  contentItemCount: number;
  sectionActivityCounts: Readonly<Record<string, number>>;
  identityOnlyActivityIds: readonly string[];
}

const hasBlocks = (blocks: readonly ContentBlock[] | undefined) =>
  Boolean(blocks?.length);

const hasInspectionContent = (activity: Activity) =>
  hasBlocks(activity.inspection?.before) ||
  hasBlocks(activity.inspection?.during) ||
  hasBlocks(activity.inspection?.after) ||
  hasBlocks(activity.inspection?.testing);

const hasIssueContent = (activity: Activity) =>
  hasBlocks(activity.issues?.commonDeficiencies) ||
  hasBlocks(activity.issues?.escalationTriggers);

const hasSubstantiveBuild2Content = (activity: Activity) =>
  Boolean(activity.qualityObjective?.en) ||
  Boolean(activity.applicability?.en) ||
  Boolean(activity.authorityNote?.en) ||
  hasInspectionContent(activity) ||
  hasIssueContent(activity) ||
  contentBlockFields.some((field) => hasBlocks(activity[field]));

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

const collectActivityItems = (activity: Activity) => [
  ...contentBlockFields.flatMap((field) => collectBlockItems(activity[field])),
  ...collectBlockItems(activity.inspection?.before),
  ...collectBlockItems(activity.inspection?.during),
  ...collectBlockItems(activity.inspection?.after),
  ...collectBlockItems(activity.inspection?.testing),
  ...collectBlockItems(activity.issues?.commonDeficiencies),
  ...collectBlockItems(activity.issues?.escalationTriggers),
  ...(activity.specialistBoundary ? [activity.specialistBoundary] : [])
];

const collectStringsFromBlock = (block: ContentBlock): string[] => {
  switch (block.type) {
    case "paragraph":
    case "notice":
      return [block.item.text.en];
    case "bulletList":
    case "checkList":
      return block.items.map((item) => item.text.en);
    case "subheading":
      return [block.text.en];
    case "example":
      return [
        block.example.situation?.en,
        block.example.observation?.en,
        block.example.qualityConcern?.en,
        block.example.reasoning?.en,
        block.example.actionPath?.en,
        block.example.closure?.en,
        block.example.lesson?.en
      ].filter(isPresentString);
    case "referenceList":
      return [];
  }
};

const collectActivityStrings = (activity: Activity) =>
  [
    activity.title.en,
    activity.qualityObjective?.en,
    activity.applicability?.en,
    activity.authorityNote?.en,
    ...contentBlockFields.flatMap((field) =>
      (activity[field] ?? []).flatMap(collectStringsFromBlock)
    ),
    ...(activity.inspection?.before ?? []).flatMap(collectStringsFromBlock),
    ...(activity.inspection?.during ?? []).flatMap(collectStringsFromBlock),
    ...(activity.inspection?.after ?? []).flatMap(collectStringsFromBlock),
    ...(activity.inspection?.testing ?? []).flatMap(collectStringsFromBlock),
    ...(activity.issues?.commonDeficiencies ?? []).flatMap(
      collectStringsFromBlock
    ),
    ...(activity.issues?.escalationTriggers ?? []).flatMap(
      collectStringsFromBlock
    )
  ].filter(isPresentString);

export const auditProductionContentDataset = (
  dataset: CanonicalDataset
): ProductionContentAuditReport => {
  const errors: string[] = [];
  const sectionIds = new Set<string>();
  const activityIds = new Set<string>();
  const contentItemIds = new Set<string>();
  const identityOnlyActivityIds: string[] = [];
  const sectionActivityCounts: Record<string, number> = {};
  let substantiveActivityCount = 0;
  let contentItemCount = 0;

  if (dataset.sections.length !== expectedSectionCount) {
    errors.push(
      `Expected ${expectedSectionCount} production sections; found ${dataset.sections.length}.`
    );
  }

  if (dataset.activities.length !== expectedActivityCount) {
    errors.push(
      `Expected ${expectedActivityCount} production activities; found ${dataset.activities.length}.`
    );
  }

  for (const section of dataset.sections) {
    if (sectionIds.has(section.id)) {
      errors.push(`Duplicate production section ID "${section.id}".`);
    }
    sectionIds.add(section.id);
  }

  for (const activity of dataset.activities) {
    if (activityIds.has(activity.id)) {
      errors.push(`Duplicate production activity ID "${activity.id}".`);
    }
    activityIds.add(activity.id);

    sectionActivityCounts[activity.sectionId] =
      (sectionActivityCounts[activity.sectionId] ?? 0) + 1;

    if (!sectionIds.has(activity.sectionId)) {
      errors.push(
        `Production activity "${activity.id}" references missing section "${activity.sectionId}".`
      );
    }

    if (activity.sourceRef?.build !== "Build 3") {
      errors.push(
        `Production activity "${activity.id}" is missing Build 3 identity provenance.`
      );
    }

    if (!hasSubstantiveBuild2Content(activity)) {
      identityOnlyActivityIds.push(activity.id);
      errors.push(
        `Production activity "${activity.id}" remains identity-only after Phase 010.`
      );
    } else {
      substantiveActivityCount += 1;
    }

    for (const item of collectActivityItems(activity)) {
      contentItemCount += 1;
      if (contentItemIds.has(item.id)) {
        errors.push(`Duplicate production content item ID "${item.id}".`);
      }
      contentItemIds.add(item.id);

      if (item.sourceRef?.build !== "Build 2") {
        errors.push(
          `Production content item "${item.id}" is missing Build 2 source provenance.`
        );
      }
    }

    for (const value of collectActivityStrings(activity)) {
      if (placeholderPattern.test(value)) {
        errors.push(
          `Production activity "${activity.id}" contains placeholder-like text: "${value}".`
        );
      }
      if (leakedSourceNotePattern.test(value)) {
        errors.push(
          `Production activity "${activity.id}" appears to contain a source status note: "${value}".`
        );
      }
    }
  }

  for (const collection of laterPhaseCollections) {
    if (dataset[collection].length > 0) {
      errors.push(
        `Production ${collection} contains ${dataset[collection].length} records before its authorized phase.`
      );
    }
  }

  if (JSON.stringify(dataset).includes("Fictional")) {
    errors.push("Production dataset contains fictional fixture text.");
  }

  if ("searchIndex" in dataset) {
    errors.push("Production dataset contains authoritative searchIndex data.");
  }

  return {
    ok: errors.length === 0,
    errors,
    sectionCount: dataset.sections.length,
    activityCount: dataset.activities.length,
    substantiveActivityCount,
    contentItemCount,
    sectionActivityCounts,
    identityOnlyActivityIds
  };
};

export const formatProductionContentAuditReport = (
  report: ProductionContentAuditReport
) => {
  if (!report.ok) {
    return [
      "Phase 010 production content audit failed.",
      ...report.errors.map((error) => `- ${error}`)
    ].join("\n");
  }

  return [
    "Phase 010 production content audit passed.",
    `Production sections: ${report.sectionCount}`,
    `Production activities: ${report.activityCount}`,
    `Activities with substantive Build 2 content: ${report.substantiveActivityCount}`,
    `Production content items: ${report.contentItemCount}`,
    "Identity-only activities: 0"
  ].join("\n");
};
