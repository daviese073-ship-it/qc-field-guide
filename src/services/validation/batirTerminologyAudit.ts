import batirAudit from "@/data/terminology/batir-audit.json";
import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { TerminologyConcept } from "@/domain/types";

export interface BatirTerminologyAuditReport {
  ok: boolean;
  errors: readonly string[];
  sheetNames: readonly string[];
  rowsParsed: Readonly<Record<string, number>>;
  totalRowsParsed: number;
  candidateRelevantRows: number;
  candidateRelevantConcepts: number;
  canonicalConceptsCreated: number;
  existingConceptsMatchedWithoutOverride: number;
  duplicatesConsolidated: number;
  irrelevantOrUnmappedRows: number;
  ambiguousEntries: readonly string[];
  preferredTerminologyConflicts: readonly string[];
  parsingErrors: readonly string[];
  importedConceptCount: number;
}

const expectedSheetNames = [
  "Buildings",
  "Infrastructure",
  "Gestion de projet"
] as const;

const isBatirConcept = (concept: TerminologyConcept) =>
  concept.sourceRef?.document === "batir data.xlsx";

export const auditBatirTerminologyDataset = (
  dataset: CanonicalDataset
): BatirTerminologyAuditReport => {
  const errors: string[] = [];
  const importedConceptCount = dataset.terminology.filter(isBatirConcept).length;

  for (const sheetName of expectedSheetNames) {
    if (!batirAudit.sheetNames.includes(sheetName)) {
      errors.push(`BÂTIR sheet "${sheetName}" was not parsed.`);
    }
    if ((batirAudit.rowsParsed as Record<string, number>)[sheetName] <= 0) {
      errors.push(`BÂTIR sheet "${sheetName}" has no parsed rows.`);
    }
  }

  if (batirAudit.totalRowsParsed !== 2130) {
    errors.push(
      `Expected 2,130 BÂTIR rows; found ${batirAudit.totalRowsParsed}.`
    );
  }
  if (batirAudit.candidateRelevantRows <= 0) {
    errors.push("BÂTIR audit found no relevant terminology candidates.");
  }
  if (batirAudit.canonicalConceptsCreated <= 0) {
    errors.push("BÂTIR audit created no canonical terminology concepts.");
  }
  if (importedConceptCount !== batirAudit.canonicalConceptsCreated) {
    errors.push(
      `BÂTIR audit expected ${batirAudit.canonicalConceptsCreated} imported concepts; found ${importedConceptCount}.`
    );
  }
  if (batirAudit.parsingErrors.length > 0) {
    errors.push(
      `BÂTIR workbook parsing errors: ${batirAudit.parsingErrors.join("; ")}`
    );
  }
  if (batirAudit.preferredTerminologyConflicts.length > 0) {
    errors.push(
      `BÂTIR preferred-terminology conflicts require review: ${batirAudit.preferredTerminologyConflicts.join(
        "; "
      )}`
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    sheetNames: batirAudit.sheetNames,
    rowsParsed: batirAudit.rowsParsed,
    totalRowsParsed: batirAudit.totalRowsParsed,
    candidateRelevantRows: batirAudit.candidateRelevantRows,
    candidateRelevantConcepts: batirAudit.candidateRelevantConcepts,
    canonicalConceptsCreated: batirAudit.canonicalConceptsCreated,
    existingConceptsMatchedWithoutOverride:
      batirAudit.existingConceptsMatchedWithoutOverride,
    duplicatesConsolidated: batirAudit.duplicatesConsolidated,
    irrelevantOrUnmappedRows: batirAudit.irrelevantOrUnmappedRows,
    ambiguousEntries: batirAudit.ambiguousEntries,
    preferredTerminologyConflicts: batirAudit.preferredTerminologyConflicts,
    parsingErrors: batirAudit.parsingErrors,
    importedConceptCount
  };
};

export const formatBatirTerminologyAuditReport = (
  report: BatirTerminologyAuditReport
) => {
  const lines = report.ok
    ? ["Phase 013A BÂTIR terminology audit passed."]
    : [
        "Phase 013A BÂTIR terminology audit failed.",
        ...report.errors.map((error) => `- ${error}`)
      ];

  return [
    ...lines,
    `BÂTIR sheets: ${report.sheetNames.join(", ")}`,
    `BÂTIR rows parsed: ${report.totalRowsParsed}`,
    `BÂTIR rows by sheet: ${Object.entries(report.rowsParsed)
      .map(([sheetName, count]) => `${sheetName}=${count}`)
      .join(", ")}`,
    `Relevant candidate rows: ${report.candidateRelevantRows}`,
    `Relevant candidate concepts: ${report.candidateRelevantConcepts}`,
    `Canonical concepts created: ${report.canonicalConceptsCreated}`,
    `Existing concepts matched without override: ${report.existingConceptsMatchedWithoutOverride}`,
    `Duplicates consolidated: ${report.duplicatesConsolidated}`,
    `Irrelevant/unmapped rows: ${report.irrelevantOrUnmappedRows}`,
    `Ambiguous entries recorded: ${report.ambiguousEntries.length}`,
    `Preferred-terminology conflicts: ${report.preferredTerminologyConflicts.length}`,
    `Parsing errors: ${report.parsingErrors.length}`
  ].join("\n");
};
