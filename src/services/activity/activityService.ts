import type { CanonicalRegistries } from "@/domain/registries";
import type { Activity, LearnContent, QuickView } from "@/domain/types";

export type AvailableActivityMode = "quick" | "full" | "learn";

const hasContentArray = (content: readonly unknown[] | undefined) =>
  Boolean(content?.length);

const hasQuickViewContent = (quickView: QuickView | undefined) =>
  Boolean(
    quickView &&
    (hasContentArray(quickView.before) ||
      hasContentArray(quickView.inspect) ||
      hasContentArray(quickView.evidence) ||
      hasContentArray(quickView.watchFor) ||
      hasContentArray(quickView.dontMiss) ||
      Boolean(quickView.gateNext) ||
      hasContentArray(quickView.priorityRelationshipIds) ||
      Boolean(quickView.specialistAlert) ||
      Boolean(quickView.invalidationAlert) ||
      quickView.qcThinkEnabled === true)
  );

const hasLearnContent = (learnContent: LearnContent | undefined) =>
  Boolean(
    learnContent &&
    (hasContentArray(learnContent.whatIsThis) ||
      hasContentArray(learnContent.whyItMatters) ||
      hasContentArray(learnContent.terminologyRefs) ||
      hasContentArray(learnContent.howGoodWorkLooks) ||
      hasContentArray(learnContent.criticalChecksExplained) ||
      hasContentArray(learnContent.commonFailures) ||
      hasContentArray(learnContent.practicalExamples) ||
      hasContentArray(learnContent.interfacesAndSequence) ||
      Boolean(learnContent.specialistAuthorityBoundary))
  );

const hasFullActivityContent = (activity: Activity | undefined) =>
  Boolean(
    activity &&
    (Boolean(activity.qualityObjective) ||
      Boolean(activity.applicability) ||
      Boolean(activity.authorityNote) ||
      hasContentArray(activity.requirements) ||
      hasContentArray(activity.planning) ||
      hasContentArray(activity.documentControl) ||
      hasContentArray(activity.materialControl) ||
      hasContentArray(activity.inspection?.before) ||
      hasContentArray(activity.inspection?.during) ||
      hasContentArray(activity.inspection?.after) ||
      hasContentArray(activity.inspection?.testing) ||
      hasContentArray(activity.evidence) ||
      hasContentArray(activity.issues?.commonDeficiencies) ||
      hasContentArray(activity.issues?.escalationTriggers) ||
      hasContentArray(activity.correctiveAction) ||
      hasContentArray(activity.verification) ||
      hasContentArray(activity.closureCriteria) ||
      hasContentArray(activity.reportingAnalysis) ||
      hasContentArray(activity.qualityCheckpoint) ||
      Boolean(activity.specialistBoundary))
  );

export const createActivityService = (registries: CanonicalRegistries) =>
  Object.freeze({
    getActivity: (id: string) => registries.activities.getById(id),
    getActivitiesBySection: (sectionId: string) =>
      registries.activities.getActivitiesBySection(sectionId),
    getQuickView: (activityId: string) =>
      registries.quickViews.getById(activityId),
    getLearnContent: (activityId: string) =>
      registries.learnContent.getById(activityId),
    getAvailableModes: (
      activityId: string
    ): readonly AvailableActivityMode[] => {
      const activity = registries.activities.getById(activityId);
      const quickView = registries.quickViews.getById(activityId);
      const learnContent = registries.learnContent.getById(activityId);
      const modes: AvailableActivityMode[] = [];

      if (hasQuickViewContent(quickView)) modes.push("quick");
      if (hasFullActivityContent(activity)) modes.push("full");
      if (hasLearnContent(learnContent)) modes.push("learn");

      return modes;
    }
  });

export type ActivityService = ReturnType<typeof createActivityService>;
