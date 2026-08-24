import type { CanonicalRegistries } from "@/domain/registries";

import {
  deriveAfter,
  deriveBefore,
  deriveCloseout,
  deriveCommissioning,
  deriveGates,
  deriveInterfaces,
  deriveNavigationGroups,
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
    getWorkflows: (nodeId: string) => deriveWorkflows(nodeId, registries),
    getTesting: (nodeId: string) => deriveTesting(nodeId, registries),
    getCommissioning: (nodeId: string) =>
      deriveCommissioning(nodeId, registries),
    getCloseout: (nodeId: string) => deriveCloseout(nodeId, registries)
  });

export type RelationshipService = ReturnType<typeof createRelationshipService>;
