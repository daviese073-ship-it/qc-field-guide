import type { ReactNode } from "react";

import type {
  RelationshipNavigationGroup,
  RelationshipNavigationGroupId
} from "@/services/relationships";
import type { LanguagePreference } from "@/services/localization/languagePreference";

import { RelationshipGroup } from "./RelationshipGroup";

type RelationshipStripProps = {
  nodeId: string;
  groups: readonly RelationshipNavigationGroup[];
  groupLabels: Readonly<Record<RelationshipNavigationGroupId, ReactNode>>;
  preference: LanguagePreference;
  conditionLabels?: Readonly<Record<string, ReactNode>>;
};

export function RelationshipStrip({
  conditionLabels,
  groupLabels,
  groups,
  nodeId,
  preference
}: RelationshipStripProps) {
  const populatedGroups = groups.filter((group) => group.items.length > 0);

  if (populatedGroups.length === 0) return null;

  return (
    <aside
      aria-label={`Relationships for ${nodeId}`}
      className="grid gap-3 md:grid-cols-2"
    >
      {populatedGroups.map((group) => (
        <RelationshipGroup
          conditionLabels={conditionLabels}
          group={group}
          key={group.id}
          label={groupLabels[group.id]}
          preference={preference}
        />
      ))}
    </aside>
  );
}
