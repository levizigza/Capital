import { describe, expect, it } from "vitest";
import {
  CapitalOperator,
  PROTECTED_DOMAINS,
  classifyTask,
  createInMemoryContextPort,
  createInMemoryMemoryPort,
  createInMemoryMetricsPort,
  createInMemoryAuditStore,
  approvalBlockReason,
  isHumanApprover,
} from "./index";
import type { ApprovalEvent, OperatorRequest } from "./types";

function req(input: {
  id?: string;
  signal: string;
  tags?: string[];
  touches?: OperatorRequest["observation"]["touches"];
  approvals?: OperatorRequest["approvals"];
  force_mode?: OperatorRequest["force_mode"];
  actor?: string;
}): OperatorRequest {
  return {
    id: input.id ?? "req-1",
    observed_at: "2026-08-14T00:00:00.000Z",
    actor: input.actor ?? "ops",
    observation: {
      signal: input.signal,
      tags: input.tags,
      touches: input.touches,
    },
    approvals: input.approvals,
    force_mode: input.force_mode,
  };
}

describe("classifyTask", () => {
  it("routes pricing language to propose_protected_change", () => {
    const c = classifyTask({ signal: "Change pricing to $9.99" });
    expect(c.task_class).toBe("propose_protected_change");
    expect(c.touched_domains).toContain("pricing_strategy");
    expect(c.mode).toBe("deterministic");
  });

  it("uses deterministic metrics path", () => {
    const c = classifyTask({ signal: "Update KPI dashboard", tags: ["metrics"] });
    expect(c.task_class).toBe("operational_metrics");
    expect(c.mode).toBe("deterministic");
  });

  it("selects ai_reasoning for open analysis", () => {
    const c = classifyTask({ signal: "Brainstorm harbor retention ideas", tags: ["ai"] });
    expect(c.task_class).toBe("request_ai_reasoning");
    expect(c.mode).toBe("ai_reasoning");
  });
});

describe("approvals", () => {
  it("rejects agent-like approvers", () => {
    expect(isHumanApprover("founder")).toBe(true);
    expect(isHumanApprover("gpt-4")).toBe(false);
    expect(isHumanApprover("agent")).toBe(false);
  });

  it("blocks protected actions without ApprovalEvent", () => {
    const reason = approvalBlockReason(
      {
        id: "act_1",
        kind: "protected_mutation",
        summary: "change mission",
        protected_domain: "company_mission",
        payload: {},
      },
      [],
    );
    expect(reason).toMatch(/ApprovalEvent/);
  });
});

