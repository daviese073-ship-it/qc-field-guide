import type { CanonicalNode, CanonicalRegistries } from "@/domain/registries";
import type {
  AcronymEntry,
  Activity,
  ContentBlock,
  ContentItem,
  Gate,
  LearnContent,
  LocalizedContent,
  LocalizedString,
  PracticalExample,
  PreConcealmentWorkflow,
  QuickView,
  Relationship,
  Section,
  SourceReference,
  TerminologyConcept,
  Workflow
} from "@/domain/types";
import type { SearchableObjectType } from "@/domain/types/search";
import { getCanonicalRoute } from "@/services/navigation/routeHelpers";

import { normalizeSearchText } from "./normalize";
import type {
  DerivedSearchEntry,
  DerivedSearchIndex,
  DerivedSearchSourceFamily,
  SearchLanguage
} from "./searchTypes";

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

const sourceFamilyWeights: Record<DerivedSearchSourceFamily, number> = {
  sectionTitle: 82,
  activityTitle: 120,
  activityAlias: 105,
  activityKeyword: 88,
  activityContent: 48,
  quickView: 72,
  learnContent: 56,
  workflow: 86,
  preConcealment: 86,
  gate: 78,
  terminologyPreferred: 118,
  terminologyAlias: 106,
  terminologyContent: 62,
  acronym: 122,
  relationship: 42
};

const objectTypePriority: Record<SearchableObjectType, number> = {
  activity: 1,
  term: 2,
  acronym: 3,
  workflow: 4,
  preConcealment: 5,
  gate: 6,
  section: 7
};

interface SearchEntryDraft {
  objectId: string;
  objectType: SearchableObjectType;
  sourceFamily: DerivedSearchSourceFamily;
  sourceId: string;
  language: SearchLanguage;
  text: string;
  title: DerivedSearchEntry["title"];
  sectionId?: string;
  activityId?: string;
  sourceRef?: SourceReference;
  translationStatus?: DerivedSearchEntry["translationStatus"];
}

const asPreConcealmentType = "preConcealment" as const;

const getRoute = (objectType: SearchableObjectType, objectId: string) => {
  if (objectType === "acronym") {
    return getCanonicalRoute({ objectType: "term", id: objectId });
  }

  if (objectType === "preConcealment") {
    return getCanonicalRoute({ objectType: asPreConcealmentType, id: objectId });
  }

  return getCanonicalRoute({ objectType, id: objectId });
};

const getNodeObjectType = (node: CanonicalNode): SearchableObjectType => {
  switch (node.kind) {
    case "activity":
      return "activity";
    case "gate":
      return "gate";
    case "workflow":
      return "workflow";
    case "preConcealmentWorkflow":
      return "preConcealment";
  }
};

const getNodeTitle = (node: CanonicalNode): LocalizedString => {
  switch (node.kind) {
    case "activity":
    case "gate":
    case "workflow":
    case "preConcealmentWorkflow":
      return node.object.title;
  }
};

const textEntriesFromLocalized = (
  value: LocalizedString | LocalizedContent | undefined,
  callback: (
    language: SearchLanguage,
    text: string,
    translationStatus: DerivedSearchEntry["translationStatus"]
  ) => void
) => {
  if (!value) return;

  if (value.status?.en !== "missing") {
    callback("en", value.en, value.status?.en);
  }
  if (value.fr) {
    if (value.status?.fr !== "missing") {
      callback("fr", value.fr, value.status?.fr);
    }
  }
};

const contentItemsFromBlocks = (blocks: readonly ContentBlock[] | undefined) => {
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
      case "subheading":
      case "example":
      case "referenceList":
        break;
    }
  }

  return items;
};

