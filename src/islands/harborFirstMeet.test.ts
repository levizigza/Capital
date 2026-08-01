import { describe, expect, it } from "vitest";
import {
  harborFallbackMode,
  isFirstMeetStep,
  isPiggyPresenceBeat,
  isQuietHomecoming,
  mythFallbackActions,
  resolvePulseHotspotId,
} from "./harborFirstMeet";

describe("harbor first meet (Wave 1)", () => {
  it("recognizes meet_guide as the first-meet step", () => {
    expect(isFirstMeetStep("meet_guide")).toBe(true);
    expect(isFirstMeetStep("to_dock")).toBe(false);
    expect(isFirstMeetStep(null)).toBe(false);
  });

  it("keeps guide pulse so Piggy’s ring can light", () => {
    expect(resolvePulseHotspotId("guide")).toBe("guide");
    expect(resolvePulseHotspotId("outfitter")).toBe("outfitter");
    expect(resolvePulseHotspotId(undefined)).toBeNull();
  });

  it("picks myth fallback modes instead of a dashboard", () => {
    expect(harborFallbackMode({ firstMeet: true, castleActive: true })).toBe("myth_meet");
    expect(harborFallbackMode({ firstMeet: false, castleActive: true })).toBe("myth_travel");
    expect(harborFallbackMode({ firstMeet: false, castleActive: false })).toBe("utility");
    expect(
      harborFallbackMode({ firstMeet: false, castleActive: false, quietHomecoming: true }),
    ).toBe("myth_meet");
  });

  it("myth_meet only offers Talk — no carpet/bank detour", () => {
    expect(mythFallbackActions("myth_meet")).toEqual({
      talkPiggy: true,
      carpet: false,
      bank: false,
    });
  });

  it("treats quiet homecoming as the same Piggy presence beat", () => {
    expect(isQuietHomecoming({ needsPiggyWelcome: true, quietPending: true })).toBe(true);
    expect(isQuietHomecoming({ needsPiggyWelcome: true, quietPending: false })).toBe(false);
    expect(isPiggyPresenceBeat({ firstMeet: true })).toBe(true);
    expect(isPiggyPresenceBeat({ quietHomecoming: true })).toBe(true);
    expect(isPiggyPresenceBeat({})).toBe(false);
  });
});
