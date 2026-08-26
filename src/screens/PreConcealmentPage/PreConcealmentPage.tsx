import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Hand,
  ShieldCheck
} from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { Link, useParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { LocalizedText } from "@/components/content/LocalizedText";
import type { Activity, ContentBlock, Gate } from "@/domain/types";
import { getCanonicalRoute } from "@/services/navigation";
import { buildPreConcealmentScreenModel } from "@/services/screenContracts";
import { classNames } from "@/utils/classNames";

import { formatLocalized } from "../screenLabels";
import { MissingObject } from "../screenShared";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type StageTone = "stop" | "check" | "evidence" | "blocking" | "release";

const unavailableText =
  "Information not available for this pre-concealment workflow.";

const processSteps: readonly {
  detail: string;
  label: string;
  tone: StageTone;
}[] = [
  { label: "Stop", detail: "Pause work", tone: "stop" },
  { label: "Check", detail: "Verify items", tone: "check" },
  { label: "Evidence", detail: "Capture proof", tone: "evidence" },
  { label: "Blocking", detail: "Clear blockers", tone: "blocking" },
  { label: "Release", detail: "Authorized process", tone: "release" }
];

const toneClasses: Record<
  StageTone,
  {
    Icon: IconComponent;
    accent: string;
    border: string;
    marker: string;
  }
> = {
  stop: {
    Icon: Hand,
    accent: "text-red-600",
    border: "border-t-red-600",
    marker: "bg-red-600 text-white"
  },
  check: {
    Icon: CheckCircle2,
    accent: "text-emerald-600",
    border: "border-t-emerald-600",
    marker: "bg-emerald-600 text-white"
  },
  evidence: {
    Icon: Camera,
    accent: "text-blue-600",
    border: "border-t-blue-600",
    marker: "bg-blue-600 text-white"
  },
  blocking: {
    Icon: AlertTriangle,
    accent: "text-orange-600",
    border: "border-t-orange-600",
    marker: "bg-orange-600 text-white"
  },
  release: {
    Icon: ShieldCheck,
    accent: "text-emerald-700",
    border: "border-t-emerald-700",
    marker: "bg-emerald-700 text-white"
  }
};

export function PreConcealmentPage() {
  const { preConcealmentId = "" } = useParams<{
    preConcealmentId: string;
  }>();
  const { preference } = useLanguagePreference();
  const model = buildPreConcealmentScreenModel(
    productionRegistries,
    preConcealmentId
  );
  const workflow = model.workflow;

  if (model.status === "notFound" || !workflow) {
    return (
      <MissingObject
        objectId={preConcealmentId}
        objectLabel="Pre-concealment workflow"
      />
    );
  }

  return (
    <article
      className="w-full max-w-[1164px]"
      data-testid="preconcealment-interface"
    >
      <header className="grid gap-4 min-[1100px]:grid-cols-[minmax(0,1fr)_260px] min-[1100px]:items-start">
        <div className="min-w-0">
          <nav
            aria-label="Pre-concealment breadcrumb"
            className="flex min-h-5 items-center gap-1.5 text-[12px] font-semibold uppercase leading-5 text-[#075fef]"
            data-testid="preconcealment-breadcrumb"
          >
            <Link className="hover:underline" to="/">
              Home
            </Link>
            <span aria-hidden>›</span>
            <span>Before Closing / Covering</span>
          </nav>
          <h1 className="mt-3 text-[34px] font-bold leading-[40px] text-[#07142e]">
            <LocalizedText preference={preference} value={workflow.title} />
          </h1>
          <p className="mt-3 max-w-[760px] text-[14px] font-medium leading-[22px] text-[#24365f]">
            Stop and verify before work becomes hidden. Project requirements and
            authorized procedures govern.
          </p>
        </div>

        <ReferenceOnlyCard />
      </header>

      <div className="mt-8 grid gap-[18px] min-[1100px]:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0" data-testid="preconcealment-main-column">
          <ProcessStrip />

          <section
            className="mt-6 grid overflow-hidden rounded-[11px] border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] min-[1100px]:grid-cols-5"
            data-testid="preconcealment-matrix"
          >
            <ProcessColumn tone="stop" title="Stop">
              <p className="text-[13px] font-medium leading-[26px] text-[#24365f]">
                Do not cover or close this work until the applicable checks,
                evidence, and blocking conditions are resolved through the
                project-authorized process.
              </p>
            </ProcessColumn>

            <ProcessColumn tone="check" title="Check">
              <GuidanceList
                blocks={workflow.criticalChecks}
                preference={preference}
                tone="check"
              />
            </ProcessColumn>

            <ProcessColumn tone="evidence" title="Evidence">
              <GuidanceList
                blocks={workflow.evidence}
                preference={preference}
                tone="evidence"
              />
            </ProcessColumn>

            <ProcessColumn tone="blocking" title="Blocking">
              <GuidanceList
                blocks={workflow.blockIf}
                preference={preference}
                tone="blocking"
              />
            </ProcessColumn>

            <ProcessColumn tone="release" title="Release">
              <p className="text-[13px] font-medium leading-[26px] text-[#24365f]">
                Follow the authorized project release process where one is
                required. This app does not record or grant release.
              </p>
            </ProcessColumn>
          </section>
        </div>

        <aside
          className="space-y-4 min-[1100px]:sticky min-[1100px]:top-[92px] min-[1100px]:self-start"
          data-testid="preconcealment-right-rail"
        >
          <ListPanel title="Hidden After This">
            <ActivityRows
              activities={model.activities}
              preference={preference}
            />
          </ListPanel>
        </aside>
      </div>

      <section className="mt-[18px] grid gap-[14px] min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px]">
        <ListPanel
          Icon={ClipboardCheck}
          iconClassName="text-[#52617d]"
          title="Activities in Scope"
        >
          <ActivityRows activities={model.activities} preference={preference} />
        </ListPanel>

        <ListPanel
          Icon={ArrowRight}
          iconClassName="text-emerald-700"
          title="Next Work"
        >
          <ActivityRows
            activities={model.nextActivities}
            preference={preference}
          />
        </ListPanel>

        <div className="space-y-[14px]">
          <ListPanel
            Icon={ShieldCheck}
            iconClassName="text-[#52617d]"
            title="Related Gates"
          >
            <GateRows gates={model.gates} preference={preference} />
          </ListPanel>

          <ProjectBoundaryPanel />
        </div>
      </section>
    </article>
  );
}

function ReferenceOnlyCard() {
  return (
    <aside
      className="rounded-[10px] border border-red-200 bg-red-50/55 p-4 text-[#07142e]"
      data-testid="preconcealment-reference-card"
    >
      <div className="flex items-start gap-4">
        <ShieldCheck className="mt-0.5 h-7 w-7 shrink-0 text-red-600" />
        <div>
          <h2 className="text-[12px] font-bold uppercase leading-5">
            Reference Only
          </h2>
          <p className="mt-2 text-[12px] font-medium leading-5 text-[#24365f]">
            This is universal guidance.
          </p>
          <p className="mt-1 text-[12px] font-medium leading-5 text-[#24365f]">
            Not a hold-point or release.
          </p>
        </div>
      </div>
    </aside>
  );
}

function ProcessStrip() {
  return (
    <section
      aria-label="Pre-concealment process"
      className="rounded-[11px] border border-[rgba(15,23,42,0.12)] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
      data-testid="preconcealment-process-strip"
    >
      <ol className="grid gap-4 min-[1100px]:grid-cols-5">
        {processSteps.map((step, index) => {
          const tone = toneClasses[step.tone];

          return (
            <li className="flex items-center gap-3" key={step.label}>
              <span
                className={classNames(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[16px] font-bold leading-none",
                  tone.marker
                )}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold uppercase leading-5 text-[#07142e]">
                  {step.label}
                </span>
                <span className="block text-[11px] font-medium leading-4 text-[#52617d]">
                  {step.detail}
                </span>
              </span>
              {index < processSteps.length - 1 ? (
                <ArrowRight
                  className="ml-auto hidden h-5 w-5 shrink-0 text-[#71809a] min-[1100px]:block"
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ProcessColumn({
  children,
  title,
  tone
}: {
  children: ReactNode;
  title: string;
  tone: StageTone;
}) {
  const visual = toneClasses[tone];
  const Icon = visual.Icon;

  return (
    <section
      className={classNames(
        "border-t-[3px] border-r border-[rgba(148,163,184,0.24)] px-4 pb-5 pt-[17px] last:border-r-0",
        visual.border
      )}
      data-testid={`preconcealment-column-${tone}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <Icon className={classNames("h-7 w-7 shrink-0", visual.accent)} />
        <h2 className="text-[16px] font-bold uppercase leading-5 text-[#07142e]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function GuidanceList({
  blocks,
  preference,
  tone
}: {
  blocks?: readonly ContentBlock[];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  tone: "check" | "evidence" | "blocking";
}) {
  const items = blocksToItems(blocks, preference);

  if (!items.length) return <UnavailableMessage />;

  return (
    <ul className="space-y-[14px]">
      {items.map((item, index) => (
        <li
          className="flex items-start gap-3 text-[13px] font-medium leading-[22px] text-[#24365f]"
          key={`${item}-${index}`}
        >
          <ListMarker tone={tone} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ListMarker({
  tone
}: {
  tone: "check" | "evidence" | "blocking";
}) {
  if (tone === "blocking") {
    return (
      <AlertTriangle className="mt-[3px] h-[15px] w-[15px] shrink-0 text-orange-600" />
    );
  }

  if (tone === "evidence") {
    return (
      <span className="mt-[7px] h-[9px] w-[9px] shrink-0 rounded-full border-[3px] border-blue-600" />
    );
  }

  return (
    <CheckCircle2 className="mt-[3px] h-[15px] w-[15px] shrink-0 text-emerald-600" />
  );
}

function ListPanel({
  children,
  Icon,
  iconClassName,
  title
}: {
  children: ReactNode;
  Icon?: IconComponent;
  iconClassName?: string;
  title: string;
}) {
  return (
    <section
      className="rounded-[10px] border border-[rgba(15,23,42,0.12)] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
      data-testid={`preconcealment-panel-${title.toLowerCase().replaceAll(" ", "-")}`}
    >
      <h2 className="mb-4 flex items-center gap-3 text-[13px] font-bold uppercase leading-5 text-[#07142e]">
        {Icon ? (
          <Icon className={classNames("h-6 w-6 shrink-0", iconClassName)} />
        ) : null}
        {title}
      </h2>
      {children}
    </section>
  );
}

function ActivityRows({
  activities,
  preference
}: {
  activities: readonly Activity[];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  if (!activities.length) return <UnavailableMessage />;

  return (
    <ul className="space-y-2">
      {activities.map((activity) => (
        <li key={activity.id}>
          <Link
            className="flex min-h-[46px] items-center justify-between gap-3 rounded-[8px] border border-[rgba(148,163,184,0.28)] bg-white px-3 text-[13px] font-semibold leading-5 text-[#07142e] shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition hover:border-blue-200 hover:bg-blue-50/35"
            data-testid="preconcealment-activity-row"
            to={getCanonicalRoute({ objectType: "activity", id: activity.id })}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 font-mono text-[12px] font-semibold text-[#71809a]">
                {activity.id}
              </span>
              <span className="min-w-0">
                <LocalizedText preference={preference} value={activity.title} />
              </span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-[#52617d]"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function GateRows({
  gates,
  preference
}: {
  gates: readonly Gate[];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  if (!gates.length) return <UnavailableMessage />;

  return (
    <ul className="space-y-2">
      {gates.map((gate) => (
        <li key={gate.id}>
          <Link
            className="flex min-h-[58px] items-center justify-between gap-3 rounded-[8px] border border-[rgba(148,163,184,0.28)] bg-white px-4 py-2 text-[13px] font-semibold leading-5 text-[#07142e] shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition hover:border-emerald-200 hover:bg-emerald-50/30"
            data-testid="preconcealment-gate-row"
            to={getCanonicalRoute({ objectType: "gate", id: gate.id })}
          >
            <span className="min-w-0">
              <LocalizedText preference={preference} value={gate.title} />
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-[#52617d]"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ProjectBoundaryPanel() {
  return (
    <section
      className="rounded-[10px] border border-red-200 bg-red-50/55 p-5 text-[#07142e] shadow-[0_2px_8px_rgba(15,23,42,0.035)]"
      data-testid="preconcealment-project-boundary"
    >
      <h2 className="flex items-center gap-3 text-[13px] font-bold uppercase leading-5">
        <AlertTriangle className="h-6 w-6 shrink-0 text-red-600" />
        Project Boundary
      </h2>
      <p className="mt-4 text-[13px] font-medium leading-[22px] text-[#24365f]">
        This is universal guidance only.
      </p>
      <p className="mt-2 text-[13px] font-medium leading-[22px] text-[#24365f]">
        It is not an official hold-point release, approval, acceptance, or
        signature.
      </p>
    </section>
  );
}

function UnavailableMessage() {
  return (
    <p className="text-[13px] font-medium leading-[22px] text-[#64748b]">
      {unavailableText}
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
        return [formatLocalized(block.item.text, preference)];
      case "bulletList":
      case "checkList":
        return block.items.map((item) =>
          cleanListText(formatLocalized(item.text, preference))
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

function cleanListText(value: string) {
  return value.trim().replace(/[;.]$/, "");
}
