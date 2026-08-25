import {
  AlertTriangle,
  BadgeCheck,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";
import { useParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionRegistries } from "@/app/productionAppData";
import { LocalizedText } from "@/components/content/LocalizedText";
import { Badge } from "@/components/ui/Badge";
import { buildGateScreenModel } from "@/services/screenContracts";

import {
  ActivityList,
  CompactTag,
  ContentPanel,
  FieldLayout,
  LinkPill,
  LocalizedBlock,
  MissingObject,
  PageHeader,
  Panel,
  RailPanel
} from "../screenShared";
import { activityVisuals } from "../screenVisuals";

export function GatePage() {
  const { gateId = "" } = useParams<{ gateId: string }>();
  const { preference } = useLanguagePreference();
  const model = buildGateScreenModel(productionRegistries, gateId);
  const gate = model.gate;

  if (model.status === "notFound" || !gate) {
    return <MissingObject objectId={gateId} objectLabel="Gate" />;
  }

  const GateIcon = activityVisuals.gate.Icon;

  return (
    <FieldLayout
      rail={
        <>
          {model.downstreamActivities.length ? (
            <RailPanel title="Downstream Work">
              <ActivityList
                activities={model.downstreamActivities}
                compact
                preference={preference}
              />
            </RailPanel>
          ) : null}
          {model.invalidationRules.length ? (
            <RailPanel title="Invalidation Events" tone="critical">
              <div className="flex flex-wrap gap-2">
                {model.invalidationRules.map((ruleId) => (
                  <Badge key={ruleId} tone="caution">
                    {ruleId}
                  </Badge>
                ))}
              </div>
            </RailPanel>
          ) : null}
          <RailPanel title="Gate Tip" tone="tip">
            <p className="text-sm leading-6 text-slate-700">
              Gates define universal quality logic. They are not live project
              approvals, signatures, or release records.
            </p>
          </RailPanel>
        </>
      }
    >
      <div className="space-y-5">
        <PageHeader
          eyebrow="Home › Gates"
          title={
            <span className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                <GateIcon className="h-10 w-10 text-emerald-700" aria-hidden />
              </span>
              <span>
                <span className="font-mono text-slate-500">{gate.id}</span>{" "}
                <LocalizedText preference={preference} value={gate.title} />
              </span>
            </span>
          }
          description={
            gate.purpose ? (
              <LocalizedText preference={preference} value={gate.purpose} />
            ) : undefined
          }
        >
          <div className="flex flex-wrap gap-2">
            <Badge>{gate.gateType}</Badge>
            {(gate.tags ?? []).map((tag) => (
              <CompactTag key={tag} tag={tag}>
                {tag}
              </CompactTag>
            ))}
          </div>
        </PageHeader>

        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <GateMetric
            icon={
              <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden />
            }
            label="Prerequisites"
            value={String(model.prerequisiteActivities.length)}
          />
          <GateMetric
            icon={
              <AlertTriangle className="h-5 w-5 text-red-700" aria-hidden />
            }
            label="Blocking Conditions"
            value={gate.blockingConditions?.length ? "Defined" : "None listed"}
          />
          <GateMetric
            icon={<BadgeCheck className="h-5 w-5 text-blue-700" aria-hidden />}
            label="Release Condition"
            value={gate.releaseCondition ? "Defined" : "Not listed"}
          />
          <GateMetric
            icon={
              <LockKeyhole className="h-5 w-5 text-slate-700" aria-hidden />
            }
            label="Authority"
            value={gate.authorityNote ? "See note" : "Project governs"}
          />
        </section>

        <section className="grid gap-3 xl:grid-cols-4">
          <ContentPanel
            blocks={gate.checkItems}
            preference={preference}
            title="Prerequisites"
          />
          <ContentPanel
            blocks={gate.blockingConditions}
            preference={preference}
            title="Blocking Conditions"
            tone="critical"
          />
          {gate.releaseCondition ? (
            <Panel title="Release Condition">
              <LocalizedBlock
                preference={preference}
                value={gate.releaseCondition}
              />
            </Panel>
          ) : null}
          {gate.authorityNote ? (
            <Panel title="Release Information">
              <LocalizedBlock
                preference={preference}
                value={gate.authorityNote}
              />
            </Panel>
          ) : null}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Constituent Activities">
            <ActivityList
              activities={model.controlledActivities}
              compact
              preference={preference}
            />
          </Panel>
          <Panel title="Prerequisite Activities">
            <ActivityList
              activities={model.prerequisiteActivities}
              compact
              preference={preference}
            />
          </Panel>
        </section>

        <LinkPill target={{ objectType: "search" }}>
          Search related work
        </LinkPill>
      </div>
    </FieldLayout>
  );
}

function GateMetric({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-r border-slate-200 px-2 last:border-r-0">
      <div className="mb-2">{icon}</div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}
