import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Eye,
  FileText,
  Info,
  Lightbulb,
  Link as LinkIcon,
  ListChecks,
  Route,
  ShieldAlert,
  Sparkles,
  Target,
  Wrench
} from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { ContentBlockRenderer } from "@/components/content/ContentBlockRenderer";
import { LocalizedText } from "@/components/content/LocalizedText";
import type {
  Activity,
  ContentBlock,
  LocalizedContent,
  LocalizedString,
  PreConcealmentWorkflow,
  Section,
  TerminologyConcept,
  Workflow
} from "@/domain/types";
import type { AvailableActivityMode } from "@/services/activity";
import type { CanonicalRouteTarget } from "@/services/navigation";
import { getCanonicalRoute } from "@/services/navigation";
import type { LanguagePreference } from "@/services/localization/languagePreference";
import { createUiStringService } from "@/services/localization/uiStringService";
import type {
  RelationshipNavigationGroup,
  RelationshipNavigationItem
} from "@/services/relationships";
import { buildActivityScreenModel } from "@/services/screenContracts";
import { recordVisit } from "@/services/storage/visitHistory";
import { classNames } from "@/utils/classNames";

import { formatLocalized, practicalExampleLabels } from "../screenLabels";
import { getSectionVisual, getTagClass } from "../screenVisuals";
import { MissingObject } from "../screenShared";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type ContentSource = {
  label: string;
  value: readonly ContentBlock[] | LocalizedContent | undefined;
};
type FullPresentationGroup = {
  id: string;
  title: string;
  badge: string;
  Icon: IconComponent;
  accentClass: string;
  badgeClass: string;
  sources: readonly ContentSource[];
};
type ChecklistVisualTone = "before" | "inspect" | "evidence" | "watch";
type QuickMetadataItem = {
  label: string;
  unavailable?: boolean;
  value: string;
};

const modeOrder: readonly AvailableActivityMode[] = ["quick", "full", "learn"];

const modeIconMap: Record<AvailableActivityMode, IconComponent> = {
  quick: Sparkles,
  full: FileText,
  learn: BookOpen
};

const flagLabels: Readonly<Record<string, string>> = {
  acceptanceGate: "Acceptance Gate",
  highControl: "High Control",
  interfaceCritical: "Interface Critical",
  preConcealment: "Pre-Concealment",
  recheckIfModified: "Recheck If Modified",
  specialist: "Specialist",
  testing: "Testing",
  traceabilityCritical: "Traceability Critical"
};

const fullGroupVisuals = [
  {
    badge: "Why it matters",
    Icon: Target,
    accentClass: "bg-emerald-500 text-white",
    badgeClass: "bg-emerald-50 text-emerald-700"
  },
  {
    badge: "Documents",
    Icon: FileText,
    accentClass: "bg-blue-500 text-white",
    badgeClass: "bg-blue-50 text-blue-700"
  },
  {
    badge: "What is required",
    Icon: ClipboardCheck,
    accentClass: "bg-violet-500 text-white",
    badgeClass: "bg-violet-50 text-violet-700"
  },
  {
    badge: "Prepare before work",
    Icon: ListChecks,
    accentClass: "bg-cyan-500 text-white",
    badgeClass: "bg-cyan-50 text-cyan-700"
  },
  {
    badge: "Build it right",
    Icon: Wrench,
    accentClass: "bg-amber-500 text-white",
    badgeClass: "bg-amber-50 text-amber-700"
  },
  {
    badge: "Verify before cover",
    Icon: Eye,
    accentClass: "bg-blue-500 text-white",
    badgeClass: "bg-blue-50 text-blue-700"
  },
  {
    badge: "Prove it",
    Icon: Camera,
    accentClass: "bg-emerald-500 text-white",
    badgeClass: "bg-emerald-50 text-emerald-700"
  },
  {
    badge: "What goes wrong",
    Icon: AlertTriangle,
    accentClass: "bg-red-500 text-white",
    badgeClass: "bg-red-50 text-red-700"
  },
  {
    badge: "Fix it",
    Icon: Wrench,
    accentClass: "bg-violet-500 text-white",
    badgeClass: "bg-violet-50 text-violet-700"
  },
  {
    badge: "Close the loop",
    Icon: CheckCircle2,
    accentClass: "bg-teal-500 text-white",
    badgeClass: "bg-teal-50 text-teal-700"
  }
] as const;

const isActivityMode = (value: string | null): value is AvailableActivityMode =>
  value === "quick" || value === "full" || value === "learn";

const getUiLabel = (
  id: string,
  fallback: string,
  preference: LanguagePreference
) =>
  createUiStringService(productionRegistries).formatUiString(id, preference) ??
  fallback;

export function ActivityPage() {
  const { activityId = "" } = useParams<{ activityId: string }>();
  const [searchParams] = useSearchParams();
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

  useEffect(() => {
    if (activity?.sectionId) {
      recordVisit("section", activity.sectionId);
    }
  }, [activity?.sectionId]);

  if (model.status === "notFound" || !activity) {
    return <MissingObject objectId={activityId} objectLabel="Activity" />;
  }

  const sectionVisual = getSectionVisual(section?.id);
  const ActivityIcon = sectionVisual.Icon;
  const workflows = productionRegistries.workflows
    .getAll()
    .filter((workflow) => workflow.activityIds?.includes(activity.id));
  const preConcealment = productionRegistries.preConcealmentWorkflows
    .getAll()
    .filter((workflow) => workflow.activityIds?.includes(activity.id));

  return (
    <article
      className={classNames("w-full max-w-[1164px]", sectionVisual.tokenClass)}
      data-testid="activity-interface"
      data-activity-accent={sectionVisual.tokenClass}
    >
      <div className="grid gap-[18px] min-[1100px]:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_260px] min-[1440px]:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0" data-testid="activity-main-column">
          <ActivityBreadcrumb preference={preference} section={section} />

          <ActivityIdentityCard
            ActivityIcon={ActivityIcon}
            activity={activity}
            flags={model.flags}
            preConcealment={preConcealment}
            preference={preference}
            section={section}
            sectionVisual={sectionVisual}
            workflows={workflows}
          />

          <ActivityModeStrip
            activityId={activity.id}
            availableModes={model.availableModes}
            currentMode={selectedMode}
            preference={preference}
          />

          <div
            className="mt-3"
            id={`activity-mode-panel-${selectedMode}`}
            role="tabpanel"
            aria-labelledby={`activity-mode-tab-${selectedMode}`}
            data-testid="activity-mode-panel"
          >
            {selectedMode === "quick" ? (
              <QuickMode
                activity={activity}
                flags={model.flags}
                preference={preference}
                quickView={model.quickView}
              />
            ) : null}
            {selectedMode === "full" ? (
              <FullMode activity={activity} preference={preference} />
            ) : null}
            {selectedMode === "learn" ? (
              <LearnMode
                activity={activity}
                learnContent={model.learnContent}
                preference={preference}
                relationshipGroups={model.relationshipGroups}
              />
            ) : null}
          </div>
        </div>

        <ActivityRelationshipRail
          currentSectionId={activity.sectionId}
          preConcealment={preConcealment}
          preference={preference}
          relationshipGroups={model.relationshipGroups}
          workflows={workflows}
        />
      </div>
    </article>
  );
}

