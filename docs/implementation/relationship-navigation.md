# Relationship Navigation

Phase 004 adds pure domain/runtime services for graph-derived navigation. It
does not add UI rendering, production QC content, search, localization
rendering, or project-QMS behavior.

## What Phase 004 Implements

The relationship service consumes Phase 003 `CanonicalRegistries` and derives
navigation groups from the validated Build 3 relationship registry:

- `getBefore(nodeId)`
- `getAfter(nodeId)`
- `getInterfaces(nodeId)`
- `getGates(nodeId)`
- `getWorkflows(nodeId)`
- `getTesting(nodeId)`
- `getCommissioning(nodeId)`
- `getCloseout(nodeId)`
- `getNavigationGroups(nodeId)`

Relationships remain stored once. The service does not mutate canonical data and
does not write derived arrays back into Activity objects.

## Directionality

Build 3 directionality is preserved:

- `REQUIRES` is stored `downstream -> prerequisite`.
  - `getBefore(source)` returns the prerequisite target.
  - `getAfter(target)` reverse-derives downstream source nodes.
- `INTERFACES_WITH` is stored once and derived reciprocally.
- Other directional relationships are read from source node to governing or
  supporting node.

## Group Mapping

The service maps relationship types into runtime navigation groups:

- `REQUIRES` -> Before / After
- `INTERFACES_WITH` -> Interfaces
- `GATED_BY` -> Gates
- `PENETRATION_MANAGED_BY`, `ACCESS_CHECKED_BY` -> Workflows
- `TESTED_BY` -> Testing
- `COMMISSIONED_BY` -> Commissioning
- `CLOSES_THROUGH`, `AS_BUILT_FEEDS` -> Closeout

The workflow grouping is a conservative implementation of the blueprint's
"Universal Workflows" navigation category and Build 3's supporting-workflow
relationships.

## Conditions

Condition IDs and strength metadata are carried on derived navigation items but
not evaluated. The universal guide does not know whether a project-specific
condition is true; later presentation can display the condition without assuming
applicability.

## Duplicate Suppression

If multiple relationships in the same group resolve to the same destination,
the service keeps one item using Build 3 priority:

1. hard
2. conditional
3. coordination

Canonical relationship records are not removed or changed. Duplicate
suppression is runtime presentation preparation only.

## Navigation Helpers

The navigation helper module provides pure route and mode helpers:

- language-neutral canonical route construction;
- activity mode inheritance for activity-to-activity navigation;
- default Quick mode when no activity mode context exists.

These helpers do not create language-specific routes and do not implement a
custom history stack.

## Deferred

Later phases still own:

- visible relationship strips, drawers, breadcrumbs, and Back buttons;
- Quick / Full / Learn rendering;
- search implementation;
- localization rendering;
- favorites and recents;
- invalidation propagation;
- gate-screen presentation;
- workflow UI and completion state.
