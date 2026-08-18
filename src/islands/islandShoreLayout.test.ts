import { describe, expect, it } from "vitest";
import {
  buildShoreHotspots,
  islandNeedsPartyDash,
  itemIsDialogueReward,
} from "./islandShoreLayout";
import { loadIslandsContent } from "./content/loader";
import { COVE_ISLAND_ID } from "./islandIds";
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
      {
        id: "npc_2",
        name: "Broker",
        icon: "📈",
        areaId: "a1",
        dialogueGraphId: "dlg_2",
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
      name: "Paycheck Peninsula",
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
    // Literacy sims/quizzes land on shore — not only an injected Party Arena.
    expect(pad?.minigameId).toBe("mg_budget_split");
  });

  it("assigns distinct mascots to NPCs", () => {
    const island = fakeIsland({ id: "signal_city", name: "Phosphor Reef" });
    const npcs = buildShoreHotspots(island).filter((s) => s.kind === "npc");
    expect(npcs.length).toBeGreaterThan(1);
    expect(npcs.every((n) => !!n.mascotId)).toBe(true);
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
          id: "mg_budget_split",
          name: "Budget Split",
          icon: "📊",
          description: "quiz",
          componentId: "BudgetSplitterGame",
        },
      ],
    });
    expect(islandNeedsPartyDash(island)).toBe(false);
    const pads = buildShoreHotspots(island).filter((s) => s.kind === "play_pad");
    expect(pads.some((p) => p.minigameId === "mg_coin_catcher")).toBe(true);
    // Literacy games share the shore with kinesthetic openers.
    expect(pads.some((p) => p.minigameId === "mg_budget_split")).toBe(true);
    expect(isKinestheticComponent("CoinCatcherMinigame")).toBe(true);
  });

  it("attaches mastery quiz after party dash", () => {
    const gate = getMasteryGateForMinigame("mg_party_dash_signal_city");
    expect(gate?.title).toMatch(/Mastery Quiz/i);
    expect(gate?.questions.length).toBeGreaterThan(0);
  });

  it("keeps Cove dialogue/quest-reward jars off the shore pickup ring", () => {
    const cove = loadIslandsContent().islands.find((i) => i.id === COVE_ISLAND_ID)!;
    expect(itemIsDialogueReward(cove, "cc_savings_jar")).toBe(true);
    expect(itemIsDialogueReward(cove, "cc_craft_badge")).toBe(true);
    const spots = buildShoreHotspots(cove);
    expect(spots.some((h) => h.kind === "money_structure")).toBe(true);
    expect(spots.some((h) => h.refId === "cc_savings_jar")).toBe(false);
    expect(spots.some((h) => h.refId === "cc_craft_badge")).toBe(false);
    expect(spots.some((h) => h.refId === "cc_coin_pouch")).toBe(true);
  });

  it("puts financial literacy pads on unlocked spine shores (not only Party Arena)", () => {
    const content = loadIslandsContent();
    for (const id of ["coincraft_cove", "paycheck_peninsula", "credit_kingdom"]) {
      const island = content.islands.find((i) => i.id === id)!;
      const pads = buildShoreHotspots(island).filter((s) => s.kind === "play_pad");
      expect(pads.length).toBeGreaterThan(0);
      const literacy = pads.filter(
        (p) => p.minigameId && !String(p.minigameId).startsWith("mg_party_dash_"),
      );
      expect(literacy.length).toBeGreaterThan(0);
    }
  });
});
