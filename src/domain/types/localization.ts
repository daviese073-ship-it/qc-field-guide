import type { z } from "zod";

import type {
  localizedContentSchema,
  localizedStringSchema,
  translationStatusSchema
} from "@/domain/schemas/localization";

export type TranslationStatus = z.infer<typeof translationStatusSchema>;
export type LocalizedString = z.infer<typeof localizedStringSchema>;
export type LocalizedContent = z.infer<typeof localizedContentSchema>;
