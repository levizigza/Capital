import { describe, expect, it } from "vitest";

import {
  assertScenarioReplayStable,
  runScenario,
  scenarioPaycheckCfFork,
  scenarioSaveMidPayday,
} from "./runner";
import { assertSaveLoadCoreInvariant, fingerprintSave } from "./fingerprint";

describe("econStress runner", () => {
  it("S-SAVE-MID-PAYDAY replays with identical core_hash", () => {
    const { initial, actions } = scenarioSaveMidPayday();
    const result = assertScenarioReplayStable(initial, actions);
    expect(result.pass).toBe(true);
  });

  it("save_load mid-scenario preserves core hash vs continuous run", () => {
    const { initial, actions } = scenarioSaveMidPayday();
    const full = fingerprintSave(runScenario(initial, actions)).core_hash;
    const mid = runScenario(initial, actions.slice(0, 2));
    const invariant = assertSaveLoadCoreInvariant(mid);
    expect(invariant.pass).toBe(true);
    const tail = runScenario(invariant.pass ? mid : initial, actions.slice(2));
    const loaded = assertSaveLoadCoreInvariant(tail);
    expect(loaded.pass).toBe(true);
    expect(fingerprintSave(runScenario(initial, actions)).core_hash).toBe(full);
  });

  it("S-PAYCHECK-CF fork produces distinct hashes", () => {
    const { protectHash, spendHash } = scenarioPaycheckCfFork();
    expect(protectHash).not.toBe(spendHash);
  });
});
