import type { CanonicalRegistries } from "@/domain/registries";
import type {
  Activity,
  AcronymEntry,
  ContentBlock,
  ContentItem,
  Gate,
  InvalidationRule,
  LearnContent,
  PreConcealmentWorkflow,
  QuickView,
  Relationship,
  TerminologyConcept,
  Workflow
} from "@/domain/types";

const requireReference = (
  errors: string[],
  exists: boolean,
  message: string
) => {
  if (!exists) {
    errors.push(message);
  }
};

const validateIds = (
  errors: string[],
  ids: readonly string[] | undefined,
  exists: (id: string) => boolean,
  makeMessage: (id: string) => string
) => {
  for (const id of ids ?? []) {
    requireReference(errors, exists(id), makeMessage(id));
  }
};

const validateContentItem = (
  item: ContentItem,
  context: string,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  if (item.conditionId) {
    requireReference(
      errors,
      registries.conditions.has(item.conditionId),
      `${context} item "${item.id}" references missing condition "${item.conditionId}"`
    );
  }

  validateIds(
    errors,
    item.terminologyRefs,
    (id) => registries.terminology.has(id),
    (id) => `${context} item "${item.id}" references missing term "${id}"`
  );
};

const validateContentBlocks = (
  blocks: readonly ContentBlock[] | undefined,
  context: string,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  for (const block of blocks ?? []) {
    switch (block.type) {
      case "paragraph":
      case "notice":
        validateContentItem(block.item, context, registries, errors);
        break;
      case "bulletList":
      case "checkList":
        for (const item of block.items) {
          validateContentItem(item, context, registries, errors);
        }
        break;
      case "example":
      case "referenceList":
      case "subheading":
        break;
    }
  }
};

const validateActivity = (
  activity: Activity,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  const context = `Activity "${activity.id}"`;

  requireReference(
    errors,
    registries.sections.has(activity.sectionId),
    `${context} references missing section "${activity.sectionId}"`
  );

  validateIds(
    errors,
    activity.logic?.gateIds,
    (id) => registries.gates.has(id),
    (id) => `${context} references missing gate "${id}"`
  );
  validateIds(
    errors,
    activity.logic?.invalidationRuleIds,
    (id) => registries.invalidationRules.has(id),
    (id) => `${context} references missing invalidation rule "${id}"`
  );
  validateIds(
    errors,
    activity.terminologyRefs,
    (id) => registries.terminology.has(id),
    (id) => `${context} references missing term "${id}"`
  );
  validateIds(
    errors,
    activity.searchRefs?.acronyms,
    (id) => registries.acronyms.has(id),
    (id) => `${context} references missing acronym "${id}"`
  );

  validateContentBlocks(
    activity.requirements,
    `${context}.requirements`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.planning,
    `${context}.planning`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.documentControl,
    `${context}.documentControl`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.materialControl,
    `${context}.materialControl`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.inspection?.before,
    `${context}.inspection.before`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.inspection?.during,
    `${context}.inspection.during`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.inspection?.after,
    `${context}.inspection.after`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.inspection?.testing,
    `${context}.inspection.testing`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.evidence,
    `${context}.evidence`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.issues?.commonDeficiencies,
    `${context}.issues.commonDeficiencies`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.issues?.escalationTriggers,
    `${context}.issues.escalationTriggers`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.correctiveAction,
    `${context}.correctiveAction`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.verification,
    `${context}.verification`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.closureCriteria,
    `${context}.closureCriteria`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.communications?.before,
    `${context}.communications.before`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.communications?.during,
    `${context}.communications.during`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.communications?.issueEscalation,
    `${context}.communications.issueEscalation`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.communications?.after,
    `${context}.communications.after`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.outputs?.records,
    `${context}.outputs.records`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.outputs?.acceptanceEvidence,
    `${context}.outputs.acceptanceEvidence`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.outputs?.followUp,
    `${context}.outputs.followUp`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.reportingAnalysis,
    `${context}.reportingAnalysis`,
    registries,
    errors
  );
  validateContentBlocks(
    activity.qualityCheckpoint,
    `${context}.qualityCheckpoint`,
    registries,
    errors
  );

  if (activity.specialistBoundary) {
    validateContentItem(
      activity.specialistBoundary,
      `${context}.specialistBoundary`,
      registries,
      errors
    );
  }
};

const validateRelationship = (
  relationship: Relationship,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  const context = `Relationship "${relationship.id}"`;

  requireReference(
    errors,
    registries.nodes.hasNode(relationship.sourceId),
    `${context} references missing source node "${relationship.sourceId}"`
  );
  requireReference(
    errors,
    registries.nodes.hasNode(relationship.targetId),
    `${context} references missing target node "${relationship.targetId}"`
  );

  if (relationship.conditionId) {
    requireReference(
      errors,
      registries.conditions.has(relationship.conditionId),
      `${context} references missing condition "${relationship.conditionId}"`
    );
  }
};