const localizedValuesFromBlocks = (
  blocks: readonly ContentBlock[] | undefined
) => {
  const values: Array<{
    sourceId: string;
    value: LocalizedString | LocalizedContent;
    sourceRef?: SourceReference;
  }> = [];

  for (const block of blocks ?? []) {
    switch (block.type) {
      case "paragraph":
      case "notice":
        values.push({
          sourceId: block.item.id,
          value: block.item.text,
          sourceRef: block.item.sourceRef
        });
        break;
      case "bulletList":
      case "checkList":
        values.push(
          ...block.items.map((item) => ({
            sourceId: item.id,
            value: item.text,
            sourceRef: item.sourceRef
          }))
        );
        break;
      case "subheading":
        values.push({
          sourceId: `subheading:${block.text.en}`,
          value: block.text
        });
        break;
      case "example":
      case "referenceList":
        break;
    }
  }

  return values;
};

const localizedValuesFromPracticalExample = (example: PracticalExample) =>
  [
    "situation",
    "observation",
    "qualityConcern",
    "reasoning",
    "actionPath",
    "closure",
    "lesson"
  ].flatMap((field) => {
    const value = example[field as keyof PracticalExample];

    return value && typeof value === "object" && "en" in value
      ? [
          {
            sourceId: `${example.id ?? "example"}:${field}`,
            value,
            sourceRef: example.sourceRef
          }
        ]
      : [];
  });

const getActivityTitle = (registries: CanonicalRegistries, activityId?: string) =>
  activityId
    ? registries.activities.getById(activityId)?.title
    : undefined;

const titleFor = (value: LocalizedString | undefined, fallbackId: string) => ({
  en: value?.en ?? fallbackId,
  fr: value?.fr
});

const addLocalizedDrafts = (
  drafts: SearchEntryDraft[],
  base: Omit<SearchEntryDraft, "language" | "text" | "translationStatus">,
  value: LocalizedString | LocalizedContent | undefined
) => {
  textEntriesFromLocalized(value, (language, text, translationStatus) => {
    drafts.push({
      ...base,
      language,
      text,
      translationStatus
    });
  });
};

const addLiteralDrafts = (
  drafts: SearchEntryDraft[],
  base: Omit<SearchEntryDraft, "language" | "text" | "translationStatus">,
  values: readonly string[] | undefined,
  language: SearchLanguage,
  translationStatus?: DerivedSearchEntry["translationStatus"]
) => {
  if (translationStatus === "missing") return;

  for (const text of values ?? []) {
    drafts.push({
      ...base,
      language,
      text,
      translationStatus
    });
  }
};

const addContentBlockDrafts = (
  drafts: SearchEntryDraft[],
  base: Omit<SearchEntryDraft, "sourceId" | "language" | "text">,
  blocks: readonly ContentBlock[] | undefined
) => {
  for (const { sourceId, value, sourceRef } of localizedValuesFromBlocks(blocks)) {
    addLocalizedDrafts(
      drafts,
      {
        ...base,
        sourceId,
        sourceRef: sourceRef ?? base.sourceRef
      },
      value
    );
  }
};

