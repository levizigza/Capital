/**
 * Walk feel — snappy start, readable stop (Pillar 4 / whole-game craft).
 * Instant zero-velocity on key-up reads as sticky; a short coast sells “I stopped.”
 */

export const WALK_SPEED = 6.5;
export const WALK_BACK_MULT = 0.65;
/** Time constant (s) for velocity decay when no forward input. */
export const WALK_STOP_TAU = 0.1;
/** Below this speed (u/s) we snap to rest so pose becomes stand. */
export const WALK_STOP_EPS = 0.12;

export type WalkVelocity = { x: number; z: number };

/**
 * Integrate walk velocity for one frame.
 * @param forward −1 back · 0 idle · +1 forward (from WASD / pad)
 * @param yaw camera/facing yaw in radians (forward along sin/cos yaw)
 */
export function stepWalkVelocity(
  vel: WalkVelocity,
  opts: { forward: number; yaw: number; dt: number; speed?: number },
): { vel: WalkVelocity; moving: boolean; justStopped: boolean } {
  const speed = opts.speed ?? WALK_SPEED;
  const dt = Math.max(0, opts.dt);
  const wasMoving = Math.hypot(vel.x, vel.z) > WALK_STOP_EPS;

  if (Math.abs(opts.forward) > 0.01) {
    const spd = speed * (opts.forward < 0 ? WALK_BACK_MULT : 1);
    const next = {
      x: Math.sin(opts.yaw) * opts.forward * spd,
      z: Math.cos(opts.yaw) * opts.forward * spd,
    };
    return { vel: next, moving: true, justStopped: false };
  }

  // No input — exponential decay so stop reads, then snap to rest.
  const k = dt <= 0 ? 0 : Math.exp(-dt / WALK_STOP_TAU);
  let x = vel.x * k;
  let z = vel.z * k;
  if (Math.hypot(x, z) < WALK_STOP_EPS) {
    x = 0;
    z = 0;
  }
  const moving = Math.hypot(x, z) > WALK_STOP_EPS;
  return {
    vel: { x, z },
    moving,
    justStopped: wasMoving && !moving,
  };
}
