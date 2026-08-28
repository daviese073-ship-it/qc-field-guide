import { BookOpenCheck, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { LanguageSwitch } from "./LanguageSwitch";

interface AppHeaderProps {
  appName: string;
  homeLabel: string;
  languageLabel: string;
  searchLabel: string;
}

export function AppHeader({
  appName,
  homeLabel,
  languageLabel,
  searchLabel
}: AppHeaderProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  return (
    <header className="qcfg-app-header sticky top-0 z-30 h-auto border-b text-slate-950 md:h-[53px]">
      <div className="flex h-full flex-col gap-2 px-4 py-2.5 md:flex-row md:items-center md:justify-center md:gap-5 md:px-8 md:py-0">
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
        <div className="flex shrink-0 flex-wrap items-center gap-3 md:absolute md:right-8">
          <LanguageSwitch ariaLabel={languageLabel} />
        </div>
      </div>
    </header>
  );
}
