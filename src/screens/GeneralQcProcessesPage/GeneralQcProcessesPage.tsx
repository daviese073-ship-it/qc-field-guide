import {
  ArrowLeft,
  ChevronRight,
  Grid2X2,
  History,
  Lightbulb,
  List
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  productionGeneralQcService,
  productionUiStrings
} from "@/app/productionAppData";
import { useLanguagePreference } from "@/app/languagePreferenceContext";
import type { GeneralQcProcess } from "@/domain/types";
import { getCanonicalRoute } from "@/services/navigation";
import { formatLocalizedValue } from "@/services/localization/localizationService";
import { classNames } from "@/utils/classNames";

import { accentClasses, getGeneralQcVisual } from "./generalQcPresentation";
import { ProcessIcon } from "./ProcessIcon";

type ViewMode = "grid" | "list";

export function GeneralQcProcessesPage() {
  const navigate = useNavigate();
  const { preference } = useLanguagePreference();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const processes = productionGeneralQcService.getAllProcesses();
  const homeLabel =
    productionUiStrings.formatUiString("UI-NAV-HOME", preference) ?? "Home";

  return (
    <div className="mx-auto grid w-full max-w-[1204px] gap-7 xl:grid-cols-[minmax(0,647px)_300px] min-[1500px]:grid-cols-[minmax(0,836px)_340px]">
      <div className="min-w-0 pt-3 min-[1500px]:pt-[34px]">
        <header className="flex items-start gap-4">
          <button
            aria-label={`Back to ${homeLabel}`}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(15,23,42,0.12)] bg-white text-[#07142e] shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition hover:border-[rgba(15,23,42,0.22)] hover:bg-[#f8fafc] focus-visible:outline-offset-4"
            onClick={() => navigate("/")}
            type="button"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <div>
            <h1 className="text-[32px] font-bold leading-10 text-[#07142e]">
              General QC Processes
            </h1>
            <p className="mt-1 text-[17px] font-medium leading-[25px] text-[#56647d]">
              Field reminders for key quality processes used on site.
            </p>
          </div>
        </header>

        <section className="mt-10" aria-labelledby="general-qc-all-processes">
          <div className="flex items-center justify-between gap-4">
            <h2
              className="text-[20px] font-bold leading-7 text-[#07142e]"
              id="general-qc-all-processes"
            >
              All Processes
            </h2>
            <GeneralQcViewToggle mode={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "grid" ? (
            <ul className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {processes.map((process) => (
                <li key={process.id}>
                  <GeneralQcProcessCard process={process} />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-5 space-y-3">
              {processes.map((process) => (
                <li key={process.id}>
                  <GeneralQcProcessListItem process={process} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-6 pt-0 min-[1500px]:pt-[34px]">
        <GeneralQcEmptyPanel
          icon={History}
          iconClassName="text-[#56647d]"
          title="Commonly Used"
        >
          No usage history is available yet.
        </GeneralQcEmptyPanel>
        <GeneralQcEmptyPanel
          icon={Lightbulb}
          iconClassName="text-[#7c3aed]"
          title="Field Tips"
        >
          No approved field-tip derivation rule is defined yet.
        </GeneralQcEmptyPanel>
      </aside>
    </div>
  );
}

function GeneralQcViewToggle({
  mode,
  onChange
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div
      aria-label="Process view"
      className="flex h-10 w-[178px] overflow-hidden rounded-[10px] border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.04)]"
      role="group"
    >
      <button
        aria-pressed={mode === "grid"}
        className={classNames(
          "inline-flex flex-1 items-center justify-center gap-2 text-[14px] font-semibold",
          mode === "grid"
            ? "bg-[#07142e] text-white"
            : "bg-white text-[#56647d]"
        )}
        onClick={() => onChange("grid")}
        type="button"
      >
        <Grid2X2 className="h-4 w-4" aria-hidden />
        Grid
      </button>
      <button
        aria-pressed={mode === "list"}
        className={classNames(
          "inline-flex flex-1 items-center justify-center gap-2 border-l border-[rgba(15,23,42,0.10)] text-[14px] font-semibold",
          mode === "list"
            ? "bg-[#07142e] text-white"
            : "bg-white text-[#56647d]"
        )}
        onClick={() => onChange("list")}
        type="button"
      >
        <List className="h-4 w-4" aria-hidden />
        List
      </button>
    </div>
  );
}

function GeneralQcProcessCard({ process }: { process: GeneralQcProcess }) {
  const visual = getGeneralQcVisual(process.id);
  const accent = accentClasses[visual.accent];
  const { preference } = useLanguagePreference();
  const title = formatLocalizedValue(process.title, preference);
  const summary = formatLocalizedValue(process.summary, preference);

  return (
    <Link
      aria-label={`${String(process.sequence).padStart(2, "0")} ${title}`}
      className={classNames(
        "group flex h-[210px] flex-col overflow-hidden rounded-[11px] border border-[rgba(15,23,42,0.11)] bg-white p-[18px] shadow-[0_2px_6px_rgba(15,23,42,0.035)] transition hover:shadow-[0_4px_10px_rgba(15,23,42,0.06)] focus-visible:outline-offset-4",
        accent.border
      )}
      to={getCanonicalRoute({ objectType: "generalQcProcess", id: process.id })}
    >
      <ProcessIcon Icon={visual.Icon} accent={visual.accent} size="large" />
      <span className="mt-5 grid grid-cols-[minmax(0,1fr)_20px] items-start gap-2">
        <span>
          <span className="line-clamp-2 block max-h-10 overflow-hidden text-[16px] font-bold leading-[20px] text-[#07142e]">
            {title}
          </span>
          <span className="mt-1.5 line-clamp-2 block max-h-10 overflow-hidden text-[14px] font-normal leading-5 text-[#56647d]">
            {summary}
          </span>
        </span>
        <ChevronRight
          className={classNames(
            "mt-7 h-5 w-5 transition group-hover:translate-x-0.5",
            accent.text
          )}
          aria-hidden
        />
      </span>
    </Link>
  );
}

function GeneralQcProcessListItem({ process }: { process: GeneralQcProcess }) {
  const visual = getGeneralQcVisual(process.id);
  const accent = accentClasses[visual.accent];
  const { preference } = useLanguagePreference();
  const title = formatLocalizedValue(process.title, preference);
  const summary = formatLocalizedValue(process.summary, preference);

  return (
    <Link
      className={classNames(
        "grid min-h-[92px] grid-cols-[48px_minmax(0,1fr)_20px] items-center gap-4 rounded-[11px] border border-[rgba(15,23,42,0.11)] bg-white px-5 py-4 shadow-[0_2px_6px_rgba(15,23,42,0.035)] transition hover:shadow-[0_4px_10px_rgba(15,23,42,0.06)] focus-visible:outline-offset-4",
        accent.border
      )}
      to={getCanonicalRoute({ objectType: "generalQcProcess", id: process.id })}
    >
      <ProcessIcon Icon={visual.Icon} accent={visual.accent} size="small" />
      <span className="min-w-0">
        <span className="block text-[16px] font-bold leading-5 text-[#07142e]">
          {String(process.sequence).padStart(2, "0")} {title}
        </span>
        <span className="mt-1 line-clamp-2 block text-[14px] leading-5 text-[#56647d]">
          {summary}
        </span>
      </span>
      <ChevronRight className={classNames("h-5 w-5", accent.text)} />
    </Link>
  );
}

function GeneralQcEmptyPanel({
  children,
  icon: Icon,
  iconClassName,
  title
}: {
  children: string;
  icon: LucideIcon;
  iconClassName: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_3px_10px_rgba(15,23,42,0.045)]">
      <header className="flex h-16 items-center border-b border-[rgba(15,23,42,0.10)] px-5">
        <div className="flex items-center gap-3">
          <Icon className={classNames("h-[22px] w-[22px]", iconClassName)} />
          <h2 className="text-[18px] font-bold leading-6 text-[#07142e]">
            {title}
          </h2>
        </div>
      </header>
      <div className="flex min-h-[168px] items-center px-5 py-6 text-[14px] font-medium leading-6 text-[#56647d]">
        {children}
      </div>
    </section>
  );
}
