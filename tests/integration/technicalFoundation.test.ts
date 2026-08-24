import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const runFoundationModule = (code: string, args: readonly string[] = []) =>
  spawnSync(process.execPath, ["--input-type=module", "-e", code, ...args], {
    cwd: process.cwd(),
    encoding: "utf8"
  });

describe("Phase 007 technical foundation verification", () => {
  it("passes against the repository foundation", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/verify-technical-foundation.mjs"],
      {
        cwd: process.cwd(),
        encoding: "utf8"
      }
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "Phase 007 technical foundation verification passed."
    );
  });

  it("reports actionable errors for forbidden dependencies", () => {
    const root = mkdtempSync(join(tmpdir(), "qc-field-guide-foundation-"));
    const setup = runFoundationModule(
      `
        import { mkdirSync, writeFileSync } from "node:fs";
        import { join } from "node:path";
        import { technicalFoundationRequirements } from "./scripts/verify-technical-foundation.mjs";

        const root = process.argv[1];
        const scripts = Object.fromEntries(
          technicalFoundationRequirements.requiredScripts.map((script) => [script, "echo ok"])
        );
        scripts.build = "node scripts/validate-data.mjs && tsc --noEmit && vite build";
        const dependencies = Object.fromEntries(
          technicalFoundationRequirements.requiredDependencies.map((dependency) => [dependency, "0.0.0"])
        );
        dependencies.redux = "0.0.0";
        const devDependencies = Object.fromEntries(
          technicalFoundationRequirements.requiredDevDependencies.map((dependency) => [dependency, "0.0.0"])
        );

        for (const directory of technicalFoundationRequirements.requiredDirectories) {
          mkdirSync(join(root, directory), { recursive: true });
        }

        for (const file of technicalFoundationRequirements.requiredFiles) {
          mkdirSync(join(root, file, ".."), { recursive: true });
          writeFileSync(join(root, file), "");
        }

        writeFileSync(
          join(root, "package.json"),
          JSON.stringify({ scripts, dependencies, devDependencies }, null, 2)
        );
        writeFileSync(
          join(root, "tsconfig.json"),
          JSON.stringify({ compilerOptions: { strict: true, paths: { "@/*": ["src/*"] } } }, null, 2)
        );
        writeFileSync(
          join(root, "vite.config.ts"),
          'import react from "@vitejs/plugin-react";\\nimport { VitePWA } from "vite-plugin-pwa";\\nconst alias = "@";\\n'
        );
        writeFileSync(
          join(root, ".gitignore"),
          technicalFoundationRequirements.requiredGitignoreEntries.join("\\n")
        );
      `,
      [root]
    );

    expect(setup.status).toBe(0);

    const result = runFoundationModule(
      `
        import { createTechnicalFoundationReport } from "./scripts/verify-technical-foundation.mjs";
        const report = createTechnicalFoundationReport(process.argv[1]);
        console.log(JSON.stringify(report));
        process.exit(report.ok ? 0 : 1);
      `,
      [root]
    );

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Forbidden dependency installed");
    expect(result.stdout).toContain("redux");
  });
});
