# Screen Contracts

Phase 005 implements the Application Route & Screen Contract from the
implementation blueprint. It defines what each primary route is allowed to
consume and expose before final screen presentation is built.

This phase does not implement final UI design, production QC content, search
indexing, localization rendering, favorites/recents persistence, official
project-QMS actions, or Phase 006+ usability features.

## Screen Contract Layer

`src/services/screenContracts/screenContracts.ts` defines the eight application
screen contracts:

- Home
- Section/System
- Activity
- Composite Workflow
- Pre-Concealment
- Gate
- Search
- Terminology/Acronym Detail

Each contract records:

- route pattern;
- primary user question;
- required data families;
- allowed navigation target types;
- forbidden controls.

The forbidden controls are part of the product boundary. For example, Gate
screens forbid approval, release, and signature controls because this app is a
universal field guide, not the project QMS.

## Screen Models

`src/services/screenContracts/screenModels.ts` builds non-visual screen models
from Phase 003 registries and Phase 004 relationship/navigation services.

The models are intentionally view-facing but not component-specific. They answer
questions such as:

- does the route object exist?
- which sections have data and may be shown?
- which canonical objects can this screen link to?
- which activity modes are available?
- which relationship groups are directly available?

These models do not mutate canonical data and do not create alternate
relationships.

## Phase 003 Consumption

Screen models consume only validated `CanonicalRegistries`. They do not import
raw canonical data files and do not bypass schema or referential-integrity
validation.

Examples:

- Section models use `getActivitiesBySection(sectionId)`.
- Activity models use registries for QuickView, LearnContent, terminology refs,
  and canonical section breadcrumbs.
- Workflow and pre-concealment models resolve referenced activity/gate IDs
  through registries.
- Terminology models resolve related activities and concepts through registries.

## Phase 004 Consumption

Activity screen models use `createRelationshipService()` to receive direct
relationship navigation groups. Gate screen models use the relationship service
to reverse-derive activities controlled by `GATED_BY` relationships.

Relationship groups remain runtime-derived. They are not written back into
Activity objects.

## Visibility Rules

The contract layer follows the blueprint's tight-interface rule:

- hide Favorites and Recents when no data is supplied;
- hide unavailable Activity modes;
- hide empty pre-concealment sections;
- return `notFound` for missing route objects;
- do not emit project-status, approval, release, or report actions.

Search currently preserves query state at the contract level only. It does not
build or rank results in this phase.

## Conservative Assumptions

The blueprint permits the terminology route to handle acronym detail. The
terminology screen model therefore resolves either a `TerminologyConcept` or an
`AcronymEntry` from the same `/term/:conceptId` route.

Home/Favorites/Recents are represented as optional route-target inputs to the
Home screen model, but persistence remains deferred.

## Deferred

Later phases still own:

- final screen rendering and responsive layout;
- visible relationship strips/drawers;
- real Quick / Full / Learn presentation components;
- search index generation, matching, filters, and ranking;
- localization rendering;
- favorites and recents storage behavior;
- custom Back button behavior and scroll restoration;
- terminology overlays/sheets;
- gate/workflow/pre-concealment presentation UI.
