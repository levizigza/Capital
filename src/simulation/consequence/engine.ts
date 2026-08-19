import {
  type Consequence,
  type Decision,
  type DecisionCommitSpec,
  type SourceAction,
} from "./types";
import { delayForHorizon, validateCommitSpec, validateConsequenceRecord } from "./validate";

export type ConsequenceEngine = {
  now: () => number;
  commitDecision: (spec: DecisionCommitSpec) => Decision;
  advance: (ticks: number) => Consequence[];
  cancel: (consequenceId: string, reason: string) => void;
  setCondition: (conditionId: string, value: boolean) => void;
  getDecision: (id: string) => Decision | undefined;
  getConsequence: (id: string) => Consequence | undefined;
  listFired: () => Consequence[];
  listPending: () => Consequence[];
  listAll: () => Consequence[];
  listDecisions: () => Decision[];
};

export function createConsequenceEngine(): ConsequenceEngine {
  let now = 0;
  const decisions = new Map<string, Decision>();
  const consequences = new Map<string, Consequence>();
  const conditions = new Map<string, boolean>();

  function fireDue(): Consequence[] {
    const newly: Consequence[] = [];
    for (const row of consequences.values()) {
      if (row.status !== "pending") continue;
      const fireAt = row.trigger_time.fireAtTick ?? 0;
      if (fireAt > now) continue;
      if (row.certainty_type === "conditional") {
        const ok = row.conditionId ? conditions.get(row.conditionId) === true : false;
        if (!ok) {
          row.status = "blocked";
          continue;
        }
      }
      row.status = "fired";
      row.firedAtTick = now;
      newly.push(row);
    }
    return newly;
  }

  return {
    now: () => now,

    commitDecision(spec: DecisionCommitSpec): Decision {
      validateCommitSpec(spec);
      if (decisions.has(spec.id)) {
        throw new Error(`decision already committed: ${spec.id}`);
      }
      const source: SourceAction = {
        decisionId: spec.id,
        verb: spec.verb,
        choiceId: spec.choiceId,
        chosenLabel: spec.chosenLabel,
        alternatives: spec.alternatives,
        committedAtTick: now,
        context: spec.context,
      };
      const scheduledIds: string[] = [];
      const origin = `decision:${spec.id}`;

      for (const draft of spec.consequences) {
        const delay = delayForHorizon(draft.horizon, draft.delayTicks);
        const id = `consequence:${spec.id}:${draft.key}`;
        const relation = draft.relationFromDecision ?? "produces";
        const causal_path = [
          { fromId: origin, toId: id, relation },
          ...(draft.extraPath ?? []),
        ];
        for (const prior of spec.priorDecisionIds ?? []) {
          causal_path.splice(1, 0, {
            fromId: `decision:${prior}`,
            toId: id,
            relation: "enables",
          });
        }
        const row: Consequence = {
          id,
          domain: draft.domain,
          magnitude: draft.magnitude,
          source_action: source,
          causal_path,
          trigger_time: {
            horizon: draft.horizon,
            delayTicks: delay,
            fireAtTick: now + delay,
          },
          visibility: draft.visibility,
          certainty_type: draft.certainty_type,
          conditionId: draft.conditionId,
          affected_entities: draft.affected_entities,
          reversibility: draft.reversibility,
          explanation_data: draft.explanation_data,
          status: "pending",
        };
        validateConsequenceRecord(row);
        consequences.set(id, row);
        scheduledIds.push(id);
      }

      const decision: Decision = { id: spec.id, source_action: source, scheduledIds };
      decisions.set(spec.id, decision);
      fireDue();
      return decision;
    },

    advance(ticks: number): Consequence[] {
      if (ticks < 0) throw new Error("advance ticks must be >= 0");
      now += ticks;
      return fireDue();
    },

    cancel(consequenceId: string, reason: string): void {
      const row = consequences.get(consequenceId);
      if (!row) throw new Error(`unknown consequence ${consequenceId}`);
      if (row.status !== "pending") return;
      row.status = "cancelled";
      row.cancelReason = reason;
    },

    setCondition(conditionId: string, value: boolean): void {
      conditions.set(conditionId, value);
    },

    getDecision: (id) => decisions.get(id),
    getConsequence: (id) => consequences.get(id),
    listFired: () => [...consequences.values()].filter((c) => c.status === "fired"),
    listPending: () => [...consequences.values()].filter((c) => c.status === "pending"),
    listAll: () => [...consequences.values()],
    listDecisions: () => [...decisions.values()],
  };
}
