import { describe, expect, it } from "vitest";
import { HARBOR_PIGGY_POS } from "./moneyCast";
import { HARBOR_LEDGER_BANK } from "./moneyStructures";
import { MEMORY_PLINTH_POSITION } from "./harborIcon";

/** Fountain sits at plaza origin — landmarks must clear the basin court. */
const FOUNTAIN: [number, number, number] = [0, 0, 0];
/** Inner mosaic / walk clearance (~Fountain basin + open pavers). */
const FOUNTAIN_CLEARANCE = 4.5;

function xzDist(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return Math.hypot(dx, dz);
}

describe("Harbor plaza master plan", () => {
  it("keeps Ledger Bank vault door out of the fountain basin", () => {
    const bank = HARBOR_LEDGER_BANK.shorePosition;
    expect(xzDist(bank, FOUNTAIN)).toBeGreaterThan(FOUNTAIN_CLEARANCE);
    // East commercial block — not stacked on origin
    expect(bank[0]).toBeGreaterThan(6);
  });

  it("keeps Piggy clear of fountain water and Bank door", () => {
    expect(xzDist(HARBOR_PIGGY_POS, FOUNTAIN)).toBeGreaterThan(2.5);
    expect(xzDist(HARBOR_PIGGY_POS, HARBOR_LEDGER_BANK.shorePosition)).toBeGreaterThan(6);
  });

  it("places Memory Plinth on the SE civic corner, not the Bank door", () => {
    expect(xzDist(MEMORY_PLINTH_POSITION, FOUNTAIN)).toBeGreaterThan(FOUNTAIN_CLEARANCE);
    expect(xzDist(MEMORY_PLINTH_POSITION, HARBOR_LEDGER_BANK.shorePosition)).toBeGreaterThan(4);
    expect(MEMORY_PLINTH_POSITION[2]).toBeGreaterThan(3);
  });
});
