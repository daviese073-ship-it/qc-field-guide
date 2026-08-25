import { GitBranch } from "lucide-react";
import { useParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { ContentBlockRenderer } from "@/components/content/ContentBlockRenderer";
import { LocalizedText } from "@/components/content/LocalizedText";
import type { ContentBlock } from "@/domain/types";
import { buildWorkflowScreenModel } from "@/services/screenContracts";

import {
  ActivityList,
  FieldLayout,
  LinkPill,
  MissingObject,
  PageHeader,
  Panel,
  RailPanel
} from "../screenShared";
import { practicalExampleLabels } from "../screenLabels";
import { activityVisuals } from "../screenVisuals";

export function WorkflowPage() {
  const { workflowId = "" } = useParams<{ workflowId: string }>();
  const { preference } = useLanguagePreference();
  const model = buildWorkflowScreenModel(productionRegistries, workflowId);
  const workflow = model.workflow;

  if (model.status === "notFound" || !workflow) {
    return <MissingObject objectId={workflowId} objectLabel="Workflow" />;
  }

  const WorkflowIcon = activityVisuals.workflow.Icon;

  return (
    <FieldLayout
      rail={
        <>
          <RailPanel title="Workflow Information">
            {workflow.description ? (
              <p className="text-sm leading-6 text-slate-700">
                <LocalizedText
                  preference={preference}
                  value={workflow.description}
                />
              </p>
            ) : null}
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Activities</dt>
                <dd className="font-semibold">{model.activities.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Gates</dt>
                <dd className="font-semibold">{model.gates.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Stages</dt>
                <dd className="font-semibold">
                  {workflow.stages?.length ?? 0}
                </dd>
              </div>
            </dl>
          </RailPanel>
          {model.gates.length ? (
            <RailPanel title="Workflow Gates">
              <div className="space-y-2">
                {model.gates.map((gate) => (
                  <LinkPill
                    key={gate.id}
                    target={{ objectType: "gate", id: gate.id }}
                  >
                    <LocalizedText preference={preference} value={gate.title} />
                  </LinkPill>
                ))}
              </div>
            </RailPanel>
          ) : null}
          <RailPanel title="Workflow Boundary" tone="tip">
            <p className="text-sm leading-6 text-slate-700">
              This is universal workflow guidance. It is not live completion
              state, release history, or an official project record.
            </p>
          </RailPanel>
        </>
      }
    >
      <div className="space-y-5">
        <PageHeader
          eyebrow="Home › Activity Mode"
          title={
            <span className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <WorkflowIcon className="h-10 w-10 text-blue-700" aria-hidden />
              </span>
              <span>
                <LocalizedText preference={preference} value={workflow.title} />
              </span>
            </span>
          }
          description={
            workflow.description ? (
              <LocalizedText
                preference={preference}
                value={workflow.description}
              />
            ) : undefined
          }
        >
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-3">
            <Metric label="Workflow ID" value={workflow.id} />
            <Metric
              label="Activities"
              value={String(model.activities.length)}
            />
            <Metric label="Gates" value={String(model.gates.length)} />
          </div>
        </PageHeader>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-600 md:grid-cols-[80px_minmax(0,1fr)_minmax(0,1fr)_120px]">
            <span>Step</span>
            <span>Activity</span>
            <span>QC Focus</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-slate-100">
            {(workflow.stages?.length ? workflow.stages : undefined)?.map(
              (stage, index) => {
                const stageActivities = (stage.activityIds ?? [])
                  .map((id) => productionRegistries.activities.getById(id))
                  .filter(
                    (activity): activity is NonNullable<typeof activity> =>
                      Boolean(activity)
                  );

                return (
                  <div
                    className="grid gap-3 px-4 py-4 md:grid-cols-[80px_minmax(0,1fr)_minmax(0,1fr)_120px] md:items-start"
                    key={stage.id}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <GitBranch
                        className="h-4 w-4 text-blue-700"
                        aria-hidden
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-950">
                        <LocalizedText
                          preference={preference}
                          value={stage.title}
                        />
                      </h2>
                      <div className="mt-2">
                        <ActivityList
                          activities={stageActivities}
                          compact
                          preference={preference}
                        />
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate-700">
                      {stage.description ? (
                        <LocalizedText
                          preference={preference}
                          value={stage.description}
                        />
                      ) : (
                        "Use linked activities and gates for this workflow stage."
                      )}
                    </p>
                    <div className="flex flex-col gap-2">
                      {(stage.gateIds ?? []).map((gateId) => (
                        <LinkPill
                          key={gateId}
                          target={{ objectType: "gate", id: gateId }}
                        >
                          Gate
                        </LinkPill>
                      ))}
                    </div>
                  </div>
                );
              }
            ) ?? (
              <div className="p-4">
                <ActivityList
                  activities={model.activities}
                  preference={preference}
                />
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <WorkflowContentPanel
            blocks={workflow.evidenceFocus}
            preference={preference}
            title="Evidence Focus"
          />
          <WorkflowContentPanel
            blocks={workflow.issuePath}
            preference={preference}
            title="Issue Path"
          />
        </section>
      </div>
    </FieldLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-slate-200 px-2 last:border-r-0">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-950">{value}</p>
    </div>
  );
}

function WorkflowContentPanel({
  blocks,
  preference,
  title
}: {
  blocks?: readonly ContentBlock[];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
  title: string;
}) {
  if (!blocks?.length) return null;

  return (
    <Panel title={title}>
      <ContentBlockRenderer
        blocks={blocks}
        practicalExampleLabels={practicalExampleLabels}
        preference={preference}
      />
    </Panel>
  );
}
