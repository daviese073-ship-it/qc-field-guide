import {
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  Info,
  Lightbulb,
  Link as LinkIcon,
  ListChecks,
  Network,
  ShieldAlert,
  Target,
  UserRoundCheck
} from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { LocalizedText } from "@/components/content/LocalizedText";
import type { LocalizedString, Section, Workflow } from "@/domain/types";
import type { SectionActivitySummary } from "@/services/screenContracts";
import { buildSectionScreenModel } from "@/services/screenContracts";
import { getCanonicalRoute } from "@/services/navigation";
import { createRelationshipService } from "@/services/relationships";
import { recordVisit } from "@/services/storage/visitHistory";
import { classNames } from "@/utils/classNames";

import {
  activityVisuals,
  getSectionVisual,
  getTagClass
} from "../screenVisuals";
import { MissingObject } from "../screenShared";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const sectionEntrySubtitle =
  "Select the activity that matches the work being inspected.";

const qcTip =
  "Scan for the work activity first, then use Quick mode for field execution. Open Full mode only when reference detail is needed.";

const flagLabels: Readonly<Record<string, string>> = {
  acceptanceGate: "acceptanceGate",
  highControl: "High-Control",
  interfaceCritical: "interfaceCritical",
  preConcealment: "preConcealment",
  recheckIfModified: "Recheck if Modified",
  specialist: "Specialist",
  testing: "testing"
};

const activityRowVisuals: Record<
  string,
  { Icon: IconComponent; soft: string; accent: string }
> = {
  acceptanceGate: {
    Icon: CheckCircle2,
    soft: "bg-emerald-50",
    accent: "text-emerald-600"
  },
  highControl: {
    Icon: ShieldAlert,
    soft: "bg-red-50",
    accent: "text-red-600"
  },
  interfaceCritical: {
    Icon: Network,
    soft: "bg-blue-50",
    accent: "text-blue-600"
  },
  preConcealment: {
    Icon: activityVisuals.preConcealment.Icon,
    soft: "bg-amber-50",
    accent: "text-amber-600"
  },
  recheckIfModified: {
    Icon: activityVisuals.workflow.Icon,
    soft: "bg-cyan-50",
    accent: "text-cyan-600"
  },
  specialist: {
    Icon: UserRoundCheck,
    soft: "bg-violet-50",
    accent: "text-violet-600"
  },
  testing: {
    Icon: FlaskConical,
    soft: "bg-slate-100",
    accent: "text-slate-600"
  }
};

const getActivityRowVisual = (activity: SectionActivitySummary) => {
  const preferredFlag = [
    "highControl",
    "interfaceCritical",
    "preConcealment",
    "testing",
    "specialist",
    "recheckIfModified",
    "acceptanceGate"
  ].find((flag) => activity.flags.includes(flag));

  return preferredFlag
    ? activityRowVisuals[preferredFlag]
    : {
        Icon: activityVisuals.default.Icon,
        soft: "bg-emerald-50",
        accent: "text-emerald-600"
      };
};

