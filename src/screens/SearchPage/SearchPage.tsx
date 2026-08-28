import {
  ArrowRight,
  BookOpenText,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Lightbulb,
  Network,
  Search,
  ShieldCheck,
  Workflow
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  productionRegistries,
  productionSearchService
} from "@/app/productionAppData";
import { useLanguagePreference } from "@/app/languagePreferenceContext";
import type { Section } from "@/domain/types";
import type { SearchableObjectType } from "@/domain/types/search";
import type { LanguagePreference } from "@/services/localization/languagePreference";
import type {
  DerivedSearchResult,
  SearchMatch
} from "@/services/search/searchTypes";
import { classNames } from "@/utils/classNames";

import { formatLocalized } from "../screenLabels";
import { getSectionVisual } from "../screenVisuals";

type TypeFilterKey =
  | "activity"
  | "section"
  | "workflow"
  | "preConcealment"
  | "gate"
  | "generalQcProcess"
  | "terminology";

type ResultGroupKind = "generalQc" | "section" | "reference";

interface ResultTypeOption {
  Icon: LucideIcon;
  key: TypeFilterKey;
  label: string;
  objectTypes: readonly SearchableObjectType[];
  tone: string;
}

interface SearchResultGroup {
  count: number;
  id: string;
  kind: ResultGroupKind;
  results: readonly DerivedSearchResult[];
  sectionId?: string;
  title: string;
}

const languageOption = (
  mode: ReturnType<typeof useLanguagePreference>["preference"]["mode"]
) => (mode === "fr" ? "fr" : "all");

const typeOptions: readonly ResultTypeOption[] = [
  {
    key: "activity",
    label: "Activities",
    objectTypes: ["activity"],
    Icon: ClipboardCheck,
    tone: "bg-blue-50 text-blue-700"
  },
  {
    key: "section",
    label: "Systems",
    objectTypes: ["section"],
    Icon: Network,
    tone: "bg-emerald-50 text-emerald-700"
  },
  {
    key: "workflow",
    label: "Workflows",
    objectTypes: ["workflow"],
    Icon: Workflow,
    tone: "bg-violet-50 text-violet-700"
  },
  {
    key: "preConcealment",
    label: "Pre-Concealment",
    objectTypes: ["preConcealment"],
    Icon: ShieldCheck,
    tone: "bg-orange-50 text-orange-700"
  },
  {
    key: "gate",
    label: "Gates",
    objectTypes: ["gate"],
    Icon: ShieldCheck,
    tone: "bg-red-50 text-red-700"
  },
  {
    key: "generalQcProcess",
    label: "General QC",
    objectTypes: ["generalQcProcess"],
    Icon: BookOpenText,
    tone: "bg-amber-50 text-amber-700"
  },
  {
    key: "terminology",
    label: "Terminology",
    objectTypes: ["term", "acronym"],
    Icon: FileText,
    tone: "bg-cyan-50 text-cyan-700"
  }
];

const allTypeKeys = typeOptions.map((option) => option.key);
const compactGroupLimit = 8;

const resultBadgeLabels: Record<SearchableObjectType, string> = {
  activity: "Activity",
  section: "System",
  workflow: "Inspection Workflow",
  preConcealment: "Pre-Concealment",
  gate: "Gate",
  generalQcProcess: "General QC Process",
  term: "Term",
  acronym: "Acronym"
};

const resultVisuals: Record<
  SearchableObjectType,
  {
    Icon: LucideIcon;
    badge: string;
    tile: string;
  }
