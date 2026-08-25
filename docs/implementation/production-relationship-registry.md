# Production Relationship Registry

Phase 012 populates the Build-3-governed production relationship graph. The
graph is stored centrally under `src/data/relationships/` and loaded through
`src/data/productionCanonicalDataset.ts`.

## File Organization

Relationships are split by logical source domain:

- `sitework.json`
- `structural.json`
- `envelope.json`
- `roofing.json`
- `interiors.json`
- `mechanical.json`
- `electrical.json`
- `fire-life-safety.json`
- `external.json`
- `testing-closeout.json`
- `cross-discipline.json`

The production aggregate merges these files into one canonical relationship
collection before schema parsing, registry construction, integrity validation,
and Phase 004 relationship derivation.

## Counts

Total stored production relationships: 350.

Counts by stored relationship type:

- `REQUIRES`: 142
- `INTERFACES_WITH`: 118
- `GATED_BY`: 36
- `TESTED_BY`: 14
- `COMMISSIONED_BY`: 12
- `PENETRATION_MANAGED_BY`: 4
- `ACCESS_CHECKED_BY`: 7
- `CLOSES_THROUGH`: 2
- `AS_BUILT_FEEDS`: 15

Counts by strength:

- `hard`: 81
- `conditional`: 242
- `coordination`: 27

## ID Convention

Relationship IDs use the deterministic convention:

```text
REL-<sourceId>-<TYPE>-<targetId>[-<conditionId>]
```

The ID is an implementation handle derived from the authorized Build 3 edge. It
does not add product meaning beyond the stored edge itself.

## Directionality

`REQUIRES` is stored downstream node to prerequisite node. The app derives
Before/After presentation from that one stored edge.

`INTERFACES_WITH` is stored once with `direction: "reciprocal"`. The app derives
visibility from both endpoints and does not store the reverse edge.

The remaining relationship families are stored in Build 3's directed
orientation:

- controlled activity to gate for `GATED_BY`
- system/activity to test activity for `TESTED_BY`
- system/activity to commissioning activity for `COMMISSIONED_BY`
- specific penetration activity to `11.7` for `PENETRATION_MANAGED_BY`
- equipment/system/access-sensitive activity to `11.10` for `ACCESS_CHECKED_BY`
- technical closeout source to Section 14 closeout activity for `CLOSES_THROUGH`
- configuration/as-built-impacting source to `14.10` for `AS_BUILT_FEEDS`

No `NEXT`, `BEFORE`, `AFTER`, `INVALIDATES`, evidence, deficiency, NC, or
turnover relationship types are stored.

## Conditions

Relationship conditions reference the Phase 011 controlled condition registry.
No free-text condition IDs are used. Production relationship validation reports
counts by condition and verifies every condition reference resolves.

## Inherited Behaviors Not Stored

Build 3 explicitly keeps universal deficiency, NC, evidence, reporting, and
many final-record behaviors inherited rather than repeating them as edges from
every activity. Phase 012 preserves that rule.

Invalidation remains separate in the Phase 011 invalidation registry. No
`INVALIDATES` relationship records were introduced.

## Validation

The Phase 012 audit in
`src/services/validation/productionRelationshipAudit.ts` checks:

- exact total relationship count;
- counts by type, strength, and condition;
- source and target endpoint resolution through the canonical node resolver;
- condition resolution;
- no duplicate relationship IDs;
- no duplicate stored edges;
- no reverse `REQUIRES` duplicates;
- no reciprocal duplicate `INTERFACES_WITH` pairs;
- no unsupported stored relationship types;
- no fixture-data references.

`npm run validate:data` now runs the Phase 012 audit alongside the Phase 010
content audit and Phase 011 logic audit.

## Phase 004 Integration

Production graph tests verify the existing relationship/navigation services
derive:

- Before/After from `REQUIRES`;
- reciprocal interface visibility from one `INTERFACES_WITH` edge;
- gate lookups and reverse controlled-activity lookups from `GATED_BY`;
- outgoing testing and incoming tested-system lookups from `TESTED_BY`;
- commissioning from `COMMISSIONED_BY`;
- penetration/access workflow hubs from `PENETRATION_MANAGED_BY` and
  `ACCESS_CHECKED_BY`;
- closeout and as-built links from `CLOSES_THROUGH` and `AS_BUILT_FEEDS`.

The only Phase 004 service addition is a narrow reverse `TESTED_BY` helper
(`getTestedSystems`) required by Build 3's test-page reverse lookup behavior.
Existing service methods and stored-edge semantics were not changed.

## Bilingual Handling

Relationship records are language-neutral. Phase 012 does not add translated
relationship types, language-specific IDs, or French duplicate edges.

## Deferred

Phase 012 does not implement terminology, acronyms, localization, UI strings,
Quick/Learn/workflow/pre-concealment data, search infrastructure, route-bound
screen composition, or UI presentation of the graph.

Phase 013 owns terminology, acronyms, localization, and UI strings.
