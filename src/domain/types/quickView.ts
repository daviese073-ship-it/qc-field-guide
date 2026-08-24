import type { z } from "zod";

import type {
  quickGateNextSchema,
  quickViewSchema
} from "@/domain/schemas/quickView";

export type QuickGateNext = z.infer<typeof quickGateNextSchema>;
export type QuickView = z.infer<typeof quickViewSchema>;
