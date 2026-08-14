/**
 * Pattern synthesis — recurring behaviors only; never auto-fix.
 */

import type {
  PlaytestCycle,
  PlaytestMoment,
  PlaytestSession,
  ReactionKind,
  RecurringPattern,
  TriageCard,
} from "./types";

export const DEFAULT_PATTERN_MIN_SESSIONS = 2;

function momentKey(m: PlaytestMoment): string {
  const reactions = [...m.reactions].sort().join("+") || "none";
  return `${m.momentCode}::${reactions}`;
}

function normalizeBelief(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

/** Group moments that share beat + reaction signature across sessions. */
export function findRecurringMomentClusters(
  sessions: PlaytestSession[],
  minSessions = DEFAULT_PATTERN_MIN_SESSIONS,
): Array<{
  key: string;
  sessionIds: string[];
  moments: Array<{ sessionId: string; moment: PlaytestMoment }>;
}> {
  const buckets = new Map<
    string,
    Array<{ sessionId: string; moment: PlaytestMoment }>
  >();

  for (const session of sessions) {
    const seenInSession = new Set<string>();
    for (const moment of session.moments) {
      const key = momentKey(moment);
      if (seenInSession.has(key)) continue;
      seenInSession.add(key);
      const list = buckets.get(key) ?? [];
      list.push({ sessionId: session.id, moment });
      buckets.set(key, list);
    }
  }

  return [...buckets.entries()]
    .map(([key, moments]) => ({
      key,
      sessionIds: [...new Set(moments.map((m) => m.sessionId))],
      moments,
    }))
    .filter((c) => c.sessionIds.length >= minSessions)
    .sort((a, b) => b.sessionIds.length - a.sessionIds.length);
}

/** Also cluster on shared “ignored_intent” / “unexpected_strategy” regardless of exact reaction combo */
export function findReactionPatterns(
  sessions: PlaytestSession[],
  reaction: ReactionKind,
  minSessions = DEFAULT_PATTERN_MIN_SESSIONS,
): Array<{
  momentCode: string;
  sessionIds: string[];
  samples: string[];
}> {
  const map = new Map<string, { sessionIds: Set<string>; samples: string[] }>();
  for (const session of sessions) {
    for (const moment of session.moments) {
      if (!moment.reactions.includes(reaction)) continue;
      const entry = map.get(moment.momentCode) ?? {
        sessionIds: new Set(),
        samples: [],
      };
      entry.sessionIds.add(session.id);
      if (entry.samples.length < 4) {
        entry.samples.push(
          `${session.id}: attempted “${moment.attempted}” → ${moment.actuallyHappened}`,
        );
      }
      map.set(moment.momentCode, entry);
    }
  }
  return [...map.entries()]
    .map(([momentCode, v]) => ({
      momentCode,
      sessionIds: [...v.sessionIds],
      samples: v.samples,
    }))
    .filter((r) => r.sessionIds.length >= minSessions)
    .sort((a, b) => b.sessionIds.length - a.sessionIds.length);
}

export function clustersToPatterns(
  sessions: PlaytestSession[],
  minSessions = DEFAULT_PATTERN_MIN_SESSIONS,
): RecurringPattern[] {
  const clusters = findRecurringMomentClusters(sessions, minSessions);
  const patterns: RecurringPattern[] = [];

  for (const [i, cluster] of clusters.entries()) {
    const [momentCode, reactionPart] = cluster.key.split("::");
    const reactions = (reactionPart === "none" ? [] : reactionPart.split("+")) as ReactionKind[];
    const samples = cluster.moments.slice(0, 3);
    const beliefs = samples.map((s) => s.moment.believedWouldHappen);

    patterns.push({
      id: `pat_${String(i + 1).padStart(2, "0")}_${momentCode}`,
      title: `${momentCode} · ${reactions.join(", ") || "neutral"}`,
      sessionCount: cluster.sessionIds.length,
      sessionIds: cluster.sessionIds,
      momentCodes: [momentCode as RecurringPattern["momentCodes"][number]],
      reactionKinds: reactions,
      observation: samples
        .map(
          (s) =>
            `[${s.sessionId} @ ${s.moment.at ?? "?"}] attempted: ${s.moment.attempted}; believed: ${s.moment.believedWouldHappen}; actual: ${s.moment.actuallyHappened}`,
        )
        .join("\n"),
      interpretation: `Recurs in ${cluster.sessionIds.length} sessions. Shared belief flavor: “${normalizeBelief(beliefs[0] ?? "")}”. Reactions: ${reactions.join(", ") || "none logged"}.`,
      proposedFix:
        "Propose one craft change that addresses the shared beat — not each quote. Prefer world-teaching over new chrome. Park if only one session after next cycle.",
      disposition: "investigate",
    });
  }

  // Layer ignored / invented strategy patterns
  for (const reaction of ["ignored_intent", "unexpected_strategy"] as ReactionKind[]) {
    for (const row of findReactionPatterns(sessions, reaction, minSessions)) {
      const id = `pat_${reaction}_${row.momentCode}`;
      if (patterns.some((p) => p.id === id)) continue;
      patterns.push({
        id,
        title: `${row.momentCode} · ${reaction}`,
        sessionCount: row.sessionIds.length,
        sessionIds: row.sessionIds,
        momentCodes: [row.momentCode as RecurringPattern["momentCodes"][number]],
        reactionKinds: [reaction],
        observation: row.samples.join("\n"),
        interpretation:
          reaction === "ignored_intent"
            ? "Players repeatedly bypassed content we thought was the path. Intent may be invisible, optional-looking, or competing with a louder affordance."
            : "Players invented a strategy the systems did not anticipate. Treat as design signal — may be brilliance or a hole.",
        proposedFix:
          reaction === "ignored_intent"
            ? "Make the intended beat impossible to miss without a coach card — or demote it from “required teach.”"
            : "Either bless the strategy (support it) or close the hole — after confirming it recurs next cycle.",
        disposition: "investigate",
      });
    }
  }

  return patterns;
}

/** One-off triage = appeared in a single session only */
export function collectOneOffTriage(sessions: PlaytestSession[]): TriageCard[] {
  const cards: TriageCard[] = [];
  for (const session of sessions) {
    for (const card of session.triage ?? []) {
      cards.push(card);
    }
  }
  const patternMomentIds = new Set<string>();
  // Cards that aren't linked to multi-session patterns stay parked by default
  return cards.map((c) => ({
    ...c,
    disposition: c.disposition === "ship_candidate" ? c.disposition : "park",
    patternId: c.patternId ?? null,
  })).filter((c) => {
    // Keep explicit ship_candidate; park the rest as one-offs unless already patterned
    void patternMomentIds;
    return true;
  });
}

export function synthesizeCycle(opts: {
  id: string;
  title: string;
  startedAt: string;
  endedAt?: string;
  hypothesis: string;
  sessions: PlaytestSession[];
  minSessions?: number;
  summary?: string;
}): PlaytestCycle {
  const minSessions = opts.minSessions ?? DEFAULT_PATTERN_MIN_SESSIONS;
  const patterns = clustersToPatterns(opts.sessions, minSessions);
  const allTriage = collectOneOffTriage(opts.sessions);
  const patternedMomentIds = new Set(
    opts.sessions.flatMap((s) =>
      s.moments
        .filter((m) =>
          patterns.some(
            (p) =>
              p.momentCodes.includes(m.momentCode) &&
              p.sessionIds.includes(s.id),
          ),
        )
        .map((m) => m.id),
    ),
  );

  const shipCandidates = allTriage.filter((t) => t.disposition === "ship_candidate");
  const parkedOneOffs = allTriage.filter((t) => {
    if (t.disposition === "ship_candidate") return false;
    // Park cards that only cite moments not in a recurring pattern
    const linked = t.basedOn.some((id) => patternedMomentIds.has(id) || patterns.some((p) => p.id === id));
    return !linked || t.disposition === "park" || t.disposition === "wont_fix";
  });

  return {
    id: opts.id,
    title: opts.title,
    startedAt: opts.startedAt,
    endedAt: opts.endedAt,
    hypothesis: opts.hypothesis,
    sessionIds: opts.sessions.map((s) => s.id),
    patterns,
    parkedOneOffs,
    shipCandidates,
    summary:
      opts.summary ??
      `${opts.sessions.length} sessions → ${patterns.length} recurring patterns; ` +
        `${parkedOneOffs.length} one-offs parked; ${shipCandidates.length} ship candidates. ` +
        `Do not fix every complaint.`,
  };
}
