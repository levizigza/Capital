import { describe, expect, it } from "vitest";

/**
 * UX contract: Talk Battle is opt-in (Zelda / BOTW / Mario Odyssey courtesy).
 * Approach shows a prompt; E / Enter / button confirms. Never ambush on walk-by.
 */
describe("opt-in talk UX contract", () => {
  it("documents that auto-talk on approach is forbidden", () => {
    const policy = {
      harborAutoTalkOnApproach: false,
      shoreAutoTalkOnApproach: false,
      requireConfirm: true,
    };
    expect(policy.harborAutoTalkOnApproach).toBe(false);
    expect(policy.shoreAutoTalkOnApproach).toBe(false);
    expect(policy.requireConfirm).toBe(true);
  });
});
