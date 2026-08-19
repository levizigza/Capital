import { describe, expect, it } from "vitest";
import { extractSignals, routeTask, ROUTE_CLASSES } from "./index";
import type { IncomingTask } from "./types";

function task(partial: Partial<IncomingTask> & { description: string }): IncomingTask {
  return {
    id: partial.id ?? "t1",
    description: partial.description,
    tags: partial.tags,
    hints: partial.hints,
  };
}

describe("routeTask — happy paths", () => {
  it("exposes exactly four route classes", () => {
    expect(ROUTE_CLASSES).toEqual([
      "DETERMINISTIC_WORKFLOW",
      "AI_ASSISTED_WORKFLOW",
      "AI_AGENT",
      "HUMAN_DECISION",
    ]);
  });

  it("routes known playbook + low judgment to DETERMINISTIC_WORKFLOW", () => {
    const d = routeTask(
      task({
        description: "Follow the weekly metrics runbook and validate schema invariants",
        tags: ["playbook", "validate"],
      }),
    );
    expect(d.route).toBe("DETERMINISTIC_WORKFLOW");
    expect(d.reason_for_routing).toMatch(/DETERMINISTIC_WORKFLOW/);
    expect(d.reason_for_routing.length).toBeGreaterThan(20);
    expect(d.signals.procedure_known).toBe(true);
  });

  it("routes repeatable calculation to DETERMINISTIC_WORKFLOW", () => {
    const d = routeTask(
      task({
        description: "Calculate contribution margin from the formula inputs",
        hints: { calculation_repeatable: true, low_judgment: true },
      }),
    );
    expect(d.route).toBe("DETERMINISTIC_WORKFLOW");
    expect(d.signals.calculation_repeatable).toBe(true);
  });

  it("routes draft-for-review to AI_ASSISTED_WORKFLOW", () => {
    const d = routeTask(
      task({
        description: "Draft a polite reply summarizing the customer complaint for review",
      }),
    );
    expect(d.route).toBe("AI_ASSISTED_WORKFLOW");
    expect(d.reason_for_routing).toMatch(/AI_ASSISTED_WORKFLOW/);
    expect(d.signals.interpretation_useful).toBe(true);
  });

  it("routes ambiguous multi-step evolving-tool work to AI_AGENT", () => {
    const d = routeTask(
      task({
        description:
          "Investigate why retention dropped — ambiguous root cause; needs multi-step planning " +
          "and tool choice depending on findings as context evolves",
        tags: ["ambiguous", "multi-step", "adaptive-tools"],
      }),
    );
    expect(d.route).toBe("AI_AGENT");
    expect(d.reason_for_routing).toMatch(/AI_AGENT/);
    expect(d.signals.ai_agent_eligible).toBe(true);
  });

  it("routes pricing strategy change to HUMAN_DECISION", () => {
    const d = routeTask(task({ description: "Raise pricing for the family plan" }));
    expect(d.route).toBe("HUMAN_DECISION");
    expect(d.signals.consequence_reasons).toContain("financially_material");
  });
});

