# Codex Implementation Phase Sequence

This file operationalizes the implementation blueprint Step 8. It records the
ordered Codex execution sequence, phase dependencies, allowed touch areas,
acceptance checks, and checkpoint expectations.

This plan is not a source of product truth. `AGENTS.md` and the authoritative
source documents remain governing.

## Global Rules

- A future phase prompt authorizes only the named phase.
- A phase may not begin the next phase.
- If a source document is ambiguous, stop and report the ambiguity.
- Do not invent QC content, relationships, gates, workflows, conditions,
  invalidation rules, statuses, translations, or project acceptance criteria.
- Do not create official project-QMS behavior.
- Do not add visible controls unless each has a defined purpose, data source,
  and working behavior.
- Do not add dependencies unless the phase explicitly requires them.
- Run the phase acceptance commands before reporting completion.
- Leave changes uncommitted unless the user explicitly asks for a commit.

## Phase 001 - Repository Foundation

Status: complete.

Prerequisite: source documents present under `docs/source/`.

Allowed touch: repository scaffold, npm/Vite/React/TypeScript/Tailwind/testing
setup, route skeleton, storage wrappers, PWA foundation, README, AGENTS, and
implementation/codex documentation.

Forbidden: production QC content, canonical activity dataset, relationship
logic, Quick/Full/Learn, search, terminology, workflows, gates, project-QMS
state, backend, database, accounts, or final UI.

Acceptance: app renders; routes resolve; IDs remain strings; storage wrappers
work; `typecheck`, `lint`, `test`, `build`, and e2e smoke test pass.

Checkpoint: commit after successful validation.

## Phase 002 - Canonical Domain Schemas

Status: complete.

Prerequisite: Phase 001 complete.

Allowed touch: `src/domain/types/`, `src/domain/schemas/`, focused tests,
schema-compilation validation harness, and domain-model documentation.

Forbidden: production datasets, registries, loaders, relationship derivation,
search implementation, localization rendering, final UI, and backend/database
architecture.

Acceptance: all canonical object shapes parse/fail as expected; official
project fields stay out of canonical gate models; invalid controlled values
fail; full validation suite passes.

Checkpoint: commit after successful validation.

## Phase 003 - Canonical Data Loading And Integrity

Status: complete.

Prerequisite: Phase 002 complete.

Allowed touch: canonical dataset aggregate, loader boundary, read-only
registries, node resolver, duplicate-ID rejection, referential-integrity
validation, non-production fixture dataset, validation CLI, tests, and
documentation.

Forbidden: production Build 2 content, relationship derivation, reverse links,
navigation groups, search indexing, UI rendering, localization rendering, or
workflow/gate runtime state.

Acceptance: valid interconnected fixture loads; duplicate IDs fail; missing
references fail; registries are read-only through public APIs; full validation
suite passes.

Checkpoint: commit after successful validation.

## Phase 004 - Relationship And Navigation Services

Status: complete.

Prerequisite: Phase 003 complete.

Allowed touch: derived relationship/navigation services, route helpers,
navigation context helpers, activity-mode inheritance/defaulting, tests, and
relationship-navigation documentation.

Forbidden: visible relationship UI, production relationship content, search,
localization rendering, invalidation propagation, favorites/recents, backend,
database, or official project status.

Acceptance: relationship groups derive from validated registries; reciprocal
and reverse-derived behavior matches Build 3; duplicate destinations suppress
by strength priority; full validation suite passes.

Checkpoint: commit after successful validation.

## Phase 005 - Application Route And Screen Contracts

Status: complete.

Prerequisite: Phase 004 complete.

Allowed touch: non-visual screen contracts, screen models, activity service,
screen-level visibility rules, tests, and screen-contract documentation.

Forbidden: final UI rendering, production content, search results/ranking,
localization rendering, persistence features, project-QMS actions, or backend
architecture.

Acceptance: eight primary screen contracts exist; screen models consume
registries/services; missing objects return `notFound`; unavailable sections and
modes are hidden; full validation suite passes.

Checkpoint: commit after successful validation.

## Phase 006 - Reusable Component Architecture

Status: complete.

Prerequisite: Phase 005 complete.

Allowed touch: reusable shell, navigation, relationship, activity, content,
terminology, gate, and primitive UI components; focused component tests; and
component-architecture documentation.

Forbidden: production content, final route-bound screen implementation, search
ranking/results, favorites/recents, official project-QMS behavior, backend, or
database.

Acceptance: reusable components render supplied data only, hide empty data,
centralize route/link/localized-text behavior, avoid relationship derivation,
and pass the full validation suite.

Checkpoint: commit after successful validation.

