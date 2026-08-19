import {
  CERTAINTY_TYPES,
  DOMAINS,
  HORIZONS,
  REVERSIBILITIES,
  VISIBILITIES,
  type Consequence,
  type ConsequenceDraft,
  type DecisionCommitSpec,
  type Horizon,
} from "./types";

export class SchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemaError";
  }
}

export function delayForHorizon(horizon: Horizon, override?: number): number {
  if (override !== undefined) return override;
  switch (horizon) {
    case "IMMEDIATE":
      return 0;
    case "SHORT_TERM":
      return 1;
    case "MEDIUM_TERM":
      return 3;
    case "LONG_TERM":
      return 8;
  }
}

export function validateHorizonDelay(horizon: Horizon, delayTicks: number): void {
  if (horizon === "IMMEDIATE" && delayTicks !== 0) {
    throw new SchemaError("IMMEDIATE consequences must have delayTicks === 0");
  }
  if (horizon !== "IMMEDIATE" && delayTicks <= 0) {
    throw new SchemaError(`${horizon} consequences must have delayTicks > 0`);
  }
}

function alternativeMentioned(counterfactual: string, spec: DecisionCommitSpec): boolean {
  const hay = counterfactual.toLowerCase();
  return spec.alternatives.some(
    (alt) =>
      alt.id !== spec.choiceId &&
      (hay.includes(alt.id.toLowerCase()) || hay.includes(alt.label.toLowerCase())),
  );
}

export function validateCommitSpec(spec: DecisionCommitSpec): void {
  if (!spec.id.trim()) throw new SchemaError("decision id required");
  if (!spec.verb.trim()) throw new SchemaError("verb required");
  if (!spec.choiceId.trim()) throw new SchemaError("choiceId required");
  if (!spec.chosenLabel.trim()) throw new SchemaError("chosenLabel required");
  if (!spec.consequences.length) {
    throw new SchemaError("a decision must schedule at least one consequence");
  }
  const other = spec.alternatives.filter((a) => a.id !== spec.choiceId);
  if (other.length < 1) {
    throw new SchemaError("alternatives must include at least one unchosen option");
  }
  const keys = new Set<string>();
  for (const draft of spec.consequences) {
    validateDraft(draft, spec);
    if (keys.has(draft.key)) throw new SchemaError(`duplicate consequence key ${draft.key}`);
    keys.add(draft.key);
  }
}

export function validateDraft(draft: ConsequenceDraft, spec: DecisionCommitSpec): void {
  if (!draft.key.trim()) throw new SchemaError("consequence key required");
  if (!DOMAINS.includes(draft.domain)) throw new SchemaError(`unknown domain ${draft.domain}`);
  if (!HORIZONS.includes(draft.horizon)) throw new SchemaError(`unknown horizon ${draft.horizon}`);
  if (!VISIBILITIES.includes(draft.visibility)) throw new SchemaError("unknown visibility");
  if (!CERTAINTY_TYPES.includes(draft.certainty_type)) throw new SchemaError("unknown certainty_type");
  if (!REVERSIBILITIES.includes(draft.reversibility)) throw new SchemaError("unknown reversibility");
  if (draft.certainty_type === "conditional" && !draft.conditionId) {
    throw new SchemaError("conditional consequences require conditionId");
  }
  if (!draft.affected_entities.length) {
    throw new SchemaError("affected_entities must not be empty");
  }
  const delay = delayForHorizon(draft.horizon, draft.delayTicks);
  validateHorizonDelay(draft.horizon, delay);
  const ex = draft.explanation_data;
  if (!ex.whatHappened.trim() || !ex.whyItHappened.trim() || !ex.counterfactual.trim()) {
    throw new SchemaError("explanation_data requires whatHappened, whyItHappened, counterfactual");
  }
  if (!alternativeMentioned(ex.counterfactual, spec)) {
    throw new SchemaError("counterfactual must mention an unchosen alternative id or label");
  }
}

/** Spine Takes should not hide the first beat. Soft check for authored fixtures. */
export function assertSpineVisibility(drafts: ConsequenceDraft[]): string[] {
  const warnings: string[] = [];
  const immediate = drafts.filter((d) => d.horizon === "IMMEDIATE");
  if (immediate.some((d) => d.visibility === "hidden")) {
    warnings.push("spine: IMMEDIATE + hidden hides the first money beat");
  }
  if (immediate.length === 0 && drafts.some((d) => d.horizon === "LONG_TERM")) {
    warnings.push("spine: LONG_TERM without IMMEDIATE felt/named row");
  }
  return warnings;
}

export function validateConsequenceRecord(row: Consequence): void {
  if (!row.causal_path.length) throw new SchemaError("causal_path must have at least one hop");
  const origin = `decision:${row.source_action.decisionId}`;
  if (row.causal_path[0]?.fromId !== origin) {
    throw new SchemaError("causal_path must start at decision:{decisionId}");
  }
  validateHorizonDelay(row.trigger_time.horizon, row.trigger_time.delayTicks);
}
