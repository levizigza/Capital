import { describe, expect, it } from "vitest";
import {
  COMPANION_PRICES,
  STARTER_COMPANION_ID,
  companionPrice,
  ownsCompanion,
  applyCompanionPurchase,
  grantStarterCompanion,
} from "./harborShop";
import type { IslandSaveV1 } from "./types";

function emptySave(): IslandSaveV1 {
  return {
    version: 1,
    currentIslandId: "harbor_haven",
    inventory: [],
    completedQuestIds: [],
    activeQuestIds: [],
    npcFlags: {},
    areaFlags: {},
    dialogueFlags: {},
    minigameScores: {},
  } as unknown as IslandSaveV1;
}

describe("starter companion", () => {
  it("prices Slow Coin free", () => {
    expect(STARTER_COMPANION_ID).toBe("tortoise");
    expect(companionPrice("tortoise")).toBe(0);
    expect(COMPANION_PRICES.tortoise).toBe(0);
  });

  it("treats starter as owned even before purchase list", () => {
    expect(ownsCompanion(emptySave(), "tortoise")).toBe(true);
    expect(ownsCompanion(emptySave(), "finch")).toBe(false);
  });

  it("grants starter into ownedCompanions", () => {
    const next = grantStarterCompanion(emptySave());
    expect(next.harborShop?.ownedCompanions).toContain("tortoise");
  });

  it("keeps starter when buying a paid pet", () => {
    const next = applyCompanionPurchase(emptySave(), "otter");
    expect(next.harborShop?.ownedCompanions).toEqual(
      expect.arrayContaining(["otter", "tortoise"]),
    );
  });
});
