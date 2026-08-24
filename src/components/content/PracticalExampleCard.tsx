import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import type { PracticalExample } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";

import { LocalizedText } from "./LocalizedText";

interface PracticalExampleCardProps {
  example: PracticalExample;
  labels: Readonly<Record<PracticalExampleField, ReactNode>>;
  preference: LanguagePreference;
}

type PracticalExampleField =
  | "situation"
  | "observation"
  | "qualityConcern"
  | "reasoning"
  | "actionPath"
  | "closure"
  | "lesson";

const exampleFields = [
  "situation",
  "observation",
  "qualityConcern",
  "reasoning",
  "actionPath",
  "closure",
  "lesson"
] as const;

export function PracticalExampleCard({
  example,
  labels,
  preference
}: PracticalExampleCardProps) {
  const populatedFields = exampleFields.flatMap((field) => {
    const value = example[field];

    return value ? [{ field, value }] : [];
  });

  if (populatedFields.length === 0) return null;

  return (
    <Card>
      <dl className="space-y-3">
        {populatedFields.map(({ field, value }) => (
          <div key={field}>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              {labels[field]}
            </dt>
            <dd className="mt-1 text-sm text-slate-800">
              <LocalizedText
                density="long"
                preference={preference}
                value={value}
              />
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
