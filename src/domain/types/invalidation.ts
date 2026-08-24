import type { z } from "zod";

import type {
  invalidationActionSchema,
  invalidationRuleSchema,
  invalidationSeveritySchema
} from "@/domain/schemas/invalidation";

export type InvalidationSeverity = z.infer<typeof invalidationSeveritySchema>;
export type InvalidationAction = z.infer<typeof invalidationActionSchema>;
export type InvalidationRule = z.infer<typeof invalidationRuleSchema>;
