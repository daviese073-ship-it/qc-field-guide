import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import type { ContentBlock } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";

import { ChecklistItem } from "@/components/content/ChecklistItem";

interface QuickChecklistGroupProps {
  title: ReactNode;
  items: readonly ContentBlock[];
  preference: LanguagePreference;
  conditionLabels?: Readonly<Record<string, ReactNode>>;
}

const getChecklistItems = (blocks: readonly ContentBlock[]) =>
  blocks.flatMap((block) => {
    if (block.type === "checkList" || block.type === "bulletList") {
      return block.items;
    }
    if (block.type === "paragraph" || block.type === "notice") {
      return [block.item];
    }
    return [];
  });

export function QuickChecklistGroup({
  conditionLabels,
  items,
  preference,
  title
}: QuickChecklistGroupProps) {
  const checklistItems = getChecklistItems(items);

  if (checklistItems.length === 0) return null;

  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">
        {checklistItems.map((item) => (
          <ChecklistItem
            conditionLabels={conditionLabels}
            item={item}
            key={item.id}
            preference={preference}
          />
        ))}
      </div>
    </Card>
  );
}
