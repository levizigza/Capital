import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  COVE_COIN_JAR,
  CREDIT_INTEREST_KEEP,
  HARBOR_LEDGER_BANK,
  PAYCHECK_PAYROLL_TOWER,
} from "../moneyStructures";
import { STRUCTURE_PART_SILHOUETTE_IDS } from "./StructurePartSilhouette";

/**
 * Pillar 10 — art direction: structure interactables silhouette without HUD.
 */
describe("Structure part silhouettes", () => {
  const allParts = [
    ...COVE_COIN_JAR.parts,
    ...HARBOR_LEDGER_BANK.parts,
    ...PAYCHECK_PAYROLL_TOWER.parts,
    ...CREDIT_INTEREST_KEEP.parts,
  ];

  it("covers every live Money Structure part id", () => {
    for (const part of allParts) {
      expect(STRUCTURE_PART_SILHOUETTE_IDS).toContain(part.id);
    }
  });

  it("gives Lid Lookout a screw-top hatch (not a flat cyan disc)", () => {
    const src = readFileSync(join(__dirname, "StructurePartSilhouette.tsx"), "utf8");
    expect(src).toMatch(/LidLookoutSilhouette/);
    expect(src).toMatch(/lid_lookout/);
    // Flat-disc fallback must not be the Lid Lookout branch
    const lidBlock = src.slice(src.indexOf("lid_lookout"), src.indexOf("cork_vault"));
    expect(lidBlock).toMatch(/LidLookoutSilhouette/);
    expect(lidBlock).not.toMatch(/cylinderGeometry args=\{\[0\.85, 0\.85, 0\.25/);
  });

  it("wires Soft Beat pads with a lookout beacon in the interior", () => {
    const interior = readFileSync(join(__dirname, "MoneyStructureInteriorView.tsx"), "utf8");
    expect(interior).toMatch(/SoftBeatBeacon/);
    expect(interior).toMatch(/organVerbChip/);
    expect(interior).toMatch(/Crown orb/);
    expect(interior).toMatch(/StructurePartSilhouette/);
    expect(interior).toMatch(/SafeText/);
    expect(interior).not.toMatch(/from "@react-three\/drei".*Text|,\s*Text\s*}/);
    for (const part of allParts.filter((p) => p.softBeat)) {
      expect(STRUCTURE_PART_SILHOUETTE_IDS).toContain(part.id);
    }
  });

  it("keeps Soft Beat toys distinct from arcade pads", () => {
    const soft = allParts.filter((p) => p.softBeat).map((p) => p.id);
    expect(soft).toEqual(
      expect.arrayContaining(["lid_lookout", "teller_window", "umbrella_loft", "score_battlement"]),
    );
  });
});
