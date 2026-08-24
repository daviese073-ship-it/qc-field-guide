import type { CanonicalRegistries } from "@/domain/registries";
import type {
  Activity,
  Gate,
  PreConcealmentWorkflow,
  Relationship,
  TerminologyConcept,
  Workflow
} from "@/domain/types";
import {
  createActivityService,
  type AvailableActivityMode
} from "@/services/activity";
import {
  getCanonicalRoute,
  type CanonicalRouteTarget
} from "@/services/navigation";
import { createRelationshipService } from "@/services/relationships";

import {
  getScreenContract,
  type ScreenContract,
  type ScreenId
} from "./screenContracts";

export type ScreenModelStatus = "found" | "notFound";

export interface ScreenAction {
  label: string;
  target: CanonicalRouteTarget;
  route: string;
}

export interface BreadcrumbItem {
  label: string;
  target: CanonicalRouteTarget;
  route: string;
}

const routeAction = (
  label: string,
  target: CanonicalRouteTarget
): ScreenAction => ({
  label,
  target,
  route: getCanonicalRoute(target)
});

const breadcrumbItem = (
  label: string,
  target: CanonicalRouteTarget
): BreadcrumbItem => ({
  label,
  target,
  route: getCanonicalRoute(target)
});

const searchAction = () => routeAction("Search", { objectType: "search" });
const homeAction = () => routeAction("Home", { objectType: "home" });

const getSectionBreadcrumb = (
  registries: CanonicalRegistries,
  activity: Activity
): readonly BreadcrumbItem[] => {
  const section = registries.sections.getById(activity.sectionId);

  return [
    breadcrumbItem("Home", { objectType: "home" }),
    ...(section
      ? [
          breadcrumbItem(section.title.en, {
            objectType: "section",
            id: section.id
          })
        ]
      : [])
  ];
};

const hasArray = (value: readonly unknown[] | undefined) =>
  Boolean(value?.length);

const getActivityFlags = (activity: Activity): readonly string[] => {
  const tags = new Set(activity.nodeTags);
  const flags = new Set(activity.flags ?? []);
  const visibleFlags: string[] = [];

  if (tags.has("preConcealment") || flags.has("preConcealment")) {
    visibleFlags.push("preConcealment");
  }
  if (tags.has("highControl") || flags.has("highControl")) {
    visibleFlags.push("highControl");
  }
  if (tags.has("specialistInterface") || flags.has("specialistInterface")) {
    visibleFlags.push("specialist");
  }
  if (tags.has("testing")) {
    visibleFlags.push("testing");
  }
  if (tags.has("interface") || tags.has("interfaceHub")) {
    visibleFlags.push("interfaceCritical");
  }
  if (hasArray(activity.logic?.invalidationRuleIds)) {
    visibleFlags.push("recheckIfModified");
  }

  return visibleFlags;
};

const chooseActivityMode = (
  requestedMode: AvailableActivityMode | undefined,
  availableModes: readonly AvailableActivityMode[]
): AvailableActivityMode | undefined => {
  if (requestedMode && availableModes.includes(requestedMode)) {
    return requestedMode;
  }

  return availableModes[0];
};

export interface HomeScreenModel {
  screen: ScreenContract;
  visibleSections: readonly string[];
  actions: readonly ScreenAction[];
}

