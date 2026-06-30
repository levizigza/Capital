#!/usr/bin/env node
/**
 * CI gate: validate all island content JSON files.
 * Exits non-zero if any file has schema or cross-reference errors.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function main() {
  console.log("[content:validate] Running island + event deck validation via vitest…");

  const result = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["vitest", "run", "src/qa/contentValidation.test.ts"],
    { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
  );

  if (result.status !== 0) {
    console.error("[content:validate] FAILED — fix content validation errors above.");
    process.exit(result.status ?? 1);
  }

  console.log("[content:validate] OK — all content files valid.");
}

main();
