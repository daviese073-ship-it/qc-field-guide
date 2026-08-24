import { BookOpenCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { LanguageSwitch } from "./LanguageSwitch";
import { SearchTrigger } from "./SearchTrigger";

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
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link
          aria-label={homeLabel}
          className="flex items-center gap-3 font-semibold"
          to="/"
        >
          <BookOpenCheck className="h-6 w-6 text-blue-700" aria-hidden />
          <span>{appName}</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <SearchTrigger label={searchLabel} />
          <LanguageSwitch ariaLabel={languageLabel} />
        </div>
      </div>
    </header>
  );
}
