import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Flag,
  FlaskConical,
  GitBranch,
  ShieldCheck,
  Target,
  Wrench
} from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { Link, useParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { LocalizedText } from "@/components/content/LocalizedText";
import type {
  Activity,
  ContentBlock,
  Gate,
  LocalizedContent,
  LocalizedString,
  WorkflowStage
} from "@/domain/types";
import { getCanonicalRoute } from "@/services/navigation";
import { buildWorkflowScreenModel } from "@/services/screenContracts";
import { classNames } from "@/utils/classNames";

import { formatLocalized } from "../screenLabels";
import { activityVisuals } from "../screenVisuals";
import { MissingObject } from "../screenShared";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type StageTone = "prepare" | "verify" | "execute" | "test" | "release";

const unavailableWorkflowText = "Information not available for this workflow.";
const unavailableStageText = "Information not available for this stage.";

const stageToneOrder: readonly StageTone[] = [
  "prepare",
  "verify",
  "execute",
  "test",
  "release"
];

const stageToneClasses: Record<
  StageTone,
  {
    Icon: IconComponent;
    badge: string;
    icon: string;
    number: string;
  }
> = {
  prepare: {
    Icon: GitBranch,
    badge: "bg-blue-50 text-blue-700",
    icon: "text-blue-700",
    number: "bg-blue-600 text-white"
  },
  verify: {
    Icon: ShieldCheck,
    badge: "bg-emerald-50 text-emerald-700",
    icon: "text-emerald-600",
    number: "bg-emerald-600 text-white"
  },
  execute: {
    Icon: Wrench,
    badge: "bg-orange-50 text-orange-700",
    icon: "text-orange-600",
    number: "bg-orange-500 text-white"
  },
  test: {
    Icon: FlaskConical,
    badge: "bg-violet-50 text-violet-700",
    icon: "text-violet-600",
    number: "bg-violet-600 text-white"
  },
  release: {
    Icon: Flag,
    badge: "bg-teal-50 text-teal-700",
    icon: "text-teal-600",
    number: "bg-teal-600 text-white"
  }
};

export function WorkflowPage() {
  const { workflowId = "" } = useParams<{ workflowId: string }>();
  const { preference } = useLanguagePreference();
  const model = buildWorkflowScreenModel(productionRegistries, workflowId);
  const workflow = model.workflow;

  if (model.status === "notFound" || !workflow) {
    return <MissingObject objectId={workflowId} objectLabel="Workflow" />;
  }

  const WorkflowIcon = activityVisuals.workflow.Icon;
  const stages = workflow.stages ?? [];
  const stageRows = stages.length
    ? stages
    : [
        {
          id: `${workflow.id}-activities`,
          title: { en: "Workflow Activities" },
          activityIds: workflow.activityIds,
          gateIds: workflow.gateIds
        }
      ];

  return (
    <article
      className="w-full max-w-[1164px]"
      data-testid="workflow-interface"
    >
      <div className="grid gap-[18px] min-[1100px]:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_260px] min-[1440px]:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0" data-testid="workflow-main-column">
          <WorkflowBreadcrumb
            currentTitle={workflow.title}
            preference={preference}
          />

          <section
            className="mt-4 grid min-h-[118px] gap-4 rounded-[11px] border border-[rgba(15,23,42,0.11)] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] md:grid-cols-[minmax(0,1fr)_300px] md:items-center"
            data-testid="workflow-header-card"
          >
            <div className="flex min-w-0 gap-4">
              <span className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[15px] bg-blue-50 text-blue-700">
                <WorkflowIcon className="h-11 w-11" aria-hidden />
              </span>
              <div className="min-w-0">
                <h1 className="text-[27px] font-bold leading-8 text-[#07142e]">
                  <LocalizedText preference={preference} value={workflow.title} />
                </h1>
                <WorkflowSummary
                  description={workflow.description}
                  preference={preference}
                />
              </div>
            </div>
            <dl className="grid grid-cols-3 divide-x divide-[rgba(148,163,184,0.28)] text-center">
              <WorkflowMetric label="Workflow ID" value={workflow.id} />
              <WorkflowMetric
                label="Activities"
                value={String(model.activities.length)}
              />
              <WorkflowMetric label="Gates" value={String(model.gates.length)} />
            </dl>
          </section>

          <section
            className="mt-5 overflow-hidden rounded-[10px] border border-[rgba(15,23,42,0.11)] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.03)]"
            data-testid="workflow-stage-table"
          >
            <div className="grid min-h-[46px] grid-cols-[72px_minmax(0,1.45fr)_minmax(190px,0.95fr)_138px] items-center border-b border-[rgba(148,163,184,0.22)] px-4 text-[10px] font-bold uppercase leading-none text-[#40506e]">
              <span>Step</span>
              <span>
                Activity{" "}
                <span className="font-medium normal-case text-[#64748b]">
                  (Click to open)
                </span>
              </span>
              <span>QC Focus</span>
              <span>Gate</span>
            </div>
            <div className="relative">
              <span
                className="absolute bottom-8 left-[33px] top-8 w-px bg-slate-200"
                aria-hidden
              />
              {stageRows.map((stage, index) => (
                <WorkflowStageRow
                  index={index}
                  key={stage.id}
                  preference={preference}
                  stage={stage}
                />
              ))}
            </div>
          </section>

          <p className="mt-5 text-center text-[11px] font-semibold text-[#52617d]">
            Part of the QC Field Guide · Built for the field. Backed by
            standards.
          </p>
        </div>

        <WorkflowRail
          activitiesCount={model.activities.length}
          gates={model.gates}
          preference={preference}
          stagesCount={stageRows.length}
          workflow={workflow}
        />
      </div>
    </article>
  );
}

function WorkflowBreadcrumb({
  currentTitle,
  preference
}: {
  currentTitle: LocalizedString;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  return (
    <nav
      aria-label="Workflow breadcrumb"
      className="flex min-h-5 items-center gap-1.5 text-[12px] font-semibold leading-5 text-[#52617d]"
      data-testid="workflow-breadcrumb"
    >
      <Link className="text-[#075fef] hover:underline" to="/">
        Home
      </Link>
      <span aria-hidden>›</span>
      <span>Inspection Workflows</span>
      <span aria-hidden>›</span>
      <span className="text-[#075fef]">
        <LocalizedText preference={preference} value={currentTitle} />
      </span>
    </nav>
  );
}

function WorkflowSummary({
  description,
  preference
}: {
  description?: LocalizedContent;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  return (
    <p
      className="mt-2 max-w-[430px] text-[13px] font-medium leading-5 text-[#24365f]"
      data-testid="workflow-summary"
    >
      {description ? (
        <LocalizedText
          density="long"
          preference={preference}
          value={description}
        />
      ) : (
        unavailableWorkflowText
      )}
    </p>
  );
}

function WorkflowMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3">
      <dt className="text-[10px] font-semibold leading-4 text-[#52617d]">
        {label}
      </dt>
      <dd className="mt-2 text-[15px] font-bold leading-5 text-[#07142e]">
        {value}
      </dd>
    </div>
  );
}

function WorkflowStageRow({
  index,
  preference,
  stage
}: {
  index: number;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  stage: WorkflowStage;
}) {
  const tone = getStageTone(stage, index);
  const visual = stageToneClasses[tone];
  const StageIcon = visual.Icon;
  const activities = (stage.activityIds ?? [])
    .map((id) => productionRegistries.activities.getById(id))
    .filter((activity): activity is Activity => Boolean(activity));
  const gates = (stage.gateIds ?? [])
    .map((id) => productionRegistries.gates.getById(id))
    .filter((gate): gate is Gate => Boolean(gate));

  return (
    <section
      className="relative grid min-h-[136px] grid-cols-[72px_minmax(0,1.45fr)_minmax(190px,0.95fr)_138px] border-b border-[rgba(148,163,184,0.18)] px-4 py-5 last:border-b-0"
      data-testid="workflow-stage-row"
    >
      <div className="relative z-10 flex items-start gap-3">
        <span
          className={classNames(
            "flex h-[30px] w-[30px] items-center justify-center rounded-full text-[12px] font-bold shadow-[0_2px_4px_rgba(15,23,42,0.08)]",
            visual.number
          )}
          data-testid="workflow-stage-number"
        >
          {index + 1}
        </span>
        <StageIcon className={classNames("mt-1 h-5 w-5", visual.icon)} />
      </div>

      <div className="min-w-0 pr-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="text-[16px] font-bold leading-5 text-[#07142e]">
            <LocalizedText preference={preference} value={stage.title} />
          </h2>
          <span
            className={classNames(
              "inline-flex min-h-[21px] items-center rounded-full px-2.5 text-[10px] font-bold leading-none",
              visual.badge
            )}
          >
            {activities.length} {activities.length === 1 ? "activity" : "activities"}
          </span>
        </div>
        <div className="space-y-2">
          {activities.length ? (
            activities.map((activity) => (
              <WorkflowActivityRow
                activity={activity}
                key={activity.id}
                preference={preference}
              />
            ))
          ) : (
            <WorkflowUnavailable text={unavailableStageText} />
          )}
        </div>
      </div>

      <div className="border-x border-[rgba(148,163,184,0.22)] px-4">
        <div className="flex items-start gap-3 text-[12px] font-medium leading-5 text-[#24365f]">
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#40506e]" />
          <span>
            {stage.description ? (
              <LocalizedText
                density="long"
                preference={preference}
                value={stage.description}
              />
            ) : (
              unavailableStageText
            )}
          </span>
        </div>
      </div>

      <div className="pl-4">
        {gates.length ? (
          <div className="space-y-2">
            {gates.map((gate) => (
              <WorkflowGateCard gate={gate} key={gate.id} preference={preference} />
            ))}
          </div>
        ) : (
          <span className="text-[18px] font-semibold leading-8 text-[#64748b]">
            -
          </span>
        )}
      </div>
    </section>
  );
}

function WorkflowActivityRow({
  activity,
  preference
}: {
  activity: Activity;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  return (
    <Link
      className="flex min-h-[36px] items-center justify-between gap-3 rounded-[7px] border border-[rgba(148,163,184,0.28)] bg-white px-3 py-1.5 text-[#07142e] shadow-[0_1px_3px_rgba(15,23,42,0.035)] transition hover:border-blue-200 hover:bg-blue-50/40"
      data-testid="workflow-activity-row"
      to={getCanonicalRoute({ objectType: "activity", id: activity.id })}
    >
      <span className="flex min-w-0 items-start gap-2">
        <span className="shrink-0 rounded bg-slate-50 px-1.5 text-[10px] font-semibold leading-5 text-[#52617d]">
          {activity.id}
        </span>
        <span className="line-clamp-2 text-[12px] font-bold leading-5">
          <LocalizedText preference={preference} value={activity.title} />
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#24365f]" aria-hidden />
    </Link>
  );
}

function WorkflowGateCard({
  gate,
  preference
}: {
  gate: Gate;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  return (
    <Link
      className="block min-h-[82px] rounded-[8px] border border-[rgba(148,163,184,0.28)] bg-white p-3 text-[#07142e] shadow-[0_1px_3px_rgba(15,23,42,0.035)] transition hover:border-emerald-200 hover:bg-emerald-50/30"
      data-testid="workflow-gate-card"
      to={getCanonicalRoute({ objectType: "gate", id: gate.id })}
    >
      <span className="inline-flex min-h-[20px] items-center rounded-full bg-emerald-50 px-2 text-[10px] font-bold leading-none text-emerald-700">
        Gate
      </span>
      <span className="mt-2 block text-[12px] font-semibold leading-5 text-[#24365f]">
        <LocalizedText preference={preference} value={gate.title} />
      </span>
    </Link>
  );
}

function WorkflowRail({
  activitiesCount,
  gates,
  preference,
  stagesCount,
  workflow
}: {
  activitiesCount: number;
  gates: readonly Gate[];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  stagesCount: number;
  workflow: {
    evidenceFocus?: readonly ContentBlock[];
    gateIds?: readonly string[];
    id: string;
    issuePath?: readonly ContentBlock[];
  };
}) {
  return (
    <aside
      className="space-y-4 min-[1100px]:sticky min-[1100px]:top-[92px] min-[1100px]:self-start"
      data-testid="workflow-right-rail"
    >
      <WorkflowRailCard title="Workflow Overview">
        <dl className="space-y-2">
          <OverviewRow Icon={ClipboardCheck} label="Activities" value={String(activitiesCount)} />
          <OverviewRow Icon={Flag} label="Gates" value={String(gates.length)} />
          <OverviewRow Icon={GitBranch} label="Stages" value={String(stagesCount)} />
          <OverviewRow Icon={BadgeCheck} label="Current Stage" value="Not tracked" />
        </dl>
      </WorkflowRailCard>

      <WorkflowRailCard title={gates.length === 1 ? "Workflow Gate" : "Workflow Gates"}>
        {gates.length ? (
          <div className="space-y-3">
            {gates.map((gate) => (
              <div key={gate.id}>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <h2 className="text-[12px] font-bold leading-5 text-[#07142e]">
                      <LocalizedText preference={preference} value={gate.title} />
                    </h2>
                    <WorkflowRailText
                      preference={preference}
                      value={gate.purpose}
                    />
                  </div>
                </div>
                <Link
                  className="mt-3 inline-flex items-center gap-2 text-[12px] font-bold text-[#075fef] hover:underline"
                  to={getCanonicalRoute({ objectType: "gate", id: gate.id })}
                >
                  View gate details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <WorkflowUnavailable text="No workflow gate defined." />
        )}
      </WorkflowRailCard>

      <WorkflowRailCard title="Evidence Focus">
        <WorkflowChecklist
          blocks={workflow.evidenceFocus}
          preference={preference}
          tone="evidence"
          unavailable={unavailableWorkflowText}
        />
        <WorkflowDisabledAction>View all evidence</WorkflowDisabledAction>
      </WorkflowRailCard>

      <WorkflowRailCard
        className="border-orange-200 bg-orange-50/45"
        title={
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            Common Issue Path
          </span>
        }
      >
        <WorkflowChecklist
          blocks={workflow.issuePath}
          preference={preference}
          tone="issue"
          unavailable={unavailableWorkflowText}
        />
        <WorkflowDisabledAction>View all issues</WorkflowDisabledAction>
      </WorkflowRailCard>
    </aside>
  );
}

function WorkflowRailCard({
  children,
  className,
  title
}: {
  children: ReactNode;
  className?: string;
  title: ReactNode;
}) {
  return (
    <section
      className={classNames(
        "rounded-[10px] border border-[rgba(15,23,42,0.11)] bg-white p-4 shadow-[0_2px_7px_rgba(15,23,42,0.035)]",
        className
      )}
      data-testid="workflow-rail-card"
    >
      <h2 className="mb-3 text-[12px] font-bold uppercase leading-5 text-[#07142e]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function OverviewRow({
  Icon,
  label,
  value
}: {
  Icon: IconComponent;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[32px] items-center justify-between gap-3 text-[12px]">
      <span className="flex items-center gap-3 font-medium text-[#24365f]">
        <Icon className="h-4 w-4 text-[#52617d]" />
        {label}
      </span>
      <span className="font-bold text-[#07142e]">{value}</span>
    </div>
  );
}

function WorkflowRailText({
  preference,
  value
}: {
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  value?: LocalizedContent;
}) {
  return (
    <p className="mt-3 text-[12px] font-medium leading-5 text-[#52617d]">
      {value ? (
        <LocalizedText density="long" preference={preference} value={value} />
      ) : (
        unavailableWorkflowText
      )}
    </p>
  );
}

function WorkflowChecklist({
  blocks,
  preference,
  tone,
  unavailable
}: {
  blocks?: readonly ContentBlock[];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  tone: "evidence" | "issue";
  unavailable: string;
}) {
  const items = blocksToItems(blocks, preference);

  if (!items.length) return <WorkflowUnavailable text={unavailable} />;

  return (
    <ul className="space-y-3">
      {items.slice(0, 8).map((item, index) => (
        <li
          className="flex items-start gap-3 text-[12px] font-medium leading-5 text-[#24365f]"
          key={`${item}-${index}`}
        >
          {tone === "evidence" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function WorkflowDisabledAction({ children }: { children: ReactNode }) {
  return (
    <span className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold text-[#075fef] opacity-70">
      {children} <ArrowRight className="h-4 w-4" />
    </span>
  );
}

function WorkflowUnavailable({ text }: { text: string }) {
  return (
    <p
      className="text-[12px] font-medium leading-5 text-[#64748b]"
      data-testid="workflow-unavailable"
    >
      {text}
    </p>
  );
}

function blocksToItems(
  blocks: readonly ContentBlock[] | undefined,
  preference: ReturnType<typeof useLanguagePreference>["preference"]
) {
  if (!blocks) return [];

  return blocks.flatMap((block) => {
    switch (block.type) {
      case "paragraph":
      case "notice":
        return splitText(formatLocalized(block.item.text, preference));
      case "bulletList":
      case "checkList":
        return block.items.flatMap((item) =>
          splitText(formatLocalized(item.text, preference))
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

function splitText(value: string) {
  return value
    .split(/\n|;|\u2022/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getStageTone(stage: WorkflowStage, index: number): StageTone {
  const normalized = `${stage.id} ${stage.title.en}`.toLowerCase();

  if (normalized.includes("verify")) return "verify";
  if (normalized.includes("execute") || normalized.includes("observe")) {
    return "execute";
  }
  if (normalized.includes("test")) return "test";
  if (normalized.includes("release") || normalized.includes("close")) {
    return "release";
  }

  return stageToneOrder[index] ?? "prepare";
}
