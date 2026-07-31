/**
 * Merge keyboard + touch walk intent for Harbor / shore.
 * Touch pad writes here; player loops OR keyboard flags each frame.
 */

export type WalkIntent = {
  f: boolean;
  b: boolean;
  l: boolean;
  r: boolean;
};

const empty = (): WalkIntent => ({ f: false, b: false, l: false, r: false });

let touch: WalkIntent = empty();

export function setTouchWalkIntent(next: Partial<WalkIntent>): void {
  touch = { ...touch, ...next };
}

export function clearTouchWalkIntent(): void {
  touch = empty();
}

export function getTouchWalkIntent(): WalkIntent {
  return touch;
}

/** Combine keyboard ref state with active touch pad. */
export function mergeWalkIntent(keys: WalkIntent): WalkIntent {
  const t = touch;
  return {
    f: keys.f || t.f,
    b: keys.b || t.b,
    l: keys.l || t.l,
    r: keys.r || t.r,
  };
}
