import { FileText, Languages } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { LocalizedText } from "@/components/content/LocalizedText";
import { Badge } from "@/components/ui/Badge";
import { buildTerminologyScreenModel } from "@/services/screenContracts";

import {
  ActivityList,
  FieldLayout,
  LinkPill,
  LocalizedBlock,
  MissingObject,
  Panel,
  RailPanel
} from "../screenShared";

export function TerminologyPage() {
  const { conceptId = "" } = useParams<{ conceptId: string }>();
  const { preference } = useLanguagePreference();
  const model = buildTerminologyScreenModel(productionRegistries, conceptId);

  if (model.status === "notFound") {
    return <MissingObject objectId={conceptId} objectLabel="Term" />;
  }

  if (model.concept) {
    const concept = model.concept;

    return (
      <FieldLayout
        rail={
          <>
            <RailPanel title="Related Items">
              <ActivityList
                activities={model.relatedActivities.slice(0, 6)}
                compact
                preference={preference}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {model.relatedConcepts.map((relatedConcept) => (
                  <LinkPill
                    key={relatedConcept.id}
                    target={{ objectType: "term", id: relatedConcept.id }}
                  >
                    <LocalizedText
                      preference={preference}
                      value={relatedConcept.preferred}
                    />
                  </LinkPill>
                ))}
              </div>
            </RailPanel>
            <RailPanel title="Quick Facts">
              <Fact label="Type" value="Terminology concept" />
              <Fact
                label="Discipline"
                value={concept.discipline ?? "General"}
              />
              <Fact
                label="FR status"
                value={concept.status?.fr ?? "not recorded"}
              />
              <Fact
                label="FR confidence"
                value={concept.confidence?.fr ?? "not recorded"}
              />
            </RailPanel>
            <RailPanel title="You Might Also Search" tone="tip">
              <div className="flex flex-wrap gap-2">
                {[concept.preferred.en, concept.preferred.fr]
                  .filter(Boolean)
                  .map((term) => (
                    <Link
                      className="rounded-lg border border-emerald-200 bg-white px-2 py-1 text-sm font-semibold text-emerald-800"
                      key={term}
                      to={`/search?q=${encodeURIComponent(term ?? "")}`}
                    >
                      {term}
                    </Link>
                  ))}
              </div>
            </RailPanel>
          </>
        }
      >
        <div className="space-y-5">
          <TerminologyHeader
            badge={concept.discipline ?? "Terminology"}
            marker={concept.preferred.en.slice(0, 3).toUpperCase()}
            title={
              <LocalizedText
                preference={preference}
                value={concept.preferred}
              />
            }
          >
            {concept.contextNotes ? (
              <LocalizedText
                preference={preference}
                value={concept.contextNotes}
              />
            ) : null}
          </TerminologyHeader>

          {concept.definition ? (
            <section className="grid gap-4 lg:grid-cols-2">
              <Panel title="Definition (EN)">
                <LocalizedBlock
                  preference={{ mode: "en" }}
                  value={concept.definition}
                />
              </Panel>
              {concept.definition.fr ? (
                <Panel title="Definition (FR)">
                  <LocalizedBlock
                    preference={{ mode: "fr" }}
                    value={concept.definition}
                  />
                </Panel>
              ) : null}
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-2">
            <Panel title="Aliases">
              <AliasList aliases={concept.aliases?.en} label="EN" />
              <AliasList aliases={concept.aliases?.fr} label="FR" />
            </Panel>
            <Panel title="Used In">
              <ActivityList
                activities={model.relatedActivities}
                compact
                preference={preference}
              />
            </Panel>
          </section>
        </div>
      </FieldLayout>
    );
  }

  const acronym = model.acronym;

  if (!acronym) {
    return <MissingObject objectId={conceptId} objectLabel="Term" />;
  }

  return (
    <FieldLayout
      rail={
        <>
          <RailPanel title="Related Items">
            <ActivityList
              activities={model.relatedActivities.slice(0, 6)}
              compact
              preference={preference}
            />
          </RailPanel>
          <RailPanel title="Quick Facts">
            <Fact label="Type" value="Acronym" />
            <Fact label="Relation" value={acronym.relationType} />
            <Fact
              label="Provisional"
              value={acronym.provisional ? "Yes" : "No"}
            />
          </RailPanel>
        </>
      }
    >
      <div className="space-y-5">
        <TerminologyHeader
          badge="Acronym"
          marker={acronym.id.slice(0, 4).toUpperCase()}
          title={
            acronym.preferredLabel ? (
              <LocalizedText
                preference={preference}
                value={acronym.preferredLabel}
              />
            ) : (
              acronym.id
            )
          }
        >
          {acronym.definition ? (
            <LocalizedText preference={preference} value={acronym.definition} />
          ) : null}
        </TerminologyHeader>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Abbreviations">
            <AliasList aliases={acronym.abbreviations.en} label="EN" />
            <AliasList aliases={acronym.abbreviations.fr} label="FR" />
            <AliasList aliases={acronym.abbreviations.shared} label="Shared" />
          </Panel>
          <Panel title="Full Forms">
            <AliasList aliases={acronym.fullForms?.en} label="EN" />
            <AliasList aliases={acronym.fullForms?.fr} label="FR" />
            <AliasList aliases={acronym.fullForms?.shared} label="Shared" />
          </Panel>
        </section>

        <Panel title="Related Activities">
          <ActivityList
            activities={model.relatedActivities}
            compact
            preference={preference}
          />
        </Panel>
      </div>
    </FieldLayout>
  );
}

function TerminologyHeader({
  badge,
  children,
  marker,
  title
}: {
  badge: string;
  children?: React.ReactNode;
  marker: string;
  title: React.ReactNode;
}) {
  return (
    <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-3 text-xs font-semibold text-slate-500">
        Home › Search › Terminology
      </p>
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-3xl font-bold text-amber-800">
          {marker}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge>{badge}</Badge>
            <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
              <Languages className="h-3.5 w-3.5" aria-hidden />
              EN / FR source data
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-950">{title}</h1>
          {children ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
              {children}
            </p>
          ) : null}
        </div>
        <FileText
          className="hidden h-8 w-8 text-blue-700 md:block"
          aria-hidden
        />
      </div>
    </header>
  );
}

function AliasList({
  aliases,
  label
}: {
  aliases?: readonly string[];
  label: string;
}) {
  if (!aliases?.length) return null;

  return (
    <div className="mb-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {aliases.map((alias) => (
          <Badge key={alias}>{alias}</Badge>
        ))}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm last:border-b-0">
      <dt className="text-slate-600">{label}</dt>
      <dd className="text-right font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
