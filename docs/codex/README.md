# Codex Phase Guidance

Implementation is performed in controlled phases. Future Codex instructions
must respect the root `AGENTS.md`, the source-of-truth hierarchy, and the
phase boundary documented in `docs/implementation/README.md`.

Codex may improve implementation structure, type safety, validation, tests, and
maintainability when those changes are consistent with the specification. Codex
must not invent product truth, QC criteria, French construction terminology,
relationships, gates, workflows, statuses, invalidation rules, official QMS
behavior, or visible controls without defined purpose, data source, and working
behavior.

If a future phase is ambiguous, stop and report the ambiguity before changing
product behavior.

`phase-sequence.md` records the ordered implementation sequence and checkpoint
rules. It is a planning/governance artifact only; future phase prompts still
control what work is authorized.
