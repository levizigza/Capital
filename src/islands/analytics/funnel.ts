import type { AnalyticsEvent } from "../types";

export const FUNNEL_WINDOW_MS = 5 * 60 * 1000;

/** Ordered onboarding funnel stages (first 5 minutes). */
export const FUNNEL_STAGES = [
  { id: "session_started", label: "Session started", event: "session_started" },
  { id: "hub", label: "Home hub", screen: "islands_hub" },
  { id: "travel", label: "Travel map", screen: "islands_travel" },
  { id: "island", label: "Entered island", event: "island_entered" },
  { id: "dialogue", label: "Talked to NPC", event: "dialogue_started" },
  { id: "quest", label: "Quest started", event: "quest_started" },
  { id: "minigame", label: "Minigame started", event: "minigame_started" },
  { id: "minigame_done", label: "Minigame completed", event: "minigame_completed" },
  { id: "tutorial", label: "Tutorial completed", event: "tutorial_completed" },
] as const;

export type FunnelStageId = (typeof FUNNEL_STAGES)[number]["id"];

export type FunnelStageCount = {
  id: FunnelStageId;
  label: string;
  reached: number;
  dropOff: number;
  dropOffPct: number;
  conversionPct: number;
};

export type DropOffPoint = {
  screen: string;
  exits: number;
  avgElapsedMs: number;
  pctOfSessions: number;
};

export type SessionSummary = {
  sessionId: string;
  startedAt: string;
  durationMs: number;
  lastScreen: string | null;
  lastEvent: string | null;
  maxStage: FunnelStageId | null;
  quitWithin5Min: boolean;
  events: AnalyticsEvent[];
};

export type FunnelAnalysis = {
  windowMs: number;
  totalSessions: number;
  sessionsInWindow: number;
  stages: FunnelStageCount[];
  dropOffPoints: DropOffPoint[];
  sessions: SessionSummary[];
};

function eventElapsed(event: AnalyticsEvent): number {
  const ms = event.payload?.elapsedMs;
  return typeof ms === "number" ? ms : 0;
}

function inWindow(event: AnalyticsEvent, windowMs: number): boolean {
  return eventElapsed(event) <= windowMs;
}

function stageReached(
  stage: (typeof FUNNEL_STAGES)[number],
  events: AnalyticsEvent[],
): boolean {
  if ("event" in stage && stage.event) {
    return events.some((e) => e.name === stage.event);
  }
  if ("screen" in stage && stage.screen) {
    return events.some(
      (e) =>
        e.name === "screen_enter" &&
        (e.payload?.screen === stage.screen || String(e.payload?.screen).startsWith(stage.screen)),
    );
  }
  return false;
}

function maxStageReached(events: AnalyticsEvent[]): FunnelStageId | null {
  let max: FunnelStageId | null = null;
  for (const stage of FUNNEL_STAGES) {
    if (stageReached(stage, events)) max = stage.id;
  }
  return max;
}

/** Group events into sessions by sessionId, or fallback single bucket. */
export function groupEventsBySession(events: AnalyticsEvent[]): Map<string, AnalyticsEvent[]> {
  const map = new Map<string, AnalyticsEvent[]>();
  for (const e of events) {
    const sid =
      typeof e.payload?.sessionId === "string" ? e.payload.sessionId : "__legacy__";
    const list = map.get(sid) ?? [];
    list.push(e);
    map.set(sid, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.ts.localeCompare(b.ts));
  }
  return map;
}

export function analyzeFunnel(
  events: AnalyticsEvent[],
  windowMs: number = FUNNEL_WINDOW_MS,
): FunnelAnalysis {
  const bySession = groupEventsBySession(events);
  const sessions: SessionSummary[] = [];

  for (const [sessionId, allEvents] of bySession) {
    const windowEvents = allEvents.filter((e) => inWindow(e, windowMs));
    if (windowEvents.length === 0 && sessionId === "__legacy__") continue;

    const started = allEvents.find((e) => e.name === "session_started") ?? windowEvents[0];
    const last = windowEvents[windowEvents.length - 1] ?? allEvents[allEvents.length - 1];
    const lastExit = [...windowEvents].reverse().find((e) => e.name === "screen_exit");

    sessions.push({
      sessionId,
      startedAt: started?.ts ?? "",
      durationMs: last ? eventElapsed(last) : 0,
      lastScreen:
        (lastExit?.payload?.screen as string) ??
        (last?.payload?.screen as string) ??
        null,
      lastEvent: last?.name ?? null,
      maxStage: maxStageReached(windowEvents),
      quitWithin5Min: Boolean(lastExit || last?.name === "session_ended" || last?.name === "islands_exit"),
      events: windowEvents,
    });
  }

  const inWindowSessions = sessions.filter((s) => s.events.length > 0);
  const total = inWindowSessions.length || 1;

  const stageCounts = FUNNEL_STAGES.map((stage, i) => {
    const reached = inWindowSessions.filter((s) => stageReached(stage, s.events)).length;
    const prevReached =
      i === 0
        ? total
        : inWindowSessions.filter((s) => stageReached(FUNNEL_STAGES[i - 1], s.events)).length || total;
    const dropOff = Math.max(0, prevReached - reached);
    return {
      id: stage.id,
      label: stage.label,
      reached,
      dropOff,
      dropOffPct: prevReached > 0 ? Math.round((dropOff / prevReached) * 100) : 0,
      conversionPct: total > 0 ? Math.round((reached / total) * 100) : 0,
    };
  });

  const exitCounts = new Map<string, { count: number; elapsedSum: number }>();
  for (const s of inWindowSessions) {
    for (const e of s.events) {
      if (e.name !== "screen_exit") continue;
      const screen = String(e.payload?.screen ?? "unknown");
      const cur = exitCounts.get(screen) ?? { count: 0, elapsedSum: 0 };
      cur.count += 1;
      cur.elapsedSum += eventElapsed(e);
      exitCounts.set(screen, cur);
    }
  }

  const dropOffPoints: DropOffPoint[] = [...exitCounts.entries()]
    .map(([screen, { count, elapsedSum }]) => ({
      screen,
      exits: count,
      avgElapsedMs: count > 0 ? Math.round(elapsedSum / count) : 0,
      pctOfSessions: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.exits - a.exits);

  return {
    windowMs,
    totalSessions: bySession.size,
    sessionsInWindow: inWindowSessions.length,
    stages: stageCounts,
    dropOffPoints,
    sessions: inWindowSessions.sort((a, b) => b.durationMs - a.durationMs),
  };
}
