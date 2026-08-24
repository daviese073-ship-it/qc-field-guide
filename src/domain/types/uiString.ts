import type { z } from "zod";

import type {
  uiStringCategorySchema,
  uiStringSchema
} from "@/domain/schemas/uiString";

export type UiStringCategory = z.infer<typeof uiStringCategorySchema>;
export type UiString = z.infer<typeof uiStringSchema>;
