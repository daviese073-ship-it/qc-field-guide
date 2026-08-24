# Canonical Domain Model

Phase 002 defines object shape only. It does not ingest Build 2 content, create
production datasets, implement registries/loaders, derive relationship
navigation, or validate cross-object references.

## Schema Strategy

Zod schemas are the runtime authority. TypeScript domain types are inferred from
those schemas with `z.infer`, so static contracts and runtime validation stay
synchronized.

## Canonical Objects

- `Section`: organizational hierarchy for the main systems. Sections own titles,
  descriptions, and order, but not duplicated full activity objects.
- `Activity`: the main technical-content object. Build 2 technical content will
  later live in activity fields such as requirements, planning, inspection,
  evidence, issues, corrective action, verification, closure, reporting, and
  checkpoints.
- `Relationship`: the navigation graph. Relationships live once, outside
  activities, using Build 3 relationship types and directionality. Future
  services will derive Before, After, Interfaces, Gates, Testing,
  Commissioning, and Closeout navigation from this graph.
- `ConditionDefinition`: the controlled applicability vocabulary for universal
  conditional behavior such as `whereSpecified`, `whereRated`, and
  `whereConcealed`.
- `Gate`: a universal logic node that asks whether downstream work can proceed.
  It may define prerequisite activities, checks, blocking conditions, release
  conditions, downstream activities, and invalidation rule references.
- `InvalidationRule`: recheck guidance for later modifications that may affect
  accepted or verified work. It is guidance metadata, not inspection-history
  persistence.
- `QuickView`: deterministic curated field compression keyed by `activityId`.
  It can highlight high-priority relationship IDs but does not redefine
  relationships.
- `LearnContent`: educational material keyed by `activityId`. It is not a
  separate activity.
- `Workflow` and `WorkflowStage`: composite task structures that reference
  activity, gate, and relationship IDs instead of duplicating technical content.
- `PreConcealmentWorkflow`: gate-driven shortcut structure for before-closing,
  before-covering, before-pouring, or before-backfilling guidance.
- `TerminologyConcept`: concept-first bilingual terminology record with
  language-neutral ID, preferred terms, aliases, status/confidence metadata, and
  related activity/concept IDs.
- `AcronymEntry`: acronym and abbreviation record with Build 4 relation types
  such as exact equivalents, shared acronyms, related-but-not-equivalent
  concepts, and organization-specific terminology.
- `UiString`: recurring interface string shape. The dictionary is not populated
  in this phase.
- `SearchIndexEntry` and `SearchResult`: derived search shapes. Search index
  data must be generated later from canonical sources and must not become an
  independently maintained source of truth.
- `VersionInfo`: simple schema/content/terminology version object.

## Authoritative Versus Derived

Authoritative future datasets:

- activities
- relationships
- gates
- invalidation rules
- conditions
- quick views
- workflows
- pre-concealment workflows
- learn content
- terminology
- acronyms
- UI strings

Derived future data:

- search index
- search results
- reverse relationships
- relationship navigation groups
- breadcrumbs and contextual navigation
- localized display labels

## Relationship Separation

Activities do not contain canonical `beforeLinks`, `afterLinks`,
`interfaceLinks`, or `testingLinks`. Build 3 freezes relationships as a central
graph so each relationship is stored once and reverse/reciprocal navigation is
derived later. This prevents link drift and duplicate technical logic in page
objects.

## Gate Boundary

A `Gate` is a universal field-guide logic definition. It is not an official
project hold point, approval, release, signature, formal inspection record, or
acceptance record. Fields such as `approvedBy`, `signature`, `releasedAt`, live
project status, and project acceptance state are intentionally absent.

## Language-Neutral IDs

Canonical IDs remain language-neutral strings. Examples such as `10.3`,
`G-STR-01`, `WF-CON-01`, and `PC-FIRE-01` are identifiers, not numbers and not
localized route fragments.

## Phase 003 Boundary

Referential integrity is intentionally deferred. Phase 002 validates individual
object shape only. Phase 003 can add registries/loaders and checks that referenced
section IDs, activity IDs, gate IDs, relationship IDs, condition IDs, terminology
IDs, and invalidation rule IDs actually exist.
