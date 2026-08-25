import process from "node:process";

import { phase003ValidationDataset } from "@/data/development/phase003ValidationDataset";
import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries";

import {
  auditProductionContentDataset,
  formatProductionContentAuditReport
} from "./productionContentAudit";
import {
  auditProductionLogicDataset,
  formatProductionLogicAuditReport
} from "./productionLogicAudit";
import { validateCanonicalDataset } from "./validateCanonicalDataset";

try {
  const fixtureValidation = validateCanonicalDataset(phase003ValidationDataset);
  const productionValidation = validateCanonicalDataset(
    productionCanonicalDataset
  );
  const contentAudit = auditProductionContentDataset(
    productionValidation.dataset
  );
  const logicAudit = auditProductionLogicDataset(productionValidation.dataset);

  if (!contentAudit.ok) {
    throw new CanonicalDataValidationError(
      "Canonical production content validation failed.",
      contentAudit.errors
    );
  }

  if (!logicAudit.ok) {
    throw new CanonicalDataValidationError(
      "Canonical production logic validation failed.",
      logicAudit.errors
    );
  }

  console.log(
    [
      "Canonical data validation passed.",
      "Validated non-production Phase 003 fixture dataset.",
      `Fixture sections: ${fixtureValidation.registries.sections.getAll().length}`,
      `Fixture activities: ${fixtureValidation.registries.activities.getAll().length}`,
      `Fixture relationships: ${fixtureValidation.registries.relationships.getAll().length}`,
      "Validated production canonical dataset.",
      `Production sections: ${productionValidation.registries.sections.getAll().length}`,
      `Production activities: ${productionValidation.registries.activities.getAll().length}`,
      `Production relationships: ${productionValidation.registries.relationships.getAll().length}`,
      `Production gates: ${productionValidation.registries.gates.getAll().length}`,
      formatProductionContentAuditReport(contentAudit),
      formatProductionLogicAuditReport(logicAudit)
    ].join("\n")
  );
} catch (error) {
  if (error instanceof CanonicalDataValidationError) {
    console.error(error.message);
    process.exit(1);
  }

  throw error;
}
