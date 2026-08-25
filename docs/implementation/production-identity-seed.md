# Production Identity Seed

Phase 009 establishes the production canonical identity catalogue only.

## Dataset Locations

- Sections: `src/data/sections/sections.json`
- Activities: `src/data/activities/section-01.json` through `src/data/activities/section-14.json`
- Production assembly boundary: `src/data/productionCanonicalDataset.ts`

The activity records are split by section so Phase 010 can add technical content
in reviewable section-level batches without creating one large activity file.

## Counts

- Production sections: 14
- Production activity identities: 139

The activity identity records use Build 3 Step 1 as the authority for:

- language-neutral string IDs;
- canonical English activity titles;
- section ownership;
- node tags;
- source provenance.

## Source Ownership

Build 3 owns section/activity identity, IDs, and node structure. Build 2 owns
substantive technical QC content and was used only to check for identity
conflicts. Build 4 governs bilingual title and terminology population, which is
deferred.

One source mismatch was identified and resolved according to the Phase 009
authority rule:

- `11.7` is headed as `PENETRATIONS - UNIVERSAL WORKFLOW` in Build 2.
- Build 3 freezes the canonical English identity as `Universal Penetrations`.

The production dataset uses the Build 3 title.

## Production Versus Fixture Data

The Phase 003 fixture remains in `src/data/development/phase003ValidationDataset.ts`.
It is fictional, non-production validation data.

The production identity seed is assembled separately in
`src/data/productionCanonicalDataset.ts`. `npm run validate:data` validates both
datasets, but the fixture records are not imported into the production assembly.

## Bilingual Handling

Phase 009 populates English identity strings only. French identity strings are
left absent because the schema permits missing French strings and Build 4/Phase
013 own terminology and localization population.

No language-specific IDs, duplicate EN/FR activity objects, or independently
translated French titles were added.

## Deferred

The following remain deliberately deferred to later phases:

- Phase 010: substantive Build 2 technical activity content;
- Phase 011: production conditions, gates, and invalidation rules;
- Phase 012: production relationships;
- Phase 013: terminology, acronyms, localization, and UI strings;
- Phase 014: QuickView, LearnContent, Workflow, and PreConcealmentWorkflow data;
- Phase 015+: search, final screen composition, and field interaction polish.
