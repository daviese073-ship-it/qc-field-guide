# Technical Stack And Foundation Audit

Phase 007 implements the technical-stack and repository-foundation freeze from
the implementation blueprint Step 7. Most of the stack was already established
by earlier phases; this phase adds an executable audit so the foundation can be
checked before production content ingestion begins.

## Frozen Stack

- React frontend
- TypeScript strict mode
- Vite build tool
- React Router
- Tailwind CSS with reusable primitives
- Lucide React as the single icon family
- Zod runtime schema validation
- Vitest and React Testing Library
- Playwright
- vite-plugin-pwa
- ESLint and Prettier
- npm

The MVP remains a static frontend application with browser storage and no
backend, database, accounts, runtime content API, translation API, CMS, or
official project-QMS behavior.

## Foundation Audit

`npm run validate:foundation` runs
`scripts/verify-technical-foundation.mjs`.

The audit checks:

- required npm scripts;
- required stack dependencies;
- explicitly forbidden dependencies;
- required repository directories and foundation files;
- strict TypeScript and `@/` alias configuration;
- Vite React and PWA plugin presence;
- `.gitignore` coverage for dependencies, build output, Playwright artifacts,
  coverage, and local environment files;
- absence of backend/database/monorepo root folders.

This audit is intentionally static. It does not validate production QC content,
generate a search index, or run application tests. The full validation suite
still runs `validate:data`, `typecheck`, `lint`, `test`, `build`, and `test:e2e`.

## Build Pipeline

`npm run build` continues to run canonical data validation, strict TypeScript
checking, and the Vite production build. Test execution remains separate so
iteration stays fast, while release/checkpoint validation runs the full suite.

`npm run validate:data` remains the canonical data validation command. Until
production Build 2 content is ingested, it validates the isolated fictional
development dataset used to exercise schema, registry, and integrity
infrastructure.

## Boundaries

The audit does not introduce search indexing, search ranking, production JSON
datasets, content ingestion, generated artifacts, screen rendering, favorites,
recents, backend services, databases, authentication, analytics, or official
inspection records.

The search index remains derived data. No manually maintained `search-index.json`
is introduced in this phase.

## Source Interpretation

The blueprint lists `generate:search` as a potential future command in the build
pipeline. Because search indexing/ranking is not assigned to Phase 007 and
production content is still protected, this phase does not add that command.
