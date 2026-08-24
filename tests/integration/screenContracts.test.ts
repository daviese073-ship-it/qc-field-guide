import { describe, expect, it } from "vitest";

import type { CanonicalDatasetInput } from "@/data/canonicalDataset";
import { clonePhase003ValidationDataset } from "@/data/development/phase003ValidationDataset";
import {
  buildActivityScreenModel,
  buildGateScreenModel,
  buildHomeScreenModel,
  buildPreConcealmentScreenModel,
  buildSearchScreenModel,
  buildSectionScreenModel,
  buildTerminologyScreenModel,
  buildWorkflowScreenModel,
  getScreenContractById,
  screenContracts
} from "@/services/screenContracts";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

const getRegistries = (
  dataset: CanonicalDatasetInput = clonePhase003ValidationDataset()
) => validateCanonicalDataset(dataset).registries;

describe("Phase 005 screen contracts", () => {
  it("defines the eight application screen contracts", () => {
    expect(Object.keys(screenContracts)).toEqual([
      "home",
      "section",
      "activity",
      "workflow",
      "preConcealment",
      "gate",
      "search",
      "terminology"
    ]);
    expect(getScreenContractById("activity")).toMatchObject({
      routePattern: "/activity/:activityId?mode=quick|full|learn",
      primaryQuestion: "How do I inspect/control this activity?"
    });
  });

  it("home hides favorites and recents when there is no data", () => {
    const model = buildHomeScreenModel(getRegistries());

    expect(model.visibleSections).toContain("search");
    expect(model.visibleSections).toContain("browseSystems");
    expect(model.visibleSections).toContain("workflows");
    expect(model.visibleSections).toContain("preConcealment");
    expect(model.visibleSections).not.toContain("favorites");
    expect(model.visibleSections).not.toContain("recents");
  });

  it("home shows favorites and recents only when supplied", () => {
    const model = buildHomeScreenModel(getRegistries(), {
      favorites: [{ objectType: "activity", id: "10.3" }],
      recents: [{ objectType: "workflow", id: "WF-CON-01" }]
    });

    expect(model.visibleSections).toContain("favorites");
    expect(model.visibleSections).toContain("recents");
    expect(model.actions.map((action) => action.route)).toContain(
      "/activity/10.3"
    );
    expect(model.actions.map((action) => action.route)).toContain(
      "/workflow/WF-CON-01"
    );
  });

  it("section model returns activity summaries without full technical sections", () => {
    const model = buildSectionScreenModel(getRegistries(), "10");

    expect(model.status).toBe("found");
    expect(model.activities.map((activity) => activity.id)).toEqual([
      "10.3",
      "10.4"
    ]);
    expect(model.activities[0]).not.toHaveProperty("requirements");
  });

  it("section model returns notFound for an unknown section", () => {
    const model = buildSectionScreenModel(getRegistries(), "99");

    expect(model.status).toBe("notFound");
    expect(model.activities).toEqual([]);
  });

  it("activity model receives quick, learn, canonical breadcrumb, flags, and relationships", () => {
    const model = buildActivityScreenModel(getRegistries(), "10.3", "learn");

    expect(model.status).toBe("found");
    expect(model.availableModes).toEqual(["quick", "full", "learn"]);
    expect(model.selectedMode).toBe("learn");
    expect(model.breadcrumb.map((item) => item.route)).toEqual([
      "/",
      "/section/10"
    ]);
    expect(model.flags).toEqual(["highControl", "recheckIfModified"]);
    expect(model.relationshipGroups.map((group) => group.id)).toEqual([
      "before",
      "gates"
    ]);
  });

  it("activity model hides unavailable modes and falls back safely", () => {
    const model = buildActivityScreenModel(getRegistries(), "10.4", "learn");

    expect(model.status).toBe("found");
    expect(model.availableModes).toEqual([]);
    expect(model.selectedMode).toBeUndefined();
  });

  it("workflow model references activities and gates without duplicating activity content", () => {
    const model = buildWorkflowScreenModel(getRegistries(), "WF-CON-01");

    expect(model.status).toBe("found");
    expect(model.activities.map((activity) => activity.id)).toEqual(["10.3"]);
    expect(model.gates.map((gate) => gate.id)).toEqual(["G-STR-01"]);
    expect(model.actions.map((action) => action.route)).toContain(
      "/activity/10.3"
    );
  });

  it("pre-concealment model hides empty sections and exposes only linked objects", () => {
    const model = buildPreConcealmentScreenModel(getRegistries(), "PC-FIRE-01");

    expect(model.status).toBe("found");
    expect(model.visibleSections).toEqual([
      "verify",
      "evidence",
      "doNotCloseIf",
      "relatedActivities",
      "gate",
      "next"
    ]);
    expect(model.actions.map((action) => action.route)).toEqual([
      "/",
      "/activity/10.3",
      "/gate/G-STR-01"
    ]);
  });

  it("gate model reverse-derives controlled activities without approval controls", () => {
    const model = buildGateScreenModel(getRegistries(), "G-STR-01");

    expect(model.status).toBe("found");
    expect(model.controlledActivities.map((activity) => activity.id)).toEqual([
      "10.3"
    ]);
    expect(model.prerequisiteActivities.map((activity) => activity.id)).toEqual(
      ["10.3"]
    );
    expect(model.downstreamActivities.map((activity) => activity.id)).toEqual([
      "10.4"
    ]);
    expect(model.screen.forbiddenControls).toContain("approve gate");
    expect(model.screen.forbiddenControls).toContain("release work");
  });

  it("search screen contract preserves query but does not implement results", () => {
    const model = buildSearchScreenModel("firestop");

    expect(model.query).toBe("firestop");
    expect(model.resultTypes).toEqual([]);
  });

  it("terminology model resolves related activities and allows missing French", () => {
    const model = buildTerminologyScreenModel(getRegistries(), "TERM-FIXTURE");

    expect(model.status).toBe("found");
    expect(model.concept?.preferred).toEqual({ en: "Fictional concept" });
    expect(model.relatedActivities.map((activity) => activity.id)).toEqual([
      "10.3"
    ]);
  });

  it("terminology route can also resolve acronym records", () => {
    const model = buildTerminologyScreenModel(getRegistries(), "ACR-FIXTURE");

    expect(model.status).toBe("found");
    expect(model.acronym?.relationType).toBe("SHARED_ACRONYM");
    expect(model.relatedActivities.map((activity) => activity.id)).toEqual([
      "10.3"
    ]);
  });
});
