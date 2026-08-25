import process from "node:process";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries";

import {
  auditProductionSearchDataset,
  formatProductionSearchAuditReport
} from "./productionSearchAudit";
import { validateCanonicalDataset } from "./validateCanonicalDataset";

try {
  const productionValidation = validateCanonicalDataset(
    productionCanonicalDataset
  );
  const searchAudit = auditProductionSearchDataset(
    productionValidation.dataset,
    productionValidation.registries
  );

  if (!searchAudit.ok) {
    throw new CanonicalDataValidationError(
      "Production search validation failed.",
      searchAudit.errors
    );
  }

  console.log(formatProductionSearchAuditReport(searchAudit));
} catch (error) {
  if (error instanceof CanonicalDataValidationError) {
    console.error(error.message);
    process.exit(1);
  }

  throw error;
}
