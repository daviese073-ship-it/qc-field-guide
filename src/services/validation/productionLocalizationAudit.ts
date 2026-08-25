import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { CanonicalRegistries } from "@/domain/registries";
import type {
  AcronymEntry,
  Activity,
  ContentBlock,
  ContentItem,
  TerminologyConcept,
  UiString
} from "@/domain/types";

const expectedSectionCount = 14;
const expectedActivityCount = 139;
const expectedContentItemCount = 13576;
const expectedConditionCount = 14;
const expectedGateCount = 15;
const expectedInvalidationRuleCount = 37;
const expectedRelationshipCount = 350;

const requiredUiStringIds = [
  "UI-MODE-QUICK",
  "UI-MODE-FULL",
  "UI-MODE-LEARN",
  "UI-NAV-BEFORE",
  "UI-NAV-AFTER",
  "UI-NAV-INTERFACES",
  "UI-NAV-TESTING",
  "UI-NAV-COMMISSIONING",
  "UI-NAV-CLOSEOUT",
  "UI-QUICK-BEFORE",
  "UI-QUICK-INSPECT",
  "UI-QUICK-EVIDENCE",
  "UI-QUICK-WATCH-FOR",
  "UI-QUICK-DONT-MISS",
  "UI-FULL-REQUIREMENTS",
  "UI-FULL-INSPECTION-TESTING",
  "UI-LEARN-WHAT",
  "UI-LEARN-WHY",
  "UI-SEARCH-LABEL",
  "UI-GATE-PURPOSE",
  "QCQ-01",
  "QCQ-06",
  "UI-NOTICE-UNIVERSAL-PROJECT-BOUNDARY"
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

const languageSpecificIdPattern = /(?:^|[-_/])(en|fr)(?:$|[-_/])/i;

export interface ProductionLocalizationAuditReport {
  ok: boolean;
  errors: readonly string[];
  sectionCount: number;
  localizedSectionTitleCount: number;
  activityCount: number;
  localizedActivityTitleCount: number;
  terminologyCount: number;
  terminologyPreferredEnCount: number;
  terminologyPreferredFrCount: number;
  terminologyAliasEnCount: number;
  terminologyAliasFrCount: number;
  terminologyProvisionalCount: number;
  terminologyMissingFrCount: number;
  acronymCount: number;
  acronymEnExpansionCount: number;
  acronymFrExpansionCount: number;
  acronymLanguageDependentCount: number;
  acronymProvisionalCount: number;
  uiStringCount: number;
  uiStringEnCount: number;
  uiStringFrCount: number;
  uiStringCategoryCounts: Readonly<Record<string, number>>;
  contentItemCount: number;
  contentItemFrCount: number;
  contentItemReviewedFrCount: number;
  contentItemFallbackOnlyCount: number;
  authoritySensitiveContentItemCount: number;
  authoritySensitiveFrCount: number;
  terminologyReferenceCount: number;
  unresolvedReferenceCount: number;
  languageSpecificIdCount: number;
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

const collectActivityItems = (activity: Activity) => [
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

const countAliases = (
  concepts: readonly TerminologyConcept[],
  language: "en" | "fr"
) =>
  concepts.reduce(
    (count, concept) => count + (concept.aliases?.[language]?.length ?? 0),
    0
  );

const hasFrenchPreferred = (concept: TerminologyConcept) =>
  Boolean(concept.preferred.fr);

const isProvisionalConcept = (concept: TerminologyConcept) =>
  concept.status?.fr === "provisional" || concept.confidence?.fr === "low";

const hasExpansion = (acronym: AcronymEntry, language: "en" | "fr") =>
  Boolean(acronym.fullForms?.[language]?.length);

const isLanguageDependentAcronym = (acronym: AcronymEntry) =>
  Boolean(acronym.abbreviations.en?.length && acronym.abbreviations.fr?.length);

const isAuthoritySensitive = (item: ContentItem) =>
  Boolean(
    item.authority?.projectDocumentsGovern ||
    item.authority?.specialistRequired ||
    item.authority?.authorizedProcessRequired
  );

const isReviewedFrench = (item: ContentItem) =>
  item.text.status?.fr === "validated";

const collectCanonicalIds = (dataset: CanonicalDataset) => [
  ...dataset.sections.map((section) => section.id),
  ...dataset.activities.map((activity) => activity.id),
  ...dataset.relationships.map((relationship) => relationship.id),
  ...dataset.gates.map((gate) => gate.id),
  ...dataset.invalidationRules.map((rule) => rule.id),
  ...dataset.conditions.map((condition) => condition.id),
  ...dataset.workflows.map((workflow) => workflow.id),
  ...dataset.preConcealmentWorkflows.map((workflow) => workflow.id),
  ...dataset.terminology.map((concept) => concept.id),
  ...dataset.acronyms.map((acronym) => acronym.id),
  ...dataset.uiStrings.map((uiString) => uiString.id)
];

const countUiCategories = (uiStrings: readonly UiString[]) =>
  uiStrings.reduce<Record<string, number>>((counts, uiString) => {
    const category = uiString.category ?? "uncategorized";
    counts[category] = (counts[category] ?? 0) + 1;

    return counts;
  }, {});

export const auditProductionLocalizationDataset = (
  dataset: CanonicalDataset,
  registries: CanonicalRegistries
): ProductionLocalizationAuditReport => {
  const errors: string[] = [];
  const sections = registries.sections.getAll();
  const activities = registries.activities.getAll();
  const terminology = registries.terminology.getAll();
  const acronyms = registries.acronyms.getAll();
  const uiStrings = registries.uiStrings.getAll();
  const contentItems = activities.flatMap(collectActivityItems);
  const localizedSectionTitleCount = sections.filter((section) =>
    Boolean(section.title.fr)
  ).length;
  const localizedActivityTitleCount = activities.filter((activity) =>
    Boolean(activity.title.fr)
  ).length;
  const contentItemFrCount = contentItems.filter((item) =>
    Boolean(item.text.fr)
  ).length;
  const authoritySensitiveItems = contentItems.filter(isAuthoritySensitive);
  const languageSpecificIdCount = collectCanonicalIds(dataset).filter((id) =>
    languageSpecificIdPattern.test(id)
  ).length;
  let terminologyReferenceCount = 0;
  let unresolvedReferenceCount = 0;

  if (sections.length !== expectedSectionCount) {
    errors.push(
      `Expected ${expectedSectionCount} sections; found ${sections.length}.`
    );
  }
  if (localizedSectionTitleCount !== expectedSectionCount) {
    errors.push(
      `Expected ${expectedSectionCount} French section titles; found ${localizedSectionTitleCount}.`
    );
  }
  if (activities.length !== expectedActivityCount) {
    errors.push(
      `Expected ${expectedActivityCount} activities; found ${activities.length}.`
    );
  }
  if (localizedActivityTitleCount !== expectedActivityCount) {
    errors.push(
      `Expected ${expectedActivityCount} French activity titles; found ${localizedActivityTitleCount}.`
    );
  }
  if (contentItems.length !== expectedContentItemCount) {
    errors.push(
      `Expected ${expectedContentItemCount} content items; found ${contentItems.length}.`
    );
  }
  if (dataset.conditions.length !== expectedConditionCount) {
    errors.push(
      `Expected ${expectedConditionCount} conditions; found ${dataset.conditions.length}.`
    );
  }
  if (dataset.gates.length !== expectedGateCount) {
    errors.push(
      `Expected ${expectedGateCount} gates; found ${dataset.gates.length}.`
    );
  }
  if (dataset.invalidationRules.length !== expectedInvalidationRuleCount) {
    errors.push(
      `Expected ${expectedInvalidationRuleCount} invalidation rules; found ${dataset.invalidationRules.length}.`
    );
  }
  if (dataset.relationships.length !== expectedRelationshipCount) {
    errors.push(
      `Expected ${expectedRelationshipCount} relationships; found ${dataset.relationships.length}.`
    );
  }
  if (terminology.length === 0) {
    errors.push("Production terminology registry is empty.");
  }
  if (acronyms.length === 0) {
    errors.push("Production acronym registry is empty.");
  }
  if (uiStrings.length === 0) {
    errors.push("Production UI-string registry is empty.");
  }
  for (const id of requiredUiStringIds) {
    if (!registries.uiStrings.has(id)) {
      errors.push(`Required UI string "${id}" is missing.`);
    }
  }
  if (languageSpecificIdCount > 0) {
    errors.push(
      `Found ${languageSpecificIdCount} language-specific canonical IDs.`
    );
  }
  if (
    dataset.quickViews.length > 0 ||
    dataset.learnContent.length > 0 ||
    dataset.workflows.length > 0 ||
    dataset.preConcealmentWorkflows.length > 0
  ) {
    errors.push(
      "Phase 013 must not populate QuickView, LearnContent, Workflow, or PreConcealmentWorkflow production records."
    );
  }

  for (const activity of activities) {
    for (const termId of activity.terminologyRefs ?? []) {
      terminologyReferenceCount += 1;
      if (!registries.terminology.has(termId)) {
        unresolvedReferenceCount += 1;
      }
    }
    for (const item of collectActivityItems(activity)) {
      for (const termId of item.terminologyRefs ?? []) {
        terminologyReferenceCount += 1;
        if (!registries.terminology.has(termId)) {
          unresolvedReferenceCount += 1;
        }
      }
    }
  }

  return {
    ok: errors.length === 0 && unresolvedReferenceCount === 0,
    errors:
      unresolvedReferenceCount > 0
        ? [
            ...errors,
            `Found ${unresolvedReferenceCount} unresolved terminology references.`
          ]
        : errors,
    sectionCount: sections.length,
    localizedSectionTitleCount,
    activityCount: activities.length,
    localizedActivityTitleCount,
    terminologyCount: terminology.length,
    terminologyPreferredEnCount: terminology.filter((concept) =>
      Boolean(concept.preferred.en)
    ).length,
    terminologyPreferredFrCount: terminology.filter(hasFrenchPreferred).length,
    terminologyAliasEnCount: countAliases(terminology, "en"),
    terminologyAliasFrCount: countAliases(terminology, "fr"),
    terminologyProvisionalCount:
      terminology.filter(isProvisionalConcept).length,
    terminologyMissingFrCount: terminology.filter(
      (concept) => concept.status?.fr === "missing" || !concept.preferred.fr
    ).length,
    acronymCount: acronyms.length,
    acronymEnExpansionCount: acronyms.filter((acronym) =>
      hasExpansion(acronym, "en")
    ).length,
    acronymFrExpansionCount: acronyms.filter((acronym) =>
      hasExpansion(acronym, "fr")
    ).length,
    acronymLanguageDependentCount: acronyms.filter(isLanguageDependentAcronym)
      .length,
    acronymProvisionalCount: acronyms.filter(
      (acronym) => acronym.provisional || acronym.status?.fr !== "validated"
    ).length,
    uiStringCount: uiStrings.length,
    uiStringEnCount: uiStrings.filter((uiString) => Boolean(uiString.en))
      .length,
    uiStringFrCount: uiStrings.filter((uiString) => Boolean(uiString.fr))
      .length,
    uiStringCategoryCounts: countUiCategories(uiStrings),
    contentItemCount: contentItems.length,
    contentItemFrCount,
    contentItemReviewedFrCount: contentItems.filter(isReviewedFrench).length,
    contentItemFallbackOnlyCount: contentItems.length - contentItemFrCount,
    authoritySensitiveContentItemCount: authoritySensitiveItems.length,
    authoritySensitiveFrCount: authoritySensitiveItems.filter((item) =>
      Boolean(item.text.fr)
    ).length,
    terminologyReferenceCount,
    unresolvedReferenceCount,
    languageSpecificIdCount
  };
};

export const formatProductionLocalizationAuditReport = (
  report: ProductionLocalizationAuditReport
) => {
  const lines = report.ok
    ? ["Phase 013 production localization audit passed."]
    : [
        "Phase 013 production localization audit failed.",
        ...report.errors.map((error) => `- ${error}`)
      ];

  return [
    ...lines,
    `French section titles: ${report.localizedSectionTitleCount}/${report.sectionCount}`,
    `French activity titles: ${report.localizedActivityTitleCount}/${report.activityCount}`,
    `Terminology concepts: ${report.terminologyCount}`,
    `Terminology preferred EN/FR: ${report.terminologyPreferredEnCount}/${report.terminologyPreferredFrCount}`,
    `Terminology aliases EN/FR: ${report.terminologyAliasEnCount}/${report.terminologyAliasFrCount}`,
    `Terminology provisional/missing FR: ${report.terminologyProvisionalCount}/${report.terminologyMissingFrCount}`,
    `Acronyms: ${report.acronymCount}`,
    `Acronym EN/FR expansion coverage: ${report.acronymEnExpansionCount}/${report.acronymFrExpansionCount}`,
    `Language-dependent acronym records: ${report.acronymLanguageDependentCount}`,
    `UI strings EN/FR: ${report.uiStringEnCount}/${report.uiStringFrCount}`,
    `Content items with FR: ${report.contentItemFrCount}/${report.contentItemCount}`,
    `Content items reviewed FR: ${report.contentItemReviewedFrCount}`,
    `Content items fallback-only: ${report.contentItemFallbackOnlyCount}`,
    `Authority-sensitive content with FR: ${report.authoritySensitiveFrCount}/${report.authoritySensitiveContentItemCount}`,
    `Terminology references: ${report.terminologyReferenceCount}`,
    `Unresolved terminology references: ${report.unresolvedReferenceCount}`,
    `Language-specific canonical IDs: ${report.languageSpecificIdCount}`
  ].join("\n");
};
