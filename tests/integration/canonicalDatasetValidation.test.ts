import { describe, expect, it } from "vitest";

import type { CanonicalDatasetInput } from "@/data/canonicalDataset";
import { clonePhase003ValidationDataset } from "@/data/development/phase003ValidationDataset";
import { loadCanonicalDataset } from "@/data/loadCanonicalDataset";
import { buildCanonicalRegistries } from "@/domain/registries";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

const expectValidationFailure = (
  dataset: CanonicalDatasetInput,
  expectedMessage: RegExp
) => {
  expect(() => validateCanonicalDataset(dataset)).toThrow(expectedMessage);
};

describe("canonical dataset loading and integrity", () => {
  it("loads a valid interconnected dataset", () => {
    const result = validateCanonicalDataset(clonePhase003ValidationDataset());

    expect(result.registries.activities.has("10.3")).toBe(true);
    expect(result.registries.relationships.has("REL-FIXTURE-1")).toBe(true);
    expect(result.registries.nodes.getNodeKind("G-STR-01")).toBe("gate");
  });

  it("registry getById() returns the expected object", () => {
    const { registries } = validateCanonicalDataset(
      clonePhase003ValidationDataset()
    );

    expect(registries.activities.getById("10.3")?.title.en).toBe(
      "Fictional Activity"
    );
  });

  it("unknown IDs return the documented safe result", () => {
    const { registries } = validateCanonicalDataset(
      clonePhase003ValidationDataset()
    );

    expect(registries.activities.getById("missing")).toBeUndefined();
    expect(registries.activities.has("missing")).toBe(false);
    expect(registries.nodes.resolveNode("missing")).toBeUndefined();
  });

  it("duplicate Activity ID fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.activities.push({ ...dataset.activities[0] });

    expectValidationFailure(dataset, /Duplicate activity ID "10\.3"/);
  });

  it("duplicate Gate ID fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.gates.push({ ...dataset.gates[0] });

    expectValidationFailure(dataset, /Duplicate gate ID "G-STR-01"/);
  });

  it("duplicate QuickView ownership fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.quickViews.push({ ...dataset.quickViews[0] });

    expectValidationFailure(
      dataset,
      /Duplicate quickView activity ownership ID "10\.3"/
    );
  });

  it("Activity with missing Section fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.activities[0].sectionId = "99";

    expectValidationFailure(
      dataset,
      /Activity "10\.3" references missing section "99"/
    );
  });

  it("Activity with missing Gate reference fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.activities[0].logic = {
      ...dataset.activities[0].logic,
      gateIds: ["G-MISSING"]
    };

    expectValidationFailure(
      dataset,
      /Activity "10\.3" references missing gate "G-MISSING"/
    );
  });

  it("Relationship with missing source fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.relationships[0].sourceId = "10.99";

    expectValidationFailure(
      dataset,
      /Relationship "REL-FIXTURE-1" references missing source node "10\.99"/
    );
  });

  it("Relationship with missing target fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.relationships[0].targetId = "G-MISSING";

    expectValidationFailure(
      dataset,
      /Relationship "REL-FIXTURE-1" references missing target node "G-MISSING"/
    );
  });

  it("Relationship with missing Condition fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.relationships[0].conditionId = "whereExterior";

    expectValidationFailure(
      dataset,
      /Relationship "REL-FIXTURE-1" references missing condition "whereExterior"/
    );
  });

  it("Workflow with missing Activity fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.workflows[0].activityIds = ["10.99"];

    expectValidationFailure(
      dataset,
      /Workflow "WF-CON-01" references missing activity "10\.99"/
    );
  });

  it("Workflow with missing Gate fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.workflows[0].gateIds = ["G-MISSING"];

    expectValidationFailure(
      dataset,
      /Workflow "WF-CON-01" references missing gate "G-MISSING"/
    );
  });

  it("Workflow with missing Relationship fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.workflows[0].relatedRelationshipIds = ["REL-MISSING"];

    expectValidationFailure(
      dataset,
      /Workflow "WF-CON-01" references missing relationship "REL-MISSING"/
    );
  });

  it("PreConcealmentWorkflow with missing Activity fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.preConcealmentWorkflows[0].activityIds = ["10.99"];

    expectValidationFailure(
      dataset,
      /PreConcealmentWorkflow "PC-FIRE-01" references missing activity "10\.99"/
    );
  });

  it("PreConcealmentWorkflow with missing Gate fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.preConcealmentWorkflows[0].gateIds = ["G-MISSING"];

    expectValidationFailure(
      dataset,
      /PreConcealmentWorkflow "PC-FIRE-01" references missing gate "G-MISSING"/
    );
  });

  it("TerminologyConcept with missing related Activity fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.terminology[0].relatedActivityIds = ["10.99"];

    expectValidationFailure(
      dataset,
      /TerminologyConcept "TERM-FIXTURE" references missing activity "10\.99"/
    );
  });

  it("Acronym with missing related Concept fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.acronyms[0].relatedConceptIds = ["TERM-MISSING"];

    expectValidationFailure(
      dataset,
      /AcronymEntry "ACR-FIXTURE" references missing concept "TERM-MISSING"/
    );
  });

  it("InvalidationRule with missing affected Activity fails", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.invalidationRules[0].affectedActivityIds = ["10.99"];

    expectValidationFailure(
      dataset,
      /InvalidationRule "INV-FIXTURE" references missing affected activity "10\.99"/
    );
  });

  it("valid optional and provisional French localization does not fail integrity validation", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.terminology[0].preferred = {
      en: "Fictional concept"
    };
    dataset.terminology[0].status = {
      fr: "provisional"
    };

    expect(() => validateCanonicalDataset(dataset)).not.toThrow();
  });

  it("canonical registries cannot be accidentally overwritten by duplicate IDs", () => {
    const dataset = loadCanonicalDataset(clonePhase003ValidationDataset());

    expect(() =>
      buildCanonicalRegistries({
        ...dataset,
        activities: [
          ...dataset.activities,
          {
            ...dataset.activities[0],
            title: { en: "Conflicting duplicate" }
          }
        ]
      })
    ).toThrow(/Duplicate activity ID "10\.3"/);
  });

  it("getActivitiesBySection() returns deterministic order", () => {
    const dataset = clonePhase003ValidationDataset();
    dataset.activities.push(
      {
        id: "10.10",
        sectionId: "10",
        title: { en: "Fictional Activity 10.10" },
        nodeTags: ["activity"]
      },
      {
        id: "10.2",
        sectionId: "10",
        title: { en: "Fictional Activity 10.2" },
        nodeTags: ["activity"]
      }
    );

    const { registries } = validateCanonicalDataset(dataset);

    expect(
      registries.activities
        .getActivitiesBySection("10")
        .map((activity) => activity.id)
    ).toEqual(["10.2", "10.3", "10.4", "10.10"]);
  });
});
