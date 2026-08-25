import {
  ArrowLeft,
  ChevronRight,
  Grid2X2,
  History,
  Lightbulb,
  List
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { classNames } from "@/utils/classNames";

import {
  generalQcCommonlyUsedVisualItems,
  generalQcFieldTipVisualItems,
  generalQcVisualProcesses,
  type GeneralQcAccent,
  type GeneralQcRailItem,
  type GeneralQcTip,
  type GeneralQcVisualProcess
} from "./generalQcVisualFixtures";

const accentClasses: Record<
  GeneralQcAccent,
  {
    circle: string;
    text: string;
    border: string;
    side: string;
  }
> = {
  teal: {
    circle: "bg-[#dff5f2]",
    text: "text-[#0f9f9a]",
    border: "hover:border-[#8fd8d3]",
    side: "bg-[#0f9f9a]"
  },
  blue: {
    circle: "bg-[#e6eeff]",
    text: "text-[#2563eb]",
    border: "hover:border-[#a9c1ff]",
    side: "bg-[#2563eb]"
  },
  amber: {
    circle: "bg-[#fff2d8]",
    text: "text-[#f59e0b]",
    border: "hover:border-[#f3c86f]",
    side: "bg-[#f59e0b]"
  },
  purple: {
    circle: "bg-[#eee7ff]",
    text: "text-[#7c3aed]",
    border: "hover:border-[#c4b1ff]",
    side: "bg-[#7c3aed]"
  },
  green: {
    circle: "bg-[#e5f5e6]",
    text: "text-[#4caf50]",
    border: "hover:border-[#a7d9a9]",
    side: "bg-[#4caf50]"
  },
  orange: {
    circle: "bg-[#fde8d7]",
    text: "text-[#f97316]",
    border: "hover:border-[#f7ba87]",
    side: "bg-[#f97316]"
  },
  red: {
    circle: "bg-[#fde7e7]",
    text: "text-[#ef4444]",
    border: "hover:border-[#f5aaaa]",
    side: "bg-[#ef4444]"
  },
  cyan: {
    circle: "bg-[#ddf4f5]",
    text: "text-[#149da5]",
    border: "hover:border-[#96dadd]",
    side: "bg-[#149da5]"
  }
};

export function GeneralQcProcessesPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto grid w-full max-w-[1204px] gap-7 xl:grid-cols-[minmax(0,647px)_300px] min-[1500px]:grid-cols-[minmax(0,836px)_340px]">
      <div className="min-w-0 pt-3 min-[1500px]:pt-[34px]">
        <header className="flex items-start gap-4">
          <button
            aria-label="Go back"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(15,23,42,0.12)] bg-white text-[#07142e] shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition hover:border-[rgba(15,23,42,0.22)] hover:bg-[#f8fafc] focus-visible:outline-offset-4"
            onClick={() => navigate(-1)}
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
            <GeneralQcViewToggle />
          </div>
          <ul className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {generalQcVisualProcesses.map((process) => (
              <li key={process.id}>
                <GeneralQcProcessCard process={process} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-6 pt-0 min-[1500px]:pt-[34px]">
        <GeneralQcCommonlyUsedPanel />
        <GeneralQcFieldTipsPanel />
      </aside>
    </div>
  );
}

function GeneralQcViewToggle() {
  return (
    <div
      aria-label="Process view"
      className="flex h-10 w-[178px] overflow-hidden rounded-[10px] border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.04)]"
      role="group"
    >
      <button
        aria-pressed="true"
        className="inline-flex flex-1 items-center justify-center gap-2 bg-[#07142e] text-[14px] font-semibold text-white"
        type="button"
      >
        <Grid2X2 className="h-4 w-4" aria-hidden />
        Grid
      </button>
      <button
        aria-disabled="true"
        className="inline-flex flex-1 items-center justify-center gap-2 border-l border-[rgba(15,23,42,0.10)] bg-white text-[14px] font-semibold text-[#56647d]"
        disabled
        type="button"
      >
        <List className="h-4 w-4" aria-hidden />
        List
      </button>
    </div>
  );
}

function GeneralQcProcessCard({
  process
}: {
  process: GeneralQcVisualProcess;
}) {
  const Icon = process.Icon;
  const accent = accentClasses[process.accent];

  return (
    <a
      id={process.id}
      className={classNames(
        "group flex h-[210px] flex-col overflow-hidden rounded-[11px] border border-[rgba(15,23,42,0.11)] bg-white p-[18px] shadow-[0_2px_6px_rgba(15,23,42,0.035)] transition hover:shadow-[0_4px_10px_rgba(15,23,42,0.06)] focus-visible:outline-offset-4",
        accent.border
      )}
      href={`#${process.id}`}
    >
      <ProcessIcon Icon={Icon} accent={process.accent} size="large" />
      <span className="mt-5 grid grid-cols-[minmax(0,1fr)_20px] items-start gap-2">
        <span>
          <span className="line-clamp-2 block max-h-10 overflow-hidden text-[16px] font-bold leading-[20px] text-[#07142e]">
            {process.title}
          </span>
          <span className="mt-1.5 line-clamp-2 block max-h-10 overflow-hidden text-[14px] font-normal leading-5 text-[#56647d]">
            {process.description}
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
    </a>
  );
}

function GeneralQcCommonlyUsedPanel() {
  return (
    <section className="overflow-hidden rounded-xl border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_3px_10px_rgba(15,23,42,0.045)]">
      <GeneralQcPanelHeader
        icon={History}
        iconClassName="text-[#56647d]"
        title="Commonly Used"
      />
      <ul className="divide-y divide-[rgba(15,23,42,0.08)]">
        {generalQcCommonlyUsedVisualItems.map((item) => (
          <li key={item.id}>
            <GeneralQcCommonlyUsedRow item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function GeneralQcFieldTipsPanel() {
  return (
    <section className="overflow-hidden rounded-xl border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_3px_10px_rgba(15,23,42,0.045)]">
      <GeneralQcPanelHeader
        icon={Lightbulb}
        iconClassName="text-[#7c3aed]"
        title="Field Tips"
      />
      <ul className="divide-y divide-[rgba(15,23,42,0.06)] py-1">
        {generalQcFieldTipVisualItems.map((tip) => (
          <li key={tip.id}>
            <GeneralQcFieldTipRow tip={tip} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function GeneralQcPanelHeader({
  icon: Icon,
  iconClassName,
  title
}: {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[rgba(15,23,42,0.10)] px-5">
      <div className="flex items-center gap-3">
        <Icon className={classNames("h-[22px] w-[22px]", iconClassName)} />
        <h2 className="text-[18px] font-bold leading-6 text-[#07142e]">
          {title}
        </h2>
      </div>
      <span className="text-[13px] font-semibold leading-5 text-[#075fef]">
        View All
      </span>
    </header>
  );
}

function GeneralQcCommonlyUsedRow({ item }: { item: GeneralQcRailItem }) {
  const Icon = item.Icon;

  return (
    <a
      className="grid min-h-[68px] grid-cols-[44px_minmax(0,1fr)_18px] items-center gap-3 px-5 transition hover:bg-[#f8fbff] focus-visible:outline-offset-[-3px]"
      href={`#${item.id}`}
    >
      <ProcessIcon Icon={Icon} accent={item.accent} size="small" />
      <span className="min-w-0">
        <span className="line-clamp-1 block text-[14px] font-bold leading-5 text-[#07142e]">
          {item.title}
        </span>
        <span className="line-clamp-1 block text-[13px] font-normal leading-[19px] text-[#56647d]">
          {item.description}
        </span>
      </span>
      <ChevronRight className="h-[18px] w-[18px] text-[#07142e]" />
    </a>
  );
}

function GeneralQcFieldTipRow({ tip }: { tip: GeneralQcTip }) {
  const Icon = tip.Icon;
  const accent = accentClasses[tip.accent];

  return (
    <div className="grid min-h-[86px] grid-cols-[3px_38px_minmax(0,1fr)] gap-3 px-5 py-3">
      <span className={classNames("my-1 rounded-full", accent.side)} />
      <span className="pt-1">
        <Icon className={classNames("h-[30px] w-[30px]", accent.text)} />
      </span>
      <span className="min-w-0">
        <span className="line-clamp-1 block text-[14px] font-bold leading-5 text-[#07142e]">
          {tip.title}
        </span>
        <span className="mt-1 line-clamp-2 block text-[13px] font-normal leading-[19px] text-[#56647d]">
          {tip.description}
        </span>
      </span>
    </div>
  );
}

function ProcessIcon({
  accent,
  Icon,
  size
}: {
  accent: GeneralQcAccent;
  Icon: LucideIcon;
  size: "large" | "small";
}) {
  const classes = accentClasses[accent];
  const dimensions =
    size === "large"
      ? {
          circle: "h-16 w-16",
          icon: "h-10 w-10"
        }
      : {
          circle: "h-11 w-11",
          icon: "h-7 w-7"
        };

  return (
    <span
      className={classNames(
        "flex shrink-0 items-center justify-center rounded-full",
        dimensions.circle,
        classes.circle
      )}
    >
      <Icon className={classNames(dimensions.icon, classes.text)} />
    </span>
  );
}
