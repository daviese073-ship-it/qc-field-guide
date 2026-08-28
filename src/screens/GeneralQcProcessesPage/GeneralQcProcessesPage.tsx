import { ArrowLeft, ChevronRight, History, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  productionGeneralQcService,
  productionUiStrings
} from "@/app/productionAppData";
import { useLanguagePreference } from "@/app/languagePreferenceContext";
import type { GeneralQcProcess } from "@/domain/types";
import { getCanonicalRoute } from "@/services/navigation";
import { formatLocalizedValue } from "@/services/localization/localizationService";
import {
  getTopVisited,
  type VisitHistoryRecord
} from "@/services/storage/visitHistory";
import { classNames } from "@/utils/classNames";

import { accentClasses, getGeneralQcVisual } from "./generalQcPresentation";
import { ProcessIcon } from "./ProcessIcon";

const generalQcFieldTips = [
  {
    en: "Use Specific, Actionable Checklists  when required for all quality inspection processes.",
    fr: "Utilisez des listes de contrôle précises et exploitables au besoin pour tous les processus d'inspection de la qualité."
  },
  {
    en: "Ensure the quality process culminates with an output which records the necessary details to satisfy the contractual and project requirements.",
    fr: "Assurez-vous que le processus de qualité se termine par un livrable qui enregistre les détails nécessaires pour satisfaire aux exigences contractuelles et du projet."
  }
];

export function GeneralQcProcessesPage() {
  const navigate = useNavigate();
  const { preference } = useLanguagePreference();
  const processes = productionGeneralQcService.getAllProcesses();
  const commonlyUsedProcesses = getTopVisited("generalQcProcess", 5);
  const homeLabel =
    productionUiStrings.formatUiString("UI-NAV-HOME", preference) ?? "Home";

  return (
    <div
      className="mx-auto grid w-full max-w-[1204px] gap-7 xl:grid-cols-[minmax(0,647px)_300px] min-[1500px]:grid-cols-[minmax(0,836px)_340px]"
      data-testid="general-qc-interface"
    >
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
          <h2
            className="text-[20px] font-bold leading-7 text-[#07142e]"
            id="general-qc-all-processes"
          >
            All Processes
          </h2>
          <ul className="mt-5 space-y-3">
            {processes.map((process) => (
              <li key={process.id}>
                <GeneralQcProcessListItem process={process} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-6 pt-0 min-[1500px]:pt-[34px]">
        <CommonlyUsedPanel
          icon={History}
          iconClassName="text-[#56647d]"
          preference={preference}
          records={commonlyUsedProcesses}
          title="Commonly Used"
        />
        <GeneralQcFieldTipsPanel
          icon={Lightbulb}
          iconClassName="text-[#7c3aed]"
          preference={preference}
          title="Field Tips"
        />
      </aside>
    </div>
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

function GeneralQcRailPanel({
  children,
  icon: Icon,
  iconClassName,
  title
}: {
  children: ReactNode;
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

function CommonlyUsedPanel({
  icon,
  iconClassName,
  preference,
  records,
  title
}: {
  icon: LucideIcon;
  iconClassName: string;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  records: readonly VisitHistoryRecord[];
  title: string;
}) {
  const visibleRecords = records
    .map((record) => ({
      process: productionGeneralQcService.getProcessById(record.id),
      record
    }))
    .filter(
      (
        item
      ): item is { process: GeneralQcProcess; record: VisitHistoryRecord } =>
        Boolean(item.process)
    );

  return (
    <GeneralQcRailPanel icon={icon} iconClassName={iconClassName} title={title}>
      {visibleRecords.length ? (
        <ul className="space-y-2" data-testid="commonly-used-processes">
          {visibleRecords.map(({ process, record }) => (
            <li key={process.id}>
              <CommonProcessRow
                preference={preference}
                process={process}
                record={record}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex min-h-[168px] items-center text-[14px] font-medium leading-6 text-[#56647d]">
          No usage history is available yet.
        </p>
      )}
    </GeneralQcRailPanel>
  );
}

function CommonProcessRow({
  preference,
  process,
  record
}: {
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  process: GeneralQcProcess;
  record: VisitHistoryRecord;
}) {
  const visual = getGeneralQcVisual(process.id);
  const accent = accentClasses[visual.accent];

  return (
    <Link
      className="grid min-h-[58px] grid-cols-[40px_minmax(0,1fr)_18px] items-center gap-3 rounded-[10px] border border-[rgba(15,23,42,0.10)] bg-white/80 px-3 py-2 text-[#07142e] shadow-[0_1px_3px_rgba(15,23,42,0.025)] transition hover:border-blue-200 hover:bg-blue-50/35 focus-visible:outline-offset-3"
      to={getCanonicalRoute({ objectType: "generalQcProcess", id: process.id })}
    >
      <ProcessIcon Icon={visual.Icon} accent={visual.accent} size="small" />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-bold leading-5">
          {formatLocalizedValue(process.title, preference)}
        </span>
        <span className="block text-[11px] font-medium leading-4 text-[#64748b]">
          {formatUseCount(record.count, preference)}
        </span>
      </span>
      <ChevronRight className={classNames("h-4 w-4", accent.text)} />
    </Link>
  );
}

function GeneralQcFieldTipsPanel({
  icon,
  iconClassName,
  preference,
  title
}: {
  icon: LucideIcon;
  iconClassName: string;
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  title: string;
}) {
  return (
    <GeneralQcRailPanel icon={icon} iconClassName={iconClassName} title={title}>
      <ul className="space-y-3" data-testid="general-qc-field-tips">
        {generalQcFieldTips.map((tip) => (
          <li
            className="grid grid-cols-[4px_minmax(0,1fr)] gap-3 text-[14px] font-medium leading-[22px] text-[#07142e]"
            key={tip.en}
          >
            <span
              className="mt-[8px] h-[28px] w-1 rounded-full bg-[#7c3aed]"
              aria-hidden
            />
            <span>{formatLocalizedValue(tip, preference)}</span>
          </li>
        ))}
      </ul>
    </GeneralQcRailPanel>
  );
}

function formatUseCount(
  count: number,
  preference: ReturnType<typeof useLanguagePreference>["preference"]
) {
  const french =
    preference.mode === "fr" ||
    (preference.mode === "bilingual" && preference.bilingualPrimary === "fr");

  if (french) return count === 1 ? "1 utilisation" : `${count} utilisations`;

  return count === 1 ? "1 use" : `${count} uses`;
}
