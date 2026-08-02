import { describe, expect, it } from "vitest";
import { HUB_GUIDED_STEPS } from "./storyBible";
import { piggyGuidedGraph } from "./harborTalks";
import { coinBagHarborTip } from "./coinBagBuddy";
import { createDefaultHubGuidedIntro } from "./hubGuidedIntro";

/**
 * Pillar 13 — onboarding: one concept → practice → combine.
 * Coach / Piggy must not pitch the next verb before this step’s action.
 */
describe("Onboarding — no coach reading ahead", () => {
  it("meet_guide Piggy teaches Walk · Talk only (not Outfitter / Carpet / Cove)", () => {
    const g = piggyGuidedGraph("meet_guide");
    const texts = g.nodes.map((n) => n.text).join(" ");
    expect(texts).toMatch(/Welcome to Harbor Haven/i);
    expect(texts).toMatch(/WASD|walk pad/i);
    expect(texts).toMatch(/Talk/i);
    expect(texts).not.toMatch(/Outfitter/i);
    expect(texts).not.toMatch(/Capsule|Carpet Dock|Coincraft Cove|Freedom Seal/i);
  });

  it("walk_outfitter is the first step that names Outfitter", () => {
    const meet = piggyGuidedGraph("meet_guide")
      .nodes.map((n) => n.text)
      .join(" ");
    const walk = piggyGuidedGraph("walk_outfitter")
      .nodes.map((n) => n.text)
      .join(" ");
    expect(meet).not.toMatch(/Outfitter/i);
    expect(walk).toMatch(/Outfitter/i);
  });

  it("tiny_spend coach stays on Capsule (Carpet / Cove wait for dock)", () => {
    const tiny = HUB_GUIDED_STEPS.find((s) => s.id === "tiny_spend")!;
    expect(tiny.coach).toMatch(/Capsule/i);
    expect(tiny.coach).not.toMatch(/Carpet|Cove|dock/i);
    expect(tiny.guideLine).not.toMatch(/sail|Cove|dock/i);
  });

  it("Coin Bag meet_guide tip only points at Piggy", () => {
    const tip = coinBagHarborTip(createDefaultHubGuidedIntro());
    expect(tip.coach ?? tip.tip).toMatch(/Piggy/i);
    expect(`${tip.tip} ${tip.coach ?? ""}`).not.toMatch(/Outfitter|Capsule|Carpet/i);
  });

  it("each early Castle Grounds coach names only its own verb target", () => {
    const ahead: Record<string, RegExp> = {
      meet_guide: /Outfitter|Capsule|Carpet|Cove|Freedom/i,
      walk_outfitter: /Capsule|Carpet Dock|Coincraft Cove|Freedom/i,
      become_you: /Capsule|Carpet Dock|Coincraft Cove|Freedom/i,
      tiny_spend: /Carpet Dock|Coincraft Cove|Freedom Seal/i,
    };
    for (const [id, banned] of Object.entries(ahead)) {
      const step = HUB_GUIDED_STEPS.find((s) => s.id === id)!;
      expect(`${step.coach} ${step.guideLine}`).not.toMatch(banned);
    }
  });
});
