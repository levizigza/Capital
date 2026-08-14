import { describe, expect, it } from "vitest";
import {
  SECRET_CATALOG,
  communityOrganShelfLine,
  dealPlazaReceiptTip,
  hasSecretInsight,
  markCommunityShelfInsight,
  openSecretQuestions,
  recordSoftBeatPeek,
  recordWeatherOrganInsight,
  resolveSoftBeatSecrets,
  secretsAtLevel,
  softBeatForkVista,
  tellerCrossIndexLine,
  weatherOrganCoachLine,
} from "./secretArchitecture";
import type { IslandSaveV1 } from "./types";
import type { FamilyRoom } from "./familyRoom";
import { createDefaultVoyagerLedger } from "./voyagerLedger";

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

function room(members: string[]): FamilyRoom {
  return {
    code: "ABCDEF",
    name: "Test Harbor",
    createdAt: new Date().toISOString(),
    hostId: "m_host",
    members: members.map((name, i) => ({
      id: `m_${i}`,
      name,
      joinedAt: new Date().toISOString(),
    })),
    pinnedLevelIds: [],
  };
}

describe("secretArchitecture catalog", () => {
  it("layers 2–4 secrets without a collectible scavenger list", () => {
    expect(secretsAtLevel(2).length).toBeGreaterThanOrEqual(2);
    expect(secretsAtLevel(3).length).toBeGreaterThanOrEqual(3);
    expect(secretsAtLevel(4).map((s) => s.id)).toContain("community_organ_shelf");
    for (const s of SECRET_CATALOG) {
      expect(s.emergesFrom.length).toBeGreaterThan(4);
      expect(s.question.endsWith("?") || s.question.includes("?")).toBe(true);
    }
  });
});

describe("Level 2 Soft Beat fork vista", () => {
  it("names Cove fork from the lid", () => {
    expect(
      softBeatForkVista("lookout", {
        cove_save_vs_spend: {
          choiceId: "save",
          label: "Jar",
          islandId: "coincraft_cove",
          at: "2026-01-01",
        },
      }),
    ).toMatch(/jar sits heavy/i);
    expect(
      softBeatForkVista("lookout", {
        cove_save_vs_spend: {
          choiceId: "spend",
          label: "Treat",
          islandId: "coincraft_cove",
          at: "2026-01-01",
        },
      }),
    ).toMatch(/thinner/i);
  });

  it("records first peek insight + thank-you coins", () => {
    const save = baseSave({
      irreversibleChoices: {
        paycheck_protect_vs_spend: {
          choiceId: "protect",
          label: "Umbrella",
          islandId: "paycheck_peninsula",
          at: "2026-01-01",
        },
      },
    });
    const view = resolveSoftBeatSecrets(save, "umbrella");
    expect(view.vistaLine).toMatch(/Main Street stays dry/i);
    expect(view.strategyHint).toMatch(/rainy-day/i);

    const first = recordSoftBeatPeek(save, "umbrella");
    expect(first.resourceCoins).toBe(5);
    expect(hasSecretInsight(first.save, "soft_beat_fork_vista")).toBe(true);
    expect(first.discoveryNote).toMatch(/Fork vista/i);

    const second = recordSoftBeatPeek(first.save, "umbrella");
    expect(second.resourceCoins).toBe(0);
    expect(second.discoveryNote).toMatch(/Return peek/i);
  });
});

describe("Level 2 teller cross-index", () => {
  it("names multiple organs under glass", () => {
    const save = baseSave({
      harborScars: [
        {
          id: "cove_jar",
          islandId: "coincraft_cove",
          choiceId: "save",
          label: "Jar before treat",
          kind: "plaque",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "pp_umbrella",
          islandId: "paycheck_peninsula",
          choiceId: "protect",
          label: "Umbrella before glitter",
          kind: "plaque",
          createdAt: "2026-01-02T00:00:00.000Z",
        },
      ],
    });
    const line = tellerCrossIndexLine(save);
    expect(line).toMatch(/Coin/i);
    expect(line).toMatch(/Clock/i);
    expect(line).toMatch(/cross-index/i);

    const peek = recordSoftBeatPeek(save, "ledger");
    expect(hasSecretInsight(peek.save, "teller_cross_index")).toBe(true);
  });
});

describe("Level 3 weather ↔ organ", () => {
  it("cites organ when plaques exist", () => {
    const save = baseSave({
      harborScars: [
        {
          id: "cove_jar",
          islandId: "coincraft_cove",
          choiceId: "save",
          label: "Jar before treat",
          kind: "plaque",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    expect(weatherOrganCoachLine(save)).toMatch(/Coin|jar|Plinth|Fair weather/i);
    const next = recordWeatherOrganInsight(save, "2026-08-14");
    expect(hasSecretInsight(next, "weather_organ")).toBe(true);
    expect(next.curiosity?.weatherOrganDayKey).toBe("2026-08-14");
    expect(recordWeatherOrganInsight(next, "2026-08-14")).toBe(next);
  });
});

describe("Level 3 debt fog foreshadow", () => {
  it("Battlement foreshadows Credit before the Take", () => {
    const save = baseSave({
      harborRitual: {
        lastDayKey: "2026-08-14",
        streak: 1,
        today: {
          rumorId: "debt_fog",
          rumorSeen: true,
          paydayDone: false,
          rewardClaimed: false,
          greeted: false,
        },
      },
    });
    const view = resolveSoftBeatSecrets(save, "battlement");
    expect(view.foreshadowLine).toMatch(/Interest-storm|Spiral/i);
    const peek = recordSoftBeatPeek(save, "battlement");
    expect(hasSecretInsight(peek.save, "debt_fog_battlement")).toBe(true);
  });
});

describe("Level 3 deal plaza receipt", () => {
  it("names a board asset on Freedom", () => {
    const ledger = createDefaultVoyagerLedger();
    ledger.holdings.push({
      id: "asset_demo",
      kind: "asset",
      name: "Lemon Cart",
      icon: "🍋",
      monthlyAmount: 12,
    });
    const tip = dealPlazaReceiptTip(baseSave({ voyagerLedger: ledger }));
    expect(tip).toMatch(/Lemon Cart/);
    expect(tip).toMatch(/Freedom/);
  });
});

describe("Level 4 community organ shelf", () => {
  it("needs two members and two plaques — local myth only", () => {
    const save = baseSave({
      harborScars: [
        {
          id: "cove_jar",
          islandId: "coincraft_cove",
          choiceId: "save",
          label: "Jar before treat",
          kind: "plaque",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "credit_wait",
          islandId: "credit_kingdom",
          choiceId: "wait",
          label: "Waited the spiral",
          kind: "plaque",
          createdAt: "2026-01-03T00:00:00.000Z",
        },
      ],
    });
    expect(communityOrganShelfLine(save, room(["Sam"]))).toBeNull();
    expect(communityOrganShelfLine(save, null)).toBeNull();
    const line = communityOrganShelfLine(save, room(["Sam", "Alex"]));
    expect(line).toMatch(/Household shelf/);
    expect(line).toMatch(/Sam/);
    const marked = markCommunityShelfInsight(save, room(["Sam", "Alex"]));
    expect(hasSecretInsight(marked, "community_organ_shelf")).toBe(true);
    expect(openSecretQuestions(marked).some((q) => q.includes("household"))).toBe(false);
  });
});
