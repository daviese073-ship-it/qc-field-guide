# Production Technical Activity Content

Phase 010 ingests Build-2-governed technical content into the production
activity records established by Phase 009.

## Scope Completed

All production section-level activity files were processed:

- Section 1: 7 activities
- Section 2: 12 activities
- Section 3: 8 activities
- Section 4: 10 activities
- Section 5: 9 activities
- Section 6: 9 activities
- Section 7: 7 activities
- Section 8: 11 activities
- Section 9: 11 activities
- Section 10: 8 activities
- Section 11: 11 activities
- Section 12: 10 activities
- Section 13: 11 activities
- Section 14: 15 activities

Total production activities: 139.

## Source Ownership

Build 2 owns the substantive technical QC content. Build 3 continues to own
canonical IDs, section ownership, canonical English identity, and node tags.

The Phase 010 ingestion preserves the Phase 009 identity fields and adds Build 2
technical content to the existing `Activity` schema fields. It does not create
new canonical relationships, gates, conditions, invalidation rules, search
records, Quick/Learn/workflow data, or route-bound UI.

## File Organization

Technical activity content remains in the existing production activity files:

- `src/data/activities/section-01.json`
- `src/data/activities/section-02.json`
- `src/data/activities/section-03.json`
- `src/data/activities/section-04.json`
- `src/data/activities/section-05.json`
- `src/data/activities/section-06.json`
- `src/data/activities/section-07.json`
- `src/data/activities/section-08.json`
- `src/data/activities/section-09.json`
- `src/data/activities/section-10.json`
- `src/data/activities/section-11.json`
- `src/data/activities/section-12.json`
- `src/data/activities/section-13.json`
- `src/data/activities/section-14.json`

The production aggregate remains `src/data/productionCanonicalDataset.ts`.

## Content Domains Populated

Build 2 content was mapped into the existing Activity schema where source
material exists:

- `qualityObjective`
- `authorityNote`
- `requirements`
- `planning`
- `documentControl`
- `materialControl`
- `inspection.before`
- `inspection.during`
- `inspection.after`
- `inspection.testing`
- `evidence`
- `issues.commonDeficiencies`
- `correctiveAction`
- `verification`
- `closureCriteria`
- `reportingAnalysis`
- `qualityCheckpoint`

The ingestion uses `subheading`, `paragraph`, `notice`, and `checkList` content
blocks. Build 2 visual markers are represented by semantic notices where the
schema supports them, rather than by preserving decorative symbols.

## Content Item IDs

Content item IDs use this deterministic convention:

```text
CNT-<activityId>-<domain-code>-<ordinal>
```

Examples:

- `CNT-2.2-REQ-001`
- `CNT-10.3-INS-DURING-004`
- `CNT-14.15-QC-010`

The Phase 010 content audit validates content-item ID uniqueness across the full
production activity catalogue.

## Source Provenance

Activity identity provenance remains Build 3. Individual ingested content items
carry Build 2 provenance through `sourceRef` pointing to
`docs/source/01-build-2-field-content.docx` and the corresponding Build 2
activity heading.

## Bilingual Handling

French technical content remains deferred. Phase 010 populates English source
content from Build 2 only. It does not translate activity content, create
parallel French activity trees, or introduce language-specific IDs.

## Special Structures

Some numbered Build 2 activities are content nodes tagged as `gate`, `testing`,
`interface`, `closeout`, or similar Build 3 node metadata. They remain numbered
activity records in Phase 010 and were not converted into Phase 011 logic
objects.

Activity `7.2 Floor Finishes` contains Build 2 sub-structures for tile,
resilient flooring, and epoxy/floor coatings. These are preserved as structured
subheadings inside the single canonical `7.2` activity rather than split into
new activity IDs.

## Identity Mismatches

The known Build 2 / Build 3 title mismatch remains:

- Build 2 heading: `11.7 PENETRATIONS - UNIVERSAL WORKFLOW`
- Build 3 canonical identity: `11.7 Universal Penetrations`

The activity keeps the Build 3 canonical title while content item provenance
points back to the Build 2 heading.

## Production Versus Fixture Data

The non-production Phase 003 fixture remains isolated in
`src/data/development/phase003ValidationDataset.ts`. Production activity content
is assembled only through `src/data/productionCanonicalDataset.ts`.

## Validation

`npm run validate:data` validates schema shape, registries, referential
integrity, and the Phase 010 production content audit.

`npm run validate:content` runs the production content audit directly. It checks
the expected 14 sections, 139 activities, substantive content coverage,
content-item ID uniqueness, fixture separation, absence of placeholder text, and
absence of later-phase production records.

## Deferred

Still deferred:

- Phase 011: production conditions, gates, and invalidation rules;
- Phase 012: production relationships;
- Phase 013: terminology, acronyms, localization, and UI strings;
- Phase 014: QuickView, LearnContent, Workflow, and PreConcealmentWorkflow data;
- Phase 015+: derived search, route-bound screen composition, field interaction,
  and offline polish.
