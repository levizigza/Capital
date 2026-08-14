import { describe, expect, it } from "vitest";
import {
  DEFAULT_POLICY_THRESHOLDS,
  HitlApprovalEngine,
  HitlValidationError,
  RISK_DIMENSIONS,
  assessRisk,
  emptyRiskProfile,
  validateApprovalRequest,
} from "./index";
import type { ApprovalRequest, RiskProfile } from "./types";

function risk(partial: Partial<RiskProfile>): RiskProfile {
  return { ...emptyRiskProfile(), ...partial };
}

function baseRequest(over: Partial<ApprovalRequest> & { id: string; risk: RiskProfile }): ApprovalRequest {
  return {
    id: over.id,
    created_at: over.created_at ?? "2026-08-14T00:00:00.000Z",
    recommended_action: over.recommended_action ?? "Ship a small copy tweak to Harbor tip",
    reason: over.reason ?? "Improve clarity of Soft Beat tip text",
    evidence: over.evidence ?? [{ ref: "uri://playtest-notes", note: "n=12" }],
    expected_upside: over.expected_upside ?? "Fewer confused skips",
    expected_cost: over.expected_cost ?? 0,
    expected_cost_note: over.expected_cost_note,
    confidence: over.confidence ?? 0.8,
    reversibility: over.reversibility ?? "Revert copy in one deploy",
    worst_case: over.worst_case ?? "Minor confusion for a day",
    alternative_action: over.alternative_action ?? "Do nothing / A-B later",
    responsible: over.responsible ?? "workflow:copy-tweak",
    risk: over.risk,
    policy_thresholds: over.policy_thresholds,
  };
}

describe("risk dimensions & tiers", () => {
  it("defines eight risk dimensions", () => {
    expect(RISK_DIMENSIONS).toEqual([
      "financial_impact",
      "reversibility",
      "customer_impact",
      "legal_sensitivity",
      "security_sensitivity",
      "brand_impact",
      "data_sensitivity",
      "strategic_impact",
    ]);
  });

  it("scores LOW for near-empty profile", () => {
    const a = assessRisk(emptyRiskProfile());
    expect(a.tier).toBe("LOW");
    expect(a.gate).toBe("auto_execute");
  });

  it("scores MEDIUM for moderate brand/customer", () => {
    const a = assessRisk(risk({ brand_impact: 2, customer_impact: 2 }));
    expect(a.tier).toBe("MEDIUM");
    expect(a.gate).toBe("policy_threshold");
  });

  it("scores HIGH for financial_impact 3", () => {
    const a = assessRisk(risk({ financial_impact: 3 }));
    expect(a.tier).toBe("HIGH");
    expect(a.gate).toBe("founder_approval");
  });

  it("scores CRITICAL for legal_sensitivity 4", () => {
    const a = assessRisk(risk({ legal_sensitivity: 4 }));
    expect(a.tier).toBe("CRITICAL");
    expect(a.gate).toBe("founder_plus_second_confirmation");
  });

  it("scores CRITICAL for strategic+hard reversibility", () => {
    const a = assessRisk(risk({ strategic_impact: 4, reversibility: 3 }));
    expect(a.tier).toBe("CRITICAL");
  });
});

