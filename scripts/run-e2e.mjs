import { spawn } from "node:child_process";
import { join } from "node:path";

const host = "127.0.0.1";
const port = "4173";
const baseUrl = `http://${host}:${port}`;
const nodeExecutable = process.execPath;

const viteProcess = spawn(
  nodeExecutable,
  [
    join("node_modules", "vite", "bin", "vite.js"),
    "--host",
    host,
    "--port",
    port,
    "--strictPort"
  ],
  {
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  }
);

viteProcess.stdout.on("data", (chunk) => {
  process.stdout.write(`[Vite] ${chunk}`);
});

viteProcess.stderr.on("data", (chunk) => {
  process.stderr.write(`[Vite] ${chunk}`);
});

async function waitForServer() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 30000) {
    if (viteProcess.exitCode !== null) {
      throw new Error(`Vite exited with code ${viteProcess.exitCode}`);
    }

    try {
      const response = await fetch(baseUrl);

      if (response.ok) {
        return;
      }
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${baseUrl}`);
}

function runPlaywright() {
  return new Promise((resolve) => {
    const playwrightProcess = spawn(
      nodeExecutable,
      [join("node_modules", "@playwright", "test", "cli.js"), "test"],
      {
        env: {
          ...process.env,
          QC_FIELD_GUIDE_E2E_EXTERNAL_SERVER: "1"
        },
        stdio: "inherit"
      }
    );

    playwrightProcess.on("exit", (code) => {
      resolve(code ?? 1);
    });
  });
}

async function stopVite() {
  if (viteProcess.exitCode !== null) {
    return;
  }

  viteProcess.kill();

  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 3000);

    viteProcess.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

let exitCode = 1;

try {
  await waitForServer();
  exitCode = await runPlaywright();
} finally {
  await stopVite();
}

process.exit(exitCode);
