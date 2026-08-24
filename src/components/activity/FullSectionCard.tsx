import type { ComponentProps, ReactNode } from "react";

import { ContentBlockRenderer } from "@/components/content/ContentBlockRenderer";
import { Card } from "@/components/ui/Card";
import type { ContentBlock } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";

interface FullSectionCardProps {
  title: ReactNode;
  content: readonly ContentBlock[];
  preference: LanguagePreference;
  practicalExampleLabels: ComponentProps<
    typeof ContentBlockRenderer
  >["practicalExampleLabels"];
  defaultOpen?: boolean;
}

export function FullSectionCard({
  content,
  defaultOpen = false,
  practicalExampleLabels,
  preference,
  title
}: FullSectionCardProps) {
  if (content.length === 0) return null;

  return (
    <Card>
      <details open={defaultOpen}>
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">
          {title}
        </summary>
        <div className="mt-3">
          <ContentBlockRenderer
            blocks={content}
            practicalExampleLabels={practicalExampleLabels}
            preference={preference}
          />
        </div>
      </details>
    </Card>
  );
}
