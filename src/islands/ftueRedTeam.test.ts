import { describe, expect, it } from "vitest";
import "@/mechanics/modules/EarnSpendModule";
import { getModule } from "@/mechanics/registry";
import type { GameState, ModuleAction, ModuleState } from "@/mechanics/types";
import {
  advanceHubGuided,
  createDefaultHubGuidedIntro,
  isHubGuidedComplete,
} from "./story/storyBible";
import { resolveAshoreCarpetBoot } from "./harborAshore";
import { canOpenSignatureCinema } from "./signatureCinemaGate";
import { hasCompletedCoveChange } from "./chapterLoop";
import { isIslandProgressLocked } from "./progressGates";
import {
  backfillCoveChangeObjectives,
  coveChangeReadyToComplete,
  reconcileCoveHomecoming,
  reconcileFtueQuestProofs,
} from "./ftueQuestRecovery";
import {
  applyCoveTakeLedgerFootprint,
  COVE_TAKE_KEY,
  hasCompletedFirstFinancialTake,
} from "./firstFinancialScenario";
import { sanitizeIslandSave, migrateIslandSave, createDefaultIslandSave } from "./save";
import { COVE_CHANGE_QUEST_ID, COVE_ISLAND_ID, PAYCHECK_PENINSULA_ID } from "./islandIds";
import coincraft from "./content/coincraft-cove.islands.json";
import type { IslandSaveV1 } from "./types";
import { createDefaultVoyagerLedger } from "./voyagerLedger";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

function coveTakeSave(stance: "save" | "spend" = "save", over: Partial<IslandSaveV1> = {}): IslandSaveV1 {
  let save = baseSave({
    inventory: ["cc_savings_jar"],
    irreversibleChoices: {
      [COVE_TAKE_KEY]: {
        choiceId: stance,
        label: stance === "save" ? "Jar before treat" : "Treat before jar",
        islandId: COVE_ISLAND_ID,
        at: "2026-08-17T12:00:00.000Z",
      },
    },
    harborScars: [
      {
        id: stance === "save" ? "cove_saver_plaque" : "cove_spender_plaque",
        islandId: COVE_ISLAND_ID,
        choiceId: stance,
        label: stance === "save" ? "Jar before treat" : "Treat before jar",
        kind: "plaque",
        createdAt: "2026-08-17T12:00:00.000Z",
      },
    ],
    ...over,
  });
  save = applyCoveTakeLedgerFootprint(save, stance);
  return save;
}

describe("FTUE red team — hub guided out-of-order", () => {
  it("map bypass from meet_guide: ADAPTS — done without didMeetGuide", () => {
    let g = createDefaultHubGuidedIntro();
    g = advanceHubGuided(g, "opened_map");
    expect(g.step).toBe("done");
    expect(g.didDock).toBe(true);
    expect(g.didMeetGuide).toBeFalsy();
    expect(isHubGuidedComplete(g)).toBe(true);
  });

  it("Talk then voyage: RECOVERS critical path", () => {
    let g = createDefaultHubGuidedIntro();
    g = advanceHubGuided(g, "talked_guide");
    expect(g.step).toBe("to_dock");
    g = advanceHubGuided(g, "opened_map");
    expect(g.step).toBe("done");
    expect(g.didMeetGuide).toBe(true);
  });

  it("legacy Outfitter step on reload: ADAPTS to voyage", () => {
    const boot = resolveAshoreCarpetBoot({
      hubGuidedIntro: { version: 1, step: "walk_outfitter" },
    });
    expect(boot.hubGuidedIntro.step).toBe("to_dock");
  });

  it("carpet boot after prior done: resets meet_guide (ceremony, not softlock)", () => {
    const boot = resolveAshoreCarpetBoot({
      hubGuidedIntro: { version: 1, step: "done", didDock: true },
    });
    expect(boot.hubGuidedIntro.step).toBe("meet_guide");
  });

  it("mid-lap to_dock survives carpet boot", () => {
    const boot = resolveAshoreCarpetBoot({
      hubGuidedIntro: { version: 1, step: "to_dock", didMeetGuide: true },
    });
    expect(boot.hubGuidedIntro.step).toBe("to_dock");
  });
});

