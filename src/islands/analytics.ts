import { v4 as uuidv4 } from "uuid";

import type { AnalyticsEvent, AnalyticsEventName } from "./types";

import { MAX_ANALYTICS_EVENTS, ANALYTICS_KV_KEY } from "./analytics/export";
import { getOrStartSession, sessionContext } from "./analytics/session";
import { ftueExperimentAnalyticsContext } from "./ftueExperiments";
import { FTUE_EVENT_NAMES } from "./analytics/ftue/types";

export interface AnalyticsSink {
  emit: (event: AnalyticsEvent) => void | Promise<void>;
}

export class ConsoleAndKVSink implements AnalyticsSink {
  private readonly kvKey: string;

  constructor(kvKey = ANALYTICS_KV_KEY) {
    this.kvKey = kvKey;
  }

  async emit(event: AnalyticsEvent): Promise<void> {
    try {
      console.info("[islands][analytics]", event.name, event.payload || {});
    } catch {
      // ignore
    }

    try {
      const existing = (await window.spark.kv.get<AnalyticsEvent[]>(this.kvKey)) || [];
      const next = [...existing, event].slice(-MAX_ANALYTICS_EVENTS);
      await window.spark.kv.set(this.kvKey, next);
    } catch (e) {
      console.warn("[islands][analytics] failed to write to KV", e);
    }
  }
}

const FTUE_EVENT_SET = new Set<string>(FTUE_EVENT_NAMES);

/** Onboarding-adjacent events that must carry exact ftue_version. */
const FTUE_RELEVANT_EVENTS = new Set<string>([
  ...FTUE_EVENT_NAMES,
  "session_started",
  "session_ended",
  "session_end",
  "tutorial_started",
  "tutorial_completed",
  "tutorial_step",
  "ftue_step_started",
  "ftue_step_completed",
  "ftue_step_retry",
  "ftue_abandoned",
  "ftue_skipped",
  "ftue_completed",
  "core_loop_first_success",
  "onboarding_completed",
  "hint_escalated",
  "concept_transfer",
  "core_loop_beat",
  "soft_beat_armed",
  "take_foreshadow",
  "player_onboarding_mode",
  "quest_started",
  "quest_completed",
  "quest_failed_attempt",
  "minigame_started",
  "minigame_completed",
  "minigame_retry",
  "fail_reason",
  "dialogue_started",
  "dialogue_choice",
  "island_entered",
  "screen_enter",
  "screen_exit",
]);

function shouldStampFtueVersion(name: string): boolean {
  return FTUE_RELEVANT_EVENTS.has(name) || FTUE_EVENT_SET.has(name);
}

export class AnalyticsClient {
  private sinks: AnalyticsSink[];

  constructor(sinks: AnalyticsSink[]) {
    this.sinks = sinks;
  }

  async track(name: AnalyticsEventName, payload?: Record<string, unknown>): Promise<void> {
    getOrStartSession();
    const ftueStamp = shouldStampFtueVersion(name) ? ftueExperimentAnalyticsContext() : {};
    const event: AnalyticsEvent = {
      id: uuidv4(),
      ts: new Date().toISOString(),
      name,
      payload: {
        ...sessionContext(),
        ...ftueStamp,
        ...payload,
      },
    };

    await Promise.allSettled(this.sinks.map((s) => s.emit(event)));
  }
}

export const analytics = new AnalyticsClient([new ConsoleAndKVSink()]);
