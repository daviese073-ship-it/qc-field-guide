import process from "node:process";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries";

import {
  auditBatirTerminologyDataset,
  formatBatirTerminologyAuditReport
} from "./batirTerminologyAudit";
import { validateCanonicalDataset } from "./validateCanonicalDataset";

try {
  const productionValidation = validateCanonicalDataset(
    productionCanonicalDataset
  );
  const batirAudit = auditBatirTerminologyDataset(
    productionValidation.dataset
  );

  if (!batirAudit.ok) {
    throw new CanonicalDataValidationError(
      "BÂTIR terminology validation failed.",
      batirAudit.errors
    );
  }

  console.log(formatBatirTerminologyAuditReport(batirAudit));
} catch (error) {
  if (error instanceof CanonicalDataValidationError) {
    console.error(error.message);
    process.exit(1);
  }

  throw error;
}
