import { describe, expect, it } from "vitest";
import {
  BOARD_MONEY_CARPET,
  CAPITAL_BRAND,
  DOCUMENT_TITLE,
  ENTER_HARBOR_HAVEN,
  FORTUNE_ARCHIPELAGO_NAME,
  HARBOR_LOADING_HINT,
  LEAVE_ARCHIPELAGO,
  MONEY_IS_ALIVE,
  SHARE_CARD_HEADLINE,
  SPECTACLE_FOOTER,
  arriveEyebrow,
  capitalOrganEyebrow,
  carpetApproachBadge,
  softBeatEyebrow,
  spineShortName,
  structureEnterCta,
  titleStructureExitLabel,
  titleStructureReturnLabel,
} from "./titleVoice";
import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";

describe("titleVoice", () => {
  it("keeps Capital brand and Fortune world distinct", () => {
    expect(CAPITAL_BRAND).toBe("Capital");
    expect(FORTUNE_ARCHIPELAGO_NAME).toBe("Fortune Archipelago");
    expect(MONEY_IS_ALIVE).toMatch(/Money is alive/);
    expect(BOARD_MONEY_CARPET).toBe("Board the Money Carpet");
    expect(DOCUMENT_TITLE).toMatch(/Capital/);
    expect(DOCUMENT_TITLE).toMatch(/Fortune Archipelago/);
  });

  it("names spine places in short chips", () => {
    expect(spineShortName(HARBOR_HAVEN_ID)).toBe("Harbor");
    expect(spineShortName(COVE_ISLAND_ID)).toBe("Cove");
    expect(spineShortName(PAYCHECK_PENINSULA_ID)).toBe("Paycheck");
    expect(spineShortName(CREDIT_KINGDOM_ID)).toBe("Credit");
  });

  it("uses Capital · organ on arrive / Soft Beat, never World opening", () => {
    expect(arriveEyebrow(COVE_ISLAND_ID, "carpet_land")).toBe(FORTUNE_ARCHIPELAGO_NAME);
    expect(arriveEyebrow(HARBOR_HAVEN_ID, "carpet_land")).toBe("Capital · Harbor");
    expect(arriveEyebrow(COVE_ISLAND_ID, "structure_enter")).toBe("Capital · Coin");
    expect(arriveEyebrow(PAYCHECK_PENINSULA_ID, "structure_enter")).toBe("Capital · Clock");
    expect(arriveEyebrow(CREDIT_KINGDOM_ID, "structure_enter")).toBe("Capital · Spiral");
    expect(arriveEyebrow(HARBOR_HAVEN_ID, "structure_enter")).toBe("Capital · Memory");
    expect(capitalOrganEyebrow("coin")).toBe("Capital · Coin");
    expect(softBeatEyebrow("clock")).toBe("Quiet · Clock");
    expect(arriveEyebrow(COVE_ISLAND_ID, "structure_enter")).not.toMatch(/machine|World opening/i);
  });

  it("speaks diegetic structure exits and carpet CTAs", () => {
    expect(titleStructureExitLabel("jar")).toMatch(/coin slot/i);
    expect(titleStructureExitLabel("bank")).toMatch(/vault/i);
    expect(titleStructureReturnLabel("tower")).toMatch(/Clock/);
    expect(structureEnterCta("Squeeze through the coin slot", "Jar")).toMatch(/Squeeze/);
    expect(ENTER_HARBOR_HAVEN).toMatch(/Harbor Haven/);
    expect(HARBOR_LOADING_HINT).toMatch(/Harbor Haven|plaza is waking/i);
    expect(LEAVE_ARCHIPELAGO).toMatch(/Fortune Archipelago/);
    expect(SHARE_CARD_HEADLINE).toMatch(/Capital/);
    expect(SPECTACLE_FOOTER).toMatch(/Money is alive/);
    expect(carpetApproachBadge("Coincraft Cove", "1990s").eyebrow).toMatch(/Approaching/);
  });
});
