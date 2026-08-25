# Production Field-Presentation Data

Phase 014 adds production authored field-presentation data on top of the
validated canonical QC dataset. It does not implement the final Quick or Learn
UI.

## Objective

The phase creates production `QuickView` and `LearnContent` records for all 139
activities. These records present existing Build-2/Build-3-governed activity
content in field-facing forms without changing canonical activity identities,
relationships, gates, conditions, invalidation rules, terminology, or routes.

## Architecture

Presentation data is loaded through the same `CanonicalDataset` boundary as the
rest of the production data:

- `src/data/quick/section-01.quick.json` through `section-14.quick.json`
- `src/data/learn/section-01.learn.json` through `section-14.learn.json`
- `src/data/productionCanonicalDataset.ts`

The existing Phase-003 registries key both `QuickView` and `LearnContent` by
`activityId`, so presentation records supplement an Activity rather than create
new activity identity.

## QuickView Strategy

QuickView is a concise field-use compression. The generator maps populated
canonical activity fields into:

- `before`: preparation, requirements, planning, and document-control source
  items;
- `inspect`: inspection, material-control, and checkpoint source items;
- `evidence`: evidence, verification, and closure source items;
- `watchFor`: common deficiencies and corrective-action source items;
- `dontMiss`: quality checkpoint, closure, and verification source items;
- `gateNext`: existing gate references where the activity already has them;
- `priorityRelationshipIds`: high-priority existing relationship IDs touching
  the activity.

No QuickView item creates a new QC requirement. Each item maps back to a
canonical activity field or content item.

## LearnContent Strategy

LearnContent is organized for comprehension rather than field scanning. It maps
existing canonical activity content into:

- `whatIsThis`
- `whyItMatters`
- `howGoodWorkLooks`
- `criticalChecksExplained`
- `commonFailures`
- `interfacesAndSequence`
- `terminologyRefs`

The phase does not invent practical examples. The source activity corpus did
not contain structured `PracticalExample` records, so `practicalExamples` remains
empty unless later source-authorized content is added.

## Bilingual Strategy

Presentation strings reuse the same localized content already present on
canonical Phase-013A activity content. French presentation text is therefore
present for every presentation item, but remains provisional because the Phase
013A French corpus is machine/deterministic draft content.

Current presentation localization status:

- EN coverage: 7,604 / 7,604
- FR coverage: 7,604 / 7,604
- reviewed/final FR: 0
- provisional FR: 7,604
- fallback-only: 0

## Traceability

Every presentation `ContentItem` carries `sourceRef`:

- `section`: canonical activity ID;
- `page`: source canonical content-item ID or source activity field name;
- `document`: `Authored field-presentation data`;
- `build`: `Phase 014`.

The production presentation audit verifies that every presentation item resolves
to an existing canonical activity and source content item or supported activity
field.

## Generation / Authorship

The data was generated deterministically by
`scripts/generate-phase014-presentation-data.py`.

Directly mapped:

- canonical content item text;
- existing bilingual `text.en` / `text.fr`;
- condition references;
- terminology references;
- authority/high-control metadata;
- existing gate and relationship IDs.

Deterministically generated:

- presentation content-item IDs;
- presentation grouping by source field family;
- sourceRef mapping metadata;
- concise QuickView selections;
- organized LearnContent selections.

Authored/restructured:

- source field families were assigned to Quick and Learn structures according to
  the Build-5 presentation contract.

Flagged for later review:

- six QuickView records and seven LearnContent records have fewer populated
  presentation groups because the canonical source activity is source-limited
  and should not be padded with invented content.

## Validation

`npm run validate:presentation` validates:

- 14 sections and 139 activities processed;
- 139 QuickView and 139 LearnContent records;
- activity ownership and orphan records;
- duplicate presentation item IDs;
- empty records;
- sourceRef resolution;
- bilingual EN/FR coverage and French status;
- fallback-only presentation content;
- structure-gap metrics;
- no Workflow or PreConcealmentWorkflow records in this phase.

`npm run validate:data` also includes the Phase-014 presentation audit.

## Deferred

Still deferred:

- final QuickView UI;
- final Learn UI;
- production Workflow records;
- production PreConcealmentWorkflow records;
- search indexing/ranking;
- route-bound production screen composition;
- field interaction state;
- official project-QMS records, approvals, releases, signatures, deficiency
  instances, NCR instances, or project status tracking.
