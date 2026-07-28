import { describe, expect, it } from "vitest";
import {
  createDefaultHubGuidedIntro,
  advanceHubGuided,
} from "./hubGuidedIntro";
import { resolveHarborVisualBeats, SCAR_SPECTACLE_VISUAL_BEATS } from "./dialogueActionSync";
import { coinBagHarborTip } from "./coinBagBuddy";
import { piggyHomecomingGraph } from "./harborTalks";

describe("iconic craft — first 20 min path", () => {
  it("skips optional practice after capsule visit (trailer critical path)", () => {
    let g = createDefaultHubGuidedIntro();
    for (const ev of [
      "talked_guide",
      "near_outfitter",
      "saved_outfitter",
    ] as const) {
      g = advanceHubGuided(g, ev);
    }
    expect(g.step).toBe("tiny_spend");
    g = advanceHubGuided(g, "capsule_visit");
    expect(g.step).toBe("to_dock");
  });
});

describe("iconic craft — scar spectacle beats", () => {
  it("elevates Harbor visuals when spectacle is active", () => {
    const beats = resolveHarborVisualBeats({ scarSpectacleActive: true });
    expect(beats).toEqual(SCAR_SPECTACLE_VISUAL_BEATS);
    expect(beats.keeperEmote).toBe("cheer");
    expect(beats.bagTip.toLowerCase()).toMatch(/plaza|remember/);
  });
});

describe("iconic craft — Piggy / Coin Bag bond", () => {
  it("strains when scars outpace homecomings", () => {
    const tip = coinBagHarborTip(null, { bondStrain: true });
    expect(tip.tip.toLowerCase()).toMatch(/quiet|care/);
    expect(tip.coach.toLowerCase()).toMatch(/repair|plaque/);
  });

  it("deepens homecoming dialogue by bondBeat", () => {
    const first = piggyHomecomingGraph("You earned coins.", { bondBeat: 1, scars: [] });
    const third = piggyHomecomingGraph("You earned coins.", {
      bondBeat: 3,
      scars: [{ label: "Cove scar", islandId: "spendys_cove" }],
    });
    const strain = piggyHomecomingGraph("Hard flight home.", {
      bondBeat: 0,
      scars: [
        { label: "A", islandId: "spendys_cove" },
        { label: "B", islandId: "paycheck_peninsula" },
      ],
    });
    expect(first.nodes.some((n) => /Change beat|patched|proud/i.test(n.text))).toBe(true);
    expect(third.nodes.some((n) => /Three homecomings|family|trust/i.test(n.text))).toBe(true);
    expect(strain.nodes.some((n) => /worried|harder mark/i.test(n.text))).toBe(true);
  });
});