export function SectionPage() {
  const { sectionId = "" } = useParams<{ sectionId: string }>();
  const { preference } = useLanguagePreference();
  const model = buildSectionScreenModel(productionRegistries, sectionId);
  const section = productionRegistries.sections.getById(sectionId);
  const sections = productionRegistries.sections.getAll();
  const currentIndex = sections.findIndex((item) => item.id === sectionId);
  const nextSection =
    currentIndex >= 0 && currentIndex < sections.length - 1
      ? sections[currentIndex + 1]
      : undefined;

  useEffect(() => {
    if (section?.id) {
      recordVisit("section", section.id);
    }
  }, [section?.id]);

  if (model.status === "notFound" || !section) {
    return <MissingObject objectId={sectionId} objectLabel="Section" />;
  }

  const visual = getSectionVisual(section.id);
  const SectionIcon = visual.Icon;
  const activityIds = new Set(model.activities.map((activity) => activity.id));
  const relationshipService = createRelationshipService(productionRegistries);
  const relatedWorkflows = productionRegistries.workflows
    .getAll()
    .filter((workflow) =>
      (workflow.activityIds ?? []).some((activityId) =>
        activityIds.has(activityId)
      )
    )
    .slice(0, 4);
  const keyInterfaces = model.activities
    .flatMap((activity) =>
      relationshipService
        .getInterfaces(activity.id)
        .filter((item) => item.relatedNodeKind === "activity")
    )
    .filter(
      (item, index, items) =>
        items.findIndex(
          (candidate) => candidate.relatedNodeId === item.relatedNodeId
        ) === index
    )
    .slice(0, 4);

  return (
    <article
      className={classNames("w-full max-w-[1314px]", visual.tokenClass)}
      data-section-accent={visual.tokenClass}
      data-testid="section-entry"
    >
      <div className="grid gap-[22px] xl:grid-cols-[minmax(0,926px)_366px]">
        <div className="min-w-0" data-testid="section-entry-main">
          <nav
            aria-label="System breadcrumb"
            className="flex min-h-5 items-center gap-1.5 text-[13px] font-bold uppercase leading-5 text-[#075fef]"
            data-testid="section-entry-breadcrumb"
          >
            <Link className="hover:underline" to="/">
              Home
            </Link>
            <span aria-hidden>›</span>
            <Link className="hover:underline" to="/#home-inspection-systems">
              Browse Systems
            </Link>
          </nav>

          <header className="mt-6" data-testid="section-entry-identity">
            <div className="flex min-w-0 items-center gap-5">
              <span
                className={classNames(
                  "flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px]",
                  visual.soft
                )}
                data-testid="section-entry-icon-tile"
              >
                <SectionIcon
                  className={classNames("h-11 w-11", visual.accent)}
                  aria-hidden
                />
              </span>
              <h1
                className="min-w-0 text-[40px] font-bold leading-[46px] text-[#07142e]"
                data-testid="section-entry-title"
              >
                <span
                  className={classNames("mr-3", visual.accent)}
                  data-testid="section-entry-number"
                >
                  {section.id.padStart(2, "0")}
                </span>{" "}
                <LocalizedText preference={preference} value={section.title} />
              </h1>
            </div>
            <p className="mt-3 max-w-[860px] text-[16px] font-normal leading-6 text-[#52617d]">
              {section.description ? (
                <LocalizedText
                  preference={preference}
                  value={section.description}
                />
              ) : (
                sectionEntrySubtitle
              )}
            </p>
          </header>

          <ActivitiesPanel
            activities={model.activities}
            preference={preference}
          />

          <BottomSystemNavigation
            nextSection={nextSection}
            preference={preference}
            section={section}
            visual={visual}
          />
        </div>

        <aside
          className="space-y-[18px] xl:pt-[103px]"
          data-testid="section-entry-rail"
        >
          <SectionFocusPanel
            preference={preference}
            sectionDescription={section.description}
            visual={visual}
          />
          <RelatedWorkflowsPanel
            preference={preference}
            workflows={relatedWorkflows}
          />
          <KeyInterfacesPanel
            interfaces={keyInterfaces}
            preference={preference}
          />
          <QcTipPanel />
        </aside>
      </div>
    </article>
  );
}