## Phase 007 - Technical Foundation Freeze

Status: complete.

Prerequisite: Phase 006 complete.

Allowed touch: technical foundation audit, required script/dependency checks,
forbidden-dependency checks, repository structure checks, documentation, and
tests.

Forbidden: production content, generated search index, search ranking/results,
screen implementation, backend/database/monorepo architecture, or dependency
drift.

Acceptance: `validate:foundation` passes; full validation suite passes.

Checkpoint: commit after successful validation.

## Phase 008 - Implementation Sequence And Dependency Plan

Status: current phase.

Prerequisite: Phase 007 complete and committed.

Allowed touch: phase sequence documentation, phase-plan validation script,
focused tests for the phase-plan validator, and documentation cross-references.

Forbidden: production QC content, content ingestion, search implementation,
screen implementation, dependency changes, backend/database folders, schema
redesign, relationship-service redesign, component redesign, or any Phase 009
implementation.

Acceptance: phase plan identifies ordered phases, prerequisites, allowed touch,
forbidden scope, acceptance checks, and checkpoint rules; `validate:phase-plan`
passes; full validation suite passes.

Checkpoint: commit after successful validation.

## Future Work Packages

These work packages are dependency order only. They do not authorize work by
themselves. Each future user instruction must name the exact phase and source
documents before any implementation begins.

### Phase 009 - Production Canonical Identity Seed

Prerequisite: Phase 008 complete and committed.

Purpose: establish the production identity catalogue only.

Allowed touch: all authorized canonical sections, all authorized canonical
activity identities, language-neutral canonical IDs, section ownership, ordering,
activity titles where authorized, and source references.

Forbidden: full technical criteria, Quick/Full/Learn content, production
relationships, gates, workflows, search index, UI implementation, or invented
French terminology.

Acceptance: data validates through schemas, registries, and integrity checks;
all IDs remain strings; no fictional fixture content is mixed with production
data.

Checkpoint: commit after successful validation.

### Phase 010 - Production Technical Activity Content

Prerequisite: Phase 009 complete and committed.

Purpose: ingest the substantive production technical activity content governed
by Build 2.

Allowed touch: production activity content fields already represented by the
canonical Activity schema, including where applicable quality objective,
requirements, planning, document control, material control, inspection/testing,
evidence/records, deficiencies/non-conformity guidance, corrective-action
guidance, verification, closure, reporting, checkpoints, practical field
examples, and other Build-2-authored technical activity fields.

Implementation strategy: ingest production activity content in reviewable
section-level batches, with schema and referential validation between batches.
The phase is complete only when the authorized production activity set is
complete and validated.

Forbidden: invented QC criteria, invented acceptance values, invented
inspection/test requirements, invented project-specific acceptance criteria,
official project inspection records, project status, approvals, releases,
signatures, runtime AI-generated canonical content, fictional fixture content
mixed into production data, or duplicated Quick/Learn/workflow presentation data
inside the canonical technical activity record where the architecture assigns
that information elsewhere.

Acceptance: Build 2 remains the technical-content authority; production content
is distinct from development fixtures; all ingested activity content validates
through schemas, registries, and integrity checks; no source gaps are silently
filled; full validation suite passes after every batch and at phase completion.

Checkpoint: commit after successful validation.

### Phase 011 - Production Logic Registries

Prerequisite: Phase 010 complete and committed.

Allowed touch: production condition, gate, and invalidation-rule records where
explicitly authorized.

Forbidden: live approval/release/signature fields, inspection history,
project-status state, relationship derivation changes, or content beyond the
authorized batch.

Acceptance: all references validate, duplicate IDs fail, and gate/invalidation
objects remain universal guidance rather than official project records.

Checkpoint: commit after successful validation.

### Phase 012 - Production Relationship Registry

Prerequisite: Phase 011 complete and committed.

Allowed touch: production relationship records where explicitly authorized and
tests for graph validity.

Forbidden: duplicate reverse links in activities, UI hard-coding,
relationship-service rewrites, or inferred relationships not present in the
authorized source scope.

Acceptance: relationship endpoints resolve, conditions resolve, duplicate IDs
fail, and Phase 004 derivation tests remain green.

Checkpoint: commit after successful validation.

### Phase 013 - Terminology, Acronyms, Localization, And UI Strings

Prerequisite: Phase 012 complete and committed.

Allowed touch: production terminology concepts, acronym records, localization
records, content-translation records where explicitly authorized, and recurring
UI-string records governed by Build 4.

Governance: canonical IDs remain language-neutral; English and French are views
of the same canonical knowledge model; approved/source-governed French
terminology must be used; terminology records, translation/localization records,
and recurring UI strings remain distinct where the source architecture
distinguishes them.

