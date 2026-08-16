#!/usr/bin/env node
/**
 * Compile playtest sessions → PLAYTEST_FINDINGS.md
 * Usage: node scripts/compile-playtest-findings.mjs --cycle cycle-00-baseline
 */
import { spawnSync } from "node:child_process";

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const cycle = arg("--cycle", "cycle-00-baseline");
const title = arg(
  "--title",
  cycle === "cycle-00-baseline"
    ? "Cycle 00 — framework baseline (desk synthesis)"
    : `Playtest ${cycle}`,
);
const hypothesis = arg(
  "--hypothesis",
  "Quiet Harbor teach, Soft Beat discoverability, and post-Change goal clarity dominate first-loop friction.",
);

const env = {
  ...process.env,
  PLAYTEST_COMPILE: "1",
  PLAYTEST_CYCLE: cycle,
  PLAYTEST_TITLE: title,
  PLAYTEST_HYPOTHESIS: hypothesis,
};

const result = spawnSync(
  "npx",
  ["vitest", "run", "src/playtest/compileCli.test.ts"],
  { env, stdio: "inherit" },
);
process.exit(result.status ?? 1);
