import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { CanonicalRegistries } from "@/domain/registries";
import type { GeneralQcProcess } from "@/domain/types";

export interface GeneralQcProcessAuditRow {
  id: string;
  sequence: number;
  title: string;
  workflow: number;
  capture: number;
  reminders: number;
  mistakes: number;
  outputs: number;
  related: number;
  additional: number;
}

export interface ProductionGeneralQcAuditResult {
  ok: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  rows: readonly GeneralQcProcessAuditRow[];
}

const expectedTitles = [
  "Inspection Planning",
  "Requirement Review",
  "ITP / PIE / PRIE Execution",
  "Hold & Witness Points",
  "Inspection & Acceptance",
  "Deficiency Reporting",
  "Non-Conformity Reporting (NCR)",
  "Corrective Action",
  "Reinspection & Verification",
  "Quality Evidence & Photo Documentation",
  "Testing & Test Records",
  "Material Receiving & Verification",
  "RFI / Technical Clarification",
  "Change & Revised Document Control",
  "Traceability",
  "Quality Closeout"
] as const;

const requiredFieldChecks: Array<{
  label: string;
  getCount: (process: GeneralQcProcess) => number;
}> = [
  {
    label: "fieldWorkflow",
    getCount: (process) => process.fieldWorkflow.length
  },
  {
    label: "whatToCapture",
    getCount: (process) => process.whatToCapture.length
  },
  { label: "keyReminders", getCount: (process) => process.keyReminders.length },
  {
    label: "commonMistakes",
    getCount: (process) => process.commonMistakes.length
  },
  {
    label: "typicalOutputs",
    getCount: (process) => process.typicalOutputs.length
  }
];

const uniqueValues = (values: readonly string[]) => new Set(values).size;

export const auditProductionGeneralQcDataset = (
  dataset: CanonicalDataset,
  registries: CanonicalRegistries
): ProductionGeneralQcAuditResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const processes = registries.generalQcProcesses.getAll();
  const rows = processes.map((process) => ({
    id: process.id,
    sequence: process.sequence,
    title: process.title.en,
    workflow: process.fieldWorkflow.length,
    capture: process.whatToCapture.length,
    reminders: process.keyReminders.length,
    mistakes: process.commonMistakes.length,
    outputs: process.typicalOutputs.length,
    related: process.relatedProcessIds.length,
    additional: process.additionalSections?.length ?? 0
  }));

  if (processes.length !== 16) {
    errors.push(
      `General QC process count must be 16; found ${processes.length}`
    );
  }

  const sequences = processes
    .map((process) => process.sequence)
    .sort((a, b) => a - b);
  const expectedSequences = Array.from({ length: 16 }, (_, index) => index + 1);

  if (JSON.stringify(sequences) !== JSON.stringify(expectedSequences)) {
    errors.push(
      `General QC sequences must be 1-16 exactly once; found ${sequences.join(", ")}`
    );
  }

  const titles = processes.map((process) => process.title.en);

  if (uniqueValues(titles) !== titles.length) {
    errors.push("General QC process titles must be unique");
  }

  expectedTitles.forEach((expectedTitle, index) => {
    const process = processes[index];

    if (!process || process.title.en !== expectedTitle) {
      errors.push(
        `General QC process ${String(index + 1).padStart(2, "0")} must be "${expectedTitle}"`
      );
    }
  });

  for (const process of processes) {
    if (!process.summary.en.trim()) {
      errors.push(`GeneralQcProcess "${process.id}" is missing summary`);
    }
    if (!process.whenToUse.en.trim()) {
      errors.push(`GeneralQcProcess "${process.id}" is missing whenToUse`);
    }
    for (const check of requiredFieldChecks) {
      if (check.getCount(process) === 0) {
        errors.push(
          `GeneralQcProcess "${process.id}" is missing ${check.label}`
        );
      }
    }
  }

  if (!dataset.generalQcUniversalReference) {
    errors.push("General QC Universal Field Reference must exist exactly once");
  } else {
    const reference = dataset.generalQcUniversalReference;

    if (reference.title.en !== "Universal Field Reference") {
      errors.push("General QC universal reference title must match the source");
    }
    if (reference.fieldPrinciple.length !== 6) {
      errors.push("General QC field principle must contain six source terms");
    }
    if (reference.beforeAnyInspection.length === 0) {
      errors.push("Universal Field Reference is missing Before Any Inspection");
    }
    if (reference.whenYouFindAProblem.length === 0) {
      errors.push(
        "Universal Field Reference is missing When You Find a Problem"
      );
    }
    if (reference.minimumUsefulQualityRecord.length === 0) {
      errors.push(
        "Universal Field Reference is missing Minimum Useful Quality Record"
      );
    }
    if (reference.importantLimitations.length === 0) {
      errors.push("Universal Field Reference is missing Important limitation");
    }
  }

  const missingFrench = processes.filter((process) => !process.title.fr).length;

  if (missingFrench > 0) {
    warnings.push(
      `French General QC process content is not authoritative yet; ${missingFrench} records rely on existing EN fallback behavior.`
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    rows
  };
};

export const formatProductionGeneralQcAuditReport = (
  result: ProductionGeneralQcAuditResult
) =>
  [
    "Production General QC process audit:",
    `General QC processes: ${result.rows.length}`,
    ...result.rows.map(
      (row) =>
        `${String(row.sequence).padStart(2, "0")} ${row.title}: workflow=${row.workflow}, capture=${row.capture}, reminders=${row.reminders}, mistakes=${row.mistakes}, outputs=${row.outputs}, related=${row.related}, additional=${row.additional}`
    ),
    ...result.warnings.map((warning) => `Warning: ${warning}`)
  ].join("\n");
