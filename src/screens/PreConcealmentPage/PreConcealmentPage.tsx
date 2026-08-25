import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Hand,
  ShieldCheck
} from "lucide-react";
import { useParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { ContentBlockRenderer } from "@/components/content/ContentBlockRenderer";
import { LocalizedText } from "@/components/content/LocalizedText";
import { Badge } from "@/components/ui/Badge";
import { buildPreConcealmentScreenModel } from "@/services/screenContracts";

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

const processSteps = [
  { label: "Stop", detail: "Pause work", color: "bg-red-700", Icon: Hand },
  {
    label: "Check",
    detail: "Verify items",
    color: "bg-emerald-700",
    Icon: CheckCircle2
  },
  {
    label: "Evidence",
    detail: "Capture proof",
    color: "bg-blue-700",
    Icon: Camera
  },
  {
    label: "Blocking",
    detail: "Clear blockers",
    color: "bg-orange-700",
    Icon: AlertTriangle
  },
  {
    label: "Release",
    detail: "Authorized process",
    color: "bg-emerald-700",
    Icon: ShieldCheck
  }
];

export function PreConcealmentPage() {
  const { preConcealmentId = "" } = useParams<{ preConcealmentId: string }>();
  const { preference } = useLanguagePreference();
  const model = buildPreConcealmentScreenModel(
    productionRegistries,
    preConcealmentId
  );
  const workflow = model.workflow;

  if (model.status === "notFound" || !workflow) {
    return (
      <MissingObject
        objectId={preConcealmentId}
        objectLabel="Pre-concealment workflow"
      />
    );
  }

  return (
    <FieldLayout
      rail={
        <>
          <RailPanel title="Hidden After This">
            <ActivityList
              activities={model.activities.slice(0, 6)}
              compact
              preference={preference}
            />
          </RailPanel>
          {model.gates.length ? (
            <RailPanel title="Related Gates">
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
          <RailPanel title="Project Boundary" tone="critical">
            <p className="text-sm leading-6 text-slate-700">
              This is universal guidance only. It is not an official hold-point
              release, approval, acceptance, or signature.
            </p>
          </RailPanel>
        </>
      }
    >
      <div className="space-y-5">
        <PageHeader
          eyebrow="Home › Before Closing / Covering"
          title={
            <LocalizedText preference={preference} value={workflow.title} />
          }
          description="Stop and verify before work becomes hidden. Project requirements and authorized procedures govern."
        >
          <Badge>{workflow.id}</Badge>
        </PageHeader>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-5">
            {processSteps.map(({ color, detail, Icon, label }, index) => (
              <div className="flex items-center gap-3" key={label}>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-bold uppercase text-slate-900">
                    {label}
                  </p>
                  <p className="text-xs text-slate-600">{detail}</p>
                </div>
                {index < processSteps.length - 1 ? (
                  <ArrowRight
                    className="ml-auto hidden h-5 w-5 text-slate-400 lg:block"
                    aria-hidden
                  />
                ) : null}
                <Icon className="sr-only" aria-hidden />
              </div>
            ))}
          </div>
        </section>

        <section className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:grid-cols-5">
          <ProcessColumn
            icon={<Hand className="h-5 w-5 text-red-700" aria-hidden />}
            title="Stop"
            tone="red"
          >
            <p className="text-sm leading-6 text-slate-700">
              Do not cover or close this work until the applicable checks,
              evidence, and blocking conditions are resolved through the
              project-authorized process.
            </p>
          </ProcessColumn>
          <ProcessColumn
            icon={
              <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden />
            }
            title="Check"
            tone="green"
          >
            <BlockRenderer
              blocks={workflow.criticalChecks}
              preference={preference}
            />
          </ProcessColumn>
          <ProcessColumn
            icon={<Camera className="h-5 w-5 text-blue-700" aria-hidden />}
            title="Evidence"
            tone="blue"
          >
            <BlockRenderer blocks={workflow.evidence} preference={preference} />
          </ProcessColumn>
          <ProcessColumn
            icon={
              <AlertTriangle className="h-5 w-5 text-orange-700" aria-hidden />
            }
            title="Blocking"
            tone="orange"
          >
            <BlockRenderer blocks={workflow.blockIf} preference={preference} />
          </ProcessColumn>
          <ProcessColumn
            icon={
              <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden />
            }
            title="Release"
            tone="green"
          >
            <p className="text-sm leading-6 text-slate-700">
              Follow the authorized project release process where one is
              required. This app does not record or grant release.
            </p>
          </ProcessColumn>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Activities in Scope">
            <ActivityList
              activities={model.activities}
              compact
              preference={preference}
            />
          </Panel>
          <Panel title="Next Work">
            <ActivityList
              activities={model.nextActivities}
              compact
              preference={preference}
            />
          </Panel>
        </section>
      </div>
    </FieldLayout>
  );
}

function ProcessColumn({
  children,
  icon,
  title,
  tone
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  tone: "red" | "green" | "blue" | "orange";
}) {
  const border = {
    red: "border-t-red-600",
    green: "border-t-emerald-600",
    blue: "border-t-blue-600",
    orange: "border-t-orange-600"
  }[tone];

  return (
    <section
      className={`border-t-4 ${border} border-r border-slate-200 p-4 last:border-r-0`}
    >
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-bold uppercase text-slate-900">{title}</h2>
      </div>
      <div className="text-sm leading-6 text-slate-700">{children}</div>
    </section>
  );
}

function BlockRenderer({
  blocks,
  preference
}: {
  blocks?: Parameters<typeof ContentBlockRenderer>[0]["blocks"];
  preference: ReturnType<typeof useLanguagePreference>["preference"];
}) {
  if (!blocks?.length) return null;

  return (
    <ContentBlockRenderer
      blocks={blocks}
      practicalExampleLabels={practicalExampleLabels}
      preference={preference}
    />
  );
}