describe("routeTask — ambiguous edge cases", () => {
  it("HUMAN_DECISION wins over deterministic calc when financially material", () => {
    // Edge: repeatable formula BUT material pricing — human must decide
    const d = routeTask(
      task({
        description: "Calculate new price points and change pricing in production",
        hints: {
          calculation_repeatable: true,
          programmatically_validatable: true,
          low_judgment: true,
          consequences: { financially_material: true },
        },
      }),
    );
    expect(d.route).toBe("HUMAN_DECISION");
    expect(d.signals.deterministic_eligible).toBe(true);
    expect(d.reason_for_routing).toMatch(/financially_material|HUMAN_DECISION/);
  });

  it("HUMAN_DECISION wins when legal sensitivity coexists with a known SOP", () => {
    const d = routeTask(
      task({
        description: "Follow the contract amendment SOP to update ToS",
        tags: ["runbook"],
        hints: { procedure_known: true, low_judgment: true, consequences: { legally_sensitive: true } },
      }),
    );
    expect(d.route).toBe("HUMAN_DECISION");
    expect(d.signals.procedure_known).toBe(true);
  });

  it("privacy / children ethics language forces HUMAN_DECISION", () => {
    const d = routeTask(
      task({
        description: "Update privacy policy for how we handle children's data",
      }),
    );
    expect(d.route).toBe("HUMAN_DECISION");
    expect(
      d.signals.consequence_reasons.some((r) =>
        ["ethically_significant", "legally_sensitive"].includes(r),
      ),
    ).toBe(true);
  });

  it("irreversible delete-all does not become AI_AGENT even if ambiguous", () => {
    const d = routeTask(
      task({
        description:
          "Figure out an ambiguous multi-step plan to permanently delete all customer data, " +
          "adapting tools depending on findings",
        hints: {
          ambiguous: true,
          multi_step_planning: true,
          evolving_tool_choice: true,
        },
      }),
    );
    expect(d.route).toBe("HUMAN_DECISION");
    expect(d.signals.ai_agent_eligible).toBe(true);
  });

  it("ambiguous alone is NOT enough for AI_AGENT → AI_ASSISTED", () => {
    const d = routeTask(
      task({
        description: "Something is wrong with onboarding — unclear, investigate lightly",
        tags: ["ambiguous"],
      }),
    );
    expect(d.signals.ambiguous).toBe(true);
    expect(d.signals.multi_step_planning).toBe(false);
    expect(d.route).not.toBe("AI_AGENT");
    expect(d.route).toBe("AI_ASSISTED_WORKFLOW");
    expect(d.reason_for_routing).toBeTruthy();
  });

  it("multi-step without ambiguity/evolving tools is not AI_AGENT", () => {
    const d = routeTask(
      task({
        description: "Create a multi-step content roadmap of actions for blog posts",
        hints: { multi_step_planning: true, interpretation_useful: true, output_reviewable: true },
      }),
    );
    expect(d.route).toBe("AI_ASSISTED_WORKFLOW");
    expect(d.signals.ai_agent_eligible).toBe(false);
  });

  it("two of three agent criteria still deny AI_AGENT", () => {
    const d = routeTask(
      task({
        id: "edge-2of3",
        description: "Open-ended investigate retention with multi-step planning",
        hints: {
          ambiguous: true,
          multi_step_planning: true,
          evolving_tool_choice: false,
          interpretation_useful: true,
          output_reviewable: true,
        },
      }),
    );
    expect(d.signals.ambiguous).toBe(true);
    expect(d.signals.multi_step_planning).toBe(true);
    expect(d.signals.evolving_tool_choice).toBe(false);
    expect(d.route).toBe("AI_ASSISTED_WORKFLOW");
  });

  it("deterministic hints beat vague AI-ish wording when criteria hold", () => {
    const d = routeTask(
      task({
        description: "Maybe think about summing last week's fees using the formula",
        hints: {
          calculation_repeatable: true,
          programmatically_validatable: true,
          low_judgment: true,
        },
      }),
    );
    expect(d.route).toBe("DETERMINISTIC_WORKFLOW");
  });

  it("strategic pivot language → HUMAN even with agent-shaped hints", () => {
    const d = routeTask(
      task({
        description: "Pivot the company mission after ambiguous multi-step research",
        hints: {
          ambiguous: true,
          multi_step_planning: true,
          evolving_tool_choice: true,
          consequences: { strategic: true },
        },
      }),
    );
    expect(d.route).toBe("HUMAN_DECISION");
  });

  it("empty description routes to assisted with explicit reason (not agent)", () => {
    const d = routeTask({ id: "empty", description: "" });
    expect(d.route).toBe("AI_ASSISTED_WORKFLOW");
    expect(d.reason_for_routing).toMatch(/empty/i);
    expect(d.route).not.toBe("AI_AGENT");
    expect(d.route).not.toBe("DETERMINISTIC_WORKFLOW");
  });

  it("requires task id", () => {
    expect(() => routeTask({ id: "", description: "x" })).toThrow(/id/i);
  });

  it("always returns reason_for_routing and considered list", () => {
    const samples = [
      task({ description: "Follow the refund checklist procedure" }),
      task({ description: "Draft marketing tweet for review" }),
      task({
        description: "Ambiguous outage — multi-step plan, tool choice depending on results",
        tags: ["ambiguous", "multi-step"],
        hints: { evolving_tool_choice: true },
      }),
      task({ description: "Sign a legal NDA with the vendor" }),
    ];
    for (const t of samples) {
      const d = routeTask(t);
      expect(d.reason_for_routing.length).toBeGreaterThan(10);
      expect(d.considered).toContain(d.route);
      expect(ROUTE_CLASSES).toContain(d.route);
    }
  });

  it("mass refund is financially material HUMAN_DECISION not deterministic", () => {
    const d = routeTask(
      task({
        description: "Mass refund all subscribers using the refund formula",
        hints: { calculation_repeatable: true, low_judgment: true },
      }),
    );
    expect(d.route).toBe("HUMAN_DECISION");
  });

  it("pure unit-economics compute without strategy language stays DETERMINISTIC", () => {
    const d = routeTask(
      task({
        description: "Compute unit economics and validate contribution margin formula",
      }),
    );
    expect(d.route).toBe("DETERMINISTIC_WORKFLOW");
    expect(d.signals.human_consequence).toBe(false);
  });
});

describe("extractSignals", () => {
  it("does not mark agent eligible unless all three flags fire", () => {
    const s = extractSignals(
      task({
        description: "unclear investigate with planning",
        hints: { ambiguous: true, multi_step_planning: true },
      }),
    );
    expect(s.ai_agent_eligible).toBe(false);
  });
});
