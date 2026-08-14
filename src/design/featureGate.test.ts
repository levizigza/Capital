import { describe, expect, it } from "vitest";
import {
  emptyCostScores,
  emptyValueScores,
  evaluateFeatureGate,
  isCopycatJustification,
  renderFeatureGateMarkdown,
  type FeatureGateInput,
} from "./featureGate";

function baseInput(over: Partial<FeatureGateInput> = {}): FeatureGateInput {
  return {
    name: "Test feature",
    pitch: "Voyagers peek Soft Beat after a Take",
    justification: "Deepens Cove Take × Soft Beat × organ retell at Harbor",
    systemsTouched: ["Take", "Soft Beat", "organs"],
    value: {
      ...emptyValueScores(3),
      strengthensCoreLoop: 5,
      interactsWithExistingSystems: 5,
      createsMemorableStories: 4,
    },
    cost: {
      ...emptyCostScores(2),
      uiComplexity: 1,
    },
    ...over,
  };
}

describe("featureGate", () => {
  it("rejects copycat justifications", () => {
    expect(isCopycatJustification("Other games have daily streaks")).toBe(true);
    expect(isCopycatJustification("Industry standard inventory grid")).toBe(true);
    expect(
      isCopycatJustification("Soft Beat should name the Cove fork on the lid"),
    ).toBe(false);

    const result = evaluateFeatureGate(
      baseInput({
        justification: "Other games have leaderboards so we should too",
      }),
    );
    expect(result.verdict).toBe("reject");
    expect(result.copycatJustification).toBe(true);
  });

  it("rejects when VALUE SCORE is below COST SCORE", () => {
    const result = evaluateFeatureGate(
      baseInput({
        value: emptyValueScores(1),
        cost: emptyCostScores(4),
        systemsTouched: ["Soft Beat"],
      }),
    );
    expect(result.valueScore).toBeLessThan(result.costScore);
    expect(result.verdict).toBe("reject");
  });

  it("rejects freeze violations", () => {
    const result = evaluateFeatureGate(
      baseInput({
        widensMainQuestBeyondTriangle: true,
        justification: "Add a fifth main island for debt careers",
      }),
    );
    expect(result.verdict).toBe("reject");
    expect(result.freezeViolation).toBe(true);
  });

  it("accepts multi-system Soft Beat deepening", () => {
    const input = baseInput();
    const result = evaluateFeatureGate(input);
    expect(result.valueScore).toBeGreaterThanOrEqual(result.costScore);
    expect(result.multiSystemBonus).toBe(true);
    expect(result.verdict).toBe("accept");
    const md = renderFeatureGateMarkdown(input, result);
    expect(md).toMatch(/VALUE SCORE/);
    expect(md).toMatch(/COST SCORE/);
    expect(md).toMatch(/other games have this/i);
  });

  it("parks thin value even when above cost", () => {
    const result = evaluateFeatureGate(
      baseInput({
        value: emptyValueScores(1),
        cost: emptyCostScores(0),
        systemsTouched: ["plaza"],
        justification: "Slightly brighter Harbor fog tint",
      }),
    );
    expect(result.valueScore).toBe(10);
    expect(result.verdict).toBe("park");
  });

  it("flags accept_with_conditions when systems interaction is weak", () => {
    const result = evaluateFeatureGate(
      baseInput({
        systemsTouched: ["new widget"],
        value: {
          ...emptyValueScores(3),
          interactsWithExistingSystems: 1,
          strengthensCoreLoop: 4,
          strengthensCoreFantasy: 3,
          createsMemorableStories: 3,
        },
        cost: emptyCostScores(1),
        justification: "A Harbor balloon vendor for Voyager delight",
      }),
    );
    expect(result.verdict).toBe("accept_with_conditions");
    expect(result.conditions.some((c) => /≥3 existing systems/i.test(c))).toBe(true);
  });
});
