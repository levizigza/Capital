import { v4 as uuidv4 } from "uuid";

import type { AnalyticsEvent, AnalyticsEventName } from "./types";

import { MAX_ANALYTICS_EVENTS, ANALYTICS_KV_KEY } from "./analytics/export";
import { getOrStartSession, sessionContext } from "./analytics/session";

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

export class AnalyticsClient {
  private sinks: AnalyticsSink[];

  constructor(sinks: AnalyticsSink[]) {
    this.sinks = sinks;
  }

  async track(name: AnalyticsEventName, payload?: Record<string, unknown>): Promise<void> {
    getOrStartSession();
    const event: AnalyticsEvent = {
      id: uuidv4(),
      ts: new Date().toISOString(),
      name,
      payload: {
        ...sessionContext(),
        ...payload,
      },
    };

    await Promise.allSettled(this.sinks.map((s) => s.emit(event)));
  }
}

export const analytics = new AnalyticsClient([new ConsoleAndKVSink()]);
