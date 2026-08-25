# Production Logic Registries

Phase 011 populates the Build-3-governed production logic registries:

- `src/data/conditions/conditions.json`
- `src/data/gates/gates.json`
- `src/data/invalidation/invalidation-rules.json`

These records load through `src/data/productionCanonicalDataset.ts`, parse
through the Phase 002 Zod schemas, build through the Phase 003 registries, and
participate in canonical referential-integrity validation.

## Source Authority

Build 3 is the authority for condition IDs, gate definitions, gate classes,
invalidation triggers, invalidation actions, invalidation severities, and the
smallest-defensible-scope rule.

Build 2 supports the technical background behind those logic records but was
not used to invent additional gates, conditions, or invalidation rules.

## Conditions

The production condition registry contains the 14 Build 3 controlled condition
IDs:

- `always`
- `whereApplicable`
- `whereSpecified`
- `whereRated`
- `whereFireSeparation`
- `whereExterior`
- `whereExteriorEnvelope`
- `whereRoof`
- `whereConcealed`
- `whereTestingRequired`
- `whereEquipmentPresent`
- `whereSystemPresent`
- `whereBuried`
- `whereSpecialistRequired`

The registry remains language-neutral. French labels and localized presentation
remain deferred to the Build 4 / Phase 013 localization work.

## Gates

The production gate registry contains 15 concrete gate records:

- `G-STR-01`
- `G-ENV-01`
- `G-ROOF-01A`
- `G-ROOF-01B`
- `G-ROOF-01C`
- `G-ROOF-01D`
- `G-ROOF-01E`
- `G-INT-01`
- `G-MEP-01`
- `G-MEP-02`
- `G-LS-01`
- `G-EXT-01`
- `G-EXT-02`
- `G-TST-01`
- `G-FINAL-01`

Build 3 describes 11 gate families and also freezes the roof progression gate
as five sub-gates. Phase 011 stores the roof family as the five concrete
stage-gate records rather than collapsing it into one generic `G-ROOF-01`
record.

Gate classes are represented in the existing `gateType` field as:

- `HARD`
- `CONDITIONAL_HARD`

Build 3 also defines `ADVISORY` as a class concept, but no Phase 011 production
gate is assigned that class.

## Gate / Content-Node Boundary

Numbered Build 2 activities remain technical content nodes. For example,
`2.4 Pre-Pour Quality Gate` is still a numbered activity, while `G-STR-01` is
the software/navigation logic gate. The two are intentionally not merged.

## Invalidation Rules

The production invalidation registry contains 37 Build-3-governed rules. The
rules cover structural/pre-pour, below-grade/backfill, envelope, roofing,
interior/pre-concealment, fire/life-safety, mechanical, electrical, test,
corrective-work, design/document, material, temporary-condition, access,
as-built, and turnover contexts.

The existing schema requires stable rule IDs. Build 3 freezes the trigger/rule
records but does not provide machine IDs for every invalidation trigger, so
Phase 011 assigns stable `INV-*` implementation IDs directly from the Build 3
trigger names. These IDs are handles for authored source rules; they are not new
logic.

Severity uses only the existing frozen values:

- `low`
- `medium`
- `high`

Actions use only the existing frozen values:

- `FLAG_FOR_REVIEW`
- `REOPEN_ACTIVITY`
- `REOPEN_GATE`
- `INVALIDATE_TEST`
- `UPDATE_RECORD_REQUIRED`

Each invalidation rule includes smallest-defensible-scope guidance. Phase 011
does not implement invalidation propagation, live status downgrades, or project
history.

## Validation

`npm run validate:data` now validates:

- schema shape for conditions, gates, and invalidation rules;
- duplicate-ID rejection through Phase 003 registries;
- gate references to activities and invalidation rules;
- invalidation references to activities, gates, and conditions;
- the exact Phase 011 condition, gate, and invalidation ID inventories;
- no unsupported/invented Phase 011 logic records;
- no project-QMS fields such as approver, signature, release timestamp, or live
  project status;
- exact Phase 012 relationship validation now verifies production relationship
  records separately.

The Phase 010 production content audit was narrowed so it no longer blocks
Phase-011-authorized logic records, while still protecting the production
technical activity catalogue and future presentation/terminology
boundaries.

## Deliberately Deferred

Phase 011 does not implement:

- production relationships;
- relationship derivation changes;
- invalidation propagation;
- gate runtime status;
- project approvals, releases, signatures, or inspection history;
- search;
- bilingual rendering or French logic text;
- Quick, Learn, workflows, or pre-concealment presentation data;
- UI rendering of logic records.

Phase 012 owns the production relationship registry and is documented in
`production-relationship-registry.md`.
