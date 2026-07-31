/**
 * Targeted carpet voyages — short guaranteed rail to the chosen island.
 * Free flight (no target) stays open-horizon; map/Cove picks must never get stuck.
 */

export const CARPET_ARRIVE_RADIUS = 16;
/** Start this far from the target so the hop reads as a ride, not a teleport. */
export const RAIL_START_DISTANCE = 52;
/** Hard failsafe — land even if frames stall. */
export const RAIL_MAX_MS = 11_000;
/** Cruise speed on rails (world units / sec). */
export const RAIL_SPEED = 160;

export type RailPose = {
  x: number;
  z: number;
  y: number;
  heading: number;
};

/** Place the carpet on a short approach vector aimed at the target. */
export function railStartPose(
  targetX: number,
  targetZ: number,
  startDistance = RAIL_START_DISTANCE,
): RailPose {
  const len = Math.hypot(targetX, targetZ) || 1;
  const ux = targetX / len;
  const uz = targetZ / len;
  const dist = Math.max(CARPET_ARRIVE_RADIUS + 8, startDistance);
  return {
    x: targetX - ux * dist,
    z: targetZ - uz * dist,
    y: 4.2,
    heading: Math.atan2(ux, uz),
  };
}

export function distance2d(ax: number, az: number, bx: number, bz: number): number {
  return Math.hypot(ax - bx, az - bz);
}

export function isWithinArrive(
  x: number,
  z: number,
  targetX: number,
  targetZ: number,
  radius = CARPET_ARRIVE_RADIUS,
): boolean {
  return distance2d(x, z, targetX, targetZ) < radius;
}

/** True when the voyage has a concrete destination (map / guided Cove). */
export function isRailVoyage(voyageTargetId: string | null | undefined): boolean {
  return Boolean(voyageTargetId);
}

/**
 * Seconds of pure rush needed from a rail start — used by tests / HUD copy.
 * Must stay under ~12s at RAIL_SPEED from RAIL_START_DISTANCE.
 */
export function railEtaSeconds(
  startDistance = RAIL_START_DISTANCE,
  speed = RAIL_SPEED,
): number {
  const travel = Math.max(0, startDistance - CARPET_ARRIVE_RADIUS * 0.35);
  return travel / Math.max(1, speed);
}
