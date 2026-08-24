import { ZodError } from "zod";

import {
  canonicalDatasetSchema,
  type CanonicalDataset
} from "@/data/canonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries/registry";

const formatSchemaIssue = (issue: ZodError["issues"][number]) => {
  const path = issue.path.length > 0 ? issue.path.join(".") : "dataset";

  return `Schema error at ${path}: ${issue.message}`;
};

export const loadCanonicalDataset = (raw: unknown): CanonicalDataset => {
  const result = canonicalDatasetSchema.safeParse(raw);

  if (!result.success) {
    throw new CanonicalDataValidationError(
      "Canonical dataset schema validation failed.",
      result.error.issues.map(formatSchemaIssue)
    );
  }

  return result.data;
};
