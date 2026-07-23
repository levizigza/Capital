import { describe, expect, it } from "vitest";
import { cueForIsland, cueForPlace, SOUNDTRACK } from "./soundtrackCatalog";

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

  it("resolves place kinds for hub / map / talk", () => {
    expect(cueForPlace({ kind: "harbor" })).toBe("harbor_haven");
    expect(cueForPlace({ kind: "map" })).toBe("archipelago_map");
    expect(cueForPlace({ kind: "voyage" })).toBe("voyage_carpet");
    expect(cueForPlace({ kind: "talk" })).toBe("talk_soft");
    expect(cueForPlace({ kind: "silence" })).toBeNull();
    expect(cueForPlace({ kind: "shore", islandId: "digital_assets" })).toBe("ai_undercity");
  });
});