function ActivitiesPanel({
  activities,
  preference
}: {
  activities: readonly SectionActivitySummary[];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  return (
    <section
      className="mt-[22px] overflow-hidden rounded-[11px] border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
      data-testid="section-activities-panel"
    >
      <div
        className="flex min-h-[76px] items-center justify-between gap-4 border-b border-[rgba(148,163,184,0.24)] px-6"
        data-testid="section-activities-header"
      >
        <h2 className="flex items-center gap-4 text-[16px] font-bold uppercase leading-6 text-[#07142e]">
          <ListChecks className="h-6 w-6 text-[#52617d]" aria-hidden />
          Activities in this system
        </h2>
        <span className="flex items-center gap-2 text-[13px] font-medium leading-5 text-[#52617d]">
          Recommended order
          <Info className="h-5 w-5 text-[#71809a]" aria-hidden />
        </span>
      </div>

      <div className="divide-y divide-[rgba(148,163,184,0.22)]">
        {activities.map((activity) => (
          <ActivityRow
            activity={activity}
            key={activity.id}
            preference={preference}
          />
        ))}
      </div>
    </section>
  );
}

function ActivityRow({
  activity,
  preference
}: {
  activity: SectionActivitySummary;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  const rowVisual = getActivityRowVisual(activity);
  const ActivityIcon = rowVisual.Icon;

  return (
    <Link
      className="grid min-h-[76px] grid-cols-[60px_54px_minmax(0,1fr)_24px] items-center gap-5 px-6 text-[#07142e] transition hover:bg-[#f8fbff] focus-visible:outline-offset-[-3px] max-lg:gap-4"
      data-testid="section-activity-row"
      to={getCanonicalRoute({ objectType: "activity", id: activity.id })}
    >
      <span
        className="flex h-[50px] w-[60px] items-center justify-center rounded-[9px] bg-[#eef2f7] text-[16px] font-bold leading-none text-[#07142e]"
        data-testid="section-activity-id-tile"
      >
        {activity.id}
      </span>
      <span
        className={classNames(
          "flex h-[52px] w-[52px] items-center justify-center rounded-[11px]",
          rowVisual.soft
        )}
        data-testid="section-activity-icon-tile"
      >
        <ActivityIcon
          className={classNames("h-8 w-8", rowVisual.accent)}
          aria-hidden
        />
      </span>
      <span
        className="qcfg-section-activity-title-cell flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2"
        data-testid="section-activity-title-cell"
      >
        <span
          className="qcfg-section-activity-title min-w-0 text-[16px] font-bold leading-5"
          data-testid="section-activity-title"
        >
          <LocalizedText preference={preference} value={activity.title} />
        </span>
        <FlagList flags={activity.flags} />
      </span>
      <ArrowRight
        className="h-[23px] w-[23px] justify-self-end text-[#075fef]"
        data-testid="section-activity-arrow"
        aria-hidden
      />
    </Link>
  );
}

function FlagList({ flags }: { flags: readonly string[] }) {
  const visibleFlags = flags.filter((flag) => flagLabels[flag]).slice(0, 3);

  if (!visibleFlags.length) return <span aria-hidden />;

  return (
    <span className="flex shrink-0 flex-wrap gap-1.5" role="list">
      {visibleFlags.map((flag) => (
        <span
          className={classNames(
            "inline-flex min-h-[26px] items-center rounded-[6px] border px-[10px] text-[12px] font-semibold leading-none",
            getTagClass(flag)
          )}
          key={flag}
          role="listitem"
        >
          {flagLabels[flag]}
        </span>
      ))}
    </span>
  );
}

function RailCard({
  children,
  Icon,
  iconClassName,
  iconTileClassName,
  title,
  tone = "default"
}: {
  children: ReactNode;
  Icon: IconComponent;
  iconClassName: string;
  iconTileClassName: string;
  title: string;
  tone?: "default" | "tip";
}) {
  return (
    <section
      className={classNames(
        "rounded-[11px] border border-[rgba(15,23,42,0.12)] p-[22px] shadow-[0_3px_10px_rgba(15,23,42,0.045)]",
        tone === "tip" ? "border-emerald-200 bg-emerald-50/55" : "bg-white"
      )}
      data-testid={`section-rail-${title.toLowerCase().replaceAll(" ", "-")}`}
    >
      <h2 className="flex items-center gap-3 text-[16px] font-bold uppercase leading-6 text-[#07142e]">
        <span
          className={classNames(
            "flex h-9 w-9 items-center justify-center rounded-[8px]",
            iconTileClassName
          )}
        >
          <Icon className={classNames("h-6 w-6", iconClassName)} aria-hidden />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function SectionFocusPanel({
  preference,
  sectionDescription,
  visual
}: {
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  sectionDescription: LocalizedString | undefined;
  visual: ReturnType<typeof getSectionVisual>;
}) {
  return (
    <RailCard
      Icon={Target}
      iconClassName={visual.accent}
      iconTileClassName={visual.soft}
      title="Section QC Focus"
    >
      <p className="mt-5 text-[15px] font-normal leading-[27px] text-[#24365f]">
        {sectionDescription ? (
          <LocalizedText preference={preference} value={sectionDescription} />
        ) : (
          sectionEntrySubtitle
        )}
      </p>
    </RailCard>
  );
}

function RelatedWorkflowsPanel({
  workflows,
  preference
}: {
  workflows: readonly Workflow[];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  return (
    <RailCard
      Icon={Network}
      iconClassName="text-violet-600"
      iconTileClassName="bg-violet-50"
      title="Related Workflows"
    >
      {workflows.length ? (
        <div className="mt-5 space-y-2">
          {workflows.map((workflow) => (
            <Link
              className="flex min-h-[46px] items-center rounded-[8px] border border-[rgba(15,23,42,0.12)] bg-white px-4 text-[15px] font-semibold leading-5 text-[#24365f] transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-offset-3"
              key={workflow.id}
              to={getCanonicalRoute({
                objectType: "workflow",
                id: workflow.id
              })}
            >
              <LocalizedText preference={preference} value={workflow.title} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-[14px] font-medium leading-6 text-[#52617d]">
          No related workflow is defined for this system.
        </p>
      )}
    </RailCard>
  );
}

function KeyInterfacesPanel({
  interfaces,
  preference
}: {
  interfaces: ReturnType<
    ReturnType<typeof createRelationshipService>["getInterfaces"]
  >;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  return (
    <RailCard
      Icon={LinkIcon}
      iconClassName="text-orange-600"
      iconTileClassName="bg-orange-50"
      title="Key Interfaces"
    >
      {interfaces.length ? (
        <ul className="mt-5 space-y-3">
          {interfaces.map((item) => (
            <li key={`${item.relationship.id}-${item.relatedNodeId}`}>
              <Link
                className="flex items-center justify-between gap-3 text-[15px] font-medium leading-5 text-[#075fef] hover:underline focus-visible:outline-offset-3"
                to={getCanonicalRoute({
                  objectType: "activity",
                  id: item.relatedNodeId
                })}
              >
                <span className="min-w-0 truncate">
                  {item.relatedNodeId}{" "}
                  <LocalizedText
                    preference={preference}
                    value={item.relatedNode.object.title}
                  />
                </span>
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-[14px] font-medium leading-6 text-[#52617d]">
          No interface relationship is defined for this system.
        </p>
      )}
    </RailCard>
  );
}

function QcTipPanel() {
  return (
    <RailCard
      Icon={Lightbulb}
      iconClassName="text-emerald-600"
      iconTileClassName="bg-emerald-100"
      title="QC Tip"
      tone="tip"
    >
      <p className="mt-5 text-[15px] font-normal leading-[27px] text-[#24365f]">
        {qcTip}
      </p>
    </RailCard>
  );
}

function BottomSystemNavigation({
  nextSection,
  preference,
  section,
  visual
}: {
  nextSection: Section | undefined;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  section: Section;
  visual: ReturnType<typeof getSectionVisual>;
}) {
  return (
    <nav
      aria-label="System sequence navigation"
      className="mt-5 flex min-h-[80px] items-center justify-between gap-4 rounded-[10px] border border-[rgba(15,23,42,0.12)] bg-white px-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
      data-testid="section-bottom-nav"
    >
      <p
        className={classNames(
          "flex min-w-0 items-center gap-4 text-[16px] font-bold leading-5",
          visual.accent
        )}
      >
        <span
          className={classNames(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]",
            visual.soft
          )}
          aria-hidden
        >
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          You are in {section.id.padStart(2, "0")}{" "}
          <LocalizedText preference={preference} value={section.title} />
        </span>
      </p>

      {nextSection ? (
        <Link
          className="flex min-h-[50px] w-[184px] shrink-0 items-center justify-center gap-3 rounded-[8px] border border-[rgba(15,23,42,0.14)] bg-white px-4 text-[16px] font-bold leading-5 text-[#07142e] transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-offset-3"
          to={getCanonicalRoute({ objectType: "section", id: nextSection.id })}
        >
          <span className="truncate">
            {nextSection.id}{" "}
            <LocalizedText preference={preference} value={nextSection.title} />
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