const addActivityEntries = (
  drafts: SearchEntryDraft[],
  activity: Activity
) => {
  const title = titleFor(activity.title, activity.id);
  const base = {
    objectId: activity.id,
    objectType: "activity" as const,
    title,
    sectionId: activity.sectionId,
    activityId: activity.id,
    sourceRef: activity.sourceRef
  };

  addLocalizedDrafts(
    drafts,
    { ...base, sourceFamily: "activityTitle", sourceId: activity.id },
    activity.title
  );
  addLiteralDrafts(
    drafts,
    { ...base, sourceFamily: "activityAlias", sourceId: `${activity.id}:alias` },
    activity.searchRefs?.aliasesEn,
    "en",
    activity.title.status?.en
  );
  addLiteralDrafts(
    drafts,
    { ...base, sourceFamily: "activityAlias", sourceId: `${activity.id}:alias` },
    activity.searchRefs?.aliasesFr,
    "fr",
    activity.title.status?.fr
  );
  addLiteralDrafts(
    drafts,
    {
      ...base,
      sourceFamily: "activityKeyword",
      sourceId: `${activity.id}:keyword`
    },
    activity.searchRefs?.keywords,
    "en",
    activity.title.status?.en
  );

  for (const field of activityBlockFields) {
    addContentBlockDrafts(drafts, {
      ...base,
      sourceFamily: "activityContent",
      sourceRef: undefined
    }, activity[field]);
  }

  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.inspection?.before);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.inspection?.during);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.inspection?.after);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.inspection?.testing);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.issues?.commonDeficiencies);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.issues?.escalationTriggers);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.communications?.before);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.communications?.during);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.communications?.issueEscalation);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.communications?.after);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.outputs?.records);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.outputs?.acceptanceEvidence);
  addContentBlockDrafts(drafts, {
    ...base,
    sourceFamily: "activityContent"
  }, activity.outputs?.followUp);

  if (activity.qualityObjective) {
    addLocalizedDrafts(
      drafts,
      {
        ...base,
        sourceFamily: "activityContent",
        sourceId: `${activity.id}:qualityObjective`
      },
      activity.qualityObjective
    );
  }
  if (activity.applicability) {
    addLocalizedDrafts(
      drafts,
      {
        ...base,
        sourceFamily: "activityContent",
        sourceId: `${activity.id}:applicability`
      },
      activity.applicability
    );
  }
  if (activity.authorityNote) {
    addLocalizedDrafts(
      drafts,
      {
        ...base,
        sourceFamily: "activityContent",
        sourceId: `${activity.id}:authorityNote`
      },
      activity.authorityNote
    );
  }
  if (activity.specialistBoundary) {
    addLocalizedDrafts(
      drafts,
      {
        ...base,
        sourceFamily: "activityContent",
        sourceId: activity.specialistBoundary.id,
        sourceRef: activity.specialistBoundary.sourceRef
      },
      activity.specialistBoundary.text
    );
  }
};

const addQuickViewEntries = (
  drafts: SearchEntryDraft[],
  registries: CanonicalRegistries,
  quickView: QuickView
) => {
  const activityTitle = getActivityTitle(registries, quickView.activityId);
  const base = {
    objectId: quickView.activityId,
    objectType: "activity" as const,
    sourceFamily: "quickView" as const,
    title: titleFor(activityTitle, quickView.activityId),
    sectionId: registries.activities.getById(quickView.activityId)?.sectionId,
    activityId: quickView.activityId
  };

  for (const field of quickContentFields) {
    addContentBlockDrafts(drafts, base, quickView[field]);
  }

  addLocalizedDrafts(
    drafts,
    { ...base, sourceId: `${quickView.activityId}:specialistAlert` },
    quickView.specialistAlert
  );
  addLocalizedDrafts(
    drafts,
    { ...base, sourceId: `${quickView.activityId}:invalidationAlert` },
    quickView.invalidationAlert
  );
  addLocalizedDrafts(
    drafts,
    { ...base, sourceId: `${quickView.activityId}:gateNext` },
    quickView.gateNext?.note
  );
};

const addLearnContentEntries = (
  drafts: SearchEntryDraft[],
  registries: CanonicalRegistries,
  learnContent: LearnContent
) => {
  const activityTitle = getActivityTitle(registries, learnContent.activityId);
  const base = {
    objectId: learnContent.activityId,
    objectType: "activity" as const,
    sourceFamily: "learnContent" as const,
    title: titleFor(activityTitle, learnContent.activityId),
    sectionId: registries.activities.getById(learnContent.activityId)?.sectionId,
    activityId: learnContent.activityId
  };

  for (const field of learnContentFields) {
    addContentBlockDrafts(drafts, base, learnContent[field]);
  }

  for (const { sourceId, value, sourceRef } of (
    learnContent.practicalExamples ?? []
  ).flatMap(localizedValuesFromPracticalExample)) {
    addLocalizedDrafts(
      drafts,
      {
        ...base,
        sourceId,
        sourceRef
      },
      value
    );
  }

  addLocalizedDrafts(
    drafts,
    {
      ...base,
      sourceId: `${learnContent.activityId}:specialistAuthorityBoundary`
    },
    learnContent.specialistAuthorityBoundary
  );
};

