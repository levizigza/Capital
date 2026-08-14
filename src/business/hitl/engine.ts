/**
 * HITL approval engine — gates execution by risk tier; logs all decisions.
 */

import { checkMediumPolicy, isFounderActor, isSecondConfirmer } from "./policy";
import { assessRisk } from "./risk";
import { HitlValidationError, validateApprovalRequest } from "./validate";
import type {
  ApprovalCase,
  ApprovalDecision,
  ApprovalDecisionLog,
  ApprovalRequest,
  ApprovalStatus,
  ConfirmationStep,
  PolicyThresholds,
} from "./types";
import { DEFAULT_POLICY_THRESHOLDS } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function newDecisionId(): string {
  return `dec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type HitlEngineOptions = {
  policy_thresholds?: PolicyThresholds;
};

export class HitlApprovalEngine {
  private cases = new Map<string, ApprovalCase>();
  private readonly defaultThresholds: PolicyThresholds;

  constructor(opts: HitlEngineOptions = {}) {
    this.defaultThresholds = opts.policy_thresholds ?? DEFAULT_POLICY_THRESHOLDS;
  }

  /**
   * Submit a fully-populated approval request.
   * LOW → auto_approved; MEDIUM → policy check; HIGH/CRITICAL → pending.
   */
  submit(request: ApprovalRequest): ApprovalCase {
    const validated = validateApprovalRequest(request);
    if (!validated.ok) {
      throw new HitlValidationError(
        validated.issues.map((i) => i.message).join("; "),
        validated.issues,
      );
    }
    if (this.cases.has(request.id)) {
      throw new HitlValidationError(`Approval request id already exists: ${request.id}`);
    }

    const assessment = assessRisk(request.risk);
    const at = nowIso();
    const decisions: ApprovalDecision[] = [];
    let status: ApprovalStatus = "pending";
    let founder: ConfirmationStep | null = null;
    let second: ConfirmationStep | null = null;

    if (assessment.tier === "LOW") {
      status = "auto_approved";
      decisions.push({
        id: newDecisionId(),
        request_id: request.id,
        at,
        actor: "system:hitl",
        kind: "auto_approve",
        note: "LOW tier — automatic execution permitted",
        tier: assessment.tier,
        gate: assessment.gate,
      });
    } else if (assessment.tier === "MEDIUM") {
      const thresholds = request.policy_thresholds ?? this.defaultThresholds;
      const policy = checkMediumPolicy(request, assessment, thresholds);
      if (policy.ok) {
        status = "policy_approved";
        decisions.push({
          id: newDecisionId(),
          request_id: request.id,
          at,
          actor: "system:hitl",
          kind: "policy_approve",
          note: `MEDIUM within policy thresholds (max_cost=${thresholds.max_expected_cost})`,
          tier: assessment.tier,
          gate: assessment.gate,
        });
      } else {
        status = "blocked";
        decisions.push({
          id: newDecisionId(),
          request_id: request.id,
          at,
          actor: "system:hitl",
          kind: "block",
          note: `MEDIUM outside policy: ${policy.violations.join("; ")} — escalate to founder`,
          tier: assessment.tier,
          gate: assessment.gate,
        });
        // Escalate blocked MEDIUM to require founder (treat like HIGH pending)
        status = "pending";
        decisions.push({
          id: newDecisionId(),
          request_id: request.id,
          at,
          actor: "system:hitl",
          kind: "block",
          note: "Escalated to founder_approval after policy miss",
          tier: "HIGH",
          gate: "founder_approval",
        });
      }
    } else {
      // HIGH / CRITICAL — wait for founder
      status = "pending";
      decisions.push({
        id: newDecisionId(),
        request_id: request.id,
        at,
        actor: "system:hitl",
        kind: "block",
        note: `${assessment.tier} requires ${assessment.gate}`,
        tier: assessment.tier,
        gate: assessment.gate,
      });
    }

    const c: ApprovalCase = {
      request: structuredClone(request),
      assessment,
      status,
      founder_approval: founder,
      second_confirmation: second,
      decisions,
      updated_at: at,
    };
    this.cases.set(request.id, c);
    return structuredClone(c);
  }

  get(requestId: string): ApprovalCase | null {
    const c = this.cases.get(requestId);
    return c ? structuredClone(c) : null;
  }

  /**
   * Founder approval for HIGH / CRITICAL (and escalated MEDIUM).
   */
  founderApprove(requestId: string, founder: string, note: string): ApprovalCase {
    const c = this.requireCase(requestId);
    if (!isFounderActor(founder)) {
      throw new HitlValidationError("Founder approval requires a human founder/owner identity — not an agent");
    }
    if (c.status === "executed" || c.status === "rejected") {
      throw new HitlValidationError(`Cannot approve case in status ${c.status}`);
    }
    if (c.status === "auto_approved" || c.status === "policy_approved") {
      throw new HitlValidationError(`Case already cleared via ${c.status}`);
    }

    const at = nowIso();
    c.founder_approval = { confirmer: founder.trim(), confirmed_at: at, note: note.trim() };
    c.decisions.push({
      id: newDecisionId(),
      request_id: requestId,
      at,
      actor: founder.trim(),
      kind: "founder_approve",
      note: note.trim() || "founder approved",
      tier: c.assessment.tier,
      gate: c.assessment.gate,
    });

    if (c.assessment.tier === "CRITICAL") {
      c.status = "pending"; // still need second confirmation
    } else {
      c.status = "approved";
    }
    c.updated_at = at;
    this.cases.set(requestId, c);
    return structuredClone(c);
  }

  /**
   * Second confirmation for CRITICAL — must be a different human than founder.
   */
  secondConfirm(requestId: string, confirmer: string, note: string): ApprovalCase {
    const c = this.requireCase(requestId);
    if (c.assessment.tier !== "CRITICAL") {
      throw new HitlValidationError("Second confirmation only applies to CRITICAL tier");
    }
    if (!c.founder_approval) {
      throw new HitlValidationError("CRITICAL requires founder approval before second confirmation");
    }
    if (!isSecondConfirmer(confirmer, c.founder_approval.confirmer)) {
      throw new HitlValidationError(
        "Second confirmation must be a different human identity from the founder approver",
      );
    }
    if (!note.trim() || note.trim().length < 4) {
      throw new HitlValidationError("Second confirmation note required");
    }

    const at = nowIso();
    c.second_confirmation = {
      confirmer: confirmer.trim(),
      confirmed_at: at,
      note: note.trim(),
    };
    c.decisions.push({
      id: newDecisionId(),
      request_id: requestId,
      at,
      actor: confirmer.trim(),
      kind: "second_confirm",
      note: note.trim(),
      tier: c.assessment.tier,
      gate: c.assessment.gate,
    });
    c.status = "approved";
    c.updated_at = at;
    this.cases.set(requestId, c);
    return structuredClone(c);
  }

  reject(requestId: string, actor: string, note: string): ApprovalCase {
    const c = this.requireCase(requestId);
    if (!isFounderActor(actor)) {
      throw new HitlValidationError("Reject requires a human actor");
    }
    const at = nowIso();
    c.status = "rejected";
    c.decisions.push({
      id: newDecisionId(),
      request_id: requestId,
      at,
      actor: actor.trim(),
      kind: "reject",
      note: note.trim() || "rejected",
      tier: c.assessment.tier,
      gate: c.assessment.gate,
    });
    c.updated_at = at;
    this.cases.set(requestId, c);
    return structuredClone(c);
  }

  /**
   * Mark executed only when gate is satisfied.
   */
  markExecuted(requestId: string, actor: string, note?: string): ApprovalCase {
    const c = this.requireCase(requestId);
    if (!this.mayExecute(c)) {
      throw new HitlValidationError(
        `Execution blocked: status=${c.status}, tier=${c.assessment.tier}, gate=${c.assessment.gate}`,
      );
    }
    const at = nowIso();
    c.status = "executed";
    c.decisions.push({
      id: newDecisionId(),
      request_id: requestId,
      at,
      actor: actor.trim() || "system:hitl",
      kind: "execute",
      note: note?.trim() || "executed",
      tier: c.assessment.tier,
      gate: c.assessment.gate,
    });
    c.updated_at = at;
    this.cases.set(requestId, c);
    return structuredClone(c);
  }

  mayExecute(c: ApprovalCase): boolean {
    if (c.status === "auto_approved" || c.status === "policy_approved" || c.status === "approved") {
      if (c.assessment.tier === "CRITICAL") {
        return Boolean(c.founder_approval && c.second_confirmation);
      }
      if (c.assessment.tier === "HIGH") {
        return Boolean(c.founder_approval) || c.status === "approved";
      }
      return true;
    }
    return false;
  }

  /** Append-only decision log snapshot */
  decisionLog(): ApprovalDecisionLog {
    return {
      schema_version: "1",
      cases: [...this.cases.values()].map((c) => structuredClone(c)),
    };
  }

  listDecisions(): ApprovalDecision[] {
    return [...this.cases.values()].flatMap((c) => structuredClone(c.decisions));
  }

  hydrate(log: ApprovalDecisionLog): void {
    this.cases.clear();
    for (const c of log.cases) {
      this.cases.set(c.request.id, structuredClone(c));
    }
  }

  clear(): void {
    this.cases.clear();
  }

  private requireCase(id: string): ApprovalCase {
    const c = this.cases.get(id);
    if (!c) throw new HitlValidationError(`Unknown approval request ${id}`);
    return c;
  }
}
