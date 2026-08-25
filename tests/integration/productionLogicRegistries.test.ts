import { describe, expect, it } from "vitest";

import type { CanonicalDataset } from "@/data/canonicalDataset";
import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries";
import {
  auditProductionLogicDataset,
  expectedProductionConditionIds,
  expectedProductionGateIds,
  expectedProductionInvalidationRuleIds,
  formatProductionLogicAuditReport
} from "@/services/validation/productionLogicAudit";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

const validatedProductionDataset = (): CanonicalDataset =>
  validateCanonicalDataset(structuredClone(productionCanonicalDataset)).dataset;

describe("Phase 011 production logic registries", () => {
  it("loads the complete Build 3 condition, gate, and invalidation registries", () => {
    const { registries } = validateCanonicalDataset(productionCanonicalDataset);

    expect(registries.conditions.getAll()).toHaveLength(14);
    expect(registries.gates.getAll()).toHaveLength(15);
    expect(registries.invalidationRules.getAll()).toHaveLength(37);
  });

  it("matches the exact Build 3 condition vocabulary", () => {
    const { registries } = validateCanonicalDataset(productionCanonicalDataset);

    expect(registries.conditions.getAll().map((condition) => condition.id)).toEqual(
      [...expectedProductionConditionIds].sort()
    );
  });

  it("matches the exact Build 3 gate inventory with roof stage gates preserved", () => {
    const { registries } = validateCanonicalDataset(productionCanonicalDataset);

    expect(registries.gates.getAll().map((gate) => gate.id)).toEqual(
      [...expectedProductionGateIds].sort()
    );
    expect(registries.gates.has("G-ROOF-01")).toBe(false);
    expect(registries.gates.has("G-ROOF-01D")).toBe(true);
  });

  it("matches the exact Build 3 invalidation trigger registry", () => {
    const { registries } = validateCanonicalDataset(productionCanonicalDataset);

    expect(
      registries.invalidationRules.getAll().map((rule) => rule.id)
    ).toEqual([...expectedProductionInvalidationRuleIds].sort());
  });

  it("passes the Phase 011 production logic audit with counts and coverage", () => {
    const report = auditProductionLogicDataset(validatedProductionDataset());

    expect(report.ok).toBe(true);
    expect(report.conditionCount).toBe(14);
    expect(report.gateCount).toBe(15);
    expect(report.invalidationRuleCount).toBe(37);
    expect(report.gateTypes).toEqual(["CONDITIONAL_HARD", "HARD"]);
    expect(report.invalidationSeverities).toEqual(["high", "low", "medium"]);
    expect(report.invalidationActions).toEqual([
      "FLAG_FOR_REVIEW",
      "INVALIDATE_TEST",
      "REOPEN_ACTIVITY",
      "REOPEN_GATE",
      "UPDATE_RECORD_REQUIRED"
    ]);
    expect(formatProductionLogicAuditReport(report)).toContain(
      "Production invalidation rules: 37"
    );
  });

  it("resolves gate prerequisite, downstream, and invalidation references", () => {
    const { registries } = validateCanonicalDataset(productionCanonicalDataset);
    const gate = registries.gates.getById("G-STR-01");

    expect(gate?.prerequisiteActivityIds?.every((id) => registries.activities.has(id))).toBe(
      true
    );
    expect(gate?.downstreamActivityIds?.every((id) => registries.activities.has(id))).toBe(
      true
    );
    expect(
      gate?.invalidationRuleIds?.every((id) =>
        registries.invalidationRules.has(id)
      )
    ).toBe(true);
  });

  it("resolves invalidation affected activities, gates, and conditions", () => {
    const { registries } = validateCanonicalDataset(productionCanonicalDataset);
    const rule = registries.invalidationRules.getById(
      "INV-FLS-NEW-RATED-PENETRATION"
    );

    expect(rule?.affectedActivityIds?.every((id) => registries.activities.has(id))).toBe(
      true
    );
    expect(rule?.affectedGateIds?.every((id) => registries.gates.has(id))).toBe(
      true
    );
    expect(rule?.conditionId).toBe("whereFireSeparation");
    expect(registries.conditions.has(rule?.conditionId ?? "")).toBe(true);
  });

  it("fails when a production gate references a missing activity", () => {
    const dataset = validatedProductionDataset();

    dataset.gates[0].prerequisiteActivityIds = ["999.999"];

    expect(() => validateCanonicalDataset(dataset)).toThrow(
      CanonicalDataValidationError
    );
  });

  it("fails when an invalidation rule references a missing gate", () => {
    const dataset = validatedProductionDataset();

    dataset.invalidationRules[0].affectedGateIds = ["G-MISSING"];

    expect(() => validateCanonicalDataset(dataset)).toThrow(
      CanonicalDataValidationError
    );
  });

  it("fails the logic audit when a gate ID outside the Build 3 inventory appears", () => {
    const dataset = validatedProductionDataset();

    dataset.gates.push({
      id: "G-INVENTED-01",
      title: { en: "Invented Gate" },
      gateType: "HARD"
    });

    const report = auditProductionLogicDataset(dataset);

    expect(report.ok).toBe(false);
    expect(report.errors).toContain(
      'Unsupported production gate ID "G-INVENTED-01".'
    );
  });

  it("fails the logic audit when duplicate gate content item IDs appear", () => {
    const dataset = validatedProductionDataset();
    const firstGate = dataset.gates[0];
    const secondGate = dataset.gates[1];
    const firstBlock = firstGate.checkItems?.[0];
    const secondBlock = secondGate.checkItems?.[0];

    expect(firstBlock?.type).toBe("checkList");
    expect(secondBlock?.type).toBe("checkList");

    if (firstBlock?.type === "checkList" && secondBlock?.type === "checkList") {
      secondBlock.items[0].id = firstBlock.items[0].id;
    }

    const report = auditProductionLogicDataset(dataset);

    expect(report.ok).toBe(false);
    expect(report.errors.join("\n")).toMatch(
      /Duplicate production logic content item ID/
    );
  });

  it("fails the logic audit if a forbidden project-QMS field appears", () => {
    const dataset = validatedProductionDataset();

    Object.assign(dataset.gates[0], { approvedBy: "Inspector" });

    const report = auditProductionLogicDataset(dataset);

    expect(report.ok).toBe(false);
    expect(report.errors.join("\n")).toContain(
      'Gate "G-STR-01" contains forbidden project-QMS field "approvedBy".'
    );
  });

  it("continues to defer Phase 012 production relationship records", () => {
    const report = auditProductionLogicDataset(validatedProductionDataset());

    expect(report.ok).toBe(true);
    expect(productionCanonicalDataset.relationships).toHaveLength(0);
  });
});
