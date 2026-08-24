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
  });
});
