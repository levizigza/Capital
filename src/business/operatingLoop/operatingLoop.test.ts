import { describe, expect, it } from "vitest";
import {
  BUSINESS_LANES,
  CRITICAL_CHAIN,
  CapitalOperatingLoop,
  HANDOFF_STAGE,
  LOOP_STAGES,
  OperatingLoopBus,
  acceptHandoff,
  computeValueEfficiency,
  laneStageParticipation,
  runCriticalHandoffChain,
} from "./index";

describe("universal loop catalog", () => {
  it("defines six stages and eight business lanes", () => {
    expect(LOOP_STAGES).toEqual([
      "OBSERVE",
      "LEARN",
      "DECIDE",
      "ACT",
      "MEASURE",
      "REMEMBER",
    ]);
    expect(BUSINESS_LANES).toEqual([
      "product",
      "marketing",
      "sales",
      "customer_success",
      "finance",
      "research",
      "operations",
      "ai_workers",
    ]);
  });

  it("maps every lane into at least one loop stage (no silos)", () => {
    const map = laneStageParticipation();
    for (const lane of BUSINESS_LANES) {
      expect(map[lane].length).toBeGreaterThan(0);
      for (const stage of map[lane]) {
        expect(LOOP_STAGES).toContain(stage);
      }
    }
  });
});

describe("critical handoffs", () => {
  it("rejects handoffs without evidence", () => {
    const r = acceptHandoff({
      kind: "customer_feedback",
      trace_id: "t1",
      parent_event_id: null,
      summary: "Players stuck at hush",
      evidence_refs: [],
      prior_kinds: [],
    });
    expect(r.accepted).toBe(false);
    expect(r.reason).toMatch(/evidence/i);
  });

  it("rejects skipping chain steps (no silo jumps)", () => {
    const r = acceptHandoff({
      kind: "experiment",
      trace_id: "t1",
      parent_event_id: "x",
      summary: "skip ahead",
      evidence_refs: ["uri://x"],
      prior_kinds: ["customer_feedback"],
    });
    expect(r.accepted).toBe(false);
    expect(r.reason).toMatch(/expected next/i);
  });

  it("runs feedback → VoC → hypothesis → experiment → product → cohort → decision → memory → marketing", async () => {
    const bus = new OperatingLoopBus();
    const seen: string[] = [];
    bus.subscribe("*", (e) => {
      seen.push(e.kind);
    });

    const trace = await runCriticalHandoffChain(bus, {
      feedback_summary: "Soft Beat hush confuses first-time parents",
      evidence_refs: ["uri://voc/clip-33", "uri://playtest/w33"],
      value_estimate: 50,
      cost_estimate: 10,
      founder_minutes: 40,
    });

    expect(trace.completed_chain).toBe(true);
    expect(trace.events.map((e) => e.kind)).toEqual([...CRITICAL_CHAIN]);
    expect(seen).toEqual([...CRITICAL_CHAIN]);

    // Stages progress through the loop vocabulary
    expect(trace.events[0]?.stage).toBe("OBSERVE");
    expect(HANDOFF_STAGE.company_memory).toBe("REMEMBER");
    expect(trace.events.at(-1)?.kind).toBe("marketing_insight");
    expect(trace.events.at(-1)?.lane).toBe("marketing");

    // Parent linkage
    for (let i = 1; i < trace.events.length; i++) {
      expect(trace.events[i]!.parent_event_id).toBe(trace.events[i - 1]!.id);
    }

    expect(bus.history(trace.trace_id)).toHaveLength(CRITICAL_CHAIN.length);
  });
});

describe("value objective", () => {
  it("scores value per dollar per time per founder hour — not agent count", () => {
    const efficient = computeValueEfficiency({
      value: 100,
      cost: 10,
      time_hours: 2,
      founder_minutes: 60,
    })!;
    const wasteful = computeValueEfficiency({
      value: 100,
      cost: 100,
      time_hours: 20,
      founder_minutes: 600,
    })!;
    expect(efficient.score).toBeGreaterThan(wasteful.score);
    expect(efficient.note).toMatch(/not agent count/i);
  });

  it("prioritizes traces by efficiency for founder attention", async () => {
    const loop = new CapitalOperatingLoop();
    const high = await loop.runCustomerInsightLoop({
      feedback_summary: "High-value insight",
      evidence_refs: ["uri://a"],
      value_estimate: 200,
      cost_estimate: 5,
      founder_minutes: 20,
    });
    const low = await loop.runCustomerInsightLoop({
      feedback_summary: "Low-efficiency busywork path",
      evidence_refs: ["uri://b"],
      value_estimate: 10,
      cost_estimate: 50,
      founder_minutes: 200,
    });
    // Override efficiencies via prioritize using computed ones
    const ranked = loop.prioritizeTraces([low, high]);
    expect(ranked[0]?.trace_id).toBe(high.trace_id);
  });
});
