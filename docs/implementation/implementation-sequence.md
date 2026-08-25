# Implementation Sequence And Dependency Plan

Phase 008 implements the final blueprint planning step: converting the frozen
architecture into an operational Codex execution sequence.

Phase 008A corrected the future sequence to add a dedicated Phase 010 for full
Build 2 technical activity content. This correction does not begin production
content ingestion, search, final screen implementation, or any later feature
work.

## Responsibility

Phase 008 adds:

- `docs/codex/phase-sequence.md`, the ordered phase plan;
- `scripts/validate-phase-plan.mjs`, an executable phase-plan audit;
- `npm run validate:phase-plan`;
- focused tests for the validator.

## Dependency Rules

Every future phase must declare:

- prerequisite phase checkpoint;
- allowed touch areas;
- forbidden scope;
- acceptance checks;
- checkpoint expectation.

Future phase descriptions in the sequence document are dependency order only.
They do not authorize implementation by themselves.

## Corrected Future Sequence

The corrected post-Phase-008 dependency chain is:

1. Phase 009 - Production Canonical Identity Seed.
2. Phase 010 - Production Technical Activity Content.
3. Phase 011 - Production Logic Registries.
4. Phase 012 - Production Relationship Registry.
5. Phase 013 - Terminology, Acronyms, Localization, And UI Strings.
6. Phase 014 - Authored Field Presentation Data.
7. Phase 015 - Derived Search Infrastructure.
8. Phase 016 - Route-Bound Screen Composition.
9. Phase 017 - Field Interaction And Offline Polish.
10. Final MVP Acceptance Audit.

The explicit Phase 010 closes the planning gap between identity seeding and
logic/relationship/presentation work. Build 2 owns this technical activity
content, and ingestion should happen in reviewable section-level batches with
validation between batches.

## Architecture Consumption

The phase plan preserves the existing dependency flow:

Canonical data -> services -> screen contracts -> reusable components -> route
composition -> field interaction.

It also preserves the Phase 007 technical foundation freeze by requiring
`validate:foundation` and by explicitly deferring backend, database, monorepo,
dependency, and search-index drift unless a later phase authorizes a narrow
change.

## Validation

`npm run validate:phase-plan` verifies that the phase sequence document exists
and contains the required operational markers:

- global rules;
- ordered phases;
- prerequisites;
- allowed touch;
- forbidden scope;
- acceptance;
- checkpoint;
- future work package warning.
- the dedicated Build 2 technical-content phase;
- downstream phases through Phase 017;
- final MVP acceptance audit.

The validator is deliberately simple. It protects the presence of the plan and
its main governance sections; it does not interpret product content.

## Deferred

Still deferred to later phases:

- production Build 2 content ingestion;
- production conditions, gates, invalidation rules, and relationships;
- terminology/acronym/UI-string population;
- QuickView, LearnContent, Workflow, and PreConcealmentWorkflow production
  data;
- derived search indexing/ranking/results;
- final route-bound screen composition;
- field interaction and offline polish;
- backend, database, accounts, analytics, official records, approvals,
  releases, and signatures.
