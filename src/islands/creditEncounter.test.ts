import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { creditRexStartNodeId } from "./creditEncounter";
import { moneyStructureForIsland } from "./moneyStructures";
import { CREDIT_KINGDOM_ID } from "./islandIds";
import type { IslandSaveV1 } from "./types";

function baseSave(over: Partial<IslandSaveV1> = {}): IslandSaveV1 {
  return {
    version: "1",
    updatedAt: new Date().toISOString(),
    inventory: [],
    questStatus: {},
    completedMinigames: [],
    discovered: { npcs: [], items: [], areas: [], islands: [] },
    ...over,
  };
}

describe("Credit encounter — Pillar 6 skill tests", () => {
  it("routes Debt Anvil to Score Scanner, not Paycheck categorize", () => {
    const keep = moneyStructureForIsland(CREDIT_KINGDOM_ID);
    expect(keep?.parts.find((p) => p.id === "debt_anvil")?.minigameId).toBe("mg_ck_signal");
    const json = readFileSync(
      join(__dirname, "content/credit-kingdom.islands.json"),
      "utf8",
    );
    const questBlock = json.slice(
      json.indexOf("q_ck_first_recovery"),
      json.indexOf('"rewards"', json.indexOf("q_ck_first_recovery")),
    );
    expect(questBlock).toMatch(/mg_ck_signal/);
    expect(questBlock).not.toMatch(/mg_ck_budget_balancer/);
    expect(json).toMatch(/"type": "startMinigame"[\s\S]*?"minigameId": "mg_ck_signal"/);
  });

  it("opens Rex on the Ordeal fork only after Score Scanner", () => {
    expect(creditRexStartNodeId(baseSave())).toBe("r1");
    expect(
      creditRexStartNodeId(baseSave({ completedMinigames: ["mg_ck_signal"] })),
    ).toBe("r_fork");
    expect(
      creditRexStartNodeId(
        baseSave({
          completedMinigames: ["mg_ck_signal"],
          irreversibleChoices: {
            credit_borrow_vs_wait: {
              choiceId: "wait",
              label: "Waited",
              islandId: CREDIT_KINGDOM_ID,
              at: "now",
            },
          },
        }),
      ),
    ).toBe("r_remember");
  });

  it("does not Put the Take on Cleo’s quest accept", () => {
    const json = readFileSync(
      join(__dirname, "content/credit-kingdom.islands.json"),
      "utf8",
    );
    expect(json).toMatch(/"nextNodeId": "c2"/);
    expect(json).not.toMatch(/"nextNodeId": "c_fork"/);
    expect(json).toMatch(/"id": "r_fork"/);
  });
});
