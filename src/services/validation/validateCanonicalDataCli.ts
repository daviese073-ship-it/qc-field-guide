import process from "node:process";

import { phase003ValidationDataset } from "@/data/development/phase003ValidationDataset";
import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries";

import { validateCanonicalDataset } from "./validateCanonicalDataset";

try {
  const fixtureValidation = validateCanonicalDataset(phase003ValidationDataset);
  const productionValidation = validateCanonicalDataset(
    productionCanonicalDataset
  );

  console.log(
    [
      "Canonical data validation passed.",
      "Validated non-production Phase 003 fixture dataset.",
      `Fixture sections: ${fixtureValidation.registries.sections.getAll().length}`,
      `Fixture activities: ${fixtureValidation.registries.activities.getAll().length}`,
      `Fixture relationships: ${fixtureValidation.registries.relationships.getAll().length}`,
      "Validated Phase 009 production identity dataset.",
      `Production sections: ${productionValidation.registries.sections.getAll().length}`,
      `Production activities: ${productionValidation.registries.activities.getAll().length}`,
      `Production relationships: ${productionValidation.registries.relationships.getAll().length}`,
      `Production gates: ${productionValidation.registries.gates.getAll().length}`
    ].join("\n")
  );
} catch (error) {
  if (error instanceof CanonicalDataValidationError) {
    console.error(error.message);
    process.exit(1);
  }

  throw error;
}
