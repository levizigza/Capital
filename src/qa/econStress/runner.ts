/**
 * Economic stress scenario runner — deterministic replay (Phase B).
 * Spec: docs/qa/ECONOMIC_STRESS_TEST_PLAN.md
 */

import type { IslandSaveV1 } from "@/islands/types";
import { createDefaultIslandSave, sanitizeIslandSave } from "@/islands/save";
import {
  applySpineTakeLedgerFootprint,
  PAYCHECK_TAKE_KEY,
} from "@/islands/spineTakeFootprints";
import { applyPayday, ensureLedger } from "@/islands/voyagerLedger";
import { fingerprintSave } from "./fingerprint";

export type PlayerAction =
  | { op: "take"; key: string; choiceId: string }
  | { op: "payday"; trackEscape?: boolean }
  | { op: "save_load" };

export function applyPlayerAction(save: IslandSaveV1, action: PlayerAction): IslandSaveV1 {
  switch (action.op) {
    case "take":
      return applySpineTakeLedgerFootprint(save, action.key, action.choiceId);
    case "payday": {
      const { ledger } = applyPayday(ensureLedger(save.voyagerLedger), 1, {
        trackHarborEscape: action.trackEscape ?? false,
      });
      return { ...save, voyagerLedger: ledger };
    }
    case "save_load": {
      const loaded = sanitizeIslandSave(JSON.parse(JSON.stringify(save)));
      if (!loaded) throw new Error("save_load sanitize failed");
      return loaded;
    }
    default:
      return save;
  }
}

export function runScenario(initial: IslandSaveV1, actions: PlayerAction[]): IslandSaveV1 {
  let state = initial;
  for (const action of actions) {
    state = applyPlayerAction(state, action);
  }
  return state;
}

/** S-SAVE-MID-PAYDAY — save/load mid-run must preserve core hash. */
export function scenarioSaveMidPayday(): {
  scenario_id: string;
  initial: IslandSaveV1;
  actions: PlayerAction[];
} {
  return {
    scenario_id: "S-SAVE-MID-PAYDAY",
    initial: createDefaultIslandSave(),
    actions: [
      { op: "payday", trackEscape: true },
      { op: "save_load" },
      { op: "take", key: PAYCHECK_TAKE_KEY, choiceId: "protect" },
      { op: "payday", trackEscape: true },
    ],
  };
}

/** S-PAYCHECK-CF — Paycheck Take diverges ledger before/after. */
export function scenarioPaycheckCfFork(): {
  scenario_id: string;
  protectHash: string;
  spendHash: string;
} {
  const base = createDefaultIslandSave();
  const protect = applySpineTakeLedgerFootprint(base, PAYCHECK_TAKE_KEY, "protect");
  const spend = applySpineTakeLedgerFootprint(base, PAYCHECK_TAKE_KEY, "spend");
  return {
    scenario_id: "S-PAYCHECK-CF",
    protectHash: fingerprintSave(protect).core_hash,
    spendHash: fingerprintSave(spend).core_hash,
  };
}

export function assertScenarioReplayStable(
  initial: IslandSaveV1,
  actions: PlayerAction[],
): { pass: boolean; hashA: string; hashB: string } {
  const a = fingerprintSave(runScenario(initial, actions)).core_hash;
  const b = fingerprintSave(runScenario(initial, actions)).core_hash;
  return { pass: a === b, hashA: a, hashB: b };
}
