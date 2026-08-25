import type { ReactNode } from "react";

import type { LocalizedContent, LocalizedString } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";
import {
  resolveLocalizedValue,
  type LocalizedDensity
} from "@/services/localization/localizationService";

type LocalizedValue = LocalizedString | LocalizedContent;

type LocalizedTextProps = {
  value: LocalizedValue;
  preference: LanguagePreference;
  density?: LocalizedDensity;
};

export function LocalizedText({
  density = "short",
  preference,
  value
}: LocalizedTextProps) {
  const formatted = resolveLocalizedValue(value, preference);

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
