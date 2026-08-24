import type {
  AcronymEntry,
  Activity,
  ContentBlock,
  ContentItem,
  Gate,
  QuickView,
  Relationship,
  SearchIndexEntry,
  Section,
  TerminologyConcept,
  Workflow,
  PreConcealmentWorkflow
} from "@/domain/types";

const localized = (en: string, fr?: string) => ({
  en,
  ...(fr ? { fr } : {})
});

export const contentItemFixture = {
  id: "fixture-content-1",
  text: localized("Fictional fixture text."),
  conditionId: "whereApplicable",
  terminologyRefs: ["TERM-FIXTURE"]
} satisfies ContentItem;

export const paragraphBlockFixture = {
  type: "paragraph",
  item: contentItemFixture
} satisfies ContentBlock;

export const sectionFixture = {
  id: "10",
  title: localized("Fictional Section"),
  order: 10
} satisfies Section;

export const activityFixture = {
  id: "10.3",
  sectionId: "10",
  title: localized("Fictional Activity"),
  nodeTags: ["activity", "interface", "highControl"],
  qualityObjective: localized("Fictional quality objective."),
  applicability: localized("Fictional applicability."),
  authorityNote: localized("Project requirements govern."),
  requirements: [paragraphBlockFixture],
  planning: [paragraphBlockFixture],
  documentControl: [paragraphBlockFixture],
  materialControl: [paragraphBlockFixture],
  inspection: {
    before: [paragraphBlockFixture],
    during: [paragraphBlockFixture],
    after: [paragraphBlockFixture],
    testing: [paragraphBlockFixture]
  },
  evidence: [paragraphBlockFixture],
  issues: {
    commonDeficiencies: [paragraphBlockFixture],
    escalationTriggers: [paragraphBlockFixture]
  },
  correctiveAction: [paragraphBlockFixture],
  verification: [paragraphBlockFixture],
  closureCriteria: [paragraphBlockFixture],
  communications: {
    before: [paragraphBlockFixture],
    issueEscalation: [paragraphBlockFixture]
  },
  outputs: {
    records: [paragraphBlockFixture],
    acceptanceEvidence: [paragraphBlockFixture]
  },
  reportingAnalysis: [paragraphBlockFixture],
  qualityCheckpoint: [paragraphBlockFixture],
  specialistBoundary: contentItemFixture,
  flags: ["highControl"],
  searchRefs: {
    aliasesEn: ["fictional alias"],
    aliasesFr: ["alias fictif"],
    acronyms: ["ACR-FIXTURE"],
    keywords: ["fixture"]
  },
  terminologyRefs: ["TERM-FIXTURE"],
  logic: {
    statusFamily: "ActivityStatus",
    gateIds: ["G-STR-01"],
    invalidationRuleIds: ["INV-FIXTURE"]
  },
  sourceRef: {
    build: "fixture",
    section: "fixture"
  }
} satisfies Activity;

export const directedRelationshipFixture = {
  id: "REL-FIXTURE-1",
  sourceId: "10.3",
  type: "REQUIRES",
  targetId: "G-STR-01",
  direction: "directed",
  conditionId: "always",
  strength: "hard",
  note: localized("Fictional directed relationship.")
} satisfies Relationship;

export const reciprocalRelationshipFixture = {
  id: "REL-FIXTURE-2",
  sourceId: "10.3",
  type: "INTERFACES_WITH",
  targetId: "11.7",
  direction: "reciprocal",
  strength: "coordination"
} satisfies Relationship;

export const gateFixture = {
  id: "G-STR-01",
  title: localized("Fictional Gate"),
  gateType: "structural",
  tags: ["gate", "acceptanceGate"],
  purpose: localized("Fictional gate purpose."),
  prerequisiteActivityIds: ["10.3"],
  checkItems: [paragraphBlockFixture],
  blockingConditions: [paragraphBlockFixture],
  releaseCondition: localized("Fictional release condition."),
  downstreamActivityIds: ["10.4"],
  invalidationRuleIds: ["INV-FIXTURE"],
  authorityNote: localized("This is not an official approval record.")
} satisfies Gate;

export const quickViewFixture = {
  activityId: "10.3",
  before: [paragraphBlockFixture],
  inspect: [paragraphBlockFixture],
  evidence: [paragraphBlockFixture],
  watchFor: [paragraphBlockFixture],
  dontMiss: [paragraphBlockFixture],
  gateNext: {
    gateIds: ["G-STR-01"],
    nextActivityIds: ["10.4"]
  },
  priorityRelationshipIds: ["REL-FIXTURE-1"],
  specialistAlert: localized("Fictional specialist alert."),
  invalidationAlert: localized("Fictional invalidation alert."),
  qcThinkEnabled: true
} satisfies QuickView;

export const workflowFixture = {
  id: "WF-CON-01",
  title: localized("Fictional Workflow"),
  description: localized("Fictional workflow description."),
  stages: [
    {
      id: "WF-STAGE-1",
      title: localized("Fictional Stage"),
      activityIds: ["10.3"],
      gateIds: ["G-STR-01"],
      relationshipIds: ["REL-FIXTURE-1"]
    }
  ],
  activityIds: ["10.3"],
  gateIds: ["G-STR-01"],
  relatedRelationshipIds: ["REL-FIXTURE-1"],
  evidenceFocus: [paragraphBlockFixture],
  issuePath: [paragraphBlockFixture],
  flags: ["fixture"]
} satisfies Workflow;

export const preConcealmentWorkflowFixture = {
  id: "PC-FIRE-01",
  title: localized("Fictional Pre-Concealment Workflow"),
  gateIds: ["G-STR-01"],
  activityIds: ["10.3"],
  criticalChecks: [paragraphBlockFixture],
  evidence: [paragraphBlockFixture],
  blockIf: [paragraphBlockFixture],
  nextActivityIds: ["10.4"]
} satisfies PreConcealmentWorkflow;

export const terminologyConceptFixture = {
  id: "TERM-FIXTURE",
  discipline: "fictional",
  preferred: {
    en: "Fictional concept"
  },
  aliases: {
    en: ["fictional alias"],
    fr: ["alias fictif"]
  },
  definition: localized("Fictional definition."),
  contextNotes: localized("Fictional context note."),
  relatedActivityIds: ["10.3"],
  status: {
    en: "validated",
    fr: "provisional"
  },
  confidence: {
    en: "high",
    fr: "medium"
  }
} satisfies TerminologyConcept;

export const acronymEntryFixture = {
  id: "ACR-FIXTURE",
  preferredLabel: localized("Fictional Acronym"),
  abbreviations: {
    shared: ["FIX"]
  },
  fullForms: {
    en: ["Fictional Inspection Example"],
    fr: ["Exemple d'inspection fictif"]
  },
  definition: localized("Fictional acronym definition."),
  relationType: "SHARED_ACRONYM",
  relatedConceptIds: ["TERM-FIXTURE"],
  relatedActivityIds: ["10.3"],
  provisional: true,
  status: {
    fr: "provisional"
  }
} satisfies AcronymEntry;

export const searchIndexEntryFixture = {
  objectId: "10.3",
  objectType: "activity",
  preferred: {
    en: "Fictional Activity",
    fr: "Activite fictive"
  },
  aliases: {
    en: ["fixture"],
    fr: ["fictif"]
  },
  acronyms: ["FIX"],
  normalizedTerms: ["fictional", "fixture"],
  tokens: ["fictional", "activity"],
  discipline: "fictional",
  category: "fixture",
  relationBoostIds: ["REL-FIXTURE-1"],
  baseWeight: 1
} satisfies SearchIndexEntry;
