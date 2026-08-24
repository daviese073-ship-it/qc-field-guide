# QC Field Guide Repository Instructions

Codex implements the specification; Codex is not a source of product truth.

## Source Of Truth

- Product purpose/philosophy: `docs/source/00-product-concept.docx`
- Technical QC content: `docs/source/01-build-2-field-content.docx`
- IDs, relationships, gates, conditions, invalidation and navigation logic: `docs/source/02-build-3-relationships.docx`
- Bilingual terminology, EN / EN-FR / FR behavior and multilingual search: `docs/source/03-build-4-bilingual-system.docx`
- Quick / Full / Learn, workflows and field presentation: `docs/source/04-build-5-field-presentation.docx`
- Software architecture and MVP implementation rules: `docs/source/05-implementation-blueprint.docx`
- Design-reference images: visual inspiration only; they do not define functionality.

Project drawings, specifications, Plan Qualite, PIE-PRIE, approved procedures,
professional instructions, technical changes, CRT-Hydro-Quebec requirements, and
other project requirements govern actual work. This app is a universal QC field
guide and does not replace official project QMS or authorized technical
acceptance.

## Non-Negotiable Rules

1. Codex implements the specification; Codex is not a source of product truth.
2. Do not invent QC technical content.
3. Do not invent project acceptance criteria.
4. Do not invent relationships, gates, workflows, conditions, statuses or invalidation rules.
5. Do not invent or independently change French construction terminology.
6. Do not duplicate English and French components or routes.
7. Do not hard-code activity-specific technical logic in UI components.
8. Do not hard-code relationship navigation inside activity pages.
9. Do not add a visible tab, card, button, filter, badge or section unless it has a defined purpose, data source and working behavior.
10. Hide unavailable/empty UI rather than creating dead controls or "Coming Soon" placeholders.
11. Do not create official project-QMS behavior such as approvals, releases, signatures, formal inspection records, NCR instances, deficiency instances or project status tracking.
12. Preserve language-neutral canonical IDs.
13. Canonical data is read-only at runtime; temporary UI state must remain separate.
14. Prefer platform/framework capabilities over new dependencies.
15. Run validation, typecheck, lint and relevant tests after changes.
16. If the specification is genuinely ambiguous, stop and report the ambiguity rather than guessing.
17. The design-reference images guide presentation only and may not add functionality absent from the specification.
18. Relationships will later be stored once and derived centrally; do not create duplicate reverse links in UI code.

## Foundation Boundary

This repository is foundation-only until a later phase explicitly authorizes
canonical data schemas and content ingestion. Do not ingest Build 2 content, do
not create the activity dataset, and do not implement relationship, gate,
workflow, pre-concealment, search, terminology, or bilingual behavior without a
phase instruction that names the governing source documents.
