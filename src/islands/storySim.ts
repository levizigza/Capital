/**
 * Story-generating simulation — cross-domain event log + chain detection.
 * Not scripted Take cinema. See GAME_DESIGN_STORY_SIM.md.
 *
 * Grammar: ACTION → CONSEQUENCE → ESCALATION → REVERSAL → OUTCOME
 */

import type { IslandSaveV1 } from "./types";

export type StoryBeatKind =
  | "ACTION"
  | "CONSEQUENCE"
  | "ESCALATION"
  | "REVERSAL"
  | "OUTCOME";

export type StoryDomain =
  | "board"
  | "ledger"
  | "rival"
  | "minigame"
  | "harbor"
  | "npc"
  | "economy"
  | "ownership"
  | "weather";

export type StoryVerb =
  | "accepted_deal"
  | "passed_deal"
  | "debt_trap"
  | "payday"
  | "payday_shortfall"
  | "freedom_escape"
  | "streak_broke"
  | "collector_hit"
  | "collector_blocked"
  | "rival_raid"
  | "rival_raid_blocked"
  | "capsule_armed"
  | "minigame_fail"
  | "minigame_clear"
  | "shop_purchase"
  | "weather_storm"
  | "scar_plaque"
  | "economy_phase"
  | "seal_earned"
  | "bailout_used";

export type StoryEvent = {
  id: string;
  ts: string;
  beat: StoryBeatKind;
  domain: StoryDomain;
  verb: StoryVerb;
  actors: string[];
  islandId?: string;
  summary: string;
  refs?: {
    holdingId?: string;
    itemId?: string;
    scarId?: string;
    rivalId?: string;
    timelineId?: string;
    economyPhase?: string;
  };
  deltas?: {
    coins?: number;
    cashflow?: number;
    streak?: number;
    seals?: number;
  };
  tags?: string[];
  /** Explicit parent for tight pairs */
  parentId?: string;
};

export type StoryChain = {
  id: string;
  eventIds: string[];
  stages: Partial<Record<StoryBeatKind, string>>;
  score: number;
  headline: string;
  retell: string;
};

export const STORY_LOG_CAP = 80;

const BEAT_ORDER: StoryBeatKind[] = [
  "ACTION",
  "CONSEQUENCE",
  "ESCALATION",
  "REVERSAL",
  "OUTCOME",
];

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function ensureStoryLog(save: IslandSaveV1): StoryEvent[] {
  return [...(save.storyLog ?? [])];
}

export function appendStoryEvent(
  save: IslandSaveV1,
  partial: Omit<StoryEvent, "id" | "ts"> & { id?: string; ts?: string },
): IslandSaveV1 {
  const event: StoryEvent = {
    id: partial.id ?? newId("story"),
    ts: partial.ts ?? new Date().toISOString(),
    beat: partial.beat,
    domain: partial.domain,
    verb: partial.verb,
    actors: partial.actors,
    summary: partial.summary,
    islandId: partial.islandId,
    refs: partial.refs,
    deltas: partial.deltas,
    tags: partial.tags,
    parentId: partial.parentId,
  };
  const prev = ensureStoryLog(save);
  return {
    ...save,
    storyLog: [event, ...prev].slice(0, STORY_LOG_CAP),
  };
}

