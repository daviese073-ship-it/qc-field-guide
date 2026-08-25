import type { LocalizedContent, LocalizedString } from "@/domain/types";

import type {
  BilingualPrimary,
  LanguagePreference
} from "./languagePreference";

export type LocalizedValue = LocalizedString | LocalizedContent;
export type LocalizedDensity = "short" | "long";
export type ResolvedLanguage = "en" | "fr";

export interface ResolvedLocalizedValue {
  primary: string;
  primaryLanguage: ResolvedLanguage;
  secondary?: string;
  secondaryLanguage?: ResolvedLanguage;
  usedFallback: boolean;
}

export const getPrimaryLanguage = (
  preference: LanguagePreference
): ResolvedLanguage =>
  preference.mode === "bilingual"
    ? preference.bilingualPrimary
    : preference.mode;

export const getSecondaryLanguage = (
  primaryLanguage: BilingualPrimary
): ResolvedLanguage => (primaryLanguage === "en" ? "fr" : "en");

const readLanguage = (
  value: LocalizedValue,
  language: ResolvedLanguage
): string | undefined => (language === "fr" ? value.fr : value.en);

export const resolveLocalizedValue = (
  value: LocalizedValue,
  preference: LanguagePreference
): ResolvedLocalizedValue => {
  const primaryLanguage = getPrimaryLanguage(preference);
  const primaryCandidate = readLanguage(value, primaryLanguage);
  const primary = primaryCandidate ?? value.en;
  const usedFallback = primaryLanguage === "fr" && !primaryCandidate;
  const secondaryLanguage = getSecondaryLanguage(primaryLanguage);
  const secondaryCandidate =
    preference.mode === "bilingual"
      ? readLanguage(value, secondaryLanguage)
      : undefined;
  const secondary =
    secondaryCandidate && secondaryCandidate !== primary
      ? secondaryCandidate
      : undefined;

  return {
    primary,
    primaryLanguage,
    secondary,
    secondaryLanguage: secondary ? secondaryLanguage : undefined,
    usedFallback
  };
};

export const formatLocalizedValue = (
  value: LocalizedValue,
  preference: LanguagePreference,
  density: LocalizedDensity = "short"
): string => {
  const resolved = resolveLocalizedValue(value, preference);

  if (!resolved.secondary) return resolved.primary;

  return density === "short"
    ? `${resolved.primary} / ${resolved.secondary}`
    : `${resolved.primary}\n${resolved.secondary}`;
};