> = {
  activity: {
    Icon: ClipboardCheck,
    badge: "bg-blue-50 text-blue-700",
    tile: "border-blue-100 bg-blue-50 text-blue-700"
  },
  section: {
    Icon: Network,
    badge: "bg-emerald-50 text-emerald-700",
    tile: "border-emerald-100 bg-emerald-50 text-emerald-700"
  },
  workflow: {
    Icon: Workflow,
    badge: "bg-violet-50 text-violet-700",
    tile: "border-violet-100 bg-violet-50 text-violet-700"
  },
  preConcealment: {
    Icon: ShieldCheck,
    badge: "bg-orange-50 text-orange-700",
    tile: "border-orange-100 bg-orange-50 text-orange-700"
  },
  gate: {
    Icon: ShieldCheck,
    badge: "bg-red-50 text-red-700",
    tile: "border-red-100 bg-red-50 text-red-700"
  },
  generalQcProcess: {
    Icon: BookOpenText,
    badge: "bg-amber-50 text-amber-700",
    tile: "border-amber-100 bg-amber-50 text-amber-700"
  },
  term: {
    Icon: FileText,
    badge: "bg-cyan-50 text-cyan-700",
    tile: "border-cyan-100 bg-cyan-50 text-cyan-700"
  },
  acronym: {
    Icon: FileText,
    badge: "bg-cyan-50 text-cyan-700",
    tile: "border-cyan-100 bg-cyan-50 text-cyan-700"
  }
};

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const { preference } = useLanguagePreference();
  const query = searchParams.get("q") ?? "";
  const trimmedQuery = query.trim();
  const [selectedTypes, setSelectedTypes] = useState<
    ReadonlySet<TypeFilterKey>
  >(() => new Set(allTypeKeys));
  const [selectedSections, setSelectedSections] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [fullyShownGroups, setFullyShownGroups] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const baseResults = useMemo(
    () =>
      trimmedQuery
        ? productionSearchService.search(trimmedQuery, {
            language: languageOption(preference.mode),
            limit: 80
          })
        : [],
    [preference.mode, trimmedQuery]
  );

  const typeCounts = useMemo(
    () => countByTypeOption(baseResults),
    [baseResults]
  );
  const sectionCounts = useMemo(
    () => countBySection(baseResults),
    [baseResults]
  );

  useEffect(() => {
    setSelectedTypes(new Set(allTypeKeys));
    setSelectedSections(new Set());
    setExpandedGroups(new Set());
    setFullyShownGroups(new Set());
  }, [trimmedQuery]);

  const filteredResults = useMemo(
    () =>
      baseResults.filter((result) => {
        const typeKey = getTypeFilterKey(result.objectType);
        if (!selectedTypes.has(typeKey)) return false;

        const sectionId = resolveResultSectionId(result);
        if (
          sectionId &&
          selectedSections.size > 0 &&
          !selectedSections.has(sectionId)
        ) {
          return false;
        }

        return true;
      }),
    [baseResults, selectedSections, selectedTypes]
  );

  const groups = useMemo(
    () => groupResults(filteredResults, preference),
    [filteredResults, preference]
  );

  const defaultExpandedGroupId = getDefaultExpandedGroupId(
    groups,
    filteredResults
  );

  useEffect(() => {
    if (!defaultExpandedGroupId) return;
    setExpandedGroups(new Set([defaultExpandedGroupId]));
  }, [defaultExpandedGroupId, trimmedQuery]);

  const effectiveExpandedGroups = useMemo(
    () =>
      expandedGroups.size > 0
        ? expandedGroups
        : new Set(defaultExpandedGroupId ? [defaultExpandedGroupId] : []),
    [defaultExpandedGroupId, expandedGroups]
  );

  const relatedSearches = useMemo(
    () => buildRelatedSearches(baseResults, trimmedQuery, preference),
    [baseResults, preference, trimmedQuery]
  );

  const resetFilters = () => {
    setSelectedTypes(new Set(allTypeKeys));
    setSelectedSections(new Set());
  };

  return (
    <article className="w-full max-w-[1290px]" data-testid="search-interface">
      <div className="flex items-start justify-between gap-4">
        <header className="min-w-0">
          <h1 className="text-[31px] font-bold leading-9 text-[#07142e]">
            Search Results
          </h1>
          <p className="mt-3 max-w-[760px] text-[14px] font-medium leading-5 text-[#24365f]">
            Field-navigation search across activities, terminology, workflows,
            gates, and pre-concealment checks.
          </p>
        </header>
      </div>

      <div className="mt-6 grid gap-[22px] min-[1100px]:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0" data-testid="search-main-column">
          <SearchSummary
            count={filteredResults.length}
            query={trimmedQuery}
            totalCount={baseResults.length}
          />

          <TypeChips
            counts={typeCounts}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
          />

          <SearchResultsBody
            expandedGroups={effectiveExpandedGroups}
            fullyShownGroups={fullyShownGroups}
            groups={groups}
            preference={preference}
            query={trimmedQuery}
            setExpandedGroups={setExpandedGroups}
            setFullyShownGroups={setFullyShownGroups}
          />
        </div>

        <SearchRail
          relatedSearches={relatedSearches}
          resetFilters={resetFilters}
          sectionCounts={sectionCounts}
          selectedSections={selectedSections}
          selectedTypes={selectedTypes}
          setSelectedSections={setSelectedSections}
          setSelectedTypes={setSelectedTypes}
          typeCounts={typeCounts}
        />
      </div>
    </article>
  );
}

