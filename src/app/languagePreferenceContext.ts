import { createContext, useContext } from "react";

import type { LanguagePreference } from "@/services/localization/languagePreference";

export interface LanguagePreferenceContextValue {
  preference: LanguagePreference;
  setPreference: (preference: LanguagePreference) => void;
}

export const LanguagePreferenceContext =
  createContext<LanguagePreferenceContextValue | null>(null);

export function useLanguagePreference() {
  const context = useContext(LanguagePreferenceContext);

  if (!context) {
    throw new Error("useLanguagePreference must be used within AppProviders.");
  }

  return context;
}
