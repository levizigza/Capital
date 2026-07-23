import { describe, expect, it } from "vitest";
import { buildShoreHotspots, islandNeedsPartyDash } from "./islandShoreLayout";
import { partyDashIdForIsland, isKinestheticComponent } from "./partyPlayStyle";
import { getMasteryGateForMinigame } from "./masteryGate";
import type { IslandDefinition } from "./types";

function fakeIsland(partial: Partial<IslandDefinition> & Pick<IslandDefinition, "id" | "name">): IslandDefinition {
  return {
    description: "",
    icon: "🏝️",
    areas: [{ id: "a1", name: "Shore", description: "", icon: "⚓", connections: [] }],
    npcs: [
      {
        id: "npc_1",
        name: "Guide",
        icon: "👋",
        areaId: "a1",
        dialogueGraphId: "dlg_1",
      },
    ],
    items: [],
    quests: [],
    dialogues: [],
    minigames: [],
    ...partial,
  };
}

describe("island shore + party play", () => {
  it("builds pier, board, journal, and play pads", () => {
    const island = fakeIsland({
      id: "paycheck_peninsula",
      name: "Dotgraph Atoll",
      minigames: [
        {
          id: "mg_budget_split",
          name: "Budget Split",
          icon: "📊",
          description: "quizzy",
          componentId: "BudgetSplitterGame",
        },
      ],
    });
    expect(islandNeedsPartyDash(island)).toBe(true);
    const spots = buildShoreHotspots(island);
    expect(spots.some((s) => s.kind === "pier")).toBe(true);
    expect(spots.some((s) => s.kind === "party_board")).toBe(true);
    expect(spots.some((s) => s.kind === "journal")).toBe(true);
    expect(spots.some((s) => s.kind === "npc")).toBe(true);
    const pad = spots.find((s) => s.kind === "play_pad");
    expect(pad?.minigameId).toBe(partyDashIdForIsland("paycheck_peninsula"));
  });

  it("prefers real kinesthetic games over injected dash", () => {
    const island = fakeIsland({
      id: "coincraft_cove",
      name: "Coincraft Cove",
      minigames: [
        {
          id: "mg_coin_catcher",
          name: "Coin Catcher",
          icon: "🕹️",
          description: "catch",
          componentId: "CoinCatcherMinigame",
        },
        {
          id: "mg_life_fork",
          name: "Life Fork",
          icon: "🔀",
          description: "quiz",
          componentId: "LifeForkGame",
        },
      ],
    });
    expect(islandNeedsPartyDash(island)).toBe(false);
    const pads = buildShoreHotspots(island).filter((s) => s.kind === "play_pad");
    expect(pads.every((p) => p.minigameId === "mg_coin_catcher" || isKinestheticComponent("CoinCatcherMinigame"))).toBe(
      true,
    );
    expect(pads.some((p) => p.minigameId === "mg_life_fork")).toBe(false);
  });

  it("attaches mastery quiz after party dash", () => {
    const gate = getMasteryGateForMinigame("mg_party_dash_signal_city");
    expect(gate?.title).toMatch(/Mastery Quiz/i);
    expect(gate?.questions.length).toBeGreaterThan(0);
  });
});
