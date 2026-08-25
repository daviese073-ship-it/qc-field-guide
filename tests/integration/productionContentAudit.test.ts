import { describe, expect, it } from "vitest";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import type { CanonicalDataset } from "@/data/canonicalDataset";
import {
  auditProductionContentDataset,
  formatProductionContentAuditReport
} from "@/services/validation/productionContentAudit";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

const validatedProductionDataset = (): CanonicalDataset =>
  validateCanonicalDataset(structuredClone(productionCanonicalDataset)).dataset;

const removeTechnicalContent = (dataset: CanonicalDataset) => {
  const activity = dataset.activities[0];

  delete activity.qualityObjective;
  delete activity.applicability;
  delete activity.authorityNote;
  delete activity.requirements;
  delete activity.planning;
  delete activity.documentControl;
  delete activity.materialControl;
  delete activity.inspection;
  delete activity.evidence;
  delete activity.issues;
  delete activity.correctiveAction;
  delete activity.verification;
  delete activity.closureCriteria;
  delete activity.communications;
  delete activity.outputs;
  delete activity.reportingAnalysis;
  delete activity.qualityCheckpoint;
  delete activity.specialistBoundary;
};

describe("Phase 010 production content audit", () => {
  it("formats a passing production-content report with the completion counts", () => {
    const report = auditProductionContentDataset(validatedProductionDataset());

    expect(formatProductionContentAuditReport(report)).toContain(
      "Activities with substantive Build 2 content: 139"
    );
  });

  it("fails when an activity remains identity-only", () => {
    const dataset = validatedProductionDataset();
    removeTechnicalContent(dataset);

    const report = auditProductionContentDataset(dataset);

    expect(report.ok).toBe(false);
    expect(report.errors).toContain(
      'Production activity "1.1" remains identity-only after Phase 010.'
    );
  });

  it("fails on duplicate production content item IDs", () => {
    const dataset = validatedProductionDataset();
    const firstRequirements = dataset.activities[0].requirements ?? [];
    const firstParagraph = firstRequirements.find(
      (block) => block.type === "paragraph"
    );
    const secondParagraph = firstRequirements
      .filter((block) => block.type === "paragraph")
      .at(1);

    expect(firstParagraph?.type).toBe("paragraph");
    expect(secondParagraph?.type).toBe("paragraph");

    if (firstParagraph?.type === "paragraph" && secondParagraph?.type === "paragraph") {
      secondParagraph.item.id = firstParagraph.item.id;
    }

    const report = auditProductionContentDataset(dataset);

    expect(report.ok).toBe(false);
    expect(report.errors.join("\n")).toMatch(
      /Duplicate production content item ID/
    );
  });

  it("fails on placeholder-like production strings", () => {
    const dataset = validatedProductionDataset();

    dataset.activities[0].qualityObjective = { en: "Coming soon" };

    const report = auditProductionContentDataset(dataset);

    expect(report.ok).toBe(false);
    expect(report.errors.join("\n")).toMatch(/placeholder-like text/);
  });

  it("does not treat authorized Phase 015 workflow records as Phase 010 technical content failures", () => {
    const report = auditProductionContentDataset(validatedProductionDataset());

    expect(report.ok).toBe(true);
  });
});
