import { ArrowRight, Clock3, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { LocalizedText } from "@/components/content/LocalizedText";
import type { LocalizedString, Section } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";
import { formatLocalizedValue } from "@/services/localization/localizationService";
import {
  getTopVisited,
  type VisitHistoryRecord
} from "@/services/storage/visitHistory";
import { classNames } from "@/utils/classNames";

import { getSectionVisual } from "../screenVisuals";

const homeCopy = {
  greeting: {
    en: "Hello",
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
  }
} satisfies Record<string, LocalizedString>;

const homeFieldTips = [
  {
    en: "When photographing a defect or non-conformance issue, place a standard reference object (like a tape measure or a coin) next to it to show the exact scale. Take one wide shot for site context and one close-up shot for detail.",
    fr: "Lorsque vous photographiez un défaut ou un problème de non-conformité, placez un objet de référence standard (comme un ruban à mesurer ou une pièce de monnaie) à côté de celui-ci pour indiquer l'échelle exacte. Prenez une photo large pour situer le contexte du site et une photo en gros plan pour les détails."
  },
  {
    en: "Never inspect finishes, coatings, or structural alignments in low-light or shadow conditions. Use portable task lighting to expose hidden surface imperfections, uneven jointing, or missed paint coats before signing off.",
    fr: "N'inspectez jamais les finitions, les revêtements ou les alignements structurels dans des conditions de faible luminosité ou d'ombre. Utilisez un éclairage d'appoint portatif pour exposer les imperfections de surface cachées, les joints inégaux ou les couches de peinture manquantes avant de valider les travaux."
  }
] satisfies readonly LocalizedString[];

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
  const recentlyVisitedSections = getTopVisited("section", 5);

  return (
    <div
      className="mx-auto grid w-full max-w-[1197px] gap-6 min-[1400px]:grid-cols-[minmax(0,873px)_300px]"
      data-testid="home-interface"
    >
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

          <ul
            className="grid gap-[18px] sm:grid-cols-2 min-[1440px]:grid-cols-3"
            data-testid="home-systems-grid"
          >
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
          actionHref="#home-inspection-systems"
          actionLabel="View All"
          icon={<Clock3 className="h-6 w-6" aria-hidden />}
          title={formatCopy(homeCopy.recentlyVisitedSystems, preference)}
        >
          <RecentSystemsList
            preference={preference}
            records={recentlyVisitedSections}
          />
        </HomeRailPanel>
        <HomeRailPanel
          icon={<Lightbulb className="h-6 w-6" aria-hidden />}
          title={formatCopy(homeCopy.fieldTips, preference)}
        >
          <HomeFieldTipsList preference={preference} />
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
  actionHref,
  actionLabel,
  children,
  icon,
  title
}: {
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
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
        {actionLabel && actionHref ? (
          <a
            className="shrink-0 text-[12px] font-semibold text-[#005cff] hover:underline"
            href={actionHref}
          >
            {actionLabel}
          </a>
        ) : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function RecentSystemsList({
  preference,
  records
}: {
  preference: LanguagePreference;
  records: readonly VisitHistoryRecord[];
}) {
  const visibleRecords = records
    .map((record) => ({
      record,
      section: productionRegistries.sections.getById(record.id)
    }))
    .filter((item): item is { record: VisitHistoryRecord; section: Section } =>
      Boolean(item.section)
    );

  if (!visibleRecords.length) {
    return (
      <EmptyRailState
        icon={<Clock3 className="h-7 w-7" aria-hidden />}
        text={formatCopy(homeCopy.recentsEmpty, preference)}
      />
    );
  }

  return (
    <ul className="space-y-2" data-testid="recently-visited-systems">
      {visibleRecords.map(({ record, section }) => (
        <li key={section.id}>
          <RecentSystemRow
            preference={preference}
            record={record}
            section={section}
          />
        </li>
      ))}
    </ul>
  );
}

function RecentSystemRow({
  preference,
  record,
  section
}: {
  preference: LanguagePreference;
  record: VisitHistoryRecord;
  section: Section;
}) {
  const visual = getSectionVisual(section.id);
  const Icon = visual.Icon;

  return (
    <Link
      className="grid min-h-[58px] grid-cols-[42px_minmax(0,1fr)_18px] items-center gap-3 rounded-[10px] border border-[rgba(15,23,42,0.10)] bg-white/80 px-3 py-2 text-[#07142e] shadow-[0_1px_3px_rgba(15,23,42,0.025)] transition hover:border-blue-200 hover:bg-blue-50/35 focus-visible:outline-offset-3"
      to={`/section/${encodeURIComponent(section.id)}`}
    >
      <span
        className={classNames(
          "flex h-9 w-9 items-center justify-center rounded-[9px]",
          visual.soft
        )}
      >
        <Icon className={classNames("h-5 w-5", visual.accent)} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-bold leading-5">
          {section.id.padStart(2, "0")}{" "}
          <LocalizedText preference={preference} value={section.title} />
        </span>
        <span className="block text-[11px] font-medium leading-4 text-[#64748b]">
          {formatVisitCount(record.count, preference)}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 text-[#075fef]" aria-hidden />
    </Link>
  );
}

function formatVisitCount(count: number, preference: LanguagePreference) {
  const french =
    preference.mode === "fr" ||
    (preference.mode === "bilingual" && preference.bilingualPrimary === "fr");

  if (french) return count === 1 ? "1 visite" : `${count} visites`;

  return count === 1 ? "1 visit" : `${count} visits`;
}

function HomeFieldTipsList({ preference }: { preference: LanguagePreference }) {
  return (
    <ul className="space-y-3" data-testid="home-field-tips">
      {homeFieldTips.map((tip) => (
        <li
          className="grid grid-cols-[4px_minmax(0,1fr)] gap-3 text-[13px] font-medium leading-[21px] text-[#24365f]"
          key={tip.en}
        >
          <span
            className="mt-1 h-full min-h-8 rounded-full bg-[#f7c931]"
            aria-hidden
          />
          <span>{formatCopy(tip, preference)}</span>
        </li>
      ))}
    </ul>
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
