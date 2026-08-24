import type { z } from "zod";

import type {
  authorityMetadataSchema,
  canonicalIdSchema,
  contentBlockSchema,
  contentItemSchema,
  highControlMetadataSchema,
  practicalExampleSchema,
  sourceReferenceSchema
} from "@/domain/schemas/content";

export type CanonicalId = z.infer<typeof canonicalIdSchema>;
export type SourceReference = z.infer<typeof sourceReferenceSchema>;
export type AuthorityMetadata = z.infer<typeof authorityMetadataSchema>;
export type HighControlMetadata = z.infer<typeof highControlMetadataSchema>;
export type ContentItem = z.infer<typeof contentItemSchema>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type PracticalExample = z.infer<typeof practicalExampleSchema>;
