import { describe, expect, it } from "vitest";
import {
  OUTREACH_DRAFTS,
  assertNeverAutoSend,
  assertNoForbiddenPhrases,
  unsentDrafts,
} from "./store";

describe("founderOutreach", () => {
  it("drafts personalized outreach without auto-send", () => {
    expect(OUTREACH_DRAFTS.length).toBe(10);
    expect(() => assertNeverAutoSend()).not.toThrow();
    expect(unsentDrafts()).toHaveLength(10);
    expect(OUTREACH_DRAFTS.every((d) => d.autoSend === false)).toBe(true);
  });

  it("avoids hype phrases and includes CTA + compliance + follow-up", () => {
    expect(() => assertNoForbiddenPhrases()).not.toThrow();
    for (const d of OUTREACH_DRAFTS) {
      expect(d.cta.length).toBeGreaterThan(5);
      expect(d.complianceFlag).toMatch(/CASL/);
      expect(d.recommendedFollowUpDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(d.reasonForOutreach.length).toBeGreaterThan(10);
      expect(d.messageBody.toLowerCase()).not.toContain("revolutionary");
    }
  });

  it("asks for conversation or testing more than hard sell", () => {
    const soft = OUTREACH_DRAFTS.filter((d) =>
      /conversation|playtest|research|call|interview/i.test(d.cta + d.messageBody),
    );
    expect(soft.length).toBe(OUTREACH_DRAFTS.length);
  });
});
