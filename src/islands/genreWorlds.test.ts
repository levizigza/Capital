import { describe, expect, it } from "vitest";
import {
  GENRE_BY_ISLAND,
  GENRE_WORLDS,
  allGenreWorldsPresent,
  getGenreWorld,
  getGenreDistrict,
  genreHudLine,
  genreShoreBlurb,
  textHasForbiddenGenreEcho,
} from "./genreWorlds";

describe("genreWorlds", () => {
  it("covers all seven futures across the archipelago", () => {
    expect(allGenreWorldsPresent()).toBe(true);
    expect(Object.keys(GENRE_WORLDS)).toHaveLength(7);
  });

  it("keeps Harbor as Ordinary World (no genre overlay)", () => {
    expect(getGenreWorld("harbor_haven")).toBeNull();
    expect(getGenreDistrict("harbor_haven")).toBeNull();
    expect(genreHudLine("harbor_haven")).toBeNull();
    expect(GENRE_BY_ISLAND.harbor_haven).toBeUndefined();
  });

  it("maps primary chapter islands to distinct genre cities with original canon names", () => {
    expect(getGenreWorld("coincraft_cove")?.canonName).toBe("Verdant Shareholds");
    expect(getGenreWorld("venture_foundry")?.canonName).toBe("Ledgerlight Sprawl");
    expect(getGenreWorld("signal_city")?.canonName).toBe("Helix Harbor");
    expect(getGenreWorld("paycheck_peninsula")?.canonName).toBe("Mindwage Terminal");
    expect(getGenreWorld("intangibles")?.canonName).toBe("Selfstock Archive");
    expect(getGenreWorld("business_assets")?.canonName).toBe("Voidfolio Reach");
    expect(getGenreWorld("credit_kingdom")?.canonName).toBe("Afterledger Wastes");
  });

  it("gives sister islands distinct districts", () => {
    const cove = getGenreDistrict("coincraft_cove");
    const skies = getGenreDistrict("future_shores");
    expect(cove?.districtName).not.toBe(skies?.districtName);
    expect(cove?.genreId).toBe("solarpunk");
    expect(skies?.genreId).toBe("solarpunk");
  });

  it("exposes IP-safe HUD lines using canon + district", () => {
    const line = genreHudLine("venture_foundry");
    expect(line).toMatch(/Ledgerlight/);
    expect(line).toMatch(/Gridlock/);
    expect(textHasForbiddenGenreEcho(line!)).toBe(false);
    expect(textHasForbiddenGenreEcho(genreShoreBlurb("venture_foundry")!)).toBe(false);
  });

  it("flags forbidden franchise echoes for hygiene", () => {
    expect(textHasForbiddenGenreEcho("welcome to Night City")).toBe(true);
    expect(textHasForbiddenGenreEcho("visit Ledgerlight Sprawl")).toBe(false);
  });

  it("lists original signature cast and machines per world", () => {
    for (const world of Object.values(GENRE_WORLDS)) {
      expect(world.signatureCast.length).toBeGreaterThanOrEqual(2);
      expect(world.signatureMachines.length).toBeGreaterThanOrEqual(2);
      expect(world.forbiddenEchoes.length).toBeGreaterThan(0);
    }
  });
});
