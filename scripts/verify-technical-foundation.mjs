import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const requiredScripts = [
  "dev",
  "build",
  "typecheck",
  "lint",
  "test",
  "test:e2e",
  "validate:data",
  "validate:foundation",
  "validate:phase-plan"
];

const requiredDependencies = [
  "lucide-react",
  "react",
  "react-dom",
  "react-router-dom",
  "zod"
];

const requiredDevDependencies = [
  "@playwright/test",
  "@testing-library/jest-dom",
  "@testing-library/react",
  "@vitejs/plugin-react",
  "autoprefixer",
  "eslint",
  "eslint-config-prettier",
  "eslint-plugin-react-hooks",
  "eslint-plugin-react-refresh",
  "jsdom",
  "postcss",
  "prettier",
  "tailwindcss",
  "typescript",
  "typescript-eslint",
  "vite",
  "vite-plugin-pwa",
  "vitest"
];

const forbiddenDependencies = [
  "@supabase/supabase-js",
  "@tanstack/react-query",
  "apollo",
  "axios",
  "express",
  "firebase",
  "graphql",
  "i18next",
  "lodash",
  "next",
  "prisma",
  "react-query",
  "redux",
  "supabase",
  "zustand"
];

const requiredDirectories = [
  "docs/source",
  "docs/design-reference",
  "docs/implementation",
  "docs/codex",
  "scripts",
  "src/app",
  "src/screens",
  "src/components/shell",
  "src/components/navigation",
  "src/components/activity",
  "src/components/workflow",
  "src/components/gate",
  "src/components/preConcealment",
  "src/components/search",
  "src/components/terminology",
  "src/components/content",
  "src/components/ui",
  "src/domain/types",
  "src/domain/schemas",
  "src/domain/registries",
  "src/data/sections",
  "src/data/activities",
  "src/data/quick",
  "src/data/learn",
  "src/data/relationships",
  "src/data/gates",
  "src/data/invalidation",
  "src/data/conditions",
  "src/data/workflows",
  "src/data/preConcealment",
  "src/data/terminology",
  "src/data/acronyms",
  "src/data/ui",
  "src/generated",
  "src/services/activity",
  "src/services/relationships",
  "src/services/localization",
  "src/services/navigation",
  "src/services/search",
  "src/services/terminology",
  "src/services/workflow",
  "src/services/validation",
  "src/services/storage",
  "src/hooks",
  "src/utils",
  "src/assets",
  "tests/integration",
  "tests/e2e"
];

const requiredFiles = [
  "AGENTS.md",
  "README.md",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  "eslint.config.js",
  ".prettierrc",
  "tailwind.config.ts",
  "postcss.config.js",
  "playwright.config.ts",
  "public/pwa.svg"
];

const requiredGitignoreEntries = [
  "node_modules/",
  ".pnpm-store/",
  "dist/",
  "playwright-report/",
  "test-results/",
  "coverage/",
  ".env",
  ".env.*"
];

const disallowedRootDirectories = [
  "api",
  "backend",
  "database",
  "db",
  "packages",
  "prisma",
  "server"
];

export const technicalFoundationRequirements = Object.freeze({
  requiredScripts,
  requiredDependencies,
  requiredDevDependencies,
  forbiddenDependencies,
  requiredDirectories,
  requiredFiles,
  requiredGitignoreEntries,
  disallowedRootDirectories
});

const readJson = (root, path) =>
  JSON.parse(readFileSync(join(root, path), "utf8"));

const hasDependency = (packageJson, dependencyName) =>
  Boolean(packageJson.dependencies?.[dependencyName]) ||
  Boolean(packageJson.devDependencies?.[dependencyName]);

const assertContains = (content, expected, filePath, errors) => {
  if (!content.includes(expected)) {
    errors.push(`${filePath} must include ${JSON.stringify(expected)}.`);
  }
};

