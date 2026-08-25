import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { ContentBlock, ContentItem } from "@/domain/types";

export const expectedProductionConditionIds = [
  "always",
  "whereApplicable",
  "whereSpecified",
  "whereRated",
  "whereFireSeparation",
  "whereExterior",
  "whereExteriorEnvelope",
  "whereRoof",
  "whereConcealed",
  "whereTestingRequired",
  "whereEquipmentPresent",
  "whereSystemPresent",
  "whereBuried",
  "whereSpecialistRequired"
] as const;

export const expectedProductionGateIds = [
  "G-STR-01",
  "G-ENV-01",
  "G-ROOF-01A",
  "G-ROOF-01B",
  "G-ROOF-01C",
  "G-ROOF-01D",
  "G-ROOF-01E",
  "G-INT-01",
  "G-MEP-01",
  "G-MEP-02",
  "G-LS-01",
  "G-EXT-01",
  "G-EXT-02",
  "G-TST-01",
  "G-FINAL-01"
] as const;

export const expectedProductionInvalidationRuleIds = [
  "INV-STRUCT-REBAR-MOVED",
  "INV-STRUCT-EMBED-MOVED",
  "INV-STRUCT-FORMWORK-ALTERED",
  "INV-STRUCT-SUPPORTING-CONCRETE-MODIFIED",
  "INV-BG-WATERPROOFING-DAMAGED",
  "INV-BG-BURIED-SERVICE-DISTURBED",
  "INV-BG-SERVICE-ROUTE-CHANGED",
  "INV-ENV-LATER-PENETRATION",
  "INV-ENV-MEMBRANE-DAMAGE",
  "INV-ENV-OPENING-RESET",
  "INV-ENV-SEALANT-REWORK",
  "INV-ROOF-NEW-PENETRATION",
  "INV-ROOF-MEMBRANE-DAMAGE",
  "INV-ROOF-EQUIPMENT-CURB-MODIFIED",
  "INV-ROOF-DRAIN-ALTERED",
  "INV-INT-NEW-ROUGH-IN-AFTER-ACCEPTANCE",
  "INV-INT-WALL-CEILING-REOPENED",
  "INV-INT-ACCESS-PANEL-RELOCATED",
  "INV-FLS-NEW-RATED-PENETRATION",
  "INV-FLS-FIRESTOP-DAMAGED",
  "INV-FLS-DAMPER-DISTURBED",
  "INV-FLS-DOOR-HARDWARE-MODIFIED",
  "INV-MECH-PIPING-REPAIRED-AFTER-TEST",
  "INV-MECH-DUCTWORK-MODIFIED-AFTER-TEST",
  "INV-MECH-EQUIPMENT-RELOCATED",
  "INV-ELEC-RACEWAY-ROUTE-MODIFIED",
  "INV-ELEC-TESTED-CABLE-EQUIPMENT-ALTERED",
  "INV-ELEC-GROUNDING-BONDING-CHANGED",
  "INV-TEST-CONDITION-CHANGED",
  "INV-TEST-FAILED-CORRECTION-RETEST",
  "INV-CORRECTIVE-ADJACENT-WORK-AFFECTED",
  "INV-DOCUMENT-REVISION-CHANGE",
  "INV-MATERIAL-SUBSTITUTION-CHANGE",
  "INV-TEMPORARY-CONDITION-CHANGED",
  "INV-ACCESS-MAINTAINABILITY-BLOCKED",
  "INV-ASBUILT-CONDITION-CHANGED",
  "INV-TURNOVER-DEPENDENCY-REOPENED"
] as const;

const expectedGateTypes = new Set(["HARD", "CONDITIONAL_HARD"]);
const forbiddenProjectQmsFields = [
  "approvedBy",
  "releasedBy",
  "signedBy",
  "approvalTimestamp",
  "actualStatus",
  "projectReleaseNumber",
  "inspectorAcceptance",
  "clientApproval",
  "signature"
] as const;

const contentBlocksWithItems = (
  blocks: readonly ContentBlock[] | undefined
): readonly ContentItem[] =>
  (blocks ?? []).flatMap((block) => {
    switch (block.type) {
      case "paragraph":
      case "notice":
        return [block.item];
      case "bulletList":
      case "checkList":
        return block.items;
      case "example":
      case "referenceList":
      case "subheading":
        return [];
    }
  });

const sorted = (ids: readonly string[]) => [...ids].sort();

const auditExactIds = (
  errors: string[],
  family: string,
  actualIds: readonly string[],
  expectedIds: readonly string[]
) => {
  const actual = new Set(actualIds);
  const expected = new Set(expectedIds);

  for (const id of expectedIds) {
    if (!actual.has(id)) {
      errors.push(`Missing production ${family} ID "${id}".`);
    }
  }

  for (const id of actualIds) {
    if (!expected.has(id)) {
      errors.push(`Unsupported production ${family} ID "${id}".`);
    }
  }
};

const auditForbiddenFields = (
  errors: string[],
  family: string,
  id: string,
  record: unknown
) => {
  const serialized = JSON.stringify(record);

  for (const field of forbiddenProjectQmsFields) {
    if (serialized.includes(`"${field}"`)) {
      errors.push(
        `${family} "${id}" contains forbidden project-QMS field "${field}".`
      );
    }
  }
};

