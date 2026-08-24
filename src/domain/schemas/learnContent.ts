import { z } from "zod";

import {
  canonicalIdSchema,
  contentBlocksSchema,
  practicalExampleSchema
} from "@/domain/schemas/content";
import { localizedContentSchema } from "@/domain/schemas/localization";

export const learnContentSchema = z
  .object({
    activityId: canonicalIdSchema,
    whatIsThis: contentBlocksSchema.optional(),
    whyItMatters: contentBlocksSchema.optional(),
    terminologyRefs: z.array(canonicalIdSchema).optional(),
    howGoodWorkLooks: contentBlocksSchema.optional(),
    criticalChecksExplained: contentBlocksSchema.optional(),
    commonFailures: contentBlocksSchema.optional(),
    practicalExamples: z.array(practicalExampleSchema).optional(),
    interfacesAndSequence: contentBlocksSchema.optional(),
    specialistAuthorityBoundary: localizedContentSchema.optional()
  })
  .strict();
