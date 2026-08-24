import type { z } from "zod";

import type {
  termReferenceSchema,
  terminologyConceptSchema,
  terminologyConfidenceSchema,
  terminologyStatusSchema
} from "@/domain/schemas/terminology";

export type TerminologyStatus = z.infer<typeof terminologyStatusSchema>;
export type TerminologyConfidence = z.infer<typeof terminologyConfidenceSchema>;
export type TerminologyConcept = z.infer<typeof terminologyConceptSchema>;
export type TermReference = z.infer<typeof termReferenceSchema>;
