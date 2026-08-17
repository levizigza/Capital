import { describe, expect, it } from "vitest";
import "@/mechanics/modules/EarnSpendModule";
import { getModule } from "@/mechanics/registry";
import type { GameState, ModuleAction, ModuleState } from "@/mechanics/types";
import type { IslandSaveV1 } from "./types";
import { createDefaultVoyagerLedger, netCashflow } from "./voyagerLedger";
import { harborWeatherMood } from "./harborWeather";
import coincraft from "./content/coincraft-cove.islands.json";
import {
  applyCoveTakeLedgerFootprint,
  coveTakeStanceFromChoiceId,
  COVE_JAR_HOLD_ID,
  COVE_TREAT_TAB_ID,
  COVE_TAKE_KEY,
  hasCompletedFirstFinancialTake,
  snapshotFirstFinancialScenario,
  firstScenarioCashflowDelta,
} from "./firstFinancialScenario";

function baseSave(over: Partial<IslandSaveV1> = {}): IslandSaveV1 {
  return {
    version: "1",
    updatedAt: new Date().toISOString(),
    inventory: [],
    questStatus: {},
    completedMinigames: [],
    discovered: { npcs: [], items: [], areas: [], islands: [] },
    voyagerLedger: createDefaultVoyagerLedger(),
    ...over,
  };
}

const emptyGame = {
  money: 0,
  score: 0,
  turn: 0,
  flags: {},
} as GameState;

describe("first financial scenario — production EarnSpend alt paths", () => {
  const mod = getModule("EarnSpend")!;
  const coveConfig = coincraft.islands[0]!.minigames!.find((m) => m.id === "mg_coin_sort")!
    .modules!.find((m) => m.id === "EarnSpend")!.config as Record<string, unknown>;

  function run(action: ModuleAction, state: ModuleState) {
    return mod.apply(action, state, emptyGame);
  }

  it("earn then spend craft supply succeeds (happy path)", () => {
    let state = mod.init(coveConfig, emptyGame);
    state = run({ type: "earn", payload: { id: "sort_crates" } }, state).newState;
    state = run({ type: "earn", payload: { id: "clean_deck" } }, state).newState;
    const spent = run({ type: "spend", payload: { id: "paint_set" } }, state);
    expect(spent.effects.some((e) => e.type === "showMessage" && /Spent/.test(String((e as { text?: string }).text)))).toBe(
      true,
    );
    const wallet = (spent.newState as unknown as { wallet: number }).wallet;
    expect(wallet).toBe(15 + 10 - 25);
  });

  it("spend with empty wallet is safe fail — state unchanged, try again by earning", () => {
    const state = mod.init(coveConfig, emptyGame);
    const before = structuredClone(state);
    const result = run({ type: "spend", payload: { id: "shell_kit" } }, state);
    expect(result.telemetry.some((t) => t.event === "earn_spend.insufficient")).toBe(true);
    expect((result.newState as unknown as { wallet: number }).wallet).toBe(
      (before as unknown as { wallet: number }).wallet,
    );
  });

  it("partial earn then expensive buy fails safely; cheaper buy works", () => {
    let state = mod.init(coveConfig, emptyGame);
    state = run({ type: "earn", payload: { id: "clean_deck" } }, state).newState; // +10
    const fail = run({ type: "spend", payload: { id: "driftwood_bundle" } }, state); // 30
    expect(fail.telemetry.some((t) => t.event === "earn_spend.insufficient")).toBe(true);
    const ok = run({ type: "spend", payload: { id: "shell_kit" } }, state); // 15 — still fails (only 10)
    expect(ok.telemetry.some((t) => t.event === "earn_spend.insufficient")).toBe(true);
    state = run({ type: "earn", payload: { id: "deliver_mail" } }, state).newState; // +20 → 30
    const bought = run({ type: "spend", payload: { id: "shell_kit" } }, state);
    expect(bought.telemetry.some((t) => t.event === "earn_spend.spent")).toBe(true);
  });

  it("earn-only path never forced to spend", () => {
    let state = mod.init(coveConfig, emptyGame);
    state = run({ type: "earn", payload: { id: "deliver_mail" } }, state).newState;
    state = run({ type: "earn", payload: { id: "sort_crates" } }, state).newState;
    const s = state as unknown as { wallet: number; spentTotal: number; earnedTotal: number };
    expect(s.earnedTotal).toBe(35);
    expect(s.spentTotal).toBe(0);
    expect(s.wallet).toBe(35);
  });
});

