import type { CanonicalRouteTarget } from "@/services/navigation";

export type ScreenId =
  | "home"
  | "section"
  | "activity"
  | "workflow"
  | "preConcealment"
  | "gate"
  | "search"
  | "terminology";

export type ScreenActionTarget = CanonicalRouteTarget["objectType"];

export interface ScreenContract {
  id: ScreenId;
  routePattern: string;
  primaryQuestion: string;
  requiredData: readonly string[];
  allowedActionTargets: readonly ScreenActionTarget[];
  forbiddenControls: readonly string[];
}

export const screenContracts = {
  home: {
    id: "home",
    routePattern: "/",
    primaryQuestion: "Where do I need to go?",
    requiredData: [
      "sections",
      "workflows",
      "preConcealmentWorkflows",
      "favorites",
      "recents",
      "languageState"
    ],
    allowedActionTargets: [
      "search",
      "section",
      "workflow",
      "preConcealment",
      "activity",
      "term",
      "home"
    ],
    forbiddenControls: [
      "project progress",
      "inspection counts",
      "status dashboard",
      "official reports"
    ]
  },
  section: {
    id: "section",
    routePattern: "/section/:sectionId",
    primaryQuestion: "What work exists in this system?",
    requiredData: ["section", "activities belonging to section"],
    allowedActionTargets: ["activity", "search", "home"],
    forbiddenControls: ["quick checklist", "full activity content"]
  },
  activity: {
    id: "activity",
    routePattern: "/activity/:activityId?mode=quick|full|learn",
    primaryQuestion: "How do I inspect/control this activity?",
    requiredData: [
      "activity",
      "quickView",
      "learnContent",
      "derivedRelationshipNavigation",
      "terminology references",
      "navigation context"
    ],
    allowedActionTargets: [
      "activity",
      "workflow",
      "gate",
      "preConcealment",
      "term",
      "section",
      "search"
    ],
    forbiddenControls: ["official approval", "official release"]
  },
  workflow: {
    id: "workflow",
    routePattern: "/workflow/:workflowId",
    primaryQuestion: "What am I doing right now across several activities?",
    requiredData: ["workflow", "stages", "activity IDs", "gate IDs"],
    allowedActionTargets: [
      "activity",
      "gate",
      "preConcealment",
      "term",
      "search",
      "home"
    ],
    forbiddenControls: ["complete workflow", "completion percentage"]
  },
  preConcealment: {
    id: "preConcealment",
    routePattern: "/preconcealment/:preConcealmentId",
    primaryQuestion: "What must be checked before this work disappears?",
    requiredData: [
      "preConcealmentWorkflow",
      "gate IDs",
      "activity IDs",
      "critical checks",
      "evidence",
      "blocking conditions"
    ],
    allowedActionTargets: ["activity", "gate", "workflow", "term", "search"],
    forbiddenControls: ["official release"]
  },
  gate: {
    id: "gate",
    routePattern: "/gate/:gateId",
    primaryQuestion: "What must be satisfied before progression?",
    requiredData: [
      "gate",
      "incoming controlled activities",
      "prerequisites",
      "checkItems",
      "blockingConditions",
      "releaseCondition",
      "downstream activities",
      "invalidation rules"
    ],
    allowedActionTargets: ["activity", "workflow", "preConcealment", "search"],
    forbiddenControls: ["approve gate", "release work", "signature"]
  },
  search: {
    id: "search",
    routePattern: "/search",
    primaryQuestion: "Where is the concept/activity I need?",
    requiredData: ["derived search index", "query state"],
    allowedActionTargets: [
      "activity",
      "workflow",
      "section",
      "preConcealment",
      "gate",
      "term"
    ],
    forbiddenControls: ["AI-generated explanation"]
  },
  terminology: {
    id: "terminology",
    routePattern: "/term/:conceptId",
    primaryQuestion: "What does this technical term mean and where is it used?",
    requiredData: ["terminology concept or acronym", "related activities"],
    allowedActionTargets: ["activity", "term", "search"],
    forbiddenControls: ["technical inspection procedure"]
  }
} satisfies Record<ScreenId, ScreenContract>;

export const getScreenContract = (screenId: ScreenId) =>
  screenContracts[screenId];