export interface ProductionLogicAuditReport {
  ok: boolean;
  errors: readonly string[];
  conditionCount: number;
  conditionIds: readonly string[];
  gateCount: number;
  gateIds: readonly string[];
  gateTypes: readonly string[];
  invalidationRuleCount: number;
  invalidationRuleIds: readonly string[];
  invalidationSeverities: readonly string[];
  invalidationActions: readonly string[];
}

export const auditProductionLogicDataset = (
  dataset: CanonicalDataset
): ProductionLogicAuditReport => {
  const errors: string[] = [];
  const contentItemIds = new Set<string>();
  const conditionIds = dataset.conditions.map((condition) => condition.id);
  const gateIds = dataset.gates.map((gate) => gate.id);
  const invalidationRuleIds = dataset.invalidationRules.map((rule) => rule.id);
  const gateTypes = new Set<string>();
  const invalidationSeverities = new Set<string>();
  const invalidationActions = new Set<string>();

  auditExactIds(
    errors,
    "condition",
    conditionIds,
    expectedProductionConditionIds
  );
  auditExactIds(errors, "gate", gateIds, expectedProductionGateIds);
  auditExactIds(
    errors,
    "invalidation rule",
    invalidationRuleIds,
    expectedProductionInvalidationRuleIds
  );

  for (const gate of dataset.gates) {
    gateTypes.add(gate.gateType);
    auditForbiddenFields(errors, "Gate", gate.id, gate);

    if (!expectedGateTypes.has(gate.gateType)) {
      errors.push(`Gate "${gate.id}" uses unsupported gate type "${gate.gateType}".`);
    }

    if (gate.sourceRef?.build !== "Build 3") {
      errors.push(`Gate "${gate.id}" is missing Build 3 provenance.`);
    }

    const contentItems = [
      ...contentBlocksWithItems(gate.checkItems),
      ...contentBlocksWithItems(gate.blockingConditions)
    ];

    for (const item of contentItems) {
      if (contentItemIds.has(item.id)) {
        errors.push(`Duplicate production logic content item ID "${item.id}".`);
      }
      contentItemIds.add(item.id);

      if (item.sourceRef?.build !== "Build 3") {
        errors.push(
          `Production logic content item "${item.id}" is missing Build 3 provenance.`
        );
      }
    }
  }

  for (const rule of dataset.invalidationRules) {
    invalidationSeverities.add(rule.severity);
    auditForbiddenFields(errors, "InvalidationRule", rule.id, rule);

    if (rule.sourceRef?.build !== "Build 3") {
      errors.push(`Invalidation rule "${rule.id}" is missing Build 3 provenance.`);
    }

    if (!rule.smallestDefensibleScope?.en) {
      errors.push(
        `Invalidation rule "${rule.id}" is missing smallest-defensible-scope guidance.`
      );
    }

    for (const action of rule.actions ?? []) {
      invalidationActions.add(action);
    }

    for (const item of contentBlocksWithItems(rule.recheckGuidance)) {
      if (contentItemIds.has(item.id)) {
        errors.push(`Duplicate production logic content item ID "${item.id}".`);
      }
      contentItemIds.add(item.id);

      if (item.sourceRef?.build !== "Build 3") {
        errors.push(
          `Production logic content item "${item.id}" is missing Build 3 provenance.`
        );
      }
    }
  }

  if (dataset.relationships.length > 0) {
    errors.push(
      `Production relationships contains ${dataset.relationships.length} records before Phase 012.`
    );
  }

  if (!invalidationSeverities.has("low")) {
    errors.push("Production invalidation rules do not cover low severity.");
  }
  if (!invalidationSeverities.has("medium")) {
    errors.push("Production invalidation rules do not cover medium severity.");
  }
  if (!invalidationSeverities.has("high")) {
    errors.push("Production invalidation rules do not cover high severity.");
  }

  return {
    ok: errors.length === 0,
    errors,
    conditionCount: dataset.conditions.length,
    conditionIds: sorted(conditionIds),
    gateCount: dataset.gates.length,
    gateIds: sorted(gateIds),
    gateTypes: sorted([...gateTypes]),
    invalidationRuleCount: dataset.invalidationRules.length,
    invalidationRuleIds: sorted(invalidationRuleIds),
    invalidationSeverities: sorted([...invalidationSeverities]),
    invalidationActions: sorted([...invalidationActions])
  };
};

export const formatProductionLogicAuditReport = (
  report: ProductionLogicAuditReport
) => {
  if (!report.ok) {
    return [
      "Phase 011 production logic audit failed.",
      ...report.errors.map((error) => `- ${error}`)
    ].join("\n");
  }

  return [
    "Phase 011 production logic audit passed.",
    `Production conditions: ${report.conditionCount}`,
    `Production gates: ${report.gateCount}`,
    `Production invalidation rules: ${report.invalidationRuleCount}`,
    `Gate classes: ${report.gateTypes.join(", ")}`,
    `Invalidation severities: ${report.invalidationSeverities.join(", ")}`,
    `Invalidation actions: ${report.invalidationActions.join(", ")}`
  ].join("\n");
};
