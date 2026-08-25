import process from "node:process";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries";

import {
  auditProductionWorkflowDataset,
  formatProductionWorkflowAuditReport
} from "./productionWorkflowAudit";
import { validateCanonicalDataset } from "./validateCanonicalDataset";

try {
  const productionValidation = validateCanonicalDataset(
    productionCanonicalDataset
  );
  const workflowAudit = auditProductionWorkflowDataset(
    productionValidation.dataset,
    productionValidation.registries
  );

  if (!workflowAudit.ok) {
    throw new CanonicalDataValidationError(
      "Canonical production workflow validation failed.",
      workflowAudit.errors
    );
  }

  console.log(formatProductionWorkflowAuditReport(workflowAudit));
} catch (error) {
  if (error instanceof CanonicalDataValidationError) {
    console.error(error.message);
    process.exit(1);
  }

  throw error;
}
