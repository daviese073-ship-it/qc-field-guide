import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { CanonicalRegistries } from "@/domain/registries";
import type { SearchableObjectType } from "@/domain/types/search";
import { buildDerivedSearchIndex } from "@/services/search";
import type {
  DerivedSearchEntry,
  DerivedSearchIndex,
  DerivedSearchSourceFamily,
  SearchLanguage
} from "@/services/search";

export interface ProductionSearchAuditReport {
  ok: boolean;
  errors: readonly string[];
  index: DerivedSearchIndex;
  entryCount: number;
  englishEntryCount: number;
  frenchEntryCount: number;
  sectionTitleEntryCount: number;
  activityTitleEntryCount: number;
  activityContentEntryCount: number;
  quickViewEntryCount: number;
  learnContentEntryCount: number;
  workflowEntryCount: number;
  preConcealmentEntryCount: number;
  gateEntryCount: number;
  terminologyEntryCount: number;
  acronymEntryCount: number;
  relationshipEntryCount: number;
  duplicateEntryIdCount: number;
  emptyTextEntryCount: number;
  tokenlessEntryCount: number;
  unresolvedDestinationCount: number;
  fallbackOnlyEntryCount: number;
  deterministic: boolean;
}

const getObjectResolver = (
  registries: CanonicalRegistries,
  objectType: SearchableObjectType
) => {
  switch (objectType) {
    case "section":
      return registries.sections;
    case "activity":
      return registries.activities;
    case "workflow":
      return registries.workflows;
    case "preConcealment":
      return registries.preConcealmentWorkflows;
    case "gate":
      return registries.gates;
    case "term":
      return registries.terminology;
    case "acronym":
      return registries.acronyms;
  }
};

const countEntries = (
  entries: readonly DerivedSearchEntry[],
  predicate: (entry: DerivedSearchEntry) => boolean
) => entries.filter(predicate).length;

const countFamily = (
  entries: readonly DerivedSearchEntry[],
  families: readonly DerivedSearchSourceFamily[]
) => {
  const familySet = new Set(families);

  return countEntries(entries, (entry) => familySet.has(entry.sourceFamily));
};

const countLanguage = (
  entries: readonly DerivedSearchEntry[],
  language: SearchLanguage
) => countEntries(entries, (entry) => entry.language === language);

const hasFamilyCoverageForEveryActivity = (
  registries: CanonicalRegistries,
  entries: readonly DerivedSearchEntry[],
  sourceFamily: DerivedSearchSourceFamily
) => {
  const coveredActivityIds = new Set(
    entries
      .filter(
        (entry) => entry.objectType === "activity" && entry.sourceFamily === sourceFamily
      )
      .map((entry) => entry.objectId)
  );

  return registries.activities
    .getAll()
    .every((activity) => coveredActivityIds.has(activity.id));
};

