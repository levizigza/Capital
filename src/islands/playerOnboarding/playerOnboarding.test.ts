import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { createDefaultIslandSave } from "../save";
import { BASE_VOYAGER } from "../character";
import { HARBOR_HAVEN_ID } from "../islandIds";
import { loadIslandsContent } from "../content/loader";
import {
  detectPlayerOnboardingMode,
  isReturningAfterAbsence,
  shouldShowReturningBriefing,
  shouldSkipFtueBoot,
  shouldSkipAshoreTeachOnBoot,
  isTutorialShellComplete,
  isConceptMastered,
  applyExperiencedBootstrap,
  buildReturningBriefing,
  getActiveGuidanceForPlayer,
  shouldShowCastleCoachForPlayer,
  RETURNING_ABSENCE_MS,
} from "./index";
import { applyConceptSync } from "../conceptProgression";

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe("player onboarding modes", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("performance", { timeOrigin: 12345 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects new player on empty save", () => {
    const save = createDefaultIslandSave();
    expect(detectPlayerOnboardingMode(save)).toBe("new");
    expect(shouldSkipFtueBoot(save)).toBe(false);
    expect(shouldSkipAshoreTeachOnBoot(save)).toBe(false);
  });

  it("detects experienced from declared mode", () => {
    const save = {
      ...createDefaultIslandSave(),
      playerOnboarding: { version: 1 as const, declaredMode: "experienced" as const },
    };
    expect(detectPlayerOnboardingMode(save)).toBe("experienced");
    expect(shouldSkipFtueBoot(save)).toBe(false);
    expect(shouldSkipAshoreTeachOnBoot(save)).toBe(false);
  });

  it("detects returning after absence and still plays Ashore Teach", () => {
    const save = {
      ...createDefaultIslandSave(),
      onboardingComplete: true,
      character: BASE_VOYAGER,
      playerOnboarding: {
        version: 1 as const,
        lastActiveAt: daysAgo(4),
      },
      discovered: { npcs: [], items: [], areas: [], islands: [HARBOR_HAVEN_ID] },
    };
    expect(isReturningAfterAbsence(save)).toBe(true);
    expect(detectPlayerOnboardingMode(save)).toBe("returning");
    expect(shouldSkipFtueBoot(save)).toBe(false);
    expect(shouldSkipAshoreTeachOnBoot(save)).toBe(false);
  });

  it("keeps title, Street Fighter cast, and Ashore Teach on a finished-save reload", () => {
    const save = {
      ...createDefaultIslandSave(),
      onboardingComplete: true,
      character: BASE_VOYAGER,
    };
    expect(shouldSkipFtueBoot(save)).toBe(false);
    expect(shouldSkipAshoreTeachOnBoot(save)).toBe(false);
  });

  it("does not treat same-day reload as returning", () => {
    const save = {
      ...createDefaultIslandSave(),
      onboardingComplete: true,
      character: BASE_VOYAGER,
      playerOnboarding: {
        version: 1 as const,
        lastActiveAt: new Date().toISOString(),
      },
      discovered: { npcs: [], items: [], areas: [], islands: [HARBOR_HAVEN_ID] },
    };
    expect(detectPlayerOnboardingMode(save)).toBe("new");
    expect(shouldShowReturningBriefing(save)).toBe(false);
  });

  it("separates tutorial shell from concept mastery", () => {
    let save = {
      ...createDefaultIslandSave(),
      onboardingComplete: true,
    };
    expect(isTutorialShellComplete(save)).toBe(true);
    expect(isConceptMastered(save, "earn_then_decide")).toBe(false);

    save = applyConceptSync({
      ...save,
      questStatus: {
        q_cc_first_coins: {
          started: true,
          completed: true,
          completedObjectives: [],
        },
      },
      discovered: {
        npcs: [],
        items: [],
        areas: [],
        islands: [HARBOR_HAVEN_ID, "coincraft_cove"],
      },
      hubGuidedIntro: {
        version: 1,
        step: "done",
        didMeetGuide: true,
        didDock: true,
      },
    });
    expect(isConceptMastered(save, "earn_then_decide")).toBe(false);
  });

  it("experienced bootstrap marks shell without forcing mastery", () => {
    const save = applyExperiencedBootstrap(createDefaultIslandSave());
    expect(save.onboardingComplete).toBe(true);
    expect(save.playerOnboarding?.declaredMode).toBe("experienced");
    expect(isConceptMastered(save, "money_is_alive")).toBe(false);
  });

  it("builds returning briefing sections", () => {
    const content = loadIslandsContent();
    const save = {
      ...createDefaultIslandSave(),
      onboardingComplete: true,
      character: { ...BASE_VOYAGER, name: "Test Voyager" },
      currentIslandId: HARBOR_HAVEN_ID,
      playerOnboarding: { version: 1 as const, lastActiveAt: daysAgo(5) },
    };
    const briefing = buildReturningBriefing(save, content);
    expect(briefing.sections.some((s) => s.id === "situation")).toBe(true);
    expect(briefing.sections.some((s) => s.id === "objectives")).toBe(true);
    expect(briefing.sections.some((s) => s.id === "financial")).toBe(true);
    expect(briefing.refreshers.length).toBeGreaterThan(0);
  });

  it("reduces guidance for experienced; returning still gets Harbor coach", () => {
    expect(
      shouldShowCastleCoachForPlayer("experienced", { guidedStepId: "meet_guide" }),
    ).toBe(false);
    expect(
      shouldShowCastleCoachForPlayer("returning", { guidedStepId: "meet_guide" }),
    ).toBe(true);
    expect(
      shouldShowCastleCoachForPlayer("new", { guidedStepId: "meet_guide" }),
    ).toBe(true);
    expect(getActiveGuidanceForPlayer(createDefaultIslandSave(), "returning")).toEqual([]);
  });

  it("uses 72h absence threshold constant", () => {
    expect(RETURNING_ABSENCE_MS).toBe(72 * 60 * 60 * 1000);
  });
});
