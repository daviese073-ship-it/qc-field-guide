# Production Bilingual Content Completion

Phase 013A completes the production bilingual content substrate before Phase
014 field-presentation data begins.

## Responsibility

Phase 013A adds:

- deterministic parsing/auditing of `docs/source/batir data.xlsx`;
- a QC-relevant BÂTIR terminology subset in the canonical terminology registry;
- draft French text on the existing Phase-010 content items;
- stricter localization validation for French coverage, fallback, translation
  status, authority-sensitive coverage, terminology conformance, numeric/unit
  tokens, critical tokens, and obligation tokens.

It does not add QuickView, LearnContent, Workflow,
PreConcealmentWorkflow, search indexing/ranking, route-bound UI, or official
project-QMS behavior.

## BÂTIR Boundary

BÂTIR is treated as an authoritative terminology input under Build 4. It does
not replace Build 2 technical content or Build 3 graph/logic.

The parser records all three workbook sheets and counts all rows, then matches
normalized English terms against the production corpus. Verb-only rows are used
only as draft-translation vocabulary and are not imported as canonical concepts.
Existing Build-4 preferred terminology is not overridden by BÂTIR.

Imported BÂTIR terminology concepts are marked provisional because row-level
workbook evidence is not the same as final QC terminology review.

## Translation Method

French activity content is generated as a deterministic, terminology-aware draft
from:

- existing Build-4 terminology;
- BÂTIR preferred terms and aliases;
- controlled QC phrase mappings for authority, verification, documentation,
  sequencing, and construction vocabulary.

The generated text is stored on the same canonical content items as
`text.fr`. Canonical IDs remain language-neutral and unchanged.

Every generated content translation is marked `status.fr = "provisional"`.
No machine-generated Full-content item is marked reviewed/final in this phase.

## Validation

`npm run validate:localization` now fails if production Full-content items remain
fallback-only or translated content lacks explicit French status. It reports:

- FR-present, reviewed/final, provisional/draft, and fallback-only counts;
- authority-sensitive and high-control coverage;
- terminology-conformance issues;
- numeric/unit token mismatches;
- critical token mismatches;
- authority/obligation issues;
- untranslated section/activity/UI labels;
- unresolved terminology references.

`npm run validate:batir` validates the BÂTIR audit artifact against the
canonical terminology registry. `npm run validate:data` includes both
production localization and BÂTIR terminology validation.

## Deferred

Human terminology/prose review remains required before any generated Full
content can be considered final. Phase 014 remains responsible for authored
Quick/Learn data, Phase 015 remains responsible for production workflow and
pre-concealment data, Phase 016 remains responsible for derived bilingual search
infrastructure, and the Bilingual Authority & Content Review remains required
before production release.
