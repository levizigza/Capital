import type {
  FtueExperimentHumanReview,
  HumanReviewGateId,
  HumanReviewGateResult,
} from "./types";
import { HUMAN_REVIEW_GATES } from "./types";

export type ShipGateResult = {
  allowed: boolean;
  reasons: string[];
};

function gateMap(gates: HumanReviewGateResult[]): Map<HumanReviewGateId, HumanReviewGateResult> {
  return new Map(gates.map((g) => [g.gate, g]));
}

/**
 * Never automatically ship an experiment winner.
 * Even a perfect primary metric requires a complete human review packet
 * with decision === ship_candidate and acknowledge_no_auto_ship.
 */
export function evaluateShipReadiness(review: FtueExperimentHumanReview): ShipGateResult {
  const reasons: string[] = [];

  if (review.acknowledge_no_auto_ship !== true) {
    reasons.push("missing acknowledge_no_auto_ship");
  }
  if (!review.reviewer || review.reviewer.trim().length < 2) {
    reasons.push("reviewer required");
  }
  if (!review.reviewed_at) {
    reasons.push("reviewed_at required");
  }
  if (review.decision !== "ship_candidate") {
    reasons.push(`decision is ${review.decision}, not ship_candidate`);
  }

  const map = gateMap(review.gates ?? []);
  for (const gate of HUMAN_REVIEW_GATES) {
    const row = map.get(gate);
    if (!row) {
      reasons.push(`missing gate: ${gate}`);
      continue;
    }
    if (row.status === "not_reviewed") {
      reasons.push(`gate not reviewed: ${gate}`);
    } else if (row.status === "fail") {
      reasons.push(`gate failed: ${gate}`);
    } else if (row.status === "needs_followup") {
      reasons.push(`gate needs followup: ${gate}`);
    }
  }

  return { allowed: reasons.length === 0, reasons };
}

/** Hard guard — call before opening a ship PR. Does not mutate production flags. */
export function assertHumanReviewAllowsShip(review: FtueExperimentHumanReview): void {
  const result = evaluateShipReadiness(review);
  if (!result.allowed) {
    throw new Error(
      `FTUE experiment ${review.experiment_id} cannot ship: ${result.reasons.join("; ")}`,
    );
  }
}

/**
 * There is intentionally no shipExperiment() that flips live traffic.
 * Shipping is a human PR that updates registry status to "shipped"
 * after assertHumanReviewAllowsShip succeeds.
 */
export function createEmptyReviewGates(): HumanReviewGateResult[] {
  return HUMAN_REVIEW_GATES.map((gate) => ({
    gate,
    status: "not_reviewed" as const,
  }));
}
