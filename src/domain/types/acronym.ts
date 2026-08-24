import type { z } from "zod";

import type {
  acronymEntrySchema,
  acronymRelationTypeSchema
} from "@/domain/schemas/acronym";

export type AcronymRelationType = z.infer<typeof acronymRelationTypeSchema>;
export type AcronymEntry = z.infer<typeof acronymEntrySchema>;
