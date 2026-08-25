import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Search,
  ShieldAlert,
  Wrench
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import {
  productionDataset,
  productionRegistries
} from "@/app/productionAppData";
import { LocalizedText } from "@/components/content/LocalizedText";
import { Badge } from "@/components/ui/Badge";
import { buildHomeScreenModel } from "@/services/screenContracts";
import { classNames } from "@/utils/classNames";

import { FieldLayout, LinkPill, RailPanel } from "../screenShared";
import { getSectionVisual } from "../screenVisuals";

const entryCards = [
  {
    title: "Quick Inspection",
    description: "Find an activity and go straight to checklist mode.",
    href: "/search?q=inspection",
    Icon: CheckCircle2,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700"
  },
  {
    title: "What Are You Doing?",
    description: "Start from the work in front of you.",
    href: "/search?q=workflow",
    Icon: Wrench,
    tone: "border-blue-200 bg-blue-50 text-blue-700"
  },
  {
    title: "Before Closing / Covering",
    description: "Open pre-concealment checks before work disappears.",
    href: "/preconcealment/PC-FIRE-01",
    Icon: ShieldAlert,
    tone: "border-amber-200 bg-amber-50 text-amber-700"
  },
  {
    title: "QC Think",
    description: "Use field prompts to reason through risk and evidence.",
    href: "/search?q=quality%20checkpoint",
    Icon: Brain,
    tone: "border-violet-200 bg-violet-50 text-violet-700"
  }
];

export function HomePage() {
  const navigate = useNavigate();
  const { preference } = useLanguagePreference();
  const [query, setQuery] = useState("");
  const model = buildHomeScreenModel(productionRegistries);
  const sections = productionRegistries.sections.getAll();
  const workflows = productionRegistries.workflows.getAll();
  const preConcealment = productionRegistries.preConcealmentWorkflows.getAll();

  return (
    <FieldLayout
      rail={
        <>
          <RailPanel title="QC Principles">
            <ul className="space-y-3 text-sm text-slate-700">
              <li>Right work, built right.</li>
              <li>Conformance to requirements.</li>
              <li>Evidence while work is visible.</li>
              <li>Think ahead before concealment.</li>
            </ul>
          </RailPanel>
          <RailPanel title="System Status">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Sections</dt>
                <dd className="font-semibold">{sections.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Activities</dt>
                <dd className="font-semibold">
                  {productionRegistries.activities.getAll().length}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Content</dt>
                <dd className="font-mono text-blue-700">
                  {productionDataset.version.contentVersion}
                </dd>
              </div>
            </dl>
          </RailPanel>
          <RailPanel title="Tip of the Day" tone="tip">
            <p className="text-sm leading-6 text-slate-700">
              Verify before it is hidden. Document while it is visible. Project
              requirements remain authoritative.
            </p>
          </RailPanel>
        </>
      }
    >
      <div className="space-y-5">
        <form
          className="flex items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = query.trim();
            navigate(
              trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search"
            );
          }}
        >
          <Search className="h-6 w-6 text-slate-400" aria-hidden />
          <label className="sr-only" htmlFor="home-search">
            Search field guide
          </label>
          <input
            className="min-h-16 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-slate-400"
            id="home-search"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search activity, term, acronym, workflow..."
            type="search"
            value={query}
          />
          <button
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white"
            type="submit"
          >
            Search
          </button>
        </form>

        <section className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {entryCards.map(({ description, href, Icon, title, tone }) => (
            <Link
              className={classNames(
                "group rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                tone
              )}
              key={title}
              to={href}
            >
              <div className="flex min-h-28 items-start justify-between gap-4">
                <Icon className="h-10 w-10 shrink-0" aria-hidden />
                <ArrowRight
                  className="mt-auto h-5 w-5 transition group-hover:translate-x-1"
                  aria-hidden
                />
              </div>
              <h2 className="mt-3 text-sm font-bold uppercase tracking-wide text-slate-900">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-5 text-slate-700">
                {description}
              </p>
            </Link>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Browse Systems
            </h2>
            <Badge>
              {model.visibleSections.includes("workflows")
                ? "Production data"
                : "Systems"}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {sections.map((section) => {
              const visual = getSectionVisual(section.id);
              const Icon = visual.Icon;
              const activityCount =
                productionRegistries.activities.getActivitiesBySection(
                  section.id
                ).length;

              return (
                <Link
                  className={classNames(
                    "group rounded-xl border bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md",
                    visual.border
                  )}
                  key={section.id}
                  to={`/section/${encodeURIComponent(section.id)}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={classNames(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        visual.soft
                      )}
                    >
                      <Icon
                        className={classNames("h-7 w-7", visual.accent)}
                        aria-hidden
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-slate-500">
                        {section.id.padStart(2, "0")}
                      </p>
                      <h3 className="truncate text-sm font-bold uppercase text-slate-950">
                        <LocalizedText
                          preference={preference}
                          value={section.title}
                        />
                      </h3>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge>{activityCount} activities</Badge>
                    <ArrowRight
                      className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Activity Mode / Workflows
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {workflows.map((workflow) => (
                <LinkPill
                  key={workflow.id}
                  target={{ objectType: "workflow", id: workflow.id }}
                >
                  <LocalizedText
                    preference={preference}
                    value={workflow.title}
                  />
                </LinkPill>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Before Closing / Covering
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {preConcealment.map((workflow) => (
                <LinkPill
                  key={workflow.id}
                  target={{ objectType: "preConcealment", id: workflow.id }}
                >
                  <LocalizedText
                    preference={preference}
                    value={workflow.title}
                  />
                </LinkPill>
              ))}
            </div>
          </div>
        </section>
      </div>
    </FieldLayout>
  );
}
