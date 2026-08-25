import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { CanonicalRegistries } from "@/domain/registries";
import type { Relationship } from "@/domain/types";

export const expectedProductionRelationshipCount = 350;

export const expectedProductionRelationshipCountsByType = {
  ACCESS_CHECKED_BY: 7,
  AS_BUILT_FEEDS: 15,
  CLOSES_THROUGH: 2,
  COMMISSIONED_BY: 12,
  GATED_BY: 36,
  INTERFACES_WITH: 118,
  PENETRATION_MANAGED_BY: 4,
  REQUIRES: 142,
  TESTED_BY: 14
} as const satisfies Record<Relationship["type"], number>;

export const expectedProductionRelationshipCountsByStrength = {
  conditional: 242,
  coordination: 27,
  hard: 81
} as const satisfies Record<NonNullable<Relationship["strength"]>, number>;

export const expectedProductionRelationshipCountsByCondition = {
  "(none)": 97,
  whereApplicable: 76,
  whereBuried: 4,
  whereConcealed: 13,
  whereEquipmentPresent: 23,
  whereExterior: 47,
  whereExteriorEnvelope: 9,
  whereFireSeparation: 19,
  whereRated: 4,
  whereRoof: 9,
  whereSpecified: 5,
  whereSystemPresent: 3,
  whereTestingRequired: 41
} as const;

const storedRelationshipTypes = new Set<Relationship["type"]>([
  "REQUIRES",
  "INTERFACES_WITH",
  "GATED_BY",
  "TESTED_BY",
  "COMMISSIONED_BY",
  "PENETRATION_MANAGED_BY",
  "ACCESS_CHECKED_BY",
  "CLOSES_THROUGH",
  "AS_BUILT_FEEDS"
]);

const forbiddenTypeFragments = [
  "NEXT",
  "BEFORE",
  "AFTER",
  "RELATED",
  "PRE_CONCEALMENT",
  "DEFICIENCY",
  "NC",
  "EVIDENCE",
  "TURNOVER",
  "INVALIDATES"
] as const;

const sortedObject = <T extends Record<string, number>>(record: T) =>
  Object.fromEntries(Object.entries(record).sort(([left], [right]) => left.localeCompare(right)));

const increment = (record: Record<string, number>, key: string) => {
  record[key] = (record[key] ?? 0) + 1;
};

const compareCounts = (
  errors: string[],
  label: string,
  actual: Record<string, number>,
  expected: Record<string, number>
) => {
  for (const [key, expectedCount] of Object.entries(expected)) {
    const actualCount = actual[key] ?? 0;

    if (actualCount !== expectedCount) {
      errors.push(
        `Expected ${expectedCount} production relationships for ${label} "${key}"; found ${actualCount}.`
      );
    }
  }

  for (const key of Object.keys(actual)) {
    if (!(key in expected)) {
      errors.push(`Unexpected production relationship ${label} "${key}".`);
    }
  }
};

const relationshipEdgeKey = (relationship: Relationship) =>
  [
    relationship.sourceId,
    relationship.type,
    relationship.targetId,
    relationship.conditionId ?? "(none)"
  ].join("|");

const reciprocalInterfaceKey = (relationship: Relationship) =>
  [
    [relationship.sourceId, relationship.targetId].sort().join("|"),
    relationship.conditionId ?? "(none)"
  ].join("|");

const unorderedRequiresKey = (relationship: Relationship) =>
  [relationship.sourceId, relationship.targetId].sort().join("|");

export interface ProductionRelationshipAuditReport {
  ok: boolean;
  errors: readonly string[];
  relationshipCount: number;
  countsByType: Readonly<Record<string, number>>;
  countsByStrength: Readonly<Record<string, number>>;
  countsByCondition: Readonly<Record<string, number>>;
  activityEndpointCount: number;
  gateEndpointCount: number;
  workflowEndpointCount: number;
  preConcealmentEndpointCount: number;
  unresolvedEndpointCount: number;
}

