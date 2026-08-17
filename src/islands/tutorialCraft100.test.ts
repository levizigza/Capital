/**
 * Machine craft-100% contracts for tutorial beats (human Pass stays separate).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { shouldShowCastleCoach } from "./harborAshore";
import { coinBagHarborTip, coinBagIslandTip } from "./story/coinBagBuddy";
import { loadIslandsContent } from "./content/loader";
import { canOpenSignatureCinema } from "./signatureCinemaGate";

describe("tutorial craft-100 — Title → Cast", () => {
  it("title tagline names Ashore before Carpet", () => {
    const src = readFileSync(join(__dirname, "views/CapitalOpeningIntro.tsx"), "utf8");
    expect(src).toMatch(/Ashore|Walk · Talk/i);
    expect(src).toMatch(/opening-choose-voyager/);
  });

  it("cast Continue lands Ashore Teach (not instant Carpet)", () => {
    const src = readFileSync(join(__dirname, "views/BootCastSelect.tsx"), "utf8");
    expect(src).toMatch(/Continue to Ashore Teach/);
    expect(src).toMatch(/boot-board-carpet-now/);
  });
});

describe("tutorial craft-100 — Harbor first meet", () => {
  it("mutes Castle coach on meet_guide", () => {
    expect(shouldShowCastleCoach({ guidedStepId: "meet_guide" })).toBe(false);
    expect(shouldShowCastleCoach({ guidedStepId: "to_dock" })).toBe(true);
  });

  it("Coin Bag meet tip is walk-first (not Talk ambush)", () => {
    const tip = coinBagHarborTip({ version: 1, step: "meet_guide" });
    expect(`${tip.tip} ${tip.coach ?? ""}`).toMatch(/walk|waving|fountain/i);
    expect(tip.tip).not.toMatch(/^Talk to Piggy/i);
  });
});

describe("tutorial craft-100 — Cove Take", () => {
  it("save_or_spend requires Kira only (Alma optional)", () => {
    const cove = loadIslandsContent().islands.find((i) => i.id === "coincraft_cove");
    const q = cove?.quests.find((x) => x.id === "q_cc_save_or_spend");
    const talks = (q?.objectives ?? []).filter((o) => o.type === "talkToNpc");
    expect(talks.map((o) => (o.type === "talkToNpc" ? o.npcId : ""))).toEqual([
      "npc_keeper_kira",
    ]);
  });

  it("provenance drops Coin Hold jargon", () => {
    const cove = loadIslandsContent().islands.find((i) => i.id === "coincraft_cove");
    const goals = cove?.provenance?.learning_objectives?.join(" ") ?? "";
    expect(goals).not.toMatch(/Coin Hold/);
    expect(goals).toMatch(/Take|jar|Harbor remembers/i);
  });

  it("post-First-Coins bag tip names lighthouse twist", () => {
    const tip = coinBagIslandTip(
      {
        version: "1",
        updatedAt: new Date().toISOString(),
        inventory: ["cc_coin_pouch"],
        questStatus: {
          q_cc_first_coins: { started: true, completed: true, completedObjectives: [] },
          q_cc_save_or_spend: {
            started: true,
            completed: false,
            completedObjectives: [],
          },
        },
        completedMinigames: ["mg_coin_sort"],
        discovered: { npcs: [], items: [], areas: [], islands: [] },
      },
      { id: "coincraft_cove", name: "Coincraft Cove" } as never,
    );
    expect(`${tip.tip} ${tip.coach ?? ""}`).toMatch(/Kira|Lighthouse|twist|remember/i);
  });
});

describe("tutorial craft-100 — Harbor remembers", () => {
  it("unshown scar opens cinema even if voyage coach unfinished", () => {
    expect(
      canOpenSignatureCinema({
        plazaReady: true,
        guidedComplete: false,
        unshownScar: true,
      }),
    ).toBe(true);
  });

  it("cold retell requires sawSpectacle and map board (not enterIsland-only)", () => {
    const script = readFileSync(join(__dirname, "../../scripts/cold-ashore-cove-retell.mjs"), "utf8");
    expect(script).toMatch(/sawSpectacle === true/);
    expect(script).toMatch(/island-pin-coincraft_cove/);
    expect(script).toMatch(/hub-travel-map/);
    expect(script).not.toMatch(/enterIsland\("coincraft_cove"\)/);
  });
});

describe("tutorial craft-100 — Ashore first-meet cold asserts", () => {
  it("full-teach asserts presence, muted coach, no ambush Talk", () => {
    const script = readFileSync(join(__dirname, "../../scripts/cold-ashore-full-teach.mjs"), "utf8");
    expect(script).toMatch(/harbor-piggy-presence/);
    expect(script).toMatch(/castle-grounds-coach/);
    expect(script).toMatch(/hub-talk-npc/);
  });
});
