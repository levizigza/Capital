import { describe, expect, it } from "vitest";
import { loadIslandsContent } from "./content/loader";
import { ARCHIPELAGO_MAP_TRAVEL_IDS } from "./spineArchipelago";
import { HUB_ISLAND_ID } from "./islandIds";

import type { IslandDefinition } from "./types";

/** Cove-quality bar for map islands (hub exempt from quest count). */
const COVE_MINIGAMES = 8;
const COVE_QUESTS = 3;
const COVE_DIALOGUE_NODES = 15;

const SIDE_SHORE_IDS = ARCHIPELAGO_MAP_TRAVEL_IDS.filter((id) => id !== HUB_ISLAND_ID);

function dialogueNodeCount(island: IslandDefinition): number {
  return (island.dialogues ?? []).reduce((n, d) => n + (d.nodes?.length ?? 0), 0);
}

const content = loadIslandsContent();

describe("island content depth — Cove quality bar", () => {
  it("spine + side shores ship at least Cove minigame count", () => {
    for (const id of ARCHIPELAGO_MAP_TRAVEL_IDS) {
      const island = content.islands.find((i) => i.id === id)!;
      const mg = island.minigames?.length ?? 0;
      expect(mg, `${id} minigames`).toBeGreaterThanOrEqual(COVE_MINIGAMES);
    }
  });

  it("chapter islands ship at least three quests (hub exempt)", () => {
    for (const id of SIDE_SHORE_IDS) {
      const island = content.islands.find((i) => i.id === id)!;
      const quests = island.quests?.length ?? 0;
      expect(quests, `${id} quests`).toBeGreaterThanOrEqual(COVE_QUESTS);
    }
  });

  it("side shores ship digression scar pairs", () => {
    const pairs: Record<string, [string, string]> = {
      coincraft_cove: ["cc_shell_patience", "cc_shell_impulse"],
      paycheck_peninsula: ["pp_tip_plan", "pp_tip_rush"],
      credit_kingdom: ["ck_collector_rumor", "ck_collector_lean"],
      signal_city: ["sc_signal_listen", "sc_signal_rush"],
      venture_foundry: ["vf_foundry_listen", "vf_foundry_rush"],
      financial_assets: ["fa_portfolio_peek", "fa_portfolio_rush"],
      digital_assets: ["da_wharf_listen", "da_wharf_rush"],
      business_assets: ["ba_shop_browse", "ba_shop_rush"],
      intangibles: ["in_ip_glance", "in_ip_rush"],
      future_shores: ["fs_scaffold_look", "fs_scaffold_rush"],
      real_estate: ["re_auction_watch", "re_auction_rush"],
    };
    for (const [id, [a, b]] of Object.entries(pairs)) {
      const blob = JSON.stringify(content.islands.find((i) => i.id === id));
      expect(blob).toMatch(a);
      expect(blob).toMatch(b);
    }
  });

  it("side shores ship at least Cove dialogue node count", () => {
    for (const id of SIDE_SHORE_IDS) {
      const island = content.islands.find((i) => i.id === id)!;
      const nodes = dialogueNodeCount(island);
      expect(nodes, `${id} dialogue nodes`).toBeGreaterThanOrEqual(COVE_DIALOGUE_NODES);
    }
  });
});
