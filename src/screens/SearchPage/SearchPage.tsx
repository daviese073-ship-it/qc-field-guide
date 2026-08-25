import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Filter,
  Layers,
  ClipboardList,
  Search,
  ShieldCheck,
  Workflow
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionSearchService } from "@/app/productionAppData";
import type { SearchableObjectType } from "@/domain/types/search";
import type { DerivedSearchResult } from "@/services/search";
import { classNames } from "@/utils/classNames";

import { objectTypeLabels } from "../screenLabels";
import { FieldLayout, RailPanel } from "../screenShared";

const languageOption = (
  mode: ReturnType<typeof useLanguagePreference>["preference"]["mode"]
) => (mode === "fr" ? "fr" : "all");

const resultIcons: Record<SearchableObjectType, LucideIcon> = {
  section: Layers,
  activity: ShieldCheck,
  workflow: Workflow,
  preConcealment: ClipboardCheck,
  gate: ShieldCheck,
  generalQcProcess: ClipboardList,
  term: FileText,
  acronym: FileText
};

const resultTone: Record<SearchableObjectType, string> = {
  section: "border-blue-200 bg-blue-50 text-blue-700",
  activity: "border-red-200 bg-red-50 text-red-700",
  workflow: "border-emerald-200 bg-emerald-50 text-emerald-700",
  preConcealment: "border-blue-200 bg-blue-50 text-blue-700",
  gate: "border-violet-200 bg-violet-50 text-violet-700",
  generalQcProcess: "border-cyan-200 bg-cyan-50 text-cyan-700",
  term: "border-purple-200 bg-purple-50 text-purple-700",
  acronym: "border-amber-200 bg-amber-50 text-amber-700"
};

