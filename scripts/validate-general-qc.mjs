import { spawnSync } from "node:child_process";
import { join } from "node:path";

const viteNodeExecutable = join("node_modules", "vite-node", "vite-node.mjs");

const result = spawnSync(
  process.execPath,
  [
    viteNodeExecutable,
    "src/services/validation/validateProductionGeneralQcCli.ts"
  ],
  {
    stdio: "inherit",
    shell: false
  }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
