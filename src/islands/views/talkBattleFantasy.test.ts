import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Pillar 1 fantasy contract — Talk Battle must feel like living money, not combat.
 */
describe("Talk Battle fantasy contract", () => {
  const src = readFileSync(join(__dirname, "TalkBattleScreen.tsx"), "utf8");

  it("does not ship fake HP / combat meter chrome", () => {
    expect(src).not.toMatch(/rounded-full bg-\[#2dd4bf\]/);
    expect(src).not.toMatch(/w-\[88%\]/);
    expect(src).not.toMatch(/Ready to listen/);
  });

  it("paints a place stage and Capital title voice", () => {
    expect(src).toMatch(/stageSky/);
    expect(src).toMatch(/CAPITAL_BRAND/);
    expect(src).toMatch(/MONEY_IS_ALIVE_HERE/);
    expect(src).toMatch(/Listening among living money/);
    expect(src).toMatch(/data-place/);
  });
});
