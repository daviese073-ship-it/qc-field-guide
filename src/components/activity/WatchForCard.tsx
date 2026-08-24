import type { ComponentProps, ReactNode } from "react";

import { ContentBlockRenderer } from "@/components/content/ContentBlockRenderer";
import { WarningCard } from "@/components/content/WarningCard";
import type { ContentBlock } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";

interface WatchForCardProps {
  title: ReactNode;
  items: readonly ContentBlock[];
  preference: LanguagePreference;
  practicalExampleLabels: ComponentProps<
    typeof ContentBlockRenderer
  >["practicalExampleLabels"];
}

export function WatchForCard({
  items,
  practicalExampleLabels,
  preference,
  title
}: WatchForCardProps) {
  if (items.length === 0) return null;

  return (
    <WarningCard title={title}>
      <ContentBlockRenderer
        blocks={items}
        practicalExampleLabels={practicalExampleLabels}
        preference={preference}
      />
    </WarningCard>
  );
}