const validateGate = (
  gate: Gate,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  const context = `Gate "${gate.id}"`;

  validateIds(
    errors,
    gate.prerequisiteActivityIds,
    (id) => registries.activities.has(id),
    (id) => `${context} references missing prerequisite activity "${id}"`
  );
  validateIds(
    errors,
    gate.downstreamActivityIds,
    (id) => registries.activities.has(id),
    (id) => `${context} references missing downstream activity "${id}"`
  );
  validateIds(
    errors,
    gate.invalidationRuleIds,
    (id) => registries.invalidationRules.has(id),
    (id) => `${context} references missing invalidation rule "${id}"`
  );

  validateContentBlocks(
    gate.checkItems,
    `${context}.checkItems`,
    registries,
    errors
  );
  validateContentBlocks(
    gate.blockingConditions,
    `${context}.blockingConditions`,
    registries,
    errors
  );
};

const validateInvalidationRule = (
  rule: InvalidationRule,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  const context = `InvalidationRule "${rule.id}"`;

  validateIds(
    errors,
    rule.affectedActivityIds,
    (id) => registries.activities.has(id),
    (id) => `${context} references missing affected activity "${id}"`
  );
  validateIds(
    errors,
    rule.affectedGateIds,
    (id) => registries.gates.has(id),
    (id) => `${context} references missing affected gate "${id}"`
  );
  validateIds(
    errors,
    rule.affectedNodeIds,
    (id) => registries.nodes.hasNode(id),
    (id) => `${context} references missing affected node "${id}"`
  );

  if (rule.conditionId) {
    requireReference(
      errors,
      registries.conditions.has(rule.conditionId),
      `${context} references missing condition "${rule.conditionId}"`
    );
  }

  validateContentBlocks(
    rule.recheckGuidance,
    `${context}.recheckGuidance`,
    registries,
    errors
  );
};

const validateQuickView = (
  quickView: QuickView,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  const context = `QuickView "${quickView.activityId}"`;

  requireReference(
    errors,
    registries.activities.has(quickView.activityId),
    `${context} references missing activity "${quickView.activityId}"`
  );
  validateIds(
    errors,
    quickView.gateNext?.gateIds,
    (id) => registries.gates.has(id),
    (id) => `${context} references missing gate "${id}"`
  );
  validateIds(
    errors,
    quickView.gateNext?.nextActivityIds,
    (id) => registries.activities.has(id),
    (id) => `${context} references missing next activity "${id}"`
  );
  validateIds(
    errors,
    quickView.priorityRelationshipIds,
    (id) => registries.relationships.has(id),
    (id) => `${context} references missing relationship "${id}"`
  );

  validateContentBlocks(
    quickView.before,
    `${context}.before`,
    registries,
    errors
  );
  validateContentBlocks(
    quickView.inspect,
    `${context}.inspect`,
    registries,
    errors
  );
  validateContentBlocks(
    quickView.evidence,
    `${context}.evidence`,
    registries,
    errors
  );
  validateContentBlocks(
    quickView.watchFor,
    `${context}.watchFor`,
    registries,
    errors
  );
  validateContentBlocks(
    quickView.dontMiss,
    `${context}.dontMiss`,
    registries,
    errors
  );
};

const validateLearnContent = (
  learnContent: LearnContent,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  const context = `LearnContent "${learnContent.activityId}"`;

  requireReference(
    errors,
    registries.activities.has(learnContent.activityId),
    `${context} references missing activity "${learnContent.activityId}"`
  );
  validateIds(
    errors,
    learnContent.terminologyRefs,
    (id) => registries.terminology.has(id),
    (id) => `${context} references missing term "${id}"`
  );

  validateContentBlocks(
    learnContent.whatIsThis,
    `${context}.whatIsThis`,
    registries,
    errors
  );
  validateContentBlocks(
    learnContent.whyItMatters,
    `${context}.whyItMatters`,
    registries,
    errors
  );
  validateContentBlocks(
    learnContent.howGoodWorkLooks,
    `${context}.howGoodWorkLooks`,
    registries,
    errors
  );
  validateContentBlocks(
    learnContent.criticalChecksExplained,
    `${context}.criticalChecksExplained`,
    registries,
    errors
  );
  validateContentBlocks(
    learnContent.commonFailures,
    `${context}.commonFailures`,
    registries,
    errors
  );
  validateContentBlocks(
    learnContent.interfacesAndSequence,
    `${context}.interfacesAndSequence`,
    registries,
    errors
  );
};

