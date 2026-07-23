import { describe, expect, it } from "vitest";
import {
  BIOME_BY_ISLAND,
  allBiomeIdsUniqueForKnownIslands,
  getIslandBiome,
  getIslandLook3D,
} from "./islandBiomes";
import { getEraLook3D } from "./eraLooks";

describe("islandBiomes", () => {
  it("assigns a unique biome to every known island", () => {
    expect(allBiomeIdsUniqueForKnownIslands()).toBe(true);
    expect(Object.keys(BIOME_BY_ISLAND).length).toBeGreaterThanOrEqual(12);
  });

  it("keeps Harbor meadow exclusive to the hub", () => {
    expect(getIslandBiome("harbor_haven").id).toBe("harbor_meadow");
    expect(getIslandBiome("coincraft_cove").id).not.toBe("harbor_meadow");
  });

  it("makes Cove look different from Harbor", () => {
    const hub = getIslandLook3D("harbor_haven");
    const cove = getIslandLook3D("coincraft_cove");
    expect(cove.land).not.toBe(hub.land);
    expect(cove.sea).not.toBe(hub.sea);
    expect(cove.skyTop).not.toBe(hub.skyTop);
  });

  it("gives arctic / desert / jungle distinct palettes", () => {
    const tundra = getIslandBiome("paycheck_peninsula");
    const desert = getIslandBiome("venture_foundry");
    const jungle = getIslandBiome("credit_kingdom");
    expect(tundra.id).toBe("oscilloscope_tundra");
    expect(desert.id).toBe("synthwave_desert");
    expect(jungle.id).toBe("iron_jungle");
    expect(new Set([tundra.land, desert.land, jungle.land]).size).toBe(3);
  });

  it("preserves era shading while swapping biome geography", () => {
    const era = getEraLook3D("era-1970s");
    const look = getIslandLook3D("signal_city", "era-1970s");
    expect(look.shading).toBe(era.shading);
    expect(look.land).toBe(getIslandBiome("signal_city").land);
  });
});
