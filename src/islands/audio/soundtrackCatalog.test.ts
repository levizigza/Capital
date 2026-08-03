import { describe, expect, it } from "vitest";
import {
  cueForIsland,
  cueForPlace,
  gainScaleForPlace,
  SOUNDTRACK,
} from "./soundtrackCatalog";

describe("Capital soundtrack catalog", () => {
  it("has a file for every cue", () => {
    for (const track of Object.values(SOUNDTRACK)) {
      expect(track.file).toMatch(/^audio\/soundtrack\/.+\.ogg$/);
      expect(track.title.length).toBeGreaterThan(3);
      expect(track.mood.length).toBeGreaterThan(8);
    }
  });

  it("maps genre cities to distinct emotional cues", () => {
    expect(cueForIsland("harbor_haven")).toBe("harbor_haven");
    expect(cueForIsland("coincraft_cove")).toBe("solarpunk_cove");
    expect(cueForIsland("venture_foundry")).toBe("neon_sprawl");
    expect(cueForIsland("credit_kingdom")).toBe("credit_ruins");
    expect(cueForIsland("intangibles")).toBe("nocturne_void");
    expect(cueForIsland("business_assets")).toBe("orbital_keep");
    expect(cueForIsland("unknown_island", "cyberpunk")).toBe("neon_sprawl");
  });

  it("resolves place kinds for hub / map / talk / opening", () => {
    expect(cueForPlace({ kind: "harbor" })).toBe("harbor_haven");
    expect(cueForPlace({ kind: "map" })).toBe("archipelago_map");
    expect(cueForPlace({ kind: "voyage" })).toBe("voyage_carpet");
    expect(cueForPlace({ kind: "opening" })).toBe("voyage_carpet");
    expect(cueForPlace({ kind: "talk" })).toBe("talk_soft");
    expect(cueForPlace({ kind: "silence" })).toBeNull();
    expect(cueForPlace({ kind: "shore", islandId: "digital_assets" })).toBe("ai_undercity");
  });

  it("maps Money Structure organs to ducked beds", () => {
    expect(cueForPlace({ kind: "structure", organ: "memory" })).toBe("harbor_haven");
    expect(cueForPlace({ kind: "structure", organ: "coin" })).toBe("solarpunk_cove");
    expect(cueForPlace({ kind: "structure", organ: "clock" })).toBe("ai_undercity");
    expect(cueForPlace({ kind: "structure", organ: "spiral" })).toBe("credit_ruins");
    expect(gainScaleForPlace({ kind: "structure", organ: "coin" })).toBeLessThan(1);
    expect(gainScaleForPlace({ kind: "shore", islandId: "coincraft_cove" })).toBe(1);
  });

  it("Wave 6 — spine titles speak organ language", () => {
    expect(SOUNDTRACK.harbor_haven.title).toMatch(/Memory/i);
    expect(SOUNDTRACK.solarpunk_cove.title).toMatch(/Coin/i);
    expect(SOUNDTRACK.ai_undercity.title).toMatch(/Clock/i);
    expect(SOUNDTRACK.credit_ruins.title).toMatch(/Spiral/i);
    expect(cueForIsland("paycheck_peninsula")).toBe("ai_undercity");
    expect(cueForIsland("coincraft_cove")).toBe("solarpunk_cove");
    expect(cueForIsland("credit_kingdom")).toBe("credit_ruins");
  });

  it("Wave 6 — post-Take shore hush ducks the organ bed", () => {
    const hush = gainScaleForPlace({
      kind: "shore",
      islandId: "coincraft_cove",
      hush: true,
    });
    const open = gainScaleForPlace({ kind: "shore", islandId: "coincraft_cove" });
    expect(hush).toBeLessThan(open);
    expect(hush).toBeLessThan(0.4);
  });

  it("Pillar 11 — Harbor spectacle/share hush ducks Memory bed", () => {
    const hush = gainScaleForPlace({ kind: "harbor", hush: true });
    const open = gainScaleForPlace({ kind: "harbor" });
    expect(hush).toBeLessThan(open);
    expect(hush).toBeLessThan(0.45);
  });
});