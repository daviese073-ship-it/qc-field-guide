import type { LocalizedContent, LocalizedString } from "@/domain/types";
import type { SearchableObjectType } from "@/domain/types/search";
import type { LanguagePreference } from "@/services/localization/languagePreference";
import { formatLocalizedValue } from "@/services/localization/localizationService";

export const practicalExampleLabels = {
  situation: "Situation",
  observation: "Observation",
  qualityConcern: "Quality concern",
  reasoning: "Reasoning",
  actionPath: "Action path",
  closure: "Closure",
  lesson: "Lesson"
};

export const relationshipGroupLabels = {
  before: "Before",
  gates: "Gates",
  interfaces: "Interfaces",
  workflows: "Workflows",
  testing: "Testing",
  commissioning: "Commissioning",
  after: "After",
  closeout: "Closeout"
};

export const modeLabels = {
  quick: "Quick",
  full: "Full",
  learn: "Learn"
};

export const objectTypeLabels: Record<SearchableObjectType, string> = {
  section: "Section",
  activity: "Activity",
  workflow: "Workflow",
  preConcealment: "Pre-Concealment",
  gate: "Gate",
  generalQcProcess: "General QC Process",
  term: "Term",
  acronym: "Acronym"
};

export function formatLocalized(
  value: LocalizedString | LocalizedContent,
  preference: LanguagePreference
) {
  return formatLocalizedValue(value, preference);
}