const relatedSearches = [
  "firestopping",
  "pre-concealment",
  "test results",
  "penetration",
  "handover"
];

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { preference } = useLanguagePreference();
  const query = searchParams.get("q") ?? "";
  const [draftQuery, setDraftQuery] = useState(query);
  const trimmedQuery = query.trim();
  const results = useMemo(
    () =>
      trimmedQuery
        ? productionSearchService.search(trimmedQuery, {
            language: languageOption(preference.mode),
            limit: 30
          })
        : [],
    [preference.mode, trimmedQuery]
  );
  const countsByType = useMemo(
    () =>
      results.reduce(
        (counts, result) => {
          counts[result.objectType] = (counts[result.objectType] ?? 0) + 1;
          return counts;
        },
        {} as Partial<Record<SearchableObjectType, number>>
      ),
    [results]
  );

  return (
    <FieldLayout
      rail={
        <>
          <RailPanel title="Related Searches">
            <ul className="space-y-2 text-sm">
              {relatedSearches.map((term) => (
                <li key={term}>
                  <Link
                    className="flex items-center gap-2 text-slate-700 hover:text-blue-700"
                    to={`/search?q=${encodeURIComponent(term)}`}
                  >
                    <Search className="h-4 w-4" aria-hidden />
                    {term}
                  </Link>
                </li>
              ))}
            </ul>
          </RailPanel>
          <RailPanel title="Search Tip" tone="tip">
            <p className="text-sm leading-6 text-slate-700">
              Search by activity ID, term, acronym, workflow, or field phrase.
              Results always open canonical routes.
            </p>
          </RailPanel>
        </>
      }
    >
      <div className="space-y-5">
        <header>
          <h1 className="text-2xl font-bold text-slate-950">
            {trimmedQuery ? `Search Results for "${trimmedQuery}"` : "Search"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Field-navigation search across activities, terminology, workflows,
            gates, and pre-concealment checks.
          </p>
        </header>

        <form
          className="flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const nextQuery = draftQuery.trim();
            navigate(
              nextQuery
                ? `/search?q=${encodeURIComponent(nextQuery)}`
                : "/search"
            );
          }}
        >
          <Search className="h-5 w-5 text-slate-400" aria-hidden />
          <label className="sr-only" htmlFor="search-query">
            Search query
          </label>
          <input
            className="min-h-14 flex-1 bg-transparent px-3 text-base outline-none"
            id="search-query"
            onChange={(event) => setDraftQuery(event.currentTarget.value)}
            placeholder="Try firestop, calfeutrement, NCR, 10.3..."
            type="search"
            value={draftQuery}
          />
          <button
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white"
            type="submit"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <TypeChip active label={`All (${results.length})`} />
          {Object.entries(countsByType).map(([type, count]) => (
            <TypeChip
              key={type}
              label={`${objectTypeLabels[type as SearchableObjectType]} (${count})`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
          <Filter className="h-4 w-4 text-blue-700" aria-hidden />
          <span className="font-semibold text-slate-700">Filters</span>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
            Language: {preference.mode === "fr" ? "FR" : "EN"}
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
            Sort: relevance
          </span>
        </div>

        {!trimmedQuery ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
            Enter a query to navigate the production field guide. No result
            category is shown until it has a real match.
          </section>
        ) : null}

        {trimmedQuery && results.length === 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-950">No results</h2>
            <p className="mt-2 text-sm text-slate-700">
              No canonical destination matched this query. Try another term or
              browse systems from Home.
            </p>
          </section>
        ) : null}

        {results.length ? (
          <section
            aria-label="Search results"
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="divide-y divide-slate-100">
              {results.map((result) => (
                <SearchResultItem
                  key={`${result.objectType}:${result.objectId}`}
                  result={result}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </FieldLayout>
  );
}

function TypeChip({
  active = false,
  label
}: {
  active?: boolean;
  label: string;
}) {
  return (
    <span
      className={classNames(
        "rounded-lg border px-3 py-2 text-sm font-semibold",
        active
          ? "border-blue-700 bg-blue-700 text-white"
          : "border-slate-200 bg-white text-slate-700"
      )}
    >
      {label}
    </span>
  );
}

function SearchResultItem({ result }: { result: DerivedSearchResult }) {
  const Icon = resultIcons[result.objectType];
  const bestMatch = result.matches[0];

  return (
    <Link
      className="grid gap-4 px-4 py-4 transition hover:bg-blue-50/50 md:grid-cols-[72px_minmax(0,1fr)_220px_32px] md:items-center"
      to={resultHref(result)}
    >
      <span
        className={classNames(
          "flex h-14 w-14 items-center justify-center rounded-xl border",
          resultTone[result.objectType]
        )}
      >
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase text-blue-700">
          {objectTypeLabels[result.objectType]}
        </span>
        <span className="mt-1 block text-base font-bold text-slate-950">
          {result.objectId} {result.title.en}
        </span>
        {bestMatch ? (
          <span className="mt-1 line-clamp-2 block text-sm leading-5 text-slate-600">
            {bestMatch.text}
          </span>
        ) : null}
      </span>
      <span className="text-sm text-slate-600">
        <span className="block font-semibold text-slate-900">
          {objectTypeLabels[result.objectType]}
        </span>
        <span>Canonical destination</span>
      </span>
      <ArrowRight className="h-5 w-5 text-blue-700" aria-hidden />
    </Link>
  );
}

function resultHref(result: DerivedSearchResult) {
  switch (result.objectType) {
    case "section":
      return `/section/${encodeURIComponent(result.objectId)}`;
    case "activity":
      return `/activity/${encodeURIComponent(result.objectId)}`;
    case "workflow":
      return `/workflow/${encodeURIComponent(result.objectId)}`;
    case "preConcealment":
      return `/preconcealment/${encodeURIComponent(result.objectId)}`;
    case "gate":
      return `/gate/${encodeURIComponent(result.objectId)}`;
    case "generalQcProcess":
      return `/general-qc/${encodeURIComponent(result.objectId)}`;
    case "term":
    case "acronym":
      return `/term/${encodeURIComponent(result.objectId)}`;
  }
}
