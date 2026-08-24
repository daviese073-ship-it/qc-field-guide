# QC Field Guide

QC Field Guide is a universal construction Quality Control field guide for
inspectors working alongside the actual project QMS. It is intended to help an
inspector navigate QC knowledge and workflow context, not to act as the official
project inspection, approval, NCR, deficiency, document-control, signature,
release, or acceptance system.

Project requirements govern. This application is a universal QC field guide and
does not replace the project's official QMS or authorized technical acceptance.

## Source Of Truth

- Product purpose/philosophy: `docs/source/00-product-concept.docx`
- Technical QC content: `docs/source/01-build-2-field-content.docx`
- IDs, relationships, gates, conditions, invalidation and navigation logic: `docs/source/02-build-3-relationships.docx`
- Bilingual terminology, EN / EN-FR / FR behavior and multilingual search: `docs/source/03-build-4-bilingual-system.docx`
- Quick / Full / Learn, workflows and field presentation: `docs/source/04-build-5-field-presentation.docx`
- Software architecture and MVP implementation rules: `docs/source/05-implementation-blueprint.docx`
- Design-reference images: visual inspiration only; they do not define functionality.

If a rule is missing or ambiguous, the implementation must report the gap rather
than inventing product behavior, QC criteria, relationships, terminology,
workflows, gates, statuses, or technical requirements.

## Technical Stack

- React
- TypeScript with strict mode
- Vite
- React Router
- Tailwind CSS
- Zod
- Lucide React
- Vitest
- React Testing Library
- Playwright
- vite-plugin-pwa
- ESLint
- Prettier
- npm

The foundation deliberately has no backend, database, accounts, official QMS
records, or project status tracking.

## Repository Structure

- `docs/source/`: authoritative source documents.
- `docs/design-reference/`: visual inspiration only.
- `docs/implementation/`: implementation architecture summaries.
- `docs/codex/`: Codex phase guidance.
- `scripts/`: repository validation scripts.
- `src/app/`: application entry, router, providers, and styles.
- `src/screens/`: route-level screen scaffolds and future screen templates.
- `src/components/`: reusable shell, navigation, workflow, gate, search,
  terminology, content, and UI components.
- `src/domain/`: canonical types, schemas, and registries.
- `src/data/`: canonical dataset boundary and future production data modules.
- `src/generated/`: future generated artifacts such as derived search indexes.
- `src/services/`: application services, including storage wrappers.
- `tests/integration/`: Vitest and React Testing Library tests.
- `tests/e2e/`: Playwright smoke tests.

## Local Commands

```bash
npm install
npm run dev
npm run build
```

## Testing Commands

```bash
npm run test
npm run test:e2e
```

## Validation Commands

```bash
npm run validate:data
npm run validate:foundation
npm run typecheck
npm run lint
```

`validate:data` validates the current non-production fixture dataset through the
canonical schema, registry, and referential-integrity pipeline. Production Build
2 content has not been ingested yet.

`validate:foundation` audits the frozen technical stack, required scripts,
repository folders, ignored artifact paths, PWA/TypeScript settings, and
dependency boundaries.
