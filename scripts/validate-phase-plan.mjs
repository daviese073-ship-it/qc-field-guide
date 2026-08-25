import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const phasePlanRequirements = Object.freeze({
  path: join("docs", "codex", "phase-sequence.md"),
  requiredPhrases: [
    "Implementation Phase Sequence",
    "Global Rules",
    "Production Canonical Identity Seed",
    "Production Technical Activity Content",
    "Production Logic Registries",
    "Production Relationship Registry",
    "Terminology, Acronyms, Localization, And UI Strings",
    "Authored Field Presentation Data",
    "Production Workflow & Pre-Concealment Data",
    "Derived Search Infrastructure",
    "Route-Bound Screen Composition",
    "Field Interaction And Offline Polish",
    "Field-Presentation Quality Review",
    "Bilingual Authority & Content Review",
    "Final MVP Acceptance Audit",
    "Build 2 remains the technical-content authority",
    "section-level batches",
    "canonical IDs remain language-neutral",
    "Quick, Full, and Learn are views of the same underlying activity",
    "search index is derived",
    "This is an acceptance/release checkpoint",
    "Prerequisite:",
    "Allowed touch:",
    "Forbidden:",
    "Acceptance:",
    "Checkpoint:",
    "Future Work Packages",
    "These work packages are dependency order only",
    "They do not authorize work by"
  ],
  requiredPhases: [
    "Phase 001",
    "Phase 002",
    "Phase 003",
    "Phase 004",
    "Phase 005",
    "Phase 006",
    "Phase 007",
    "Phase 008",
    "Phase 009",
    "Phase 010",
    "Phase 011",
    "Phase 012",
    "Phase 013",
    "Phase 014",
    "Phase 015",
    "Phase 016",
    "Phase 017",
    "Phase 018",
    "Phase 019",
    "Phase 020"
  ]
});

const getLineNumber = (content, phrase) => {
  const index = content.indexOf(phrase);

  if (index === -1) return -1;

  return content.slice(0, index).split(/\r?\n/).length;
};

export function createPhasePlanReport(root) {
  const errors = [];
  const planPath = join(root, phasePlanRequirements.path);

  if (!existsSync(planPath)) {
    return {
      ok: false,
      errors: [`Phase plan is missing: ${phasePlanRequirements.path}.`],
      checked: { phases: 0, phrases: 0 }
    };
  }

  const content = readFileSync(planPath, "utf8");

  for (const phrase of phasePlanRequirements.requiredPhrases) {
    if (!content.includes(phrase)) {
      errors.push(`Phase plan is missing required phrase: ${phrase}.`);
    }
  }

  let previousLine = 0;

  for (const phase of phasePlanRequirements.requiredPhases) {
    const line = getLineNumber(content, phase);

    if (line === -1) {
      errors.push(`Phase plan is missing ${phase}.`);
      continue;
    }

    if (line <= previousLine) {
      errors.push(`${phase} appears out of order in the phase plan.`);
    }

    previousLine = line;
  }

  return {
    ok: errors.length === 0,
    errors,
    checked: {
      phases: phasePlanRequirements.requiredPhases.length,
      phrases: phasePlanRequirements.requiredPhrases.length
    }
  };
}

export function formatPhasePlanReport(report) {
  if (!report.ok) {
    return [
      "Phase 008 implementation sequence validation failed.",
      ...report.errors.map((error) => `- ${error}`)
    ].join("\n");
  }

  return [
    "Phase 008 implementation sequence validation passed.",
    `Phases checked: ${report.checked.phases}`,
    `Required governance phrases checked: ${report.checked.phrases}`
  ].join("\n");
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFile) {
  const report = createPhasePlanReport(process.cwd());

  console.log(formatPhasePlanReport(report));

  if (!report.ok) {
    process.exit(1);
  }
}
