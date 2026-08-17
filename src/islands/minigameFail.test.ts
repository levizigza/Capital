import { describe, expect, it } from "vitest";
import {
  minigameFailCopy,
  resolveMinigameFailReason,
  resolveTakeFailFlavor,
} from "./minigameFail";

describe("minigameFail — Pillar 3 dignity contract", () => {
  it("labels threshold misses separately from objective misses", () => {
    expect(
      resolveMinigameFailReason({ reportedSuccess: true, meetsThreshold: false }),
    ).toBe("score_below_threshold");
    expect(
      resolveMinigameFailReason({ reportedSuccess: false, meetsThreshold: true }),
    ).toBe("objective_not_met");
  });

  it("names the score goal and keeps the player in place after lose", () => {
    const copy = minigameFailCopy({
      reason: "score_below_threshold",
      minigameName: "Coin Sort",
      score: 12,
      scoreThreshold: 35,
      source: "structure",
    });
    expect(copy.title.toLowerCase()).toMatch(/try again|not a clear/);
    expect(copy.body.toLowerCase()).toMatch(/no shame|still teach/);
    expect(copy.hint).toMatch(/12/);
    expect(copy.hint).toMatch(/35/);
    expect(copy.walkLabel).toMatch(/structure/i);
    expect(copy.retryLabel).toBe("Retry");
  });

  it("uses board-specific walk label on the Fortune Party path", () => {
    const copy = minigameFailCopy({
      reason: "objective_not_met",
      minigameName: "Inbox Storm",
      source: "board",
    });
    expect(copy.walkLabel).toMatch(/board/i);
  });

  it("gives Spend Takes the same soft-fail dignity as saver (no lecture)", () => {
    expect(
      resolveTakeFailFlavor({
        irreversibleChoices: {
          cove_save_vs_spend: { choiceId: "spend" },
        },
      }),
    ).toBe("spend");
    expect(
      resolveTakeFailFlavor({
        irreversibleChoices: {
          credit_borrow_vs_wait: { choiceId: "borrow" },
        },
      }),
    ).toBe("spend");
    const spend = minigameFailCopy({
      reason: "objective_not_met",
      minigameName: "Coin Catcher",
      takeFlavor: "spend",
    });
    const save = minigameFailCopy({
      reason: "objective_not_met",
      minigameName: "Coin Catcher",
      takeFlavor: "save",
    });
    expect(spend.title).toBe(save.title);
    expect(spend.retryLabel).toBe(save.retryLabel);
    expect(spend.body.toLowerCase()).toMatch(/soft miss|still teach|no shame/);
    expect(spend.body.toLowerCase()).not.toMatch(/should have saved|bad spend|mistake/);
  });

  it("names the living-money organ on spine island fails", () => {
    const copy = minigameFailCopy({
      reason: "score_below_threshold",
      minigameName: "Coin Sort",
      score: 10,
      scoreThreshold: 35,
      source: "structure",
      islandId: "coincraft_cove",
    });
    expect(copy.eyebrow).toMatch(/Coin holds/);
    expect(copy.hint).toMatch(/Coin holds/);
  });
});
