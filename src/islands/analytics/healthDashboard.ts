/**
 * Three-category health dashboard: ENGAGEMENT · LEARNING · BUSINESS.
 * Design: docs/design/HEALTH_DASHBOARD.md
 *
 * Never optimize one category while ignoring damage to another.
 * Tutorial completion is never a Learning success metric.
 */

import type { AnalyticsEvent } from "../types";
import { analyzeFunnel, groupEventsBySession } from "./funnel";
import { analyzeFtueMetrics, type FtueMetricsSnapshot } from "./ftue";

export type HealthCategoryId = "engagement" | "learning" | "business";

export type HealthMetric = {
  id: string;
  label: string;
  /** Display value — null means unavailable / not yet measurable */
  value: number | null;
  /** How to format: rate 0–1, ms duration, count, currency_unknown */
  unit: "rate" | "ms" | "count" | "coins" | "unknown";
  /** Higher is better unless inverted */
  inverted?: boolean;
  note?: string;
};

export type HealthDamageFlagId =
  | "high_fun_low_learning"
  | "high_learning_low_fun"
  | "high_revenue_low_trust"
  | "high_retention_high_hint_dependency";

export type HealthDamageFlag = {
  id: HealthDamageFlagId;
  title: string;
  detail: string;
};

export type HealthCategorySnapshot = {
  id: HealthCategoryId;
  title: string;
  metrics: HealthMetric[];
};

export type HealthDashboardSnapshot = {
  engagement: HealthCategorySnapshot;
  learning: HealthCategorySnapshot;
  business: HealthCategorySnapshot;
  flags: HealthDamageFlag[];
  /** Explicit reminder for export / UI */
  law: string;
  ftue: FtueMetricsSnapshot;
  sessions: number;
};

const HIGH = 0.6;
const LOW = 0.3;
const HINT_HIGH = 0.5;

function isHigh(v: number | null): boolean {
  return v != null && v >= HIGH;
}

function isLow(v: number | null): boolean {
  return v != null && v <= LOW;
}

function rate(n: number, d: number): number | null {
  if (d <= 0) return null;
  return Math.round((n / d) * 1000) / 1000;
}

