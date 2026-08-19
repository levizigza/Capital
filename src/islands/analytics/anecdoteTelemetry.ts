/**
 * Anecdote candidate telemetry — sim-backed emergent story predicates.
 * Spec: docs/research/ANECDOTE_SYSTEM.md
 * Law: telemetry ≠ memorability; human recall validates density.
 */

import { analytics } from "../analytics";
import { sessionContext } from "./session";
import { harborCashflow, harborWeatherMood, type HarborWeatherMood } from "../harborWeather";
import { PAYCHECK_UMBRELLA_HOLD_ID, PAYCHECK_GLITTER_TAB_ID } from "../spineTakeFootprints";
import { PAYCHECK_PENINSULA_ID } from "../islandIds";
import type { IslandSaveV1 } from "../types";

export type AnecdoteClass =
  | "unexpected_economic_recovery"
  | "unusual_business_strategy"
  | "npc_relationship_reversal"
  | "high_risk_decision_succeeding"
  | "high_risk_decision_collapsing"
  | "recession_terrible_moment"
  | "systemic_interaction"
  | "transfer_window_open";

const MOOD_RANK: Record<HarborWeatherMood, number> = {
  storm: 0,
  tight: 1,
  fair: 2,
  boom: 3,
};

export async function trackAnecdoteEmerged(input: {
  anecdote_class: AnecdoteClass;
  anecdote_id: string;
  channels: string[];
  prior_snapshot: Record<string, unknown>;
  post_snapshot: Record<string, unknown>;
}): Promise<void> {
  await analytics.track("anecdote_emerged", {
    ...sessionContext(),
    ...input,
    surprise_score: 0,
  });
}

/** Diff saves after sim writes — fire candidate predicates only. */
export function trackAnecdoteOnSaveChange(before: IslandSaveV1, after: IslandSaveV1): void {
  const beforeMood = harborWeatherMood(before);
  const afterMood = harborWeatherMood(after);
  const beforeCf = harborCashflow(before);
  const afterCf = harborCashflow(after);

  if (
    MOOD_RANK[afterMood] > MOOD_RANK[beforeMood] &&
    afterCf > beforeCf + 2
  ) {
    void trackAnecdoteEmerged({
      anecdote_class: "unexpected_economic_recovery",
      anecdote_id: `recovery_${afterMood}_${afterCf}`,
      channels: ["weather.mood", "player.net_cf"],
      prior_snapshot: { mood: beforeMood, cf: beforeCf },
      post_snapshot: { mood: afterMood, cf: afterCf },
    });
  }

  const transferAttempts =
    after.conceptProgress?.concepts.save_vs_spend?.transferAttempts ?? 0;
  const hadTransfer = (before.conceptProgress?.concepts.save_vs_spend?.transferAttempts ?? 0) > 0;
  if (
    !hadTransfer &&
    transferAttempts > 0 &&
    after.currentIslandId === PAYCHECK_PENINSULA_ID
  ) {
    void trackAnecdoteEmerged({
      anecdote_class: "transfer_window_open",
      anecdote_id: `transfer_paycheck_${transferAttempts}`,
      channels: ["concept.save_vs_spend", "island.current"],
      prior_snapshot: { island: before.currentIslandId ?? null },
      post_snapshot: { island: after.currentIslandId, transferAttempts },
    });
  }

  if (
    transferAttempts > 0 &&
    afterMood === "storm" &&
    beforeMood !== "storm" &&
    after.currentIslandId === PAYCHECK_PENINSULA_ID
  ) {
    void trackAnecdoteEmerged({
      anecdote_class: "recession_terrible_moment",
      anecdote_id: `storm_transfer_${afterMood}`,
      channels: ["weather.mood", "concept.transfer"],
      prior_snapshot: { mood: beforeMood, cf: beforeCf },
      post_snapshot: { mood: afterMood, cf: afterCf },
    });
  }

  const paycheckBefore = before.irreversibleChoices?.paycheck_protect_vs_spend;
  const paycheckAfter = after.irreversibleChoices?.paycheck_protect_vs_spend;
  const gainedPaycheckHold = (after.voyagerLedger?.holdings ?? []).some(
    (h) =>
      (h.id === PAYCHECK_UMBRELLA_HOLD_ID || h.id === PAYCHECK_GLITTER_TAB_ID) &&
      !(before.voyagerLedger?.holdings ?? []).some((x) => x.id === h.id),
  );
  if ((!paycheckBefore && paycheckAfter) || gainedPaycheckHold) {
    const holding = (after.voyagerLedger?.holdings ?? []).find(
      (h) => h.id === PAYCHECK_UMBRELLA_HOLD_ID || h.id === PAYCHECK_GLITTER_TAB_ID,
    );
    const choiceId =
      paycheckAfter?.choiceId ?? (holding?.id === PAYCHECK_UMBRELLA_HOLD_ID ? "protect" : "spend");
    void trackAnecdoteEmerged({
      anecdote_class: "systemic_interaction",
      anecdote_id: `paycheck_take_${choiceId}`,
      channels: ["irreversible.paycheck", "weather.mood", "player.net_cf"],
      prior_snapshot: { mood: beforeMood, cf: beforeCf },
      post_snapshot: {
        mood: afterMood,
        cf: afterCf,
        choiceId,
      },
    });
  }

  const beforeScars = before.harborScars?.length ?? 0;
  const afterScars = after.harborScars?.length ?? 0;
  if (afterScars > beforeScars) {
    const latest = after.harborScars?.[afterScars - 1];
    if (latest?.kind === "plaque") {
      void trackAnecdoteEmerged({
        anecdote_class: "npc_relationship_reversal",
        anecdote_id: `plaque_${latest.id}`,
        channels: ["scar.plaque", "weather.mood"],
        prior_snapshot: { mood: beforeMood, scarCount: beforeScars },
        post_snapshot: { mood: afterMood, scarId: latest.id, label: latest.label },
      });
    }
  }
}
