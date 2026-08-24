import process from "node:process";

import { phase003ValidationDataset } from "@/data/development/phase003ValidationDataset";
import { CanonicalDataValidationError } from "@/domain/registries";

import { validateCanonicalDataset } from "./validateCanonicalDataset";

try {
  const { registries } = validateCanonicalDataset(phase003ValidationDataset);

  console.log(
    [
      "Phase 003 canonical data validation passed.",
      "Validated non-production fixture dataset only.",
      `Sections: ${registries.sections.getAll().length}`,
      `Activities: ${registries.activities.getAll().length}`,
      `Relationships: ${registries.relationships.getAll().length}`,
      "Production dataset validation is not implemented in this phase."
    ].join("\n")
  );
} catch (error) {
  if (error instanceof CanonicalDataValidationError) {
    console.error(error.message);
    process.exit(1);
  }

  throw error;
}
