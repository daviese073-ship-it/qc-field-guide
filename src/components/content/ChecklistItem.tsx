import type { ReactNode } from "react";

import type { ContentItem } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";

import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { LocalizedText } from "./LocalizedText";
import { TerminologyLink } from "@/components/terminology/TerminologyLink";

interface ChecklistItemProps {
  item: ContentItem;
  preference: LanguagePreference;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  conditionLabels?: Readonly<Record<string, ReactNode>>;
  terminologyLabels?: Readonly<Record<string, ReactNode>>;
}

export function ChecklistItem({
  checked,
  conditionLabels = {},
  item,
  onToggle,
  preference,
  terminologyLabels = {}
}: ChecklistItemProps) {
  const label = <LocalizedText preference={preference} value={item.text} />;
  const conditionLabel = item.conditionId
    ? conditionLabels[item.conditionId]
    : undefined;
  const terminologyRefs = (item.terminologyRefs ?? []).filter(
    (conceptId) => terminologyLabels[conceptId]
  );

  return (
    <div className="space-y-1">
      {onToggle ? (
        <Checkbox
          checked={checked}
          label={label}
          onChange={(event) => onToggle(event.currentTarget.checked)}
        />
      ) : (
        <div className="text-sm text-slate-800">{label}</div>
      )}
      <div className="flex flex-wrap gap-1">
        {conditionLabel ? <Badge tone="caution">{conditionLabel}</Badge> : null}
        {terminologyRefs.map((conceptId) => (
          <TerminologyLink conceptId={conceptId} key={conceptId}>
            {terminologyLabels[conceptId]}
          </TerminologyLink>
        ))}
      </div>
    </div>
  );
}
