import { z } from "zod";

export const versionInfoSchema = z
  .object({
    schemaVersion: z.string().min(1),
    contentVersion: z.string().min(1),
    terminologyVersion: z.string().min(1)
  })
  .strict();
