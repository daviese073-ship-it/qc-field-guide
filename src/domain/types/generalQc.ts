import type { z } from "zod";

import type {
  generalQcAdditionalSectionSchema,
  generalQcFieldWorkflowEntrySchema,
  generalQcProcessSchema,
  generalQcQualityRecordElementSchema,
  generalQcUniversalReferenceSchema
} from "@/domain/schemas/generalQc";

export type GeneralQcFieldWorkflowEntry = z.infer<
  typeof generalQcFieldWorkflowEntrySchema
>;
export type GeneralQcAdditionalSection = z.infer<
  typeof generalQcAdditionalSectionSchema
>;
export type GeneralQcProcess = z.infer<typeof generalQcProcessSchema>;
export type GeneralQcQualityRecordElement = z.infer<
  typeof generalQcQualityRecordElementSchema
>;
export type GeneralQcUniversalReference = z.infer<
  typeof generalQcUniversalReferenceSchema
>;