const addWorkflowEntries = (drafts: SearchEntryDraft[], workflow: Workflow) => {
  const base = {
    objectId: workflow.id,
    objectType: "workflow" as const,
    sourceFamily: "workflow" as const,
    title: titleFor(workflow.title, workflow.id),
    sourceRef: workflow.sourceRef
  };

  addLocalizedDrafts(drafts, { ...base, sourceId: workflow.id }, workflow.title);
  addLocalizedDrafts(
    drafts,
    { ...base, sourceId: `${workflow.id}:description` },
    workflow.description
  );

  for (const stage of workflow.stages ?? []) {
    addLocalizedDrafts(
      drafts,
      { ...base, sourceId: stage.id },
      stage.title
    );
    addLocalizedDrafts(
      drafts,
      { ...base, sourceId: `${stage.id}:description` },
      stage.description
    );
  }

  addContentBlockDrafts(drafts, base, workflow.evidenceFocus);
  addContentBlockDrafts(drafts, base, workflow.issuePath);
};

const addPreConcealmentEntries = (
  drafts: SearchEntryDraft[],
  workflow: PreConcealmentWorkflow
) => {
  const base = {
    objectId: workflow.id,
    objectType: "preConcealment" as const,
    sourceFamily: "preConcealment" as const,
    title: titleFor(workflow.title, workflow.id),
    sourceRef: workflow.sourceRef
  };

  addLocalizedDrafts(drafts, { ...base, sourceId: workflow.id }, workflow.title);
  addContentBlockDrafts(drafts, base, workflow.criticalChecks);
  addContentBlockDrafts(drafts, base, workflow.evidence);
  addContentBlockDrafts(drafts, base, workflow.blockIf);
};

const addGateEntries = (drafts: SearchEntryDraft[], gate: Gate) => {
  const base = {
    objectId: gate.id,
    objectType: "gate" as const,
    sourceFamily: "gate" as const,
    title: titleFor(gate.title, gate.id),
    sourceRef: gate.sourceRef
  };

  addLocalizedDrafts(drafts, { ...base, sourceId: gate.id }, gate.title);
  addLocalizedDrafts(
    drafts,
    { ...base, sourceId: `${gate.id}:purpose` },
    gate.purpose
  );
  addLocalizedDrafts(
    drafts,
    { ...base, sourceId: `${gate.id}:releaseCondition` },
    gate.releaseCondition
  );
  addLocalizedDrafts(
    drafts,
    { ...base, sourceId: `${gate.id}:authorityNote` },
    gate.authorityNote
  );
  addContentBlockDrafts(drafts, base, gate.checkItems);
  addContentBlockDrafts(drafts, base, gate.blockingConditions);
};

const addTerminologyEntries = (
  drafts: SearchEntryDraft[],
  concept: TerminologyConcept
) => {
  const title = titleFor(concept.preferred, concept.id);
  const base = {
    objectId: concept.id,
    objectType: "term" as const,
    title,
    sourceRef: concept.sourceRef
  };

  addLiteralDrafts(
    drafts,
    {
      ...base,
      sourceFamily: "terminologyPreferred",
      sourceId: `${concept.id}:preferred`
    },
    [concept.preferred.en],
    "en",
    concept.status?.en
  );
  addLiteralDrafts(
    drafts,
    {
      ...base,
      sourceFamily: "terminologyPreferred",
      sourceId: `${concept.id}:preferred`
    },
    concept.preferred.fr ? [concept.preferred.fr] : undefined,
    "fr",
    concept.status?.fr
  );
  addLiteralDrafts(
    drafts,
    {
      ...base,
      sourceFamily: "terminologyAlias",
      sourceId: `${concept.id}:alias`
    },
    concept.aliases?.en,
    "en",
    concept.status?.en
  );
  addLiteralDrafts(
    drafts,
    {
      ...base,
      sourceFamily: "terminologyAlias",
      sourceId: `${concept.id}:alias`
    },
    concept.aliases?.fr,
    "fr",
    concept.status?.fr
  );
  addLocalizedDrafts(
    drafts,
    {
      ...base,
      sourceFamily: "terminologyContent",
      sourceId: `${concept.id}:definition`
    },
    concept.definition
  );
  addLocalizedDrafts(
    drafts,
    {
      ...base,
      sourceFamily: "terminologyContent",
      sourceId: `${concept.id}:contextNotes`
    },
    concept.contextNotes
  );
};

