import type { CanonicalRegistries } from "@/domain/registries";

import {
  deriveAfter,
  deriveBefore,
  deriveCloseout,
  deriveCommissioning,
  deriveControlledByGate,
  deriveGates,
  deriveInterfaces,
  deriveNavigationGroups,
  deriveTestedSystems,
  deriveTesting,
  deriveWorkflows
} from "./relationshipDerivation";

export const createRelationshipService = (registries: CanonicalRegistries) =>
  Object.freeze({
    getNavigationGroups: (nodeId: string) =>
      deriveNavigationGroups(nodeId, registries),
    getBefore: (nodeId: string) => deriveBefore(nodeId, registries),
    getAfter: (nodeId: string) => deriveAfter(nodeId, registries),
    getInterfaces: (nodeId: string) => deriveInterfaces(nodeId, registries),
    getGates: (nodeId: string) => deriveGates(nodeId, registries),
    getControlledByGate: (gateId: string) =>
      deriveControlledByGate(gateId, registries),
    getWorkflows: (nodeId: string) => deriveWorkflows(nodeId, registries),
    getTesting: (nodeId: string) => deriveTesting(nodeId, registries),
    getTestedSystems: (testNodeId: string) =>
      deriveTestedSystems(testNodeId, registries),
    getCommissioning: (nodeId: string) =>
      deriveCommissioning(nodeId, registries),
    getCloseout: (nodeId: string) => deriveCloseout(nodeId, registries)
  });

export type RelationshipService = ReturnType<typeof createRelationshipService>;