describe("validateApprovalRequest", () => {
  it("requires all mandatory fields", () => {
    const bad = validateApprovalRequest({
      id: "x",
      created_at: "",
      recommended_action: "",
      reason: "",
      evidence: [],
      expected_upside: "",
      expected_cost: -1,
      confidence: 2,
      reversibility: "",
      worst_case: "",
      alternative_action: "",
      responsible: "",
      risk: emptyRiskProfile(),
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      const fields = bad.issues.map((i) => i.field);
      expect(fields).toContain("recommended_action");
      expect(fields).toContain("reason");
      expect(fields).toContain("evidence");
      expect(fields).toContain("expected_upside");
      expect(fields).toContain("expected_cost");
      expect(fields).toContain("confidence");
      expect(fields).toContain("reversibility");
      expect(fields).toContain("worst_case");
      expect(fields).toContain("alternative_action");
      expect(fields).toContain("responsible");
    }
  });

  it("accepts a complete request", () => {
    const ok = validateApprovalRequest(
      baseRequest({ id: "req-ok", risk: emptyRiskProfile() }),
    );
    expect(ok.ok).toBe(true);
  });
});

describe("HitlApprovalEngine", () => {
  it("LOW may execute automatically", () => {
    const eng = new HitlApprovalEngine();
    const c = eng.submit(baseRequest({ id: "low-1", risk: emptyRiskProfile() }));
    expect(c.assessment.tier).toBe("LOW");
    expect(c.status).toBe("auto_approved");
    expect(eng.mayExecute(c)).toBe(true);
    const done = eng.markExecuted("low-1", "system:hitl");
    expect(done.status).toBe("executed");
    expect(done.decisions.some((d) => d.kind === "auto_approve")).toBe(true);
    expect(done.decisions.some((d) => d.kind === "execute")).toBe(true);
  });

  it("MEDIUM executes within policy thresholds", () => {
    const eng = new HitlApprovalEngine();
    const c = eng.submit(
      baseRequest({
        id: "med-1",
        expected_cost: 100,
        risk: risk({ brand_impact: 2, customer_impact: 1 }),
        policy_thresholds: DEFAULT_POLICY_THRESHOLDS,
      }),
    );
    expect(c.assessment.tier).toBe("MEDIUM");
    expect(c.status).toBe("policy_approved");
    expect(eng.mayExecute(c)).toBe(true);
  });

  it("MEDIUM outside thresholds escalates to pending founder", () => {
    const eng = new HitlApprovalEngine();
    const c = eng.submit(
      baseRequest({
        id: "med-over",
        expected_cost: 9999,
        risk: risk({ brand_impact: 2 }),
      }),
    );
    expect(c.assessment.tier).toBe("MEDIUM");
    expect(c.status).toBe("pending");
    expect(eng.mayExecute(c)).toBe(false);
    expect(c.decisions.some((d) => d.kind === "block")).toBe(true);
  });

  it("HIGH requires founder approval before execute", () => {
    const eng = new HitlApprovalEngine();
    const c = eng.submit(
      baseRequest({
        id: "high-1",
        recommended_action: "Raise list price by 10%",
        risk: risk({ financial_impact: 3, strategic_impact: 2 }),
      }),
    );
    expect(c.assessment.tier).toBe("HIGH");
    expect(c.status).toBe("pending");
    expect(() => eng.markExecuted("high-1", "ops")).toThrow(HitlValidationError);

    expect(() => eng.founderApprove("high-1", "gpt-bot", "nope")).toThrow(/human|founder/i);

    const approved = eng.founderApprove("high-1", "founder", "Approved after review of evidence");
    expect(approved.status).toBe("approved");
    expect(approved.founder_approval?.confirmer).toBe("founder");
    const done = eng.markExecuted("high-1", "workflow:pricing");
    expect(done.status).toBe("executed");
  });

  it("CRITICAL requires founder plus second confirmation", () => {
    const eng = new HitlApprovalEngine();
    eng.submit(
      baseRequest({
        id: "crit-1",
        recommended_action: "Change privacy policy retention for minors",
        risk: risk({ legal_sensitivity: 4, data_sensitivity: 3 }),
      }),
    );
    const c = eng.get("crit-1")!;
    expect(c.assessment.tier).toBe("CRITICAL");
    expect(c.status).toBe("pending");

    eng.founderApprove("crit-1", "founder", "Primary approval");
    expect(eng.get("crit-1")!.status).toBe("pending");
    expect(() => eng.markExecuted("crit-1", "ops")).toThrow(/blocked/i);

    expect(() =>
      eng.secondConfirm("crit-1", "founder", "same person"),
    ).toThrow(/different/i);

    const confirmed = eng.secondConfirm("crit-1", "owner:counsel", "Second look OK");
    expect(confirmed.status).toBe("approved");
    expect(confirmed.second_confirmation?.confirmer).toBe("owner:counsel");
    expect(eng.markExecuted("crit-1", "workflow:legal").status).toBe("executed");
  });

  it("rejects and logs the decision", () => {
    const eng = new HitlApprovalEngine();
    eng.submit(
      baseRequest({
        id: "rej-1",
        risk: risk({ financial_impact: 3 }),
      }),
    );
    const rejected = eng.reject("rej-1", "founder", "Too risky this quarter");
    expect(rejected.status).toBe("rejected");
    expect(rejected.decisions.some((d) => d.kind === "reject")).toBe(true);
    expect(() => eng.markExecuted("rej-1", "ops")).toThrow();
  });

  it("logs all decisions in append-only log", () => {
    const eng = new HitlApprovalEngine();
    eng.submit(baseRequest({ id: "log-low", risk: emptyRiskProfile() }));
    eng.markExecuted("log-low", "system");
    eng.submit(
      baseRequest({
        id: "log-high",
        risk: risk({ customer_impact: 3 }),
      }),
    );
    eng.founderApprove("log-high", "founder", "ok");
    eng.markExecuted("log-high", "ops");

    const log = eng.decisionLog();
    expect(log.schema_version).toBe("1");
    expect(log.cases).toHaveLength(2);
    const kinds = eng.listDecisions().map((d) => d.kind);
    expect(kinds).toContain("auto_approve");
    expect(kinds).toContain("founder_approve");
    expect(kinds).toContain("execute");

    const eng2 = new HitlApprovalEngine();
    eng2.hydrate(log);
    expect(eng2.get("log-high")?.status).toBe("executed");
  });

  it("refuses incomplete requests", () => {
    const eng = new HitlApprovalEngine();
    expect(() =>
      eng.submit({
        id: "bad",
        created_at: "2026-08-14T00:00:00.000Z",
        recommended_action: "x",
        reason: "y",
        evidence: [],
        expected_upside: "",
        expected_cost: 0,
        confidence: 0.5,
        reversibility: "",
        worst_case: "",
        alternative_action: "",
        responsible: "",
        risk: emptyRiskProfile(),
      }),
    ).toThrow(HitlValidationError);
  });
});
