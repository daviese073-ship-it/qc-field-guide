import type { z } from "zod";

import type {
  activitySchema,
  nodeTagSchema,
  statusFamilySchema,
  userVisibleFlagSchema
} from "@/domain/schemas/activity";

export type NodeTag = z.infer<typeof nodeTagSchema>;
export type StatusFamily = z.infer<typeof statusFamilySchema>;
export type UserVisibleFlag = z.infer<typeof userVisibleFlagSchema>;
export type Activity = z.infer<typeof activitySchema>;
