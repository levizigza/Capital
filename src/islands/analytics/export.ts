import type { AnalyticsEvent } from "../types";

import type { FunnelAnalysis } from "./funnel";
import { analyzeFunnel } from "./funnel";
import { analyzeFtueMetrics, type FtueMetricsSnapshot } from "./ftue";
import { analyzeHealthDashboard, type HealthDashboardSnapshot } from "./healthDashboard";

export const ANALYTICS_KV_KEY = "island_analytics_v1";
export const MAX_ANALYTICS_EVENTS = 2_000;

export async function loadAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  try {
    const data = await window.spark.kv.get<AnalyticsEvent[]>(ANALYTICS_KV_KEY);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function clearAnalyticsEvents(): Promise<void> {
  try {
    await window.spark.kv.set(ANALYTICS_KV_KEY, []);
  } catch {
    /* ignore */
  }
}

export function eventsToCsv(events: AnalyticsEvent[]): string {
  const headers = ["id", "ts", "name", "sessionId", "elapsedMs", "screen", "payload"];
  const rows = events.map((e) => [
    e.id,
    e.ts,
    e.name,
    String(e.payload?.sessionId ?? ""),
    String(e.payload?.elapsedMs ?? ""),
    String(e.payload?.screen ?? ""),
    JSON.stringify(e.payload ?? {}),
  ]);
  return [headers.join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\n");
}

function csvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function eventsToJson(
  events: AnalyticsEvent[],
  analysis: FunnelAnalysis,
  ftue?: FtueMetricsSnapshot,
  health?: HealthDashboardSnapshot,
): string {
  const healthSnap = health ?? analyzeHealthDashboard(events);
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      eventCount: events.length,
      healthDashboard: {
        law: healthSnap.law,
        flags: healthSnap.flags,
        engagement: healthSnap.engagement,
        learning: healthSnap.learning,
        business: healthSnap.business,
      },
      /** Primary FTUE KPIs — tutorial completion is secondary only. */
      ftueMetrics: ftue ?? analyzeFtueMetrics(events),
      primarySuccessNote:
        "Never use tutorial completion as the primary measure of success. Never optimize one category (engagement / learning / business) while ignoring damage to another. King learning KPI: independent_transfer_rate.",
      funnel: analysis,
      events,
    },
    null,
    2,
  );
}

export function downloadText(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAnalyticsCsv(): Promise<void> {
  const events = await loadAnalyticsEvents();
  downloadText(eventsToCsv(events), `islands-analytics-${dateStamp()}.csv`, "text/csv");
}

export async function exportAnalyticsJson(): Promise<void> {
  const events = await loadAnalyticsEvents();
  const analysis = analyzeFunnel(events);
  const ftue = analyzeFtueMetrics(events);
  const health = analyzeHealthDashboard(events);
  downloadText(
    eventsToJson(events, analysis, ftue, health),
    `islands-analytics-${dateStamp()}.json`,
    "application/json",
  );
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}
