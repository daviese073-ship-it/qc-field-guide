# General QC Processes

Phase 017 corrective Step 2 adds General QC Processes as a separate canonical
entity family sourced from
`QC_Field_Guide_General_QC_Processes(1).docx`.

## Boundary

General QC Processes are universal field-reference processes. They are not part
of the 139 inspection activity dataset and are not duplicated into inspection
systems. They do not create official project-QMS behavior such as NCR instances,
deficiency records, approvals, hold-point releases, signatures, or status
tracking.

## Canonical Data

- Process records live in `src/data/generalQc/general-qc-processes.json`.
- Universal Field Reference lives in
  `src/data/generalQc/universal-field-reference.json`.
- Runtime contracts live in `src/domain/schemas/generalQc.ts` and
  `src/domain/types/generalQc.ts`.
- Production loading includes the process family through
  `src/data/productionCanonicalDataset.ts`.

Each process stores the source-backed structure: title, summary, When to Use,
Field Workflow, What to Capture, Key Reminders, Common Mistakes, Typical
Outputs, related process IDs, and any additional source section. Related
processes are stored by canonical General QC process ID and validated.

## Runtime Access

The read-only registry is exposed as `registries.generalQcProcesses`. Screens
consume it through `productionGeneralQcService`, which provides all-process,
by-ID, related-process, and Universal Field Reference lookups.

## Search

Derived search now includes `generalQcProcess` entries generated from canonical
process text. There is no manually maintained General QC search database.

## Localization

The attached source document is English only. General QC content is stored as
localization-ready English records with French absent. Existing fallback behavior
renders English in FR mode until authoritative French content is provided.

## Deferred

Commonly Used is not populated because no real usage history or approved
editorial subset exists. Field Tips are not derived because no approved
deterministic derivation rule exists. The landing page preserves the approved
visual structure and renders truthful availability states for those panels.
