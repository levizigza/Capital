import { describe, expect, it } from "vitest";
import {
  AI_ALLOWED_ACTIONS,
  AI_FORBIDDEN_ACTIONS,
  SalesOs,
  SalesOsError,
  assertAiActionAllowed,
  detectForbiddenPayload,
} from "./index";
import { AiDeniedError } from "./permissions";

describe("AI permissions", () => {
  it("allows assist actions and denies forbidden ones", () => {
    expect(AI_ALLOWED_ACTIONS).toContain("draft_outreach");
    expect(AI_FORBIDDEN_ACTIONS).toContain("change_official_pricing");
    expect(() => assertAiActionAllowed("draft_outreach")).not.toThrow();
    expect(() => assertAiActionAllowed("make_contractual_commitments")).toThrow(AiDeniedError);
    expect(() => assertAiActionAllowed("offer_unapproved_discounts")).toThrow(AiDeniedError);
    expect(() => assertAiActionAllowed("make_financial_guarantees")).toThrow(AiDeniedError);
    expect(() => assertAiActionAllowed("misrepresent_product_capabilities")).toThrow(
      AiDeniedError,
    );
  });

  it("detects forbidden language in payloads", () => {
    expect(detectForbiddenPayload("we hereby agree to a binding contract")).toBe(
      "make_contractual_commitments",
    );
    expect(detectForbiddenPayload("change official pricing to $1")).toBe(
      "change_official_pricing",
    );
    expect(detectForbiddenPayload("I can give you a discount 20% off")).toBe(
      "offer_unapproved_discounts",
    );
    expect(detectForbiddenPayload("guaranteed ROI next month")).toBe(
      "make_financial_guarantees",
    );
    expect(detectForbiddenPayload("replaces your financial advisor")).toBe(
      "misrepresent_product_capabilities",
    );
  });
});

describe("SalesOs CRM", () => {
  it("captures leads with required operating fields", () => {
    const os = new SalesOs();
    const lead = os.captureLead({
      id: "lead_1",
      contact_name: "Alex Parent",
      contact_email: "alex@example.com",
      lead_source: "content",
      expected_value: 120,
    });
    expect(lead.pipeline_stage).toBe("captured");
    expect(lead.qualification).toBe("unreviewed");
    expect(lead.icp_classification).toBe("unknown");
    expect(lead.offer_shown).toBeNull();
    expect(lead.conversion.converted).toBe(false);
    expect(lead.expected_value).toBe(120);
  });

  it("advances pipeline and records offer/conversion", () => {
    const os = new SalesOs();
    os.captureLead({
      id: "lead_pipe",
      contact_name: "Sam",
      contact_email: "sam@example.com",
      lead_source: "referral",
      expected_value: 200,
    });
    os.advanceStage("lead_pipe", "qualified", "human:ae");
    os.advanceStage("lead_pipe", "meeting_demo", "human:ae");
    os.recordOffer(
      "lead_pipe",
      {
        offer_id: "offer_family_annual",
        name: "Family Annual",
        amount: 180,
        currency: "USD",
        shown_at: "2026-08-14T12:00:00.000Z",
        discount_applied: false,
      },
      "human:ae",
    );
    expect(os.getLead("lead_pipe")?.pipeline_stage).toBe("offer");
    expect(() =>
      os.recordOffer(
        "lead_pipe",
        {
          offer_id: "bad",
          name: "Secret deal",
          amount: 1,
          currency: "USD",
          shown_at: "2026-08-14T12:00:00.000Z",
          discount_applied: true,
        },
        "agent",
      ),
    ).toThrow(/discount/i);

    const paid = os.advanceStage("lead_pipe", "paid", "human:ae");
    expect(paid.conversion.converted).toBe(true);
    expect(paid.conversion.amount).toBe(180);
  });

  it("requires lost_reason", () => {
    const os = new SalesOs();
    os.captureLead({
      id: "lead_lost",
      contact_name: "Pat",
      contact_email: "pat@example.com",
      lead_source: "outbound",
    });
    expect(() => os.markLost("lead_lost", "", "human:ae")).toThrow(SalesOsError);
    const lost = os.markLost("lead_lost", "Not ICP — enterprise only", "human:ae");
    expect(lost.pipeline_stage).toBe("lost");
    expect(lost.lost_reason).toMatch(/ICP/);
  });
});

