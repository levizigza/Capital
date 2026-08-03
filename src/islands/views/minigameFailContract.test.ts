import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Pillar 3 goals/failure contract — miss must surface dignity + retry, same place.
 */
describe("Minigame fail contract", () => {
  const app = readFileSync(join(__dirname, "../IslandsApp.tsx"), "utf8");
  const overlay = readFileSync(join(__dirname, "MinigameFailOverlay.tsx"), "utf8");
  const modular = readFileSync(join(__dirname, "../minigames/ModularMinigame.tsx"), "utf8");

  it("wires a player-facing fail overlay with retry and stay-put", () => {
    expect(app).toMatch(/MinigameFailOverlay/);
    expect(app).toMatch(/setPendingMinigameFail/);
    expect(app).toMatch(/handleMinigameFailRetry/);
    expect(app).toMatch(/Stay put/);
    expect(overlay).toMatch(/data-testid="minigame-fail-overlay"/);
    expect(overlay).toMatch(/data-testid="minigame-fail-retry"/);
    expect(overlay).toMatch(/data-testid="minigame-fail-walk"/);
  });

  it("does not celebrate ModularMinigame rounds before the clear is judged", () => {
    expect(modular).not.toMatch(/Game Complete!/);
    expect(modular).toMatch(/Round over/);
    expect(modular).toMatch(/See result/);
  });

  it("offers Finish round so Coin Sort can leave EarnSpend/ChangeMaking", () => {
    expect(modular).toMatch(/data-testid="minigame-finish-round"/);
    expect(modular).toMatch(/Finish round/);
  });
});