/** Convenience builders — keep call sites thin. */
export const storyBeats = {
  acceptedDeal(
    name: string,
    cost: number,
    monthly: number,
    holdingId: string,
    islandId?: string,
  ): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "ACTION",
      domain: "ledger",
      verb: "accepted_deal",
      actors: ["player"],
      islandId,
      summary: `Bought ${name} for ${cost} coins (+$${monthly}/mo).`,
      refs: { holdingId },
      deltas: { coins: -cost, cashflow: monthly },
      tags: ["resource", "ownership", "goal"],
    };
  },
  passedDeal(name: string, islandId?: string): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "ACTION",
      domain: "board",
      verb: "passed_deal",
      actors: ["player"],
      islandId,
      summary: `Passed on ${name} — patience kept the pouch.`,
      tags: ["resource", "risk"],
    };
  },
  debtTrap(
    name: string,
    monthly: number,
    holdingId: string,
    islandId?: string,
  ): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "ACTION",
      domain: "board",
      verb: "debt_trap",
      actors: ["player"],
      islandId,
      summary: `Debt Trap: ${name} (−$${monthly}/mo).`,
      refs: { holdingId },
      deltas: { cashflow: -monthly },
      tags: ["risk", "debt", "failure"],
    };
  },
  payday(
    coins: number,
    streak: number,
    escaped: boolean,
    islandId?: string,
  ): Omit<StoryEvent, "id" | "ts"> {
    if (escaped) {
      return {
        beat: "OUTCOME",
        domain: "ledger",
        verb: "freedom_escape",
        actors: ["player"],
        islandId,
        summary: `Freedom Seal — cashflow held. Pay Day +${coins}.`,
        deltas: { coins, streak },
        tags: ["goal", "outcome", "recovery"],
      };
    }
    if (coins < 0) {
      return {
        beat: "CONSEQUENCE",
        domain: "ledger",
        verb: "payday_shortfall",
        actors: ["player"],
        islandId,
        summary: `Pay Day shortfall (${coins}). Freedom streak reset.`,
        deltas: { coins, streak: 0 },
        tags: ["failure", "resource"],
      };
    }
    if (streak === 0 && coins >= 0) {
      return {
        beat: "CONSEQUENCE",
        domain: "ledger",
        verb: "payday",
        actors: ["player"],
        islandId,
        summary: `Pay Day +${coins} — still chasing the Seal.`,
        deltas: { coins, streak },
        tags: ["resource", "goal"],
      };
    }
    return {
      beat: "CONSEQUENCE",
      domain: "ledger",
      verb: "payday",
      actors: ["player"],
      islandId,
      summary: `Pay Day +${coins} · escape streak ${streak}.`,
      deltas: { coins, streak },
      tags: ["resource", "goal"],
    };
  },
  streakBroke(islandId?: string): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "ESCALATION",
      domain: "ledger",
      verb: "streak_broke",
      actors: ["player"],
      islandId,
      summary: "Freedom streak broke — Harbor felt the lean month.",
      deltas: { streak: 0 },
      tags: ["failure", "escalation", "goal"],
    };
  },
  collectorHit(coins: number, islandId?: string): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "ESCALATION",
      domain: "board",
      verb: "collector_hit",
      actors: ["collector", "player"],
      islandId,
      summary: `The Collector taxed the pouch (${coins} coins).`,
      deltas: { coins },
      tags: ["risk", "escalation", "debt"],
    };
  },
  collectorBlocked(islandId?: string): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "REVERSAL",
      domain: "board",
      verb: "collector_blocked",
      actors: ["player"],
      islandId,
      summary: "Emergency Ledger / Bailout blocked The Collector.",
      tags: ["recovery", "reversal", "capability"],
    };
  },
  rivalRaid(
    rivalId: string,
    coins: number,
    islandId?: string,
  ): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "ESCALATION",
      domain: "rival",
      verb: "rival_raid",
      actors: [rivalId, "player"],
      islandId,
      summary: `${rivalId.replace(/_/g, " ")} raided the pouch (−${Math.abs(coins)}).`,
      refs: { rivalId },
      deltas: { coins },
      tags: ["competition", "rivalry", "escalation"],
    };
  },
  rivalRaidBlocked(rivalId: string, islandId?: string): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "REVERSAL",
      domain: "rival",
      verb: "rival_raid_blocked",
      actors: [rivalId, "player"],
      islandId,
      summary: `Shield held — ${rivalId.replace(/_/g, " ")}’s raid bounced.`,
      refs: { rivalId },
      tags: ["recovery", "rivalry", "reversal"],
    };
  },
  minigameFail(minigameId: string, islandId?: string): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "ACTION",
      domain: "minigame",
      verb: "minigame_fail",
      actors: ["player"],
      islandId,
      summary: `Stumbled in ${minigameId.replace(/^mg_/, "").replace(/_/g, " ")} — walk or retry.`,
      tags: ["failure", "risk"],
    };
  },
  minigameClear(minigameId: string, islandId?: string): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "OUTCOME",
      domain: "minigame",
      verb: "minigame_clear",
      actors: ["player"],
      islandId,
      summary: `Cleared ${minigameId.replace(/^mg_/, "").replace(/_/g, " ")}.`,
      tags: ["outcome", "goal"],
    };
  },
  shopPurchase(kind: string, price: number): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "ACTION",
      domain: "ownership",
      verb: "shop_purchase",
      actors: ["player"],
      islandId: "harbor_haven",
      summary: `Harbor buy: ${kind.replace(/_/g, " ")} (−${price} coins).`,
      deltas: { coins: -price },
      tags: ["ownership", "resource"],
    };
  },
  weatherStorm(reason: string): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "OUTCOME",
      domain: "weather",
      verb: "weather_storm",
      actors: ["harbor"],
      islandId: "harbor_haven",
      summary: `Storm fog on the plaza — ${reason}`,
      tags: ["weather", "escalation"],
    };
  },
  scarPlaque(label: string, scarId: string, islandId?: string): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "OUTCOME",
      domain: "harbor",
      verb: "scar_plaque",
      actors: ["player", "harbor"],
      islandId,
      summary: `Harbor remembers “${label}.”`,
      refs: { scarId },
      tags: ["story", "outcome"],
    };
  },
  sealEarned(islandId?: string): Omit<StoryEvent, "id" | "ts"> {
    return {
      beat: "OUTCOME",
      domain: "board",
      verb: "seal_earned",
      actors: ["player"],
      islandId,
      summary: "Ledger Seal claimed on the board.",
      deltas: { seals: 1 },
      tags: ["competition", "outcome"],
    };
  },
};

