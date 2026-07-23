import { describe, expect, it } from "vitest";
import {
  GENRE_BY_ISLAND,
  GENRE_WORLDS,
  allGenreWorldsPresent,
  getGenreWorld,
  genreHudLine,
} from "./genreWorlds";

describe("genreWorlds", () => {
  it("covers all seven futures across the archipelago", () => {
    expect(allGenreWorldsPresent()).toBe(true);
    expect(Object.keys(GENRE_WORLDS)).toHaveLength(7);
  });

  it("keeps Harbor as Ordinary World (no genre overlay)", () => {
    expect(getGenreWorld("harbor_haven")).toBeNull();
    expect(genreHudLine("harbor_haven")).toBeNull();
    expect(GENRE_BY_ISLAND.harbor_haven).toBeUndefined();
  });

  it("maps primary chapter islands to distinct genre cities", () => {
    expect(getGenreWorld("coincraft_cove")?.id).toBe("solarpunk");
    expect(getGenreWorld("venture_foundry")?.id).toBe("cyberpunk");
    expect(getGenreWorld("signal_city")?.id).toBe("biopunk");
    expect(getGenreWorld("paycheck_peninsula")?.id).toBe("ai_future");
    expect(getGenreWorld("intangibles")?.id).toBe("posthuman");
    expect(getGenreWorld("business_assets")?.id).toBe("spacefaring");
    expect(getGenreWorld("credit_kingdom")?.id).toBe("post_apocalyptic");
  });

  it("exposes city labels for HUD", () => {
    const line = genreHudLine("venture_foundry");
    expect(line).toMatch(/Cyberpunk/);
    expect(line).toMatch(/Neon/);
  });
});
