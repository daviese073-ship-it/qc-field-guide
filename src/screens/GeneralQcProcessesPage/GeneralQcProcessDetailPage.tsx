import {
  ArrowLeft,
  Camera,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  ListChecks,
  Lightbulb,
  TriangleAlert
} from "lucide-react";
import type { ReactNode } from "react";
import { useId, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionGeneralQcService } from "@/app/productionAppData";
import type { GeneralQcProcess } from "@/domain/types";
import { formatLocalizedValue } from "@/services/localization/localizationService";
import { getCanonicalRoute } from "@/services/navigation";
import { classNames } from "@/utils/classNames";

import { ProcessIcon } from "./ProcessIcon";
import {
  accentClasses,
  getGeneralQcVisual,
  getGeneralQcWorkflowStepVisual
} from "./generalQcPresentation";

type DetailTab = "workflow" | "capture" | "mistakes";

const tabs: Array<{
  id: DetailTab;
  label: string;
  Icon: typeof ListChecks;
}> = [
  { id: "workflow", label: "Field Workflow", Icon: ListChecks },
  { id: "capture", label: "What to Capture", Icon: Camera },
  { id: "mistakes", label: "Common Mistakes", Icon: TriangleAlert }
];

const tileToneClasses = {
  red: "border-red-200 bg-red-50 text-red-600",
  blue: "border-blue-200 bg-blue-50 text-blue-600",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  purple: "border-purple-200 bg-purple-50 text-purple-600",
  green: "border-green-200 bg-green-50 text-green-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  teal: "border-cyan-200 bg-cyan-50 text-cyan-700"
} as const;