describe("FTUE red team — Cove Take before quest chain (SOFTLOCK fix)", () => {
  it("Kira-first Take without quest started: backfill completes objectives", () => {
    const raw = coveTakeSave("save", { questStatus: {} });
    expect(hasCompletedCoveChange(raw)).toBe(false);

    const fixed = backfillCoveChangeObjectives(raw);
    expect(coveChangeReadyToComplete(fixed)).toBe(true);
    expect(fixed.questStatus[COVE_CHANGE_QUEST_ID]?.started).toBe(true);
  });

  it("reconcile on save/load unlocks Paycheck path", () => {
    const raw = coveTakeSave("save", { questStatus: {} });
    const reconciled = reconcileFtueQuestProofs(raw);
    // Mark complete as maybeCompleteQuest would after backfill
    const completed = {
      ...reconciled,
      questStatus: {
        ...reconciled.questStatus,
        [COVE_CHANGE_QUEST_ID]: {
          ...reconciled.questStatus[COVE_CHANGE_QUEST_ID]!,
          completed: true,
          completedAt: "2026-08-17T12:00:00.000Z",
        },
      },
    };
    expect(hasCompletedCoveChange(completed)).toBe(true);
    expect(isIslandProgressLocked(PAYCHECK_PENINSULA_ID, completed)).toBe(false);
  });

  it("spender Take path: same recovery", () => {
    const fixed = backfillCoveChangeObjectives(coveTakeSave("spend", { questStatus: {} }));
    expect(coveChangeReadyToComplete(fixed)).toBe(true);
  });

  it("homecoming arms after reconcile when quest complete but celebration missing", () => {
    const save = coveTakeSave("save", {
      questStatus: {
        [COVE_CHANGE_QUEST_ID]: {
          started: true,
          completed: true,
          completedAt: "t",
          completedObjectives: [
            "talk:npc_artisan_alma",
            "talk:npc_keeper_kira",
            "item:cc_savings_jar",
          ],
        },
      },
    });
    const next = reconcileCoveHomecoming(save);
    expect(next.harborHomecoming?.pending).toBe(true);
    expect(next.harborHomecoming?.message).toMatch(/Paycheck/i);
  });

  it("sanitizeIslandSave runs reconcile for corrupted mid-Take saves", () => {
    const parsed = sanitizeIslandSave(
      coveTakeSave("save", {
        questStatus: {},
        hubGuidedIntro: { version: 1, step: "done", didDock: true },
      }),
    );
    expect(parsed).not.toBeNull();
    expect(coveChangeReadyToComplete(parsed!)).toBe(true);
  });
});

describe("FTUE red team — valid alternate financial strategies", () => {
  const mod = getModule("EarnSpend")!;
  const coveConfig = coincraft.islands[0]!.minigames!.find((m) => m.id === "mg_coin_sort")!
    .modules!.find((m) => m.id === "EarnSpend")!.config as Record<string, unknown>;
  const emptyGame = { money: 0, score: 0, turn: 0, flags: {} } as GameState;

  function run(action: ModuleAction, state: ModuleState) {
    return mod.apply(action, state, emptyGame);
  }

  it("early spend with $0: RECOVERS — state unchanged", () => {
    const state = mod.init(coveConfig, emptyGame);
    const before = (state as { wallet: number }).wallet;
    const result = run({ type: "spend", payload: { id: "shell_kit" } }, state);
    expect(result.telemetry.some((t) => t.event === "earn_spend.insufficient")).toBe(true);
    expect((result.newState as { wallet: number }).wallet).toBe(before);
  });

  it("earn-only never forced to spend: ADAPTS", () => {
    let state = mod.init(coveConfig, emptyGame);
    state = run({ type: "earn", payload: { id: "deliver_mail" } }, state).newState;
    state = run({ type: "earn", payload: { id: "sort_crates" } }, state).newState;
    const s = state as { wallet: number; spentTotal: number };
    expect(s.spentTotal).toBe(0);
    expect(s.wallet).toBeGreaterThan(0);
  });

  it("Kira defer: no irreversible — player can return", () => {
    const kira = coincraft.islands[0]!.dialogues!.find((d) => d.id === "dlg_keeper_kira")!;
    const defer = kira.nodes.find((n) => n.id === "kk1")!.choices!.find((c) => c.id === "kk1_b")!;
    expect(JSON.stringify(defer.effects ?? [])).not.toMatch(/setIrreversible/);
    expect(hasCompletedFirstFinancialTake(baseSave())).toBe(false);
  });

  it("jar and treat both valid Takes with different ledger footprints", () => {
    const jar = applyCoveTakeLedgerFootprint(baseSave(), "save");
    const treat = applyCoveTakeLedgerFootprint(baseSave(), "spend");
    expect(jar.voyagerLedger!.holdings.some((h) => h.kind === "asset")).toBe(true);
    expect(treat.voyagerLedger!.holdings.some((h) => h.kind === "liability")).toBe(true);
  });
});