function sharesRefs(a: StoryEvent, b: StoryEvent): boolean {
  if (a.parentId === b.id || b.parentId === a.id) return true;
  const ar = a.refs ?? {};
  const br = b.refs ?? {};
  if (ar.holdingId && ar.holdingId === br.holdingId) return true;
  if (ar.rivalId && ar.rivalId === br.rivalId) return true;
  if (ar.scarId && ar.scarId === br.scarId) return true;
  if (a.islandId && a.islandId === b.islandId && a.domain === b.domain) return true;
  // Soft glue: overlapping stress tags within window
  const tagsA = new Set(a.tags ?? []);
  const tagsB = b.tags ?? [];
  return tagsB.some(
    (t) =>
      (t === "debt" || t === "failure" || t === "goal" || t === "rivalry") &&
      tagsA.has(t),
  );
}

function withinWindow(a: StoryEvent, b: StoryEvent, maxMs: number): boolean {
  const ta = Date.parse(a.ts);
  const tb = Date.parse(b.ts);
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return true;
  return Math.abs(ta - tb) <= maxMs;
}

/**
 * Detect meaningful chains in chronological order (oldest → newest).
 * Log is stored newest-first; we reverse for walk.
 */
export function detectStoryChains(
  events: StoryEvent[],
  opts?: { windowMs?: number; limit?: number },
): StoryChain[] {
  const windowMs = opts?.windowMs ?? 1000 * 60 * 60 * 6; // 6h play session glue
  const limit = opts?.limit ?? 8;
  const chrono = [...events].reverse();
  const chains: StoryChain[] = [];
  const used = new Set<string>();

  for (let i = 0; i < chrono.length; i++) {
    const start = chrono[i]!;
    if (start.beat !== "ACTION" && start.beat !== "CONSEQUENCE") continue;
    if (used.has(start.id)) continue;

    const stages: Partial<Record<StoryBeatKind, string>> = {
      [start.beat]: start.id,
    };
    const picked: StoryEvent[] = [start];

    for (let j = i + 1; j < chrono.length; j++) {
      const next = chrono[j]!;
      if (used.has(next.id)) continue;
      if (!withinWindow(start, next, windowMs)) continue;
      if (!sharesRefs(start, next) && !sharesRefs(picked[picked.length - 1]!, next)) {
        // Allow escalation after any stress action in window with debt/failure tags
        const stress =
          (start.tags ?? []).some((t) => t === "debt" || t === "failure" || t === "goal") &&
          (next.beat === "ESCALATION" || next.beat === "REVERSAL" || next.beat === "OUTCOME");
        if (!stress) continue;
      }

      const startIdx = BEAT_ORDER.indexOf(start.beat);
      const nextIdx = BEAT_ORDER.indexOf(next.beat);
      if (nextIdx < startIdx) continue;
      if (stages[next.beat] && next.beat !== "ESCALATION") continue;

      stages[next.beat] = next.id;
      picked.push(next);

      if (stages.OUTCOME && (stages.ESCALATION || stages.REVERSAL || picked.length >= 3)) {
        break;
      }
    }

    if (picked.length < 2) continue;
    const score = scoreChain(picked, stages);
    if (score < 3) continue;

    for (const e of picked) used.add(e.id);
    chains.push({
      id: `chain_${start.id}`,
      eventIds: picked.map((e) => e.id),
      stages,
      score,
      headline: headlineFor(picked, stages),
      retell: retellFor(picked),
    });
  }

  return chains.sort((a, b) => b.score - a.score).slice(0, limit);
}

