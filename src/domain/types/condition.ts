import type { z } from "zod";

import type {
  conditionDefinitionSchema,
  conditionIdSchema
} from "@/domain/schemas/condition";

export type ConditionId = z.infer<typeof conditionIdSchema>;
export type ConditionDefinition = z.infer<typeof conditionDefinitionSchema>;