describe("FTUE red team — partial progress / save-load", () => {
  it("mid First Coins reload keeps Cove island", () => {
    const base = createDefaultIslandSave();
    const mid = migrateIslandSave({
      ...base,
      currentIslandId: COVE_ISLAND_ID,
      currentAreaId: "cc_harbor",
      questStatus: {
        q_cc_first_coins: {
          started: true,
          completed: false,
          completedObjectives: ["talk:npc_captain_penny"],
        },
      },
      discovered: { ...base.discovered, islands: ["harbor_haven", COVE_ISLAND_ID] },
    });
    expect(mid.currentIslandId).toBe(COVE_ISLAND_ID);
  });

  it("Take proof with incomplete First Coins: ADAPTS — Change quest recoverable", () => {
    const save = coveTakeSave("save", {
      questStatus: {
        q_cc_first_coins: {
          started: true,
          completed: false,
          completedObjectives: ["talk:npc_captain_penny"],
        },
      },
    });
    const fixed = backfillCoveChangeObjectives(save);
    expect(coveChangeReadyToComplete(fixed)).toBe(true);
    expect(fixed.questStatus.q_cc_first_coins?.completed).toBe(false);
  });
});

describe("FTUE red team — spectacle / menu gates", () => {
  it("spectacle waits for guided complete: RECOVERS not SOFTLOCK when map bypass done", () => {
    const bypassed = advanceHubGuided(createDefaultHubGuidedIntro(), "opened_map");
    expect(
      canOpenSignatureCinema({
        plazaReady: true,
        guidedComplete: isHubGuidedComplete(bypassed),
      }),
    ).toBe(true);
  });

  it("spectacle blocked mid meet_guide: RECOVERS — completes when guided finishes", () => {
    expect(
      canOpenSignatureCinema({
        plazaReady: true,
        guidedComplete: isHubGuidedComplete(createDefaultHubGuidedIntro()),
      }),
    ).toBe(false);
  });
});

describe("FTUE red team — content confusion guards", () => {
  it("Alma line does not assume Coin Pouch (Kira-first valid)", () => {
    const raw = readFileSync(
      join(__dirname, "content/coincraft-cove.islands.json"),
      "utf8",
    );
    const alma = JSON.parse(raw).islands[0].dialogues.find(
      (d: { id: string }) => d.id === "dlg_artisan_alma",
    );
    const aa1 = alma.nodes.find((n: { id: string }) => n.id === "aa1");
    expect(aa1.text).not.toMatch(/Coin Pouch/i);
    expect(aa1.text).toMatch(/Kira/i);
  });

  it("failure recovery + red-team docs exist", () => {
    const red = readFileSync(join(__dirname, "../../docs/ftue/FTUE_RED_TEAM.md"), "utf8");
    expect(red).toMatch(/RECOVERS|ADAPTS|SOFTLOCK/);
    expect(red).not.toMatch(/force.*intended path/i);
  });

  it("Piggy Talk requires substantive engagement before guided advance (wire)", () => {
    const app = readFileSync(join(__dirname, "IslandsApp.tsx"), "utf8");
    expect(app).toMatch(/piggyTalkEngagedRef/);
    expect(app).toMatch(/reconcileFtueQuestProofs/);
  });
});