Forbidden: independently invented French technical terminology/content,
duplicated EN/FR components, language-specific routes, search-ranking
implementation unless the phase explicitly includes it, or treating French as
post-MVP optional work.

Acceptance: missing/provisional French follows schema rules, canonical concept
IDs remain language-neutral, recurring UI strings remain centralized, shared
routes/relationships work across languages, and components continue to consume
centralized labels.

Checkpoint: commit after successful validation.

### Phase 014 - Authored Field Presentation Data

Prerequisite: Phase 013 complete and committed.

Allowed touch: QuickView, LearnContent, Workflow, and PreConcealmentWorkflow
records where explicitly authorized by Build 5 and the phase instruction.

Governance: Quick, Full, and Learn are views of the same underlying activity
knowledge rather than independent competing knowledge bases. Quick/Learn/
workflow/pre-concealment data must reference canonical activities and associated
canonical logic rather than silently duplicating or redefining technical truth.

Forbidden: runtime AI generation of Quick content, duplicated or redefined
technical truth inside workflows, official workflow completion state, or final
visual UI polish.

Acceptance: authored presentation data references existing activities,
relationships, gates, conditions, and terminology; empty visible objects fail
validation where required by that phase; bilingual authored/presentation content
requirements from Build 4/5 remain represented.

Checkpoint: commit after successful validation.

### Phase 015 - Derived Search Infrastructure

Prerequisite: Phase 014 complete and committed, with sufficient canonical
content and terminology available for deterministic bilingual search.

Allowed touch: deterministic search normalization, derived search index
generation, search ranking service, generated artifact handling, and tests where
explicitly authorized by Build 4.

Forbidden: manually maintained authoritative search-index data, semantic-vector
or runtime-AI search, search dependencies not explicitly justified, or backend
search APIs.

Acceptance: search index is derived from canonical registries, ranking is
deterministic, generated files are not edited manually, and offline behavior is
preserved.

Checkpoint: commit after successful validation.

### Phase 016 - Route-Bound Screen Composition

Prerequisite: Phase 015 complete and committed, with validated production data
and services sufficient to render meaningful screens without placeholders.

Allowed touch: route components, screen composition, responsive field-use
layouts, and tests that consume Phase 005 screen models and Phase 006
components.

Forbidden: page-local canonical records, relationship derivation in components,
fake controls, fake dashboards, official project-QMS behavior, or duplicated
routes per language.

Acceptance: screens render only available data, hide empty sections, preserve
canonical IDs/routes, and remain usable in required viewports.

Checkpoint: commit after successful validation.

### Phase 017 - Field Interaction And Offline Polish

Prerequisite: Phase 016 complete and committed.

Allowed touch: session-only checklist state, accordion/scroll restoration,
origin-aware Back behavior if not already implemented, offline validation,
responsive overlay behavior, favorites/recents where authorized by the MVP
source, and PWA polish where explicitly authorized.

Forbidden: official inspection records, project status tracking, signatures,
approvals, releases, backend persistence, accounts, or analytics.

Acceptance: interaction state remains temporary and separate from canonical
data; contextual navigation preserves canonical IDs; core content works offline;
the app still does not imply official project-QMS behavior; full validation
suite passes.

Checkpoint: commit after successful validation.

## Dependency Chain

Phase 008 -> Phase 009 identities -> Phase 010 full Build 2 technical activity
content -> Phase 011 logic -> Phase 012 relationships -> Phase 013 bilingual
terminology/localization -> Phase 014 authored Quick/Learn/workflow/
pre-concealment data -> Phase 015 derived bilingual search -> Phase 016 real
route-bound screens -> Phase 017 field interaction/offline polish -> Final MVP
Acceptance Audit.

## Final MVP Acceptance Audit

This is an acceptance/release checkpoint, not an open-ended feature phase. It
may fix defects found against frozen MVP requirements, but it does not authorize
new product scope.

The audit should verify, where applicable from the source-defined MVP:

- all 14 sections render;
- all canonical activities open;
- Quick, Full, and Learn work;
- relationships render dynamically from canonical relationships;
- contextual navigation works;
- workflows work;
- pre-concealment works;
- gates work;
- search works in EN/FR;
- terminology lookup works;
- language switching preserves context;
- favorites/recents work where required by the MVP source;
- responsive layouts work;
- core content works offline;
- no dead controls exist;
- no route leads to an empty page;
- no official project-QMS functionality is implied.

Source-defined end-to-end field test scenarios remain final acceptance checks
where documented by the authoritative Build documents.
