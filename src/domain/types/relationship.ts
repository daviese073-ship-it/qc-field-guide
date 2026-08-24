import type { z } from "zod";

import type {
  relationshipDirectionSchema,
  relationshipSchema,
  relationshipStrengthSchema,
  relationshipTypeSchema
} from "@/domain/schemas/relationship";

export type RelationshipType = z.infer<typeof relationshipTypeSchema>;
export type RelationshipDirection = z.infer<typeof relationshipDirectionSchema>;
export type RelationshipStrength = z.infer<typeof relationshipStrengthSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