export const buildHomeScreenModel = (
  registries: CanonicalRegistries,
  options: {
    favorites?: readonly CanonicalRouteTarget[];
    recents?: readonly CanonicalRouteTarget[];
  } = {}
): HomeScreenModel => {
  const visibleSections = [
    "search",
    "browseSystems",
    ...(registries.workflows.getAll().length > 0 ? ["workflows"] : []),
    ...(registries.preConcealmentWorkflows.getAll().length > 0
      ? ["preConcealment"]
      : []),
    ...(options.favorites?.length ? ["favorites"] : []),
    ...(options.recents?.length ? ["recents"] : [])
  ];

  return {
    screen: getScreenContract("home"),
    visibleSections,
    actions: [
      homeAction(),
      searchAction(),
      ...registries.sections
        .getAll()
        .map((section) =>
          routeAction(section.title.en, {
            objectType: "section",
            id: section.id
          })
        ),
      ...registries.workflows.getAll().map((workflow) =>
        routeAction(workflow.title.en, {
          objectType: "workflow",
          id: workflow.id
        })
      ),
      ...registries.preConcealmentWorkflows.getAll().map((workflow) =>
        routeAction(workflow.title.en, {
          objectType: "preConcealment",
          id: workflow.id
        })
      ),
      ...(options.favorites ?? []).map((target) =>
        routeAction("Favorite", target)
      ),
      ...(options.recents ?? []).map((target) => routeAction("Recent", target))
    ]
  };
};

export interface SectionActivitySummary {
  id: string;
  title: Activity["title"];
  nodeTags: Activity["nodeTags"];
  flags: readonly string[];
  purpose?: Activity["qualityObjective"];
}

export interface SectionScreenModel {
  screen: ScreenContract;
  status: ScreenModelStatus;
  sectionId: string;
  activities: readonly SectionActivitySummary[];
  actions: readonly ScreenAction[];
}

export const buildSectionScreenModel = (
  registries: CanonicalRegistries,
  sectionId: string
): SectionScreenModel => {
  const section = registries.sections.getById(sectionId);
  const activities = section
    ? registries.activities.getActivitiesBySection(sectionId)
    : [];

  return {
    screen: getScreenContract("section"),
    status: section ? "found" : "notFound",
    sectionId,
    activities: activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      nodeTags: activity.nodeTags,
      flags: getActivityFlags(activity),
      purpose: activity.qualityObjective
    })),
    actions: [
      homeAction(),
      searchAction(),
      ...activities.map((activity) =>
        routeAction(activity.title.en, {
          objectType: "activity",
          id: activity.id
        })
      )
    ]
  };
};

export interface ActivityScreenModel {
  screen: ScreenContract;
  status: ScreenModelStatus;
  activityId: string;
  activity?: Activity;
  quickView: ReturnType<
    ReturnType<typeof createActivityService>["getQuickView"]
  >;
  learnContent: ReturnType<
    ReturnType<typeof createActivityService>["getLearnContent"]
  >;
  availableModes: readonly AvailableActivityMode[];
  selectedMode?: AvailableActivityMode;
  breadcrumb: readonly BreadcrumbItem[];
  flags: readonly string[];
  relationshipGroups: ReturnType<
    ReturnType<typeof createRelationshipService>["getNavigationGroups"]
  >;
  actions: readonly ScreenAction[];
}

export const buildActivityScreenModel = (
  registries: CanonicalRegistries,
  activityId: string,
  requestedMode?: AvailableActivityMode
): ActivityScreenModel => {
  const activityService = createActivityService(registries);
  const relationshipService = createRelationshipService(registries);
  const activity = activityService.getActivity(activityId);
  const availableModes = activityService.getAvailableModes(activityId);
  const relationshipGroups =
    relationshipService.getNavigationGroups(activityId);
  const relatedActions = relationshipGroups.flatMap((group) =>
    group.items.map((item) =>
      routeAction(`${group.id}:${item.relatedNodeId}`, {
        objectType:
          item.relatedNodeKind === "preConcealmentWorkflow"
            ? "preConcealment"
            : item.relatedNodeKind,
        id: item.relatedNodeId
      } as CanonicalRouteTarget)
    )
  );

  return {
    screen: getScreenContract("activity"),
    status: activity ? "found" : "notFound",
    activityId,
    activity,
    quickView: activityService.getQuickView(activityId),
    learnContent: activityService.getLearnContent(activityId),
    availableModes,
    selectedMode: chooseActivityMode(requestedMode, availableModes),
    breadcrumb: activity ? getSectionBreadcrumb(registries, activity) : [],
    flags: activity ? getActivityFlags(activity) : [],
    relationshipGroups,
    actions: [
      homeAction(),
      searchAction(),
      ...(activity
        ? [
            routeAction("Parent section", {
              objectType: "section",
              id: activity.sectionId
            })
          ]
        : []),
      ...relatedActions,
      ...((activity?.terminologyRefs ?? []).map((conceptId) =>
        routeAction(conceptId, { objectType: "term", id: conceptId })
      ) ?? [])
    ]
  };
};

