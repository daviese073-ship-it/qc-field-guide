import { z } from "zod";

import { localizedStringSchema } from "@/domain/schemas/localization";

export const conditionIdSchema = z.enum([
  "always",
  "whereApplicable",
  "whereSpecified",
  "whereRated",
  "whereFireSeparation",
  "whereExterior",
  "whereExteriorEnvelope",
  "whereRoof",
  "whereConcealed",
  "whereTestingRequired",
  "whereEquipmentPresent",
  "whereSystemPresent",
  "whereBuried",
  "whereSpecialistRequired"
]);

export const conditionDefinitionSchema = z
  .object({
    id: conditionIdSchema,
    label: localizedStringSchema,
    description: localizedStringSchema.optional()
  })
  .strict();
