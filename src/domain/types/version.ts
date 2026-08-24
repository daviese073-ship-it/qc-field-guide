import type { z } from "zod";

import type { versionInfoSchema } from "@/domain/schemas/version";

export type VersionInfo = z.infer<typeof versionInfoSchema>;
