import { ArrowRight, Clock3, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { LocalizedText } from "@/components/content/LocalizedText";
import type { LocalizedString, Section } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";
import { formatLocalizedValue } from "@/services/localization/localizationService";
import { classNames } from "@/utils/classNames";

import { getSectionVisual } from "../screenVisuals";

const homeCopy = {
  greeting: {
    en: "Good morning",
    fr: "Bonjour"
  },
  orientation: {
    en: "What will you inspect today?",
    fr: "Qu'allez-vous inspecter aujourd'hui?"
  },
  inspectionSystems: {
    en: "Inspection Systems",
    fr: "Systemes d'inspection"
  },
  recentlyVisitedSystems: {
    en: "Recently Visited Systems",
    fr: "Systemes visites recemment"
  },
  recentsEmpty: {
    en: "Recent system history is not available yet. Open a system from the inspection grid to continue.",
    fr: "L'historique recent des systemes n'est pas encore disponible. Ouvrez un systeme depuis la grille d'inspection pour continuer."
  },
  fieldTips: {
    en: "Field Tips",
    fr: "Conseils de terrain"
  },
  fieldTipsEmpty: {
    en: "Field tips need an approved canonical content source before they can appear here.",
    fr: "Les conseils de terrain necessitent une source de contenu canonique approuvee avant d'apparaitre ici."
  }
} satisfies Record<string, LocalizedString>;

const formatCopy = (value: LocalizedString, preference: LanguagePreference) =>
  formatLocalizedValue(value, preference, "short");

const formatActivityCount = (count: number, preference: LanguagePreference) => {
  const label =
    preference.mode === "fr"
      ? count === 1
        ? "activite"
        : "activites"
      : count === 1
        ? "activity"
        : "activities";

  return `${count} ${label}`;
};

export function HomePage() {
  const { preference } = useLanguagePreference();
  const sections = productionRegistries.sections.getAll();

  return (
    <div className="mx-auto grid w-full max-w-[1197px] gap-6 min-[1400px]:grid-cols-[minmax(0,873px)_300px]">
      <div className="min-w-0">
        <header className="pt-4">
          <p className="text-[34px] font-bold leading-[42px] text-[#07142e]">
            {formatCopy(homeCopy.greeting, preference)}{" "}
            <span className="text-[34px]" aria-hidden>
              👋
            </span>
          </p>
          <h1 className="mt-1 text-[19px] font-medium leading-7 text-[#53627d]">
            {formatCopy(homeCopy.orientation, preference)}
          </h1>
        </header>

        <section
          aria-labelledby="home-inspection-systems"
          className="mt-6 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white p-4 shadow-[0_3px_10px_rgba(15,23,42,0.05)]"
        >
          <div className="mb-4 flex h-[48px] items-center justify-between gap-3">
            <h2
              className="text-[20px] font-bold leading-7 text-[#07142e]"
              id="home-inspection-systems"
            >
              {formatCopy(homeCopy.inspectionSystems, preference)}
            </h2>
            <a
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#005cff] hover:underline"
              href="#home-inspection-systems"
            >
              View All Systems
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>

          <ul className="grid gap-[18px] sm:grid-cols-2 min-[1440px]:grid-cols-3">
            {sections.map((section) => (
              <li key={section.id}>
                <HomeSystemCard section={section} preference={preference} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-5 min-[1400px]:pt-0">
        <HomeRailPanel
          actionLabel="View All"
          icon={<Clock3 className="h-6 w-6" aria-hidden />}
          title={formatCopy(homeCopy.recentlyVisitedSystems, preference)}
        >
          <EmptyRailState
            icon={<Clock3 className="h-7 w-7" aria-hidden />}
            text={formatCopy(homeCopy.recentsEmpty, preference)}
          />
        </HomeRailPanel>
        <HomeRailPanel
          actionLabel="View All"
          icon={<Lightbulb className="h-6 w-6" aria-hidden />}
          title={formatCopy(homeCopy.fieldTips, preference)}
        >
          <EmptyRailState
            icon={<Lightbulb className="h-7 w-7" aria-hidden />}
            text={formatCopy(homeCopy.fieldTipsEmpty, preference)}
          />
        </HomeRailPanel>
      </aside>
    </div>
  );
}

function HomeSystemCard({
  section,
  preference
}: {
  section: Section;
  preference: LanguagePreference;
}) {
  const visual = getSectionVisual(section.id);
  const Icon = visual.Icon;
  const activityCount = productionRegistries.activities.getActivitiesBySection(
    section.id
  ).length;

  return (
    <Link
      className={classNames(
        "qcfg-card-hover group flex h-[180px] flex-col justify-between rounded-[10px] border bg-white px-4 pb-4 pt-[18px] shadow-[0_2px_6px_rgba(15,23,42,0.04)] hover:no-underline focus-visible:outline-offset-4",
        visual.border
      )}
      to={`/section/${encodeURIComponent(section.id)}`}
    >
      <span
        className={classNames(
          "flex h-20 w-20 items-center justify-center rounded-full",
          visual.soft
        )}
      >
        <Icon className={classNames("h-12 w-12", visual.accent)} aria-hidden />
      </span>

      <span className="relative block pr-7">
        <span className="text-[16px] font-bold leading-[22px] text-[#07142e]">
          <LocalizedText preference={preference} value={section.title} />
        </span>
        <span className="mt-1 block text-[13px] font-medium leading-[18px] text-[#64748b]">
          <span>{formatActivityCount(activityCount, preference)}</span>
        </span>
        <ArrowRight
          className="absolute bottom-0 right-0 h-5 w-5 text-[#07142e] transition group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}

function HomeRailPanel({
  actionLabel,
  children,
  icon,
  title
}: {
  actionLabel: string;
  children: JSX.Element;
  icon: JSX.Element;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_3px_10px_rgba(15,23,42,0.05)]">
      <header className="flex h-[60px] items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.10)] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-[#07142e]">{icon}</span>
          <h2 className="text-[16px] font-bold leading-6 text-[#07142e]">
            {title}
          </h2>
        </div>
        <span className="shrink-0 text-[12px] font-semibold text-[#005cff]">
          {actionLabel}
        </span>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function EmptyRailState({ icon, text }: { icon: JSX.Element; text: string }) {
  return (
    <div className="min-h-[172px] rounded-[10px] border border-[rgba(15,23,42,0.10)] bg-white/75 p-4">
      <div className="mb-5 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-blue-50 text-[#005cff]">
        {icon}
      </div>
      <p className="text-[13px] leading-[21px] text-[#53627d]">{text}</p>
    </div>
  );
}
