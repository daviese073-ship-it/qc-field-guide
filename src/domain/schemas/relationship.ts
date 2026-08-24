import { z } from "zod";

import { conditionIdSchema } from "@/domain/schemas/condition";
import { canonicalIdSchema } from "@/domain/schemas/content";
import { localizedStringSchema } from "@/domain/schemas/localization";

export const relationshipTypeSchema = z.enum([
  "REQUIRES",
  "INTERFACES_WITH",
  "GATED_BY",
  "TESTED_BY",
  "COMMISSIONED_BY",
  "PENETRATION_MANAGED_BY",
  "ACCESS_CHECKED_BY",
  "CLOSES_THROUGH",
  "AS_BUILT_FEEDS"
]);

export const relationshipDirectionSchema = z.enum(["directed", "reciprocal"]);

export const relationshipStrengthSchema = z.enum([
  "hard",
  "conditional",
  "coordination"
]);

export const relationshipSchema = z
  .object({
    id: canonicalIdSchema,
    sourceId: canonicalIdSchema,
    type: relationshipTypeSchema,
    targetId: canonicalIdSchema,
    direction: relationshipDirectionSchema,
    conditionId: conditionIdSchema.optional(),
    strength: relationshipStrengthSchema.optional(),
    note: localizedStringSchema.optional()
  })
  .strict();
