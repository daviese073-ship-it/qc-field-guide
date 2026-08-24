# Component Architecture

Phase 006 implements the reusable component contract layer described by the
implementation blueprint Step 6. The work is intentionally structural: it makes
shared shell, navigation, activity, content, terminology, gate, and primitive UI
components available without adding production QC content or final page designs.

## Responsibility

The component layer renders data supplied by the existing services and screen
contracts. It does not load raw canonical data, derive Build 3 relationships, or
decide which screen sections are available.

The intended flow remains:

Canonical data -> services -> screen contracts -> shared components -> UI
primitives.

## Components Introduced

Shell components:

- `AppHeader`
- `LanguageSwitch`
- `SearchTrigger`

Navigation components:

- `BackButton`
- `Breadcrumb`
- `NavigationLink`
- `RelationshipStrip`
- `RelationshipGroup`

Activity/content components:

- `ActivityModeTabs`
- `CriticalFlagRow`
- `QuickChecklistGroup`
- `WatchForCard`
- `DontMissCard`
- `FullSectionCard`
- `LocalizedText`
- `ContentBlockRenderer`
- `ChecklistItem`
- `ActivityLinkList`
- `PracticalExampleCard`
- `NoticeCard`
- `WarningCard`
- `EmptySafeRenderer`

Gate/terminology components:

- `RecheckCard`
- `TerminologyLink`

Primitive UI components:

- `Button`
- `IconButton`
- `Card`
- `Badge`
- `Tabs`
- `Checkbox`

## Boundaries

Components are presentation-only unless a small local interaction is part of the
component contract, such as changing an activity tab or toggling a temporary
checklist checkbox. They do not persist official records, approvals, releases,
inspection state, NCRs, deficiency instances, or project status.

`RelationshipStrip` receives Phase-004 navigation groups. It does not inspect
stored relationship types or build relationship groups itself.

`NavigationLink` uses the canonical route helper rather than duplicating route
strings in callers.

`ActivityModeTabs` receives Phase-005 mode availability. It hides unavailable
modes and delegates mode-change behavior to its caller.

`LocalizedText` centralizes the minimal EN, FR, and EN/FR rendering behavior
needed by reusable components. It uses supplied localized data only; it does not
invent translations.

## Source Interpretation

Because production UI strings are not populated yet, reusable components accept
labels from their caller where user-facing labels are required. The app shell
uses the existing English foundation labels for global controls only.

The global shell was updated to use a real Home link, Search link, and language
preference control instead of Phase-001 development route-check links. Route
scaffold screens remain temporary until later presentation phases have real
screen data to display.

## Deferred

Still deferred to later phases:

- production QC content ingestion;
- final screen layouts and visual polish;
- real Quick, Full, and Learn screen rendering from production data;
- search indexing, ranking, result grouping, and filters;
- terminology overlays and full bilingual UI-string registry use;
- custom Back history fallback behavior;
- relationship drawers/expanded graph exploration;
- workflow, gate, and pre-concealment final presentation;
- favorites, recents, analytics, backend services, APIs, databases, and auth.