export function GeneralQcProcessDetailPage() {
  const { processId } = useParams();
  const { preference } = useLanguagePreference();
  const [activeTab, setActiveTab] = useState<DetailTab>("workflow");
  const tabPanelId = useId();
  const process = processId
    ? productionGeneralQcService.getProcessById(processId)
    : undefined;

  if (!process) {
    return <GeneralQcProcessNotFound />;
  }

  const visual = getGeneralQcVisual(process.id);
  const accent = accentClasses[visual.accent];
  const title = formatLocalizedValue(process.title, preference);
  const summary = formatLocalizedValue(process.summary, preference);

  return (
    <article
      className="w-full max-w-[1229px]"
      data-process-accent={visual.accent}
      data-testid="general-qc-detail"
    >
      <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,873px)_332px]">
        <div className="min-w-0" data-testid="general-qc-detail-main">
          <nav
            aria-label="General QC process breadcrumb"
            className="flex min-h-[35px] items-center gap-3"
            data-testid="general-qc-detail-breadcrumb"
          >
            <Link
              aria-label="Back to General QC Processes"
              className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-[9px] border border-[rgba(15,23,42,0.12)] bg-white text-[#07142e] shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition hover:bg-[#f8fafc] focus-visible:outline-offset-3"
              to="/general-qc"
            >
              <ArrowLeft className="h-[18px] w-[18px]" aria-hidden />
            </Link>
            <ol className="flex min-w-0 items-center gap-2 text-[15px] leading-5">
              <li className="shrink-0">
                <Link
                  className="font-medium text-[#52617d] hover:text-[#07142e]"
                  to="/general-qc"
                >
                  General QC Processes
                </Link>
              </li>
              <li className="text-[#52617d]" aria-hidden>
                <ChevronRight className="h-4 w-4" />
              </li>
              <li
                className="min-w-0 truncate font-bold text-[#07142e]"
                aria-current="page"
              >
                {title}
              </li>
            </ol>
          </nav>

          <header
            className="mt-3 flex min-w-0 items-start gap-7 pl-3"
            data-testid="general-qc-detail-header"
          >
            <span
              className={classNames("shrink-0", accent.text)}
              data-testid="general-qc-detail-icon"
            >
              <visual.Icon
                className="h-[76px] w-[76px]"
                strokeWidth={2.25}
                aria-hidden
              />
            </span>
            <div className="min-w-0 pt-1">
              <h1
                className="text-[28px] font-bold leading-[34px] text-[#07142e]"
                data-testid="general-qc-detail-title"
              >
                {title}
              </h1>
              <p className="mt-2 max-w-[560px] text-[16px] font-medium leading-6 text-[#24365f]">
                {summary}
              </p>
            </div>
          </header>

          <section
            className="mt-5 min-h-[84px] rounded-[10px] border border-[rgba(15,23,42,0.12)] bg-white px-5 py-4 shadow-[0_2px_6px_rgba(15,23,42,0.04)]"
            data-testid="general-qc-when-to-use"
          >
            <div className="grid items-center gap-4 sm:grid-cols-[72px_minmax(0,1fr)]">
              <div className="flex items-center gap-4">
                <span
                  className={classNames(
                    "flex h-[52px] w-[52px] items-center justify-center rounded-full",
                    accent.circle,
                    accent.text
                  )}
                >
                  <Clock3 className="h-[29px] w-[29px]" aria-hidden />
                </span>
                <span
                  className="hidden h-12 w-px bg-[rgba(15,23,42,0.13)] sm:block"
                  aria-hidden
                />
              </div>
              <div>
                <h2
                  className={classNames(
                    "text-[16px] font-bold leading-6",
                    accent.text
                  )}
                >
                  When to Use
                </h2>
                <p className="mt-1 text-[15px] font-normal leading-[23px] text-[#07142e]">
                  {formatLocalizedValue(process.whenToUse, preference)}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-3">
            <div
              aria-label="General QC process detail sections"
              className="grid h-[48px] grid-cols-3 overflow-hidden rounded-[8px] border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.035)]"
              data-testid="general-qc-detail-tabs"
              role="tablist"
            >
              {tabs.map((tab) => {
                const selected = activeTab === tab.id;
                const Icon = tab.Icon;

                return (
                  <button
                    aria-controls={tabPanelId}
                    aria-selected={selected ? "true" : "false"}
                    className={classNames(
                      "relative inline-flex items-center justify-center gap-3 text-[15px] font-semibold leading-5 transition focus-visible:outline-offset-[-3px]",
                      selected ? accent.text : "text-[#52617d]"
                    )}
                    id={`${tabPanelId}-${tab.id}`}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    type="button"
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    {tab.label}
                    {selected ? (
                      <span
                        className={classNames(
                          "absolute inset-x-0 bottom-0 h-0.5",
                          accent.side
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div
              aria-labelledby={`${tabPanelId}-${activeTab}`}
              className="mt-[10px]"
              id={tabPanelId}
              role="tabpanel"
            >
              {activeTab === "workflow" ? (
                <WorkflowPanel process={process} />
              ) : null}
              {activeTab === "capture" ? (
                <ListPanel
                  accentClassName={accent.text}
                  items={process.whatToCapture.map((item) =>
                    formatLocalizedValue(item, preference)
                  )}
                  tone="capture"
                />
              ) : null}
              {activeTab === "mistakes" ? (
                <ListPanel
                  accentClassName="text-[#f97316]"
                  items={process.commonMistakes.map((item) =>
                    formatLocalizedValue(item, preference)
                  )}
                  tone="mistake"
                />
              ) : null}
            </div>
          </section>

          <AdditionalSections process={process} />
          <RelatedProcesses process={process} />
        </div>

        <aside
          className="space-y-4 xl:pt-[244px]"
          data-testid="general-qc-detail-rail"
        >
          <RightRailPanel
            accent="text-[#f97316]"
            Icon={Lightbulb}
            items={process.keyReminders.map((item) =>
              formatLocalizedValue(item, preference)
            )}
            marker="bg-[#f97316]"
            title="Key Reminders"
          />
          <RightRailPanel
            accent="text-[#2a9d45]"
            Icon={ClipboardCheck}
            items={process.typicalOutputs.map((item) =>
              formatLocalizedValue(item, preference)
            )}
            marker="bg-[#2a9d45]"
            title="Typical Outputs"
          />
        </aside>
      </div>
    </article>
  );
}

function GeneralQcProcessNotFound() {
  return (
    <div className="w-full max-w-[873px]">
      <Link
        className="inline-flex h-[35px] items-center gap-2 rounded-[9px] border border-[rgba(15,23,42,0.12)] bg-white px-3 text-sm font-bold text-[#075fef] shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
        to="/general-qc"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        General QC Processes
      </Link>
      <section className="mt-6 rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_2px_6px_rgba(15,23,42,0.04)]">
        <h1 className="text-2xl font-bold text-[#07142e]">
          General QC process not found
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#52617d]">
          No canonical General QC Process record matches this route.
        </p>
      </section>
    </div>
  );
}

function WorkflowPanel({ process }: { process: GeneralQcProcess }) {
  const { preference } = useLanguagePreference();
  const visual = getGeneralQcVisual(process.id);
  const accent = accentClasses[visual.accent];

  return (
    <ol
      className="relative overflow-hidden rounded-[10px] border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.04)]"
      data-testid="general-qc-workflow-panel"
    >
      <span
        className="absolute bottom-[44px] left-[49px] top-[31px] w-px bg-[rgba(148,163,184,0.34)]"
        aria-hidden
      />
      {process.fieldWorkflow.map((step, index) => {
        const stepVisual = getGeneralQcWorkflowStepVisual(step.action.en);
        const Icon = stepVisual.Icon;

        return (
          <li
            className={classNames(
              "relative grid min-h-[68px] grid-cols-[92px_minmax(0,1fr)_72px] items-center gap-2 px-6 py-[12px]",
              index > 0 ? "border-t border-[rgba(148,163,184,0.24)]" : null
            )}
            key={step.sequence}
          >
            <span
              className={classNames(
                "z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full text-[13px] font-bold leading-none text-white",
                accent.side
              )}
              data-testid="general-qc-workflow-step-number"
            >
              {step.sequence}
            </span>
            <span className="min-w-0">
              <span className="block text-[16px] font-bold leading-5 text-[#07142e]">
                {formatLocalizedValue(step.action, preference)}
              </span>
              <span className="mt-1 block text-[14px] font-normal leading-[21px] text-[#24365f]">
                {formatLocalizedValue(step.detail, preference)}
              </span>
            </span>
            <span
              className={classNames(
                "ml-auto flex h-11 w-11 items-center justify-center rounded-[8px] border",
                tileToneClasses[stepVisual.tone]
              )}
              data-testid="general-qc-workflow-step-icon"
            >
              <Icon className="h-6 w-6" aria-hidden />
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function ListPanel({
  accentClassName,
  items,
  tone
}: {
  accentClassName: string;
  items: readonly string[];
  tone: "capture" | "mistake";
}) {
  const Icon = tone === "capture" ? ClipboardCheck : TriangleAlert;
  const tileClassName =
    tone === "capture"
      ? "border-blue-200 bg-blue-50 text-blue-600"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <ul className="overflow-hidden rounded-[10px] border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.04)]">
      {items.map((item, index) => (
        <li
          className={classNames(
            "grid min-h-[64px] grid-cols-[52px_minmax(0,1fr)] items-center gap-4 px-5 py-3",
            index > 0 ? "border-t border-[rgba(148,163,184,0.24)]" : null
          )}
          key={item}
        >
          <span
            className={classNames(
              "flex h-10 w-10 items-center justify-center rounded-[8px] border",
              tileClassName
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span
            className={classNames(
              "text-[15px] font-medium leading-[23px] text-[#07142e]",
              tone === "capture" ? accentClassName : null
            )}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RightRailPanel({
  accent,
  Icon,
  items,
  marker,
  title
}: {
  accent: string;
  Icon: typeof Lightbulb;
  items: readonly string[];
  marker: string;
  title: string;
}) {
  return (
    <section
      className="rounded-[11px] border border-[rgba(15,23,42,0.12)] bg-white p-[22px] shadow-[0_3px_10px_rgba(15,23,42,0.045)]"
      data-testid={`general-qc-rail-${title.toLowerCase().replaceAll(" ", "-")}`}
    >
      <h2
        className={classNames(
          "flex items-center gap-3 text-[18px] font-bold leading-6",
          accent
        )}
      >
        <Icon className="h-7 w-7" aria-hidden />
        {title}
      </h2>
      <ul className="mt-7 space-y-3">
        {items.map((item) => (
          <li
            className="grid grid-cols-[5px_minmax(0,1fr)] gap-3 text-[14px] font-medium leading-[22px] text-[#07142e]"
            key={item}
          >
            <span
              className={classNames(
                "mt-[9px] h-[5px] w-[5px] rounded-full",
                marker
              )}
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AdditionalSections({ process }: { process: GeneralQcProcess }) {
  const { preference } = useLanguagePreference();

  if (!process.additionalSections?.length) return null;

  return (
    <div className="mt-4 grid gap-4">
      {process.additionalSections.map((section) => (
        <SupplementarySection
          key={section.title.en}
          title={formatLocalizedValue(section.title, preference)}
        >
          <SimpleBulletList
            items={section.items.map((item) =>
              formatLocalizedValue(item, preference)
            )}
          />
        </SupplementarySection>
      ))}
    </div>
  );
}

function RelatedProcesses({ process }: { process: GeneralQcProcess }) {
  const { preference } = useLanguagePreference();
  const related = productionGeneralQcService.getRelatedProcesses(process);

  if (!related.length) return null;

  return (
    <SupplementarySection title="Related Processes">
      <div className="grid gap-3 sm:grid-cols-2">
        {related.map((item) => {
          const visual = getGeneralQcVisual(item.id);

          return (
            <Link
              className="group grid min-h-[68px] grid-cols-[40px_minmax(0,1fr)_18px] items-center gap-3 rounded-[9px] border border-[rgba(15,23,42,0.10)] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.035)] transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-offset-4"
              key={item.id}
              to={getCanonicalRoute({
                objectType: "generalQcProcess",
                id: item.id
              })}
            >
              <ProcessIcon
                Icon={visual.Icon}
                accent={visual.accent}
                size="small"
              />
              <span className="line-clamp-2 text-[14px] font-bold leading-5 text-[#07142e]">
                {formatLocalizedValue(item.title, preference)}
              </span>
              <ChevronRight
                className="h-4 w-4 text-[#075fef] transition group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </SupplementarySection>
  );
}

function SupplementarySection({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="mt-4 rounded-[10px] border border-[rgba(15,23,42,0.12)] bg-white p-5 shadow-[0_2px_6px_rgba(15,23,42,0.04)]">
      <h2 className="text-[16px] font-bold leading-6 text-[#07142e]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SimpleBulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          className="flex gap-2 text-[14px] leading-[22px] text-[#24365f]"
          key={item}
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#52617d]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
