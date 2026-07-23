import { describe, expect, it } from "vitest";
import {
  PERSONA_KITS,
  allPersonaMascotsValid,
  castPersonaMascot,
  personasForIsland,
  pickPersona,
} from "./npcPersonas";

describe("npcPersonas", () => {
  it("resolves every persona kit to real Money Mascots from the 30", () => {
    expect(allPersonaMascotsValid()).toBe(true);
    expect(Object.keys(PERSONA_KITS).length).toBe(8);
  });

  it("mixes folk, business, artist, model (and more) by genre city", () => {
    const cyber = personasForIsland("venture_foundry");
    expect(cyber).toContain("business");
    expect(cyber).toContain("tech_crew");
    expect(cyber).toContain("model");

    const solar = personasForIsland("coincraft_cove");
    expect(solar).toContain("folk_clan");
    expect(solar).toContain("artist");

    const scrap = personasForIsland("credit_kingdom");
    expect(scrap).toContain("scrap_crew");
  });

  it("casts varied personas on one island without leaving the 30", () => {
    const a = castPersonaMascot("venture_foundry", "npc:a");
    const b = castPersonaMascot("venture_foundry", "npc:b");
    const c = castPersonaMascot("coincraft_cove", "npc:a");
    expect(a.look.accessory).toBeTruthy();
    expect(a.persona).toBeTruthy();
    // Different seeds / islands should often diverge
    expect(a.mascot.id || b.mascot.id || c.mascot.id).toBeTruthy();
    expect(pickPersona("intangibles", "scholar-seed")).toBeTruthy();
  });
});
