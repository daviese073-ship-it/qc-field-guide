import type { CanonicalDatasetInput } from "@/data/canonicalDataset";
import type { ContentBlock, ContentItem } from "@/domain/types";

const localized = (en: string, fr?: string) => ({
  en,
  ...(fr ? { fr } : {})
});

const contentItem: ContentItem = {
  id: "fixture-content-1",
  text: localized("Fictional non-production fixture text."),
  conditionId: "whereApplicable",
  terminologyRefs: ["TERM-FIXTURE"]
};

const paragraphBlock: ContentBlock = {
  type: "paragraph",
  item: contentItem
};

export const phase003ValidationDataset = {
  sections: [
    {
      id: "10",
      title: localized("Fictional Section"),
      order: 10
    }
  ],
  activities: [
    {
      id: "10.3",
      sectionId: "10",
      title: localized("Fictional Activity"),
      nodeTags: ["activity", "highControl"],
      requirements: [paragraphBlock],
      terminologyRefs: ["TERM-FIXTURE"],
      logic: {
        gateIds: ["G-STR-01"],
        invalidationRuleIds: ["INV-FIXTURE"]
      }
    },
    {
      id: "10.4",
      sectionId: "10",
      title: localized("Fictional Follow-up Activity"),
      nodeTags: ["activity"]
    }
  ],
  quickViews: [
    {
      activityId: "10.3",
      before: [paragraphBlock],
      gateNext: {
        gateIds: ["G-STR-01"],
        nextActivityIds: ["10.4"]
      },
      priorityRelationshipIds: ["REL-FIXTURE-1"],
      qcThinkEnabled: true
    }
  ],
  learnContent: [
    {
      activityId: "10.3",
      whatIsThis: [paragraphBlock],
      terminologyRefs: ["TERM-FIXTURE"],
      specialistAuthorityBoundary: localized(
        "Fictional authority-boundary text.",
        undefined
      )
    }
  ],
  relationships: [
    {
      id: "REL-FIXTURE-1",
      sourceId: "10.3",
      type: "GATED_BY",
      targetId: "G-STR-01",
      direction: "directed",
      conditionId: "always",
      strength: "hard"
    },
    {
      id: "REL-FIXTURE-2",
      sourceId: "10.3",
      type: "REQUIRES",
      targetId: "10.4",
      direction: "directed",
      conditionId: "always",
      strength: "coordination"
    }
  ],
  gates: [
    {
      id: "G-STR-01",
      title: localized("Fictional Gate"),
      gateType: "structural",
      tags: ["gate", "acceptanceGate"],
      prerequisiteActivityIds: ["10.3"],
      checkItems: [paragraphBlock],
      blockingConditions: [paragraphBlock],
      downstreamActivityIds: ["10.4"],
      invalidationRuleIds: ["INV-FIXTURE"],
      authorityNote: localized("This fixture gate is not a project approval.")
    }
  ],
  invalidationRules: [
    {
      id: "INV-FIXTURE",
      trigger: localized("Fictional trigger."),
      affectedActivityIds: ["10.3"],
      affectedGateIds: ["G-STR-01"],
      affectedNodeIds: ["10.4"],
      severity: "medium",
      actions: ["FLAG_FOR_REVIEW"],
      conditionId: "always",
      recheckGuidance: [paragraphBlock],
      smallestDefensibleScope: localized("Fictional local scope.")
    }
  ],
  conditions: [
    {
      id: "always",
      label: localized("Always")
    },
    {
      id: "whereApplicable",
      label: localized("Where applicable")
    },
    {
      id: "whereSpecialistRequired",
      label: localized("Where specialist required")
    }
  ],
  workflows: [
    {
      id: "WF-CON-01",
      title: localized("Fictional Workflow"),
      stages: [
        {
          id: "WF-CON-01-STAGE-1",
          title: localized("Fictional Stage"),
          activityIds: ["10.3"],
          gateIds: ["G-STR-01"],
          relationshipIds: ["REL-FIXTURE-1"],
          conditionId: "whereSpecialistRequired"
        }
      ],
      activityIds: ["10.3"],
      gateIds: ["G-STR-01"],
      relatedRelationshipIds: ["REL-FIXTURE-1"],
      evidenceFocus: [paragraphBlock],
      issuePath: [paragraphBlock],
      flags: ["fixture-only"]
    }
  ],
  preConcealmentWorkflows: [
    {
      id: "PC-FIRE-01",
      title: localized("Fictional Pre-Concealment Workflow"),
      gateIds: ["G-STR-01"],
      activityIds: ["10.3"],
      criticalChecks: [paragraphBlock],
      evidence: [paragraphBlock],
      blockIf: [paragraphBlock],
      nextActivityIds: ["10.4"]
    }
  ],
  terminology: [
    {
      id: "TERM-FIXTURE",
      discipline: "fictional",
      preferred: {
        en: "Fictional concept"
      },
      definition: localized("Fictional definition."),
      relatedActivityIds: ["10.3"],
      status: {
        en: "validated",
        fr: "provisional"
      }
    }
  ],
  acronyms: [
    {
      id: "ACR-FIXTURE",
      abbreviations: {
        shared: ["FIX"]
      },
      fullForms: {
        en: ["Fictional Inspection Fixture"]
      },
      relationType: "SHARED_ACRONYM",
      relatedConceptIds: ["TERM-FIXTURE"],
      relatedActivityIds: ["10.3"],
      relatedWorkflowIds: ["WF-CON-01"],
      relatedGateIds: ["G-STR-01"],
      provisional: true
    }
  ],
  uiStrings: [
    {
      id: "fixture.label",
      en: "Fixture label",
      category: "systemMessage"
    }
  ],
  version: {
    schemaVersion: "phase-003",
    contentVersion: "fixture-only",
    terminologyVersion: "fixture-only"
  }
} satisfies CanonicalDatasetInput;

export const clonePhase003ValidationDataset = (): CanonicalDatasetInput =>
  structuredClone(phase003ValidationDataset);
