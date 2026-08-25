import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const runPhasePlanModule = (code: string, args: readonly string[] = []) =>
  spawnSync(process.execPath, ["--input-type=module", "-e", code, ...args], {
    cwd: process.cwd(),
    encoding: "utf8"
  });

describe("Phase 008 implementation sequence validation", () => {
  it("passes against the repository phase sequence", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/validate-phase-plan.mjs"],
      {
        cwd: process.cwd(),
        encoding: "utf8"
      }
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "Phase 008 implementation sequence validation passed."
    );
  });

  it("represents the corrected post-Phase-008 dependency chain", () => {
    const result = runPhasePlanModule(`
      import { readFileSync } from "node:fs";
      const content = readFileSync("docs/codex/phase-sequence.md", "utf8");
      const phases = [
        "### Phase 009 - Production Canonical Identity Seed",
        "### Phase 010 - Production Technical Activity Content",
        "### Phase 011 - Production Logic Registries",
        "### Phase 012 - Production Relationship Registry",
        "### Phase 013 - Terminology, Acronyms, Localization, And UI Strings",
        "### Phase 014 - Authored Field Presentation Data",
        "### Phase 015 - Production Workflow & Pre-Concealment Data",
        "### Phase 016 - Derived Search Infrastructure",
        "### Phase 017 - Route-Bound Screen Composition",
        "### Phase 018 - Field Interaction And Offline Polish",
        "### Phase 019 - Field-Presentation Quality Review",
        "### Phase 020 - Bilingual Authority & Content Review",
        "## Final MVP Acceptance Audit"
      ];
      console.log(JSON.stringify(phases.map((phase) => content.indexOf(phase))));
    `);
    const indexes = JSON.parse(result.stdout) as number[];

    expect(result.status).toBe(0);
    expect(indexes.every((index) => index >= 0)).toBe(true);
    expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
  });

  it("keeps Phase 008A as governance rather than implementation authorization", () => {
    const result = runPhasePlanModule(`
      import { readFileSync } from "node:fs";
      const content = readFileSync("docs/codex/phase-sequence.md", "utf8");
      console.log(content);
    `);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "These work packages are dependency order only"
    );
    expect(result.stdout).toContain(
      "Each future user instruction must name the exact phase"
    );
    expect(result.stdout).toContain(
      "This is an acceptance/release checkpoint, not an open-ended feature phase"
    );
  });

  it("reports missing governance sections clearly", () => {
    const root = mkdtempSync(join(tmpdir(), "qc-field-guide-phase-plan-"));
    const codexDocs = join(root, "docs", "codex");

    mkdirSync(codexDocs, { recursive: true });
    writeFileSync(
      join(codexDocs, "phase-sequence.md"),
      [
        "# Codex Implementation Phase Sequence",
        "",
        "## Phase 001 - Repository Foundation",
        "",
        "Status: complete."
      ].join("\n")
    );

    const result = runPhasePlanModule(
      `
        import { createPhasePlanReport } from "./scripts/validate-phase-plan.mjs";
        const report = createPhasePlanReport(process.argv[1]);
        console.log(JSON.stringify(report));
        process.exit(report.ok ? 0 : 1);
      `,
      [root]
    );

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Global Rules");
    expect(result.stdout).toContain("Prerequisite:");
    expect(result.stdout).toContain("Phase 008");
    expect(result.stdout).toContain("Phase 020");
    expect(result.stdout).toContain("Final MVP Acceptance Audit");
  });
});
