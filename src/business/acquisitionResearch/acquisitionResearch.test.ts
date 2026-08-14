import { describe, expect, it } from "vitest";
import {
  CHANNELS,
  FIRST_LEARNING_EXPERIMENTS,
  assertNoPaidInFirstLearning,
  canScale,
  channelsByClass,
  firstLearningChannelIds,
} from "./store";

describe("acquisitionResearch", () => {
  it("maps multiple channel classes without leading with paid", () => {
    expect(channelsByClass("MANUAL_EARLY").length).toBeGreaterThan(0);
    expect(channelsByClass("PARTNERSHIP").length).toBeGreaterThan(0);
    expect(channelsByClass("PAID_SCALABLE").some((c) => c.paidFirstForbidden)).toBe(
      true,
    );
  });

  it("recommends exactly 3 first learning experiments — all cheap, none paid", () => {
    expect(FIRST_LEARNING_EXPERIMENTS).toHaveLength(3);
    expect(() => assertNoPaidInFirstLearning()).not.toThrow();
    expect(FIRST_LEARNING_EXPERIMENTS.every((e) => e.scaleAllowed === false)).toBe(
      true,
    );
    expect(firstLearningChannelIds()).toContain("reddit_parents");
    expect(firstLearningChannelIds()).toContain("library_cu_family");
  });

  it("blocks scale until arrive + activate + retain + WTP", () => {
    expect(
      canScale({
        arrive: true,
        activate: true,
        retain: true,
        willingnessToPay: false,
      }),
    ).toBe(false);
    expect(
      canScale({
        arrive: true,
        activate: true,
        retain: true,
        willingnessToPay: true,
      }),
    ).toBe(true);
  });

  it("includes product-led share and parks paid social", () => {
    expect(CHANNELS.some((c) => c.id === "share_png_plinth")).toBe(true);
    const paid = CHANNELS.find((c) => c.id === "paid_social")!;
    expect(paid.class).toBe("PAID_SCALABLE");
    expect(paid.paidFirstForbidden).toBe(true);
  });
});
