import type { z } from "zod";

import type {
  searchIndexEntrySchema,
  searchableObjectTypeSchema,
  searchMatchTypeSchema,
  searchResultSchema
} from "@/domain/schemas/search";

export type SearchableObjectType = z.infer<typeof searchableObjectTypeSchema>;
export type SearchIndexEntry = z.infer<typeof searchIndexEntrySchema>;
export type SearchMatchType = z.infer<typeof searchMatchTypeSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
