import process from "node:process";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries";

import {
  auditProductionGeneralQcDataset,
  formatProductionGeneralQcAuditReport
} from "./productionGeneralQcAudit";
import { validateCanonicalDataset } from "./validateCanonicalDataset";

try {
  const productionValidation = validateCanonicalDataset(
    productionCanonicalDataset
  );
  const audit = auditProductionGeneralQcDataset(
    productionValidation.dataset,
    productionValidation.registries
  );

  if (!audit.ok) {
    throw new CanonicalDataValidationError(
      "Production General QC process validation failed.",
      audit.errors
    );
  }

  console.log(formatProductionGeneralQcAuditReport(audit));
} catch (error) {
  if (error instanceof CanonicalDataValidationError) {
    console.error(error.message);
    process.exit(1);
  }

  throw error;
}
