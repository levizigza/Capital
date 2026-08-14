import { describe, expect, it, vi } from "vitest";
import { AgentRegistry, POSSIBLE_CAPABILITIES } from "../agentRegistry";
import { PublicApiClient } from "../publicApis";
import {
  bootstrapNextAgents,
  runFinanceScenarioResearch,
  runMarketingInsightEnricher,
  runMarketSignalScout,
} from "./nextAgents";
import { CapitalOperatingLoop } from "../operatingLoop";

function mockFetch(map: Record<string, unknown>) {
  return vi.fn(async (url: string) => {
    for (const [key, value] of Object.entries(map)) {
      if (url.includes(key)) return { ok: true, status: 200, json: value };
    }
    return { ok: false, status: 404, json: {} };
  });
}

describe("bootstrapNextAgents", () => {
  it("registers three justified agents without filling every capability role", () => {
    const registry = new AgentRegistry();
    const created = bootstrapNextAgents(registry, { activate: true, reviewer: "founder" });
    expect(created).toHaveLength(3);
    expect(registry.count()).toBe(3);
    expect(registry.count()).toBeLessThan(POSSIBLE_CAPABILITIES.length);
    expect(registry.get("agent_finance_scenario_research")?.status).toBe("active");
    expect(registry.get("agent_marketing_insight_enricher")?.tools).toContain(
      "publicApi:openLibrary",
    );
    expect(registry.get("agent_market_signal_scout")?.capabilities).toContain(
      "market_research",
    );
  });
});

describe("agent runners + public APIs", () => {
  it("finance scenario research uses Frankfurter + dictionary", async () => {
    const client = new PublicApiClient({
      fetchJson: mockFetch({
        "api.frankfurter.app": {
          base: "USD",
          date: "2026-08-14",
          rates: { EUR: 0.86 },
        },
        "dictionaryapi.dev": [
          { meanings: [{ definitions: [{ definition: "The cost of borrowing" }] }] },
        ],
      }),
    });
    const result = await runFinanceScenarioResearch(client, {
      base: "USD",
      quotes: ["EUR"],
      term: "interest",
    });
    expect(result.ok).toBe(true);
    expect(result.evidence_refs.length).toBe(2);
    expect(result.output.disclaimer).toMatch(/not financial advice/i);
  });

  it("marketing enricher requires originating insight id", async () => {
    const client = new PublicApiClient({
      fetchJson: mockFetch({
        "openlibrary.org": { docs: [] },
        "zenquotes.io": [{ q: "x", a: "y" }],
      }),
    });
    const rejected = await runMarketingInsightEnricher(client, {
      originating_insight_id: "",
      insight_summary: "noop",
    });
    expect(rejected.ok).toBe(false);

    const ok = await runMarketingInsightEnricher(client, {
      originating_insight_id: "ins_soft_beat",
      insight_summary: "Hush teaches Cove Change",
      theme: "money habits",
    });
    expect(ok.ok).toBe(true);
    expect(ok.evidence_refs).toContain("ins_soft_beat");
  });

  it("market signal scout returns prices and headlines with disclaimer", async () => {
    const client = new PublicApiClient({
      fetchJson: mockFetch({
        "simple/price": { bitcoin: { usd: 1 } },
        "topstories.json": [9],
        "item/9.json": { title: "Markets move" },
      }),
    });
    const result = await runMarketSignalScout(client, { hn_limit: 1 });
    expect(result.ok).toBe(true);
    expect(result.output.disclaimer).toMatch(/not investment advice/i);
  });
});

describe("operating loop + enricher", () => {
  it("can attach marketing enrichment after critical chain without becoming a silo", async () => {
    const loop = new CapitalOperatingLoop();
    const trace = await loop.runCustomerInsightLoop({
      feedback_summary: "Parents love Plinth share",
      evidence_refs: ["uri://voc/plinth"],
      value_estimate: 80,
      cost_estimate: 8,
      founder_minutes: 30,
    });
    const insightEvent = trace.events.find((e) => e.kind === "marketing_insight")!;
    const client = new PublicApiClient({
      fetchJson: mockFetch({
        "openlibrary.org": {
          docs: [{ title: "The Psychology of Money", author_name: ["Morgan Housel"] }],
        },
        "zenquotes.io": [{ q: "Compound yourself", a: "Unknown" }],
      }),
    });
    const enriched = await runMarketingInsightEnricher(client, {
      originating_insight_id: insightEvent.id,
      insight_summary: insightEvent.summary,
      theme: "personal finance",
    });
    expect(enriched.ok).toBe(true);
    expect(enriched.evidence_refs[0]).toBe(insightEvent.id);
  });
});
