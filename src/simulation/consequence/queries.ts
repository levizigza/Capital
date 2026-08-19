import type { ConsequenceEngine } from "./engine";
import type { Answer, CausalHop, Consequence, QueryFilter } from "./types";

function joinSentences(parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

function matchesFilter(row: Consequence, filter?: QueryFilter): boolean {
  if (!filter) return true;
  if (filter.decisionId && row.source_action.decisionId !== filter.decisionId) return false;
  if (filter.domain && row.domain !== filter.domain) return false;
  const tick = row.firedAtTick ?? row.trigger_time.fireAtTick ?? 0;
  if (filter.fromTick !== undefined && tick < filter.fromTick) return false;
  if (filter.toTick !== undefined && tick > filter.toTick) return false;
  return true;
}

export function whatHappened(engine: ConsequenceEngine, filter?: QueryFilter): Answer {
  const fired = engine
    .listFired()
    .filter((c) => matchesFilter(c, filter))
    .sort((a, b) => (a.firedAtTick ?? 0) - (b.firedAtTick ?? 0));
  const sentence =
    fired.length === 0
      ? "Nothing has happened yet."
      : joinSentences(fired.map((c) => c.explanation_data.whatHappened));
  return {
    question: "what_happened",
    sentence,
    evidenceIds: fired.map((c) => c.id),
    causal_path: fired.flatMap((c) => c.causal_path),
  };
}

export function whyDidItHappen(engine: ConsequenceEngine, consequenceId: string): Answer {
  const row = engine.getConsequence(consequenceId);
  if (!row) {
    return {
      question: "why_did_it_happen",
      sentence: "That consequence is not in the log.",
      evidenceIds: [],
      causal_path: [],
    };
  }
  const last = row.causal_path[row.causal_path.length - 1];
  const via = last ? ` (${last.relation} ${last.fromId} → ${last.toId})` : "";
  const source = `${row.source_action.verb}: ${row.source_action.chosenLabel}`;
  const priorHop = row.causal_path.find((h) => h.fromId.startsWith("consequence:"));
  const intermediate = priorHop
    ? engine.getConsequence(priorHop.fromId)?.explanation_data.whatHappened
    : undefined;
  const sentence = joinSentences([
    row.explanation_data.whyItHappened,
    `You chose ${source}.`,
    intermediate ? `That followed: ${intermediate}` : "",
  ]) + via;
  return {
    question: "why_did_it_happen",
    sentence,
    evidenceIds: [row.id, `decision:${row.source_action.decisionId}`],
    causal_path: row.causal_path,
  };
}

function decisionIdsOnPath(path: CausalHop[]): string[] {
  const ids: string[] = [];
  for (const hop of path) {
    if (hop.fromId.startsWith("decision:")) ids.push(hop.fromId.slice("decision:".length));
  }
  return [...new Set(ids)];
}

export function whatPreviousDecisionContributed(
  engine: ConsequenceEngine,
  consequenceId: string,
): Answer {
  const row = engine.getConsequence(consequenceId);
  if (!row) {
    return {
      question: "what_previous_decision_contributed",
      sentence: "That consequence is not in the log.",
      evidenceIds: [],
      causal_path: [],
    };
  }
  const originId = row.source_action.decisionId;
  const onPath = decisionIdsOnPath(row.causal_path);
  const priors = onPath.filter((id) => id !== originId);
  const contributorId = priors.length > 0 ? priors[priors.length - 1]! : originId;
  const contributor = engine.getDecision(contributorId);
  const authored = row.explanation_data.priorDecisionHint;
  const sentence =
    priors.length === 0
      ? authored ??
        `This came from the same choice (${row.source_action.chosenLabel}) — not an earlier decision.`
      : authored ??
        `Earlier, you chose ${contributor?.source_action.chosenLabel ?? contributorId}, which enabled this.`;
  return {
    question: "what_previous_decision_contributed",
    sentence,
    evidenceIds: [`decision:${contributorId}`, row.id],
    causal_path: row.causal_path,
  };
}

export function whatCouldThePlayerHaveDoneDifferently(
  engine: ConsequenceEngine,
  decisionId: string,
): Answer {
  const decision = engine.getDecision(decisionId);
  if (!decision) {
    return {
      question: "what_could_have_been_done_differently",
      sentence: "That decision is not in the log.",
      evidenceIds: [],
      causal_path: [],
    };
  }
  const alts = decision.source_action.alternatives.filter(
    (a) => a.id !== decision.source_action.choiceId,
  );
  const first = engine.getConsequence(decision.scheduledIds[0] ?? "");
  const counterfactual = first?.explanation_data.counterfactual ?? "";
  const listed = alts.map((a) => a.label).join("; ");
  const invented = alts.length === 0;
  const sentence = invented
    ? "No alternative was recorded at commit time."
    : joinSentences([counterfactual, `Recorded alternatives: ${listed}.`]);
  return {
    question: "what_could_have_been_done_differently",
    sentence,
    evidenceIds: [`decision:${decisionId}`, ...alts.map((a) => `alt:${a.id}`)],
    causal_path: [],
  };
}

export function recordedAlternativeIds(engine: ConsequenceEngine, decisionId: string): string[] {
  const d = engine.getDecision(decisionId);
  return (d?.source_action.alternatives ?? []).map((a) => a.id);
}
