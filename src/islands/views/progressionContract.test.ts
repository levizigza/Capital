import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  coldRetellLine,
  nextPaintingAfterScar,
  organVerbChip,
  plaqueShelfLine,
} from "../worldMemory";

/**
 * Pillar 5 — after Cove Take, Harbor must name what is newly true.
 */
describe("Harbor progression contract", () => {
  const cove = {
    id: "cove_saver_plaque",
    islandId: "coincraft_cove",
    label: "Jar before treat",
  };

  it("keeps the suit verb alive from Take into Harbor retell", () => {
    expect(organVerbChip("coin")).toBe("Coin holds");
    expect(coldRetellLine(cove)).toMatch(/Coin holds/);
    expect(plaqueShelfLine(cove)).toMatch(/Coin holds/);
    expect(nextPaintingAfterScar(cove)).toBe("Paycheck Peninsula");
  });

  it("wires share + homecoming to name newly open painting", () => {
    const share = readFileSync(join(__dirname, "HarborFeltShareOverlay.tsx"), "utf8");
    const app = readFileSync(join(__dirname, "../IslandsApp.tsx"), "utf8");
    const recovery = readFileSync(join(__dirname, "../ftueQuestRecovery.ts"), "utf8");
    const homecoming = `${app}\n${recovery}`;
    expect(share).toMatch(/harbor-felt-newly-true/);
    expect(share).toMatch(/harbor-felt-kid-sentence/);
    expect(share).toMatch(/nextPaintingAfterScar/);
    expect(homecoming).toMatch(/newly open on the Carpet/);
    expect(homecoming).toMatch(/The Coin holds — save a little|The Coin holds — Harbor felt your Take/);
  });

  it("names Freedom Seal + carpet tier on the plaza", () => {
    const hub = readFileSync(join(__dirname, "HomeHubView.tsx"), "utf8");
    const bag = readFileSync(join(__dirname, "../story/coinBagBuddy.ts"), "utf8");
    expect(hub).toMatch(/harbor-freedom-chip/);
    expect(hub).toMatch(/freedomPlazaChip/);
    expect(hub).toMatch(/Freedom Seal/);
    expect(bag).toMatch(/carpetTierLabel/);
    expect(bag).toMatch(/Freedom Seal ·/);
  });
});
