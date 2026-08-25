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
  contentItemProvisionalFrCount: number;
  contentItemFallbackOnlyCount: number;
  authoritySensitiveContentItemCount: number;
  authoritySensitiveFrCount: number;
  authoritySensitiveReviewedFrCount: number;
  authoritySensitiveProvisionalFrCount: number;
  authoritySensitiveFallbackOnlyCount: number;
  highControlContentItemCount: number;
  highControlFrCount: number;
  highControlReviewedFrCount: number;
  highControlProvisionalFrCount: number;
  highControlFallbackOnlyCount: number;
  terminologyConformanceIssueCount: number;
  numericTokenMismatchCount: number;
  criticalTokenMismatchCount: number;
  authorityObligationIssueCount: number;
  untranslatedSectionTitleCount: number;
  untranslatedActivityTitleCount: number;
  untranslatedUiStringCount: number;
  missingTranslationStatusCount: number;
  unresolvedQaFlagCount: number;
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

const isHighControl = (item: ContentItem) =>
  Boolean(
    item.highControl?.highControl ||
      item.highControl?.traceabilityCritical ||
      item.highControl?.evidenceRequired
  );

const isReviewedFrench = (item: ContentItem) =>
  item.text.status?.fr === "validated";

const isProvisionalFrench = (item: ContentItem) =>
  item.text.status?.fr === "provisional";

const normalizeForQa = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const collectNumbers = (value: string) =>
  value.match(/\b\d+(?:[.,]\d+)?\b/g)?.sort() ?? [];

const collectUnits = (value: string) =>
  value.match(
    /\b\d+(?:[.,]\d+)?\s*(?:mm|cm|m|km|mpa|kpa|pa|psi|%|degc|°c|hours?|hrs?|days?|minutes?)\b/gi
  )?.map((token) => token.toLowerCase()).sort() ?? [];

const nonCriticalUppercaseWords = new Set([
  "ACTUAL",
  "DIMENSIONS",
  "DO",
  "FIT",
  "IT",
  "LATER",
  "MODIFIED",
  "ON",
  "PROJECT",
  "PROVES",
  "SOURCES",
  "SYSTEM",
  "THAT",
  "THE",
  "WAS",
  "WHAT"
]);

const collectKnownAcronymForms = (registries: CanonicalRegistries) => {
  const forms = new Map<string, readonly string[]>();

  for (const acronym of registries.acronyms.getAll()) {
    const allForms = [
      ...(acronym.abbreviations.en ?? []),
      ...(acronym.abbreviations.fr ?? []),
      ...(acronym.abbreviations.shared ?? [])
    ];

    for (const form of allForms) {
      forms.set(form, allForms);
    }
  }

  return forms;
};

const collectCriticalTokens = (
  value: string,
  knownAcronymForms: ReadonlyMap<string, readonly string[]>
) =>
  (value.match(/\b[A-Z][A-Z0-9/&.]{1,}\b/g) ?? [])
    .map((token) => token.replace(/[/]+$/u, ""))
    .filter(
      (token) =>
        knownAcronymForms.has(token) ||
        (!nonCriticalUppercaseWords.has(token) &&
          /(?:\d|\/|\.|ID$|FS$)/.test(token))
    )
    .sort();

const sortedEquals = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const hasNumericOrUnitMismatch = (item: ContentItem) => {
  const english = item.text.en;
  const french = item.text.fr;

  if (!french) {
    return false;
  }

  return (
    !sortedEquals(collectNumbers(english), collectNumbers(french)) ||
    !sortedEquals(collectUnits(english), collectUnits(french))
  );
};

const hasCriticalTokenMismatch = (
  item: ContentItem,
  knownAcronymForms: ReadonlyMap<string, readonly string[]>
) => {
  const englishAcronyms = collectCriticalTokens(
    item.text.en,
    knownAcronymForms
  );

  if (englishAcronyms.length === 0 || !item.text.fr) {
    return false;
  }

  const french = item.text.fr;

  return englishAcronyms.some((token) => {
    const authorizedForms = knownAcronymForms.get(token);

    if (authorizedForms) {
      return !authorizedForms.some((form) => french.includes(form));
    }

    return !french.includes(token);
  });
};