function SearchSummary({
  count,
  query,
  totalCount
}: {
  count: number;
  query: string;
  totalCount: number;
}) {
  if (!query) {
    return (
      <p className="mt-6 text-[14px] font-semibold leading-5 text-[#24365f]">
        Search the QC Field Guide by activity, term, acronym, workflow, or field
        phrase.
      </p>
    );
  }

  return (
    <p className="mt-6 text-[14px] font-semibold leading-5 text-[#07142e]">
      {count} {count === 1 ? "result" : "results"} for{" "}
      <span className="text-blue-700">"{query}"</span>
      {count !== totalCount ? (
        <span className="font-medium text-[#52617d]">
          {" "}
          from {totalCount} matches
        </span>
      ) : null}
    </p>
  );
}

function TypeChips({
  counts,
  selectedTypes,
  setSelectedTypes
}: {
  counts: ReadonlyMap<TypeFilterKey, number>;
  selectedTypes: ReadonlySet<TypeFilterKey>;
  setSelectedTypes: (value: ReadonlySet<TypeFilterKey>) => void;
}) {
  const allSelected = selectedTypes.size === allTypeKeys.length;
  const total = allTypeKeys.reduce(
    (sum, key) => sum + (counts.get(key) ?? 0),
    0
  );

  return (
    <div className="mt-4 flex flex-wrap gap-2" data-testid="search-type-chips">
      <button
        aria-pressed={allSelected}
        className={chipClass(allSelected)}
        onClick={() => setSelectedTypes(new Set(allTypeKeys))}
        type="button"
      >
        All ({total})
      </button>
      {typeOptions.map((option) => {
        const count = counts.get(option.key) ?? 0;
        const active =
          selectedTypes.size === 1 && selectedTypes.has(option.key);

        return (
          <button
            aria-pressed={active}
            className={chipClass(active, count === 0)}
            disabled={count === 0}
            key={option.key}
            onClick={() => setSelectedTypes(new Set([option.key]))}
            type="button"
          >
            {option.label} ({count})
          </button>
        );
      })}
    </div>
  );
}

function SearchResultsBody({
  expandedGroups,
  fullyShownGroups,
  groups,
  preference,
  query,
  setExpandedGroups,
  setFullyShownGroups
}: {
  expandedGroups: ReadonlySet<string>;
  fullyShownGroups: ReadonlySet<string>;
  groups: readonly SearchResultGroup[];
  preference: LanguagePreference;
  query: string;
  setExpandedGroups: (value: ReadonlySet<string>) => void;
  setFullyShownGroups: (value: ReadonlySet<string>) => void;
}) {
  if (!query) {
    return (
      <section className="mt-5 rounded-[11px] border border-[rgba(15,23,42,0.12)] bg-white p-5 text-[14px] font-medium leading-6 text-[#24365f] shadow-[0_2px_6px_rgba(15,23,42,0.035)]">
        Enter a query to navigate canonical field guide destinations.
      </section>
    );
  }

  if (!groups.length) {
    return (
      <section className="mt-5 rounded-[11px] border border-[rgba(15,23,42,0.12)] bg-white p-5 shadow-[0_2px_6px_rgba(15,23,42,0.035)]">
        <h2 className="text-[16px] font-bold leading-6 text-[#07142e]">
          No results found
        </h2>
        <p className="mt-2 text-[14px] font-medium leading-6 text-[#24365f]">
          No canonical destination matched "{query}".
        </p>
      </section>
    );
  }

  return (
    <div className="mt-5 space-y-3" data-testid="search-result-groups">
      {groups.map((group) => {
        const expanded = expandedGroups.has(group.id);
        const fullyShown = fullyShownGroups.has(group.id);
        const visibleResults =
          expanded && !fullyShown
            ? group.results.slice(0, compactGroupLimit)
            : group.results;

        return (
          <SearchResultGroupCard
            expanded={expanded}
            fullyShown={fullyShown}
            group={group}
            key={group.id}
            preference={preference}
            setExpandedGroups={setExpandedGroups}
            setFullyShownGroups={setFullyShownGroups}
            visibleResults={visibleResults}
            expandedGroups={expandedGroups}
            fullyShownGroups={fullyShownGroups}
          />
        );
      })}
    </div>
  );
}

