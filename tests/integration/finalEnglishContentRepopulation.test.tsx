import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers";
import {
  productionGeneralQcService,
  productionRegistries
} from "@/app/productionAppData";
import { routes } from "@/app/router";

type ContentItem = {
  text?: { en?: string };
};

type ContentBlock = {
  type: string;
  item?: ContentItem;
  items?: ContentItem[];
};

const system01ActivityIds = ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7"];

const system02ActivityIds = [
  "2.1",
  "2.2",
  "2.3",
  "2.4",
  "2.5",
  "2.6",
  "2.7",
  "2.8",
  "2.9",
  "2.10",
  "2.11",
  "2.12"
];

const system03ActivityIds = [
  "3.1",
  "3.2",
  "3.3",
  "3.4",
  "3.5",
  "3.6",
  "3.7",
  "3.8"
];

const system04ActivityIds = [
  "4.1",
  "4.2",
  "4.3",
  "4.4",
  "4.5",
  "4.6",
  "4.7",
  "4.8",
  "4.9",
  "4.10"
];

const system05ActivityIds = [
  "5.1",
  "5.2",
  "5.3",
  "5.4",
  "5.5",
  "5.6",
  "5.7",
  "5.8",
  "5.9"
];

const system06ActivityIds = [
  "6.1",
  "6.2",
  "6.3",
  "6.4",
  "6.5",
  "6.6",
  "6.7",
  "6.8",
  "6.9"
];

const system07ActivityIds = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7"];

const system08ActivityIds = [
  "8.1",
  "8.2",
  "8.3",
  "8.4",
  "8.5",
  "8.6",
  "8.7",
  "8.8",
  "8.9",
  "8.10",
  "8.11"
];

const system09ActivityIds = [
  "9.1",
  "9.2",
  "9.3",
  "9.4",
  "9.5",
  "9.6",
  "9.7",
  "9.8",
  "9.9",
  "9.10",
  "9.11"
];

const system10ActivityIds = [
  "10.1",
  "10.2",
  "10.3",
  "10.4",
  "10.5",
  "10.6",
  "10.7",
  "10.8"
];

const system11ActivityIds = [
  "11.1",
  "11.2",
  "11.3",
  "11.4",
  "11.5",
  "11.6",
  "11.7",
  "11.8",
  "11.9",
  "11.10",
  "11.11"
];

const system12ActivityIds = [
  "12.1",
  "12.2",
  "12.3",
  "12.4",
  "12.5",
  "12.6",
  "12.7",
  "12.8",
  "12.9",
  "12.10"
];

const system13ActivityIds = [
  "13.1",
  "13.2",
  "13.3",
  "13.4",
  "13.5",
  "13.6",
  "13.7",
  "13.8",
  "13.9",
  "13.10",
  "13.11"
];

const system14ActivityIds = [
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
];

const importedSystemActivityIds = [
  ...system01ActivityIds,
  ...system02ActivityIds,
  ...system03ActivityIds,
  ...system04ActivityIds,
  ...system05ActivityIds,
  ...system06ActivityIds,
  ...system07ActivityIds,
  ...system08ActivityIds,
  ...system09ActivityIds,
  ...system10ActivityIds,
  ...system11ActivityIds,
  ...system12ActivityIds,
  ...system13ActivityIds,
  ...system14ActivityIds
];

function renderRoute(initialEntry: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry]
  });

  return {
    router,
    ...render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    )
  };
}

function blockTexts(blocks: unknown): string[] {
  if (!Array.isArray(blocks)) return [];

  return (blocks as ContentBlock[]).flatMap((block) => {
    if (block.item?.text?.en) return [block.item.text.en];

    return (
      block.items
        ?.map((item) => item.text?.en)
        .filter((text): text is string => Boolean(text)) ?? []
    );
  });
}

function collectEnglishStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(collectEnglishStrings);

  return Object.entries(value).flatMap(([key, entry]) =>
    key === "fr" ? [] : collectEnglishStrings(entry)
  );
}

