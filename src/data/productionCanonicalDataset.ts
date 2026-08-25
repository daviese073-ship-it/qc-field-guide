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
import acronyms from "@/data/acronyms/acronyms.json";
import conditions from "@/data/conditions/conditions.json";
import gates from "@/data/gates/gates.json";
import invalidationRules from "@/data/invalidation/invalidation-rules.json";
import section01Learn from "@/data/learn/section-01.learn.json";
import section02Learn from "@/data/learn/section-02.learn.json";
import section03Learn from "@/data/learn/section-03.learn.json";
import section04Learn from "@/data/learn/section-04.learn.json";
import section05Learn from "@/data/learn/section-05.learn.json";
import section06Learn from "@/data/learn/section-06.learn.json";
import section07Learn from "@/data/learn/section-07.learn.json";
import section08Learn from "@/data/learn/section-08.learn.json";
import section09Learn from "@/data/learn/section-09.learn.json";
import section10Learn from "@/data/learn/section-10.learn.json";
import section11Learn from "@/data/learn/section-11.learn.json";
import section12Learn from "@/data/learn/section-12.learn.json";
import section13Learn from "@/data/learn/section-13.learn.json";
import section14Learn from "@/data/learn/section-14.learn.json";
import section01QuickViews from "@/data/quick/section-01.quick.json";
import section02QuickViews from "@/data/quick/section-02.quick.json";
import section03QuickViews from "@/data/quick/section-03.quick.json";
import section04QuickViews from "@/data/quick/section-04.quick.json";
import section05QuickViews from "@/data/quick/section-05.quick.json";
import section06QuickViews from "@/data/quick/section-06.quick.json";
import section07QuickViews from "@/data/quick/section-07.quick.json";
import section08QuickViews from "@/data/quick/section-08.quick.json";
import section09QuickViews from "@/data/quick/section-09.quick.json";
import section10QuickViews from "@/data/quick/section-10.quick.json";
import section11QuickViews from "@/data/quick/section-11.quick.json";
import section12QuickViews from "@/data/quick/section-12.quick.json";
import section13QuickViews from "@/data/quick/section-13.quick.json";
import section14QuickViews from "@/data/quick/section-14.quick.json";
import crossDisciplineRelationships from "@/data/relationships/cross-discipline.json";
import electricalRelationships from "@/data/relationships/electrical.json";
import envelopeRelationships from "@/data/relationships/envelope.json";
import externalRelationships from "@/data/relationships/external.json";
import fireLifeSafetyRelationships from "@/data/relationships/fire-life-safety.json";
import interiorsRelationships from "@/data/relationships/interiors.json";
import mechanicalRelationships from "@/data/relationships/mechanical.json";
import roofingRelationships from "@/data/relationships/roofing.json";
import siteworkRelationships from "@/data/relationships/sitework.json";
import structuralRelationships from "@/data/relationships/structural.json";
import testingCloseoutRelationships from "@/data/relationships/testing-closeout.json";
import sections from "@/data/sections/sections.json";
import terminologyCloseout from "@/data/terminology/closeout.json";
import terminologyBatirQc from "@/data/terminology/batir-qc.json";
import terminologyConcrete from "@/data/terminology/concrete.json";
import terminologyEarthworks from "@/data/terminology/earthworks.json";
import terminologyElectrical from "@/data/terminology/electrical.json";
import terminologyEnvelope from "@/data/terminology/envelope.json";
import terminologyFireLifeSafety from "@/data/terminology/fire-life-safety.json";
import terminologyInteriors from "@/data/terminology/interiors.json";
import terminologyMechanical from "@/data/terminology/mechanical.json";
import terminologyQuality from "@/data/terminology/quality.json";
import terminologyRoofing from "@/data/terminology/roofing.json";
import terminologyStructural from "@/data/terminology/structural.json";
import terminologyTesting from "@/data/terminology/testing.json";
import uiStrings from "@/data/ui/ui-strings.json";
import preConcealmentWorkflows from "@/data/preConcealment/pre-concealment-workflows.json";
import workflows from "@/data/workflows/workflows.json";

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

const relationships = [
  ...siteworkRelationships,
  ...structuralRelationships,
  ...envelopeRelationships,
  ...roofingRelationships,
  ...interiorsRelationships,
  ...mechanicalRelationships,
  ...electricalRelationships,
  ...fireLifeSafetyRelationships,
  ...externalRelationships,
  ...testingCloseoutRelationships,
  ...crossDisciplineRelationships
];

const quickViews = [
  ...section01QuickViews,
  ...section02QuickViews,
  ...section03QuickViews,
  ...section04QuickViews,
  ...section05QuickViews,
  ...section06QuickViews,
  ...section07QuickViews,
  ...section08QuickViews,
  ...section09QuickViews,
  ...section10QuickViews,
  ...section11QuickViews,
  ...section12QuickViews,
  ...section13QuickViews,
  ...section14QuickViews
];

const learnContent = [
  ...section01Learn,
  ...section02Learn,
  ...section03Learn,
  ...section04Learn,
  ...section05Learn,
  ...section06Learn,
  ...section07Learn,
  ...section08Learn,
  ...section09Learn,
  ...section10Learn,
  ...section11Learn,
  ...section12Learn,
  ...section13Learn,
  ...section14Learn
];

const terminology = [
  ...terminologyQuality,
  ...terminologyEarthworks,
  ...terminologyConcrete,
  ...terminologyStructural,
  ...terminologyEnvelope,
  ...terminologyRoofing,
  ...terminologyInteriors,
  ...terminologyMechanical,
  ...terminologyElectrical,
  ...terminologyFireLifeSafety,
  ...terminologyTesting,
  ...terminologyCloseout,
  ...terminologyBatirQc
];

export const productionCanonicalDataset = {
  sections,
  activities,
  quickViews,
  learnContent,
  relationships,
  gates,
  invalidationRules,
  conditions,
  workflows,
  preConcealmentWorkflows,
  terminology,
  acronyms,
  uiStrings,
  version: {
    schemaVersion: "phase-002",
    contentVersion: "phase-015-production-workflow-preconcealment",
    terminologyVersion: "phase-013a-batir-terminology"
  }
};