function ActivityBreadcrumb({
  preference,
  section
}: {
  preference: LanguagePreference;
  section?: Section;
}) {
  const backLabel = getUiLabel("UI-NAV-BACK", "Back", preference);
  const homeLabel = getUiLabel("UI-NAV-HOME", "Home", preference);
  const backTarget = section
    ? getCanonicalRoute({ objectType: "section", id: section.id })
    : "/";
  const destinationLabel = section
    ? formatLocalized(section.title, preference)
    : homeLabel;
  const isFrench =
    preference.mode === "fr" ||
    (preference.mode === "bilingual" && preference.bilingualPrimary === "fr");
  const backAriaLabel = isFrench
    ? `${backLabel} à ${destinationLabel}`
    : `${backLabel} to ${destinationLabel}`;

  return (
    <div className="flex items-center gap-3">
      <Link
        aria-label={backAriaLabel}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(15,23,42,0.12)] bg-white text-[#07142e] shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition hover:border-[rgba(15,23,42,0.22)] hover:bg-[#f8fafc] focus-visible:outline-offset-4"
        data-testid="activity-back-button"
        to={backTarget}
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </Link>
      <nav
        aria-label="Activity breadcrumb"
        className="flex min-h-5 items-center gap-1.5 text-[12px] font-semibold leading-5 text-[#52617d]"
        data-testid="activity-breadcrumb"
      >
        <Link className="hover:text-[#075fef] hover:underline" to="/">
          {homeLabel}
        </Link>
        <span aria-hidden>›</span>
        <Link
          className="hover:text-[#075fef] hover:underline"
          to="/#home-inspection-systems"
        >
          Browse Systems
        </Link>
        {section ? (
          <>
            <span aria-hidden>›</span>
            <Link
              className="text-[#075fef] hover:underline"
              to={getCanonicalRoute({ objectType: "section", id: section.id })}
            >
              {section.id.padStart(2, "0")}{" "}
              <LocalizedText preference={preference} value={section.title} />
            </Link>
          </>
        ) : null}
      </nav>
    </div>
  );
}

function ActivityIdentityCard({
  ActivityIcon,
  activity,
  flags,
  preConcealment,
  preference,
  section,
  sectionVisual,
  workflows
}: {
  ActivityIcon: IconComponent;
  activity: Activity;
  flags: readonly string[];
  preConcealment: readonly { id: string; title: LocalizedString }[];
  preference: LanguagePreference;
  section?: Section;
  sectionVisual: ReturnType<typeof getSectionVisual>;
  workflows: readonly { id: string; title: LocalizedString }[];
}) {
  return (
    <header
      className="mt-3 min-h-[134px] rounded-[11px] border border-[rgba(15,23,42,0.11)] bg-white p-3 shadow-[0_3px_9px_rgba(15,23,42,0.04)]"
      data-testid="activity-identity-card"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-3">
          <span
            className={classNames(
              "flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-[17px]",
              sectionVisual.soft
            )}
            data-testid="activity-identity-icon"
          >
            <ActivityIcon
              className={classNames("h-11 w-11", sectionVisual.accent)}
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            {section ? (
              <span
                className={classNames(
                  "inline-flex min-h-[19px] items-center rounded-[5px] px-2 text-[10px] font-bold leading-none",
                  sectionVisual.soft,
                  sectionVisual.accent
                )}
              >
                {section.id.padStart(2, "0")}{" "}
                <LocalizedText preference={preference} value={section.title} />
              </span>
            ) : null}
            <h1
              className="mt-1 text-[25px] font-bold leading-[29px] text-[#07142e]"
              data-testid="activity-title"
            >
              <span data-testid="activity-id">{activity.id}</span>{" "}
              <LocalizedText preference={preference} value={activity.title} />
            </h1>
            {activity.qualityObjective ? (
              <p
                className="mt-1 line-clamp-2 max-w-[560px] text-[13px] font-medium leading-[18px] text-[#52617d]"
                data-testid="activity-summary"
              >
                <LocalizedText
                  density="long"
                  preference={preference}
                  value={activity.qualityObjective}
                />
              </p>
            ) : null}
            <ActivityFlags flags={flags} />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {workflows.slice(0, 1).map((workflow) => (
            <ActivityContextButton
              ariaLabel={`Activity Mode: ${formatLocalized(
                workflow.title,
                preference
              )}`}
              Icon={Route}
              key={workflow.id}
              target={{ objectType: "workflow", id: workflow.id }}
            >
              Activity Mode
            </ActivityContextButton>
          ))}
          {preConcealment.slice(0, 1).map((workflow) => (
            <ActivityContextButton
              ariaLabel={`Pre-Concealment: ${formatLocalized(
                workflow.title,
                preference
              )}`}
              Icon={Eye}
              key={workflow.id}
              target={{ objectType: "preConcealment", id: workflow.id }}
            >
              Pre-Concealment
            </ActivityContextButton>
          ))}
        </div>
      </div>
    </header>
  );
}

function ActivityContextButton({
  ariaLabel,
  children,
  Icon,
  target
}: {
  ariaLabel: string;
  children: ReactNode;
  Icon: IconComponent;
  target: CanonicalRouteTarget;
}) {
  return (
    <Link
      aria-label={ariaLabel}
      className="inline-flex min-h-[34px] items-center gap-2 rounded-[7px] border border-[rgba(15,23,42,0.14)] bg-white px-3 text-[11px] font-semibold leading-none text-[#24365f] shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition hover:border-blue-200 hover:bg-blue-50/40"
      to={getCanonicalRoute(target)}
    >
      <Icon className="h-[15px] w-[15px]" aria-hidden />
      {children}
    </Link>
  );
}

function ActivityFlags({ flags }: { flags: readonly string[] }) {
  const visibleFlags = flags.filter((flag) => flagLabels[flag]).slice(0, 4);

  if (!visibleFlags.length) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-2" data-testid="activity-flags">
      {visibleFlags.map((flag) => (
        <span
          className={classNames(
            "inline-flex min-h-5 items-center rounded-[5px] border px-2 text-[10px] font-semibold leading-none",
            getTagClass(flag)
          )}
          key={flag}
        >
          {flagLabels[flag]}
        </span>
      ))}
    </div>
  );
}

function ActivityModeStrip({
  activityId,
  availableModes,
  currentMode,
  preference
}: {
  activityId: string;
  availableModes: readonly AvailableActivityMode[];
  currentMode: AvailableActivityMode;
  preference: LanguagePreference;
}) {
  const labels: Record<AvailableActivityMode, string> = {
    quick: getUiLabel("UI-MODE-QUICK", "Quick", preference),
    full: getUiLabel("UI-MODE-FULL", "Full", preference),
    learn: getUiLabel("UI-MODE-LEARN", "Learn", preference)
  };
  const orderedModes = modeOrder.filter((mode) =>
    availableModes.includes(mode)
  );

  if (orderedModes.length <= 1) return null;

  return (
    <div
      aria-label="Activity mode"
      className="mt-3 flex min-h-[44px] items-end gap-8 border-b border-[rgba(148,163,184,0.28)]"
      role="tablist"
      data-testid="activity-mode-tabs"
    >
      {orderedModes.map((mode) => {
        const Icon = modeIconMap[mode];
        const selected = mode === currentMode;

        return (
          <Link
            aria-controls={`activity-mode-panel-${mode}`}
            aria-selected={selected}
            className={classNames(
              "inline-flex min-h-[42px] items-center gap-2 border-b-2 px-1 text-[12px] font-semibold leading-none transition focus-visible:outline-offset-2",
              selected
                ? "border-[#075fef] text-[#075fef]"
                : "border-transparent text-[#52617d] hover:text-[#075fef]"
            )}
            id={`activity-mode-tab-${mode}`}
            key={mode}
            role="tab"
            to={getCanonicalRoute({
              objectType: "activity",
              id: activityId,
              mode
            })}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {labels[mode]}
          </Link>
        );
      })}
    </div>
  );
}

