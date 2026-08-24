export type NavigationEntryType =
  | "hierarchy"
  | "relationship"
  | "workflow"
  | "gate"
  | "preConcealment"
  | "search"
  | "favorite"
  | "recent"
  | "terminology";

export type ActivityMode = "quick" | "full" | "learn";

export interface NavigationContext {
  entryType: NavigationEntryType;
  sourceObjectType?: string;
  sourceObjectId?: string;
  relationshipType?: string;
  workflowId?: string;
  preConcealmentId?: string;
  gateId?: string;
  searchQuery?: string;
  requestedMode?: ActivityMode;
}

export const defaultActivityMode: ActivityMode = "quick";

export const resolveActivityModeForNavigation = ({
  sourceObjectType,
  currentMode,
  requestedMode
}: {
  sourceObjectType?: string;
  currentMode?: ActivityMode;
  requestedMode?: ActivityMode;
}): ActivityMode => {
  if (requestedMode) {
    return requestedMode;
  }

  if (sourceObjectType === "activity" && currentMode) {
    return currentMode;
  }

  return defaultActivityMode;
};
