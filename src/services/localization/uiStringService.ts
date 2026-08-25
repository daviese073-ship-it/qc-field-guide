import type { CanonicalRegistries } from "@/domain/registries";
import type { UiString } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";

import {
  formatLocalizedValue,
  resolveLocalizedValue,
  type LocalizedDensity,
  type ResolvedLocalizedValue
} from "./localizationService";

export interface UiStringService {
  getUiString(id: string): UiString | undefined;
  resolveUiString(
    id: string,
    preference: LanguagePreference
  ): ResolvedLocalizedValue | undefined;
  formatUiString(
    id: string,
    preference: LanguagePreference,
    density?: LocalizedDensity
  ): string | undefined;
}

export const createUiStringService = (
  registries: CanonicalRegistries
): UiStringService =>
  Object.freeze({
    getUiString: (id: string) => registries.uiStrings.getById(id),
    resolveUiString: (id: string, preference: LanguagePreference) => {
      const uiString = registries.uiStrings.getById(id);

      return uiString ? resolveLocalizedValue(uiString, preference) : undefined;
    },
    formatUiString: (
      id: string,
      preference: LanguagePreference,
      density: LocalizedDensity = "short"
    ) => {
      const uiString = registries.uiStrings.getById(id);

      return uiString
        ? formatLocalizedValue(uiString, preference, density)
        : undefined;
    }
  });
