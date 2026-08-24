import type { z } from "zod";

import type { sectionSchema } from "@/domain/schemas/section";

export type Section = z.infer<typeof sectionSchema>;
