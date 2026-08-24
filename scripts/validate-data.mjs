import { spawnSync } from "node:child_process";
import { join } from "node:path";

const tscExecutable = join("node_modules", "typescript", "bin", "tsc");

const result = spawnSync(process.execPath, [tscExecutable, "--noEmit"], {
  stdio: "inherit",
  shell: false
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(
  "Phase 002 schema validation passed. Canonical object schemas compile; production dataset validation and referential integrity are deferred to Phase 003."
);
