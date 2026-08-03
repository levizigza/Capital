/**
 * Harbor WebGL → myth reliability gate (Pillar 14).
 * Continue paints before Canvas; probe; hard myth escape under 3s.
 */

/** Sticky session flag — skip Canvas mount next visit after probe/context loss. */
export const HARBOR_3D_FAIL_KEY = "capital_harbor3d_fail";
export const HARBOR_3D_OK_KEY = "capital_harbor3d_ok";

/** Defer probe until after Enter Harbor / Continue has painted. */
export const HARBOR_DEFER_BEFORE_PROBE_MS = 80;

/** Tear down hung R3F if onCreated never fires. */
export const HARBOR_CANVAS_WATCHDOG_MS = 1_800;

/** Hard myth escape — playable Harbor under iconic ~3s gate. */
export const HARBOR_HARD_FAILSAFE_MS = 2_400;

/** Slow-load hint while still waiting on 3D. */
export const HARBOR_LOAD_HINT_MS = 900;
