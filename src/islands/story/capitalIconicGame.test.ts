import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { coinBagHarborTip } from "./coinBagBuddy";
import { islandLockHint, bossUnlockProgress } from "../progressGates";
import { SIDE_TOMFOOLERY } from "../mainCourse";
import type { IslandDefinition, IslandSaveV1 } from "../types";

describe("iconic whole-game criteria contracts", () => {
  const criteria = readFileSync(
    join(__dirname, "../../../docs/capital-iconic-game-criteria.md"),
    "utf8",
  );
  const shore = readFileSync(
    join(__dirname, "../views/IslandShoreView.tsx"),
    "utf8",
  );
  const cove = readFileSync(
    join(__dirname, "../content/coincraft-cove.islands.json"),
    "utf8",
  );

  it("locks the 12-row iconic game bar", () => {
    expect(criteria).toMatch(/Emotional main story/);
    expect(criteria).toMatch(/Free roam/);
    expect(criteria).toMatch(/Side quests with stakes/);
    expect(criteria).toMatch(/Alive NPCs/);
    expect(criteria).toMatch(/Every island playable/);
    expect(criteria).toMatch(/Literacy in play/);
  });

  it("keeps shore HUD to organ next-verb — no culture/cast stack", () => {
    expect(shore).toMatch(/shore-next-verb/);
    expect(shore).toMatch(/organVerbChip/);
    expect(shore).toMatch(/Free roam/);
    expect(shore).toMatch(/data-free-roam/);
    expect(shore).not.toMatch(/Cast:/);
    expect(shore).not.toMatch(/signatureMachines/);
    expect(shore).not.toMatch(/genreShoreBlurb/);
  });

  it("names Credit Spiral lock with mastery progress", () => {
    const locked = {
      id: "credit_kingdom",
      name: "Credit Kingdom",
      requiredItems: [],
    } as unknown as IslandDefinition;
    const save = {
      inventory: [],
      voyagerLedger: { harborEscaped: true, masteryClears: ["a"] },
    } as unknown as IslandSaveV1;
    const hint = islandLockHint(locked, save);
    expect(hint).toMatch(/Spiral locked — mastery 1\/3/);
    const tip = coinBagHarborTip(null, {
      hasFreedom: true,
      creditMastery: bossUnlockProgress(save),
    });
    expect(tip.tip).toMatch(/mastery 1\/3/);
  });

  it("ships Cove Shell Want as a side digression that can scar Harbor", () => {
    expect(cove).toMatch(/q_cc_shell_want/);
    expect(cove).toMatch(/"track": "side"/);
    expect(cove).toMatch(/cc_shell_patience|cc_shell_impulse/);
    expect(cove).toMatch(/addScar/);
    expect(SIDE_TOMFOOLERY.some((s) => s.id === "cove_shell_want")).toBe(true);
    expect(SIDE_TOMFOOLERY.some((s) => s.id === "paycheck_inbox_storm")).toBe(true);
    expect(SIDE_TOMFOOLERY.some((s) => s.id === "credit_collector_rumor")).toBe(true);
  });

  it("ships Harbor digression scars on every era side shore", () => {
    const scars = [
      "vf_foundry_listen",
      "fa_portfolio_peek",
      "da_wharf_listen",
      "ba_shop_browse",
      "in_ip_glance",
      "fs_scaffold_look",
      "re_auction_watch",
      "sc_signal_listen",
    ];
    const contentBlob = [
      "venture-foundry",
      "financial-assets",
      "digital-assets",
      "business-assets",
      "intangibles",
      "future-shores",
      "real-estate",
      "signal-city",
    ]
      .map((slug) =>
        readFileSync(join(__dirname, `../content/${slug}.islands.json`), "utf8"),
      )
      .join("\n");
    for (const id of scars) {
      expect(contentBlob).toMatch(new RegExp(id));
    }
    const mem = readFileSync(join(__dirname, "../worldMemory.ts"), "utf8");
    expect(mem).toMatch(/foundry_listen/);
    expect(mem).toMatch(/portfolio_peek/);
    expect(mem).toMatch(/auction_watch/);
    expect(SIDE_TOMFOOLERY.some((s) => s.id === "signal_reef_listen")).toBe(true);
  });
});
