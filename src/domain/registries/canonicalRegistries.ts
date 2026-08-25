import type { CanonicalDataset } from "@/data/canonicalDataset";
import type {
  AcronymEntry,
  Activity,
  ConditionDefinition,
  Gate,
  GeneralQcProcess,
  InvalidationRule,
  LearnContent,
  PreConcealmentWorkflow,
  QuickView,
  Relationship,
  Section,
  TerminologyConcept,
  UiString,
  Workflow
} from "@/domain/types";

import {
  compareCanonicalIds,
  createIdRegistry,
  type ReadonlyRegistry
} from "./registry";

export type CanonicalNodeKind =
  "activity" | "gate" | "workflow" | "preConcealmentWorkflow";

export type CanonicalNode =
  | { kind: "activity"; id: string; object: Activity }
  | { kind: "gate"; id: string; object: Gate }
  | { kind: "workflow"; id: string; object: Workflow }
  | {
      kind: "preConcealmentWorkflow";
      id: string;
      object: PreConcealmentWorkflow;
    };

export interface CanonicalNodeResolver {
  resolveNode(id: string): CanonicalNode | undefined;
  hasNode(id: string): boolean;
  getNodeKind(id: string): CanonicalNodeKind | undefined;
}

export interface CanonicalRegistries {
  sections: ReadonlyRegistry<Section>;
  activities: ReadonlyRegistry<Activity> & {
    getActivitiesBySection(sectionId: string): readonly Activity[];
  };
  quickViews: ReadonlyRegistry<QuickView>;
  learnContent: ReadonlyRegistry<LearnContent>;
  relationships: ReadonlyRegistry<Relationship>;
  gates: ReadonlyRegistry<Gate>;
  invalidationRules: ReadonlyRegistry<InvalidationRule>;
  conditions: ReadonlyRegistry<ConditionDefinition>;
  workflows: ReadonlyRegistry<Workflow>;
  preConcealmentWorkflows: ReadonlyRegistry<PreConcealmentWorkflow>;
  terminology: ReadonlyRegistry<TerminologyConcept>;
  acronyms: ReadonlyRegistry<AcronymEntry>;
  uiStrings: ReadonlyRegistry<UiString>;
  generalQcProcesses: ReadonlyRegistry<GeneralQcProcess>;
  nodes: CanonicalNodeResolver;
}

const byId = <T extends { id: string }>(item: T) => item.id;

const compareById = <T extends { id: string }>(left: T, right: T) =>
  compareCanonicalIds(left.id, right.id);

const createActivityRegistry = (activities: readonly Activity[]) => {
  const base = createIdRegistry({
    family: "activity",
    items: activities,
    getId: byId,
    sort: compareById
  });
  const bySectionId = new Map<string, Activity[]>();

  for (const activity of base.getAll()) {
    const sectionActivities = bySectionId.get(activity.sectionId) ?? [];
    sectionActivities.push(activity);
    bySectionId.set(activity.sectionId, sectionActivities);
  }

  return Object.freeze({
    ...base,
    getActivitiesBySection: (sectionId: string) =>
      [...(bySectionId.get(sectionId) ?? [])].sort(compareById)
  });
};

const bindNodeResolver = (
  registries: Omit<CanonicalRegistries, "nodes">
): CanonicalNodeResolver => {
  const resolveNode = (id: string): CanonicalNode | undefined => {
    const activity = registries.activities.getById(id);
    if (activity) return { kind: "activity", id, object: activity };

    const gate = registries.gates.getById(id);
    if (gate) return { kind: "gate", id, object: gate };

    const workflow = registries.workflows.getById(id);
    if (workflow) return { kind: "workflow", id, object: workflow };

    const preConcealmentWorkflow =
      registries.preConcealmentWorkflows.getById(id);
    if (preConcealmentWorkflow) {
      return {
        kind: "preConcealmentWorkflow",
        id,
        object: preConcealmentWorkflow
      };
    }

    return undefined;
  };

  return Object.freeze({
    resolveNode,
    hasNode: (id: string) => Boolean(resolveNode(id)),
    getNodeKind: (id: string) => resolveNode(id)?.kind
  });
};

export const buildCanonicalRegistries = (
  dataset: CanonicalDataset
): CanonicalRegistries => {
  const registries = {
    sections: createIdRegistry({
      family: "section",
      items: dataset.sections,
      getId: byId,
      sort: (left, right) =>
        left.order - right.order || compareCanonicalIds(left.id, right.id)
    }),
    activities: createActivityRegistry(dataset.activities),
    quickViews: createIdRegistry({
      family: "quickView activity ownership",
      items: dataset.quickViews,
      getId: (quickView) => quickView.activityId,
      sort: (left, right) =>
        compareCanonicalIds(left.activityId, right.activityId)
    }),
    learnContent: createIdRegistry({
      family: "learnContent activity ownership",
      items: dataset.learnContent,
      getId: (learnContent) => learnContent.activityId,
      sort: (left, right) =>
        compareCanonicalIds(left.activityId, right.activityId)
    }),
    relationships: createIdRegistry({
      family: "relationship",
      items: dataset.relationships,
      getId: byId,
      sort: compareById
    }),
    gates: createIdRegistry({
      family: "gate",
      items: dataset.gates,
      getId: byId,
      sort: compareById
    }),
    invalidationRules: createIdRegistry({
      family: "invalidation rule",
      items: dataset.invalidationRules,
      getId: byId,
      sort: compareById
    }),
    conditions: createIdRegistry({
      family: "condition",
      items: dataset.conditions,
      getId: byId,
      sort: compareById
    }),
    workflows: createIdRegistry({
      family: "workflow",
      items: dataset.workflows,
      getId: byId,
      sort: compareById
    }),
    preConcealmentWorkflows: createIdRegistry({
      family: "pre-concealment workflow",
      items: dataset.preConcealmentWorkflows,
      getId: byId,
      sort: compareById
    }),
    terminology: createIdRegistry({
      family: "terminology concept",
      items: dataset.terminology,
      getId: byId,
      sort: compareById
    }),
    acronyms: createIdRegistry({
      family: "acronym",
      items: dataset.acronyms,
      getId: byId,
      sort: compareById
    }),
    uiStrings: createIdRegistry({
      family: "UI string",
      items: dataset.uiStrings,
      getId: byId,
      sort: compareById
    }),
    generalQcProcesses: createIdRegistry({
      family: "General QC process",
      items: dataset.generalQcProcesses,
      getId: byId,
      sort: (left, right) =>
        left.sequence - right.sequence || compareCanonicalIds(left.id, right.id)
    })
  };

  return Object.freeze({
    ...registries,
    nodes: bindNodeResolver(registries)
  });
};