const addAcronymEntries = (drafts: SearchEntryDraft[], acronym: AcronymEntry) => {
  const preferredTitle = acronym.preferredLabel ?? {
    en:
      acronym.abbreviations.en?.[0] ??
      acronym.abbreviations.fr?.[0] ??
      acronym.abbreviations.shared?.[0] ??
      acronym.id,
    fr: acronym.abbreviations.fr?.[0],
    status: acronym.status
  };
  const base = {
    objectId: acronym.id,
    objectType: "acronym" as const,
    sourceFamily: "acronym" as const,
    title: titleFor(preferredTitle, acronym.id),
    sourceRef: acronym.sourceRef
  };

  addLocalizedDrafts(drafts, { ...base, sourceId: acronym.id }, preferredTitle);
  addLiteralDrafts(
    drafts,
    { ...base, sourceId: `${acronym.id}:abbreviation` },
    acronym.abbreviations.en,
    "en",
    acronym.status?.en
  );
  addLiteralDrafts(
    drafts,
    { ...base, sourceId: `${acronym.id}:abbreviation` },
    acronym.abbreviations.fr,
    "fr",
    acronym.status?.fr
  );
  addLiteralDrafts(
    drafts,
    { ...base, sourceId: `${acronym.id}:abbreviation:shared` },
    acronym.abbreviations.shared,
    "en",
    acronym.status?.en
  );
  addLiteralDrafts(
    drafts,
    { ...base, sourceId: `${acronym.id}:abbreviation:shared` },
    acronym.abbreviations.shared,
    "fr",
    acronym.status?.fr
  );
  addLiteralDrafts(
    drafts,
    { ...base, sourceId: `${acronym.id}:fullForm` },
    acronym.fullForms?.en,
    "en",
    acronym.status?.en
  );
  addLiteralDrafts(
    drafts,
    { ...base, sourceId: `${acronym.id}:fullForm` },
    acronym.fullForms?.fr,
    "fr",
    acronym.status?.fr
  );
  addLiteralDrafts(
    drafts,
    { ...base, sourceId: `${acronym.id}:alias` },
    acronym.aliases,
    "en",
    acronym.status?.en
  );
  addLiteralDrafts(
    drafts,
    { ...base, sourceId: `${acronym.id}:alias` },
    acronym.aliases,
    "fr",
    acronym.status?.fr
  );
  addLocalizedDrafts(
    drafts,
    { ...base, sourceId: `${acronym.id}:definition` },
    acronym.definition
  );
};

const addSectionEntries = (drafts: SearchEntryDraft[], section: Section) => {
  addLocalizedDrafts(
    drafts,
    {
      objectId: section.id,
      objectType: "section",
      sourceFamily: "sectionTitle",
      sourceId: section.id,
      title: titleFor(section.title, section.id)
    },
    section.title
  );
  addLocalizedDrafts(
    drafts,
    {
      objectId: section.id,
      objectType: "section",
      sourceFamily: "sectionTitle",
      sourceId: `${section.id}:description`,
      title: titleFor(section.title, section.id)
    },
    section.description
  );
};

