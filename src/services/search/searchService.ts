import type { SearchableObjectType } from "@/domain/types/search";

import { normalizeSearchText } from "./normalize";
import type {
  DerivedSearchEntry,
  DerivedSearchIndex,
  DerivedSearchMatchType,
  DerivedSearchResult,
  SearchMatch,
  SearchOptions
} from "./searchTypes";

const matchWeights: Record<DerivedSearchMatchType, number> = {
  exactObjectId: 240,
  exactAcronym: 220,
  exactTitle: 210,
  exactPreferredTerm: 205,
  exactAlias: 190,
  exactPhrase: 150,
  titlePrefix: 125,
  allTokens: 95,
  partialTokens: 28
};

const objectTypePriority: Record<SearchableObjectType, number> = {
  activity: 1,
  term: 2,
  acronym: 3,
  workflow: 4,
  preConcealment: 5,
  gate: 6,
  section: 7
};

const sourceFamilyMatchType: Partial<
  Record<DerivedSearchEntry["sourceFamily"], DerivedSearchMatchType>
> = {
  activityTitle: "exactTitle",
  sectionTitle: "exactTitle",
  workflow: "exactTitle",
  preConcealment: "exactTitle",
  gate: "exactTitle",
  terminologyPreferred: "exactPreferredTerm",
  terminologyAlias: "exactAlias",
  activityAlias: "exactAlias",
  acronym: "exactAcronym"
};

interface EntryMatch {
  matchType: DerivedSearchMatchType;
  score: number;
}

const scoreEntry = (
  entry: DerivedSearchEntry,
  query: ReturnType<typeof normalizeSearchText>
): EntryMatch | undefined => {
  if (query.normalized.length === 0) return undefined;

  const objectId = normalizeSearchText(entry.objectId);
  const tokenHits = query.tokenVariants.filter((token) =>
    entry.tokenVariants.includes(token)
  ).length;
  const tokenRatio =
    query.tokenVariants.length > 0 ? tokenHits / query.tokenVariants.length : 0;
  const exactText =
    entry.normalizedText === query.normalized ||
    entry.compactText === query.compact;
  const exactId =
    objectId.normalized === query.normalized || objectId.compact === query.compact;

  if (exactId) {
    return {
      matchType: "exactObjectId",
      score: entry.baseWeight + matchWeights.exactObjectId
    };
  }

  if (exactText) {
    const matchType = sourceFamilyMatchType[entry.sourceFamily] ?? "exactPhrase";

    return {
      matchType,
      score: entry.baseWeight + matchWeights[matchType]
    };
  }

  if (
    entry.sourceFamily === "activityTitle" &&
    (entry.normalizedText.startsWith(query.normalized) ||
      entry.compactText.startsWith(query.compact))
  ) {
    return {
      matchType: "titlePrefix",
      score: entry.baseWeight + matchWeights.titlePrefix
    };
  }

  if (
    query.normalized.length >= 3 &&
    (entry.normalizedText.includes(query.normalized) ||
      entry.compactText.includes(query.compact))
  ) {
    return {
      matchType: "exactPhrase",
      score: entry.baseWeight + matchWeights.exactPhrase
    };
  }

  if (query.tokenVariants.length > 0 && tokenRatio === 1) {
    return {
      matchType: "allTokens",
      score:
        entry.baseWeight +
        matchWeights.allTokens +
        Math.min(query.tokenVariants.length, 8)
    };
  }

  if (tokenHits > 0 && query.tokenVariants.length > 1) {
    return {
      matchType: "partialTokens",
      score:
        entry.baseWeight +
        matchWeights.partialTokens +
        Math.round(tokenRatio * 30)
    };
  }

  return undefined;
};

const compareMatches = (left: SearchMatch, right: SearchMatch) =>
  right.score - left.score ||
  left.matchType.localeCompare(right.matchType) ||
  left.sourceFamily.localeCompare(right.sourceFamily) ||
  left.sourceId.localeCompare(right.sourceId) ||
  left.entryId.localeCompare(right.entryId);

const compareResults = (
  left: DerivedSearchResult,
  right: DerivedSearchResult
) =>
  right.score - left.score ||
  objectTypePriority[left.objectType] - objectTypePriority[right.objectType] ||
  left.title.en.localeCompare(right.title.en) ||
  left.objectId.localeCompare(right.objectId);

export const searchDerivedIndex = (
  index: DerivedSearchIndex,
  queryText: string,
  options: SearchOptions = {}
): readonly DerivedSearchResult[] => {
  const query = normalizeSearchText(queryText);
  const language = options.language ?? "all";
  const maxMatchesPerResult = options.maxMatchesPerResult ?? 4;

  if (query.normalized.length === 0) return [];

  const byDestination = new Map<string, DerivedSearchResult>();

  for (const entry of index.entries) {
    if (language !== "all" && entry.language !== language) continue;

    const match = scoreEntry(entry, query);
    if (!match) continue;

    const key = `${entry.objectType}:${entry.objectId}`;
    const existing = byDestination.get(key);
    const searchMatch: SearchMatch = {
      entryId: entry.id,
      sourceFamily: entry.sourceFamily,
      sourceId: entry.sourceId,
      language: entry.language,
      matchType: match.matchType,
      score: match.score,
      text: entry.text
    };

    if (!existing) {
      byDestination.set(key, {
        objectId: entry.objectId,
        objectType: entry.objectType,
        route: entry.route,
        title: entry.title,
        score: match.score,
        matchType: match.matchType,
        matches: [searchMatch],
        sectionId: entry.sectionId,
        activityId: entry.activityId
      });
      continue;
    }

    const matches = [...existing.matches, searchMatch]
      .sort(compareMatches)
      .slice(0, maxMatchesPerResult);
    const bestMatch = matches[0];

    byDestination.set(key, {
      ...existing,
      score: Math.max(existing.score, match.score),
      matchType: bestMatch.matchType,
      matches
    });
  }

  return [...byDestination.values()]
    .sort(compareResults)
    .slice(0, options.limit ?? 25);
};

export const createSearchService = (index: DerivedSearchIndex) =>
  Object.freeze({
    search: (query: string, options?: SearchOptions) =>
      searchDerivedIndex(index, query, options)
  });

export type SearchService = ReturnType<typeof createSearchService>;