function expectUnique(values: string[]) {
  expect(new Set(values).size).toBe(values.length);
}

describe("final English content repopulation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("preserves canonical counts and identities for the imported English scope", () => {
    const processes = productionGeneralQcService.getAllProcesses();

    expect(processes).toHaveLength(16);
    expect(processes.map((process) => process.sequence)).toEqual(
      Array.from({ length: 16 }, (_, index) => index + 1)
    );
    expectUnique(processes.map((process) => process.id));
    expect(system01ActivityIds).toHaveLength(7);
    expect(system02ActivityIds).toHaveLength(12);
    expect(system03ActivityIds).toHaveLength(8);
    expect(system04ActivityIds).toHaveLength(10);
    expect(system05ActivityIds).toHaveLength(9);
    expect(system06ActivityIds).toHaveLength(9);
    expect(system07ActivityIds).toHaveLength(7);
    expect(system08ActivityIds).toHaveLength(11);
    expect(system09ActivityIds).toHaveLength(11);
    expect(system10ActivityIds).toHaveLength(8);
    expect(system11ActivityIds).toHaveLength(11);
    expect(system12ActivityIds).toHaveLength(10);
    expect(system13ActivityIds).toHaveLength(11);
    expect(system14ActivityIds).toHaveLength(15);
    expectUnique(importedSystemActivityIds);

    for (const activityId of importedSystemActivityIds) {
      expect(productionRegistries.activities.has(activityId)).toBe(true);
      expect(productionRegistries.quickViews.has(activityId)).toBe(true);
      expect(productionRegistries.learnContent.has(activityId)).toBe(true);
    }
  });

  it("populates every General QC process detail field from the approved English source", () => {
    for (const process of productionGeneralQcService.getAllProcesses()) {
      expect(process.title.en).toBeTruthy();
      expect(process.summary.en).toBeTruthy();
      expect(process.whenToUse.en).toBeTruthy();
      expect(process.fieldWorkflow.length).toBeGreaterThan(0);
      expect(process.whatToCapture.length).toBeGreaterThan(0);
      expect(process.commonMistakes.length).toBeGreaterThan(0);
      expect(process.keyReminders.length).toBeGreaterThan(0);
      expect(process.typicalOutputs.length).toBeGreaterThan(0);
      expect(process.relatedProcessIds.length).toBeGreaterThan(0);
    }

    const ncr = productionGeneralQcService.getProcessById("general-qc-ncr");

    expect(ncr?.summary.en).toBe(
      "Control, document and resolve work, material or installation that does not conform to an applicable requirement."
    );
    expect(ncr?.fieldWorkflow[0]?.action.en).toBe(
      "Identify the non-conformity"
    );
    expect(ncr?.fieldWorkflow[0]?.detail.en).toBe(
      "Determine exactly what does not comply and where."
    );
  });

  it("keeps Universal Field Reference separate and fully populated", () => {
    const reference = productionGeneralQcService.getUniversalReference();

    expect(reference?.fieldPrinciple).toHaveLength(6);
    expect(reference?.minimumUsefulQualityRecord).toHaveLength(9);
    expect(reference?.minimumUsefulQualityRecord[0]?.key.en).toBe(
      "Identity — Name the activity, element, asset, or record."
    );
    expect(reference?.minimumUsefulQualityRecord[0]?.question.en).toBe(
      "What activity/record is this?"
    );
    expect(
      productionGeneralQcService
        .getAllProcesses()
        .some((process) => process.title.en === "Universal Field Reference")
    ).toBe(false);
  });

  it("preserves System 01 through System 14 activity title identity without duplicating numeric IDs", () => {
    expect(
      system01ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Existing Conditions",
      "Survey & Layout",
      "Excavation",
      "Subgrade",
      "Granular Materials",
      "Backfill",
      "Site Drainage"
    ]);
    expect(
      system02ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Foundation Formwork",
      "Foundation Reinforcement",
      "Embedded Items",
      "Pre-Pour Quality Gate",
      "Foundation Concrete",
      "Foundation Concrete Acceptance",
      "Foundation Walls",
      "Slab-on-Grade",
      "Below-Grade Waterproofing",
      "Foundation Insulation",
      "Foundation Drainage",
      "Backfill Against Structure"
    ]);
    expect(
      system03ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Cast-in-Place Concrete",
      "Structural Steel - Materials",
      "Structural Steel - Erection",
      "Bolted Connections",
      "Welding",
      "Steel Protection",
      "Structural Masonry",
      "Precast Elements - If Applicable"
    ]);
    expect(
      system04ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Exterior Wall Assemblies",
      "Air Barrier",
      "Vapour Barrier",
      "Thermal Insulation",
      "Exterior Sheathing",
      "Exterior Masonry / Veneer",
      "Exterior Cladding / Panels",
      "Windows / Glazing",
      "Exterior Doors",
      "Sealants"
    ]);
    expect(
      system05ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Roof Deck / Substrate",
      "Vapour / Air Control Layer",
      "Roof Insulation",
      "Roofing Membrane",
      "Flashings & Terminations",
      "Roof Penetrations",
      "Curbs & Equipment Interfaces",
      "Roof Drains",
      "Roofing Testing / Final Inspection"
    ]);
    expect(
      system06ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Interior Masonry",
      "Metal Stud Framing",
      "Interior Insulation",
      "Gypsum Board",
      "Fire-Rated Assemblies",
      "Interior Doors & Frames",
      "Door Hardware",
      "Ceilings",
      "Access Panels"
    ]);
    expect(
      system07ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Concrete Floor Preparation",
      "Floor Finishes",
      "Wall Finishes",
      "Painting / Coatings",
      "Architectural Sealants",
      "Specialty Finishes",
      "Final Architectural Deficiency Inspection"
    ]);
    expect(
      system08ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Plumbing - Domestic Water",
      "Sanitary Drainage",
      "Storm Drainage",
      "Process / Equipment Piping - Where Applicable",
      "HVAC Ductwork",
      "HVAC Equipment",
      "Mechanical Insulation",
      "Mechanical Controls / BAS Interfaces",
      "Mechanical Penetrations",
      "Mechanical Testing",
      "Mechanical Identification"
    ]);
    expect(
      system09ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Conduits / Raceways",
      "Cable Trays",
      "Supports / Hangers",
      "Electrical Equipment Installation",
      "Building Distribution Interfaces",
      "Grounding / Bonding — Within Assigned Inspection Scope",
      "Lighting",
      "Emergency Lighting",
      "Electrical Penetrations",
      "Identification / Labels",
      "Electrical Testing Interfaces"
    ]);
    expect(
      system10ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Fire-Rated Walls",
      "Fire-Rated Floors / Ceilings",
      "Firestopping",
      "Fire / Smoke Dampers",
      "Fire-Rated Doors",
      "Fire-Alarm Physical Installation Interfaces",
      "Emergency / Life-Safety Interfaces",
      "Fire Protection Systems — If Applicable"
    ]);
    expect(
      system11ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Structural ↔ Architectural",
      "Structural ↔ Mechanical",
      "Structural ↔ Electrical",
      "Envelope ↔ Mechanical",
      "Envelope ↔ Electrical",
      "Architectural ↔ MEP",
      "Universal Penetrations",
      "Embedded Items",
      "Equipment Bases / Housekeeping Pads",
      "Access & Maintainability",
      "Trade Coordination / Congestion"
    ]);
    expect(
      system12ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Underground Services",
      "Utility Trenches",
      "Manholes / Catch Basins / Structures",
      "Exterior Drainage",
      "Granular Base / Subbase",
      "Curbs",
      "Concrete Exterior Works",
      "Asphalt",
      "Site Restoration",
      "Fencing / Gates — If Applicable"
    ]);
    expect(
      system13ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Test Readiness",
      "Test Documentation",
      "Mechanical Testing",
      "Electrical Testing Interfaces",
      "Building Envelope Testing",
      "Functional Testing",
      "Equipment Start-Up",
      "Integrated / System Testing — Where Applicable",
      "Failed-Test Management",
      "Retesting",
      "Acceptance Evidence"
    ]);
    expect(
      system14ActivityIds.map(
        (activityId) =>
          productionRegistries.activities.getById(activityId)?.title.en
      )
    ).toEqual([
      "Preparatory Deficiency Review",
      "Formal Deficiency Survey",
      "Deficiency Classification",
      "Assignment",
      "Corrective Work",
      "Reinspection",
      "Closure",
      "Outstanding NC Closure",
      "Outstanding Test Results",
      "Redlines / As-Builts",
      "O&M Documentation",
      "Certificates / Technical Records",
      "Warranties",
      "Final Quality Records",
      "Turnover / Acceptance"
    ]);
  });

  it("populates Quick, Full, and Learn data for every imported System activity", () => {
    for (const activityId of importedSystemActivityIds) {
      const activity = productionRegistries.activities.getById(activityId);
      const quickView = productionRegistries.quickViews.getById(activityId);
      const learnContent =
        productionRegistries.learnContent.getById(activityId);

      expect(activity?.qualityObjective?.en).toBeTruthy();
      expect(activity?.requirements).toBeTruthy();
      expect(activity?.inspection?.before).toBeTruthy();
      expect(activity?.inspection?.during).toBeTruthy();
      expect(activity?.evidence).toBeTruthy();
      expect(activity?.issues?.commonDeficiencies).toBeTruthy();
      expect(activity?.closureCriteria).toBeTruthy();
      expect(quickView?.fieldTip?.en).toBeTruthy();
      expect(blockTexts(quickView?.before).length).toBeGreaterThan(0);
      expect(blockTexts(quickView?.inspect).length).toBeGreaterThan(0);
      expect(blockTexts(quickView?.evidence).length).toBeGreaterThan(0);
      expect(blockTexts(quickView?.watchFor).length).toBeGreaterThan(0);
      expect(blockTexts(quickView?.dontMiss).length).toBeGreaterThan(0);
      expect(blockTexts(learnContent?.whatIsThis).length).toBeGreaterThan(0);
      expect(blockTexts(learnContent?.whyItMatters).length).toBeGreaterThan(0);
      expect(blockTexts(learnContent?.howGoodWorkLooks).length).toBeGreaterThan(
        0
      );
      expect(blockTexts(learnContent?.commonFailures).length).toBeGreaterThan(
        0
      );
      expect(learnContent?.practicalExamples?.length).toBeGreaterThan(0);
      expect(
        blockTexts(learnContent?.interfacesAndSequence).length
      ).toBeGreaterThan(0);
      expect(learnContent?.specialistAuthorityBoundary?.en).toBeTruthy();
    }
  });

  it("preserves bullet order for representative imported activity fields", () => {
    const existingConditionsQuick =
      productionRegistries.quickViews.getById("1.1");
    const prePourQuick = productionRegistries.quickViews.getById("2.4");
    const castInPlaceQuick = productionRegistries.quickViews.getById("3.1");
    const exteriorWallQuick = productionRegistries.quickViews.getById("4.1");
    const roofDeckQuick = productionRegistries.quickViews.getById("5.1");
    const interiorMasonryQuick = productionRegistries.quickViews.getById("6.1");
    const concreteFloorQuick = productionRegistries.quickViews.getById("7.1");
    const domesticWaterQuick = productionRegistries.quickViews.getById("8.1");
    const racewaysQuick = productionRegistries.quickViews.getById("9.1");
    const fireRatedWallsQuick = productionRegistries.quickViews.getById("10.1");
    const structuralArchitecturalQuick =
      productionRegistries.quickViews.getById("11.1");
    const undergroundServicesQuick =
      productionRegistries.quickViews.getById("12.1");
    const testReadinessQuick = productionRegistries.quickViews.getById("13.1");
    const preparatoryDeficiencyQuick =
      productionRegistries.quickViews.getById("14.1");

    expect(blockTexts(existingConditionsQuick?.before).slice(0, 3)).toEqual([
      "Confirm work, demolition, access, and protection limits on current approved documents.",
      "Identify assets to remain, items to remove, live services, restricted areas, and required isolations.",
      "Complete the required utility-location and existing-condition records before disturbance."
    ]);
    expect(blockTexts(prePourQuick?.before).slice(0, 3)).toEqual([
      "Identify the exact pour limits, sequence, concrete specification, ITP/PIE/PRIE points, notice periods, and release authority.",
      "Confirm formwork, reinforcement, embeds, joints, substrate, cleanliness, access, and safety interfaces have been inspected.",
      "Verify approved concrete mix, delivery plan, testing agency, equipment, curing materials, weather controls, and contingency arrangements."
    ]);
    expect(blockTexts(castInPlaceQuick?.before).slice(0, 3)).toEqual([
      "Confirm current structural drawings, pour sequence, joints, reshoring, openings, embeds, tolerances, finish, mix, and testing requirements.",
      "Verify formwork, reinforcement, inserts, sleeves, access, weather controls, and pre-pour releases.",
      "Coordinate temporary support, construction loads, adjacent pours, and future architectural/MEP/envelope interfaces."
    ]);
    expect(blockTexts(exteriorWallQuick?.before).slice(0, 3)).toEqual([
      "Confirm the approved wall type and layer sequence at each elevation, orientation, opening, base, parapet, and transition.",
      "Verify substrates, mockups, product approvals, compatibility, attachment, drainage/ventilation paths, and trade responsibilities.",
      "Plan inspections before each critical layer or interface is concealed."
    ]);
    expect(blockTexts(roofDeckQuick?.before).slice(0, 3)).toEqual([
      "Confirm the approved deck/substrate type, thickness or gauge, span/support conditions, fastening or weld pattern, joint requirements, slope, elevations, tolerances, openings, curbs, and drain locations.",
      "Verify structural/deck releases, survey information where required, approved repairs, temporary weather protection, and coordination of all planned penetrations.",
      "Schedule a substrate-acceptance inspection before primers, control layers, insulation, or cover boards conceal the surface."
    ]);
    expect(blockTexts(interiorMasonryQuick?.before).slice(0, 3)).toEqual([
      "Confirm wall types, unit type/strength, mortar/grout, reinforcement, anchorage, bond, coursing, dimensions, heights, openings, lintels, joints, fire/acoustic requirements, and tolerances.",
      "Verify slab/structure, dowels, embeds, layout control, adjacent waterproofing, and overhead deflection/interface details are accepted.",
      "Coordinate doors, frames, louvers, services, sleeves, access panels, finishes, and all penetrations before masonry closes around them."
    ]);
    expect(blockTexts(concreteFloorQuick?.before).slice(0, 3)).toEqual([
      "Confirm the finish system and its substrate requirements for age, strength, moisture, relative humidity, pH, surface profile, flatness, level/slope, temperature, cleanliness, curing compounds, cracks, and joints.",
      "Verify concrete test/curing records, environmental control, moisture-test plan, approved preparation/repair products, and locations of embedded heating/services.",
      "Map rooms, grids, control/construction joints, cracks, high/low areas, drains, thresholds, transitions, and test locations before preparation begins."
    ]);
    expect(blockTexts(domesticWaterQuick?.before).slice(0, 3)).toEqual([
      "Confirm pipe/fitting/valve materials, sizes, routes, elevations, joint methods, supports, expansion, access, insulation, backflow, flushing/disinfection, sampling, and test requirements.",
      "Verify coordinated openings, sleeves, equipment/fixture locations, structural supports, electrical heat-trace interfaces, and protection from contamination/freezing.",
      "Check installer and joining qualifications, approved procedures, test boundaries, calibrated gauges, water source/disposal, and notifications before work."
    ]);
    expect(blockTexts(racewaysQuick?.before).slice(0, 3)).toEqual([
      "Confirm raceway type, size, route, elevation, conductor-fill basis, bend limits, support, expansion, sealing, environmental rating, box locations, penetrations, and identification from current approved documents.",
      "Coordinate the route with structure, reinforcement, ceilings, equipment, cable trays, piping, ductwork, fire barriers, access zones, and future cable-pulling space.",
      "Inspect received material and plan embedded, underground, and concealed inspections before concrete placement, backfill, wall closure, or ceiling closure."
    ]);
    expect(blockTexts(fireRatedWallsQuick?.before).slice(0, 3)).toEqual([
      "Confirm wall type/tag, required rating, tested/listed assembly, extent and termination boundaries, framing, layer count/thickness, fasteners, joints, insulation, head/base/perimeter and opening details.",
      "Coordinate structure, slab/roof deck, deflection, beams, shafts, doors, glazing, ducts, dampers, cable trays, pipes, boxes and access before framing or boarding.",
      "Verify approved materials, compatible products and inspection sequence for both wall faces and hidden layers."
    ]);
    expect(
      blockTexts(structuralArchitecturalQuick?.before).slice(0, 3)
    ).toEqual([
      "Overlay current structural and architectural drawings; identify grids, levels, openings, edges, embeds, loads, attachment zones, deflection/movement and finish tolerances.",
      "Confirm approved support, anchor, fire/acoustic/envelope and head/joint details; resolve dimensional conflicts before fabrication or closure.",
      "Plan survey and concealed-interface inspections at embeds, anchors, slab edges, wall heads, cladding supports, stairs and roof/parapets."
    ]);
    expect(blockTexts(undergroundServicesQuick?.before).slice(0, 3)).toEqual([
      "Confirm utility type, alignment, coordinates, profile/inverts, depth/cover, material/class/size, joints, bedding, separation, crossings, structures, protection, testing and connection requirements.",
      "Locate existing services and coordinate excavation support, dewatering, access, other utilities, foundations, roads, drainage and connection windows.",
      "Verify approved materials, joining qualifications/procedures, test boundaries and survey points before installation."
    ]);
    expect(blockTexts(testReadinessQuick?.before).slice(0, 3)).toEqual([
      "Identify asset/system, exact test boundary, approved procedure/criterion, prerequisites, responsible tester, witness/hold point, safety controls, instruments and intended release.",
      "Review drawings, installation inspections, material/connection records, open deficiencies, upstream/downstream readiness, manufacturer requirements and temporary conditions.",
      "Hold a readiness review early enough to correct missing work; verify notifications, access, test media/power, disposal, barriers and calibrated equipment."
    ]);
    expect(blockTexts(preparatoryDeficiencyQuick?.before).slice(0, 3)).toEqual([
      "Define area/system boundaries, approved finish and functional requirements, completion prerequisites, responsible trade leads and target date for formal survey.",
      "Review current drawings, room/equipment schedules, prior inspections, open issues, tests and commissioning status; do not limit review to visible finishes.",
      "Prepare controlled walk route, inspection tools and a temporary internal list linked to exact locations/assets."
    ]);
  });

  it("does not introduce parser artifacts or generated placeholder strings into the imported English data", () => {
    const targetValues = [
      ...productionGeneralQcService.getAllProcesses(),
      productionGeneralQcService.getUniversalReference(),
      ...importedSystemActivityIds.flatMap((activityId) => [
        productionRegistries.activities.getById(activityId),
        productionRegistries.quickViews.getById(activityId),
        productionRegistries.learnContent.getById(activityId)
      ])
    ];

    const combined = collectEnglishStrings(targetValues).join("\n");

    expect(combined).not.toMatch(/svg/i);
    expect(combined).not.toMatch(/Source-backed content/i);
    expect(combined).not.toMatch(/Information not available/i);
    expect(combined).not.toMatch(/\bTODO\b|\bTBD\b/);
    expect(combined).not.toMatch(/\uFFFD/);
  });

  it("renders representative imported content on existing platform routes", () => {
    const generalLanding = renderRoute("/general-qc");
    expect(
      screen.getByRole("heading", { name: "General QC Processes" })
    ).toBeInTheDocument();
    expect(screen.getByText("Inspection Planning")).toBeInTheDocument();

    generalLanding.unmount();
    const ncrDetail = renderRoute("/general-qc/general-qc-ncr");
    expect(
      screen.getByText("Determine exactly what does not comply and where.")
    ).toBeInTheDocument();

    ncrDetail.unmount();
    const system01 = renderRoute("/section/1");
    expect(screen.getByText("Existing Conditions")).toBeInTheDocument();

    system01.unmount();
    const activity11Quick = renderRoute("/activity/1.1");
    expect(
      screen.getByText(
        "Confirm work, demolition, access, and protection limits on current approved documents."
      )
    ).toBeInTheDocument();

    activity11Quick.unmount();
    const activity11Full = renderRoute("/activity/1.1?mode=full");
    expect(
      screen.getAllByText(
        "Establish a reliable record of the site before work begins and protect existing assets that must remain."
      ).length
    ).toBeGreaterThan(0);

    activity11Full.unmount();
    const activity11Learn = renderRoute("/activity/1.1?mode=learn");
    expect(
      screen.getByText(
        "Pre-work condition surveys, existing utilities and structures, protection, demolition limits, and unexpected conditions."
      )
    ).toBeInTheDocument();

    activity11Learn.unmount();
    const system02 = renderRoute("/section/2");
    expect(screen.getByText("Pre-Pour Quality Gate")).toBeInTheDocument();

    system02.unmount();
    const activity24Quick = renderRoute("/activity/2.4");
    expect(
      screen.getByText(
        "Verify pre-pour quality gate while critical details remain visible and correctable."
      )
    ).toBeInTheDocument();

    activity24Quick.unmount();
    renderRoute("/activity/2.4?mode=learn");
    expect(
      screen.getByText(
        "Final readiness control for formwork, reinforcement, embeds, substrate, access, materials, testing resources, weather, notifications, and records."
      )
    ).toBeInTheDocument();

    const system03 = renderRoute("/section/3");
    expect(screen.getByText("Cast-in-Place Concrete")).toBeInTheDocument();

    system03.unmount();
    const activity31Quick = renderRoute("/activity/3.1");
    expect(
      screen.getByText(
        "Verify cast-in-place concrete while critical conditions remain visible and correctable."
      )
    ).toBeInTheDocument();

    activity31Quick.unmount();
    const system04 = renderRoute("/section/4");
    expect(screen.getByText("Exterior Wall Assemblies")).toBeInTheDocument();

    system04.unmount();
    const activity41Quick = renderRoute("/activity/4.1");
    expect(
      screen.getByText(
        "Verify exterior wall assemblies while critical conditions remain visible and correctable."
      )
    ).toBeInTheDocument();

    activity41Quick.unmount();
    const system05 = renderRoute("/section/5");
    expect(screen.getByText("Roof Deck / Substrate")).toBeInTheDocument();

    system05.unmount();
    renderRoute("/activity/5.1");
    expect(
      screen.getByText(
        "Do not accept a substrate only because it looks clean. Confirm its attachment, dryness, slope, openings, and ability to receive the specified roofing system."
      )
    ).toBeInTheDocument();

    const system06 = renderRoute("/section/6");
    expect(screen.getByText("Interior Masonry")).toBeInTheDocument();

    system06.unmount();
    const activity61Quick = renderRoute("/activity/6.1");
    expect(
      screen.getByText(
        "Photograph reinforcement, grout cells, anchors, lintels, and top-of-wall details before they disappear. Finished masonry cannot prove concealed compliance."
      )
    ).toBeInTheDocument();

    activity61Quick.unmount();
    const system07 = renderRoute("/section/7");
    expect(screen.getByText("Concrete Floor Preparation")).toBeInTheDocument();

    system07.unmount();
    const activity71Quick = renderRoute("/activity/7.1");
    expect(
      screen.getByText(
        "Substrate acceptance is a finish-system gate. Record actual moisture, profile, flatness, joints, and repairs—not only 'floor ready.'"
      )
    ).toBeInTheDocument();

    activity71Quick.unmount();
    const system08 = renderRoute("/section/8");
    expect(screen.getByText("Plumbing - Domestic Water")).toBeInTheDocument();

    system08.unmount();
    renderRoute("/activity/8.1");
    expect(
      screen.getByText(
        "Inspect plumbing - domestic water progressively: supports and concealed connections first, then testing, insulation/closure, identification, and final function."
      )
    ).toBeInTheDocument();

    const system09 = renderRoute("/section/9");
    expect(screen.getByText("Conduits / Raceways")).toBeInTheDocument();

    system09.unmount();
    const activity91Quick = renderRoute("/activity/9.1");
    expect(
      screen.getByText(
        "Inspect conduits / raceways progressively—before concealment, before connection or energization, and again at final identification and turnover."
      )
    ).toBeInTheDocument();

    activity91Quick.unmount();
    const system10 = renderRoute("/section/10");
    expect(screen.getByText("Fire-Rated Walls")).toBeInTheDocument();

    system10.unmount();
    const activity101Quick = renderRoute("/activity/10.1");
    expect(
      screen.getByText(
        "Inspect fire-rated walls as a complete life-safety assembly, not as isolated products. Verify hidden components before closure and operation again at final acceptance."
      )
    ).toBeInTheDocument();

    activity101Quick.unmount();
    const system11 = renderRoute("/section/11");
    expect(screen.getByText("Structural ↔ Architectural")).toBeInTheDocument();

    system11.unmount();
    renderRoute("/activity/11.1");
    expect(
      screen.getByText(
        "Inspect structural ↔ architectural with both disciplines present where possible. Name the interface owner, verify both sides while visible, and close one shared issue record."
      )
    ).toBeInTheDocument();

    const system12 = renderRoute("/section/12");
    expect(screen.getByText("Underground Services")).toBeInTheDocument();

    system12.unmount();
    const activity121Quick = renderRoute("/activity/12.1");
    expect(
      screen.getByText(
        "Inspect underground services progressively while line, level, material, joints and concealed conditions remain visible. Record survey and pre-cover evidence before backfill or surfacing."
      )
    ).toBeInTheDocument();

    activity121Quick.unmount();
    const system13 = renderRoute("/section/13");
    expect(screen.getByText("Test Readiness")).toBeInTheDocument();

    system13.unmount();
    const activity131Quick = renderRoute("/activity/13.1");
    expect(
      screen.getByText(
        "For test readiness, identify the exact asset and test boundary first. Preserve actual data and original failures; never reduce acceptance to a verbal 'pass'."
      )
    ).toBeInTheDocument();

    activity131Quick.unmount();
    const system14 = renderRoute("/section/14");
    expect(
      screen.getByText("Preparatory Deficiency Review")
    ).toBeInTheDocument();

    system14.unmount();
    renderRoute("/activity/14.1");
    expect(
      screen.getByText(
        "For preparatory deficiency review, trace the item from exact location and requirement through correction, independent verification, evidence and authorized status. An updated spreadsheet alone is not closure."
      )
    ).toBeInTheDocument();
  });
});
