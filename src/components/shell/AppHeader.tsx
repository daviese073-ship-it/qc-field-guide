import {
  BookOpenCheck,
  Monitor,
  PanelLeftOpen,
  Search,
  Smartphone,
  Tablet
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useDeviceView } from "@/app/deviceViewContext";
import type { DeviceViewMode } from "@/services/deviceView/deviceViewPreference";
import { classNames } from "@/utils/classNames";

import { LanguageSwitch } from "./LanguageSwitch";

interface AppHeaderProps {
  appName: string;
  homeLabel: string;
  languageLabel: string;
  onToggleSidebar: () => void;
  searchLabel: string;
}

export function AppHeader({
  appName,
  homeLabel,
  languageLabel,
  onToggleSidebar,
  searchLabel
}: AppHeaderProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  return (
    <header className="qcfg-app-header sticky top-0 z-30 h-auto border-b text-slate-950 md:h-[53px]">
      <div className="flex h-full flex-col gap-2 px-4 py-2.5 md:flex-row md:items-center md:justify-center md:gap-5 md:px-8 md:py-0">
        <button
          aria-label="Toggle navigation"
          className="qcfg-sidebar-toggle flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-white/20 bg-white/12 text-white shadow-sm transition hover:bg-white/18 focus-visible:outline-offset-2 md:hidden"
          onClick={onToggleSidebar}
          type="button"
        >
          <PanelLeftOpen className="h-5 w-5" aria-hidden />
        </button>
        <Link
          aria-label={homeLabel}
          className="qcfg-touch-target flex shrink-0 items-center gap-3 rounded-xl pr-2 font-semibold focus-visible:outline-offset-4 md:hidden"
          to="/"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-white/80 shadow-sm">
            <BookOpenCheck
              className="h-6 w-6 text-[var(--qcfg-status-info)]"
              aria-hidden
            />
          </span>
          <span className="leading-tight">
            <span className="block text-[0.82rem] font-extrabold uppercase tracking-wide text-slate-950">
              {appName.toUpperCase()}
            </span>
            <span className="block text-xs font-semibold text-slate-600">
              Field Inspection • Quality Control • Learning
            </span>
          </span>
        </Link>
        <form
          className="qcfg-global-search-form flex h-10 w-full min-w-0 items-center rounded-[12px] border border-white/55 bg-white px-3.5 shadow-[0_3px_12px_rgba(5,12,28,0.14)] transition focus-within:border-white/80 focus-within:ring-2 focus-within:ring-white/30 md:w-[560px]"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = query.trim();
            navigate(
              trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search"
            );
          }}
        >
          <Search className="h-5 w-5 text-[#07142e]" aria-hidden />
          <label className="sr-only" htmlFor="global-search">
            {searchLabel}
          </label>
          <input
            className="qcfg-global-search-input min-h-9 flex-1 bg-transparent px-3 text-[14px] font-normal text-[#07142e] outline-none ring-0 placeholder:text-[#53627d] focus:outline-none focus:ring-0 focus-visible:outline-none"
            id="global-search"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search inspections, systems, topics..."
            type="search"
            value={query}
          />
        </form>
        <div className="qcfg-header-actions flex shrink-0 flex-wrap items-center gap-3 md:absolute md:right-8">
          <DeviceViewSwitch />
          <LanguageSwitch ariaLabel={languageLabel} />
        </div>
      </div>
    </header>
  );
}

const deviceOptions = [
  { Icon: Monitor, label: "Computer", mode: "computer" },
  { Icon: Tablet, label: "Tablet", mode: "tablet" },
  { Icon: Smartphone, label: "Mobile", mode: "mobile" }
] satisfies readonly {
  Icon: typeof Monitor;
  label: string;
  mode: DeviceViewMode;
}[];

function DeviceViewSwitch() {
  const { mode, setMode } = useDeviceView();

  return (
    <div
      aria-label="Device view"
      className="flex h-10 rounded-[10px] border border-[rgba(15,23,42,0.10)] bg-white/80 p-1 shadow-sm"
      role="group"
    >
      {deviceOptions.map((option) => {
        const active = option.mode === mode;
        const Icon = option.Icon;

        return (
          <button
            aria-label={`${option.label} view`}
            aria-pressed={active}
            className={classNames(
              "inline-flex h-8 min-w-9 items-center justify-center rounded-[8px] px-2 text-[12px] font-bold transition focus-visible:outline-offset-2",
              active
                ? "bg-[#07142e] text-white shadow-sm"
                : "text-[#07142e] hover:bg-blue-50"
            )}
            key={option.mode}
            onClick={() => setMode(option.mode)}
            title={`${option.label} view`}
            type="button"
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
