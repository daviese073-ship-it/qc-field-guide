import type { ReactNode } from "react";

import type { LocalizedContent, LocalizedString } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";

type LocalizedValue = LocalizedString | LocalizedContent;
type LocalizedDensity = "short" | "long";

type LocalizedTextProps = {
  value: LocalizedValue;
  preference: LanguagePreference;
  density?: LocalizedDensity;
};

const getPrimaryLanguage = (preference: LanguagePreference): "en" | "fr" =>
  preference.mode === "bilingual" ? preference.bilingualPrimary : preference.mode;

const readLanguage = (value: LocalizedValue, language: "en" | "fr") =>
  language === "fr" ? value.fr ?? value.en : value.en;

const formatLocalizedText = (
  value: LocalizedValue,
  preference: LanguagePreference
) => {
  const primaryLanguage = getPrimaryLanguage(preference);
  const primary = readLanguage(value, primaryLanguage);
  const secondaryLanguage = primaryLanguage === "en" ? "fr" : "en";
  const secondary =
    preference.mode === "bilingual" && value[secondaryLanguage]
      ? value[secondaryLanguage]
      : undefined;

  return { primary, primaryLanguage, secondary, secondaryLanguage };
};

export function LocalizedText({
  density = "short",
  preference,
  value
}: LocalizedTextProps) {
  const formatted = formatLocalizedText(value, preference);

  if (!formatted.secondary) return <>{formatted.primary}</>;

  if (density === "short") {
    return (
      <>
        {formatted.primary} / {formatted.secondary}
      </>
    );
  }

  return (
    <span className="block">
      <span className="block">{formatted.primary}</span>
      <details className="mt-2 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium uppercase">
          {formatted.secondaryLanguage}
        </summary>
        <span className="mt-1 block">{formatted.secondary}</span>
      </details>
    </span>
  );
}

export type LocalizedTextNode = ReactNode;