export interface WorkflowScreenModel {
  screen: ScreenContract;
  status: ScreenModelStatus;
  workflowId: string;
  workflow?: Workflow;
  activities: readonly Activity[];
  gates: readonly Gate[];
  relationships: readonly Relationship[];
  actions: readonly ScreenAction[];
}

export const buildWorkflowScreenModel = (
  registries: CanonicalRegistries,
  workflowId: string
): WorkflowScreenModel => {
  const workflow = registries.workflows.getById(workflowId);
  const activities = (workflow?.activityIds ?? [])
    .map((id) => registries.activities.getById(id))
    .filter((activity): activity is Activity => Boolean(activity));
  const gates = (workflow?.gateIds ?? [])
    .map((id) => registries.gates.getById(id))
    .filter((gate): gate is Gate => Boolean(gate));
  const relationships = (workflow?.relatedRelationshipIds ?? [])
    .map((id) => registries.relationships.getById(id))
    .filter((relationship): relationship is Relationship =>
      Boolean(relationship)
    );

  return {
    screen: getScreenContract("workflow"),
    status: workflow ? "found" : "notFound",
    workflowId,
    workflow,
    activities,
    gates,
    relationships,
    actions: [
      searchAction(),
      ...activities.map((activity) =>
        routeAction(activity.title.en, {
          objectType: "activity",
          id: activity.id
        })
      ),
      ...gates.map((gate) =>
        routeAction(gate.title.en, { objectType: "gate", id: gate.id })
      )
    ]
  };
};

export interface PreConcealmentScreenModel {
  screen: ScreenContract;
  status: ScreenModelStatus;
  preConcealmentId: string;
  workflow?: PreConcealmentWorkflow;
  visibleSections: readonly string[];
  activities: readonly Activity[];
  gates: readonly Gate[];
  nextActivities: readonly Activity[];
  actions: readonly ScreenAction[];
}

export const buildPreConcealmentScreenModel = (
  registries: CanonicalRegistries,
  preConcealmentId: string
): PreConcealmentScreenModel => {
  const workflow = registries.preConcealmentWorkflows.getById(preConcealmentId);
  const activities = (workflow?.activityIds ?? [])
    .map((id) => registries.activities.getById(id))
    .filter((activity): activity is Activity => Boolean(activity));
  const gates = (workflow?.gateIds ?? [])
    .map((id) => registries.gates.getById(id))
    .filter((gate): gate is Gate => Boolean(gate));
  const nextActivities = (workflow?.nextActivityIds ?? [])
    .map((id) => registries.activities.getById(id))
    .filter((activity): activity is Activity => Boolean(activity));
  const visibleSections = [
    ...(hasArray(workflow?.criticalChecks) ? ["verify"] : []),
    ...(hasArray(workflow?.evidence) ? ["evidence"] : []),
    ...(hasArray(workflow?.blockIf) ? ["doNotCloseIf"] : []),
    ...(activities.length > 0 ? ["relatedActivities"] : []),
    ...(gates.length > 0 ? ["gate"] : []),
    ...(nextActivities.length > 0 ? ["next"] : [])
  ];

  return {
    screen: getScreenContract("preConcealment"),
    status: workflow ? "found" : "notFound",
    preConcealmentId,
    workflow,
    visibleSections,
    activities,
    gates,
    nextActivities,
    actions: [
      homeAction(),
      ...activities.map((activity) =>
        routeAction(activity.title.en, {
          objectType: "activity",
          id: activity.id
        })
      ),
      ...gates.map((gate) =>
        routeAction(gate.title.en, { objectType: "gate", id: gate.id })
      )
    ]
  };
};

