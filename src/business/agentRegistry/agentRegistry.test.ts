import { describe, expect, it } from "vitest";
import {
  AGENT_STATUSES,
  AgentRegistry,
  AgentRegistryError,
  POSSIBLE_CAPABILITIES,
  emptyRegistrySnapshot,
  validateAgentRecord,
  validateJustification,
} from "./index";
import type { AgentRecord, InstantiationJustification } from "./types";

function justification(
  over: Partial<InstantiationJustification> = {},
): InstantiationJustification {
  return {
    workflow_id: over.workflow_id ?? "wf_voc_weekly_triage",
    metric: over.metric ?? "hours_to_first_triage",
    baseline: over.baseline ?? "48h",
    target: over.target ?? "8h",
    why_independent_context:
      over.why_independent_context ??
      "Needs isolated VoC evidence corpus separate from Harbor gameplay context",
    why_independent_tools:
      over.why_independent_tools ??
      "Needs read-only ticket + transcript tools not shared with Operator drafts",
    why_independent_reasoning:
      over.why_independent_reasoning ??
      "Multi-label severity suggestions require dedicated eval harness",
    evidence_refs: over.evidence_refs ?? ["uri://experiment/voc-triage-2026-08"],
  };
}

function validDraft(over: Partial<AgentRecord> = {}): AgentRecord {
  const at = "2026-08-14T00:00:00.000Z";
  return {
    id: over.id ?? "agent_voc_triage_assist",
    name: over.name ?? "VoC Triage Assist",
    mission: over.mission ?? "Draft triage labels for weekly VoC queue",
    business_problem:
      over.business_problem ?? "Founder spends too long first-pass labeling support themes",
    allowed_inputs: over.allowed_inputs ?? ["voc_evidence_uri", "annotation_batch"],
    expected_outputs: over.expected_outputs ?? ["triage_draft", "confidence_notes"],
    tools: over.tools ?? ["tool:voc_read", "tool:draft_write_temp"],
    model: over.model ?? "unassigned",
    context_sources: over.context_sources ?? ["memory:customer_evidence", "docs:voc"],
    permissions: over.permissions ?? ["read_context", "write_temp_memory", "propose_action"],
    budget: over.budget ?? {
      max_cost_per_run: 0.5,
      max_cost_per_day: 5,
      max_tokens_per_run: 20_000,
      max_runs_per_day: 20,
    },
    KPIs: over.KPIs ?? [
      {
        id: "triage_latency",
        description: "Time to first triage draft",
        measurement: "median hours",
        target: "8h",
      },
    ],
    eval_suite: over.eval_suite ?? {
      id: "voc_triage_eval",
      description: "Gold label agreement",
      cases: ["case_anger", "case_confusion", "case_praise"],
      min_pass_rate: 0.8,
    },
    failure_threshold: over.failure_threshold ?? {
      max_consecutive_failures: 3,
      min_rolling_pass_rate: 0.7,
      rolling_window: 20,
    },
    retry_limit: over.retry_limit ?? 1,
    escalation_target: over.escalation_target ?? "human:founder",
    approval_requirements: over.approval_requirements ?? {
      require_hitl_before_side_effects: true,
      min_risk_tier: "MEDIUM",
      approver_roles: ["founder"],
    },
    status: over.status ?? "proposed",
    business_value: over.business_value ?? {
      narrative: "Reduce founder triage time without auto-changing canonical policy",
      estimated_monthly_value: null,
    },
    last_reviewed: over.last_reviewed ?? at,
    capabilities: over.capabilities,
    justification: over.justification ?? justification(),
    created_at: over.created_at ?? at,
    updated_at: over.updated_at ?? at,
  };
}

describe("capability catalog (not workforce)", () => {
  it("lists possible capabilities without instantiating agents", () => {
    expect(POSSIBLE_CAPABILITIES).toEqual([
      "customer_research",
      "market_research",
      "marketing",
      "sales",
      "support",
      "product_analysis",
      "finance_analysis",
      "qa",
      "competitive_intelligence",
    ]);
    const reg = new AgentRegistry();
    expect(reg.count()).toBe(0);
    expect(reg.serialize().agents).toEqual([]);
    expect(reg.serialize().policy).toBe("registry_before_workforce_no_role_fill");
  });

  it("emptyRegistrySnapshot has zero agents", () => {
    expect(emptyRegistrySnapshot().agents).toHaveLength(0);
  });

  it("rejects one-agent-per-capability role fill pattern", () => {
    expect(() =>
      AgentRegistry.assertNotRoleFill(POSSIBLE_CAPABILITIES.length, POSSIBLE_CAPABILITIES.length),
    ).toThrow(/one-agent-per-capability/i);
  });
});