function QuickMode({
  activity,
  flags,
  preference,
  quickView
}: {
  activity: Activity;
  flags: readonly string[];
  preference: LanguagePreference;
  quickView: ReturnType<typeof buildActivityScreenModel>["quickView"];
}) {
  if (!quickView) return null;

  return (
    <section
      aria-label="QuickView checklist"
      className="rounded-[10px] border border-[rgba(15,23,42,0.11)] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.035)]"
      data-testid="activity-quick-mode"
    >
      <ModeHeader
        subtitle={getUiLabel(
          "UI-ACTIVITY-QUICK-SUBTITLE",
          "Use this at the jobsite to make fast, confident decisions.",
          preference
        )}
        title={getUiLabel(
          "UI-ACTIVITY-QUICK-HEADER",
          "Quick Check — Essentials in the Field",
          preference
        )}
      />

      <div
        className="mt-4 grid items-start gap-3 lg:grid-cols-4"
        data-testid="quick-primary-grid"
      >
        <QuickChecklistCard
          blocks={quickView.before}
          Icon={ClipboardCheck}
          preference={preference}
          title={getUiLabel("UI-QUICK-BEFORE", "Before", preference)}
          tone="before"
        />
        <QuickChecklistCard
          blocks={quickView.inspect}
          Icon={Eye}
          preference={preference}
          title={getUiLabel("UI-QUICK-INSPECT", "Inspect", preference)}
          tone="inspect"
        />
        <QuickChecklistCard
          blocks={quickView.evidence}
          Icon={Camera}
          preference={preference}
          title={getUiLabel("UI-QUICK-EVIDENCE", "Evidence", preference)}
          tone="evidence"
        />
        <QuickChecklistCard
          blocks={quickView.watchFor}
          Icon={AlertTriangle}
          preference={preference}
          title={getUiLabel("UI-QUICK-WATCH-FOR", "Watch For", preference)}
          tone="watch"
        />
      </div>

      <div
        className={classNames(
          "mt-3 grid items-start gap-3 md:grid-cols-[minmax(0,0.59fr)_minmax(0,0.41fr)]"
        )}
      >
        <QuickDontMissPanel
          blocks={quickView.dontMiss}
          preference={preference}
          title={getUiLabel("UI-QUICK-DONT-MISS", "Do Not Miss", preference)}
        />
        <QuickFieldTipPanel
          fieldTip={quickView.fieldTip}
          preference={preference}
        />
      </div>

      <QuickInfoPanel
        activity={activity}
        flags={flags}
        preference={preference}
        quickView={quickView}
      />
    </section>
  );
}

function ModeHeader({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <header>
      <h2 className="text-[15px] font-bold uppercase leading-6 text-[#07142e]">
        {title}
      </h2>
      <p className="mt-1 text-[13px] font-medium leading-5 text-[#52617d]">
        {subtitle}
      </p>
    </header>
  );
}

