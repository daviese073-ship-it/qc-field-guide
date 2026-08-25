import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { type LanguagePreference } from "@/services/localization/languagePreference";
import { classNames } from "@/utils/classNames";

const options = [
  { label: "EN", preference: { mode: "en" } },
  { label: "FR", preference: { mode: "fr" } }
] satisfies readonly { label: string; preference: LanguagePreference }[];

const samePreference = (left: LanguagePreference, right: LanguagePreference) =>
  left.mode === right.mode &&
  (left.mode !== "bilingual" ||
    (right.mode === "bilingual" &&
      left.bilingualPrimary === right.bilingualPrimary));

interface LanguageSwitchProps {
  ariaLabel: string;
}

export function LanguageSwitch({ ariaLabel }: LanguageSwitchProps) {
  const { preference, setPreference } = useLanguagePreference();

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
                ? "bg-sky-400 text-slate-950"
                : "text-slate-100 hover:bg-slate-800"
            )}
            key={option.label}
            onClick={() => setPreference(option.preference)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
