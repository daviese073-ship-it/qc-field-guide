import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Camera,
  ClipboardCheck,
  Eye,
  Flame,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { ActivityModeTabs } from "@/components/activity/ActivityModeTabs";
import { ContentBlockRenderer } from "@/components/content/ContentBlockRenderer";
import { LocalizedText } from "@/components/content/LocalizedText";
import { Badge } from "@/components/ui/Badge";
import type { ContentBlock, LocalizedContent } from "@/domain/types";
import type { AvailableActivityMode } from "@/services/activity";
import type { CanonicalRouteTarget } from "@/services/navigation";
import type {
  RelationshipNavigationGroup,
  RelationshipNavigationItem
} from "@/services/relationships";
import { buildActivityScreenModel } from "@/services/screenContracts";
import { classNames } from "@/utils/classNames";

import {
  ChecklistItem,
  ChecklistPanel,
  CompactTag,
  FieldLayout,
  LinkPill,
  LocalizedBlock,
  MissingObject,
  Panel,
  RailPanel
} from "../screenShared";
import {
  formatLocalized,
  modeLabels,
  practicalExampleLabels,
  relationshipGroupLabels
} from "../screenLabels";
import { activityVisuals, getSectionVisual } from "../screenVisuals";

const isActivityMode = (value: string | null): value is AvailableActivityMode =>
  value === "quick" || value === "full" || value === "learn";

const fullContentGroups = [
  ["Quality objective", "qualityObjective"],
  ["Applicability", "applicability"],
  ["Authority note", "authorityNote"],
  ["Requirements", "requirements"],
  ["Planning", "planning"],
  ["Document control", "documentControl"],
  ["Material control", "materialControl"],
  ["Before inspection", "inspection.before"],
  ["During inspection", "inspection.during"],
  ["After inspection", "inspection.after"],
  ["Testing", "inspection.testing"],
  ["Evidence", "evidence"],
  ["Common deficiencies", "issues.commonDeficiencies"],
  ["Escalation triggers", "issues.escalationTriggers"],
  ["Corrective action", "correctiveAction"],
  ["Verification", "verification"],
  ["Closure criteria", "closureCriteria"],
  ["Records and outputs", "outputs.records"],
  ["Acceptance evidence", "outputs.acceptanceEvidence"],
  ["Follow-up", "outputs.followUp"],
  ["Reporting analysis", "reportingAnalysis"],
  ["Quality checkpoint", "qualityCheckpoint"]
] as const;

const learnGroups = [
  ["What is this?", "whatIsThis"],
  ["Why it matters", "whyItMatters"],
  ["How to think about it", "criticalChecksExplained"],
  ["How good work looks", "howGoodWorkLooks"],
  ["Common mistakes", "commonFailures"],
  ["Interfaces and sequence", "interfacesAndSequence"]
] as const;

const qcThinkQuestions = [
  "What governs this?",
  "What could be concealed?",
  "Where is the interface risk?",
  "What evidence is required?",
  "What happens next?",
  "What could change this?"
];

