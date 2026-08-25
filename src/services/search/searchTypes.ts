import type { SearchableObjectType } from "@/domain/types";
import type { SourceReference } from "@/domain/types/content";
import type { TranslationStatus } from "@/domain/types/localization";

export type SearchLanguage = "en" | "fr";

export type DerivedSearchSourceFamily =
  | "sectionTitle"
  | "activityTitle"
  | "activityAlias"
  | "activityKeyword"
  | "activityContent"
  | "quickView"
  | "learnContent"
  | "workflow"
  | "preConcealment"
  | "gate"
  | "terminologyPreferred"
  | "terminologyAlias"
  | "terminologyContent"
  | "acronym"
  | "relationship";

export type DerivedSearchMatchType =
  | "exactObjectId"
  | "exactAcronym"
  | "exactTitle"
  | "exactPreferredTerm"
  | "exactAlias"
  | "exactPhrase"
  | "titlePrefix"
  | "allTokens"
  | "partialTokens";

export interface DerivedSearchEntry {
  id: string;
  objectId: string;
  objectType: SearchableObjectType;
  route: string;
  sourceFamily: DerivedSearchSourceFamily;
  sourceId: string;
  language: SearchLanguage;
  text: string;
  normalizedText: string;
  compactText: string;
  tokens: readonly string[];
  tokenVariants: readonly string[];
  title: {
    en: string;
    fr?: string;
  };
  sectionId?: string;
  activityId?: string;
  baseWeight: number;
  sourceRef?: SourceReference;
  translationStatus?: TranslationStatus;
}

export interface DerivedSearchIndex {
  generatedBy: "derived-search-index";
  entryCount: number;
  entries: readonly DerivedSearchEntry[];
}

export interface SearchMatch {
  entryId: string;
  sourceFamily: DerivedSearchSourceFamily;
  sourceId: string;
  language: SearchLanguage;
  matchType: DerivedSearchMatchType;
  score: number;
  text: string;
}

export interface DerivedSearchResult {
  objectId: string;
  objectType: SearchableObjectType;
  route: string;
  title: {
    en: string;
    fr?: string;
  };
  score: number;
  matchType: DerivedSearchMatchType;
  matches: readonly SearchMatch[];
  sectionId?: string;
  activityId?: string;
}

export interface SearchOptions {
  language?: SearchLanguage | "all";
  limit?: number;
  maxMatchesPerResult?: number;
}
