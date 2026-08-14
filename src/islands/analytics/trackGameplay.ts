/**
 * Typed gameplay telemetry helpers — scrubbed, id-only payloads.
 */

import { analytics } from "../analytics";
import type { AnalyticsEventName } from "../types";
import { getElapsedMs } from "./session";
import type {
  AbandonReason,
  CoreLoopPhase,
  DecisionDomain,
  FeatureId,
  LocationKind,
  LocationOutcome,
  ProgressionMilestoneId,
  ResourceId,
  ResourceReason,
  StrategyDomain,
  SystemId,
} from "./schemas";

function track(name: AnalyticsEventName, payload: Record<string, unknown>): void {
  void analytics.track(name, payload);
}

let coreLoopIndex = 0;
let heartbeatTick = 0;

export function resetGameplayTelemetryCounters(): void {
  coreLoopIndex = 0;
  heartbeatTick = 0;
}

export function trackSessionHeartbeat(visible: boolean): void {
  heartbeatTick += 1;
  track("session_heartbeat", { tick: heartbeatTick, visible });
}

export function trackCoreLoopCycle(opts: {
  phase: CoreLoopPhase;
  islandId?: string;
  refId?: string;
  bumpIndex?: boolean;
}): void {
  if (opts.bumpIndex) coreLoopIndex += 1;
  track("core_loop_cycle", {
    phase: opts.phase,
    islandId: opts.islandId,
    refId: opts.refId,
    cycleIndex: coreLoopIndex,
  });
}

export function trackLocationOutcome(opts: {
  locationKind: LocationKind;
  locationId: string;
  outcome: LocationOutcome;
  islandId?: string;
  durationMs?: number;
}): void {
  track("location_outcome", { ...opts });
}

export function trackResourceDelta(opts: {
  resource: ResourceId;
  delta: number;
  reason: ResourceReason;
  balanceAfter?: number;
  islandId?: string;
}): void {
  if (opts.delta === 0) return;
  track("resource_delta", { ...opts });
}

export function trackStrategySelected(opts: {
  domain: StrategyDomain;
  strategyId: string;
  contextId?: string;
  islandId?: string;
}): void {
  track("strategy_selected", { ...opts });
}

export function trackFeatureUsed(opts: {
  feature: FeatureId;
  action?: "open" | "close" | "peek" | "claim" | "share";
  islandId?: string;
}): void {
  track("feature_used", { ...opts });
}

export function trackAbandonPoint(opts: {
  surface: string;
  reason: AbandonReason;
  islandId?: string;
  featureId?: FeatureId;
}): void {
  track("abandon_point", {
    ...opts,
    elapsedMsAtAbandon: getElapsedMs(),
  });
}

export function trackProgressionMilestone(opts: {
  milestone: ProgressionMilestoneId;
  islandId?: string;
  questId?: string;
}): void {
  track("progression_milestone", { ...opts });
}

export function trackDecisionMade(opts: {
  domain: DecisionDomain;
  decisionId: string;
  contextId?: string;
  islandId?: string;
}): void {
  track("decision_made", { ...opts });
}

export function trackRetryAttempt(opts: {
  context: "minigame" | "quest" | "dialogue" | "other";
  targetId: string;
  attempt: number;
  islandId?: string;
}): void {
  track("retry_attempt", { ...opts });
}

export function trackSystemInteracted(opts: {
  system: SystemId;
  action?: string;
  refId?: string;
  islandId?: string;
}): void {
  track("system_interacted", { ...opts });
}