describe("CapitalOperator", () => {
  it("lists all eight protected domains", () => {
    expect(PROTECTED_DOMAINS).toHaveLength(8);
  });

  it("completes observe-only without mutating protected domains", async () => {
    const metrics = createInMemoryMetricsPort();
    const memory = createInMemoryMemoryPort();
    const auditStore = createInMemoryAuditStore();
    const op = new CapitalOperator({
      context: createInMemoryContextPort([
        { ref: "c1", title: "ICP", body: "Parents teaching money" },
      ]),
      metrics,
      memory,
      auditStore,
    });

    const result = await op.run(req({ signal: "What is Harbor status today?", tags: ["summarize"] }));
    expect(result.status).toBe("completed");
    expect(result.blocked_actions).toHaveLength(0);
    expect(result.memory_refs.length).toBe(1);
    expect(memory.records[0]?.from_agent).toBe(true);
    expect(metrics.entries.some((e) => e.name.startsWith("operator.run."))).toBe(true);

    const audit = auditStore.get(result.audit_id);
    expect(audit).not.toBeNull();
    expect(audit!.phases.map((p) => p.phase)).toContain("preserve_memory");
    expect(audit!.phases.map((p) => p.phase)).toContain("update_metrics");
  });

  it("never executes pricing change without approval", async () => {
    const op = new CapitalOperator();
    const result = await op.run(
      req({ id: "price-1", signal: "Update pricing strategy to freemium" }),
    );
    expect(result.status).toBe("blocked_pending_approval");
    expect(result.executed_actions).toHaveLength(0);
    expect(result.blocked_actions.length).toBeGreaterThan(0);
    expect(result.blocked_actions[0]?.protected_domain).toBe("pricing_strategy");
    expect(result.proposed_actions[0]?.protected_domain).toBe("pricing_strategy");
  });

  it("executes protected action only with human ApprovalEvent", async () => {
    const op = new CapitalOperator();
    const probe = await op.run(req({ id: "price-2b", signal: "Change pricing tier names" }));
    expect(probe.status).toBe("blocked_pending_approval");
    const actionId = probe.proposed_actions[0]!.id;

    const approval: ApprovalEvent = {
      id: "appr-1",
      domain: "pricing_strategy",
      action_id: actionId,
      approver: "founder",
      approved_at: "2026-08-14T12:00:00.000Z",
      note: "Approved trial price change after review",
    };
    const aligned = await op.run(
      req({
        id: "price-2b",
        signal: "Change pricing tier names",
        approvals: [approval],
      }),
    );
    expect(aligned.status).toBe("completed");
    expect(aligned.executed_actions).toHaveLength(1);
    expect(aligned.blocked_actions).toHaveLength(0);
  });

  it("rejects ApprovalEvent from agent slug", async () => {
    const op = new CapitalOperator();
    const result = await op.run(
      req({
        id: "deploy-1",
        signal: "Deploy to production now",
        approvals: [
          {
            id: "appr-bad",
            domain: "production_deployments",
            action_id: "act_production_deployments_deploy-1",
            approver: "gpt-bot",
            approved_at: "2026-08-14T12:00:00.000Z",
            note: "I approve myself",
          },
        ],
      }),
    );
    expect(result.status).toBe("blocked_pending_approval");
    expect(result.executed_actions).toHaveLength(0);
  });

  it("blocks mission, privacy, legal, finance, public comms, irreversible without approval", async () => {
    const op = new CapitalOperator();
    const signals: { signal: string; domain: string }[] = [
      { signal: "Rewrite company mission", domain: "company_mission" },
      { signal: "Change privacy policy retention", domain: "customer_privacy_policy" },
      { signal: "Sign legal contract with vendor", domain: "legal_commitments" },
      { signal: "Issue stripe refund in production", domain: "production_financial_transactions" },
      { signal: "Publish press launch announce", domain: "high_impact_public_communications" },
      { signal: "Pivot and kill the product", domain: "irreversible_strategic_decisions" },
    ];
    for (const { signal, domain } of signals) {
      const result = await op.run(req({ id: `t-${domain}`, signal }));
      expect(result.status).toBe("blocked_pending_approval");
      expect(result.blocked_actions.some((b) => b.protected_domain === domain)).toBe(true);
    }
  });

  it("keeps AI reasoning drafts non-protected and auditable", async () => {
    const auditStore = createInMemoryAuditStore();
    const op = new CapitalOperator({ auditStore });
    const result = await op.run(
      req({ id: "ai-1", signal: "Analyze soft beat retention", tags: ["ai", "reason"] }),
    );
    expect(result.classification.mode).toBe("ai_reasoning");
    expect(result.proposed_actions.every((a) => a.protected_domain == null)).toBe(true);
    const audit = auditStore.get(result.audit_id)!;
    expect(audit.phases.some((p) => p.phase === "delegate")).toBe(true);
    expect(audit.result?.memory_refs.length).toBe(1);
  });

  it("records typed result with audit id", async () => {
    const op = new CapitalOperator();
    const result = await op.run(req({ signal: "Harbor status", tags: ["summarize"] }));
    expect(result.request_id).toBe("req-1");
    expect(result.audit_id).toMatch(/^audit_/);
    expect(result.classification.task_class).toBeTruthy();
    expect(result.confidence.score).toBeGreaterThanOrEqual(0);
  });
});
