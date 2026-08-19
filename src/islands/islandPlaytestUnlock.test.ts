import { describe, expect, it } from "vitest";
import { loadIslandsContent } from "./content/loader";
import { getIslandTheme } from "./themes/islandThemes";
import { buildShoreHotspots } from "./islandShoreLayout";
import { ARCHIPELAGO_MAP_TRAVEL_IDS } from "./spineArchipelago";
import { listRegisteredMinigameComponents } from "./minigames/registry";
import {
  isIslandProgressLocked,
  PLAYTEST_UNLOCK_ALL_ISLANDS,
} from "./progressGates";
import { createDefaultIslandSave } from "./save";
import { voyagerForIslandStyle, BASE_VOYAGER } from "./character";
import { partyDashIdForIsland } from "./partyPlayStyle";

describe("map islands — fleshed, distinct, production gates", () => {
  it("keeps PLAYTEST_UNLOCK_ALL_ISLANDS off for production ship", () => {
    expect(PLAYTEST_UNLOCK_ALL_ISLANDS).toBe(false);
  });

  it("locks Credit and side shores with an empty save when playtest unlock is off", () => {
    const save = createDefaultIslandSave();
    const content = loadIslandsContent();
    const credit = content.islands.find((i) => i.id === "credit_kingdom")!;
    const side = content.islands.find((i) => i.id === "signal_city")!;
    const paycheck = content.islands.find((i) => i.id === "paycheck_peninsula")!;
    expect(isIslandProgressLocked(paycheck, save)).toBe(true);
    expect(isIslandProgressLocked(credit, save)).toBe(true);
    expect(isIslandProgressLocked(side, save)).toBe(true);
  });

  it("gives each map island a distinct theme + era lens + shore play pads", () => {
    const content = loadIslandsContent();
    const registered = new Set(listRegisteredMinigameComponents());
    const eras = new Set<string>();
    const accents = new Set<string>();

    for (const id of ARCHIPELAGO_MAP_TRAVEL_IDS) {
      const island = content.islands.find((i) => i.id === id)!;
      const theme = getIslandTheme(island.id, island.themeId);
      expect(theme.id).not.toBe("default");
      eras.add(theme.animationStyle);
      accents.add(theme.accent);

      const pads = buildShoreHotspots(island).filter((h) => h.kind === "play_pad");
      expect(pads.length, `${id} play pads`).toBeGreaterThan(0);

      const games = island.minigames ?? [];
      expect(games.length, `${id} minigames`).toBeGreaterThan(0);
      for (const mg of games) {
        expect(registered.has(mg.componentId), `${id} ${mg.id} → ${mg.componentId}`).toBe(true);
      }

      expect(
        pads.some(
          (p) =>
            p.minigameId &&
            (games.some((g) => g.id === p.minigameId) ||
              p.minigameId === partyDashIdForIsland(id)),
        ),
      ).toBe(true);
    }

    expect(accents.size).toBeGreaterThan(5);
    expect(eras.size).toBeGreaterThan(4);
  });

  it("remaps Voyager gear when landing on an era shore", () => {
    const home = voyagerForIslandStyle(BASE_VOYAGER, "capital-default");
    expect(home.accessory).toBe(BASE_VOYAGER.accessory);

    const neon = voyagerForIslandStyle(BASE_VOYAGER, "era-1980s");
    expect(neon.accessory).toBe("cape");
    expect(neon.accessory).not.toBe(home.accessory);

    const vector = voyagerForIslandStyle(BASE_VOYAGER, "era-1960s");
    expect(vector.accessory).toBe("goggles");
    expect(vector.accessory).not.toBe(neon.accessory);
  });
});