describe("AI assist", () => {
  it("may research, draft, identify objections, follow-up, summarize, update CRM fields", () => {
    const os = new SalesOs();
    os.captureLead({
      id: "lead_ai",
      contact_name: "Jordan",
      contact_email: "jordan@example.com",
      lead_source: "organic",
      expected_value: 99,
    });

    expect(
      os.aiAssist({
        id: "r1",
        lead_id: "lead_ai",
        action: "research_leads",
        actor: "agent:sales_assist",
        payload: { notes: "Parent of two; found Capital via Soft Beat share card" },
        at: "2026-08-14T00:00:00.000Z",
      }).status,
    ).toBe("ok");

    expect(
      os.aiAssist({
        id: "r2",
        lead_id: "lead_ai",
        action: "prepare_context",
        actor: "agent:sales_assist",
        payload: {},
        at: "2026-08-14T00:00:00.000Z",
      }).output?.context,
    ).toMatchObject({ lead_id: "lead_ai" });

    expect(
      os.aiAssist({
        id: "r3",
        lead_id: "lead_ai",
        action: "draft_outreach",
        actor: "agent:sales_assist",
        payload: { draft: "Hi Jordan — saw you tried Harbor. Happy to walk Soft Beat." },
        at: "2026-08-14T00:00:00.000Z",
      }).status,
    ).toBe("ok");

    os.aiAssist({
      id: "r4",
      lead_id: "lead_ai",
      action: "identify_objections",
      actor: "agent:sales_assist",
      payload: { objection: "Worried it is only for kids, not parents" },
      at: "2026-08-14T00:00:00.000Z",
    });
    expect(os.getLead("lead_ai")?.objections.length).toBe(1);

    os.aiAssist({
      id: "r5",
      lead_id: "lead_ai",
      action: "recommend_follow_up",
      actor: "agent:sales_assist",
      payload: { next_action: "Send Soft Beat clip + book demo" },
      at: "2026-08-14T00:00:00.000Z",
    });
    expect(os.getLead("lead_ai")?.next_action).toMatch(/demo/);

    os.aiAssist({
      id: "r6",
      lead_id: "lead_ai",
      action: "summarize_conversations",
      actor: "agent:sales_assist",
      payload: { summary: "Interested in Family plan; asked about Soft Beat teach moment." },
      at: "2026-08-14T00:00:00.000Z",
    });

    os.aiAssist({
      id: "r7",
      lead_id: "lead_ai",
      action: "update_structured_crm_fields",
      actor: "agent:sales_assist",
      payload: { fields: { icp_classification: "ideal", qualification: "qualifying" } },
      at: "2026-08-14T00:00:00.000Z",
    });
    expect(os.getLead("lead_ai")?.icp_classification).toBe("ideal");
  });

  it("denies forbidden AI actions and bad field updates", () => {
    const os = new SalesOs();
    os.captureLead({
      id: "lead_deny",
      contact_name: "Riley",
      contact_email: "riley@example.com",
      lead_source: "paid_social",
    });

    const denied = os.aiAssist({
      id: "d1",
      lead_id: "lead_deny",
      action: "change_official_pricing",
      actor: "agent:sales_assist",
      payload: {},
      at: "2026-08-14T00:00:00.000Z",
    });
    expect(denied.status).toBe("denied");

    const draftDenied = os.aiAssist({
      id: "d2",
      lead_id: "lead_deny",
      action: "draft_outreach",
      actor: "agent:sales_assist",
      payload: { draft: "We hereby agree to a binding contract at half price" },
      at: "2026-08-14T00:00:00.000Z",
    });
    expect(draftDenied.status).toBe("denied");

    const fieldDenied = os.aiAssist({
      id: "d3",
      lead_id: "lead_deny",
      action: "update_structured_crm_fields",
      actor: "agent:sales_assist",
      payload: { fields: { expected_value: 1, pipeline_stage: "paid" } },
      at: "2026-08-14T00:00:00.000Z",
    });
    expect(fieldDenied.status).toBe("denied");
  });
});

describe("measurement", () => {
  it("tracks funnel, CAC, cycle, revenue/source, retention/source", () => {
    const os = new SalesOs();
    os.setSpend("content", 300);
    os.setSpend("referral", 0);

    os.captureLead({
      id: "lead_m1",
      contact_name: "A",
      contact_email: "a@example.com",
      lead_source: "content",
      expected_value: 100,
    });
    os.captureLead({
      id: "lead_m2",
      contact_name: "B",
      contact_email: "b@example.com",
      lead_source: "content",
      expected_value: 100,
    });
    os.captureLead({
      id: "lead_m3",
      contact_name: "C",
      contact_email: "c@example.com",
      lead_source: "referral",
      expected_value: 150,
    });

    os.advanceStage("lead_m1", "qualified", "ae");
    os.advanceStage("lead_m1", "meeting_demo", "ae");
    os.advanceStage("lead_m1", "offer", "ae");
    os.updateLead(
      "lead_m1",
      {
        captured_at: "2026-08-01T00:00:00.000Z",
        conversion: { converted: true, paid_at: "2026-08-11T00:00:00.000Z", amount: 100 },
        pipeline_stage: "paid",
        retention_rate: 0.8,
      },
      "ae",
    );

    os.advanceStage("lead_m3", "qualified", "ae");
    os.advanceStage("lead_m3", "meeting_demo", "ae");
    os.advanceStage("lead_m3", "offer", "ae");
    os.updateLead(
      "lead_m3",
      {
        captured_at: "2026-08-01T00:00:00.000Z",
        conversion: { converted: true, paid_at: "2026-08-21T00:00:00.000Z", amount: 150 },
        pipeline_stage: "paid",
        retention_rate: 0.5,
      },
      "ae",
    );

    const m = os.measurement();
    expect(m.stage_conversions.counts.captured).toBe(3);
    expect(m.stage_conversions.lead_to_qualified).toBeGreaterThan(0);
    expect(m.stage_conversions.offer_to_paid).toBeGreaterThan(0);

    const content = m.by_source.find((s) => s.lead_source === "content");
    expect(content?.paid).toBe(1);
    expect(content?.revenue).toBe(100);
    expect(content?.cac).toBe(300);
    expect(content?.retention_rate).toBe(0.8);
    expect(content?.avg_sales_cycle_days).toBe(10);

    const referral = m.by_source.find((s) => s.lead_source === "referral");
    expect(referral?.revenue).toBe(150);
    expect(referral?.avg_sales_cycle_days).toBe(20);
  });
});