export interface GateScreenModel {
  screen: ScreenContract;
  status: ScreenModelStatus;
  gateId: string;
  gate?: Gate;
  controlledActivities: readonly Activity[];
  prerequisiteActivities: readonly Activity[];
  downstreamActivities: readonly Activity[];
  invalidationRules: readonly string[];
  actions: readonly ScreenAction[];
}

export const buildGateScreenModel = (
  registries: CanonicalRegistries,
  gateId: string
): GateScreenModel => {
  const gate = registries.gates.getById(gateId);
  const relationshipService = createRelationshipService(registries);
  const controlledActivities = relationshipService
    .getControlledByGate(gateId)
    .map((item) => item.relatedNode.object)
    .filter((node): node is Activity => "sectionId" in node);
  const prerequisiteActivities = (gate?.prerequisiteActivityIds ?? [])
    .map((id) => registries.activities.getById(id))
    .filter((activity): activity is Activity => Boolean(activity));
  const downstreamActivities = (gate?.downstreamActivityIds ?? [])
    .map((id) => registries.activities.getById(id))
    .filter((activity): activity is Activity => Boolean(activity));

  return {
    screen: getScreenContract("gate"),
    status: gate ? "found" : "notFound",
    gateId,
    gate,
    controlledActivities,
    prerequisiteActivities,
    downstreamActivities,
    invalidationRules: gate?.invalidationRuleIds ?? [],
    actions: [
      homeAction(),
      searchAction(),
      ...controlledActivities.map((activity) =>
        routeAction(activity.title.en, {
          objectType: "activity",
          id: activity.id
        })
      ),
      ...prerequisiteActivities.map((activity) =>
        routeAction(activity.title.en, {
          objectType: "activity",
          id: activity.id
        })
      ),
      ...downstreamActivities.map((activity) =>
        routeAction(activity.title.en, {
          objectType: "activity",
          id: activity.id
        })
      )
    ]
  };
};

export interface SearchScreenModel {
  screen: ScreenContract;
  query: string;
  resultTypes: readonly string[];
}

export const buildSearchScreenModel = (query = ""): SearchScreenModel => ({
  screen: getScreenContract("search"),
  query,
  resultTypes: []
});

export interface TerminologyScreenModel {
  screen: ScreenContract;
  status: ScreenModelStatus;
  conceptId: string;
  concept?: TerminologyConcept;
  acronym?: ReturnType<CanonicalRegistries["acronyms"]["getById"]>;
  relatedActivities: readonly Activity[];
  relatedConcepts: readonly TerminologyConcept[];
  actions: readonly ScreenAction[];
}

export const buildTerminologyScreenModel = (
  registries: CanonicalRegistries,
  conceptId: string
): TerminologyScreenModel => {
  const concept = registries.terminology.getById(conceptId);
  const acronym = registries.acronyms.getById(conceptId);
  const relatedActivityIds =
    concept?.relatedActivityIds ?? acronym?.relatedActivityIds ?? [];
  const relatedConceptIds =
    concept?.relatedConceptIds ?? acronym?.relatedConceptIds ?? [];
  const relatedActivities = relatedActivityIds
    .map((id) => registries.activities.getById(id))
    .filter((activity): activity is Activity => Boolean(activity));
  const relatedConcepts = relatedConceptIds
    .map((id) => registries.terminology.getById(id))
    .filter((term): term is TerminologyConcept => Boolean(term));

  return {
    screen: getScreenContract("terminology"),
    status: concept || acronym ? "found" : "notFound",
    conceptId,
    concept,
    acronym,
    relatedActivities,
    relatedConcepts,
    actions: [
      homeAction(),
      searchAction(),
      ...relatedActivities.map((activity) =>
        routeAction(activity.title.en, {
          objectType: "activity",
          id: activity.id
        })
      ),
      ...relatedConcepts.map((term) =>
        routeAction(term.preferred.en, { objectType: "term", id: term.id })
      )
    ]
  };
};

export const getScreenContractById = (screenId: ScreenId) =>
  getScreenContract(screenId);
