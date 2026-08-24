import { describe, expect, it } from "vitest";

import type { CanonicalDatasetInput } from "@/data/canonicalDataset";
import { clonePhase003ValidationDataset } from "@/data/development/phase003ValidationDataset";
import { createRelationshipService } from "@/services/relationships";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

const withRelationshipNavigationFixture = (): CanonicalDatasetInput => {
  const dataset = clonePhase003ValidationDataset();

  dataset.relationships.push(
    {
      id: "REL-FIXTURE-3",
      sourceId: "10.4",
      type: "INTERFACES_WITH",
      targetId: "10.3",
      direction: "reciprocal",
      conditionId: "whereApplicable",
      strength: "conditional"
    },
    {
      id: "REL-FIXTURE-4",
      sourceId: "10.3",
      type: "TESTED_BY",
      targetId: "10.4",
      direction: "directed",
      conditionId: "always",
      strength: "hard"
    },
    {
      id: "REL-FIXTURE-5",
      sourceId: "10.3",
      type: "COMMISSIONED_BY",
      targetId: "WF-CON-01",
      direction: "directed",
      conditionId: "always",
      strength: "coordination"
    },
    {
      id: "REL-FIXTURE-6",
      sourceId: "10.3",
      type: "CLOSES_THROUGH",
      targetId: "WF-CON-01",
      direction: "directed",
      conditionId: "always",
      strength: "coordination"
    },
    {
      id: "REL-FIXTURE-7",
      sourceId: "10.3",
      type: "AS_BUILT_FEEDS",
      targetId: "WF-CON-01",
      direction: "directed",
      conditionId: "always",
      strength: "hard"
    },
    {
      id: "REL-FIXTURE-8",
      sourceId: "10.3",
      type: "PENETRATION_MANAGED_BY",
      targetId: "PC-FIRE-01",
      direction: "directed",
      conditionId: "whereApplicable",
      strength: "conditional"
    },
    {
      id: "REL-FIXTURE-9",
      sourceId: "10.3",
      type: "ACCESS_CHECKED_BY",
      targetId: "WF-CON-01",
      direction: "directed",
      conditionId: "whereSpecialistRequired",
      strength: "coordination"
    }
  );

  return dataset;
};

const createService = () => {
  const { registries } = validateCanonicalDataset(
    withRelationshipNavigationFixture()
  );

  return createRelationshipService(registries);
};

describe("relationship navigation derivation", () => {
  it("derives Before from outgoing REQUIRES relationships", () => {
    const service = createService();

    expect(service.getBefore("10.3").map((item) => item.relatedNodeId)).toEqual(
      ["10.4"]
    );
  });

  it("derives After from incoming REQUIRES relationships", () => {
    const service = createService();

    expect(service.getAfter("10.4").map((item) => item.relatedNodeId)).toEqual([
      "10.3"
    ]);
  });

  it("derives reciprocal Interfaces from either side of INTERFACES_WITH", () => {
    const service = createService();

    expect(
      service.getInterfaces("10.3").map((item) => item.relatedNodeId)
    ).toEqual(["10.4"]);
    expect(
      service.getInterfaces("10.4").map((item) => item.relatedNodeId)
    ).toEqual(["10.3"]);
  });

  it("derives Gates, Testing, Commissioning, Workflow, and Closeout groups", () => {
    const service = createService();

    expect(service.getGates("10.3").map((item) => item.relatedNodeId)).toEqual([
      "G-STR-01"
    ]);
    expect(
      service.getTesting("10.3").map((item) => item.relatedNodeId)
    ).toEqual(["10.4"]);
    expect(
      service.getCommissioning("10.3").map((item) => item.relatedNodeId)
    ).toEqual(["WF-CON-01"]);
    expect(
      service.getWorkflows("10.3").map((item) => item.relatedNodeId)
    ).toEqual(["PC-FIRE-01", "WF-CON-01"]);
    expect(
      service.getCloseout("10.3").map((item) => item.relationship.id)
    ).toEqual(["REL-FIXTURE-7"]);
  });

  it("returns only non-empty navigation groups in deterministic order", () => {
    const service = createService();

    expect(
      service.getNavigationGroups("10.3").map((group) => group.id)
    ).toEqual([
      "before",
      "gates",
      "interfaces",
      "workflows",
      "testing",
      "commissioning",
      "closeout"
    ]);
  });

  it("preserves condition metadata without evaluating field applicability", () => {
    const service = createService();

    expect(service.getInterfaces("10.3")[0]).toMatchObject({
      conditionId: "whereApplicable",
      strength: "conditional",
      direction: "reciprocal"
    });
  });

  it("suppresses duplicate destinations by keeping the strongest direct relationship", () => {
    const service = createService();

    expect(service.getCloseout("10.3")).toHaveLength(1);
    expect(service.getCloseout("10.3")[0].relationship.id).toBe(
      "REL-FIXTURE-7"
    );
  });

  it("returns empty groups for an unknown node without inventing links", () => {
    const service = createService();

    expect(service.getNavigationGroups("missing")).toEqual([]);
    expect(service.getBefore("missing")).toEqual([]);
  });
});
