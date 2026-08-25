import process from "node:process";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries";

import {
  auditProductionPresentationDataset,
  formatProductionPresentationAuditReport
} from "./productionPresentationAudit";
import { validateCanonicalDataset } from "./validateCanonicalDataset";

try {
  const productionValidation = validateCanonicalDataset(
    productionCanonicalDataset
  );
  const presentationAudit = auditProductionPresentationDataset(
    productionValidation.dataset,
    productionValidation.registries
  );

  if (!presentationAudit.ok) {
    throw new CanonicalDataValidationError(
      "Canonical production presentation validation failed.",
      presentationAudit.errors
    );
  }

  console.log(formatProductionPresentationAuditReport(presentationAudit));
} catch (error) {
  if (error instanceof CanonicalDataValidationError) {
    console.error(error.message);
    process.exit(1);
  }

  throw error;
}
