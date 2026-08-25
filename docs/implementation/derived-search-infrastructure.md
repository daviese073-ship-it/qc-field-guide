# Phase 016 - Derived Search Infrastructure

Phase 016 implements deterministic derived search infrastructure only. It does
not add route-bound search UI, filters, result rendering, favorites, recents,
backend search, vector search, or generated prose.

## Responsibility

The search index is built from the validated canonical registries produced by
Phase 003 and the derived relationship/navigation layer produced by Phase 004.
It is not a manually authored canonical dataset and is not part of
`CanonicalDataset`.

Indexed sources include:

- section titles and descriptions;
- activity titles, search aliases, keywords, canonical technical content and
  source-linked metadata;
- QuickView and LearnContent presentation data;
- workflow and pre-concealment workflow titles/stages/content;
- gate titles and authored gate guidance;
- terminology preferred terms, aliases, definitions and context notes;
- acronym labels, abbreviations, full forms, aliases and definitions;
- relationship metadata derived from canonical relationship records.

## Normalization

`src/services/search/normalize.ts` performs deterministic query/index
normalization:

- lowercase matching;
- accent/diacritic-insensitive matching;
- punctuation, apostrophe, slash and hyphen normalization;
- compact token variants for code-like values such as `G-STR-01`;
- conservative plural token variants;
- preservation of numeric, decimal and ID-shaped tokens such as `10.3`.

Display text remains the original authored text. Normalization is used only for
matching.

## Ranking

`src/services/search/searchService.ts` ranks results using explicit weights.
The ranking hierarchy follows the blueprint:

- exact canonical object ID;
- exact acronym;
- exact activity/title and preferred terminology matches;
- exact alias;
- exact phrase;
- title prefix;
- all-token matches;
- partial-token matches.

Results are deduplicated by canonical destination
`objectType:objectId`. Multiple matching entries are retained as match metadata
on the result instead of producing repeated destination rows. Ties are resolved
deterministically by score, object-type priority, localized title and canonical
ID.

## Traceability

Each derived search entry carries:

- canonical destination ID and object type;
- canonical route;
- source family;
- source ID;
- language;
- source reference where available;
- translation status where available.

This allows later UI phases to show match hints without recalculating ranking or
duplicating canonical content.

## Validation

`npm run validate:search` runs the Phase 016 production search audit. The audit:

- rebuilds the derived index from registries;
- checks deterministic rebuild behavior;
- verifies destination resolution and route shape;
- rejects duplicate entry IDs;
- rejects empty or tokenless entries;
- rejects searchable French entries marked as `missing`;
- confirms English/French and major source-family coverage.

`npm run validate:data` also runs the search audit so release validation cannot
skip derived search integrity.

## Deferred

The following remain intentionally deferred:

- `/search` screen composition and result rendering;
- SearchInput, SearchFilters and SearchResultItem UI behavior;
- search result state persistence and Back behavior;
- route-bound filters/groups;
- semantic/vector search or runtime AI search;
- external search APIs;
- manually maintained search-index JSON as a canonical source;
- production release reviews.
