import { describe, expect, it } from "vitest";
import { HARBOR_PIGGY_POS } from "./moneyCast";
import { HARBOR_LEDGER_BANK } from "./moneyStructures";
import { MEMORY_PLINTH_POSITION } from "./harborIcon";
import {
  HARBOR_FOUNTAIN,
  HARBOR_FOUNTAIN_CLEARANCE,
  HARBOR_PLAZA,
  assertHarborDoorsClearOfFountain,
  assertPiggyPlazaClear,
  doorWorldXZ,
  harborPlazaSlots,
  plazaFaceYaw,
} from "./harborPlazaPlan";

function xzDist(a: [number, number, number], b: [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[2] - b[2]);
}

describe("Harbor plaza master plan", () => {
  it("keeps every civic door outside the fountain court", () => {
    expect(assertHarborDoorsClearOfFountain()).toEqual([]);
  });

  it("keeps Piggy clear of fountain water and Bank door", () => {
    expect(assertPiggyPlazaClear()).toEqual([]);
    expect(xzDist(HARBOR_PIGGY_POS, HARBOR_FOUNTAIN)).toBeGreaterThan(2.5);
    expect(xzDist(HARBOR_PIGGY_POS, HARBOR_LEDGER_BANK.shorePosition)).toBeGreaterThan(6);
  });

  it("places Memory Plinth on the SE civic corner, not the Bank door", () => {
    expect(xzDist(MEMORY_PLINTH_POSITION, HARBOR_FOUNTAIN)).toBeGreaterThan(
      HARBOR_FOUNTAIN_CLEARANCE,
    );
    expect(
      xzDist(MEMORY_PLINTH_POSITION, HARBOR_LEDGER_BANK.shorePosition),
    ).toBeGreaterThan(4);
    expect(MEMORY_PLINTH_POSITION[2]).toBeGreaterThan(3);
  });

  it("keeps Outfitter off the pier→fountain axis so water is not in the door", () => {
    expect(Math.abs(HARBOR_PLAZA.outfitter[0])).toBeGreaterThanOrEqual(2.4);
    const slot = harborPlazaSlots().find((s) => s.id === "outfitter")!;
    const [dx] = doorWorldXZ(slot.position, slot.yaw, 0.55);
    expect(Math.abs(dx)).toBeGreaterThan(2);
  });

  it("wires Ledger Bank shore to the east commercial slot", () => {
    expect(HARBOR_LEDGER_BANK.shorePosition).toEqual(HARBOR_PLAZA.bank);
    const yaw = plazaFaceYaw(HARBOR_PLAZA.bank);
    const [dx, dz] = doorWorldXZ(HARBOR_PLAZA.bank, yaw, 1.55);
    expect(Math.hypot(dx, dz)).toBeGreaterThan(HARBOR_FOUNTAIN_CLEARANCE);
  });
});
