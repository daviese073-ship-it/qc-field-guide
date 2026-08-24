import type { z } from "zod";

import type { learnContentSchema } from "@/domain/schemas/learnContent";

export type LearnContent = z.infer<typeof learnContentSchema>;
