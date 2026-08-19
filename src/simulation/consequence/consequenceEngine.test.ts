import { describe, expect, it } from "vitest";
import { createConsequenceEngine } from "./engine";
import { coveTakeCommit, paycheckTakeCommit } from "./fixtures";
import {
  recordedAlternativeIds,
  whatCouldThePlayerHaveDoneDifferently,
  whatHappened,
  whatPreviousDecisionContributed,
  whyDidItHappen,
} from "./queries";
import { SchemaError, assertSpineVisibility, validateCommitSpec } from "./validate";
import type { DecisionCommitSpec } from "./types";

function tinyCommit(over: Partial<DecisionCommitSpec> = {}): DecisionCommitSpec {
  return {
    id: "d1",
    verb: "buy",
    choiceId: "yes",
    chosenLabel: "Buy the booth",
    alternatives: [
      { id: "yes", label: "Buy the booth" },
      { id: "no", label: "Walk away" },
    ],
    consequences: [
      {
        key: "money:IMMEDIATE",
        domain: "money",
        horizon: "IMMEDIATE",
        visibility: "felt",
        certainty_type: "certain",
        reversibility: "costly",
        magnitude: -40,
        affected_entities: [{ kind: "player", id: "player:self", label: "Voyager" }],
        explanation_data: {
          whatHappened: "Coins left the pouch.",
          whyItHappened: "You bought the booth.",
          priorDecisionHint: null,
          counterfactual: "Walk away would have kept the coins.",
        },
      },
    ],
    ...over,
  };
}

describe("consequence schema validation", () => {
  it("rejects a decision with no consequences", () => {
    expect(() => validateCommitSpec(tinyCommit({ consequences: [] }))).toThrow(SchemaError);
  });

  it("rejects missing unchosen alternatives", () => {
    expect(() =>
      validateCommitSpec(
        tinyCommit({
          alternatives: [{ id: "yes", label: "Buy the booth" }],
        }),
      ),
    ).toThrow(/unchosen/);
  });

  it("rejects counterfactuals that invent options", () => {
    const spec = tinyCommit();
    spec.consequences[0]!.explanation_data.counterfactual = "You could have hired a crew.";
    expect(() => validateCommitSpec(spec)).toThrow(/counterfactual/);
  });

  it("rejects IMMEDIATE with nonzero delay", () => {
    const spec = tinyCommit();
    spec.consequences[0]!.delayTicks = 2;
    expect(() => validateCommitSpec(spec)).toThrow(/IMMEDIATE/);
  });

  it("rejects conditional without conditionId", () => {
    const spec = tinyCommit();
    spec.consequences[0]!.certainty_type = "conditional";
    expect(() => validateCommitSpec(spec)).toThrow(/conditionId/);
  });

  it("warns when spine LONG_TERM has no IMMEDIATE row", () => {
    const warnings = assertSpineVisibility([
      {
        key: "x",
        domain: "story",
        horizon: "LONG_TERM",
        delayTicks: 8,
        visibility: "hidden",
        certainty_type: "certain",
        reversibility: "irreversible",
        magnitude: 0,
        affected_entities: [{ kind: "player", id: "player:self", label: "V" }],
        explanation_data: {
          whatHappened: "Later.",
          whyItHappened: "Because.",
          priorDecisionHint: null,
          counterfactual: "Walk away",
        },
      },
    ]);
    expect(warnings.some((w) => w.includes("LONG_TERM"))).toBe(true);
  });
});

