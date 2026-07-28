import { describe, expect, it } from "vitest";
import { buildShoreHotspots } from "./islandShoreLayout";
import {
  COVE_COIN_JAR,
  CREDIT_INTEREST_KEEP,
  HARBOR_LEDGER_BANK,
  PAYCHECK_PAYROLL_TOWER,
  moneyStructureForIsland,
} from "./moneyStructures";
import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";
import type { IslandDefinition } from "./types";

function stubCove(): IslandDefinition {
  return {
    id: COVE_ISLAND_ID,
    name: "Coincraft Cove",
    description: "test",
    icon: "🏝️",
    areas: [{ id: "cc_harbor", name: "Harbor", description: "", icon: "⚓", connections: [] }],
    npcs: [],
    items: [],
    quests: [],
    dialogues: [],
    minigames: [
      {
        id: "mg_coin_catcher",
        name: "Coin Catcher",
        description: "x",
        icon: "🕹️",
        componentId: "CoinCatcherMinigame",
      },
    ],
  };
}

function stubPaycheck(): IslandDefinition {
  return {
    id: PAYCHECK_PENINSULA_ID,
    name: "Paycheck Peninsula",
    description: "test",
    icon: "💸",
    areas: [{ id: "pp_main", name: "Main", description: "", icon: "🏢", connections: [] }],
    npcs: [],
    items: [],
    quests: [],
    dialogues: [],
    minigames: [
      {
        id: "mg_budget_split",
        name: "Budget Split",
        description: "x",
        icon: "📊",
        componentId: "BudgetSplitMinigame",
      },
    ],
  };
}

function stubCredit(): IslandDefinition {
  return {
    id: CREDIT_KINGDOM_ID,
    name: "Credit Kingdom",
    description: "test",
    icon: "🏰",
    areas: [{ id: "ck_gate", name: "Gate", description: "", icon: "🚪", connections: [] }],
    npcs: [],
    items: [],
    quests: [],
    dialogues: [],
    minigames: [
      {
        id: "mg_ck_budget_balancer",
        name: "Debt Loadout",
        description: "x",
        icon: "⚖️",
        componentId: "BudgetBalancerMinigame",
      },
    ],
  };
}

describe("money structures", () => {
  it("registers the Cove Giant Coin Jar", () => {
    const s = moneyStructureForIsland(COVE_ISLAND_ID);
    expect(s?.id).toBe(COVE_COIN_JAR.id);
    expect(s?.theme).toBe("jar");
    expect(s?.parts.length).toBeGreaterThanOrEqual(3);
    expect(s?.parts.some((p) => p.minigameId === "mg_treasure_vault")).toBe(true);
    expect(s?.parts.some((p) => p.softBeat === "lookout")).toBe(true);
  });

  it("registers the Harbor Ledger Bank", () => {
    const s = moneyStructureForIsland(HARBOR_HAVEN_ID);
    expect(s?.id).toBe(HARBOR_LEDGER_BANK.id);
    expect(s?.theme).toBe("bank");
    expect(s?.entryVerb.toLowerCase()).toMatch(/vault/);
    expect(s?.parts.some((p) => p.minigameId === "mg_inbox_storm")).toBe(true);
    expect(s?.parts.some((p) => p.softBeat === "ledger")).toBe(true);
  });

  it("registers the Paycheck Payroll Tower", () => {
    const s = moneyStructureForIsland(PAYCHECK_PENINSULA_ID);
    expect(s?.id).toBe(PAYCHECK_PAYROLL_TOWER.id);
    expect(s?.theme).toBe("tower");
    expect(s?.entryVerb.toLowerCase()).toMatch(/chute|paycheck/);
    expect(s?.parts.some((p) => p.minigameId === "mg_budget_split")).toBe(true);
    expect(s?.parts.some((p) => p.minigameId === "mg_inbox_storm")).toBe(true);
    expect(s?.parts.some((p) => p.softBeat === "umbrella")).toBe(true);
  });

  it("registers the Credit Interest Keep", () => {
    const s = moneyStructureForIsland(CREDIT_KINGDOM_ID);
    expect(s?.id).toBe(CREDIT_INTEREST_KEEP.id);
    expect(s?.theme).toBe("keep");
    expect(s?.entryVerb.toLowerCase()).toMatch(/spiral|interest/);
    expect(s?.parts.some((p) => p.minigameId === "mg_ck_budget_balancer")).toBe(true);
    expect(s?.parts.some((p) => p.minigameId === "mg_ck_inbox_credit")).toBe(true);
    expect(s?.parts.some((p) => p.softBeat === "battlement")).toBe(true);
  });

  it("adds a money_structure shore hotspot on Cove", () => {
    const spots = buildShoreHotspots(stubCove());
    const jar = spots.find((h) => h.kind === "money_structure");
    expect(jar?.label).toMatch(/Coin Jar/i);
    expect(jar?.structureId).toBe("cove_coin_jar");
    expect(jar?.subtitle?.toLowerCase()).toMatch(/slot|squeeze/);
  });

  it("adds a money_structure shore hotspot on Paycheck", () => {
    const spots = buildShoreHotspots(stubPaycheck());
    const tower = spots.find((h) => h.kind === "money_structure");
    expect(tower?.label).toMatch(/Payroll Tower/i);
    expect(tower?.structureId).toBe("paycheck_payroll_tower");
    expect(tower?.subtitle?.toLowerCase()).toMatch(/chute|climb/);
  });

  it("adds a money_structure shore hotspot on Credit", () => {
    const spots = buildShoreHotspots(stubCredit());
    const keep = spots.find((h) => h.kind === "money_structure");
    expect(keep?.label).toMatch(/Interest Keep/i);
    expect(keep?.structureId).toBe("credit_interest_keep");
    expect(keep?.subtitle?.toLowerCase()).toMatch(/spiral|interest/);
  });
});