export function createTechnicalFoundationReport(root) {
  const errors = [];
  const packageJson = readJson(root, "package.json");
  const tsconfig = readJson(root, "tsconfig.json");
  const viteConfig = readFileSync(join(root, "vite.config.ts"), "utf8");
  const gitignore = readFileSync(join(root, ".gitignore"), "utf8");

  for (const scriptName of requiredScripts) {
    if (!packageJson.scripts?.[scriptName]) {
      errors.push(`package.json is missing npm script "${scriptName}".`);
    }
  }

  if (
    !packageJson.scripts?.build?.includes("validate:data") &&
    !packageJson.scripts?.build?.includes("validate-data.mjs")
  ) {
    errors.push("package.json build script must run canonical data validation.");
  }

  if (!packageJson.scripts?.build?.includes("tsc --noEmit")) {
    errors.push("package.json build script must run strict typecheck.");
  }

  if (!packageJson.scripts?.build?.includes("vite build")) {
    errors.push("package.json build script must run vite build.");
  }

  for (const dependencyName of requiredDependencies) {
    if (!packageJson.dependencies?.[dependencyName]) {
      errors.push(`package.json dependencies missing "${dependencyName}".`);
    }
  }

  for (const dependencyName of requiredDevDependencies) {
    if (!packageJson.devDependencies?.[dependencyName]) {
      errors.push(`package.json devDependencies missing "${dependencyName}".`);
    }
  }

  for (const dependencyName of forbiddenDependencies) {
    if (hasDependency(packageJson, dependencyName)) {
      errors.push(`Forbidden dependency installed: "${dependencyName}".`);
    }
  }

  for (const directory of requiredDirectories) {
    if (!existsSync(join(root, directory))) {
      errors.push(`Required directory missing: ${directory}.`);
    }
  }

  for (const file of requiredFiles) {
    if (!existsSync(join(root, file))) {
      errors.push(`Required foundation file missing: ${file}.`);
    }
  }

  for (const directory of disallowedRootDirectories) {
    if (existsSync(join(root, directory))) {
      errors.push(`Disallowed backend/monorepo directory exists: ${directory}.`);
    }
  }

  if (tsconfig.compilerOptions?.strict !== true) {
    errors.push("tsconfig.json must keep compilerOptions.strict enabled.");
  }

  if (tsconfig.compilerOptions?.paths?.["@/*"]?.[0] !== "src/*") {
    errors.push('tsconfig.json must map "@/*" to "src/*".');
  }

  assertContains(viteConfig, "VitePWA", "vite.config.ts", errors);
  assertContains(viteConfig, "@vitejs/plugin-react", "vite.config.ts", errors);
  assertContains(viteConfig, '"@"', "vite.config.ts", errors);

  for (const entry of requiredGitignoreEntries) {
    assertContains(gitignore, entry, ".gitignore", errors);
  }

  return {
    ok: errors.length === 0,
    errors,
    checked: {
      requiredScripts: requiredScripts.length,
      requiredDirectories: requiredDirectories.length,
      requiredFiles: requiredFiles.length,
      forbiddenDependencies: forbiddenDependencies.length
    }
  };
}

export function formatTechnicalFoundationReport(report) {
  if (!report.ok) {
    return [
      "Phase 007 technical foundation verification failed.",
      ...report.errors.map((error) => `- ${error}`)
    ].join("\n");
  }

  return [
    "Phase 007 technical foundation verification passed.",
    `Scripts checked: ${report.checked.requiredScripts}`,
    `Directories checked: ${report.checked.requiredDirectories}`,
    `Files checked: ${report.checked.requiredFiles}`,
    `Forbidden dependencies checked: ${report.checked.forbiddenDependencies}`
  ].join("\n");
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFile) {
  const root = process.cwd();
  const report = createTechnicalFoundationReport(root);

  console.log(formatTechnicalFoundationReport(report));

  if (!report.ok) {
    process.exit(1);
  }
}
