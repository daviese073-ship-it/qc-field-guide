import {
  compareCanonicalIds,
  type CanonicalNode,
  type CanonicalNodeKind,
  type CanonicalRegistries
} from "@/domain/registries";
import type { Relationship } from "@/domain/types";

export type RelationshipNavigationGroupId =
  | "before"
  | "gates"
  | "interfaces"
  | "workflows"
  | "testing"
  | "commissioning"
  | "after"
  | "closeout";

export type RelationshipNavigationDirection =
  "outgoing" | "incoming" | "reciprocal";

export interface RelationshipNavigationItem {
  relationship: Relationship;
  relatedNode: CanonicalNode;
  relatedNodeId: string;
  relatedNodeKind: CanonicalNodeKind;
  direction: RelationshipNavigationDirection;
  conditionId?: string;
  strength?: Relationship["strength"];
}

export interface RelationshipNavigationGroup {
  id: RelationshipNavigationGroupId;
  items: readonly RelationshipNavigationItem[];
}

export const relationshipGroupOrder: readonly RelationshipNavigationGroupId[] =
  [
    "before",
    "gates",
    "interfaces",
    "workflows",
    "testing",
    "commissioning",
    "after",
    "closeout"
  ];

const strengthPriority: Record<
  NonNullable<Relationship["strength"]>,
  number
> = {
  hard: 0,
  conditional: 1,
  coordination: 2
};

const getStrengthPriority = (relationship: Relationship) =>
  relationship.strength ? strengthPriority[relationship.strength] : 3;

const compareItems = (
  left: RelationshipNavigationItem,
  right: RelationshipNavigationItem
) =>
  getStrengthPriority(left.relationship) -
    getStrengthPriority(right.relationship) ||
  compareCanonicalIds(left.relatedNodeId, right.relatedNodeId) ||
  left.relationship.id.localeCompare(right.relationship.id);

const resolveItem = (
  relationship: Relationship,
  relatedNodeId: string,
  direction: RelationshipNavigationDirection,
  registries: CanonicalRegistries
): RelationshipNavigationItem | undefined => {
  const relatedNode = registries.nodes.resolveNode(relatedNodeId);

  if (!relatedNode) {
    return undefined;
  }

  return {
    relationship,
    relatedNode,
    relatedNodeId,
    relatedNodeKind: relatedNode.kind,
    direction,
    conditionId: relationship.conditionId,
    strength: relationship.strength
  };
};

const dedupeByRelatedNode = (
  items: readonly RelationshipNavigationItem[]
): readonly RelationshipNavigationItem[] => {
  const bestByNodeId = new Map<string, RelationshipNavigationItem>();

  for (const item of items) {
    const existing = bestByNodeId.get(item.relatedNodeId);

    if (!existing || compareItems(item, existing) < 0) {
      bestByNodeId.set(item.relatedNodeId, item);
    }
  }

  return [...bestByNodeId.values()].sort(compareItems);
};

const fromRelationships = (
  relationships: readonly Relationship[],
  registries: CanonicalRegistries
) =>
  dedupeByRelatedNode(
    relationships.flatMap((relationship) => {
      const direction =
        relationship.direction === "reciprocal" ? "reciprocal" : "outgoing";
      const item = resolveItem(
        relationship,
        relationship.targetId,
        direction,
        registries
      );

      return item ? [item] : [];
    })
  );

export const deriveBefore = (nodeId: string, registries: CanonicalRegistries) =>
  fromRelationships(
    registries.relationships
      .getAll()
      .filter(
        (relationship) =>
          relationship.type === "REQUIRES" && relationship.sourceId === nodeId
      ),
    registries
  );

export const deriveAfter = (nodeId: string, registries: CanonicalRegistries) =>
  dedupeByRelatedNode(
    registries.relationships.getAll().flatMap((relationship) => {
      if (
        relationship.type !== "REQUIRES" ||
        relationship.targetId !== nodeId
      ) {
        return [];
      }

      const item = resolveItem(
        relationship,
        relationship.sourceId,
        "incoming",
        registries
      );

      return item ? [item] : [];
    })
  );

export const deriveInterfaces = (
  nodeId: string,
  registries: CanonicalRegistries
) =>
  dedupeByRelatedNode(
    registries.relationships.getAll().flatMap((relationship) => {
      if (relationship.type !== "INTERFACES_WITH") {
        return [];
      }

      if (relationship.sourceId === nodeId) {
        const item = resolveItem(
          relationship,
          relationship.targetId,
          "reciprocal",
          registries
        );

        return item ? [item] : [];
      }

      if (relationship.targetId === nodeId) {
        const item = resolveItem(
          relationship,
          relationship.sourceId,
          "reciprocal",
          registries
        );

        return item ? [item] : [];
      }

      return [];
    })
  );

const deriveOutgoingByType = (
  nodeId: string,
  types: readonly Relationship["type"][],
  registries: CanonicalRegistries
) =>
  fromRelationships(
    registries.relationships
      .getAll()
      .filter(
        (relationship) =>
          relationship.sourceId === nodeId && types.includes(relationship.type)
      ),
    registries
  );

export const deriveGates = (nodeId: string, registries: CanonicalRegistries) =>
  deriveOutgoingByType(nodeId, ["GATED_BY"], registries);

export const deriveControlledByGate = (
  gateId: string,
  registries: CanonicalRegistries
) =>
  dedupeByRelatedNode(
    registries.relationships.getAll().flatMap((relationship) => {
      if (
        relationship.type !== "GATED_BY" ||
        relationship.targetId !== gateId
      ) {
        return [];
      }

      const item = resolveItem(
        relationship,
        relationship.sourceId,
        "incoming",
        registries
      );

      return item ? [item] : [];
    })
  );

export const deriveWorkflows = (
  nodeId: string,
  registries: CanonicalRegistries
) =>
  deriveOutgoingByType(
    nodeId,
    ["PENETRATION_MANAGED_BY", "ACCESS_CHECKED_BY"],
    registries
  );

export const deriveTesting = (
  nodeId: string,
  registries: CanonicalRegistries
) => deriveOutgoingByType(nodeId, ["TESTED_BY"], registries);

export const deriveCommissioning = (
  nodeId: string,
  registries: CanonicalRegistries
) => deriveOutgoingByType(nodeId, ["COMMISSIONED_BY"], registries);

export const deriveCloseout = (
  nodeId: string,
  registries: CanonicalRegistries
) =>
  deriveOutgoingByType(
    nodeId,
    ["CLOSES_THROUGH", "AS_BUILT_FEEDS"],
    registries
  );

export const deriveNavigationGroups = (
  nodeId: string,
  registries: CanonicalRegistries
): readonly RelationshipNavigationGroup[] =>
  relationshipGroupOrder
    .map((id): RelationshipNavigationGroup => {
      switch (id) {
        case "before":
          return { id, items: deriveBefore(nodeId, registries) };
        case "gates":
          return { id, items: deriveGates(nodeId, registries) };
        case "interfaces":
          return { id, items: deriveInterfaces(nodeId, registries) };
        case "workflows":
          return { id, items: deriveWorkflows(nodeId, registries) };
        case "testing":
          return { id, items: deriveTesting(nodeId, registries) };
        case "commissioning":
          return { id, items: deriveCommissioning(nodeId, registries) };
        case "after":
          return { id, items: deriveAfter(nodeId, registries) };
        case "closeout":
          return { id, items: deriveCloseout(nodeId, registries) };
      }
    })
    .filter((group) => group.items.length > 0);