export const auditProductionSearchDataset = (
  dataset: CanonicalDataset,
  registries: CanonicalRegistries
): ProductionSearchAuditReport => {
  const errors: string[] = [];
  const index = buildDerivedSearchIndex(registries);
  const rebuiltIndex = buildDerivedSearchIndex(registries);
  const entries = index.entries;
  const duplicateEntryIds = new Set<string>();
  const seenEntryIds = new Set<string>();
  let emptyTextEntryCount = 0;
  let tokenlessEntryCount = 0;
  let unresolvedDestinationCount = 0;
  let fallbackOnlyEntryCount = 0;

  for (const entry of entries) {
    if (seenEntryIds.has(entry.id)) {
      duplicateEntryIds.add(entry.id);
    }
    seenEntryIds.add(entry.id);

    if (entry.text.trim().length === 0) emptyTextEntryCount += 1;
    if (entry.tokens.length === 0) tokenlessEntryCount += 1;
    if (!getObjectResolver(registries, entry.objectType).has(entry.objectId)) {
      unresolvedDestinationCount += 1;
      errors.push(
        `Search entry "${entry.id}" references missing ${entry.objectType} "${entry.objectId}".`
      );
    }
    if (entry.language === "fr" && entry.translationStatus === "missing") {
      fallbackOnlyEntryCount += 1;
      errors.push(
        `Search entry "${entry.id}" uses missing French status as searchable text.`
      );
    }
    if (!entry.route.startsWith("/")) {
      errors.push(`Search entry "${entry.id}" has invalid route "${entry.route}".`);
    }
  }

  if (duplicateEntryIds.size > 0) {
    errors.push(`Found ${duplicateEntryIds.size} duplicate search entry IDs.`);
  }
  if (emptyTextEntryCount > 0) {
    errors.push(`Found ${emptyTextEntryCount} empty search entries.`);
  }
  if (tokenlessEntryCount > 0) {
    errors.push(`Found ${tokenlessEntryCount} search entries without tokens.`);
  }
  if (index.entryCount !== entries.length) {
    errors.push(
      `Search index entryCount ${index.entryCount} does not match entries length ${entries.length}.`
    );
  }
  if (JSON.stringify(index) !== JSON.stringify(rebuiltIndex)) {
    errors.push("Derived search index is not deterministic across rebuilds.");
  }
  if (countLanguage(entries, "en") === 0 || countLanguage(entries, "fr") === 0) {
    errors.push("Search index must contain both English and French entries.");
  }
  if (!hasFamilyCoverageForEveryActivity(registries, entries, "activityTitle")) {
    errors.push("Search index is missing activity-title coverage.");
  }
  if (!hasFamilyCoverageForEveryActivity(registries, entries, "quickView")) {
    errors.push("Search index is missing QuickView coverage.");
  }
  if (!hasFamilyCoverageForEveryActivity(registries, entries, "learnContent")) {
    errors.push("Search index is missing LearnContent coverage.");
  }
  if (
    countFamily(entries, ["workflow"]) < dataset.workflows.length ||
    countFamily(entries, ["preConcealment"]) <
      dataset.preConcealmentWorkflows.length
  ) {
    errors.push("Search index is missing workflow or pre-concealment coverage.");
  }
  if (countFamily(entries, ["terminologyPreferred", "terminologyAlias"]) === 0) {
    errors.push("Search index is missing terminology coverage.");
  }
  if (countFamily(entries, ["acronym"]) === 0) {
    errors.push("Search index is missing acronym coverage.");
  }

  return {
    ok: errors.length === 0,
    errors,
    index,
    entryCount: entries.length,
    englishEntryCount: countLanguage(entries, "en"),
    frenchEntryCount: countLanguage(entries, "fr"),
    sectionTitleEntryCount: countFamily(entries, ["sectionTitle"]),
    activityTitleEntryCount: countFamily(entries, ["activityTitle"]),
    activityContentEntryCount: countFamily(entries, [
      "activityContent",
      "activityAlias",
      "activityKeyword"
    ]),
    quickViewEntryCount: countFamily(entries, ["quickView"]),
    learnContentEntryCount: countFamily(entries, ["learnContent"]),
    workflowEntryCount: countFamily(entries, ["workflow"]),
    preConcealmentEntryCount: countFamily(entries, ["preConcealment"]),
    gateEntryCount: countFamily(entries, ["gate"]),
    terminologyEntryCount: countFamily(entries, [
      "terminologyPreferred",
      "terminologyAlias",
      "terminologyContent"
    ]),
    acronymEntryCount: countFamily(entries, ["acronym"]),
    relationshipEntryCount: countFamily(entries, ["relationship"]),
    duplicateEntryIdCount: duplicateEntryIds.size,
    emptyTextEntryCount,
    tokenlessEntryCount,
    unresolvedDestinationCount,
    fallbackOnlyEntryCount,
    deterministic: JSON.stringify(index) === JSON.stringify(rebuiltIndex)
  };
};

export const formatProductionSearchAuditReport = (
  report: ProductionSearchAuditReport
) => {
  const lines = report.ok
    ? ["Phase 016 production search audit passed."]
    : [
        "Phase 016 production search audit failed.",
        ...report.errors.map((error) => `- ${error}`)
      ];

  return [
    ...lines,
    `Derived search entries: ${report.entryCount}`,
    `Search EN/FR entries: ${report.englishEntryCount}/${report.frenchEntryCount}`,
    `Section title entries: ${report.sectionTitleEntryCount}`,
    `Activity title/content entries: ${report.activityTitleEntryCount}/${report.activityContentEntryCount}`,
    `QuickView/LearnContent entries: ${report.quickViewEntryCount}/${report.learnContentEntryCount}`,
    `Workflow/PreConcealment entries: ${report.workflowEntryCount}/${report.preConcealmentEntryCount}`,
    `Gate entries: ${report.gateEntryCount}`,
    `Terminology/Acronym entries: ${report.terminologyEntryCount}/${report.acronymEntryCount}`,
    `Relationship metadata entries: ${report.relationshipEntryCount}`,
    `Duplicate/empty/tokenless entries: ${report.duplicateEntryIdCount}/${report.emptyTextEntryCount}/${report.tokenlessEntryCount}`,
    `Unresolved/fallback-only destinations: ${report.unresolvedDestinationCount}/${report.fallbackOnlyEntryCount}`,
    `Deterministic rebuild: ${report.deterministic ? "yes" : "no"}`
  ].join("\n");
};
