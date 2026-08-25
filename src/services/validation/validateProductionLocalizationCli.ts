import process from "node:process";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries";

import {
  auditProductionLocalizationDataset,
  formatProductionLocalizationAuditReport
} from "./productionLocalizationAudit";
import { validateCanonicalDataset } from "./validateCanonicalDataset";

try {
  const productionValidation = validateCanonicalDataset(
    productionCanonicalDataset
  );
  const localizationAudit = auditProductionLocalizationDataset(
    productionValidation.dataset,
    productionValidation.registries
  );

  if (!localizationAudit.ok) {
    throw new CanonicalDataValidationError(
      "Canonical production localization validation failed.",
      localizationAudit.errors
    );
  }

  console.log(formatProductionLocalizationAuditReport(localizationAudit));
} catch (error) {
  if (error instanceof CanonicalDataValidationError) {
    console.error(error.message);
    process.exit(1);
  }

  throw error;
}
