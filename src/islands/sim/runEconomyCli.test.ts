/**
 * CLI entry invoked by `npm run sim:economy`.
 * Writes artifacts/economy-sim/report.{md,json} and prints the WHY report.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSimConfig, reportToJson, runSimBatch } from "./batch";

const isCli = process.env.ECONOMY_SIM_CLI === "1";

describe.runIf(isCli)("economy sim CLI", () => {
  it("runs a large batch and writes investigation reports", () => {
    const games = Number(process.env.ECONOMY_SIM_GAMES ?? 50);
    const seed = Number(process.env.ECONOMY_SIM_SEED ?? 20260814);
    const config = defaultSimConfig({ gamesPerStrategy: games, seed });
    const report = runSimBatch(config);

    const outDir = join(process.cwd(), "artifacts/economy-sim");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "report.md"), report.markdown);
    writeFileSync(join(outDir, "report.json"), reportToJson(report));

    // eslint-disable-next-line no-console
    console.log(report.markdown);
    expect(report.totalGames).toBe(
      config.gamesPerStrategy * config.strategies.length * config.conditions.length,
    );
    expect(report.findings.length).toBeGreaterThan(0);
  }, 120_000);
});

describe.runIf(!isCli)("economy sim CLI (skipped unless ECONOMY_SIM_CLI=1)", () => {
  it("placeholder so vitest discovers the file", () => {
    expect(true).toBe(true);
  });
});
