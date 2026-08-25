import process from "node:process";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries";

import {
  auditProductionContentDataset,
  formatProductionContentAuditReport
} from "./productionContentAudit";
import { validateCanonicalDataset } from "./validateCanonicalDataset";

try {
  const { dataset } = validateCanonicalDataset(productionCanonicalDataset);
  const report = auditProductionContentDataset(dataset);

  console.log(formatProductionContentAuditReport(report));

  if (!report.ok) {
    process.exit(1);
  }
} catch (error) {
  if (error instanceof CanonicalDataValidationError) {
    console.error(error.message);
    process.exit(1);
  }

  throw error;
}
