import { describe, expect, it } from "vitest";

import type { CanonicalDataset } from "@/data/canonicalDataset";
import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { CanonicalDataValidationError } from "@/domain/registries";
import { createRelationshipService } from "@/services/relationships";
import {
  auditProductionRelationshipDataset,
  expectedProductionRelationshipCount,
  expectedProductionRelationshipCountsByCondition,
  expectedProductionRelationshipCountsByStrength,
  expectedProductionRelationshipCountsByType,
  formatProductionRelationshipAuditReport
} from "@/services/validation/productionRelationshipAudit";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

const validatedProduction = () =>
  validateCanonicalDataset(structuredClone(productionCanonicalDataset));

const validatedProductionDataset = (): CanonicalDataset =>
  validatedProduction().dataset;

const createProductionRelationshipService = () => {
  const { registries } = validatedProduction();

  return createRelationshipService(registries);
};

const ids = (items: readonly { relatedNodeId: string }[]) =>
  items.map((item) => item.relatedNodeId);

describe("Phase 012 production relationship registry", () => {
  it("loads the complete Build 3 production relationship registry", () => {
    const { registries } = validatedProduction();

    expect(registries.relationships.getAll()).toHaveLength(
      expectedProductionRelationshipCount
    );
  });

  it("passes the Phase 012 production relationship audit with exact counts", () => {
    const { dataset, registries } = validatedProduction();
    const report = auditProductionRelationshipDataset(dataset, registries);

    expect(report.ok).toBe(true);
    expect(report.relationshipCount).toBe(350);
    expect(report.countsByType).toEqual(
      expectedProductionRelationshipCountsByType
    );
    expect(report.countsByStrength).toEqual(
      expectedProductionRelationshipCountsByStrength
    );
    expect(report.countsByCondition).toEqual(
      expectedProductionRelationshipCountsByCondition
    );
    expect(report.unresolvedEndpointCount).toBe(0);
    expect(formatProductionRelationshipAuditReport(report)).toContain(
      "Production relationships: 350"
    );
  });

  it("fails canonical validation when a relationship endpoint is missing", () => {
    const dataset = validatedProductionDataset();

    dataset.relationships[0].targetId = "99.99";

    expect(() => validateCanonicalDataset(dataset)).toThrow(
      CanonicalDataValidationError
    );
  });

  it("fails the relationship audit on a reverse REQUIRES duplicate", () => {
    const { dataset, registries } = validatedProduction();

    dataset.relationships.push({
      id: "REL-2.4-REQUIRES-2.5",
      sourceId: "2.4",
      type: "REQUIRES",
      targetId: "2.5",
      direction: "directed",
      strength: "hard"
    });

    const report = auditProductionRelationshipDataset(dataset, registries);

    expect(report.ok).toBe(false);
    expect(report.errors.join("\n")).toContain("Reverse REQUIRES duplicate");
  });

  it("fails the relationship audit on a reciprocal INTERFACES_WITH duplicate", () => {
    const { dataset, registries } = validatedProduction();

    dataset.relationships.push({
      id: "REL-10.4-INTERFACES_WITH-8.5-whereFireSeparation",
      sourceId: "10.4",
      type: "INTERFACES_WITH",
      targetId: "8.5",
      direction: "reciprocal",
      conditionId: "whereFireSeparation",
      strength: "conditional"
    });

    const report = auditProductionRelationshipDataset(dataset, registries);

    expect(report.ok).toBe(false);
    expect(report.errors.join("\n")).toContain(
      "Duplicate reciprocal INTERFACES_WITH pair"
    );
  });

  it("derives REQUIRES Before and After from one stored downstream-to-prerequisite edge", () => {
    const service = createProductionRelationshipService();

    expect(ids(service.getBefore("2.5"))).toContain("2.4");
    expect(ids(service.getAfter("2.4"))).toContain("2.5");
    expect(
      productionCanonicalDataset.relationships.some(
        (relationship) =>
          relationship.type === "REQUIRES" &&
          relationship.sourceId === "2.4" &&
          relationship.targetId === "2.5"
      )
    ).toBe(false);
  });

  it("derives reciprocal INTERFACES_WITH visibility from one stored edge", () => {
    const service = createProductionRelationshipService();

    expect(ids(service.getInterfaces("8.5"))).toContain("10.4");
    expect(ids(service.getInterfaces("10.4"))).toContain("8.5");
  });

  it("derives gate navigation and reverse controlled activities", () => {
    const service = createProductionRelationshipService();

    expect(ids(service.getGates("6.4"))).toContain("G-INT-01");
    expect(ids(service.getControlledByGate("G-INT-01"))).toEqual(
      expect.arrayContaining(["6.4", "6.8", "10.3"])
    );
  });

  it("derives testing and reverse tested systems", () => {
    const service = createProductionRelationshipService();

    expect(ids(service.getTesting("4.8"))).toContain("13.5");
    expect(ids(service.getTestedSystems("13.5"))).toEqual(
      expect.arrayContaining(["4.1", "4.8", "4.9", "5.9"])
    );
  });

  it("derives commissioning relationships", () => {
    const service = createProductionRelationshipService();

    expect(ids(service.getCommissioning("8.6"))).toEqual(
      expect.arrayContaining(["13.6", "13.7"])
    );
  });

  it("derives penetration and access workflow hubs", () => {
    const service = createProductionRelationshipService();

    expect(ids(service.getWorkflows("8.9"))).toContain("11.7");
    expect(ids(service.getWorkflows("8.6"))).toContain("11.10");
  });

  it("derives closeout and as-built impacts", () => {
    const service = createProductionRelationshipService();

    expect(ids(service.getCloseout("7.7"))).toEqual(["14.1", "14.2"]);
    expect(ids(service.getCloseout("12.1"))).toContain("14.10");
  });

  it("represents high-value cross-discipline Build 3 interfaces", () => {
    const service = createProductionRelationshipService();

    expect(ids(service.getInterfaces("8.9"))).toEqual(
      expect.arrayContaining(["4.2", "5.6", "6.5", "10.3"])
    );
    expect(ids(service.getInterfaces("5.6"))).toEqual(
      expect.arrayContaining(["8.9", "9.9"])
    );
    expect(ids(service.getInterfaces("10.4"))).toEqual(
      expect.arrayContaining(["8.5", "8.8", "10.6"])
    );
  });

  it("preserves Build 3 sequence chains without storing NEXT edges", () => {
    const service = createProductionRelationshipService();

    expect(ids(service.getBefore("2.4"))).toEqual(
      expect.arrayContaining(["2.1", "2.2", "2.3"])
    );
    expect(ids(service.getBefore("13.10"))).toContain("13.9");
    expect(ids(service.getBefore("14.15"))).toEqual(
      expect.arrayContaining(["14.7", "14.8", "14.9", "14.14"])
    );
    expect(
      productionCanonicalDataset.relationships.some(
        (relationship) => (relationship.type as string) === "NEXT"
      )
    ).toBe(false);
  });

  it("does not introduce invalidation or language-specific relationship records", () => {
    const serializedRelationships = JSON.stringify(
      productionCanonicalDataset.relationships
    );

    expect(serializedRelationships).not.toContain("INVALIDATES");
    expect(serializedRelationships).not.toContain("-fr");
    expect(serializedRelationships).not.toContain("-en");
  });
});
