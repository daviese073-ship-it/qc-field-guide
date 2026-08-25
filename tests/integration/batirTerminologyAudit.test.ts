import { describe, expect, it } from "vitest";

import batirAudit from "@/data/terminology/batir-audit.json";
import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import {
  auditBatirTerminologyDataset,
  formatBatirTerminologyAuditReport
} from "@/services/validation/batirTerminologyAudit";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

describe("Phase 013A BÂTIR terminology audit", () => {
  it("records deterministic workbook parsing coverage", () => {
    expect(batirAudit.sheetNames).toEqual([
      "Buildings",
      "Infrastructure",
      "Gestion de projet"
    ]);
    expect(batirAudit.rowsParsed).toEqual({
      Buildings: 1284,
      Infrastructure: 606,
      "Gestion de projet": 240
    });
    expect(batirAudit.totalRowsParsed).toBe(2130);
    expect(batirAudit.parsingErrors).toEqual([]);
  });

  it("reports relevant candidates without treating every row as a concept", () => {
    expect(batirAudit.candidateRelevantRows).toBe(385);
    expect(batirAudit.candidateRelevantConcepts).toBe(201);
    expect(batirAudit.canonicalConceptsCreated).toBe(120);
    expect(batirAudit.irrelevantOrUnmappedRows).toBe(1745);
    expect(batirAudit.duplicatesConsolidated).toBe(184);
  });

  it("loads BÂTIR-derived concepts into the canonical terminology registry", () => {
    const validation = validateCanonicalDataset(productionCanonicalDataset);
    const report = auditBatirTerminologyDataset(validation.dataset);

    expect(report.ok).toBe(true);
    expect(report.importedConceptCount).toBe(120);
    expect(formatBatirTerminologyAuditReport(report)).toContain(
      "Canonical concepts created: 120"
    );
    expect(
      validation.registries.terminology.getById(
        "TERM-BATIR-ENVELOPE-SEALANT"
      )?.preferred.fr
    ).toBe("produit de scellement");
  });

  it("records ambiguous BÂTIR entries instead of silently resolving them", () => {
    expect(batirAudit.ambiguousEntries).toContain("sealant");
    expect(batirAudit.preferredTerminologyConflicts).toEqual([]);
  });
});