function mean(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function countEvents(events: AnalyticsEvent[], names: string[]): number {
  return events.filter((e) => names.includes(e.name)).length;
}

/**
 * Session continuation: share of sessions that either
 * - last ≥ 5 minutes of elapsed play, or
 * - reach a complete-loop / consequence beat,
 * i.e. not pure early abandonment.
 */
function sessionContinuation(events: AnalyticsEvent[]): number | null {
  const by = groupEventsBySession(events);
  const sessions = [...by.values()].filter((s) => s.length > 0);
  if (sessions.length === 0) return null;
  let ok = 0;
  for (const sess of sessions) {
    const maxElapsed = Math.max(
      0,
      ...sess.map((e) => (typeof e.payload?.elapsedMs === "number" ? e.payload.elapsedMs : 0)),
    );
    const feltLoop = sess.some((e) =>
      ["first_complete_loop", "consequence_displayed", "freeplay_started", "freeplay_entered"].includes(
        e.name,
      ),
    );
    if (maxElapsed >= 5 * 60_000 || feltLoop) ok += 1;
  }
  return rate(ok, sessions.length);
}

function inGamePurchaseStats(events: AnalyticsEvent[]): {
  conversion: number | null;
  revenueCoins: number | null;
  purchaseSessions: number;
} {
  const by = groupEventsBySession(events);
  const sessions = [...by.values()].filter((s) => s.length > 0);
  if (sessions.length === 0) {
    return { conversion: null, revenueCoins: null, purchaseSessions: 0 };
  }
  let purchaseSessions = 0;
  let coins = 0;
  let anyPrice = false;
  for (const sess of sessions) {
    const buys = sess.filter((e) => e.name === "harbor_purchase");
    if (buys.length > 0) purchaseSessions += 1;
    for (const b of buys) {
      const p = b.payload?.price;
      if (typeof p === "number" && Number.isFinite(p)) {
        coins += p;
        anyPrice = true;
      }
    }
  }
  return {
    conversion: rate(purchaseSessions, sessions.length),
    revenueCoins: anyPrice ? coins : purchaseSessions > 0 ? 0 : null,
    purchaseSessions,
  };
}

export function evaluateHealthDamageFlags(input: {
  voluntaryPlay: number | null;
  continuation: number | null;
  independentTransfer: number | null;
  returnRate: number | null;
  hintDependency: number | null;
  conversion: number | null;
  failureRecovery: number | null;
}): HealthDamageFlag[] {
  const flags: HealthDamageFlag[] = [];
  const {
    voluntaryPlay,
    continuation,
    independentTransfer,
    returnRate,
    hintDependency,
    conversion,
    failureRecovery,
  } = input;

  const funHigh = isHigh(voluntaryPlay) || isHigh(continuation);
  const funLow = isLow(voluntaryPlay) || (continuation != null && isLow(continuation));

  if (funHigh && isLow(independentTransfer)) {
    flags.push({
      id: "high_fun_low_learning",
      title: "HIGH FUN / LOW LEARNING",
      detail:
        "Players stay and play freely, but independent transfer is weak — engagement without comprehension.",
    });
  }

  if (isHigh(independentTransfer) && funLow) {
    flags.push({
      id: "high_learning_low_fun",
      title: "HIGH LEARNING / LOW FUN",
      detail:
        "Transfer looks strong while voluntary play or continuation is weak — learning that does not pull players back.",
    });
  }

  const trustLow = isLow(independentTransfer) || isLow(failureRecovery);
  if (isHigh(conversion) && trustLow) {
    flags.push({
      id: "high_revenue_low_trust",
      title: "HIGH REVENUE / LOW TRUST",
      detail:
        "Purchase conversion is high while transfer or failure recovery is low — monetizing before trust.",
    });
  }

  if (isHigh(returnRate) && hintDependency != null && hintDependency >= HINT_HIGH) {
    flags.push({
      id: "high_retention_high_hint_dependency",
      title: "HIGH RETENTION / HIGH HINT DEPENDENCY",
      detail:
        "Players return but lean on hints — retention may be scaffolded rather than autonomous.",
    });
  }

  return flags;
}

/** Build the three-category dashboard from local analytics events. */
export function analyzeHealthDashboard(events: AnalyticsEvent[]): HealthDashboardSnapshot {
  const ftue = analyzeFtueMetrics(events);
  const funnel = analyzeFunnel(events);
  const continuation = sessionContinuation(events);
  const voluntaryPlay = ftue.freeplay_conversion;
  const returnRate = ftue.d1_retention;
  const durationMs = mean(funnel.sessions.map((s) => s.durationMs));

  const introduced = countEvents(events, ["concept_introduced"]);
  const unlocked = countEvents(events, ["autonomy_unlocked"]);
  const conceptMastery = rate(unlocked, introduced);

  const independentTransfer = ftue.independent_transfer_rate;
  const decisionImprovement = ftue.failure_recovery_rate;
  const hintDependency = ftue.hint_dependency;

  const shop = inGamePurchaseStats(events);

  const engagement: HealthCategorySnapshot = {
    id: "engagement",
    title: "ENGAGEMENT",
    metrics: [
      {
        id: "session_continuation",
        label: "Session continuation",
        value: continuation,
        unit: "rate",
        note: "Felt loop or ≥5 min elapsed",
      },
      {
        id: "return_rate",
        label: "Return rate (D1)",
        value: returnRate,
        unit: "rate",
        note: "D7/D30 in Learning export supporting set",
      },
      {
        id: "voluntary_play",
        label: "Voluntary play",
        value: voluntaryPlay,
        unit: "rate",
        note: "freeplay_started conversion",
      },
      {
        id: "session_duration",
        label: "Session duration",
        value: durationMs,
        unit: "ms",
      },
    ],
  };

  const learning: HealthCategorySnapshot = {
    id: "learning",
    title: "LEARNING",
    metrics: [
      {
        id: "concept_mastery",
        label: "Concept mastery",
        value: conceptMastery,
        unit: "rate",
        note: "autonomy_unlocked ÷ concept_introduced — not tutorial complete",
      },
      {
        id: "independent_transfer",
        label: "Independent transfer",
        value: independentTransfer,
        unit: "rate",
        note: "King learning KPI",
      },
      {
        id: "decision_improvement",
        label: "Decision improvement",
        value: decisionImprovement,
        unit: "rate",
        note: "failure_recovery_rate",
      },
      {
        id: "hint_dependency",
        label: "Hint dependency",
        value: hintDependency,
        unit: "rate",
        inverted: true,
        note: "Higher is worse for autonomy",
      },
    ],
  };

  const business: HealthCategorySnapshot = {
    id: "business",
    title: "BUSINESS",
    metrics: [
      {
        id: "conversion",
        label: "Conversion",
        value: shop.conversion,
        unit: "rate",
        note: "Sessions with harbor_purchase (in-game shop)",
      },
      {
        id: "paid_retention",
        label: "Paid retention",
        value: null,
        unit: "unknown",
        note: "Unavailable — needs paid identity + return after purchase",
      },
      {
        id: "revenue",
        label: "Revenue",
        value: shop.revenueCoins,
        unit: "coins",
        note: "In-game pouch coins from harbor_purchase — not USD",
      },
      {
        id: "cac",
        label: "CAC",
        value: null,
        unit: "unknown",
        note: "Unavailable where acquisition spend is not instrumented",
      },
    ],
  };

  const flags = evaluateHealthDamageFlags({
    voluntaryPlay,
    continuation,
    independentTransfer,
    returnRate,
    hintDependency,
    conversion: shop.conversion,
    failureRecovery: decisionImprovement,
  });

  return {
    engagement,
    learning,
    business,
    flags,
    law: "Never optimize one category while ignoring damage to another.",
    ftue,
    sessions: ftue.sessions || funnel.totalSessions,
  };
}
