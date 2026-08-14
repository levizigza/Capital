import { describe, expect, it } from "vitest";
import {
  BIBLE_RUNTIME_LAWS,
  BOARD_STAR_LABEL,
  DESIGN_BIBLE_SHIP_QUESTION,
  softBeatScarVistaLine,
} from "./designBible";

describe("designBible runtime laws", () => {
  it("keeps the ship question as the constitution closer", () => {
    expect(DESIGN_BIBLE_SHIP_QUESTION).toMatch(/interesting player story/i);
  });

  it("encodes player-visible bible laws as on", () => {
    expect(BIBLE_RUNTIME_LAWS.hideIslandsXpChrome).toBe(true);
    expect(BIBLE_RUNTIME_LAWS.hideSkillStatsPanel).toBe(true);
    expect(BIBLE_RUNTIME_LAWS.demoteSideMagnetsUntilCoveChange).toBe(true);
    expect(BIBLE_RUNTIME_LAWS.partyPrizeIsBoardStar).toBe(true);
    expect(BIBLE_RUNTIME_LAWS.localFamilyChallengeAndWitness).toBe(true);
  });

  it("names party prizes Board Star — not Freedom / Ledger Seal", () => {
    expect(BOARD_STAR_LABEL).toBe("Board Star");
    expect(BOARD_STAR_LABEL.toLowerCase()).not.toContain("freedom");
    expect(BOARD_STAR_LABEL.toLowerCase()).not.toContain("ledger seal");
  });

  it("softBeatScarVistaLine deepens hold vs spend on Coin lookout", () => {
    const hold = softBeatScarVistaLine("lookout", "Kept coins in the jar");
    const spend = softBeatScarVistaLine("lookout", "Spent glitter at the stall");
    expect(hold).toMatch(/kept|weight|jar/i);
    expect(spend).toMatch(/lighter|glitter|spent/i);
    expect(hold).not.toEqual(spend);
  });

  it("returns null without a scar label", () => {
    expect(softBeatScarVistaLine("ledger", null)).toBeNull();
  });
});