export function ActivityPage() {
  const { activityId = "" } = useParams<{ activityId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { preference } = useLanguagePreference();
  const modeParam = searchParams.get("mode");
  const requestedMode = isActivityMode(modeParam) ? modeParam : undefined;
  const model = buildActivityScreenModel(
    productionRegistries,
    activityId,
    requestedMode
  );
  const activity = model.activity;
  const selectedMode = model.selectedMode ?? "quick";
  const section = activity
    ? productionRegistries.sections.getById(activity.sectionId)
    : undefined;
  const workflows = productionRegistries.workflows
    .getAll()
    .filter((workflow) => workflow.activityIds?.includes(activityId));
  const preConcealment = productionRegistries.preConcealmentWorkflows
    .getAll()
    .filter((workflow) => workflow.activityIds?.includes(activityId));
  const conditionLabels = Object.fromEntries(
    productionRegistries.conditions
      .getAll()
      .map((condition) => [
        condition.id,
        formatLocalized(condition.label, preference)
      ])
  );

  if (model.status === "notFound" || !activity) {
    return <MissingObject objectId={activityId} objectLabel="Activity" />;
  }

  const sectionVisual = getSectionVisual(section?.id);
  const activityVisual =
    section?.id === "10" ? activityVisuals.fire : activityVisuals.default;
  const ActivityIcon = section?.id === "10" ? Flame : activityVisual.Icon;
  const interfaceGroup = model.relationshipGroups.find(
    (group) => group.id === "interfaces"
  );

  return (
    <FieldLayout
      rail={
        <>
          <RailPanel title="QC Think">
            <p className="mb-3 text-xs text-slate-500">
              Ask the right questions.
            </p>
            <ul className="space-y-2">
              {qcThinkQuestions.map((question) => (
                <li
                  className="flex items-center justify-between gap-3 text-sm text-slate-800"
                  key={question}
                >
                  <span className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-violet-700" aria-hidden />
                    {question}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden />
                </li>
              ))}
            </ul>
          </RailPanel>
          {workflows.length || preConcealment.length ? (
            <RailPanel title="Related Workflows">
              <div className="space-y-2">
                {workflows.map((workflow) => (
                  <LinkPill
                    key={workflow.id}
                    target={{ objectType: "workflow", id: workflow.id }}
                  >
                    <LocalizedText
                      preference={preference}
                      value={workflow.title}
                    />
                  </LinkPill>
                ))}
                {preConcealment.map((workflow) => (
                  <LinkPill
                    key={workflow.id}
                    target={{ objectType: "preConcealment", id: workflow.id }}
                  >
                    <LocalizedText
                      preference={preference}
                      value={workflow.title}
                    />
                  </LinkPill>
                ))}
              </div>
            </RailPanel>
          ) : null}
          {interfaceGroup?.items.length ? (
            <RailPanel title="Key Interfaces">
              <ul className="space-y-2 text-sm">
                {interfaceGroup.items.slice(0, 8).map((item) => (
                  <li key={item.relationship.id}>
                    <Link
                      className="flex items-center justify-between gap-2 text-blue-700 hover:underline"
                      to={routeToHref(toRelationshipTarget(item))}
                    >
                      <span>
                        <LocalizedText
                          preference={preference}
                          value={item.relatedNode.object.title}
                        />
                      </span>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </RailPanel>
          ) : null}
        </>
      }
    >
      <div className="space-y-5">
        <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold text-slate-500">
            Home › Browse Systems ›{" "}
            {section ? (
              <Link
                className="text-blue-700 hover:underline"
                to={`/section/${encodeURIComponent(section.id)}`}
              >
                {section.id.padStart(2, "0")}{" "}
                <LocalizedText preference={preference} value={section.title} />
              </Link>
            ) : null}
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <span
                className={classNames(
                  "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl",
                  sectionVisual.soft
                )}
              >
                <ActivityIcon
                  className={classNames("h-12 w-12", sectionVisual.accent)}
                  aria-hidden
                />
              </span>
              <div className="min-w-0">
                <h1 className="text-3xl font-bold text-slate-950">
                  <span
                    className="font-mono text-slate-500"
                    data-testid="activity-id"
                  >
                    {activity.id}
                  </span>{" "}
                  <LocalizedText
                    preference={preference}
                    value={activity.title}
                  />
                </h1>
                {activity.qualityObjective ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                    <LocalizedText
                      density="long"
                      preference={preference}
                      value={activity.qualityObjective}
                    />
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {model.flags.map((flag) => (
                    <CompactTag key={flag} tag={flag}>
                      {flag}
                    </CompactTag>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {workflows.slice(0, 1).map((workflow) => (
                <LinkPill
                  key={workflow.id}
                  target={{ objectType: "workflow", id: workflow.id }}
                >
                  Activity Mode
                </LinkPill>
              ))}
              {preConcealment.slice(0, 1).map((workflow) => (
                <LinkPill
                  key={workflow.id}
                  target={{ objectType: "preConcealment", id: workflow.id }}
                >
                  Pre-Concealment
                </LinkPill>
              ))}
            </div>
          </div>
        </header>

        <ActivityModeTabs
          ariaLabel="Activity mode"
          availableModes={model.availableModes}
          currentMode={selectedMode}
          labels={modeLabels}
          onModeChange={(mode) =>
            navigate(
              `/activity/${encodeURIComponent(activity.id)}?mode=${mode}`
            )
          }
        />

        {selectedMode === "quick" ? (
          <QuickViewSection
            activityId={activity.id}
            conditionLabels={conditionLabels}
            preference={preference}
            relationshipGroups={model.relationshipGroups}
          />
        ) : null}
        {selectedMode === "full" ? (
          <FullActivitySection
            activityId={activity.id}
            preference={preference}
          />
        ) : null}
        {selectedMode === "learn" ? (
          <LearnSection activityId={activity.id} preference={preference} />
        ) : null}
      </div>
    </FieldLayout>
  );
}

function QuickViewSection({
  activityId,
  conditionLabels,
  relationshipGroups,
  preference
}: {
  activityId: string;
  conditionLabels: Record<string, string>;
  relationshipGroups: readonly RelationshipNavigationGroup[];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  const quickView = productionRegistries.quickViews.getById(activityId);

  if (!quickView) return null;

  const gateGroup = relationshipGroups.find((group) => group.id === "gates");
  const relatedGroups = relationshipGroups.filter((group) =>
    [
      "before",
      "after",
      "workflows",
      "testing",
      "commissioning",
      "closeout"
    ].includes(group.id)
  );

  return (
    <div className="space-y-4">
      <section
        aria-label="QuickView checklist"
        className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-4"
      >
        <ChecklistPanel
          accentClass="bg-amber-100 text-amber-700"
          icon={<ClipboardCheck className="h-4 w-4" aria-hidden />}
          title="Before"
        >
          <ChecklistList blocks={quickView.before} preference={preference} />
        </ChecklistPanel>
        <ChecklistPanel
          accentClass="bg-emerald-100 text-emerald-700"
          icon={<Eye className="h-4 w-4" aria-hidden />}
          title="Inspect"
        >
          <ChecklistList blocks={quickView.inspect} preference={preference} />
        </ChecklistPanel>
        <ChecklistPanel
          accentClass="bg-blue-100 text-blue-700"
          icon={<Camera className="h-4 w-4" aria-hidden />}
          title="Evidence"
        >
          <ChecklistList blocks={quickView.evidence} preference={preference} />
        </ChecklistPanel>
        <ChecklistPanel
          accentClass="bg-red-100 text-red-700"
          icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
          title="Watch for"
        >
          <ChecklistList
            blocks={quickView.watchFor}
            preference={preference}
            warning
          />
        </ChecklistPanel>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Panel className="border-red-200 bg-red-50/60">
          <div className="flex gap-3">
            <AlertTriangle
              className="h-6 w-6 shrink-0 text-red-700"
              aria-hidden
            />
            <div>
              <h2 className="text-sm font-bold uppercase text-slate-900">
                Do Not Miss
              </h2>
              <ChecklistList
                blocks={quickView.dontMiss}
                preference={preference}
                warning
              />
            </div>
          </div>
        </Panel>
        {quickView.specialistAlert ? (
          <Panel className="border-violet-200 bg-violet-50/60">
            <div className="flex gap-3">
              <ShieldCheck
                className="h-6 w-6 shrink-0 text-violet-700"
                aria-hidden
              />
              <div>
                <h2 className="text-sm font-bold uppercase text-slate-900">
                  Specialist Notice
                </h2>
                <LocalizedBlock
                  preference={preference}
                  value={quickView.specialistAlert}
                />
              </div>
            </div>
          </Panel>
        ) : null}
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <Panel title="Next / Related Work">
          <RelationshipLinks groups={relatedGroups} preference={preference} />
        </Panel>
        {gateGroup?.items.length ? (
          <Panel title="Gate">
            <RelationshipLinks
              conditionLabels={conditionLabels}
              groups={[gateGroup]}
              preference={preference}
            />
          </Panel>
        ) : null}
        {quickView.invalidationAlert ? (
          <Panel title="Invalidation">
            <div className="flex gap-3">
              <RefreshCw
                className="h-5 w-5 shrink-0 text-blue-700"
                aria-hidden
              />
              <LocalizedBlock
                preference={preference}
                value={quickView.invalidationAlert}
              />
            </div>
          </Panel>
        ) : null}
      </section>
    </div>
  );
}

function ChecklistList({
  blocks,
  preference,
  warning = false
}: {
  blocks?: readonly ContentBlock[];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  warning?: boolean;
}) {
  const items = blocksToChecklistItems(blocks, preference).slice(0, 9);

  if (!items.length) return null;

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <ChecklistItem key={`${item}-${index}`} warning={warning}>
          {item}
        </ChecklistItem>
      ))}
    </ul>
  );
}

function RelationshipLinks({
  conditionLabels = {},
  groups,
  preference
}: {
  conditionLabels?: Record<string, string>;
  groups: readonly RelationshipNavigationGroup[];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  const items = groups.flatMap((group) =>
    group.items.map((item) => ({ groupId: group.id, item }))
  );

  if (!items.length)
    return <p className="text-sm text-slate-600">No linked work.</p>;

  return (
    <ul className="space-y-2 text-sm">
      {items.slice(0, 8).map(({ groupId, item }) => (
        <li
          className="flex flex-wrap items-center gap-2"
          key={item.relationship.id}
        >
          <Badge>{relationshipGroupLabels[groupId]}</Badge>
          <Link
            className="font-semibold text-blue-700 hover:underline"
            to={routeToHref(toRelationshipTarget(item))}
          >
            <LocalizedText
              preference={preference}
              value={item.relatedNode.object.title}
            />
          </Link>
          {item.conditionId && conditionLabels[item.conditionId] ? (
            <Badge tone="caution">{conditionLabels[item.conditionId]}</Badge>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function FullActivitySection({
  activityId,
  preference
}: {
  activityId: string;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  const activity = productionRegistries.activities.getById(activityId);

  if (!activity) return null;

  return (
    <section aria-label="Full activity content" className="space-y-2">
      {fullContentGroups.map(([title, path], index) => {
        const value = getActivityPath(activity, path);

        if (!value) return null;

        return (
          <details
            className="rounded-xl border border-slate-200 bg-white shadow-sm open:shadow-md"
            key={path}
            open={index < 2}
          >
            <summary className="cursor-pointer px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-800">
              {title}
            </summary>
            <div className="border-t border-slate-100 px-4 py-4 text-sm leading-6">
              {isContentBlocks(value) ? (
                <ContentBlockRenderer
                  blocks={value}
                  practicalExampleLabels={practicalExampleLabels}
                  preference={preference}
                />
              ) : (
                <LocalizedBlock preference={preference} value={value} />
              )}
            </div>
          </details>
        );
      })}
    </section>
  );
}

function LearnSection({
  activityId,
  preference
}: {
  activityId: string;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  const learnContent = productionRegistries.learnContent.getById(activityId);

  if (!learnContent) return null;

  return (
    <section aria-label="Learn content" className="space-y-4">
      <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-violet-900">
          Learn the inspection logic
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Use these sections to understand why the Quick checks matter.
        </p>
      </div>
      {learnGroups.map(([title, field], index) => {
        const blocks = learnContent[field];

        if (!blocks?.length) return null;

        return (
          <details
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
            key={field}
            open={index < 2}
          >
            <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-900">
              {title}
            </summary>
            <div className="border-t border-slate-100 px-4 py-4">
              <ContentBlockRenderer
                blocks={blocks}
                practicalExampleLabels={practicalExampleLabels}
                preference={preference}
              />
            </div>
          </details>
        );
      })}
      {learnContent.practicalExamples?.length ? (
        <Panel title="Examples">
          {learnContent.practicalExamples.map((example, index) => (
            <ContentBlockRenderer
              blocks={[{ type: "example", example }]}
              key={example.id ?? index}
              practicalExampleLabels={practicalExampleLabels}
              preference={preference}
            />
          ))}
        </Panel>
      ) : null}
    </section>
  );
}

function blocksToChecklistItems(
  blocks: readonly ContentBlock[] | undefined,
  preference: ReturnType<typeof useLanguagePreference>["preference"]
) {
  if (!blocks) return [];

  return blocks.flatMap((block) => {
    switch (block.type) {
      case "paragraph":
      case "notice":
        return splitChecklistText(formatLocalized(block.item.text, preference));
      case "bulletList":
      case "checkList":
        return block.items.flatMap((item) =>
          splitChecklistText(formatLocalized(item.text, preference))
        );
      case "subheading":
        return [formatLocalized(block.text, preference)];
      default:
        return [];
    }
  });
}

function splitChecklistText(value: string) {
  return value
    .split(/\n|;|\u2022/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toRelationshipTarget(
  item: RelationshipNavigationItem
): CanonicalRouteTarget {
  switch (item.relatedNodeKind) {
    case "activity":
      return { objectType: "activity", id: item.relatedNodeId };
    case "gate":
      return { objectType: "gate", id: item.relatedNodeId };
    case "workflow":
      return { objectType: "workflow", id: item.relatedNodeId };
    case "preConcealmentWorkflow":
      return { objectType: "preConcealment", id: item.relatedNodeId };
  }
}

function routeToHref(target: CanonicalRouteTarget) {
  switch (target.objectType) {
    case "home":
      return "/";
    case "section":
      return `/section/${encodeURIComponent(target.id)}`;
    case "activity":
      return `/activity/${encodeURIComponent(target.id)}`;
    case "workflow":
      return `/workflow/${encodeURIComponent(target.id)}`;
    case "preConcealment":
      return `/preconcealment/${encodeURIComponent(target.id)}`;
    case "gate":
      return `/gate/${encodeURIComponent(target.id)}`;
    case "search":
      return "/search";
    case "term":
      return `/term/${encodeURIComponent(target.id)}`;
  }
}

function getActivityPath(
  activity: NonNullable<
    ReturnType<typeof productionRegistries.activities.getById>
  >,
  path: string
): readonly ContentBlock[] | LocalizedContent | undefined {
  switch (path) {
    case "qualityObjective":
      return activity.qualityObjective;
    case "applicability":
      return activity.applicability;
    case "authorityNote":
      return activity.authorityNote;
    case "requirements":
      return activity.requirements;
    case "planning":
      return activity.planning;
    case "documentControl":
      return activity.documentControl;
    case "materialControl":
      return activity.materialControl;
    case "inspection.before":
      return activity.inspection?.before;
    case "inspection.during":
      return activity.inspection?.during;
    case "inspection.after":
      return activity.inspection?.after;
    case "inspection.testing":
      return activity.inspection?.testing;
    case "evidence":
      return activity.evidence;
    case "issues.commonDeficiencies":
      return activity.issues?.commonDeficiencies;
    case "issues.escalationTriggers":
      return activity.issues?.escalationTriggers;
    case "correctiveAction":
      return activity.correctiveAction;
    case "verification":
      return activity.verification;
    case "closureCriteria":
      return activity.closureCriteria;
    case "outputs.records":
      return activity.outputs?.records;
    case "outputs.acceptanceEvidence":
      return activity.outputs?.acceptanceEvidence;
    case "outputs.followUp":
      return activity.outputs?.followUp;
    case "reportingAnalysis":
      return activity.reportingAnalysis;
    case "qualityCheckpoint":
      return activity.qualityCheckpoint;
    default:
      return undefined;
  }
}

function isContentBlocks(
  value: readonly ContentBlock[] | LocalizedContent
): value is readonly ContentBlock[] {
  return Array.isArray(value);
}
