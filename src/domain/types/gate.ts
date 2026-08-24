import type { z } from "zod";

import type { gateSchema, gateTypeSchema } from "@/domain/schemas/gate";

export type GateType = z.infer<typeof gateTypeSchema>;
export type Gate = z.infer<typeof gateSchema>;