const validateWorkflow = (
  workflow: Workflow,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  const context = `Workflow "${workflow.id}"`;

  validateIds(
    errors,
    workflow.activityIds,
    (id) => registries.activities.has(id),
    (id) => `${context} references missing activity "${id}"`
  );
  validateIds(
    errors,
    workflow.gateIds,
    (id) => registries.gates.has(id),
    (id) => `${context} references missing gate "${id}"`
  );
  validateIds(
    errors,
    workflow.relatedRelationshipIds,
    (id) => registries.relationships.has(id),
    (id) => `${context} references missing relationship "${id}"`
  );

  for (const stage of workflow.stages ?? []) {
    const stageContext = `${context} stage "${stage.id}"`;

    validateIds(
      errors,
      stage.activityIds,
      (id) => registries.activities.has(id),
      (id) => `${stageContext} references missing activity "${id}"`
    );
    validateIds(
      errors,
      stage.gateIds,
      (id) => registries.gates.has(id),
      (id) => `${stageContext} references missing gate "${id}"`
    );
    validateIds(
      errors,
      stage.relationshipIds,
      (id) => registries.relationships.has(id),
      (id) => `${stageContext} references missing relationship "${id}"`
    );

    if (stage.conditionId) {
      requireReference(
        errors,
        registries.conditions.has(stage.conditionId),
        `${stageContext} references missing condition "${stage.conditionId}"`
      );
    }
  }

  validateContentBlocks(
    workflow.evidenceFocus,
    `${context}.evidenceFocus`,
    registries,
    errors
  );
  validateContentBlocks(
    workflow.issuePath,
    `${context}.issuePath`,
    registries,
    errors
  );
};

const validatePreConcealmentWorkflow = (
  workflow: PreConcealmentWorkflow,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  const context = `PreConcealmentWorkflow "${workflow.id}"`;

  validateIds(
    errors,
    workflow.activityIds,
    (id) => registries.activities.has(id),
    (id) => `${context} references missing activity "${id}"`
  );
  validateIds(
    errors,
    workflow.gateIds,
    (id) => registries.gates.has(id),
    (id) => `${context} references missing gate "${id}"`
  );
  validateIds(
    errors,
    workflow.nextActivityIds,
    (id) => registries.activities.has(id),
    (id) => `${context} references missing next activity "${id}"`
  );

  validateContentBlocks(
    workflow.criticalChecks,
    `${context}.criticalChecks`,
    registries,
    errors
  );
  validateContentBlocks(
    workflow.evidence,
    `${context}.evidence`,
    registries,
    errors
  );
  validateContentBlocks(
    workflow.blockIf,
    `${context}.blockIf`,
    registries,
    errors
  );
};

const validateTerminologyConcept = (
  concept: TerminologyConcept,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  const context = `TerminologyConcept "${concept.id}"`;

  validateIds(
    errors,
    concept.relatedActivityIds,
    (id) => registries.activities.has(id),
    (id) => `${context} references missing activity "${id}"`
  );
  validateIds(
    errors,
    concept.relatedConceptIds,
    (id) => registries.terminology.has(id),
    (id) => `${context} references missing related concept "${id}"`
  );
};

const validateAcronymEntry = (
  acronym: AcronymEntry,
  registries: CanonicalRegistries,
  errors: string[]
) => {
  const context = `AcronymEntry "${acronym.id}"`;

  validateIds(
    errors,
    acronym.relatedConceptIds,
    (id) => registries.terminology.has(id),
    (id) => `${context} references missing concept "${id}"`
  );
  validateIds(
    errors,
    acronym.relatedActivityIds,
    (id) => registries.activities.has(id),
    (id) => `${context} references missing activity "${id}"`
  );
  validateIds(
    errors,
    acronym.relatedWorkflowIds,
    (id) => registries.workflows.has(id),
    (id) => `${context} references missing workflow "${id}"`
  );
  validateIds(
    errors,
    acronym.relatedGateIds,
    (id) => registries.gates.has(id),
    (id) => `${context} references missing gate "${id}"`
  );
};

export const validateReferentialIntegrity = (
  registries: CanonicalRegistries
): readonly string[] => {
  const errors: string[] = [];

  for (const activity of registries.activities.getAll()) {
    validateActivity(activity, registries, errors);
  }
  for (const relationship of registries.relationships.getAll()) {
    validateRelationship(relationship, registries, errors);
  }
  for (const gate of registries.gates.getAll()) {
    validateGate(gate, registries, errors);
  }
  for (const rule of registries.invalidationRules.getAll()) {
    validateInvalidationRule(rule, registries, errors);
  }
  for (const quickView of registries.quickViews.getAll()) {
    validateQuickView(quickView, registries, errors);
  }
  for (const learnContent of registries.learnContent.getAll()) {
    validateLearnContent(learnContent, registries, errors);
  }
  for (const workflow of registries.workflows.getAll()) {
    validateWorkflow(workflow, registries, errors);
  }
  for (const workflow of registries.preConcealmentWorkflows.getAll()) {
    validatePreConcealmentWorkflow(workflow, registries, errors);
  }
  for (const concept of registries.terminology.getAll()) {
    validateTerminologyConcept(concept, registries, errors);
  }
  for (const acronym of registries.acronyms.getAll()) {
    validateAcronymEntry(acronym, registries, errors);
  }

  return errors;
};
