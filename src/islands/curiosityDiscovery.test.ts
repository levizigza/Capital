import { describe, expect, it } from "vitest";
import {
  CURIOSITY_HOOKS,
  openCuriosityQuestions,
  recordSoftBeatPeek,
  resolveSoftBeatCuriosity,
  softBeatForkVista,
  tellerCrossIndexLine,
  weatherOrganCoachLine,
  affinityShelfLine,
  markAffinityShelfInsight,
  hasCuriosityInsight,
  dealPlazaReceiptTip,
} from "./curiosityDiscovery";
import { createDefaultIslandSave } from "./save";
import { createDefaultVoyagerLedger, HARBOR_DEALS } from "./voyagerLedger";

describe("curiosity discovery", () => {
  it("registers hooks that each name a player question + reward", () => {
    expect(CURIOSITY_HOOKS.length).toBeGreaterThanOrEqual(6);
    for (const h of CURIOSITY_HOOKS) {
      expect(h.playerQuestion.endsWith("?") || h.playerQuestion.includes("?")).toBe(true);
      expect(h.howToInvestigate.length).toBeGreaterThan(8);
      expect(h.reward).toBeTruthy();
    }
  });

  it("Soft Beat fork vista differs by Take", () => {
    const save = softBeatForkVista("lookout", {
      cove_save_vs_spend: {
        choiceId: "save",
        label: "Jar before treat",
        islandId: "coincraft_cove",
        at: "",
      },
    });
    const spend = softBeatForkVista("lookout", {
      cove_save_vs_spend: {
        choiceId: "spend",
        label: "Treat before jar",
        islandId: "coincraft_cove",
        at: "",
      },
    });
    expect(save).toMatch(/jar before treat/i);
    expect(spend).toMatch(/treat first|thinner/i);
    expect(save).not.toBe(spend);
  });

  it("Teller cross-index names multiple organs", () => {
    const save = createDefaultIslandSave();
    save.harborScars = [
      {
        id: "cove_saver_plaque",
        islandId: "coincraft_cove",
        choiceId: "save",
        label: "Jar before treat",
        kind: "plaque",
        createdAt: "2026-01-01",
      },
      {
        id: "pp_protector_plaque",
        islandId: "paycheck_peninsula",
        choiceId: "protect",
        label: "Umbrella before glitter",
        kind: "plaque",
        createdAt: "2026-01-02",
      },
    ];
    const line = tellerCrossIndexLine(save);
    expect(line).toMatch(/Coin/);
    expect(line).toMatch(/Clock/);
  });

  it("weather coach names Spiral when haste scar storms", () => {
    const save = createDefaultIslandSave();
    save.harborScars = [
      {
        id: "credit_haste_plaque",
        islandId: "credit_kingdom",
        choiceId: "borrow",
        label: "Haste fed the spiral",
        kind: "plaza_prop",
        createdAt: "2026-01-03",
      },
    ];
    save.voyagerLedger = {
      ...createDefaultVoyagerLedger(),
      salaryIncome: 10,
      livingExpenses: 25,
    };
    expect(weatherOrganCoachLine(save)).toMatch(/Spiral/);
  });

  it("records Soft Beat peek with first-peek resource and insight", () => {
    let save = createDefaultIslandSave();
    save.irreversibleChoices = {
      cove_save_vs_spend: {
        choiceId: "save",
        label: "Jar before treat",
        islandId: "coincraft_cove",
        at: "",
      },
    };
    const first = recordSoftBeatPeek(save, "lookout");
    expect(first.resourceCoins).toBe(5);
    expect(first.save.curiosity?.softBeats?.lookout?.peekCount).toBe(1);
    expect(hasCuriosityInsight(first.save, "soft_beat_fork_vista")).toBe(true);

    const second = recordSoftBeatPeek(first.save, "lookout");
    expect(second.resourceCoins).toBe(0);
    expect(second.save.curiosity?.softBeats?.lookout?.peekCount).toBe(2);
  });

  it("open questions shrink as insights land — never a forced score", () => {
    const save = createDefaultIslandSave();
    const before = openCuriosityQuestions(save).length;
    expect(before).toBe(CURIOSITY_HOOKS.length);
    const peeked = recordSoftBeatPeek(
      {
        ...save,
        irreversibleChoices: {
          cove_save_vs_spend: {
            choiceId: "save",
            label: "Jar",
            islandId: "coincraft_cove",
            at: "",
          },
        },
      },
      "lookout",
    );
    expect(openCuriosityQuestions(peeked.save).length).toBeLessThan(before);
  });

  it("affinity shelf appears after deep talk memory", () => {
    const save = createDefaultIslandSave();
    save.npcMemory = {
      guide: { talks: 4, lastChoiceIds: ["kk1_a"], affinity: 3 },
    };
    save.harborScars = [
      {
        id: "cove_saver_plaque",
        islandId: "coincraft_cove",
        choiceId: "save",
        label: "Jar before treat",
        kind: "plaque",
        createdAt: "",
      },
    ];
    expect(affinityShelfLine(save, "guide")).toMatch(/Jar before treat/);
    expect(hasCuriosityInsight(markAffinityShelfInsight(save), "npc_affinity_shelf")).toBe(true);
  });

  it("deal plaza receipt names a holding", () => {
    const jar = HARBOR_DEALS.find((d) => d.id === "asset_savings_jar")!;
    const save = createDefaultIslandSave();
    save.voyagerLedger = {
      ...createDefaultVoyagerLedger(),
      holdings: [jar],
    };
    expect(dealPlazaReceiptTip(save)).toMatch(/Interest Jar/);
  });

  it("resolveSoftBeatCuriosity returns return-peek after record", () => {
    const save = createDefaultIslandSave();
    const after = recordSoftBeatPeek(save, "ledger");
    const view = resolveSoftBeatCuriosity(after.save, "ledger");
    expect(view.isReturnPeek).toBe(true);
    expect(view.peekCount).toBe(1);
  });
});
