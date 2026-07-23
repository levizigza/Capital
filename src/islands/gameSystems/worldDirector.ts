/**
 * WorldDirector — Unity Behavior–style priority stack for the whole game,
 * not just NPC locomotion.
 *
 * Priority (TryInOrder analogue):
 *   1. Soft-lock nudge when idle too long
 *   2. Adaptive coach focus from player signals
 *   3. Atmosphere intent from ecosystem + calm/stress
 *
 * Honest offline heuristics — no fake neural nets.
 */

import { gameEvents } from "./eventChannel";
import { WB, worldBlackboard, type AdaptiveFocus, setSkyIntent } from "./worldBlackboard";
import type { EcosystemMotionMode } from "../islandCulture";
import type { SkyMode } from "../world3d/ledgerlight";

export type DirectorSignals = {
  idleSeconds: number;
  failPressure: number;
  cashflow: number;
  lowestSkill: AdaptiveFocus;
  ecosystemMotion?: EcosystemMotionMode | null;
  guidedActive?: boolean;
};

export type DirectorDecision = {
  softlockNudge: string | null;
  adaptiveFocus: AdaptiveFocus;
  skyIntent: SkyMode | null;
};

const IDLE_SOFTLOCK_SEC = 45;

/**
 * Pure director tick — call from React when save/context changes or on a timer.
 */
export function tickWorldDirector(signals: DirectorSignals): DirectorDecision {
  worldBlackboard.set(WB.playerIdleSec, signals.idleSeconds);
  worldBlackboard.set(WB.failPressure, signals.failPressure);
  worldBlackboard.set(WB.cashflow, signals.cashflow);

  // 1) Soft-lock — highest priority when player is stuck exploring nowhere
  let softlockNudge: string | null = null;
  if (!signals.guidedActive && signals.idleSeconds >= IDLE_SOFTLOCK_SEC) {
    softlockNudge =
      signals.failPressure >= 2
        ? "Coin Bag: try the glowing pad, or open the map (M)."
        : "Coin Bag: walk toward a door, local, or the dock — I’ll point.";
    worldBlackboard.set(WB.softlockRisk, true);
    gameEvents.emit("softlock.nudge", { reason: softlockNudge });
  } else {
    worldBlackboard.set(WB.softlockRisk, false);
  }

  // 2) Adaptive focus — skill / cashflow / stuck pressure
  let adaptiveFocus: AdaptiveFocus = "none";
  if (signals.failPressure >= 2) adaptiveFocus = "stuck";
  else if (signals.cashflow < 10) adaptiveFocus = "cashflow";
  else if (signals.lowestSkill !== "none") adaptiveFocus = signals.lowestSkill;
  else if (signals.idleSeconds > 20) adaptiveFocus = "explore";
  worldBlackboard.set(WB.adaptiveFocus, adaptiveFocus);

  // 3) Atmosphere intent — calm static worlds stay put; stress prefers clearer day light
  let skyIntent: SkyMode | null = null;
  if (signals.ecosystemMotion === "static") {
    skyIntent = null; // respect authored still skies (void ruins, archives)
  } else if (signals.failPressure >= 2) {
    skyIntent = "day"; // readability when struggling
  } else if (signals.idleSeconds > 30 && signals.ecosystemMotion === "mixed") {
    skyIntent = "sunset"; // gentle linger mood
  }
  setSkyIntent(skyIntent);

  return { softlockNudge, adaptiveFocus, skyIntent };
}

/** Lowest skill among resilience/discipline/foresight → AdaptiveFocus */
export function lowestSkillFocus(stats: {
  resilience: number;
  discipline: number;
  foresight: number;
}): AdaptiveFocus {
  const entries: Array<[AdaptiveFocus, number]> = [
    ["resilience", stats.resilience],
    ["discipline", stats.discipline],
    ["foresight", stats.foresight],
  ];
  entries.sort((a, b) => a[1] - b[1]);
  const [id, val] = entries[0]!;
  // Only nudge if clearly lagging
  return val < 25 ? id : "none";
}
