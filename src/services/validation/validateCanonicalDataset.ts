import type { CanonicalDataset } from "@/data/canonicalDataset";
import { loadCanonicalDataset } from "@/data/loadCanonicalDataset";
import {
  buildCanonicalRegistries,
  CanonicalDataValidationError,
  type CanonicalRegistries
} from "@/domain/registries";

import { validateReferentialIntegrity } from "./canonicalIntegrity";

export interface ValidatedCanonicalDataset {
  dataset: CanonicalDataset;
  registries: CanonicalRegistries;
}

export const validateCanonicalDataset = (
  raw: unknown
): ValidatedCanonicalDataset => {
  const dataset = loadCanonicalDataset(raw);
  const registries = buildCanonicalRegistries(dataset);
  const errors = validateReferentialIntegrity(registries);

  if (errors.length > 0) {
    throw new CanonicalDataValidationError(
      "Canonical dataset referential-integrity validation failed.",
      errors
    );
  }

  return { dataset, registries };
};