describe("schema fields", () => {
  it("requires full agent schema including justification", () => {
    const ok = validateAgentRecord(validDraft());
    expect(ok.ok).toBe(true);

    const incomplete = validateAgentRecord({
      ...validDraft(),
      mission: "",
      KPIs: [],
      // @ts-expect-error intentional
      justification: null,
    });
    expect(incomplete.ok).toBe(false);
    if (!incomplete.ok) {
      const fields = incomplete.issues.map((i) => i.field);
      expect(fields.some((f) => f === "mission" || f.startsWith("justification"))).toBe(true);
      expect(fields).toContain("KPIs");
    }
  });

  it("covers status enum", () => {
    expect(AGENT_STATUSES).toContain("draft");
    expect(AGENT_STATUSES).toContain("active");
    expect(AGENT_STATUSES).toContain("retired");
  });
});

describe("instantiation gate", () => {
  it("rejects missing independence rationale", () => {
    const issues = validateJustification(
      justification({
        why_independent_context: "short",
        why_independent_tools: "no",
        why_independent_reasoning: "x",
      }),
    );
    expect(issues.some((i) => i.code === "no_independence_need")).toBe(true);
  });

  it("rejects register without evidence refs", () => {
    const reg = new AgentRegistry();
    expect(() =>
      reg.register(
        validDraft({
          justification: justification({ evidence_refs: [] }),
        }),
      ),
    ).toThrow(AgentRegistryError);
  });

  it("does not allow register directly as active", () => {
    const reg = new AgentRegistry();
    expect(() => reg.register(validDraft({ status: "active" }))).toThrow(/activate/i);
  });

  it("registers proposed then activates with human reviewer", () => {
    const reg = new AgentRegistry();
    const proposed = reg.register(validDraft({ status: "proposed" }));
    expect(proposed.status).toBe("proposed");
    expect(reg.count()).toBe(1);

    expect(() => reg.activate(proposed.id, "gpt-bot")).toThrow(/human/i);
    const active = reg.activate(proposed.id, "founder");
    expect(active.status).toBe("active");
    expect(active.last_reviewed).toBeTruthy();
  });

  it("will not spawn agents for every capability label", () => {
    const reg = new AgentRegistry();
    // Document intent: capabilities may be tagged on a justified agent, not mass-created
    reg.register(
      validDraft({
        id: "agent_support_draft_only",
        capabilities: ["support"],
        status: "draft",
      }),
    );
    expect(reg.count()).toBe(1);
    expect(reg.count()).toBeLessThan(POSSIBLE_CAPABILITIES.length);
  });

  it("execute_protected_action requires HITL flag", () => {
    const bad = validateAgentRecord(
      validDraft({
        permissions: ["execute_protected_action", "read_context"],
        approval_requirements: {
          require_hitl_before_side_effects: false,
          approver_roles: ["founder"],
        },
      }),
    );
    expect(bad.ok).toBe(false);
  });
});

describe("lifecycle & serialize", () => {
  it("pause and retire update status", () => {
    const reg = new AgentRegistry();
    reg.register(validDraft({ id: "agent_lifecycle_1", status: "proposed" }));
    reg.activate("agent_lifecycle_1", "founder");
    expect(reg.pause("agent_lifecycle_1", "founder").status).toBe("paused");
    expect(reg.retire("agent_lifecycle_1", "founder").status).toBe("retired");
  });

  it("round-trips serialize/hydrate", () => {
    const reg = new AgentRegistry();
    reg.register(validDraft({ id: "agent_roundtrip_2", status: "draft" }));
    const snap = reg.serialize();
    const reg2 = new AgentRegistry(snap);
    expect(reg2.get("agent_roundtrip_2")?.name).toBe("VoC Triage Assist");
  });
});
