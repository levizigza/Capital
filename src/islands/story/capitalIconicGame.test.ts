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
});