const addRelationshipEntries = (
  drafts: SearchEntryDraft[],
  registries: CanonicalRegistries,
  relationship: Relationship
) => {
  const sourceNode = registries.nodes.resolveNode(relationship.sourceId);
  const targetNode = registries.nodes.resolveNode(relationship.targetId);

  if (!sourceNode || !targetNode) return;

  const objectType = getNodeObjectType(sourceNode);
  const sourceTitle = getNodeTitle(sourceNode);
  const targetTitle = getNodeTitle(targetNode);
  const text = {
    en: `${sourceTitle.en} ${relationship.type} ${targetTitle.en}`,
    fr:
      sourceTitle.fr && targetTitle.fr
        ? `${sourceTitle.fr} ${relationship.type} ${targetTitle.fr}`
        : undefined,
    status: {
      en: sourceTitle.status?.en ?? targetTitle.status?.en,
      fr: sourceTitle.status?.fr ?? targetTitle.status?.fr
    }
  };
  const base = {
    objectId: sourceNode.id,
    objectType,
    sourceFamily: "relationship" as const,
    sourceId: relationship.id,
    title: titleFor(sourceTitle, sourceNode.id),
    activityId: objectType === "activity" ? sourceNode.id : undefined
  };

  addLocalizedDrafts(drafts, base, text);
  addLocalizedDrafts(drafts, base, relationship.note);
};

const finalizeEntries = (drafts: readonly SearchEntryDraft[]) => {
  const entries = drafts
    .filter((draft) => draft.text.trim().length > 0)
    .map((draft, index): DerivedSearchEntry => {
      const normalized = normalizeSearchText(draft.text);

      return {
        ...draft,
        id: `SI-${String(index + 1).padStart(6, "0")}`,
        route: getRoute(draft.objectType, draft.objectId),
        normalizedText: normalized.normalized,
        compactText: normalized.compact,
        tokens: normalized.tokens,
        tokenVariants: normalized.tokenVariants,
        baseWeight: sourceFamilyWeights[draft.sourceFamily]
      };
    })
    .filter((entry) => entry.tokens.length > 0);

  return entries.sort(
    (left, right) =>
      objectTypePriority[left.objectType] - objectTypePriority[right.objectType] ||
      left.objectId.localeCompare(right.objectId) ||
      left.sourceFamily.localeCompare(right.sourceFamily) ||
      left.sourceId.localeCompare(right.sourceId) ||
      left.language.localeCompare(right.language) ||
      left.id.localeCompare(right.id)
  );
};

export const buildDerivedSearchIndex = (
  registries: CanonicalRegistries
): DerivedSearchIndex => {
  const drafts: SearchEntryDraft[] = [];

  registries.sections.getAll().forEach((section) =>
    addSectionEntries(drafts, section)
  );
  registries.activities.getAll().forEach((activity) =>
    addActivityEntries(drafts, activity)
  );
  registries.quickViews.getAll().forEach((quickView) =>
    addQuickViewEntries(drafts, registries, quickView)
  );
  registries.learnContent.getAll().forEach((learnContent) =>
    addLearnContentEntries(drafts, registries, learnContent)
  );
  registries.workflows.getAll().forEach((workflow) =>
    addWorkflowEntries(drafts, workflow)
  );
  registries.preConcealmentWorkflows.getAll().forEach((workflow) =>
    addPreConcealmentEntries(drafts, workflow)
  );
  registries.gates.getAll().forEach((gate) => addGateEntries(drafts, gate));
  registries.terminology.getAll().forEach((concept) =>
    addTerminologyEntries(drafts, concept)
  );
  registries.acronyms.getAll().forEach((acronym) =>
    addAcronymEntries(drafts, acronym)
  );
  registries.relationships.getAll().forEach((relationship) =>
    addRelationshipEntries(drafts, registries, relationship)
  );

  const entries = finalizeEntries(drafts);

  return Object.freeze({
    generatedBy: "derived-search-index",
    entryCount: entries.length,
    entries
  });
};

export const collectContentItemsForSearch = (
  blocks: readonly ContentBlock[] | undefined
) => contentItemsFromBlocks(blocks);
