import { describe, expect, it } from "vitest";
import {
  PACKET_SECTIONS,
  WeeklyExecutivePacketGenerator,
  WeeklyPacketError,
  generateWeeklyPacket,
  validateFounderDecision,
} from "./index";
import type { FounderDecisionRequest, WeeklyPacketInputs } from "./types";

function decision(over: Partial<FounderDecisionRequest> = {}): FounderDecisionRequest {
  return {
    id: over.id ?? "dec_pricing_hold",
    title: over.title ?? "Hold list price through Soft Beat retention recovery",
    recommendation:
      over.recommendation ??
      "Do not change official pricing this week; focus on Day-7 retention fix first.",
    evidence: over.evidence ?? [
      "retention day_7 down vs prior week",
      "uri://retention/anomaly-w33",
    ],
    expected_upside: over.expected_upside ?? "Avoid compounding churn with price shock",
    cost: over.cost ?? 0,
    cost_note: over.cost_note ?? "Opportunity cost of delayed price test",
    confidence: over.confidence ?? 0.72,
    reversibility: over.reversibility ?? "Reversible — can resume price test next week",
    worst_case: over.worst_case ?? "Miss short-term ARPU upside",
    alternative: over.alternative ?? "Run a small ICP-only price message test",
    urgency: over.urgency ?? "high",
  };
}

function richInputs(): WeeklyPacketInputs {
  return {
    week_id: "2026-W33",
    week_start: "2026-08-10",
    week_end: "2026-08-16",
    generated_for: "founder",
    what_happened: ["Shipped Soft Beat hush polish", "Paid social CAC spike"],
    customer_truth: {
      themes: ["Confused at hush", "Loves Plinth share"],
      verbatim_samples: ["The quiet moment finally clicked"],
      evidence_refs: ["uri://voc/w33"],
      open_severity: "medium",
    },
    product_truth: {
      shipped: ["Soft Beat camera polish"],
      frictions: ["Day-1 return dip on paid_social cohort"],
      signature_loop_health: "Cove→Paycheck path intact",
      evidence_refs: ["uri://product/w33"],
    },
    demand: { traffic: 12000, signups: 400, activation: 0.42 },
    revenue: { gross: 18000, net: 17100, currency: "USD" },
    contribution_profit: { value: 6200, currency: "USD" },
    cash: { balance: 210000, runway_months: 14, currency: "USD" },
    retention: {
      day_7: 0.31,
      day_30: 0.22,
      paid: 0.81,
      anomalies: ["day_7 drop on paid_social"],
    },
    sales_pipeline: { leads: 40, qualified: 18, meetings: 9, offers: 4, paid: 2 },
    experiments: {
      completed: [{ id: "exp_tip_copy", result: "neutral", evidence_ref: "uri://exp/tip" }],
      in_flight: ["exp_onboarding_path_b"],
    },
    agent_performance: {
      workers: [
        {
          id: "worker_voc",
          completion_rate: 0.9,
          cost_per_task: 0.12,
          escalations: 1,
        },
      ],
    },
    failures: ["worker_retry STOP after max_retries on task_fail"],
    risks: ["Retention drop if we scale paid before diagnosis"],
    opportunities: ["Content from Soft Beat insight → email lesson"],
    founder_decisions: [decision()],
    automatic_actions: [
      {
        id: "act_1",
        action: "Generate next Weekly Packet draft inputs stub",
        owner: "system:weekly-packet",
        scheduled_for: "2026-08-17T09:00:00.000Z",
        requires_founder: false,
      },
    ],
  };
}

describe("PACKET_SECTIONS", () => {
  it("lists all 16 sections", () => {
    expect(PACKET_SECTIONS).toHaveLength(16);
    expect(PACKET_SECTIONS[0]).toBe("WHAT_HAPPENED");
    expect(PACKET_SECTIONS[14]).toBe("DECISIONS_REQUIRED_FROM_FOUNDER");
    expect(PACKET_SECTIONS[15]).toBe("AUTOMATIC_ACTIONS_PLANNED_FOR_NEXT_WEEK");
  });
});

describe("founder decisions", () => {
  it("requires evidence, upside, cost, confidence, reversibility, worst case, alternative", () => {
    expect(validateFounderDecision(decision()).ok).toBe(true);
    const bad = validateFounderDecision(
      decision({
        evidence: [],
        expected_upside: "",
        cost_note: "",
        reversibility: "",
        worst_case: "",
        alternative: "",
        confidence: 2,
      }),
    );
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      const fields = bad.issues.map((i) => i.field);
      expect(fields).toContain("evidence");
      expect(fields).toContain("expected_upside");
      expect(fields).toContain("confidence");
      expect(fields).toContain("reversibility");
      expect(fields).toContain("worst_case");
      expect(fields).toContain("alternative");
    }
  });
});

describe("generateWeeklyPacket", () => {
  it("produces all 16 sections for a full week", () => {
    const packet = generateWeeklyPacket(richInputs());
    expect(packet.sections).toHaveLength(16);
    expect(packet.sections.map((s) => s.id)).toEqual([...PACKET_SECTIONS]);
    expect(packet.purpose).toBe("founder_company_health_without_touring_every_system");
    expect(packet.founder_decisions).toHaveLength(1);
    expect(packet.founder_decisions[0]?.evidence.length).toBeGreaterThan(0);
    expect(packet.automatic_actions[0]?.requires_founder).toBe(false);
    expect(packet.incomplete_sections).toEqual([]);
  });

  it("marks missing operational data as UNKNOWN / incomplete", () => {
    const packet = generateWeeklyPacket({
      week_id: "2026-W33",
      week_start: "2026-08-10",
      week_end: "2026-08-16",
      generated_for: "founder",
    });
    expect(packet.sections).toHaveLength(16);
    expect(packet.incomplete_sections).toContain("REVENUE");
    expect(packet.incomplete_sections).toContain("CUSTOMER_TRUTH");
    const revenue = packet.sections.find((s) => s.id === "REVENUE")!;
    expect(revenue.summary).toMatch(/UNKNOWN/);
    expect(revenue.metrics.every((m) => m.value == null)).toBe(true);
  });

  it("rejects incomplete founder decisions", () => {
    expect(() =>
      generateWeeklyPacket({
        week_id: "2026-W33",
        week_start: "2026-08-10",
        week_end: "2026-08-16",
        generated_for: "founder",
        founder_decisions: [decision({ evidence: [] })],
      }),
    ).toThrow(WeeklyPacketError);
  });

  it("renders markdown a founder can skim", () => {
    const gen = new WeeklyExecutivePacketGenerator();
    const packet = gen.generate(richInputs());
    const md = gen.toMarkdown(packet);
    expect(md).toContain("WHAT HAPPENED");
    expect(md).toContain("CUSTOMER TRUTH");
    expect(md).toContain("DECISIONS REQUIRED FROM FOUNDER");
    expect(md).toContain("Expected upside");
    expect(md).toContain("Worst case");
    expect(md).toContain("Alternative");
  });
});
