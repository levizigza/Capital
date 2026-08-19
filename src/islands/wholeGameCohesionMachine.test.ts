/**
 * Whole-product machine cohesion — guards audit fixes from PR #170/#171.
 * Spine harness 100% is separate (iconicProofLaw); this is product-wide machine truth.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  hasCompletedCoveChange,
  hasCompletedPaycheckChange,
} from "./chapterLoop";
import {
  islandLockHint,
  isIslandProgressLocked,
  PLAYTEST_UNLOCK_ALL_ISLANDS,
} from "./progressGates";
import { MASTERY_GATES, PARTY_DASH_MASTERY_GATE } from "./masteryGate";
import { piggyGuidedGraph } from "./story/harborTalks";
import { SERIES_LEAD_MASCOT_IDS } from "./moneyCast";
import { sideShoreHudLine } from "./spineContentRegistry";
import { SIDE_SHORE_TRAVEL_IDS } from "./spineArchipelago";
import type { IslandDefinition, IslandSaveV1 } from "./types";
import { COVE_CHANGE_QUEST_ID, PAYCHECK_PENINSULA_ID } from "./islandIds";

const root = join(__dirname, "../..");

const stub = (id: string): IslandDefinition =>
  ({
    id,
    name: id,
    themeId: "harbor_haven",
    npcs: [],
    quests: [],
    items: [],
    areas: [],
  }) as IslandDefinition;

const coveDoneSave = {
  inventory: [],
  irreversibleChoices: {},
  questStatus: { [COVE_CHANGE_QUEST_ID]: { completed: true } },
  voyagerLedger: {
    salaryIncome: 0,
    passiveIncome: [],
    holdings: [],
    events: [],
    masteryClears: [],
    harborEscaped: false,
    escapeStreak: 0,
  },
} as unknown as IslandSaveV1;

describe("whole-game machine cohesion", () => {
  it("outer-ring side shores gate on Paycheck Change in code; playtest unlock opens them now", () => {
    expect(hasCompletedCoveChange(coveDoneSave)).toBe(true);
    expect(hasCompletedPaycheckChange(coveDoneSave)).toBe(false);
    const gates = readFileSync(join(__dirname, "progressGates.ts"), "utf8");
    expect(gates).toMatch(/isSideShoreTravelId/);
    expect(gates).toMatch(/hasCompletedPaycheckChange/);
    expect(gates).toMatch(/Finish Paycheck Change — then outer-ring shores open/);
    // Live playtest: every shore open for cold-check (flip PLAYTEST_UNLOCK_ALL_ISLANDS off to re-gate).
    expect(PLAYTEST_UNLOCK_ALL_ISLANDS).toBe(true);
    for (const id of SIDE_SHORE_TRAVEL_IDS) {
      expect(isIslandProgressLocked(stub(id), coveDoneSave)).toBe(false);
      expect(islandLockHint(stub(id), coveDoneSave)).toBeNull();
    }
    expect(isIslandProgressLocked(stub(PAYCHECK_PENINSULA_ID), coveDoneSave)).toBe(
      false,
    );
  });

  it("TravelMapView free-roam whisper uses Paycheck Change gate", () => {
    const travel = readFileSync(
      join(__dirname, "views/TravelMapView.tsx"),
      "utf8",
    );
    expect(travel).toMatch(/hasCompletedPaycheckChange/);
    expect(travel).toMatch(/Finish Paycheck Change — then the outer ring opens/);
    expect(travel).not.toMatch(/hasCompletedCoveChange.*freeRoamOpen/s);
  });

  it("Living Cashflow Commit ships on Harbor board (A/B/Wait)", () => {
    const board = readFileSync(join(__dirname, "views/IslandBoardView.tsx"), "utf8");
    const deals = readFileSync(join(__dirname, "harborOpportunity.ts"), "utf8");
    expect(board).toMatch(/Living Cashflow Commit/);
    expect(board).toMatch(/resolveDealOffer\(null\)/);
    expect(board).toMatch(/harborWeatherMood/);
    expect(deals).toMatch(/pickDealPair/);
    expect(deals).toMatch(/isWaitRationalForDealPair/);
  });

  it("STRONGEST_RECURRING_LOOP marks Living Cashflow Commit as shipped", () => {
    const loop = readFileSync(
      join(root, "docs/design/STRONGEST_RECURRING_LOOP.md"),
      "utf8",
    );
    expect(loop).toMatch(/SHIPPED|shipped on Harbor board/i);
    expect(loop).not.toMatch(/do not prototype until approved/i);
  });

  it("Signal City avoids credit-score classroom before Credit Kingdom", () => {
    const signal = readFileSync(
      join(__dirname, "content/signal-city.islands.json"),
      "utf8",
    );
    expect(signal).toMatch(/Reef Listen|Reef Echo/i);
    expect(signal).not.toMatch(/Credit 101/);
    expect(signal).not.toMatch(/credit score goes UP/i);
    expect(signal).not.toMatch(/300 to 850/);
  });

  it("side-shore 3D titles use organ HUD, not genre city lead", () => {
    const walk = readFileSync(
      join(__dirname, "world3d/WalkableIslandExplore.tsx"),
      "utf8",
    );
    expect(walk).toMatch(/sideShoreHudLine/);
    expect(walk).not.toMatch(/genreHudLine/);
    expect(sideShoreHudLine("signal_city")).toMatch(/Listen on this shore/i);
  });

  it("series lead ROLE_TIPS tip hats — no Plinth PSA clones", () => {
    const talks = readFileSync(join(__dirname, "story/harborTalks.ts"), "utf8");
    for (const id of SERIES_LEAD_MASCOT_IDS) {
      const block = talks.slice(
        talks.indexOf(`${id}:`),
        talks.indexOf(`${id}:`) + 900,
      );
      expect(block).toMatch(/Piggy|Harbor Keeper|terrace|tip/i);
      expect(block).not.toMatch(/Memory Plinth files/i);
      expect(block).not.toMatch(/Visit the Plinth/i);
    }
  });

  it("mastery gates are optional digressions — never Credit locks", () => {
    const copy =
      "Optional digression after the kinesthetic run. Ace every question for the worksheet — main progression still comes from Freedom + Paycheck Change.";
    for (const gate of MASTERY_GATES) {
      expect(gate.requirementCopy).toBe(copy);
    }
    expect(PARTY_DASH_MASTERY_GATE.requirementCopy).toBe(copy);
  });

  it("one front door: Ashore complete skips duplicate Harbor chart briefing", () => {
    const flags = readFileSync(join(__dirname, "ashoreTeachFlags.ts"), "utf8");
    const app = readFileSync(join(__dirname, "IslandsApp.tsx"), "utf8");
    expect(flags).toMatch(/shouldShowHarborWorldBriefing/);
    expect(app).toMatch(/shouldShowHarborWorldBriefing/);
    expect(app).toMatch(/consumeAshoreTeachResult/);
  });

  it("Piggy to_dock teases outer ring with Paycheck gate language", () => {
    const g = piggyGuidedGraph("to_dock");
    const text = g.nodes.map((n) => n.text).join(" ");
    expect(text).toMatch(/Coincraft Cove/i);
    expect(text).toMatch(/Paycheck Change|outer.?ring|side quests/i);
  });

  it("canon criteria doc matches Paycheck outer-ring gate", () => {
    const criteria = readFileSync(
      join(root, "docs/capital-iconic-game-criteria.md"),
      "utf8",
    );
    expect(criteria).toMatch(/After Paycheck Change, stray to side shores/i);
  });
});
