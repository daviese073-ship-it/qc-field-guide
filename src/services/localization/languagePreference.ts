import { z } from "zod";

import {
  localStorageService,
  type TypedStorage
} from "@/services/storage/browserStorage";

export const languageModeSchema = z.enum(["en", "bilingual", "fr"]);
export const bilingualPrimarySchema = z.enum(["en", "fr"]);

export const languagePreferenceSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("en")
  }),
  z.object({
    mode: z.literal("fr")
  }),
  z.object({
    mode: z.literal("bilingual"),
    bilingualPrimary: bilingualPrimarySchema
  })
]);

export type LanguageMode = z.infer<typeof languageModeSchema>;
export type BilingualPrimary = z.infer<typeof bilingualPrimarySchema>;
export type LanguagePreference = z.infer<typeof languagePreferenceSchema>;

export const defaultLanguagePreference: LanguagePreference = {
  mode: "en"
};

const languagePreferenceStorageKey = "qc-field-guide:language-preference";

export function getLanguagePreference(
  storage: TypedStorage = localStorageService
): LanguagePreference {
  return (
    storage.get(languagePreferenceStorageKey, languagePreferenceSchema) ??
    defaultLanguagePreference
  );
}

export function setLanguagePreference(
  preference: LanguagePreference,
  storage: TypedStorage = localStorageService
): boolean {
  return storage.set(
    languagePreferenceStorageKey,
    languagePreferenceSchema.parse(preference)
  );
}

export function clearLanguagePreference(
  storage: TypedStorage = localStorageService
): boolean {
  return storage.remove(languagePreferenceStorageKey);
}
