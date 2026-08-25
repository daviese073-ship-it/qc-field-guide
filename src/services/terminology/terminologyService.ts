import type { CanonicalRegistries } from "@/domain/registries";
import type { AcronymEntry, TerminologyConcept } from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";
import { resolveLocalizedValue } from "@/services/localization/localizationService";

export interface TerminologyService {
  getConcept(id: string): TerminologyConcept | undefined;
  getAcronym(id: string): AcronymEntry | undefined;
  getPreferredTerm(
    id: string,
    preference: LanguagePreference
  ): string | undefined;
  getAliases(id: string, language?: "en" | "fr"): readonly string[];
  findConceptsByAlias(alias: string): readonly TerminologyConcept[];
  findAcronymsByAbbreviation(abbreviation: string): readonly AcronymEntry[];
}

const normalizeLookupToken = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[.\s-]+/g, "")
    .toLocaleLowerCase("en-US");

const getConceptAliases = (
  concept: TerminologyConcept,
  language?: "en" | "fr"
) => {
  if (language) return concept.aliases?.[language] ?? [];

  return [...(concept.aliases?.en ?? []), ...(concept.aliases?.fr ?? [])];
};

const getAcronymTokens = (acronym: AcronymEntry) => [
  ...(acronym.abbreviations.en ?? []),
  ...(acronym.abbreviations.fr ?? []),
  ...(acronym.abbreviations.shared ?? []),
  ...(acronym.aliases ?? [])
];

export const createTerminologyService = (
  registries: CanonicalRegistries
): TerminologyService =>
  Object.freeze({
    getConcept: (id: string) => registries.terminology.getById(id),
    getAcronym: (id: string) => registries.acronyms.getById(id),
    getPreferredTerm: (id: string, preference: LanguagePreference) => {
      const concept = registries.terminology.getById(id);

      return concept
        ? resolveLocalizedValue(concept.preferred, preference).primary
        : undefined;
    },
    getAliases: (id: string, language?: "en" | "fr") => {
      const concept = registries.terminology.getById(id);

      return concept ? getConceptAliases(concept, language) : [];
    },
    findConceptsByAlias: (alias: string) => {
      const normalizedAlias = normalizeLookupToken(alias);

      return registries.terminology
        .getAll()
        .filter((concept) =>
          getConceptAliases(concept).some(
            (candidate) => normalizeLookupToken(candidate) === normalizedAlias
          )
        );
    },
    findAcronymsByAbbreviation: (abbreviation: string) => {
      const normalizedAbbreviation = normalizeLookupToken(abbreviation);

      return registries.acronyms
        .getAll()
        .filter((acronym) =>
          getAcronymTokens(acronym).some(
            (candidate) =>
              normalizeLookupToken(candidate) === normalizedAbbreviation
          )
        );
    }
  });
