import { ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { LocalizedText } from "@/components/content/LocalizedText";
import { Badge } from "@/components/ui/Badge";
import { buildSectionScreenModel } from "@/services/screenContracts";
import { classNames } from "@/utils/classNames";

import {
  CompactTag,
  FieldLayout,
  LinkPill,
  MissingObject,
  PageHeader,
  RailPanel
} from "../screenShared";
import { formatLocalized } from "../screenLabels";
import { getSectionVisual } from "../screenVisuals";

export function SectionPage() {
  const { sectionId = "" } = useParams<{ sectionId: string }>();
  const { preference } = useLanguagePreference();
  const model = buildSectionScreenModel(productionRegistries, sectionId);
  const section = productionRegistries.sections.getById(sectionId);
  const sections = productionRegistries.sections.getAll();
  const currentIndex = sections.findIndex((item) => item.id === sectionId);
  const previousSection =
    currentIndex > 0 ? sections[currentIndex - 1] : undefined;
  const nextSection =
    currentIndex >= 0 && currentIndex < sections.length - 1
      ? sections[currentIndex + 1]
      : undefined;

  if (model.status === "notFound" || !section) {
    return <MissingObject objectId={sectionId} objectLabel="Section" />;
  }

  const visual = getSectionVisual(section.id);
  const Icon = visual.Icon;
  const workflowLinks = productionRegistries.workflows
    .getAll()
    .filter((workflow) =>
      workflow.activityIds?.some((activityId) =>
        model.activities.some((activity) => activity.id === activityId)
      )
    )
    .slice(0, 5);
  const activitiesWithInterfaces = model.activities
    .filter((activity) => activity.flags.includes("interfaceCritical"))
    .slice(0, 5);

  return (
    <FieldLayout
      rail={
        <>
          <RailPanel title="Section QC Focus">
            <p className="text-sm leading-6 text-slate-700">
              {section.description ? (
                <LocalizedText
                  preference={preference}
                  value={section.description}
                />
              ) : (
                "Use this system list to jump into the activity that matches the work being inspected."
              )}
            </p>
          </RailPanel>
          {workflowLinks.length ? (
            <RailPanel title="Related Workflows">
              <div className="space-y-2">
                {workflowLinks.map((workflow) => (
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
            </RailPanel>
          ) : null}
          {activitiesWithInterfaces.length ? (
            <RailPanel title="Key Interfaces">
              <ul className="space-y-2 text-sm">
                {activitiesWithInterfaces.map((activity) => (
                  <li key={activity.id}>
                    <Link
                      className="flex items-center justify-between gap-2 text-blue-700 hover:underline"
                      to={`/activity/${encodeURIComponent(activity.id)}`}
                    >
                      <span>
                        {activity.id}{" "}
                        <LocalizedText
                          preference={preference}
                          value={activity.title}
                        />
                      </span>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </RailPanel>
          ) : null}
          <RailPanel title="QC Tip" tone="tip">
            <p className="text-sm leading-6 text-slate-700">
              Scan for the work activity first, then use Quick mode for field
              execution. Open Full mode only when reference detail is needed.
            </p>
          </RailPanel>
        </>
      }
    >
      <div className="space-y-5">
        <PageHeader
          eyebrow="Home › Browse Systems"
          title={
            <span className="flex items-center gap-4">
              <span
                className={classNames(
                  "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl",
                  visual.soft
                )}
              >
                <Icon className={classNames("h-10 w-10", visual.accent)} />
              </span>
              <span>
                <span className="font-mono text-slate-500">
                  {section.id.padStart(2, "0")}
                </span>{" "}
                <LocalizedText preference={preference} value={section.title} />
              </span>
            </span>
          }
          description={
            section.description ? (
              <LocalizedText
                preference={preference}
                value={section.description}
              />
            ) : (
              "Activities in this section are loaded from the production canonical registry."
            )
          }
        >
          <Badge>{model.activities.length} activities in this section</Badge>
        </PageHeader>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Activities in this system
            </h2>
            <span className="text-xs text-slate-500">Recommended order</span>
          </div>
          <div className="divide-y divide-slate-100">
            {model.activities.map((activitySummary) => (
              <Link
                className="grid gap-3 px-4 py-3 transition hover:bg-blue-50/60 md:grid-cols-[72px_minmax(0,1.2fr)_180px_minmax(0,1fr)_32px] md:items-center"
                key={activitySummary.id}
                to={`/activity/${encodeURIComponent(activitySummary.id)}`}
              >
                <span className="inline-flex h-10 w-14 items-center justify-center rounded-lg bg-slate-100 font-mono text-sm font-bold text-slate-800">
                  {activitySummary.id}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-950">
                    <LocalizedText
                      preference={preference}
                      value={activitySummary.title}
                    />
                  </span>
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {activitySummary.flags.slice(0, 2).map((flag) => (
                    <CompactTag key={flag} tag={flag}>
                      {flag}
                    </CompactTag>
                  ))}
                </span>
                <span className="line-clamp-1 text-sm text-slate-600">
                  {activitySummary.purpose
                    ? formatLocalized(activitySummary.purpose, preference)
                    : "Open the activity for field inspection guidance."}
                </span>
                <ArrowRight className="h-5 w-5 text-blue-700" aria-hidden />
              </Link>
            ))}
          </div>
        </section>

        <nav className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm md:grid-cols-3">
          <div>
            {previousSection ? (
              <LinkPill
                target={{ objectType: "section", id: previousSection.id }}
              >
                ← {previousSection.id}{" "}
                <LocalizedText
                  preference={preference}
                  value={previousSection.title}
                />
              </LinkPill>
            ) : null}
          </div>
          <p className="text-center font-semibold text-blue-700">
            You are in {section.id.padStart(2, "0")}{" "}
            <LocalizedText preference={preference} value={section.title} />
          </p>
          <div className="text-right">
            {nextSection ? (
              <LinkPill target={{ objectType: "section", id: nextSection.id }}>
                {nextSection.id}{" "}
                <LocalizedText
                  preference={preference}
                  value={nextSection.title}
                />{" "}
                →
              </LinkPill>
            ) : null}
          </div>
        </nav>
      </div>
    </FieldLayout>
  );
}
