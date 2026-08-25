import { type PropsWithChildren, useMemo, useState } from "react";

import {
  defaultLanguagePreference,
  getLanguagePreference,
  setLanguagePreference,
  type LanguagePreference
} from "@/services/localization/languagePreference";

import {
  LanguagePreferenceContext,
  type LanguagePreferenceContextValue
} from "./languagePreferenceContext";

export function AppProviders({ children }: PropsWithChildren) {
  const [preference, updatePreference] = useState<LanguagePreference>(() =>
    typeof window === "undefined"
      ? defaultLanguagePreference
      : getLanguagePreference()
  );

  const value = useMemo<LanguagePreferenceContextValue>(
    () => ({
      preference,
      setPreference: (nextPreference) => {
        setLanguagePreference(nextPreference);
        updatePreference(nextPreference);
      }
    }),
    [preference]
  );

  return (
    <LanguagePreferenceContext.Provider value={value}>
      {children}
    </LanguagePreferenceContext.Provider>
  );
}
