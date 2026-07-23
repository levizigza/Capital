/**
 * WorldBlackboard — shared memory beyond a single NPC agent.
 * Directors (coach, atmosphere, soft-lock) read/write here.
 * Mirrors Unity Behavior BlackboardVariable sharing across graphs.
 */

import { Blackboard } from "../npcBehavior/blackboard";
import type { EcosystemMotionMode } from "../islandCulture";
import type { SkyMode } from "../world3d/ledgerlight";

export const WB = {
  place: "WorldPlace",
  islandId: "IslandId",
  ecosystemMotion: "EcosystemMotion",
  ecosystemIntensity: "EcosystemIntensity",
  skyIntent: "SkyIntent",
  coachTip: "CoachTip",
  coachCoach: "CoachLine",
  softlockRisk: "SoftlockRisk",
  playerIdleSec: "PlayerIdleSeconds",
  adaptiveFocus: "AdaptiveFocus",
  cashflow: "NetCashflow",
  failPressure: "FailPressure",
} as const;

export type AdaptiveFocus =
  | "none"
  | "cashflow"
  | "resilience"
  | "discipline"
  | "foresight"
  | "stuck"
  | "explore";

/** Session-wide world memory */
export const worldBlackboard = new Blackboard();

export function syncWorldPlace(opts: {
  place: string;
  islandId?: string | null;
  ecosystemMotion?: EcosystemMotionMode | null;
}): void {
  worldBlackboard.set(WB.place, opts.place);
  if (opts.islandId != null) worldBlackboard.set(WB.islandId, opts.islandId);
  if (opts.ecosystemMotion) {
    worldBlackboard.set(WB.ecosystemMotion, opts.ecosystemMotion);
    // Intensity drives subtle roam radius elsewhere; static worlds stay calm
    const intensity =
      opts.ecosystemMotion === "dynamic" ? 1 : opts.ecosystemMotion === "mixed" ? 0.55 : 0.15;
    worldBlackboard.set(WB.ecosystemIntensity, intensity);
  }
}

export function setSkyIntent(mode: SkyMode | null): void {
  worldBlackboard.set(WB.skyIntent, mode);
}

export function getSkyIntent(): SkyMode | null {
  return worldBlackboard.get<SkyMode | null>(WB.skyIntent) ?? null;
}
