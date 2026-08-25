import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import { productionGeneralQcService } from "@/app/productionAppData";
import type { GeneralQcProcess } from "@/domain/types";
import { getCanonicalRoute } from "@/services/navigation";
import { formatLocalizedValue } from "@/services/localization/localizationService";

import { ProcessIcon } from "./ProcessIcon";
import { getGeneralQcVisual } from "./generalQcPresentation";

export function GeneralQcProcessDetailPage() {
  const { processId } = useParams();
  const { preference } = useLanguagePreference();
  const process = processId
    ? productionGeneralQcService.getProcessById(processId)
    : undefined;

  if (!process) {
    return (
      <div className="mx-auto w-full max-w-[920px] pt-10">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-[#075fef]"
          to="/general-qc"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          General QC Processes
        </Link>
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#07142e]">
            General QC process not found
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#56647d]">
            No canonical General QC Process record matches this route.
          </p>
        </section>
      </div>
    );
  }

  const visual = getGeneralQcVisual(process.id);

  return (
    <article className="mx-auto w-full max-w-[980px] pt-8">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-[#075fef]"
        to="/general-qc"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        General QC Processes
      </Link>

      <header className="mt-5 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white p-6 shadow-[0_3px_10px_rgba(15,23,42,0.045)]">
        <div className="flex items-start gap-4">
          <ProcessIcon Icon={visual.Icon} accent={visual.accent} size="large" />
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-wide text-[#64748b]">
              Process {String(process.sequence).padStart(2, "0")}
            </p>
            <h1 className="mt-1 text-3xl font-bold leading-10 text-[#07142e]">
              {formatLocalizedValue(process.title, preference)}
            </h1>
            <p className="mt-2 text-base leading-7 text-[#56647d]">
              {formatLocalizedValue(process.summary, preference)}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-5 grid gap-5">
        <ContentSection title="When to Use">
          <p className="text-sm leading-6 text-[#334155]">
            {formatLocalizedValue(process.whenToUse, preference)}
          </p>
        </ContentSection>

        <ContentSection title="Field Workflow">
          <ol className="space-y-3">
            {process.fieldWorkflow.map((step) => (
              <li
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[36px_minmax(0,1fr)]"
                key={step.sequence}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#07142e] text-sm font-bold text-white">
                  {step.sequence}
                </span>
                <span>
                  <span className="block text-sm font-bold text-[#07142e]">
                    {formatLocalizedValue(step.action, preference)}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-[#56647d]">
                    {formatLocalizedValue(step.detail, preference)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </ContentSection>

        <TwoColumnSections process={process} />

        {process.additionalSections?.map((section) => (
          <ContentSection
            key={section.title.en}
            title={formatLocalizedValue(section.title, preference)}
          >
            <BulletList
              items={section.items.map((item) =>
                formatLocalizedValue(item, preference)
              )}
            />
          </ContentSection>
        ))}

        <RelatedProcesses process={process} />
      </div>
    </article>
  );
}

function TwoColumnSections({ process }: { process: GeneralQcProcess }) {
  const { preference } = useLanguagePreference();

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ContentSection title="What to Capture">
        <BulletList
          items={process.whatToCapture.map((item) =>
            formatLocalizedValue(item, preference)
          )}
        />
      </ContentSection>
      <ContentSection title="Key Reminders">
        <BulletList
          items={process.keyReminders.map((item) =>
            formatLocalizedValue(item, preference)
          )}
        />
      </ContentSection>
      <ContentSection title="Common Mistakes">
        <BulletList
          items={process.commonMistakes.map((item) =>
            formatLocalizedValue(item, preference)
          )}
        />
      </ContentSection>
      <ContentSection title="Typical Outputs">
        <BulletList
          items={process.typicalOutputs.map((item) =>
            formatLocalizedValue(item, preference)
          )}
        />
      </ContentSection>
    </div>
  );
}

function RelatedProcesses({ process }: { process: GeneralQcProcess }) {
  const { preference } = useLanguagePreference();
  const related = productionGeneralQcService.getRelatedProcesses(process);

  return (
    <ContentSection title="Related Processes">
      <div className="grid gap-3 sm:grid-cols-2">
        {related.map((item) => {
          const visual = getGeneralQcVisual(item.id);

          return (
            <Link
              className="group grid min-h-[74px] grid-cols-[44px_minmax(0,1fr)_18px] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-offset-4"
              key={item.id}
              to={getCanonicalRoute({
                objectType: "generalQcProcess",
                id: item.id
              })}
            >
              <ProcessIcon
                Icon={visual.Icon}
                accent={visual.accent}
                size="small"
              />
              <span className="min-w-0">
                <span className="line-clamp-2 block text-sm font-bold leading-5 text-[#07142e]">
                  {formatLocalizedValue(item.title, preference)}
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 text-[#075fef] transition group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </ContentSection>
  );
}

function ContentSection({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-[rgba(15,23,42,0.12)] bg-white p-5 shadow-[0_3px_10px_rgba(15,23,42,0.045)]">
      <h2 className="text-lg font-bold text-[#07142e]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li className="flex gap-2 text-sm leading-6 text-[#334155]" key={item}>
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#075fef]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
