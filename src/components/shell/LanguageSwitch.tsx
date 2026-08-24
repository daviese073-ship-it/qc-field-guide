import { useState } from "react";

import {
  defaultLanguagePreference,
  getLanguagePreference,
  setLanguagePreference,
  type LanguagePreference
} from "@/services/localization/languagePreference";
import { classNames } from "@/utils/classNames";

const options = [
  { label: "EN", preference: { mode: "en" } },
  {
    label: "EN/FR",
    preference: { mode: "bilingual", bilingualPrimary: "en" }
  },
  { label: "FR", preference: { mode: "fr" } }
] satisfies readonly { label: string; preference: LanguagePreference }[];

const samePreference = (
  left: LanguagePreference,
  right: LanguagePreference
) =>
  left.mode === right.mode &&
  (left.mode !== "bilingual" ||
    (right.mode === "bilingual" &&
      left.bilingualPrimary === right.bilingualPrimary));

interface LanguageSwitchProps {
  ariaLabel: string;
}

export function LanguageSwitch({ ariaLabel }: LanguageSwitchProps) {
  const [preference, setPreference] = useState<LanguagePreference>(() =>
    typeof window === "undefined"
      ? defaultLanguagePreference
      : getLanguagePreference()
  );

  const updatePreference = (nextPreference: LanguagePreference) => {
    setLanguagePreference(nextPreference);
    setPreference(nextPreference);
  };

  return (
    <div aria-label={ariaLabel} className="flex gap-1" role="group">
      {options.map((option) => {
        const active = samePreference(preference, option.preference);

        return (
          <button
            aria-pressed={active}
            className={classNames(
              "min-h-10 rounded px-3 py-2 text-sm font-semibold transition",
              active
                ? "bg-blue-700 text-white"
                : "text-slate-700 hover:bg-slate-100"
            )}
            key={option.label}
            onClick={() => updatePreference(option.preference)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
