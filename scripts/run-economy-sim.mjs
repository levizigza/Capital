#!/usr/bin/env node
/**
 * Wrapper: npm run sim:economy [-- --games 50 --seed 20260814]
 */
import { spawnSync } from "node:child_process";

function argNum(name, fallback) {
  const argv = process.argv.slice(2);
  const idx = argv.indexOf(name);
  if (idx >= 0 && argv[idx + 1]) return Number(argv[idx + 1]);
  return fallback;
}

const games = argNum("--games", 50);
const seed = argNum("--seed", 20260814);

const env = {
  ...process.env,
  ECONOMY_SIM_CLI: "1",
  ECONOMY_SIM_GAMES: String(games),
  ECONOMY_SIM_SEED: String(seed),
};

const result = spawnSync(
  "npx",
  ["vitest", "run", "src/islands/sim/runEconomyCli.test.ts"],
  { env, stdio: "inherit", shell: false },
);

process.exit(result.status ?? 1);