function SearchResultGroupCard({
  expanded,
  fullyShown,
  group,
  preference,
  setExpandedGroups,
  setFullyShownGroups,
  visibleResults,
  expandedGroups,
  fullyShownGroups
}: {
  expanded: boolean;
  expandedGroups: ReadonlySet<string>;
  fullyShown: boolean;
  fullyShownGroups: ReadonlySet<string>;
  group: SearchResultGroup;
  preference: LanguagePreference;
  setExpandedGroups: (value: ReadonlySet<string>) => void;
  setFullyShownGroups: (value: ReadonlySet<string>) => void;
  visibleResults: readonly DerivedSearchResult[];
}) {
  const sectionVisual = getSectionVisual(group.sectionId);
  const HeaderIcon =
    group.kind === "generalQc"
      ? BookOpenText
      : group.kind === "reference"
        ? FileText
        : sectionVisual.Icon;
  const iconClass =
    group.kind === "section"
      ? sectionVisual.accent
      : group.kind === "generalQc"
        ? "text-amber-700"
        : "text-cyan-700";
  const iconTileClass =
    group.kind === "section"
      ? sectionVisual.soft
      : group.kind === "generalQc"
        ? "bg-amber-50"
        : "bg-cyan-50";

  return (
    <section className="overflow-hidden rounded-[11px] border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.035)]">
      <button
        aria-expanded={expanded}
        className="grid min-h-[58px] w-full grid-cols-[44px_minmax(0,1fr)_auto_24px] items-center gap-3 border-b border-[rgba(148,163,184,0.22)] px-5 text-left"
        onClick={() => {
          const next = new Set(expandedGroups);
          if (expanded) {
            next.delete(group.id);
          } else {
            next.add(group.id);
          }
          setExpandedGroups(next);
        }}
        type="button"
      >
        <span
          className={classNames(
            "flex h-9 w-9 items-center justify-center rounded-[9px]",
            iconTileClass
          )}
        >
          <HeaderIcon className={classNames("h-5 w-5", iconClass)} />
        </span>
        <span className="min-w-0 text-[16px] font-bold uppercase leading-5 text-[#07142e]">
          {group.title}
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-semibold leading-4 text-emerald-700">
          {group.count} {group.count === 1 ? "result" : "results"}
        </span>
        {expanded ? (
          <ChevronDown className="h-5 w-5 text-[#52617d]" />
        ) : (
          <ChevronRight className="h-5 w-5 text-[#52617d]" />
        )}
      </button>

      {expanded ? (
        <>
          <div className="divide-y divide-[rgba(148,163,184,0.18)]">
            {visibleResults.map((result) => (
              <SearchResultRow
                key={`${result.objectType}:${result.objectId}`}
                preference={preference}
                result={result}
              />
            ))}
          </div>
          {!fullyShown && group.results.length > compactGroupLimit ? (
            <button
              className="flex min-h-[48px] items-center gap-2 px-6 text-[13px] font-bold leading-5 text-blue-700"
              onClick={() =>
                setFullyShownGroups(new Set([...fullyShownGroups, group.id]))
              }
              type="button"
            >
              View all {group.count} results <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function SearchResultRow({
  preference,
  result
}: {
  preference: LanguagePreference;
  result: DerivedSearchResult;
}) {
  const visual = resultVisuals[result.objectType];
  const Icon = visual.Icon;

  return (
    <Link
      className="grid min-h-[62px] grid-cols-[48px_minmax(0,1fr)_auto_24px] items-center gap-4 px-6 py-2 text-[#07142e] transition hover:bg-blue-50/35"
      data-testid="search-result-row"
      to={result.route}
    >
      <span
        className={classNames(
          "flex h-10 w-10 items-center justify-center rounded-[9px] border",
          visual.tile
        )}
      >
        <Icon className="h-[22px] w-[22px]" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-bold leading-5">
          {formatResultTitle(result, preference)}
        </span>
        <span className="mt-0.5 block truncate text-[12px] font-medium leading-4 text-[#52617d]">
          {getResultContext(result)}
        </span>
      </span>
      <span
        className={classNames(
          "rounded-[7px] px-2.5 py-1 text-[11px] font-semibold leading-4",
          visual.badge
        )}
      >
        {resultBadgeLabels[result.objectType]}
      </span>
      <ArrowRight className="h-5 w-5 text-blue-700" />
    </Link>
  );
}

function SearchRail({
  relatedSearches,
  resetFilters,
  sectionCounts,
  selectedSections,
  selectedTypes,
  setSelectedSections,
  setSelectedTypes,
  typeCounts
}: {
  relatedSearches: readonly string[];
  resetFilters: () => void;
  sectionCounts: readonly {
    count: number;
    section: Section;
  }[];
  selectedSections: ReadonlySet<string>;
  selectedTypes: ReadonlySet<TypeFilterKey>;
  setSelectedSections: (value: ReadonlySet<string>) => void;
  setSelectedTypes: (value: ReadonlySet<TypeFilterKey>) => void;
  typeCounts: ReadonlyMap<TypeFilterKey, number>;
}) {
  return (
    <aside
      className="space-y-4 min-[1100px]:sticky min-[1100px]:top-[92px] min-[1100px]:self-start"
      data-testid="search-right-rail"
    >
      <section className="rounded-[11px] border border-[rgba(15,23,42,0.12)] bg-white p-5 shadow-[0_2px_7px_rgba(15,23,42,0.035)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-[17px] font-bold leading-6 text-[#07142e]">
            Filters
          </h2>
          <button
            className="text-[13px] font-semibold leading-5 text-blue-700"
            onClick={resetFilters}
            type="button"
          >
            Clear all
          </button>
        </div>

        <FilterSection title="Result Type">
          {typeOptions.map((option) => (
            <FilterCheckbox
              checked={selectedTypes.has(option.key)}
              count={typeCounts.get(option.key) ?? 0}
              disabled={(typeCounts.get(option.key) ?? 0) === 0}
              Icon={option.Icon}
              iconClassName={option.tone}
              key={option.key}
              label={option.label}
              onChange={() => {
                const next = new Set(selectedTypes);
                if (next.has(option.key)) {
                  next.delete(option.key);
                } else {
                  next.add(option.key);
                }
                setSelectedTypes(next);
              }}
            />
          ))}
        </FilterSection>

        <FilterSection className="mt-5 border-t pt-4" title="Systems">
          {sectionCounts.length ? (
            sectionCounts.map(({ count, section }) => (
              <FilterCheckbox
                checked={
                  selectedSections.size === 0 ||
                  selectedSections.has(section.id)
                }
                count={count}
                key={section.id}
                label={formatLocalized(section.title, {
                  mode: "en"
                })}
                onChange={() => {
                  const next =
                    selectedSections.size === 0
                      ? new Set(sectionCounts.map((count) => count.section.id))
                      : new Set(selectedSections);
                  if (next.has(section.id)) {
                    next.delete(section.id);
                  } else {
                    next.add(section.id);
                  }
                  setSelectedSections(
                    next.size === sectionCounts.length ? new Set() : next
                  );
                }}
              />
            ))
          ) : (
            <p className="text-[13px] font-medium leading-5 text-[#64748b]">
              No system filters available.
            </p>
          )}
        </FilterSection>
      </section>

      <section className="rounded-[11px] border border-[rgba(15,23,42,0.12)] bg-white p-5 shadow-[0_2px_7px_rgba(15,23,42,0.035)]">
        <h2 className="mb-4 text-[13px] font-bold uppercase leading-5 text-[#07142e]">
          Related Searches
        </h2>
        {relatedSearches.length ? (
          <ul className="space-y-2">
            {relatedSearches.map((term) => (
              <li key={term}>
                <Link
                  className="flex min-h-[32px] items-center gap-3 text-[13px] font-medium leading-5 text-[#24365f] hover:text-blue-700"
                  to={`/search?q=${encodeURIComponent(term)}`}
                >
                  <Search className="h-4 w-4 shrink-0 text-[#52617d]" />
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] font-medium leading-5 text-[#64748b]">
            No related searches available.
          </p>
        )}
      </section>

      <section className="rounded-[11px] border border-emerald-200 bg-emerald-50/60 p-5 shadow-[0_2px_7px_rgba(15,23,42,0.035)]">
        <h2 className="mb-4 flex items-center gap-3 text-[13px] font-bold uppercase leading-5 text-[#07142e]">
          <Lightbulb className="h-5 w-5 text-emerald-700" />
          Search Tip
        </h2>
        <p className="text-[13px] font-medium leading-[22px] text-[#24365f]">
          Search by activity ID, term, acronym, workflow, or field phrase.
        </p>
        <p className="mt-2 text-[13px] font-medium leading-[22px] text-[#24365f]">
          Results always open canonical routes.
        </p>
      </section>
    </aside>
  );
}

function FilterSection({
  children,
  className,
  title
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <div className={classNames(className, "border-[rgba(148,163,184,0.24)]")}>
      <h3 className="mb-3 text-[12px] font-semibold uppercase leading-4 text-[#52617d]">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  checked,
  count,
  disabled = false,
  Icon,
  iconClassName,
  label,
  onChange
}: {
  checked: boolean;
  count: number;
  disabled?: boolean;
  Icon?: LucideIcon;
  iconClassName?: string;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={classNames(
        "flex min-h-[34px] items-center gap-3 text-[13px] font-medium leading-5 text-[#07142e]",
        disabled ? "opacity-55" : ""
      )}
    >
      <span
        className={classNames(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
          checked
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-transparent"
        )}
      >
        <Check className="h-3 w-3" />
      </span>
      <input
        checked={checked}
        className="sr-only"
        disabled={disabled}
        onChange={onChange}
        type="checkbox"
      />
      {Icon ? (
        <span
          className={classNames(
            "flex h-6 w-6 items-center justify-center rounded-md",
            iconClassName
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="font-bold">{count}</span>
    </label>
  );
}

function chipClass(active: boolean, disabled = false) {
  return classNames(
    "min-h-[38px] rounded-[8px] border px-4 text-[13px] font-semibold leading-5 transition",
    active
      ? "border-blue-600 bg-blue-600 text-white"
      : "border-[rgba(148,163,184,0.28)] bg-white text-[#24365f]",
    disabled ? "cursor-not-allowed opacity-50" : "hover:border-blue-300"
  );
}

function countByTypeOption(results: readonly DerivedSearchResult[]) {
  const counts = new Map<TypeFilterKey, number>();
  for (const option of typeOptions) counts.set(option.key, 0);

  for (const result of results) {
    const key = getTypeFilterKey(result.objectType);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function countBySection(results: readonly DerivedSearchResult[]) {
  const counts = new Map<string, number>();

  for (const result of results) {
    const sectionId = resolveResultSectionId(result);
    if (!sectionId) continue;
    counts.set(sectionId, (counts.get(sectionId) ?? 0) + 1);
  }

  return productionRegistries.sections
    .getAll()
    .map((section) => ({ section, count: counts.get(section.id) ?? 0 }))
    .filter((item) => item.count > 0);
}

function groupResults(
  results: readonly DerivedSearchResult[],
  preference: LanguagePreference
): readonly SearchResultGroup[] {
  const byGeneralQc: DerivedSearchResult[] = [];
  const bySection = new Map<string, DerivedSearchResult[]>();
  const reference: DerivedSearchResult[] = [];

  for (const result of results) {
    if (result.objectType === "generalQcProcess") {
      byGeneralQc.push(result);
      continue;
    }

    const sectionId = resolveResultSectionId(result);
    if (sectionId) {
      bySection.set(sectionId, [...(bySection.get(sectionId) ?? []), result]);
      continue;
    }

    reference.push(result);
  }

  const groups: SearchResultGroup[] = [];
  if (byGeneralQc.length) {
    groups.push({
      id: "general-qc",
      kind: "generalQc",
      title: "General QC Processes",
      count: byGeneralQc.length,
      results: byGeneralQc
    });
  }

  for (const section of productionRegistries.sections.getAll()) {
    const sectionResults = bySection.get(section.id);
    if (!sectionResults?.length) continue;
    groups.push({
      id: `section-${section.id}`,
      kind: "section",
      sectionId: section.id,
      title: `${section.id.padStart(2, "0")} ${formatLocalized(
        section.title,
        preference
      )}`,
      count: sectionResults.length,
      results: sectionResults
    });
  }

  if (reference.length) {
    groups.push({
      id: "reference",
      kind: "reference",
      title: "Other Reference Results",
      count: reference.length,
      results: reference
    });
  }

  return groups;
}

function resolveResultSectionId(result: DerivedSearchResult) {
  if (result.sectionId) return result.sectionId;
  if (result.objectType === "section") return result.objectId;
  if (result.activityId) {
    return productionRegistries.activities.getById(result.activityId)
      ?.sectionId;
  }

  switch (result.objectType) {
    case "activity":
      return productionRegistries.activities.getById(result.objectId)
        ?.sectionId;
    case "workflow":
      return firstSectionFromActivityIds(
        productionRegistries.workflows.getById(result.objectId)?.activityIds
      );
    case "preConcealment":
      return firstSectionFromActivityIds(
        productionRegistries.preConcealmentWorkflows.getById(result.objectId)
          ?.activityIds
      );
    case "gate": {
      const gate = productionRegistries.gates.getById(result.objectId);
      return firstSectionFromActivityIds([
        ...(gate?.prerequisiteActivityIds ?? []),
        ...(gate?.downstreamActivityIds ?? [])
      ]);
    }
    case "term":
      return firstSectionFromActivityIds(
        productionRegistries.terminology.getById(result.objectId)
          ?.relatedActivityIds
      );
    case "acronym":
      return firstSectionFromActivityIds(
        productionRegistries.acronyms.getById(result.objectId)
          ?.relatedActivityIds
      );
    case "generalQcProcess":
      return undefined;
  }
}

function getDefaultExpandedGroupId(
  groups: readonly SearchResultGroup[],
  results: readonly DerivedSearchResult[]
) {
  const topResult = results[0];
  if (!topResult) return groups[0]?.id;

  return (
    groups.find((group) =>
      group.results.some(
        (result) =>
          result.objectId === topResult.objectId &&
          result.objectType === topResult.objectType
      )
    )?.id ?? groups[0]?.id
  );
}

function firstSectionFromActivityIds(activityIds: readonly string[] = []) {
  for (const activityId of activityIds) {
    const sectionId =
      productionRegistries.activities.getById(activityId)?.sectionId;
    if (sectionId) return sectionId;
  }

  return undefined;
}

function getTypeFilterKey(type: SearchableObjectType): TypeFilterKey {
  if (type === "term" || type === "acronym") return "terminology";
  return type;
}

function buildRelatedSearches(
  results: readonly DerivedSearchResult[],
  query: string,
  preference: LanguagePreference
) {
  if (!query || !results.length) return [];
  const normalizedQuery = query.toLowerCase();
  const suggestions = new Set<string>();

  for (const result of results) {
    const title = formatResultTitle(result, preference, false);
    if (title && title.toLowerCase() !== normalizedQuery) {
      suggestions.add(title);
    }
    if (suggestions.size >= 5) break;
  }

  return [...suggestions];
}

function formatResultTitle(
  result: DerivedSearchResult,
  preference: LanguagePreference,
  includeId = true
) {
  const title = formatLocalized(result.title, preference);
  if (!includeId) return title;

  if (result.objectType === "activity") return `${result.objectId} ${title}`;
  if (result.objectType === "section") {
    return `${result.objectId.padStart(2, "0")} ${title}`;
  }

  return title;
}

function getResultContext(result: DerivedSearchResult) {
  const sectionId = resolveResultSectionId(result);
  if (sectionId) {
    const section = productionRegistries.sections.getById(sectionId);
    if (section) return section.title.en;
  }

  const match = result.matches[0];
  if (!match) return "Canonical destination";

  return matchContext(match);
}

function matchContext(match: SearchMatch) {
  switch (match.sourceFamily) {
    case "sectionTitle":
      return "System match";
    case "activityTitle":
      return "Activity title match";
    case "activityAlias":
      return "Activity alias match";
    case "activityKeyword":
      return "Keyword match";
    case "quickView":
      return "Match: Quick check";
    case "learnContent":
      return "Match: Learn content";
    case "activityContent":
      return "Match: Activity content";
    case "workflow":
      return "Inspection workflow";
    case "preConcealment":
      return "Pre-concealment check";
    case "gate":
      return "Gate guidance";
    case "generalQcProcess":
      return "General QC process";
    case "terminologyPreferred":
      return "Preferred terminology";
    case "terminologyAlias":
      return "Terminology alias";
    case "terminologyContent":
      return "Terminology context";
    case "acronym":
      return "Acronym match";
    case "relationship":
      return "Relationship metadata";
  }
}