describe("consequence engine clock", () => {
  it("fires IMMEDIATE rows on commit", () => {
    const engine = createConsequenceEngine();
    engine.commitDecision(tinyCommit());
    expect(engine.now()).toBe(0);
    expect(engine.listFired()).toHaveLength(1);
    expect(engine.listPending()).toHaveLength(0);
    expect(engine.listFired()[0]!.trigger_time.horizon).toBe("IMMEDIATE");
  });

  it("does not fire delayed rows until advance", () => {
    const engine = createConsequenceEngine();
    engine.commitDecision(coveTakeCommit("save"));
    const pending = engine.listPending().map((c) => c.trigger_time.horizon);
    expect(pending).toEqual(expect.arrayContaining(["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"]));
    expect(engine.listFired().every((c) => c.trigger_time.horizon === "IMMEDIATE")).toBe(true);

    engine.advance(1);
    expect(engine.listFired().some((c) => c.domain === "story")).toBe(true);
    expect(engine.listFired().some((c) => c.domain === "neighborhood")).toBe(false);

    engine.advance(2);
    expect(engine.listFired().some((c) => c.domain === "neighborhood")).toBe(true);
    expect(engine.listFired().some((c) => c.domain === "future_opportunities")).toBe(false);

    engine.advance(5);
    expect(engine.listFired().some((c) => c.domain === "future_opportunities")).toBe(true);
    expect(engine.listPending()).toHaveLength(0);
  });

  it("blocks conditional rows when the predicate is false", () => {
    const engine = createConsequenceEngine();
    engine.commitDecision(coveTakeCommit("save"));
    engine.commitDecision(paycheckTakeCommit({ priorCoveDecisionId: "cove_save_vs_spend" }));
    engine.advance(8);
    const credit = engine.getConsequence(
      "consequence:paycheck_protect_vs_spend:future_opportunities:LONG_TERM",
    );
    expect(credit?.status).toBe("blocked");
  });

  it("fires conditional rows when the predicate is true", () => {
    const engine = createConsequenceEngine();
    engine.commitDecision(coveTakeCommit("save"));
    engine.commitDecision(paycheckTakeCommit({ priorCoveDecisionId: "cove_save_vs_spend" }));
    engine.setCondition("freedom_seal", true);
    engine.advance(8);
    const credit = engine.getConsequence(
      "consequence:paycheck_protect_vs_spend:future_opportunities:LONG_TERM",
    );
    expect(credit?.status).toBe("fired");
  });

  it("cancel keeps an audit reason", () => {
    const engine = createConsequenceEngine();
    engine.commitDecision(coveTakeCommit("save"));
    const id = "consequence:cove_save_vs_spend:neighborhood:MEDIUM_TERM";
    engine.cancel(id, "player left Harbor before weather resolved");
    engine.advance(3);
    expect(engine.getConsequence(id)?.status).toBe("cancelled");
    expect(engine.getConsequence(id)?.cancelReason).toMatch(/weather/);
  });
});

describe("save vs spend branch divergence", () => {
  it("save writes business; spend writes debt — not copy-only", () => {
    const saveE = createConsequenceEngine();
    saveE.commitDecision(coveTakeCommit("save"));
    const spendE = createConsequenceEngine();
    spendE.commitDecision(coveTakeCommit("spend"));

    const saveDomains = saveE.listFired().map((c) => c.domain).sort();
    const spendDomains = spendE.listFired().map((c) => c.domain).sort();
    expect(saveDomains).toContain("business");
    expect(saveDomains).not.toContain("debt");
    expect(spendDomains).toContain("debt");
    expect(spendDomains).toContain("risk");
    expect(spendDomains).not.toContain("business");
  });
});

describe("four questions", () => {
  it("answers what / why / prior / counterfactual with evidence", () => {
    const engine = createConsequenceEngine();
    engine.commitDecision(coveTakeCommit("save"));
    engine.advance(1);

    const happened = whatHappened(engine, { decisionId: "cove_save_vs_spend" });
    expect(happened.question).toBe("what_happened");
    expect(happened.sentence).toMatch(/jar/i);
    expect(happened.evidenceIds.length).toBeGreaterThan(0);

    const storyId = "consequence:cove_save_vs_spend:story:SHORT_TERM";
    const why = whyDidItHappen(engine, storyId);
    expect(why.sentence).toMatch(/Memory keeps/i);
    expect(why.causal_path[0]?.fromId).toBe("decision:cove_save_vs_spend");

    const prior = whatPreviousDecisionContributed(engine, storyId);
    expect(prior.sentence).toMatch(/same choice/i);

    const alt = whatCouldThePlayerHaveDoneDifferently(engine, "cove_save_vs_spend");
    expect(alt.sentence).toMatch(/treat/i);
    const recorded = recordedAlternativeIds(engine, "cove_save_vs_spend");
    expect(recorded).toEqual(["save", "spend"]);
    expect(alt.sentence.toLowerCase()).not.toMatch(/hire a crew|lottery|crypto/);
  });

  it("names a previous decision when commits are chained", () => {
    const engine = createConsequenceEngine();
    engine.commitDecision(coveTakeCommit("save"));
    engine.commitDecision(paycheckTakeCommit({ priorCoveDecisionId: "cove_save_vs_spend" }));
    const liq = engine.getConsequence("consequence:paycheck_protect_vs_spend:liquidity:IMMEDIATE")!;
    const prior = whatPreviousDecisionContributed(engine, liq.id);
    expect(prior.evidenceIds).toContain("decision:cove_save_vs_spend");
    expect(prior.sentence).toMatch(/Cove Change/i);
  });
});

describe("isolation", () => {
  it("does not import Islands product modules", async () => {
    const src = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./engine.ts", import.meta.url), "utf8"),
    );
    expect(src).not.toMatch(/from ["']@\/islands/);
    expect(src).not.toMatch(/IslandsApp/);
  });
});
