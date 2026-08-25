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
    <header className="sticky top-0 z-30 h-auto border-b border-slate-800 bg-slate-950 text-white shadow-lg shadow-slate-950/10 lg:h-[68px]">
      <div className="flex h-full flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:gap-5 lg:px-6">
        <Link
          aria-label={homeLabel}
          className="flex shrink-0 items-center gap-3 font-semibold"
          to="/"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/40 bg-slate-900">
            <BookOpenCheck className="h-6 w-6 text-sky-300" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold uppercase tracking-wide">
              {appName}
            </span>
            <span className="block text-xs font-medium text-sky-200">
              Field Inspection • Quality Control • Learning
            </span>
          </span>
        </Link>
        <form
          className="flex min-w-0 flex-1 items-center rounded-xl border border-slate-700 bg-slate-900/90 px-3 shadow-inner shadow-slate-950/30 focus-within:border-sky-400"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = query.trim();
            navigate(
              trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search"
            );
          }}
        >
          <Search className="h-5 w-5 text-slate-400" aria-hidden />
          <label className="sr-only" htmlFor="global-search">
            {searchLabel}
          </label>
          <input
            className="min-h-11 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-400"
            id="global-search"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search activity, term, acronym, workflow..."
            type="search"
            value={query}
          />
        </form>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <LanguageSwitch ariaLabel={languageLabel} />
        </div>
      </div>
    </header>
  );
}
