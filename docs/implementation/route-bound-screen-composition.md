# Phase 017 - Route-Bound Screen Composition

Phase 017 composes the production-facing route screens from the canonical data
and service layers created in earlier phases. It does not create new canonical
content, relationships, localization records, search records, or project-QMS
behavior.

## Responsibility

The phase replaces the temporary development route scaffolds with production
screen composition for:

- `/`
- `/section/:sectionId`
- `/activity/:activityId`
- `/workflow/:workflowId`
- `/preconcealment/:preConcealmentId`
- `/gate/:gateId`
- `/search`
- `/term/:conceptId`
- Not Found routes

The route parameters remain language-neutral canonical string IDs. Language
preference changes visible rendering only; it does not change the route or
object identity.

## Data Boundary

Screens consume `src/app/productionAppData.ts`, which exposes the validated
production dataset, registries, search service, search index, UI strings, and
validation result through one application-level boundary.

Screens do not import raw canonical data files directly. They use the Phase 003
registries, Phase 004 relationship/navigation services through Phase 005 screen
models, Phase 006 presentation components, and the Phase 016 search service.

## Screen Composition

The home screen presents the universal QC field guide boundary, production
section catalogue, and available workflow/pre-concealment entry points.

Section screens list the activities owned by the section using deterministic
canonical ordering and canonical activity routes.

Activity screens render available Quick, Full, and Learn modes. Quick and Learn
content comes from authored production presentation records. Full mode renders
available activity content groups. Empty or unavailable panels are hidden.
Relationship groups are rendered from the derived navigation service, not from
activity-local relationship arrays.

Workflow and pre-concealment screens render universal guidance structures from
validated production records. They do not create workflow instances, completion
state, approvals, releases, signatures, hold-point releases, or formal project
records.

Gate screens render universal gate-definition guidance only. They do not create
live approval or project acceptance state.

Search renders Phase 016 derived search results and links them to canonical
routes. It does not create a second search index or store search as canonical
input data.

Terminology and acronym detail screens render existing Build-4-governed records
and related canonical links. They do not invent missing French terminology.

## Responsive And Visual Boundary

The correction pass aligns the route-bound screens more closely with the
design-reference composition while preserving the established data and service
boundaries. The application now uses a persistent desktop field-guide shell:

- a dark top header with the product mark, global search, and visible `EN` /
  `FR` language controls;
- a desktop left sidebar for primary navigation families and section browsing;
- a main work surface with a right rail for contextual, data-backed supporting
  information.

Home, section, activity, workflow, pre-concealment, gate, search, and
terminology screens use compact operational layouts that mirror the reference
hierarchy: system grids, structured activity lists, checklist-first Quick mode,
accordion-based Full/Learn modes, workflow sequence tables, pre-concealment
process bands, gate guidance panels, reference-style search results, and
terminology detail panels.

The visible primary language selector intentionally exposes only `EN` and `FR`.
The underlying typed bilingual preference foundation remains available for the
localization architecture, but simultaneous `EN/FR` mode is not a primary
field-control surface in this correction pass. Terminology detail screens may
still show bilingual comparison where the source data and Build 4 architecture
make that useful.

The correction pass does not add new canonical data, official project-QMS
behavior, decorative controls, fake project state, or unsupported interaction
state. Sidebar entries for unavailable future conveniences are muted and
non-interactive rather than pretending to work.

## Deferred

Phase 017 deliberately leaves these items to later phases:

- session-only checklist or accordion state;
- custom Back behavior and scroll restoration;
- offline polish beyond the existing PWA foundation;
- favorites, recents, and any authorized field interaction state;
- field-presentation quality review;
- bilingual authority/content review;
- official project-QMS behavior, approvals, releases, signatures, inspection
  records, NCR/deficiency instances, or project status tracking;
- backend services, APIs, databases, authentication, analytics, and CMS
  functionality.
