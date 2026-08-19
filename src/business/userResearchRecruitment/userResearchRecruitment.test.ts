import { describe, expect, it } from "vitest";
import {
  ALLOWED_SCREENER_FIELDS,
  FORBIDDEN_SCREENER_FIELDS,
  INITIAL_STOP_GATE,
  RECRUITMENT_CANDIDATES,
  RESEARCH_ROUNDS,
  assertNoAutoContact,
  candidatesForSegment,
  lockAfterCohort,
  p0Rounds,
  unlockNextCohort,
} from "./store";

describe("userResearchRecruitment", () => {
  it("never enables automatic contact", () => {
    expect(() => assertNoAutoContact()).not.toThrow();
    expect(RESEARCH_ROUNDS.every((r) => r.autoContact === false)).toBe(true);
    expect(INITIAL_STOP_GATE.nextCohortAutoStart).toBe(false);
    expect(INITIAL_STOP_GATE.agentContactsSent).toBe(0);
  });

  it("starts from discovery P0 segments S1 and S2", () => {
    const p0 = p0Rounds();
    expect(p0.map((r) => r.id).sort()).toEqual(["A", "B"]);
    expect(p0.map((r) => r.segmentId).sort()).toEqual([
      "S1_families_6_11",
      "S2_homeschool",
    ]);
  });

  it("locks after cohort and requires human unlock", () => {
    const locked = lockAfterCohort("A1");
    expect(locked.status).toBe("LOCKED");
    expect(locked.nextCohortAutoStart).toBe(false);
    expect(() => unlockNextCohort("B1", "")).toThrow(/Human reviewer/);
    const unlocked = unlockNextCohort("B1", "human_reviewer");
    expect(unlocked.status).toBe("UNLOCKED");
    expect(unlocked.activeCohort).toBe("B1");
  });

  it("keeps screener fields privacy-minimal", () => {
    expect(FORBIDDEN_SCREENER_FIELDS).toContain("child_legal_name");
    expect(FORBIDDEN_SCREENER_FIELDS).toContain("ssn");
    expect(ALLOWED_SCREENER_FIELDS).toContain("preferred_name_or_alias");
    expect(ALLOWED_SCREENER_FIELDS).not.toContain("income");
  });

  it("has recruitment candidates for S1 and S2 with public contact methods", () => {
    expect(candidatesForSegment("S1_families_6_11").length).toBeGreaterThan(2);
    expect(candidatesForSegment("S2_homeschool").length).toBeGreaterThan(0);
    expect(
      RECRUITMENT_CANDIDATES.every((c) => c.publicContactMethod.length > 0),
    ).toBe(true);
  });

  it("first cohort is small (A = 4), not a giant study", () => {
    const a = RESEARCH_ROUNDS.find((r) => r.id === "A")!;
    expect(a.targetCompletesPerCohort).toBeLessThanOrEqual(4);
    expect(
      RESEARCH_ROUNDS.every((r) => r.targetCompletesPerCohort <= 4),
    ).toBe(true);
  });
});