function QuickChecklistCard({
  blocks,
  Icon,
  preference,
  title,
  tone
}: {
  blocks?: readonly ContentBlock[];
  Icon: IconComponent;
  preference: LanguagePreference;
  title: string;
  tone: ChecklistVisualTone;
}) {
  const items = blocksToChecklistItems(blocks, preference);
  const [expanded, setExpanded] = useState(false);
  const expandable = items.length > 1;
  const visibleItems = expanded ? items : items.slice(0, 1);
  const toneClasses = quickToneClass(tone);

  return (
    <section
      className={classNames(
        "min-h-[116px] rounded-[9px] border bg-white p-3 transition-colors duration-150",
        toneClasses.border,
        toneClasses.hover
      )}
      data-testid="quick-card"
    >
      <h3 className="mb-3 flex items-center justify-between gap-2 text-[13px] font-bold uppercase leading-5 text-[#07142e]">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={classNames(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]",
              toneClasses.soft,
              toneClasses.accent
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          {title}
        </span>
        {expandable ? (
          <TileDisclosureButton
            accentClassName={toneClasses.accent}
            expanded={expanded}
            onToggle={() => setExpanded((current) => !current)}
            preference={preference}
          />
        ) : null}
      </h3>
      {items.length ? (
        <ChecklistTextList items={visibleItems} warning={tone === "watch"} />
      ) : (
        <UnavailableState
          text={getUiLabel(
            "UI-ACTIVITY-QUICK-CARD-UNAVAILABLE",
            "No items are available for this activity.",
            preference
          )}
        />
      )}
    </section>
  );
}

function QuickDontMissPanel({
  blocks,
  preference,
  title
}: {
  blocks?: readonly ContentBlock[];
  preference: LanguagePreference;
  title: string;
}) {
  const items = blocksToChecklistItems(blocks, preference);
  const [expanded, setExpanded] = useState(false);
  const expandable = items.length > 1;
  const visibleItems = expanded ? items : items.slice(0, 1);

  return (
    <section
      className="min-h-[92px] rounded-[9px] border border-red-200 bg-red-50/55 p-3 transition-colors duration-150 hover:border-red-300 hover:bg-red-50"
      data-testid="quick-do-not-miss"
    >
      <h3 className="mb-3 flex items-center justify-between gap-2 text-[13px] font-bold uppercase leading-5 text-[#07142e]">
        <span className="flex min-w-0 items-center gap-2">
          <AlertTriangle
            className="h-4 w-4 shrink-0 text-red-600"
            aria-hidden
          />
          {title}
        </span>
        {expandable ? (
          <TileDisclosureButton
            accentClassName="text-red-600"
            expanded={expanded}
            onToggle={() => setExpanded((current) => !current)}
            preference={preference}
          />
        ) : null}
      </h3>
      {items.length ? (
        <ChecklistTextList columns={expanded} items={visibleItems} warning />
      ) : (
        <UnavailableState
          text={getUiLabel(
            "UI-ACTIVITY-DONT-MISS-UNAVAILABLE",
            "No do-not-miss items are available for this activity.",
            preference
          )}
        />
      )}
    </section>
  );
}

function QuickFieldTipPanel({
  fieldTip,
  preference
}: {
  fieldTip?: LocalizedContent;
  preference: LanguagePreference;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = fieldTip ? formatLocalized(fieldTip, preference) : "";
  const sentenceParts = splitFirstSentence(text);
  const expandable = Boolean(sentenceParts.remaining);

  return (
    <section
      className="min-h-[92px] rounded-[9px] border border-emerald-200 bg-emerald-50/55 p-3 transition-colors duration-150 hover:border-emerald-300 hover:bg-emerald-50"
      data-testid="quick-field-tip"
    >
      <h3 className="mb-3 flex items-center justify-between gap-2 text-[13px] font-bold uppercase leading-5 text-[#07142e]">
        <span className="flex min-w-0 items-center gap-2">
          <Lightbulb
            className="h-4 w-4 shrink-0 text-emerald-600"
            aria-hidden
          />
          {getUiLabel("UI-ACTIVITY-FIELD-TIP", "Field Tip", preference)}
        </span>
        {expandable ? (
          <TileDisclosureButton
            accentClassName="text-emerald-600"
            expanded={expanded}
            onToggle={() => setExpanded((current) => !current)}
            preference={preference}
          />
        ) : null}
      </h3>
      <p className="text-[13px] font-medium leading-5 text-[#52617d]">
        {fieldTip ? (
          <>
            {sentenceParts.first}
            {expanded && sentenceParts.remaining ? (
              <span className="mt-1 block">{sentenceParts.remaining}</span>
            ) : null}
          </>
        ) : (
          getUiLabel(
            "UI-ACTIVITY-FIELD-TIP-UNAVAILABLE",
            "Information not available for this activity.",
            preference
          )
        )}
      </p>
    </section>
  );
}

function QuickInfoPanel({
  activity,
  flags,
  preference,
  quickView
}: {
  activity: Activity;
  flags: readonly string[];
  preference: LanguagePreference;
  quickView: NonNullable<
    ReturnType<typeof buildActivityScreenModel>["quickView"]
  >;
}) {
  const metadata = getQuickMetadata(activity, flags, quickView, preference);
  const objective = activity.qualityObjective
    ? formatLocalized(activity.qualityObjective, preference)
    : "";
  const [expanded, setExpanded] = useState(false);
  const objectiveParts = splitFirstSentence(objective);
  const expandable = Boolean(objectiveParts.remaining);

  return (
    <section
      className="mt-4 grid min-h-[96px] gap-4 rounded-[9px] border border-[rgba(15,23,42,0.1)] bg-white p-4 md:grid-cols-[minmax(0,1fr)_300px]"
      data-testid="quick-info-panel"
    >
      <div className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#075fef]" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-bold uppercase leading-5 text-[#07142e]">
              {getUiLabel(
                "UI-ACTIVITY-COVERS",
                "What This Activity Covers",
                preference
              )}
            </h3>
            {expandable ? (
              <TileDisclosureButton
                accentClassName="text-[#075fef]"
                expanded={expanded}
                onToggle={() => setExpanded((current) => !current)}
                preference={preference}
              />
            ) : null}
          </div>
          {activity.qualityObjective ? (
            <p className="mt-2 text-[13px] font-medium leading-5 text-[#52617d]">
              {objectiveParts.first}
              {expanded && objectiveParts.remaining ? (
                <span className="mt-1 block">{objectiveParts.remaining}</span>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-3 border-t border-[rgba(148,163,184,0.24)] pt-3 text-[12px] md:border-l md:border-t-0 md:pl-4 md:pt-0">
        {metadata.map((item) => (
          <QuickMeta
            key={item.label}
            label={item.label}
            unavailable={item.unavailable}
            value={item.value}
          />
        ))}
      </dl>
    </section>
  );
}

function QuickMeta({
  label,
  unavailable = false,
  value
}: {
  label: string;
  unavailable?: boolean;
  value: string;
}) {
  return (
    <div>
      <dt className="font-bold uppercase leading-4 text-[#64748b]">{label}</dt>
      <dd
        className={classNames(
          "mt-1 font-semibold leading-4",
          unavailable ? "text-[#94a3b8]" : "text-[#24365f]"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ChecklistTextList({
  columns = false,
  items,
  warning = false
}: {
  columns?: boolean;
  items: readonly string[];
  warning?: boolean;
}) {
  return (
    <ul
      className={classNames(
        "grid gap-x-4 gap-y-2",
        columns ? "sm:grid-cols-2" : ""
      )}
    >
      {items.map((item, index) => (
        <li
          className="flex min-w-0 gap-2 text-[13px] font-medium leading-5 text-[#24365f]"
          key={`${item}-${index}`}
        >
          <span
            className={classNames(
              "mt-1 h-3.5 w-3.5 shrink-0 rounded-[3px] border bg-white",
              warning ? "border-red-300" : "border-[#cbd5e1]"
            )}
            aria-hidden
          />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function UnavailableState({ text }: { text: string }) {
  return (
    <p
      className="flex min-h-[48px] items-center text-[13px] font-medium leading-5 text-[#64748b]"
      data-testid="quick-unavailable-state"
    >
      {text}
    </p>
  );
}

function CompactTextItems({ items }: { items: readonly string[] }) {
  if (items.length === 1) {
    return (
      <p className="text-[13px] font-medium leading-5 text-[#24365f]">
        {items[0]}
      </p>
    );
  }

  return (
    <ul className="space-y-2 text-[13px] font-medium leading-5 text-[#24365f]">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          {items.length > 1 ? <span aria-hidden>• </span> : null}
          {item}
        </li>
      ))}
    </ul>
  );
}

function FullMode({
  activity,
  preference
}: {
  activity: Activity;
  preference: LanguagePreference;
}) {
  const groups = getFullPresentationGroups(activity, preference);

  return (
    <section
      aria-label="Full activity content"
      className="rounded-[10px] border border-[rgba(15,23,42,0.11)] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.035)]"
      data-testid="activity-full-mode"
    >
      {groups.map((group, index) => (
        <FullGroupRow
          group={group}
          index={index}
          key={group.id}
          preference={preference}
        />
      ))}
    </section>
  );
}

function FullGroupRow({
  group,
  index,
  preference
}: {
  group: FullPresentationGroup;
  index: number;
  preference: LanguagePreference;
}) {
  const preview = getGroupPreview(group, preference);
  const Icon = group.Icon;
  const availableSources = group.sources.filter((source) =>
    hasSource(source.value)
  );

  return (
    <details
      className="group border-b border-[rgba(148,163,184,0.24)] last:border-b-0"
      data-testid="full-group-row"
    >
      <summary className="grid min-h-[64px] cursor-pointer list-none grid-cols-[24px_minmax(145px,0.72fr)_minmax(160px,1fr)_132px_18px] items-center gap-3 px-4 py-3 text-[#07142e] transition hover:bg-[#f8fbff] [&::-webkit-details-marker]:hidden max-lg:grid-cols-[24px_minmax(0,1fr)_18px]">
        <span
          className={classNames(
            "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
            group.accentClass
          )}
          data-testid="full-row-number"
        >
          {index + 1}
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-bold leading-5">
            {group.title}
          </span>
        </span>
        <span className="break-words text-[12px] font-medium leading-5 text-[#52617d] max-lg:hidden">
          {preview}
        </span>
        <span
          className={classNames(
            "justify-self-end rounded-[6px] px-2 py-1 text-[10px] font-semibold leading-4 max-lg:hidden",
            group.badgeClass
          )}
          data-testid="full-row-badge"
        >
          {group.badge}
        </span>
        <ChevronDown
          className="h-[15px] w-[15px] justify-self-end text-[#52617d] transition group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-[rgba(148,163,184,0.18)] bg-white px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase text-[#52617d]">
          <Icon className="h-4 w-4" aria-hidden />
          Source-backed content
        </div>
        {availableSources.length ? (
          <div className="space-y-4 text-[13px] leading-6 text-[#24365f]">
            {availableSources.map((source) =>
              source.value ? (
                <div key={source.label}>
                  <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[#07142e]">
                    {source.label}
                  </h3>
                  {isContentBlockArray(source.value) ? (
                    <ContentBlockRenderer
                      blocks={source.value}
                      practicalExampleLabels={practicalExampleLabels}
                      preference={preference}
                    />
                  ) : (
                    <p className="text-[13px] leading-6 text-slate-800">
                      <LocalizedText
                        density="long"
                        preference={preference}
                        value={source.value}
                      />
                    </p>
                  )}
                </div>
              ) : null
            )}
          </div>
        ) : (
          <UnavailableState text={getUnavailableText(preference)} />
        )}
      </div>
    </details>
  );
}

function LearnMode({
  activity,
  learnContent,
  preference,
  relationshipGroups
}: {
  activity: Activity;
  learnContent: ReturnType<typeof buildActivityScreenModel>["learnContent"];
  preference: LanguagePreference;
  relationshipGroups: readonly RelationshipNavigationGroup[];
}) {
  if (!learnContent) return null;

  const terminology = [
    ...(learnContent.terminologyRefs ?? []),
    ...(activity.terminologyRefs ?? [])
  ]
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .map((id) => productionRegistries.terminology.getById(id))
    .filter((term): term is TerminologyConcept => Boolean(term));
  const interfaces =
    relationshipGroups.find((group) => group.id === "interfaces")?.items ?? [];
  const sequenceItems = blocksToChecklistItems(
    learnContent.interfacesAndSequence,
    preference
  );

  return (
    <section
      aria-label="Learn content"
      className="rounded-[10px] border border-[rgba(15,23,42,0.11)] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.035)]"
      data-testid="activity-learn-mode"
    >
      <ModeHeader
        subtitle={getUiLabel(
          "UI-ACTIVITY-LEARN-SUBTITLE",
          "Essential knowledge to make informed quality decisions in the field.",
          preference
        )}
        title={getUiLabel(
          "UI-ACTIVITY-LEARN-HEADER",
          "Learn & Understand",
          preference
        )}
      />

      <div className="mt-4 grid items-start gap-3 lg:grid-cols-3">
        <LearnCard
          blocks={learnContent.whatIsThis}
          Icon={Target}
          preference={preference}
          title={`What is ${formatLocalized(activity.title, preference)}?`}
          tone="blue"
        />
        <LearnCard
          blocks={learnContent.whyItMatters}
          Icon={CheckCircle2}
          preference={preference}
          title={getUiLabel("UI-LEARN-WHY", "Why It Matters", preference)}
          tone="green"
        />
        <LearnCard
          blocks={[
            ...(learnContent.howGoodWorkLooks ?? []),
            ...(learnContent.criticalChecksExplained ?? [])
          ]}
          Icon={ShieldCheckIcon}
          preference={preference}
          title={getUiLabel(
            "UI-ACTIVITY-KEY-PRINCIPLES",
            "Key Principles",
            preference
          )}
          tone="purple"
        />
      </div>

      <LearnSequencePanel items={sequenceItems} preference={preference} />

      <div className="mt-3 grid items-start gap-3 lg:grid-cols-3">
        <LearnRelationshipCard
          interfaces={interfaces}
          preference={preference}
          title={getUiLabel(
            "UI-ACTIVITY-COMMON-INTERFACES",
            "Common Interfaces",
            preference
          )}
        />
        <LearnCard
          blocks={activity.materialControl}
          Icon={ClipboardCheck}
          preference={preference}
          title={getUiLabel(
            "UI-ACTIVITY-TYPICAL-MATERIALS",
            "Typical Materials",
            preference
          )}
          tone="green"
          variant="compact"
        />
        <TermsCard preference={preference} terminology={terminology} />
      </div>
    </section>
  );
}

function LearnCard({
  blocks,
  Icon,
  preference,
  title,
  tone,
  variant = "standard"
}: {
  blocks?: readonly ContentBlock[];
  Icon: IconComponent;
  preference: LanguagePreference;
  title: string;
  tone: "blue" | "green" | "purple";
  variant?: "standard" | "compact";
}) {
  const items = blocksToChecklistItems(blocks, preference);
  const [expanded, setExpanded] = useState(false);
  const expandable = items.length > 1;
  const visibleItems = expanded ? items : items.slice(0, 1);

  return (
    <section
      className={classNames(
        "rounded-[9px] border border-[rgba(15,23,42,0.11)] bg-white p-3",
        variant === "compact" ? "min-h-[120px]" : "min-h-[164px]"
      )}
      data-testid="learn-card"
    >
      <h3 className="mb-3 flex items-center justify-between gap-2 text-[13px] font-bold leading-5 text-[#07142e]">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={classNames(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
              tone === "blue"
                ? "bg-blue-50 text-blue-600"
                : tone === "green"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-violet-50 text-violet-600"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          {title}
        </span>
        {expandable ? (
          <TileDisclosureButton
            accentClassName={
              tone === "blue"
                ? "text-blue-600"
                : tone === "green"
                  ? "text-emerald-600"
                  : "text-violet-600"
            }
            expanded={expanded}
            onToggle={() => setExpanded((current) => !current)}
            preference={preference}
          />
        ) : null}
      </h3>
      {items.length ? (
        <CompactTextItems items={visibleItems} />
      ) : (
        <UnavailableState text={getUnavailableText(preference)} />
      )}
    </section>
  );
}

function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return <ShieldAlert {...props} />;
}

function LearnSequencePanel({
  items,
  preference
}: {
  items: readonly string[];
  preference: LanguagePreference;
}) {
  return (
    <section
      className="mt-3 min-h-[120px] rounded-[9px] border border-[rgba(15,23,42,0.1)] bg-white p-3"
      data-testid="learn-sequence"
    >
      <h3 className="mb-2 text-[13px] font-bold leading-5 text-[#07142e]">
        {getUiLabel(
          "UI-ACTIVITY-HOW-IT-WORKS",
          "How it works (at a glance)",
          preference
        )}
      </h3>
      {items.length ? (
        <ol className="grid grid-cols-2 items-stretch gap-2 md:grid-cols-3 xl:grid-cols-6">
          {items.slice(0, 6).map((item, index) => (
            <li
              className="flex min-w-0 items-center gap-2"
              data-testid="learn-sequence-step"
              key={`${item}-${index}`}
            >
              <div className="flex min-h-[76px] min-w-0 flex-1 flex-col items-center justify-center rounded-[9px] bg-slate-50 px-2.5 py-2 text-center">
                <span className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Route className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="text-[11px] font-bold leading-4 text-[#07142e]">
                  {item}
                </span>
              </div>
              {index < Math.min(items.length, 6) - 1 ? (
                <ArrowRight
                  className="hidden h-3.5 w-3.5 shrink-0 text-[#64748b] xl:block"
                  aria-hidden
                />
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex min-h-[66px] items-center justify-center">
          <UnavailableState text={getUnavailableText(preference)} />
        </div>
      )}
    </section>
  );
}

function LearnRelationshipCard({
  interfaces,
  preference,
  title
}: {
  interfaces: readonly RelationshipNavigationItem[];
  preference: LanguagePreference;
  title: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const expandable = interfaces.length > 1;
  const visibleInterfaces = expanded ? interfaces : interfaces.slice(0, 1);

  return (
    <section
      className="min-h-[120px] rounded-[9px] border border-[rgba(15,23,42,0.11)] bg-white p-3"
      data-testid="learn-card"
    >
      <h3 className="mb-3 flex items-center justify-between gap-2 text-[13px] font-bold leading-5 text-[#07142e]">
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <LinkIcon className="h-4 w-4" aria-hidden />
          </span>
          {title}
        </span>
        {expandable ? (
          <TileDisclosureButton
            accentClassName="text-blue-600"
            expanded={expanded}
            onToggle={() => setExpanded((current) => !current)}
            preference={preference}
          />
        ) : null}
      </h3>
      {interfaces.length ? (
        <ul className="space-y-2">
          {visibleInterfaces.map((item) => (
            <li key={item.relationship.id}>
              <Link
                className="flex items-center justify-between gap-3 text-[12.5px] font-semibold leading-5 text-[#075fef] hover:underline"
                to={getCanonicalRoute(toRelationshipTarget(item))}
              >
                <span className="min-w-0 break-words">
                  <LocalizedText
                    preference={preference}
                    value={item.relatedNode.object.title}
                  />
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <UnavailableState text={getUnavailableText(preference)} />
      )}
    </section>
  );
}

function TermsCard({
  preference,
  terminology
}: {
  preference: LanguagePreference;
  terminology: readonly TerminologyConcept[];
}) {
  const [expanded, setExpanded] = useState(false);
  const expandable = terminology.length > 1;
  const visibleTerms = expanded ? terminology : terminology.slice(0, 1);

  return (
    <section
      className="min-h-[120px] rounded-[9px] border border-[rgba(15,23,42,0.11)] bg-white p-3"
      data-testid="learn-card"
    >
      <h3 className="mb-3 flex items-center justify-between gap-2 text-[13px] font-bold leading-5 text-[#07142e]">
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <BookOpen className="h-4 w-4" aria-hidden />
          </span>
          {getUiLabel("UI-ACTIVITY-TERMS-TO-KNOW", "Terms to Know", preference)}
        </span>
        {expandable ? (
          <TileDisclosureButton
            accentClassName="text-violet-600"
            expanded={expanded}
            onToggle={() => setExpanded((current) => !current)}
            preference={preference}
          />
        ) : null}
      </h3>
      {terminology.length ? (
        <ul className="space-y-2">
          {visibleTerms.map((term) => (
            <li className="text-[12.5px] leading-5" key={term.id}>
              <Link
                className="font-bold text-[#075fef] hover:underline"
                to={getCanonicalRoute({ objectType: "term", id: term.id })}
              >
                <LocalizedText preference={preference} value={term.preferred} />
              </Link>
              {term.definition ? (
                <p className="mt-1 text-[#52617d]">
                  <LocalizedText
                    density="long"
                    preference={preference}
                    value={term.definition}
                  />
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <UnavailableState text={getUnavailableText(preference)} />
      )}
    </section>
  );
}

function ActivityRelationshipRail({
  currentSectionId,
  preConcealment,
  preference,
  relationshipGroups,
  workflows
}: {
  currentSectionId: string;
  preConcealment: readonly PreConcealmentWorkflow[];
  preference: LanguagePreference;
  relationshipGroups: readonly RelationshipNavigationGroup[];
  workflows: readonly Workflow[];
}) {
  const before =
    relationshipGroups.find((group) => group.id === "before")?.items ?? [];
  const after =
    relationshipGroups.find((group) => group.id === "after")?.items ?? [];
  const relatedSystems = getRelatedSystems(
    relationshipGroups,
    currentSectionId
  );
  const relatedInspections = getRelatedInspections(relationshipGroups);
  const directDestinations = [
    ...workflows.map((workflow) => ({
      id: workflow.id,
      title: workflow.title,
      target: {
        objectType: "workflow",
        id: workflow.id
      } as CanonicalRouteTarget
    })),
    ...preConcealment.map((workflow) => ({
      id: workflow.id,
      title: workflow.title,
      target: {
        objectType: "preConcealment",
        id: workflow.id
      } as CanonicalRouteTarget
    }))
  ];

  return (
    <aside
      className="space-y-3 min-[1100px]:sticky min-[1100px]:top-[92px] min-[1100px]:self-start"
      data-testid="activity-relationship-rail"
    >
      <RailCard
        title={getUiLabel(
          "UI-ACTIVITY-NEXT-RELATED-WORK",
          "Next / Related Work",
          preference
        )}
      >
        <RailRelationshipCategory
          badgeClass="bg-amber-100 text-amber-700"
          items={before}
          label={getUiLabel("UI-NAV-BEFORE", "Before", preference)}
          preference={preference}
        />
        <RailRelationshipCategory
          badgeClass="bg-emerald-100 text-emerald-700"
          items={after}
          label={getUiLabel("UI-NAV-AFTER", "After", preference)}
          preference={preference}
        />
      </RailCard>

      <RailCard
        title={getUiLabel(
          "UI-ACTIVITY-RELATED-SYSTEMS",
          "Related Systems",
          preference
        )}
      >
        {relatedSystems.length ? (
          <ul className="divide-y divide-[rgba(148,163,184,0.22)]">
            {relatedSystems.map((section) => (
              <li data-testid="activity-rail-row" key={section.id}>
                <Link
                  className="flex min-h-[36px] items-center justify-between gap-3 text-[12px] font-medium leading-4 text-[#24365f] hover:text-[#075fef]"
                  to={getCanonicalRoute({
                    objectType: "section",
                    id: section.id
                  })}
                >
                  <span className="min-w-0 truncate">
                    {section.id.padStart(2, "0")}{" "}
                    <LocalizedText
                      preference={preference}
                      value={section.title}
                    />
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <RailUnavailableState
            text={getUiLabel(
              "UI-ACTIVITY-NO-RELATED-SYSTEMS",
              "No related systems are defined.",
              preference
            )}
          />
        )}
      </RailCard>

      <RailCard
        title={getUiLabel(
          "UI-ACTIVITY-RELATED-INSPECTIONS",
          "Related Inspections",
          preference
        )}
      >
        {directDestinations.length || relatedInspections.length ? (
          <ul className="divide-y divide-[rgba(148,163,184,0.22)]">
            {directDestinations.map((item) => (
              <RailDirectDestinationRow
                item={item}
                key={item.id}
                preference={preference}
              />
            ))}
            {relatedInspections.map((item) => (
              <RailRelationshipRow
                item={item}
                key={`${item.relationship.id}-${item.relatedNodeId}`}
                preference={preference}
              />
            ))}
          </ul>
        ) : (
          <RailUnavailableState
            text={getUiLabel(
              "UI-ACTIVITY-NO-RELATED-INSPECTIONS",
              "No related inspections are defined.",
              preference
            )}
          />
        )}
        <button
          aria-disabled="true"
          className="mt-2 flex min-h-[36px] w-full cursor-not-allowed items-center justify-between rounded-[7px] border border-[rgba(15,23,42,0.1)] bg-slate-50 px-3 text-[11px] font-semibold leading-none text-[#94a3b8]"
          data-testid="activity-view-all-unavailable"
          disabled
          type="button"
        >
          {getUiLabel(
            "UI-ACTIVITY-VIEW-ALL-INSPECTIONS",
            "View all inspections",
            preference
          )}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </RailCard>
    </aside>
  );
}

function RailDirectDestinationRow({
  item,
  preference
}: {
  item: {
    id: string;
    title: LocalizedString;
    target: CanonicalRouteTarget;
  };
  preference: LanguagePreference;
}) {
  return (
    <li data-testid="activity-rail-row">
      <Link
        className="flex min-h-[36px] items-center justify-between gap-3 text-[12px] font-medium leading-4 text-[#24365f] hover:text-[#075fef]"
        to={getCanonicalRoute(item.target)}
      >
        <span className="min-w-0 truncate">
          <LocalizedText preference={preference} value={item.title} />
        </span>
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
      </Link>
    </li>
  );
}

function RailCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section
      className="rounded-[10px] border border-[rgba(15,23,42,0.11)] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.035)]"
      data-testid="activity-rail-card"
    >
      <h2 className="mb-2 text-[12px] font-bold uppercase leading-5 text-[#07142e]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function RailRelationshipCategory({
  badgeClass,
  items,
  label,
  preference
}: {
  badgeClass: string;
  items: readonly RelationshipNavigationItem[];
  label: string;
  preference: LanguagePreference;
}) {
  return (
    <div className="mb-2.5 last:mb-0">
      <span
        className={classNames(
          "mb-1 inline-flex min-h-[20px] items-center rounded-[5px] px-2 text-[9px] font-bold uppercase leading-none",
          badgeClass
        )}
      >
        {label}
      </span>
      {items.length ? (
        <ul className="divide-y divide-[rgba(148,163,184,0.22)]">
          {items.slice(0, 5).map((item) => (
            <RailRelationshipRow
              item={item}
              key={`${item.relationship.id}-${item.relatedNodeId}`}
              preference={preference}
            />
          ))}
        </ul>
      ) : (
        <RailUnavailableState
          text={getUiLabel(
            "UI-ACTIVITY-NO-RELATED-WORK",
            "No linked work is defined.",
            preference
          )}
        />
      )}
    </div>
  );
}

function RailUnavailableState({ text }: { text: string }) {
  return (
    <p
      className="flex min-h-[36px] items-center text-[11px] font-medium leading-4 text-[#64748b]"
      data-testid="activity-rail-unavailable"
    >
      {text}
    </p>
  );
}

function RailRelationshipRow({
  item,
  preference
}: {
  item: RelationshipNavigationItem;
  preference: LanguagePreference;
}) {
  return (
    <li data-testid="activity-rail-row">
      <Link
        className="flex min-h-[36px] items-center justify-between gap-3 text-[12px] font-medium leading-4 text-[#24365f] hover:text-[#075fef]"
        to={getCanonicalRoute(toRelationshipTarget(item))}
      >
        <span className="min-w-0 truncate">
          {item.relatedNodeKind === "activity" ? `${item.relatedNodeId} ` : ""}
          <LocalizedText
            preference={preference}
            value={item.relatedNode.object.title}
          />
        </span>
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
      </Link>
    </li>
  );
}

function getFullPresentationGroups(
  activity: Activity,
  preference: LanguagePreference
): readonly FullPresentationGroup[] {
  const groups: readonly Omit<
    FullPresentationGroup,
    "badge" | "Icon" | "accentClass" | "badgeClass"
  >[] = [
    {
      id: "qualityObjective",
      title: getUiLabel(
        "UI-FULL-QUALITY-OBJECTIVE",
        "Quality Objective",
        preference
      ),
      sources: [
        { label: "Quality Objective", value: activity.qualityObjective },
        { label: "Applicability", value: activity.applicability }
      ]
    },
    {
      id: "authority",
      title: getUiLabel(
        "UI-ACTIVITY-FULL-AUTHORITY-REFERENCES",
        "Authority & References",
        preference
      ),
      sources: [
        { label: "Authority Note", value: activity.authorityNote },
        { label: "Document Control", value: activity.documentControl },
        { label: "Communications", value: activity.communications?.before }
      ]
    },
    {
      id: "requirements",
      title: getUiLabel("UI-FULL-REQUIREMENTS", "Requirements", preference),
      sources: [{ label: "Requirements", value: activity.requirements }]
    },
    {
      id: "planning",
      title: getUiLabel(
        "UI-ACTIVITY-FULL-PLANNING-PREPARATION",
        "Planning & Preparation",
        preference
      ),
      sources: [
        { label: "Planning", value: activity.planning },
        { label: "Material Control", value: activity.materialControl },
        { label: "Before Inspection", value: activity.inspection?.before }
      ]
    },
    {
      id: "execution",
      title: getUiLabel("UI-ACTIVITY-FULL-EXECUTION", "Execution", preference),
      sources: [
        { label: "During Inspection", value: activity.inspection?.during },
        {
          label: "During Communications",
          value: activity.communications?.during
        }
      ]
    },
    {
      id: "inspection",
      title: getUiLabel(
        "UI-FULL-INSPECTION-TESTING",
        "Inspection & Hold/Witness Points",
        preference
      ),
      sources: [
        { label: "Testing", value: activity.inspection?.testing },
        { label: "Quality Checkpoint", value: activity.qualityCheckpoint }
      ]
    },
    {
      id: "evidence",
      title: getUiLabel(
        "UI-ACTIVITY-FULL-EVIDENCE-DOCUMENTATION",
        "Evidence & Documentation",
        preference
      ),
      sources: [
        { label: "Evidence", value: activity.evidence },
        { label: "Records", value: activity.outputs?.records },
        {
          label: "Acceptance Evidence",
          value: activity.outputs?.acceptanceEvidence
        },
        { label: "Reporting Analysis", value: activity.reportingAnalysis }
      ]
    },
    {
      id: "issues",
      title: getUiLabel(
        "UI-ACTIVITY-FULL-COMMON-DEFICIENCIES",
        "Common Deficiencies",
        preference
      ),
      sources: [
        {
          label: "Common Deficiencies",
          value: activity.issues?.commonDeficiencies
        },
        {
          label: "Escalation Triggers",
          value: activity.issues?.escalationTriggers
        },
        {
          label: "Issue Escalation Communications",
          value: activity.communications?.issueEscalation
        }
      ]
    },
    {
      id: "correctiveAction",
      title: getUiLabel(
        "UI-FULL-CORRECTIVE-ACTION",
        "Corrective Action",
        preference
      ),
      sources: [
        { label: "Corrective Action", value: activity.correctiveAction },
        { label: "Verification", value: activity.verification }
      ]
    },
    {
      id: "closure",
      title: getUiLabel(
        "UI-ACTIVITY-FULL-ACCEPTANCE-CLOSURE",
        "Acceptance & Closure",
        preference
      ),
      sources: [
        { label: "After Inspection", value: activity.inspection?.after },
        { label: "Closure Criteria", value: activity.closureCriteria },
        { label: "Follow-up", value: activity.outputs?.followUp },
        {
          label: "After Communications",
          value: activity.communications?.after
        },
        {
          label: "Specialist Boundary",
          value: activity.specialistBoundary?.text
        }
      ]
    }
  ];

  return groups.map((group, index) => ({
    ...group,
    ...fullGroupVisuals[index]
  }));
}

function getGroupPreview(
  group: FullPresentationGroup,
  preference: LanguagePreference
) {
  for (const source of group.sources) {
    const preview = source.value
      ? getContentPreview(source.value, preference)
      : undefined;

    if (preview) return preview;
  }

  return getUnavailableText(preference);
}

function getUnavailableText(preference: LanguagePreference) {
  return getUiLabel(
    "UI-ACTIVITY-INFORMATION-UNAVAILABLE",
    "Information not available for this activity.",
    preference
  );
}

function TileDisclosureButton({
  accentClassName,
  expanded,
  onToggle,
  preference
}: {
  accentClassName: string;
  expanded: boolean;
  onToggle: () => void;
  preference: LanguagePreference;
}) {
  return (
    <button
      aria-expanded={expanded}
      aria-label={getDisclosureLabel(preference, expanded)}
      className={classNames(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition duration-150 hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        accentClassName
      )}
      onClick={onToggle}
      type="button"
    >
      <ChevronDown
        className={classNames(
          "h-4 w-4 transition-transform duration-150",
          expanded ? "rotate-180" : null
        )}
        aria-hidden
      />
    </button>
  );
}

function getDisclosureLabel(preference: LanguagePreference, expanded: boolean) {
  const french =
    preference.mode === "fr" ||
    (preference.mode === "bilingual" && preference.bilingualPrimary === "fr");

  if (french) return expanded ? "Masquer les détails" : "Afficher les détails";

  return expanded ? "Hide details" : "Show details";
}

function splitFirstSentence(value: string) {
  const normalized = value.trim();
  if (!normalized) return { first: "", remaining: "" };

  const match = normalized.match(/^([\s\S]*?[.!?])(?:\s+)([\s\S]+)$/);

  if (!match) return { first: normalized, remaining: "" };

  return {
    first: match[1].trim(),
    remaining: match[2].trim()
  };
}

function getContentPreview(
  value: readonly ContentBlock[] | LocalizedContent,
  preference: LanguagePreference
) {
  if (!isContentBlockArray(value)) return formatLocalized(value, preference);

  return blocksToChecklistItems(value, preference)[0];
}

function hasSource(
  value: readonly ContentBlock[] | LocalizedContent | undefined
) {
  if (!value) return false;

  return isContentBlockArray(value) ? value.length > 0 : Boolean(value);
}

function isContentBlockArray(
  value: readonly ContentBlock[] | LocalizedContent
): value is readonly ContentBlock[] {
  return Array.isArray(value);
}

function blocksToChecklistItems(
  blocks: readonly ContentBlock[] | undefined,
  preference: LanguagePreference
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
      case "referenceList":
        return block.references.map((reference) =>
          [reference.document, reference.section, reference.page]
            .filter(Boolean)
            .join(" ")
        );
      case "example":
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

function quickToneClass(tone: ChecklistVisualTone) {
  switch (tone) {
    case "before":
      return {
        soft: "bg-amber-50",
        accent: "text-amber-600",
        border: "border-amber-100",
        hover: "hover:border-amber-300 hover:bg-amber-50/35"
      };
    case "inspect":
      return {
        soft: "bg-emerald-50",
        accent: "text-emerald-600",
        border: "border-emerald-100",
        hover: "hover:border-emerald-300 hover:bg-emerald-50/35"
      };
    case "evidence":
      return {
        soft: "bg-blue-50",
        accent: "text-blue-600",
        border: "border-blue-100",
        hover: "hover:border-blue-300 hover:bg-blue-50/35"
      };
    case "watch":
      return {
        soft: "bg-red-50",
        accent: "text-red-600",
        border: "border-red-100",
        hover: "hover:border-red-300 hover:bg-red-50/35"
      };
  }
}

function getQuickMetadata(
  activity: Activity,
  flags: readonly string[],
  quickView: NonNullable<
    ReturnType<typeof buildActivityScreenModel>["quickView"]
  >,
  preference: LanguagePreference
): readonly QuickMetadataItem[] {
  const unavailable = getUiLabel(
    "UI-ACTIVITY-METADATA-UNAVAILABLE",
    "Not available",
    preference
  );
  const stage =
    getFirstMatchingLabel(
      [...flags, ...activity.nodeTags],
      [
        "preConcealment",
        "testing",
        "commissioning",
        "closeout",
        "acceptanceGate",
        "gate"
      ]
    ) ?? activity.logic?.statusFamily;
  const criticality = getFirstMatchingLabel(flags, [
    "highControl",
    "traceabilityCritical",
    "acceptanceGate"
  ]);
  const qualityImpact =
    getFirstMatchingLabel(flags, ["specialistInterface"]) ??
    (activity.nodeTags.includes("interface") ? "Interface" : undefined) ??
    (quickView.gateNext?.gateIds?.length
      ? `${quickView.gateNext.gateIds.length} gate link${
          quickView.gateNext.gateIds.length === 1 ? "" : "s"
        }`
      : undefined);

  return [
    {
      label: getUiLabel("UI-ACTIVITY-METADATA-STAGE", "Stage", preference),
      unavailable: !stage,
      value: stage ?? unavailable
    },
    {
      label: getUiLabel(
        "UI-ACTIVITY-METADATA-CRITICALITY",
        "Criticality",
        preference
      ),
      unavailable: !criticality,
      value: criticality ?? unavailable
    },
    {
      label: getUiLabel(
        "UI-ACTIVITY-METADATA-QUALITY-IMPACT",
        "Quality Impact",
        preference
      ),
      unavailable: !qualityImpact,
      value: qualityImpact ?? unavailable
    }
  ];
}

function getFirstMatchingLabel(
  values: readonly string[],
  keys: readonly string[]
) {
  const key = keys.find((candidate) => values.includes(candidate));

  return key ? (flagLabels[key] ?? key) : undefined;
}

function getRelatedSystems(
  relationshipGroups: readonly RelationshipNavigationGroup[],
  currentSectionId: string
) {
  const sectionIds = new Set<string>();

  for (const group of relationshipGroups) {
    for (const item of group.items) {
      if (item.relatedNodeKind !== "activity") continue;

      const relatedActivity = productionRegistries.activities.getById(
        item.relatedNodeId
      );

      if (relatedActivity && relatedActivity.sectionId !== currentSectionId) {
        sectionIds.add(relatedActivity.sectionId);
      }
    }
  }

  return productionRegistries.sections
    .getAll()
    .filter((section) => sectionIds.has(section.id))
    .slice(0, 5);
}

function getRelatedInspections(
  relationshipGroups: readonly RelationshipNavigationGroup[]
) {
  const preferredGroups = [
    "interfaces",
    "testing",
    "gates",
    "workflows",
    "commissioning",
    "closeout"
  ];
  const items = relationshipGroups
    .filter((group) => preferredGroups.includes(group.id))
    .flatMap((group) => group.items);
  const seen = new Set<string>();

  return items
    .filter((item) => {
      const key = `${item.relatedNodeKind}:${item.relatedNodeId}`;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
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
