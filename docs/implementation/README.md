# Implementation Architecture

This directory records the software architecture frozen by
`docs/source/05-implementation-blueprint.docx`. It summarizes the blueprint for
implementation use only and does not change the source documents.

## Frozen Architecture Summary

- Source of truth is divided by domain ownership. Build 2 owns technical QC
  content, Build 3 owns IDs/relationships/gates/conditions/invalidation and
  navigation logic, Build 4 owns bilingual behavior and terminology, Build 5
  owns field presentation, and the implementation blueprint owns software
  architecture.
- The MVP is a field execution and navigation guide, not a project management
  or official QMS platform.
- Canonical data is read-only at runtime. Temporary UI state, route state,
  favorites, recents, and settings remain separate from canonical content.
- Relationships will later live once in a central relationship dataset and be
  derived through services. Reverse links must not be duplicated in UI code.
- Activity IDs and all other canonical IDs are strings. `10.3` is an identifier,
  not a number.
- Routing is language-neutral. Language changes presentation state, not URL
  identity.
- Application navigation uses browser/router history, with additional context
  only where needed for origin-aware navigation, workflow context, and later
  relationship-driven transitions.
- The eight screen contracts are Home, Section/System, Activity, Composite
  Workflow, Pre-Concealment, Gate, Search/Results, and Terminology/Acronym
  Detail.
- Screens compose data and services. Components render reusable presentation
  behavior. Services own derived logic. Data owns technical truth.
- The technical foundation is one static frontend app using React, strict
  TypeScript, Vite, React Router, Tailwind CSS, Zod, Lucide React, Vitest,
  React Testing Library, Playwright, vite-plugin-pwa, ESLint, Prettier, and npm.
- No backend, database, accounts, runtime content API, translation API, or
  official project-QMS behavior belongs in the foundation.

## Current Phase Boundary

This phase creates the repository foundation only. It does not ingest Build 2
content, create canonical activity data, implement Quick / Full / Learn,
relationships, search, terminology, bilingual rendering, workflows,
pre-concealment logic, gates, reports, approvals, official records, or project
tracking.