const obligationPairs = [
  { en: /\bmust\b/i, fr: /\b(doit|doivent|requis|obligatoire)\b/i },
  { en: /\bshould\b/i, fr: /\b(devrait|devraient|devriez)\b/i },
  { en: /\bmay\b/i, fr: /\b(peut|peuvent)\b/i },
  { en: /\bdo not\b/i, fr: /\bne pas\b/i },
  { en: /\bcannot\b/i, fr: /\bne peut pas\b/i },
  { en: /\bwhere required\b/i, fr: /\b(lorsque requis|si requis)\b/i },
  { en: /\bwhere applicable\b/i, fr: /\b(le cas échéant|s’il y a lieu)\b/i },
  { en: /\bbefore\b/i, fr: /\bavant\b/i },
  { en: /\bafter\b/i, fr: /après/i },
  { en: /\bunless\b/i, fr: /à moins que/i },
  { en: /\bonly when\b/i, fr: /\bseulement lorsque\b/i }
] as const;

const hasAuthorityObligationIssue = (item: ContentItem) =>
  Boolean(
    item.text.fr &&
      obligationPairs.some(
        (pair) => pair.en.test(item.text.en) && !pair.fr.test(item.text.fr ?? "")
      )
  );

const hasTerminologyConformanceIssue = (
  item: ContentItem,
  registries: CanonicalRegistries
) => {
  if (!item.text.fr) {
    return false;
  }

  const english = normalizeForQa(item.text.en);
  const french = normalizeForQa(item.text.fr);

  return (item.terminologyRefs ?? []).some((termId) => {
    const concept = registries.terminology.getById(termId);

    if (!concept?.preferred.fr) {
      return false;
    }

    const englishTerms = [
      concept.preferred.en,
      ...(concept.aliases?.en ?? [])
    ].map(normalizeForQa);
    const frenchTerms = [
      concept.preferred.fr,
      ...(concept.aliases?.fr ?? [])
    ].map(normalizeForQa);

    return (
      englishTerms.some((term) => english.includes(term)) &&
      !frenchTerms.some((term) => french.includes(term))
    );
  });
};

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
  const contentItemReviewedFrCount =
    contentItems.filter(isReviewedFrench).length;
  const contentItemProvisionalFrCount =
    contentItems.filter(isProvisionalFrench).length;
  const authoritySensitiveItems = contentItems.filter(isAuthoritySensitive);
  const highControlItems = contentItems.filter(isHighControl);
  const languageSpecificIdCount = collectCanonicalIds(dataset).filter((id) =>
    languageSpecificIdPattern.test(id)
  ).length;
  const knownAcronymForms = collectKnownAcronymForms(registries);
  const terminologyConformanceIssueCount = contentItems.filter((item) =>
    hasTerminologyConformanceIssue(item, registries)
  ).length;
  const numericTokenMismatchCount = contentItems.filter(
    hasNumericOrUnitMismatch
  ).length;
  const criticalTokenMismatchCount = contentItems.filter(
    (item) => hasCriticalTokenMismatch(item, knownAcronymForms)
  ).length;
  const authorityObligationIssueCount = authoritySensitiveItems.filter(
    hasAuthorityObligationIssue
  ).length;
  const missingTranslationStatusCount = contentItems.filter(
    (item) => Boolean(item.text.fr) && !item.text.status?.fr
  ).length;
  const untranslatedSectionTitleCount =
    sections.length - localizedSectionTitleCount;
  const untranslatedActivityTitleCount =
    activities.length - localizedActivityTitleCount;
  const untranslatedUiStringCount = uiStrings.filter(
    (uiString) => !uiString.fr
  ).length;
  const unresolvedQaFlagCount =
    terminologyConformanceIssueCount +
    numericTokenMismatchCount +
    criticalTokenMismatchCount +
    authorityObligationIssueCount +
    missingTranslationStatusCount;
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
  if (contentItemFrCount !== expectedContentItemCount) {
    errors.push(
      `Expected French text for ${expectedContentItemCount} content items; found ${contentItemFrCount}.`
    );
  }
  if (missingTranslationStatusCount > 0) {
    errors.push(
      `Found ${missingTranslationStatusCount} translated content items without explicit French translation status.`
    );
  }
  if (authoritySensitiveItems.length > 0 && authoritySensitiveItems.length !== authoritySensitiveItems.filter((item) => Boolean(item.text.fr)).length) {
    errors.push(
      "Not all authority-sensitive content items have French text."
    );
  }
  if (numericTokenMismatchCount > 0) {
    errors.push(
      `Found ${numericTokenMismatchCount} content items with numeric/unit token mismatches.`
    );
  }
  if (criticalTokenMismatchCount > 0) {
    errors.push(
      `Found ${criticalTokenMismatchCount} content items with critical acronym/token mismatches.`
    );
  }
  if (authorityObligationIssueCount > 0) {
    errors.push(
      `Found ${authorityObligationIssueCount} authority-sensitive content items with obligation-token issues.`
    );
  }
  if (terminologyConformanceIssueCount > 0) {
    errors.push(
      `Found ${terminologyConformanceIssueCount} terminology-conformance issues in content-item translations.`
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
    ok:
      errors.length === 0 &&
      unresolvedReferenceCount === 0 &&
      unresolvedQaFlagCount === 0,
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
    contentItemReviewedFrCount,
    contentItemProvisionalFrCount,
    contentItemFallbackOnlyCount: contentItems.length - contentItemFrCount,
    authoritySensitiveContentItemCount: authoritySensitiveItems.length,
    authoritySensitiveFrCount: authoritySensitiveItems.filter((item) =>
      Boolean(item.text.fr)
    ).length,
    authoritySensitiveReviewedFrCount:
      authoritySensitiveItems.filter(isReviewedFrench).length,
    authoritySensitiveProvisionalFrCount:
      authoritySensitiveItems.filter(isProvisionalFrench).length,
    authoritySensitiveFallbackOnlyCount:
      authoritySensitiveItems.length -
      authoritySensitiveItems.filter((item) => Boolean(item.text.fr)).length,
    highControlContentItemCount: highControlItems.length,
    highControlFrCount: highControlItems.filter((item) =>
      Boolean(item.text.fr)
    ).length,
    highControlReviewedFrCount:
      highControlItems.filter(isReviewedFrench).length,
    highControlProvisionalFrCount:
      highControlItems.filter(isProvisionalFrench).length,
    highControlFallbackOnlyCount:
      highControlItems.length -
      highControlItems.filter((item) => Boolean(item.text.fr)).length,
    terminologyConformanceIssueCount,
    numericTokenMismatchCount,
    criticalTokenMismatchCount,
    authorityObligationIssueCount,
    untranslatedSectionTitleCount,
    untranslatedActivityTitleCount,
    untranslatedUiStringCount,
    missingTranslationStatusCount,
    unresolvedQaFlagCount,
    terminologyReferenceCount,
    unresolvedReferenceCount,
    languageSpecificIdCount
  };
};

