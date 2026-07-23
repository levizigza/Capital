import { describe, expect, it, beforeEach } from "vitest";
import {
  EventChannel,
  gameEvents,
  tickWorldDirector,
  lowestSkillFocus,
  resolveAdaptiveBuddyTip,
  syncWorldPlace,
  WB,
  worldBlackboard,
} from "./index";
import { createDefaultIslandSave } from "../save";
import { createDefaultSkillStats } from "../skillStats";
import { buildHarborNpcLives } from "../harborNpcLives";
import { createHarborAgent, createShoreAmbientAgent } from "../npcBehavior";
import { buildAmbientEcosystem, getIslandCulture } from "../islandCulture";
import type { IslandDefinition } from "../types";

function fakeIsland(id: string): IslandDefinition {
  return {
    id,
    name: id,
    description: "",
    icon: "🏝️",
    areas: [],
    npcs: [],
    items: [],
    quests: [],
    dialogues: [],
    minigames: [],
  };
}

describe("gameSystems", () => {
  beforeEach(() => {
    gameEvents.clear();
    worldBlackboard.set(WB.softlockRisk, false);
  });

  it("EventChannel pub/sub delivers payloads", () => {
    const ch = new EventChannel();
    let got = "";
    ch.on("softlock.nudge", (p) => {
      got = p.reason;
    });
    ch.emit("softlock.nudge", { reason: "try the dock" });
    expect(got).toBe("try the dock");
  });

  it("WorldDirector nudges on long idle + fail pressure", () => {
    const d = tickWorldDirector({
      idleSeconds: 50,
      failPressure: 3,
      cashflow: 40,
      lowestSkill: "none",
      ecosystemMotion: "mixed",
    });
    expect(d.softlockNudge).toBeTruthy();
    expect(d.adaptiveFocus).toBe("stuck");
    expect(d.skyIntent).toBe("day");
  });

  it("lowestSkillFocus only fires when lagging", () => {
    expect(lowestSkillFocus({ resilience: 40, discipline: 40, foresight: 40 })).toBe("none");
    expect(lowestSkillFocus({ resilience: 8, discipline: 40, foresight: 40 })).toBe("resilience");
  });

  it("adaptive coach keeps structural tips for near-store verbs", () => {
    const save = createDefaultIslandSave();
    const tip = resolveAdaptiveBuddyTip({
      save,
      structuralTip: { tip: "Enter Outfitter", coach: "Door’s close." },
      ecosystemMotion: "mixed",
    });
    expect(tip.tip).toBe("Enter Outfitter");
  });

  it("adaptive coach surfaces cashflow focus when net is thin", () => {
    const save = createDefaultIslandSave();
    save.voyagerLedger = {
      ...save.voyagerLedger!,
      salaryIncome: 5,
      livingExpenses: 40,
      holdings: [],
    };
    save.skillStats = createDefaultSkillStats();
    const tip = resolveAdaptiveBuddyTip({
      save,
      profileId: "explorer",
      ecosystemMotion: "mixed",
    });
    expect(tip.tip.toLowerCase()).toMatch(/cashflow|buffer|budget|step|nudge|wander/i);
  });

  it("syncWorldPlace sets ecosystem intensity", () => {
    syncWorldPlace({ place: "shore", islandId: "signal_city", ecosystemMotion: "dynamic" });
    expect(worldBlackboard.get(WB.ecosystemIntensity)).toBe(1);
    syncWorldPlace({ place: "shore", islandId: "credit_kingdom", ecosystemMotion: "static" });
    expect(worldBlackboard.get(WB.ecosystemIntensity)).toBe(0.15);
  });
});

describe("harbor motion mix", () => {
  it("builds both static keepers and dynamic roamers", () => {
    const lives = buildHarborNpcLives();
    expect(lives.some((l) => l.motion === "static")).toBe(true);
    expect(lives.some((l) => l.motion === "dynamic")).toBe(true);
    const piggy = lives.find((l) => l.mascotId === "piggy_penny");
    expect(piggy?.motion).toBe("static");
  });

  it("static harbor agents still tick without throwing", () => {
    const life = buildHarborNpcLives().find((l) => l.motion === "static")!;
    const agent = createHarborAgent(life);
    const body = agent.tick(0.16);
    expect(body.position).toHaveLength(3);
  });
});

describe("shore motion agents", () => {
  it("static culture residents stay home; dynamic ones get wander graphs", () => {
    const staticRes = buildAmbientEcosystem(fakeIsland("intangibles"))[0]!;
    expect(staticRes.motion).toBe("static");
    const agent = createShoreAmbientAgent(staticRes);
    const a = agent.tick(0.16);
    expect(a.position[0]).toBeCloseTo(staticRes.position[0], 1);

    const dyn = buildAmbientEcosystem(fakeIsland("digital_assets"))[0]!;
    expect(dyn.motion).toBe("dynamic");
    expect(getIslandCulture(fakeIsland("digital_assets")).ecosystemMotion).toBe("dynamic");
    createShoreAmbientAgent(dyn).tick(0.16);
  });
});
