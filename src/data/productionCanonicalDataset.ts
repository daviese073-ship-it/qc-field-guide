import section01Activities from "@/data/activities/section-01.json";
import section02Activities from "@/data/activities/section-02.json";
import section03Activities from "@/data/activities/section-03.json";
import section04Activities from "@/data/activities/section-04.json";
import section05Activities from "@/data/activities/section-05.json";
import section06Activities from "@/data/activities/section-06.json";
import section07Activities from "@/data/activities/section-07.json";
import section08Activities from "@/data/activities/section-08.json";
import section09Activities from "@/data/activities/section-09.json";
import section10Activities from "@/data/activities/section-10.json";
import section11Activities from "@/data/activities/section-11.json";
import section12Activities from "@/data/activities/section-12.json";
import section13Activities from "@/data/activities/section-13.json";
import section14Activities from "@/data/activities/section-14.json";
import sections from "@/data/sections/sections.json";

const activities = [
  ...section01Activities,
  ...section02Activities,
  ...section03Activities,
  ...section04Activities,
  ...section05Activities,
  ...section06Activities,
  ...section07Activities,
  ...section08Activities,
  ...section09Activities,
  ...section10Activities,
  ...section11Activities,
  ...section12Activities,
  ...section13Activities,
  ...section14Activities
];

export const productionCanonicalDataset = {
  sections,
  activities,
  quickViews: [],
  learnContent: [],
  relationships: [],
  gates: [],
  invalidationRules: [],
  conditions: [],
  workflows: [],
  preConcealmentWorkflows: [],
  terminology: [],
  acronyms: [],
  uiStrings: [],
  version: {
    schemaVersion: "phase-002",
    contentVersion: "phase-009-production-identity-seed",
    terminologyVersion: "not-populated"
  }
};
