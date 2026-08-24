# Data Loading And Integrity

Phase 003 establishes the canonical data pipeline:

```text
raw structured data -> schema validation -> canonical registries -> referential-integrity validation
```

It does not ingest production Build 2 content and does not implement Phase 004
relationship derivation or navigation behavior.

## Canonical Dataset Boundary

`CanonicalDataset` is the aggregate boundary for authored canonical data:

- sections
- activities
- quickViews
- learnContent
- relationships
- gates
- invalidationRules
- conditions
- workflows
- preConcealmentWorkflows
- terminology
- acronyms
- uiStrings
- version

The search index is excluded because it is derived data, not an authoritative
input dataset.

## Schema Validation

`loadCanonicalDataset()` receives raw structured data and parses every
collection through the Phase 002 Zod schemas. Malformed objects fail before any
registry is built.

The Phase 002 schemas remain the runtime authority. Phase 003 adds loading and
integrity checks around them rather than redesigning the object model.

## Registries

`buildCanonicalRegistries()` normalizes validated collections into read-only
lookup APIs. Public registry operations are intentionally small:

- `getById(id)`
- `has(id)`
- `getAll()`

Activity lookup also provides `getActivitiesBySection(sectionId)`, sorted with a
small numeric-aware canonical ID comparator so IDs such as `10.10` do not sort
before `10.3`.

QuickView and LearnContent registries are keyed by `activityId` because those
objects supplement an Activity and do not create new activity identity.

## Node Resolution

The node resolver answers whether a relationship endpoint resolves to a legal
canonical graph node. Phase 003 supports the current Build 3 endpoint universe
needed for validation:

- activity
- gate
- workflow
- preConcealmentWorkflow

The resolver can answer:

- `resolveNode(id)`
- `hasNode(id)`
- `getNodeKind(id)`

It does not derive navigation groups.

## Referential Integrity

The validator checks object references against the registry family they are
allowed to target. Examples include:

- `Activity.sectionId -> Section`
- `Activity.logic.gateIds -> Gate`
- `Activity.logic.invalidationRuleIds -> InvalidationRule`
- `Activity.terminologyRefs -> TerminologyConcept`
- `Relationship.sourceId/targetId -> canonical node resolver`
- `Relationship.conditionId -> ConditionDefinition`
- `QuickView.activityId -> Activity`
- `LearnContent.activityId -> Activity`
- `Workflow.activityIds -> Activity`
- `Workflow.gateIds -> Gate`
- `Workflow.relatedRelationshipIds -> Relationship`
- `PreConcealmentWorkflow.activityIds -> Activity`
- `PreConcealmentWorkflow.gateIds -> Gate`
- `TerminologyConcept.relatedActivityIds -> Activity`
- `AcronymEntry.relatedConceptIds -> TerminologyConcept`
- `InvalidationRule.affectedActivityIds -> Activity`

Condition references inside authored `ContentItem` blocks are also validated.

## Duplicate Handling

Duplicate canonical IDs fail registry construction. The registry never allows
"last object wins" behavior. Duplicate QuickView or LearnContent `activityId`
ownership also fails because those objects are one supplemental object per
activity.

## Failure Behavior

Validation errors are deterministic and actionable. They identify the object and
missing or duplicated reference, for example:

```text
Activity "10.3" references missing section "10"
Relationship "REL-001" references missing target node "10.99"
Duplicate activity ID "10.3"
```

Broken records are not removed, repaired, or auto-created.

## Phase 004 Boundary

Referential validation confirms that `REL-001` has a valid source, type, target,
condition, and endpoint universe. It does not derive:

- Before / After groups
- reciprocal interface navigation
- gate navigation groups
- testing groups
- downstream groups
- breadcrumbs
- invalidation propagation

Those behaviors belong to Phase 004 or later phase instructions.
