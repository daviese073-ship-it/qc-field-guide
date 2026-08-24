import type { ReactNode } from "react";

import { LocalizedText } from "@/components/content/LocalizedText";
import { Badge } from "@/components/ui/Badge";
import type { RelationshipNavigationGroup } from "@/services/relationships";
import type { LanguagePreference } from "@/services/localization/languagePreference";

import { NavigationLink } from "./NavigationLink";

type RelationshipGroupProps = {
  group: RelationshipNavigationGroup;
  label: ReactNode;
  preference: LanguagePreference;
  conditionLabels?: Readonly<Record<string, ReactNode>>;
};

const toRelationshipTarget = (
  item: RelationshipNavigationGroup["items"][number]
) => {
  switch (item.relatedNodeKind) {
    case "activity":
      return { objectType: "activity", id: item.relatedNodeId } as const;
    case "gate":
      return { objectType: "gate", id: item.relatedNodeId } as const;
    case "workflow":
      return { objectType: "workflow", id: item.relatedNodeId } as const;
    case "preConcealmentWorkflow":
      return {
        objectType: "preConcealment",
        id: item.relatedNodeId
      } as const;
  }
};

export function RelationshipGroup({
  conditionLabels = {},
  group,
  label,
  preference
}: RelationshipGroupProps) {
  if (group.items.length === 0) return null;

  return (
    <section className="rounded border border-slate-200 bg-white p-3">
      <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
      <ul className="mt-2 space-y-2">
        {group.items.map((item) => (
          <li className="flex flex-wrap items-center gap-2" key={item.relationship.id}>
            <NavigationLink target={toRelationshipTarget(item)}>
              <LocalizedText
                preference={preference}
                value={item.relatedNode.object.title}
              />
            </NavigationLink>
            {item.conditionId && conditionLabels[item.conditionId] ? (
              <Badge tone="caution">{conditionLabels[item.conditionId]}</Badge>
            ) : null}
            {item.strength ? <Badge>{item.strength}</Badge> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
