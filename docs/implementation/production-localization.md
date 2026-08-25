# Production Localization

Phase 013 populates the production bilingual/localization layer governed by
Build 4. It does not begin Phase 014/015 presentation data, Phase 016 search, or
route-bound UI composition.

## Data Boundary

The production dataset now loads:

- `src/data/terminology/*.json`
- `src/data/acronyms/acronyms.json`
- `src/data/ui/ui-strings.json`

The same canonical section, activity, gate, invalidation, relationship, and
route IDs remain language-neutral. French is represented as localized fields on
the same canonical objects, not as a duplicate object tree.

## Terminology

Terminology is concept-first and discipline-oriented. Build 4B/4C provided a
small set of concrete terminology examples and several explicit validation
backlogs. Phase 013 therefore populates only source-authorized records and marks
missing/provisional French where Build 4 did not freeze a preferred term.

Phase 013A expanded the production terminology registry with a QC-relevant
BÂTIR-derived subset. Current production terminology count: 146 concepts.

Discipline files:

- quality: 11
- concrete: 2
- envelope: 2
- mechanical: 4
- fire-life-safety: 2
- testing: 2
- closeout: 3
- BÂTIR-derived QC concepts: 120

## Acronyms

The acronym registry follows Build 4D. It preserves distinctions between exact
equivalents, shared acronyms, related-but-not-equivalent concepts, and
organization-specific acronyms. PIE/PRIE/ITP, NC/NCR, RFI/QMT, and QMT/TQC are
not force-merged.

Current production acronym count: 20 records.

## Titles And UI Strings

Build 4F localized all 14 section titles and all 139 activity titles. Existing
canonical English titles and IDs were preserved.

Build 4G populated one centralized UI-string registry with 169 recurring labels
covering modes, navigation, Quick/Full/Learn labels, search labels, gate labels,
warnings/notices, invalidation labels, specialist labels, relationship-strength
labels, and QC Think questions.

## Content Translation

Phase 010 production Full technical content remains the same canonical activity
content. Build 4H requires translations to live on the same semantic content
items and explicitly forbids runtime machine translation or word-for-word
glossary substitution.

Build 4H defines rollout tiers. Phase 013A uses the supplied BÂTIR workbook and
controlled QC phrase mappings to create draft French prose on the same
canonical Phase 010 Full-content items. This is a development translation
draft, not reviewed product authority.

- total content items: 13,576
- content items with French prose: 13,576
- reviewed/final French content items: 0
- provisional/draft French content items: 13,576
- fallback-only content items: 0
- authority-sensitive content items with French prose: 1,064 / 1,064

Section/activity titles, condition labels, terminology, acronyms, and recurring
UI strings are localized where Build 4 authorizes them.

## Fallback Policy

The localization service supports:

- EN: canonical English
- FR: French when present, otherwise English fallback
- EN/FR: primary language plus secondary language for short localized values

Missing French must never hide QC content. Fallback state is reported by the
Phase 013 audit rather than hidden.

## Validation

`npm run validate:localization` parses the production dataset, builds
registries, verifies referential integrity, and audits:

- French section/activity title coverage
- terminology/acronym/UI-string coverage
- content translation counts
- authority-sensitive translation counts
- high-control translation counts
- translation status transparency
- numeric/unit token preservation
- critical token preservation
- authority/obligation token preservation
- terminology-reference resolution
- language-neutral ID invariance
- absence of Phase 014 presentation datasets

`npm run validate:batir` audits the BÂTIR workbook parsing summary and verifies
that the BÂTIR-derived concept count matches the canonical terminology registry.

`npm run validate:data` also runs the Phase 013 audit after the existing
content, logic, and relationship audits.

## Deferred

Phase 014 owns authored QuickView and LearnContent production records. Phase
015 owns Workflow and PreConcealmentWorkflow production records. Phase 016 owns
derived bilingual search indexing/ranking. The Bilingual Authority & Content
Review remains required before production release. Later UI phases consume this
localization layer without creating language-specific routes or duplicate
canonical objects.