export const auditProductionRelationshipDataset = (
  dataset: CanonicalDataset,
  registries: CanonicalRegistries
): ProductionRelationshipAuditReport => {
  const errors: string[] = [];
  const relationshipIds = new Set<string>();
  const edgeKeys = new Map<string, string>();
  const reciprocalInterfaceKeys = new Map<string, string>();
  const requiresPairs = new Map<string, Relationship>();
  const countsByType: Record<string, number> = {};
  const countsByStrength: Record<string, number> = {};
  const countsByCondition: Record<string, number> = {};
  let activityEndpointCount = 0;
  let gateEndpointCount = 0;
  let workflowEndpointCount = 0;
  let preConcealmentEndpointCount = 0;
  let unresolvedEndpointCount = 0;

  if (dataset.relationships.length !== expectedProductionRelationshipCount) {
    errors.push(
      `Expected ${expectedProductionRelationshipCount} production relationships; found ${dataset.relationships.length}.`
    );
  }

  for (const relationship of dataset.relationships) {
    increment(countsByType, relationship.type);
    increment(countsByStrength, relationship.strength ?? "(none)");
    increment(countsByCondition, relationship.conditionId ?? "(none)");

    if (!relationship.id.startsWith("REL-")) {
      errors.push(`Relationship "${relationship.id}" does not follow REL-* ID convention.`);
    }

    if (relationshipIds.has(relationship.id)) {
      errors.push(`Duplicate production relationship ID "${relationship.id}".`);
    }
    relationshipIds.add(relationship.id);

    if (!storedRelationshipTypes.has(relationship.type)) {
      errors.push(
        `Relationship "${relationship.id}" uses unsupported stored type "${relationship.type}".`
      );
    }

    for (const fragment of forbiddenTypeFragments) {
      if (relationship.type.includes(fragment)) {
        errors.push(
          `Relationship "${relationship.id}" uses forbidden stored relationship type fragment "${fragment}".`
        );
      }
    }

    if (
      relationship.type === "INTERFACES_WITH" &&
      relationship.direction !== "reciprocal"
    ) {
      errors.push(
        `INTERFACES_WITH relationship "${relationship.id}" must be stored as reciprocal.`
      );
    }

    if (
      relationship.type !== "INTERFACES_WITH" &&
      relationship.direction !== "directed"
    ) {
      errors.push(
        `Directed relationship "${relationship.id}" must be stored as directed.`
      );
    }

    if (relationship.type === "INTERFACES_WITH") {
      const key = reciprocalInterfaceKey(relationship);
      const existing = reciprocalInterfaceKeys.get(key);

      if (existing) {
        errors.push(
          `Duplicate reciprocal INTERFACES_WITH pair "${relationship.sourceId}" <-> "${relationship.targetId}" duplicates "${existing}".`
        );
      } else {
        reciprocalInterfaceKeys.set(key, relationship.id);
      }
    }

    if (relationship.type === "REQUIRES") {
      const key = unorderedRequiresKey(relationship);
      const existing = requiresPairs.get(key);

      if (
        existing &&
        existing.sourceId === relationship.targetId &&
        existing.targetId === relationship.sourceId
      ) {
        errors.push(
          `Reverse REQUIRES duplicate "${relationship.id}" reverses "${existing.id}".`
        );
      } else {
        requiresPairs.set(key, relationship);
      }
    }

    const edgeKey = relationshipEdgeKey(relationship);
    const existingEdge = edgeKeys.get(edgeKey);

    if (existingEdge) {
      errors.push(
        `Duplicate production relationship edge "${relationship.id}" duplicates "${existingEdge}".`
      );
    } else {
      edgeKeys.set(edgeKey, relationship.id);
    }

    if (relationship.conditionId && !registries.conditions.has(relationship.conditionId)) {
      errors.push(
        `Relationship "${relationship.id}" references missing condition "${relationship.conditionId}".`
      );
    }

    for (const endpoint of [relationship.sourceId, relationship.targetId]) {
      const nodeKind = registries.nodes.getNodeKind(endpoint);

      switch (nodeKind) {
        case "activity":
          activityEndpointCount += 1;
          break;
        case "gate":
          gateEndpointCount += 1;
          break;
        case "workflow":
          workflowEndpointCount += 1;
          break;
        case "preConcealmentWorkflow":
          preConcealmentEndpointCount += 1;
          break;
        case undefined:
          unresolvedEndpointCount += 1;
          errors.push(
            `Relationship "${relationship.id}" references unresolved endpoint "${endpoint}".`
          );
          break;
      }
    }
  }

  compareCounts(
    errors,
    "type",
    countsByType,
    expectedProductionRelationshipCountsByType
  );
  compareCounts(
    errors,
    "strength",
    countsByStrength,
    expectedProductionRelationshipCountsByStrength
  );
  compareCounts(
    errors,
    "condition",
    countsByCondition,
    expectedProductionRelationshipCountsByCondition
  );

  if (JSON.stringify(dataset.relationships).includes("FIXTURE")) {
    errors.push("Production relationships reference fixture data.");
  }

  return {
    ok: errors.length === 0,
    errors,
    relationshipCount: dataset.relationships.length,
    countsByType: sortedObject(countsByType),
    countsByStrength: sortedObject(countsByStrength),
    countsByCondition: sortedObject(countsByCondition),
    activityEndpointCount,
    gateEndpointCount,
    workflowEndpointCount,
    preConcealmentEndpointCount,
    unresolvedEndpointCount
  };
};

export const formatProductionRelationshipAuditReport = (
  report: ProductionRelationshipAuditReport
) => {
  if (!report.ok) {
    return [
      "Phase 012 production relationship audit failed.",
      ...report.errors.map((error) => `- ${error}`)
    ].join("\n");
  }

  return [
    "Phase 012 production relationship audit passed.",
    `Production relationships: ${report.relationshipCount}`,
    `Relationship counts by type: ${JSON.stringify(report.countsByType)}`,
    `Relationship counts by strength: ${JSON.stringify(report.countsByStrength)}`,
    `Relationship counts by condition: ${JSON.stringify(report.countsByCondition)}`,
    `Relationship unresolved endpoints: ${report.unresolvedEndpointCount}`
  ].join("\n");
};
