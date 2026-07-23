import { describe, expect, it } from "vitest";
import { MAIN_COURSE, SIDE_TOMFOOLERY, nextMainCourseStep, usesCourseWorld } from "./mainCourse";
import { createDefaultIslandSave } from "./save";

describe("mainCourse", () => {
  it("keeps side tomfoolery off the critical path", () => {
    expect(MAIN_COURSE.every((s) => s.track === "main")).toBe(true);
    expect(SIDE_TOMFOOLERY.every((s) => s.track === "side")).toBe(true);
    expect(SIDE_TOMFOOLERY.some((s) => s.id === "party_plaza")).toBe(true);
  });

  it("points new saves at Harbor Castle Grounds first", () => {
    const save = createDefaultIslandSave();
    const next = nextMainCourseStep(save);
    expect(next?.id).toBe("harbor_grounds");
  });

  it("marks painting arenas as course worlds", () => {
    expect(usesCourseWorld("PartyArenaMinigame")).toBe(true);
    expect(usesCourseWorld("CoinCatcherMinigame")).toBe(true);
    expect(usesCourseWorld("BudgetSplitterGame")).toBe(false);
  });
});
