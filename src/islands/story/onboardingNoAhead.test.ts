import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ASHORE_LEGACY_GATE_STEPS,
  HUB_GUIDED_STEPS,
  getHubGuidedStep,
  normalizeHubGuidedIntro,
} from "./storyBible";
import { piggyGuidedGraph } from "./harborTalks";
import { coinBagHarborTip } from "./coinBagBuddy";
import { createDefaultHubGuidedIntro } from "./hubGuidedIntro";

/**
 * Pillar 13 + Harbor Ashore — one verb → practice leave → combine at Cove Take.
 * Live UI must not hero-teach Outfitter / Capsule on the first session.
 */
describe("Onboarding — Ashore law (Talk → Carpet → Cove)", () => {
  it("meet_guide Piggy teaches Harbor-as-home · Walk · Talk (not Outfitter / Capsule)", () => {
    const g = piggyGuidedGraph("meet_guide");
    const texts = g.nodes.map((n) => n.text).join(" ");
    expect(texts).toMatch(/Harbor Haven/i);
    expect(texts).toMatch(/WASD|walk pad|\{move\}/i);
    expect(texts).toMatch(/Talk/i);
    expect(texts).toMatch(/plaza that remembers|this is home/i);
    expect(texts).not.toMatch(/Outfitter/i);
    expect(texts).not.toMatch(/Capsule|Carpet Dock|Freedom Seal/i);
    expect(g.nodes.some((n) => (n.choices?.length ?? 0) > 1)).toBe(true);
  });

  it("legacy Outfitter/Capsule steps remap to voyage (never hero-teach Outfitter)", () => {
    for (const id of ASHORE_LEGACY_GATE_STEPS) {
      expect(normalizeHubGuidedIntro({ version: 1, step: id }).step).toBe("to_dock");
      expect(getHubGuidedStep({ version: 1, step: id }).id).toBe("to_dock");
      const g = piggyGuidedGraph(id);
      const texts = g.nodes.map((n) => n.text).join(" ");
      expect(texts).toMatch(/Carpet|map|Cove/i);
      expect(texts).not.toMatch(/Outfitter/i);
    }
  });

  it("live coach table has no Outfitter gate on critical path", () => {
    for (const id of ["meet_guide", "to_dock", "done"] as const) {
      const step = HUB_GUIDED_STEPS.find((s) => s.id === id)!;
      expect(`${step.coach} ${step.guideLine}`).not.toMatch(/Outfitter/i);
    }
    expect(getHubGuidedStep(createDefaultHubGuidedIntro()).highlight).toBe("guide");
    expect(getHubGuidedStep({ version: 1, step: "to_dock" }).highlight).toBe("travel");
  });

  it("Coin Bag meet_guide tip only points at Piggy", () => {
    const tip = coinBagHarborTip(createDefaultHubGuidedIntro());
    expect(tip.tip).toMatch(/Piggy/i);
    expect(`${tip.tip} ${tip.coach ?? ""}`).not.toMatch(/I'm Coin Bag|Outfitter|Capsule/i);
  });

  it("voyage tip names Carpet · Cove (practice leave)", () => {
    const tip = coinBagHarborTip({ version: 1, step: "to_dock" });
    expect(`${tip.tip} ${tip.coach ?? ""}`).toMatch(/Carpet|Cove/i);
    expect(`${tip.tip} ${tip.coach ?? ""}`).not.toMatch(/Outfitter/i);
  });

  it("to_dock Piggy names first painting + optional outer-ring side quests", () => {
    const g = piggyGuidedGraph("to_dock");
    const texts = g.nodes.map((n) => n.text).join(" ");
    expect(texts).toMatch(/Coincraft Cove/i);
    expect(texts).toMatch(/side quests|outer ring/i);
    expect(texts).toMatch(/Paycheck Peninsula/i);
    expect(texts).not.toMatch(/Outfitter/i);
    expect(texts).not.toMatch(/this is the Take/i);
  });

  it("IslandsApp never mounts Outfitter-card WelcomeOnboarding", () => {
    const src = readFileSync(join(__dirname, "../IslandsApp.tsx"), "utf8");
    expect(src).not.toMatch(/<WelcomeOnboarding/);
    expect(src).not.toMatch(/from ["'].*WelcomeOnboarding["']/);
    expect(src).toMatch(/Ashore law|ashore_land|Outfitter-card/);
  });
});
