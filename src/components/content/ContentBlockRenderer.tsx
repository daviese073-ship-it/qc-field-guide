import type { ReactNode } from "react";

import type { ContentBlock } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";

import { ChecklistItem } from "./ChecklistItem";
import { LocalizedText } from "./LocalizedText";
import { NoticeCard } from "./NoticeCard";
import { PracticalExampleCard } from "./PracticalExampleCard";

interface ContentBlockRendererProps {
  blocks: readonly ContentBlock[];
  preference: LanguagePreference;
  conditionLabels?: Readonly<Record<string, ReactNode>>;
  practicalExampleLabels: Readonly<
    Record<
      | "situation"
      | "observation"
      | "qualityConcern"
      | "reasoning"
      | "actionPath"
      | "closure"
      | "lesson",
      ReactNode
    >
  >;
}

export function ContentBlockRenderer({
  blocks,
  conditionLabels,
  practicalExampleLabels,
  preference
}: ContentBlockRendererProps) {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p className="text-sm text-slate-800" key={block.item.id}>
                <LocalizedText
                  density="long"
                  preference={preference}
                  value={block.item.text}
                />
              </p>
            );
          case "bulletList":
            return (
              <ul className="list-disc space-y-2 pl-5" key={`bullets-${index}`}>
                {block.items.map((item) => (
                  <li key={item.id}>
                    <LocalizedText preference={preference} value={item.text} />
                  </li>
                ))}
              </ul>
            );
          case "checkList":
            return (
              <div className="space-y-2" key={`checks-${index}`}>
                {block.items.map((item) => (
                  <ChecklistItem
                    conditionLabels={conditionLabels}
                    item={item}
                    key={item.id}
                    preference={preference}
                  />
                ))}
              </div>
            );
          case "subheading":
            return (
              <h3 className="text-base font-semibold text-slate-950" key={`subheading-${index}`}>
                <LocalizedText preference={preference} value={block.text} />
              </h3>
            );
          case "notice":
            return (
              <NoticeCard key={block.item.id}>
                <LocalizedText
                  density="long"
                  preference={preference}
                  value={block.item.text}
                />
              </NoticeCard>
            );
          case "example":
            return (
              <PracticalExampleCard
                example={block.example}
                key={block.example.id ?? `example-${index}`}
                labels={practicalExampleLabels}
                preference={preference}
              />
            );
          case "referenceList":
            return (
              <ul className="space-y-1 text-sm text-slate-700" key={`refs-${index}`}>
                {block.references.map((reference, referenceIndex) => (
                  <li key={`${reference.document ?? "reference"}-${referenceIndex}`}>
                    {[reference.document, reference.section, reference.page]
                      .filter(Boolean)
                      .join(" ")}
                  </li>
                ))}
              </ul>
            );
        }
      })}
    </div>
  );
}