export const formatProductionLocalizationAuditReport = (
  report: ProductionLocalizationAuditReport
) => {
  const lines = report.ok
    ? ["Phase 013A production localization audit passed."]
    : [
        "Phase 013A production localization audit failed.",
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
    `Content items provisional FR: ${report.contentItemProvisionalFrCount}`,
    `Content items fallback-only: ${report.contentItemFallbackOnlyCount}`,
    `Authority-sensitive content with FR: ${report.authoritySensitiveFrCount}/${report.authoritySensitiveContentItemCount}`,
    `Authority-sensitive reviewed/provisional/fallback: ${report.authoritySensitiveReviewedFrCount}/${report.authoritySensitiveProvisionalFrCount}/${report.authoritySensitiveFallbackOnlyCount}`,
    `High-control content with FR: ${report.highControlFrCount}/${report.highControlContentItemCount}`,
    `High-control reviewed/provisional/fallback: ${report.highControlReviewedFrCount}/${report.highControlProvisionalFrCount}/${report.highControlFallbackOnlyCount}`,
    `Terminology-conformance issues: ${report.terminologyConformanceIssueCount}`,
    `Numeric/unit token mismatches: ${report.numericTokenMismatchCount}`,
    `Critical token mismatches: ${report.criticalTokenMismatchCount}`,
    `Authority/obligation issues: ${report.authorityObligationIssueCount}`,
    `Missing French translation statuses: ${report.missingTranslationStatusCount}`,
    `Untranslated section/activity/UI labels: ${report.untranslatedSectionTitleCount}/${report.untranslatedActivityTitleCount}/${report.untranslatedUiStringCount}`,
    `Unresolved QA flags: ${report.unresolvedQaFlagCount}`,
    `Terminology references: ${report.terminologyReferenceCount}`,
    `Unresolved terminology references: ${report.unresolvedReferenceCount}`,
    `Language-specific canonical IDs: ${report.languageSpecificIdCount}`
  ].join("\n");
};
