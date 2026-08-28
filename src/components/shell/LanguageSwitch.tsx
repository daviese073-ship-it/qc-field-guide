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
    <div
      aria-label={ariaLabel}
      className="flex h-10 w-[122px] rounded-[10px] border border-[rgba(15,23,42,0.10)] bg-white/80 p-1 shadow-sm"
      role="group"
    >
      {options.map((option) => {
        const active = samePreference(preference, option.preference);

        return (
          <button
            aria-pressed={active}
            className={classNames(
              "h-8 flex-1 rounded-[8px] px-2.5 text-[14px] font-bold transition focus-visible:outline-offset-2",
              active
                ? "bg-[#07142e] text-white shadow-sm"
                : "text-[#07142e] hover:bg-blue-50"
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
