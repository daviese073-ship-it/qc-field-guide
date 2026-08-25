# Production Workflow And Pre-Concealment Data

Phase 015 adds production authored `Workflow` and `PreConcealmentWorkflow`
records on top of the validated canonical dataset. It does not implement final
workflow UI, workflow completion state, official approvals, search, backend
services, or field interaction persistence.

## Objective

The phase converts Build-5 workflow and pre-concealment presentation structures
into canonical production data that references existing production activities,
gates, relationships, and source-linked presentation content. The data helps the
application later answer:

- what composite field workflow is being performed;
- which activities, gates, and relationships are involved;
- what evidence and issue-path content should be emphasized;
- what must be checked before work is closed, covered, poured, or backfilled.

## Workflow Architecture

Production workflow records live in `src/data/workflows/workflows.json` and are
loaded through `productionCanonicalDataset`.

The implemented Build-5 workflow families are:

- `WF-CON-01` - Concrete Pour
- `WF-WALL-01` - Wall Closure
- `WF-CEILING-01` - Ceiling Closure
- `WF-ROOF-01` - Roof Inspection
- `WF-ROOF-02` - Roof Penetration
- `WF-UG-01` - Underground Service Before Backfill
- `WF-EQP-01` - Equipment Installation
- `WF-EQP-02` - Equipment Start-Up
- `WF-TST-01` - Pressure Test
- `WF-FIRE-01` - Firestop Inspection
- `WF-DEF-01` - Deficiency Walk
- `WF-FINAL-01` - Final Acceptance Review

Each workflow uses Build-5 stage labels where applicable: Prepare, Verify,
Execute / Observe, Test, and Release / Close. Stages reference activity and gate
IDs rather than duplicating detailed technical activity content.

## Pre-Concealment Architecture

Production pre-concealment records live in
`src/data/preConcealment/pre-concealment-workflows.json`.

The implemented Build-5 shortcut families are:

- `PC-CON-01` - Before Concrete Pour
- `PC-WALL-01` - Before Wall Closure
- `PC-CEILING-01` - Before Ceiling Closure
- `PC-ROOF-01` - Before Roof Layer
- `PC-UG-01` - Before Underground Backfill
- `PC-FIRE-01` - Before Closing Fire-Rated Assembly
- `PC-MEP-01` - MEP Concealment

Each pre-concealment record references existing pre-concealment-tagged gate
objects. Activities are constrained to the linked gate scope, and next
activities are taken from the linked gate downstream activity IDs.

## Applicability

Workflow applicability is represented by `activityIds` on the workflow record.
Absence from a workflow means the activity is not currently part of one of the
Build-5-authored workflow families; it does not imply the activity is invalid or
unimportant.

Pre-concealment applicability is narrower. A `PreConcealmentWorkflow` must link
to at least one gate tagged `preConcealment`, and its activities must be within
that gate's prerequisite/downstream scope.

## Traceability

Workflow and pre-concealment content items are copied from source-linked
Quick/activity presentation items. Each item keeps a `sourceRef` resolving to an
existing canonical activity and source content item or supported activity field.

Workflow records themselves carry Build-5 provenance in `sourceRef`. They do not
create alternate activity, gate, relationship, or terminology identities.

## Relationship, Gate, And Condition Usage

Workflows reference `gateIds` and `relatedRelationshipIds` from the existing
canonical registries. Phase 015 does not derive relationship-navigation groups,
evaluate conditions, or add new relationship semantics.

Pre-concealment records are gate-driven shortcuts. They are universal guide
structures only, not project hold-point release records.

## Bilingual Strategy

Workflow titles, stage labels, and content items use the established localized
content shape. French workflow and pre-concealment text is provisional. No
reviewed/final French terminology was changed, and no bilingual routes or
duplicated components were introduced.

## Generation / Authorship

The production data is generated deterministically by
`scripts/generate-phase015-workflow-data.py`.

Directly reused:

- canonical activity IDs;
- canonical gate IDs;
- canonical relationship IDs;
- source-linked Quick/activity content items;
- existing provisional French content where already present.

Authored/mapped:

- Build-5 workflow family IDs and titles;
- workflow stage membership;
- pre-concealment shortcut-to-gate mappings;
- workflow content-item IDs.

## Validation

`npm run validate:workflows` validates:

- exact workflow and pre-concealment ID inventories;
- canonical activity, gate, relationship, and condition references;
- duplicate workflow/pre-concealment IDs;
- duplicate workflow content item IDs;
- empty or meaningless workflow records;
- sourceRef resolution;
- bilingual French text/status coverage;
- pre-concealment gate applicability;
- absence of official project-QMS fields.

`npm run validate:data` includes the Phase-015 audit.

## Coverage

Current production coverage:

- workflows: 12 records;
- pre-concealment workflows: 7 records;
- activities with workflow data: 76 / 139;
- activities with pre-concealment workflow data: 37 / 139;
- source-linked workflow/pre-concealment items: 336 / 336;
- French provisional workflow localized values: 415 / 415.

Activities outside the Build-5 workflow/pre-concealment families are deliberately
left without those records instead of padded.

## Limitations

Still deferred:

- final workflow and pre-concealment UI composition;
- workflow completion or checklist state;
- official QMS approvals, releases, signatures, inspection records, NCR
  instances, deficiency instances, or project status tracking;
- relationship navigation derivation changes;
- search indexing/ranking;
- bilingual human review.
