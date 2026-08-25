import { describe, expect, it } from "vitest";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { auditProductionContentDataset } from "@/services/validation/productionContentAudit";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

describe("Phase 009 production identity dataset", () => {
  it("validates the complete production section and activity identity seed", () => {
    const { registries } = validateCanonicalDataset(productionCanonicalDataset);

    expect(registries.sections.getAll()).toHaveLength(14);
    expect(registries.activities.getAll()).toHaveLength(139);
    expect(registries.sections.getAll().map((section) => section.id)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14"
    ]);
  });

  it("keeps all production section and activity IDs unique strings", () => {
    const sectionIds = productionCanonicalDataset.sections.map(
      (section) => section.id
    );
    const activityIds = productionCanonicalDataset.activities.map(
      (activity) => activity.id
    );

    expect(sectionIds.every((id) => typeof id === "string")).toBe(true);
    expect(activityIds.every((id) => typeof id === "string")).toBe(true);
    expect(new Set(sectionIds).size).toBe(14);
    expect(new Set(activityIds).size).toBe(139);
    expect(activityIds).not.toContain(10.3);
  });

  it("preserves Build 3 canonical activity identity samples", () => {
    const { registries } = validateCanonicalDataset(productionCanonicalDataset);

    expect(registries.activities.getById("1.1")?.title.en).toBe(
      "Existing Conditions"
    );
    expect(registries.activities.getById("10.3")?.title.en).toBe(
      "Firestopping"
    );
    expect(registries.activities.getById("11.7")?.title.en).toBe(
      "Universal Penetrations"
    );
    expect(registries.activities.getById("14.15")?.title.en).toBe(
      "Turnover / Acceptance"
    );
  });

  it("resolves every production activity to an existing production section", () => {
    const { registries } = validateCanonicalDataset(productionCanonicalDataset);

    for (const activity of registries.activities.getAll()) {
      expect(registries.sections.has(activity.sectionId)).toBe(true);
    }
  });

  it("keeps canonical activity ordering deterministic within sections", () => {
    const { registries } = validateCanonicalDataset(productionCanonicalDataset);

    expect(
      registries.activities
        .getActivitiesBySection("14")
        .map((activity) => activity.id)
    ).toEqual([
      "14.1",
      "14.2",
      "14.3",
      "14.4",
      "14.5",
      "14.6",
      "14.7",
      "14.8",
      "14.9",
      "14.10",
      "14.11",
      "14.12",
      "14.13",
      "14.14",
      "14.15"
    ]);
  });

  it("keeps the production seed separate from the fictional Phase 003 fixture", () => {
    const serializedProductionDataset = JSON.stringify(
      productionCanonicalDataset
    );

    expect(serializedProductionDataset).not.toContain("Fictional");
    expect(serializedProductionDataset).not.toContain("REL-FIXTURE");
    expect(serializedProductionDataset).not.toContain("TERM-FIXTURE");
    expect(
      productionCanonicalDataset.activities.some(
        (activity) => activity.title.en === "Fictional Activity"
      )
    ).toBe(false);
  });

  it("passes the Phase 010 production content completeness audit", () => {
    const { dataset } = validateCanonicalDataset(productionCanonicalDataset);
    const report = auditProductionContentDataset(dataset);

    expect(report.ok).toBe(true);
    expect(report.sectionCount).toBe(14);
    expect(report.activityCount).toBe(139);
    expect(report.substantiveActivityCount).toBe(139);
    expect(report.identityOnlyActivityIds).toEqual([]);
    expect(report.contentItemCount).toBeGreaterThan(1000);
  });

  it("does not populate production logic, relationships, presentation, terminology, or search data", () => {
    expect(productionCanonicalDataset.relationships).toHaveLength(0);
    expect(productionCanonicalDataset.gates).toHaveLength(0);
    expect(productionCanonicalDataset.conditions).toHaveLength(0);
    expect(productionCanonicalDataset.invalidationRules).toHaveLength(0);
    expect(productionCanonicalDataset.quickViews).toHaveLength(0);
    expect(productionCanonicalDataset.learnContent).toHaveLength(0);
    expect(productionCanonicalDataset.workflows).toHaveLength(0);
    expect(productionCanonicalDataset.preConcealmentWorkflows).toHaveLength(0);
    expect(productionCanonicalDataset.terminology).toHaveLength(0);
    expect(productionCanonicalDataset.acronyms).toHaveLength(0);
    expect(productionCanonicalDataset.uiStrings).toHaveLength(0);
    expect("searchIndex" in productionCanonicalDataset).toBe(false);
  });

  it("defers French identity fields without creating language-specific duplicate IDs", () => {
    const ids = productionCanonicalDataset.activities.map(
      (activity) => activity.id
    );

    expect(ids.some((id) => id.endsWith("-en") || id.endsWith("-fr"))).toBe(
      false
    );
    expect(
      productionCanonicalDataset.sections.some((section) => "fr" in section.title)
    ).toBe(false);
    expect(
      productionCanonicalDataset.activities.some(
        (activity) => "fr" in activity.title
      )
    ).toBe(false);
  });
});
