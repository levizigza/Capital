#!/usr/bin/env node
/**
 * Pillar 16 gate: iconic craft unit contracts + content validate.
 * Usage: npm run test:iconic
 * (package.json passes --experimental-strip-types so we can import the TS cadence map)
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { iconicUnitTestPaths } from "../src/qa/iconicCraftCadence.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function main() {
  const units = iconicUnitTestPaths();
  console.log(`[test:iconic] ${units.length} unit files…`);
  const vitest = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["vitest", "run", ...units],
    { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
  );
  if (vitest.status !== 0) {
    console.error("[test:iconic] unit contracts FAILED");
    process.exit(vitest.status ?? 1);
  }

  console.log("[test:iconic] content:validate…");
  const content = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "content:validate"],
    { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
  );
  if (content.status !== 0) {
    console.error("[test:iconic] content:validate FAILED");
    process.exit(content.status ?? 1);
  }

  console.log("[test:iconic] OK — run test:iconic:e2e when Harbor/Cove/carpet changed.");
  console.log(
    "[test:iconic] Then one official-harness cold + update docs/full-game-craft-board.md.",
  );
}

main();
