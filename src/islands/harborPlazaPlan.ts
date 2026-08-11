/**
 * Harbor Haven civic master plan — building planner law.
 *
 * Fountain is the court center. Facades face the court with doors on an apron
 * OUTSIDE the fountain basin. Pier approach (+Z→−Z) must not put a shop door
 * on-axis through the fountain (that reads as “water in the doorway”).
 */

import { HARBOR_PIGGY_POS } from "./moneyCast";
import { MEMORY_PLINTH_POSITION } from "./harborIcon";
import { HARBOR_LEDGER_BANK } from "./moneyStructures";

/** Fountain basin + open pavers — no building footprint inside this radius. */
export const HARBOR_FOUNTAIN: [number, number, number] = [0, 0, 0];
export const HARBOR_FOUNTAIN_CLEARANCE = 4.8;

/** Planned civic positions — Bank shorePosition is source of truth in moneyStructures. */
export const HARBOR_PLAZA = {
  bank: HARBOR_LEDGER_BANK.shorePosition,
  outfitter: [-3.6, 0, -9.4] as [number, number, number],
  arcade: [-8.6, 0, -2.8] as [number, number, number],
  carpet: [0, 0, 12.6] as [number, number, number],
  plinth: MEMORY_PLINTH_POSITION,
  notice: [-5.4, 0, 5.6] as [number, number, number],
  piggy: HARBOR_PIGGY_POS,
  market: [12.4, 0, -2.8] as [number, number, number],
  pavilion: [-9.6, 0, -6.4] as [number, number, number],
} as const;

/** Approximate door protrusion along local +Z (stairs / vault / marquee). */
export const LANDMARK_DOOR_PROTRUSION: Record<string, number> = {
  ledger_bank: 1.55,
  outfitter: 0.55,
  arcade: 0.85,
  travel: 1.1,
  memory: 0.35,
  practice: 0.4,
  ritual: 0.4,
};

export type PlazaFacingSlot = {
  id: string;
  position: [number, number, number];
  /** Radians — rotates local +Z (door) toward the court. */
  yaw: number;
};

/** Face the fountain court from a perimeter setback. */
export function plazaFaceYaw(
  position: [number, number, number],
  face: [number, number, number] = HARBOR_FOUNTAIN,
): number {
  const dx = face[0] - position[0];
  const dz = face[2] - position[2];
  return Math.atan2(dx, dz);
}

/** World XZ of the door after planned yaw (local door at +Z protrusion). */
export function doorWorldXZ(
  position: [number, number, number],
  yaw: number,
  protrusion: number,
): [number, number] {
  const x = position[0] + Math.sin(yaw) * protrusion;
  const z = position[2] + Math.cos(yaw) * protrusion;
  return [x, z];
}

function xzDist(ax: number, az: number, bx: number, bz: number): number {
  return Math.hypot(ax - bx, az - bz);
}

/**
 * Master-plan slots for Harbor heroes.
 * Outfitter is intentionally off the pier (−Z) axis so the fountain is not
 * framed in the shop door when you walk from the carpet.
 */
export function harborPlazaSlots(): PlazaFacingSlot[] {
  const {
    bank,
    outfitter,
    arcade,
    carpet,
    plinth,
    notice,
  } = HARBOR_PLAZA;
  return [
    { id: "ledger_bank", position: [...bank], yaw: plazaFaceYaw(bank) },
    { id: "outfitter", position: [...outfitter], yaw: plazaFaceYaw(outfitter) },
    { id: "arcade", position: [...arcade], yaw: plazaFaceYaw(arcade) },
    { id: "travel", position: [...carpet], yaw: plazaFaceYaw(carpet) },
    { id: "memory", position: [...plinth], yaw: plazaFaceYaw(plinth) },
    { id: "practice", position: [...notice], yaw: plazaFaceYaw(notice) },
    { id: "ritual", position: [...notice], yaw: plazaFaceYaw(notice) },
  ];
}

export function plazaSlotById(id: string): PlazaFacingSlot | undefined {
  return harborPlazaSlots().find((s) => s.id === id);
}

/** Resolve yaw for a hotspot — planned slot wins; else face court. */
export function hotspotPlazaYaw(
  id: string,
  position: [number, number, number],
  explicitYaw?: number,
): number {
  if (typeof explicitYaw === "number" && Number.isFinite(explicitYaw)) {
    return explicitYaw;
  }
  const slot = plazaSlotById(id);
  if (slot) return slot.yaw;
  return plazaFaceYaw(position);
}

export function assertPiggyPlazaClear(): string[] {
  const errors: string[] = [];
  const dFountain = xzDist(
    HARBOR_PIGGY_POS[0],
    HARBOR_PIGGY_POS[2],
    HARBOR_FOUNTAIN[0],
    HARBOR_FOUNTAIN[2],
  );
  if (dFountain < 2.6) {
    errors.push(`Piggy too close to fountain (${dFountain.toFixed(2)})`);
  }
  const bank = HARBOR_PLAZA.bank;
  const dBank = xzDist(HARBOR_PIGGY_POS[0], HARBOR_PIGGY_POS[2], bank[0], bank[2]);
  if (dBank < 6) {
    errors.push(`Piggy too close to Ledger Bank (${dBank.toFixed(2)})`);
  }
  return errors;
}

/**
 * Every civic door must sit outside the fountain clearance ring.
 * Also: Outfitter door must not sit on the pier axis (x≈0 through fountain).
 */
export function assertHarborDoorsClearOfFountain(
  slots: PlazaFacingSlot[] = harborPlazaSlots(),
): string[] {
  const errors: string[] = [];
  for (const slot of slots) {
    const protrude = LANDMARK_DOOR_PROTRUSION[slot.id] ?? 0.5;
    const [dx, dz] = doorWorldXZ(slot.position, slot.yaw, protrude);
    const d = xzDist(dx, dz, HARBOR_FOUNTAIN[0], HARBOR_FOUNTAIN[2]);
    if (d < HARBOR_FOUNTAIN_CLEARANCE) {
      errors.push(
        `${slot.id} door at (${dx.toFixed(2)}, ${dz.toFixed(2)}) is inside fountain court (d=${d.toFixed(2)} < ${HARBOR_FOUNTAIN_CLEARANCE})`,
      );
    }
    const footprint = xzDist(
      slot.position[0],
      slot.position[2],
      HARBOR_FOUNTAIN[0],
      HARBOR_FOUNTAIN[2],
    );
    if (footprint < HARBOR_FOUNTAIN_CLEARANCE) {
      errors.push(
        `${slot.id} footprint inside fountain court (d=${footprint.toFixed(2)})`,
      );
    }
  }

  const outfitter = slots.find((s) => s.id === "outfitter");
  if (outfitter && Math.abs(outfitter.position[0]) < 2.4) {
    errors.push(
      `outfitter on pier→fountain axis (x=${outfitter.position[0].toFixed(2)}) — fountain will read inside the door`,
    );
  }
  return errors;
}