describe("first financial scenario — Cove Take alt paths (real ledger)", () => {
  it("content offers jar, treat, and defer — not a single forced choice", () => {
    const kira = coincraft.islands[0]!.dialogues!.find((d) => d.id === "dlg_keeper_kira")!;
    const kk1 = kira.nodes.find((n) => n.id === "kk1")!;
    const ids = (kk1.choices ?? []).map((c) => c.id);
    expect(ids).toContain("kk1_a");
    expect(ids).toContain("kk1_spend");
    expect(ids).toContain("kk1_b");
    const defer = (kk1.choices ?? []).find((c) => c.id === "kk1_b")!;
    expect(defer.effects ?? []).toHaveLength(0);
  });

  it("jar stance adds Cove Jar Hold asset — cashflow rises", () => {
    const before = baseSave();
    const cf0 = netCashflow(before.voyagerLedger!);
    const after = applyCoveTakeLedgerFootprint(before, "save");
    expect(after.voyagerLedger!.holdings.some((h) => h.id === COVE_JAR_HOLD_ID)).toBe(true);
    expect(netCashflow(after.voyagerLedger!)).toBe(cf0 + 5);
    expect(firstScenarioCashflowDelta(after)).toBe(5);
  });

  it("treat stance adds Cove Treat Tab liability — cashflow falls", () => {
    const before = baseSave();
    const cf0 = netCashflow(before.voyagerLedger!);
    const after = applyCoveTakeLedgerFootprint(before, "spend");
    expect(after.voyagerLedger!.holdings.some((h) => h.id === COVE_TREAT_TAB_ID)).toBe(true);
    expect(netCashflow(after.voyagerLedger!)).toBe(cf0 - 5);
    expect(firstScenarioCashflowDelta(after)).toBe(-5);
  });

  it("jar and treat footprints are mutually exclusive ids and idempotent", () => {
    let save = applyCoveTakeLedgerFootprint(baseSave(), "save");
    save = applyCoveTakeLedgerFootprint(save, "save");
    expect(save.voyagerLedger!.holdings.filter((h) => h.id === COVE_JAR_HOLD_ID)).toHaveLength(1);
    const both = applyCoveTakeLedgerFootprint(save, "spend");
    expect(both.voyagerLedger!.holdings.some((h) => h.id === COVE_TREAT_TAB_ID)).toBe(true);
    expect(both.voyagerLedger!.holdings.some((h) => h.id === COVE_JAR_HOLD_ID)).toBe(true);
  });

  it("maps choice ids; unknown does not invent a stance", () => {
    expect(coveTakeStanceFromChoiceId("save")).toBe("save");
    expect(coveTakeStanceFromChoiceId("spend")).toBe("spend");
    expect(coveTakeStanceFromChoiceId("maybe")).toBeNull();
  });

  it("snapshot evidences beats without forcing one path", () => {
    const jar = applyCoveTakeLedgerFootprint(
      baseSave({
        irreversibleChoices: {
          [COVE_TAKE_KEY]: {
            choiceId: "save",
            label: "Jar before treat",
            islandId: "coincraft_cove",
            at: "t",
          },
        },
        completedMinigames: ["mg_coin_sort"],
        questStatus: {
          q_cc_save_or_spend: { started: true, completed: true, completedAt: "t" },
        },
      }),
      "save",
    );
    expect(hasCompletedFirstFinancialTake(jar)).toBe(true);
    const snap = snapshotFirstFinancialScenario(jar);
    expect(snap.stance).toBe("save");
    expect(snap.hasJarHold).toBe(true);
    expect(snap.evidencedBeats).toContain("consequence");
    expect(snap.evidencedBeats).toContain("understand");
  });

  it("spender weather can tighten vs saver when cashflow drops (real weather)", () => {
    const saver = applyCoveTakeLedgerFootprint(baseSave(), "save");
    const spender = applyCoveTakeLedgerFootprint(baseSave(), "spend");
    // With default 15 cf: saver 20 (fair), spender 10 (tight)
    expect(harborWeatherMood(saver)).toBe("fair");
    expect(harborWeatherMood(spender)).toBe("tight");
  });

  it("Alma defer is valid — does not start Take", () => {
    const alma = coincraft.islands[0]!.dialogues!.find((d) => d.id === "dlg_artisan_alma")!;
    const aa1 = alma.nodes.find((n) => n.id === "aa1")!;
    const defer = (aa1.choices ?? []).find((c) => c.id === "aa1_b")!;
    expect(defer.nextNodeId).toBe("aa3");
    expect(JSON.stringify(defer.effects ?? [])).not.toMatch(/setIrreversible/);
  });
});
