import { describe, expect, it } from "vitest";
import { SERIES_LEAD_MASCOT_IDS } from "../moneyCast";
import { SF_SELECT_LEAD_COUNT } from "./StreetFighterCoinSelect";

describe("StreetFighterCoinSelect", () => {
  it("shows all twelve series leads on the coin board", () => {
    expect(SF_SELECT_LEAD_COUNT).toBe(12);
    expect(SERIES_LEAD_MASCOT_IDS).toHaveLength(12);
  });
});