function scoreChain(
  events: StoryEvent[],
  stages: Partial<Record<StoryBeatKind, string>>,
): number {
  let score = events.length;
  if (stages.ACTION) score += 1;
  if (stages.CONSEQUENCE) score += 1;
  if (stages.ESCALATION) score += 2;
  if (stages.REVERSAL) score += 2;
  if (stages.OUTCOME) score += 3;
  if (events.some((e) => e.verb === "freedom_escape")) score += 4;
  if (events.some((e) => (e.tags ?? []).includes("rivalry"))) score += 1;
  if (events.some((e) => e.verb === "debt_trap") && events.some((e) => e.verb === "collector_hit")) {
    score += 2;
  }
  return score;
}

function headlineFor(
  events: StoryEvent[],
  stages: Partial<Record<StoryBeatKind, string>>,
): string {
  const byId = new Map(events.map((e) => [e.id, e]));
  const outcome = stages.OUTCOME ? byId.get(stages.OUTCOME) : undefined;
  const action = stages.ACTION ? byId.get(stages.ACTION) : events[0];
  const escalation = stages.ESCALATION ? byId.get(stages.ESCALATION) : undefined;
  const reversal = stages.REVERSAL ? byId.get(stages.REVERSAL) : undefined;

  if (outcome?.verb === "freedom_escape") {
    return reversal
      ? "Bailout, then Freedom — what a month"
      : "Freedom Seal after the grind";
  }
  if (action?.verb === "debt_trap" && escalation?.verb === "collector_hit") {
    return reversal
      ? "Debt Trap, Collector, then a save"
      : "Debt Trap into The Collector";
  }
  if (escalation?.verb === "rival_raid") {
    return "Rival raid when the pouch was thin";
  }
  if (action?.verb === "accepted_deal" && escalation?.verb === "streak_broke") {
    return "Deal binge broke the Freedom streak";
  }
  if (outcome?.verb === "weather_storm") {
    return "Harbor went dark after the books slipped";
  }
  return action?.summary ?? "A Harbor month to remember";
}

function retellFor(events: StoryEvent[]): string {
  return events.map((e) => e.summary).join(" → ");
}

/** Flat timeline for UI — newest first with chain badges. */
export type StoryTimelineEntry = {
  event: StoryEvent;
  chainId?: string;
  chainHeadline?: string;
  stage?: StoryBeatKind;
};

export function buildStoryTimeline(save: IslandSaveV1): {
  entries: StoryTimelineEntry[];
  chains: StoryChain[];
  bestRetell: string | null;
} {
  const events = ensureStoryLog(save);
  const chains = detectStoryChains(events);
  const chainByEvent = new Map<string, StoryChain>();
  for (const c of chains) {
    for (const id of c.eventIds) chainByEvent.set(id, c);
  }
  const entries: StoryTimelineEntry[] = events.map((event) => {
    const chain = chainByEvent.get(event.id);
    return {
      event,
      chainId: chain?.id,
      chainHeadline: chain?.headline,
      stage: event.beat,
    };
  });
  const best = chains[0];
  return {
    entries,
    chains,
    bestRetell: best ? `“${best.headline}” — ${best.retell}` : null,
  };
}

export function storyUiEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("story") === "1";
  } catch {
    return false;
  }
}

/** Stamp storm weather once when mood flips to storm (debounce via last event). */
export function maybeRecordWeatherStorm(
  save: IslandSaveV1,
  mood: string,
  reason: string,
): IslandSaveV1 {
  if (mood !== "storm") return save;
  const last = save.storyLog?.[0];
  if (last?.verb === "weather_storm") return save;
  return appendStoryEvent(save, storyBeats.weatherStorm(reason));
}
