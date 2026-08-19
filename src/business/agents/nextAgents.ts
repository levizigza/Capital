/**
 * Justified agent catalog — first three workers with measurable workflow need.
 * Uses public-apis connectors; least-privilege tools only.
 */

import type { AgentRecord, InstantiationJustification } from "../agentRegistry/types";
import { AgentRegistry } from "../agentRegistry/registry";
import { PublicApiClient } from "../publicApis/client";

function at(): string {
  return new Date().toISOString();
}

function justification(over: InstantiationJustification): InstantiationJustification {
  return over;
}

export function buildFinanceScenarioResearchAgent(): AgentRecord {
  const now = at();
  return {
    id: "agent_finance_scenario_research",
    name: "Finance Scenario Research",
    mission: "Gather FX rates and money-term definitions to draft educational Harbor scenarios",
    business_problem:
      "Designers lack fast, sourced FX/term context when authoring Cove→Paycheck teach moments",
    allowed_inputs: ["scenario_theme", "base_currency", "quote_currencies", "money_term"],
    expected_outputs: ["fx_snapshot", "term_definitions", "scenario_research_notes"],
    tools: ["publicApi:frankfurter", "publicApi:dictionary"],
    model: "unassigned",
    context_sources: ["docs:iconic-path", "memory:temporary_working_context"],
    permissions: ["read_context", "call_tools", "write_temp_memory", "propose_action"],
    budget: {
      max_cost_per_run: 0.05,
      max_cost_per_day: 1,
      max_tokens_per_run: 4_000,
      max_runs_per_day: 40,
    },
    KPIs: [
      {
        id: "scenario_research_latency",
        description: "Time to produce sourced FX+term pack",
        measurement: "median seconds",
        target: "<30s",
      },
    ],
    eval_suite: {
      id: "finance_scenario_research_eval",
      description: "Must cite Frankfurter/dictionary attribution; no advice language",
      cases: ["fx_usd_eur", "define_interest", "no_advice_claim"],
      min_pass_rate: 0.85,
    },
    failure_threshold: {
      max_consecutive_failures: 3,
      min_rolling_pass_rate: 0.7,
      rolling_window: 20,
    },
    retry_limit: 1,
    escalation_target: "human:founder",
    approval_requirements: {
      require_hitl_before_side_effects: true,
      min_risk_tier: "LOW",
      approver_roles: ["founder", "product"],
    },
    status: "proposed",
    business_value: {
      narrative:
        "Speeds educational scenario authoring with real FX/term evidence — improves teach quality without inventing rates",
      estimated_monthly_value: null,
    },
    last_reviewed: now,
    capabilities: ["finance_analysis", "product_analysis"],
    justification: justification({
      workflow_id: "wf_harbor_scenario_authoring",
      metric: "hours_to_sourced_scenario_pack",
      baseline: "2h manual lookup",
      target: "10m assisted",
      why_independent_context:
        "Needs FX+dictionary tool outputs isolated from gameplay save state and canonical policy docs",
      why_independent_tools:
        "Requires Frankfurter and Free Dictionary connectors not shared with Sales or deploy agents",
      why_independent_reasoning:
        "Must assemble teach-safe notes without slipping into financial advice claims",
      evidence_refs: [
        "https://github.com/public-apis/public-apis",
        "docs/iconic-path.md",
        "uri://workflow/harbor_scenario_authoring",
      ],
    }),
    created_at: now,
    updated_at: now,
  };
}

export function buildMarketingInsightEnricherAgent(): AgentRecord {
  const now = at();
  return {
    id: "agent_marketing_insight_enricher",
    name: "Marketing Insight Enricher",
    mission:
      "Enrich existing product/customer insights with book hooks and quotes for Product-to-Content",
    business_problem:
      "Marketing drafts risk becoming generic AI filler without sourced hooks tied to Harbor learnings",
    allowed_inputs: ["originating_insight_id", "insight_summary", "theme"],
    expected_outputs: ["enrichment_pack", "book_hooks", "quote_hook"],
    tools: ["publicApi:openLibrary", "publicApi:zenQuotes"],
    model: "unassigned",
    context_sources: ["memory:customer_evidence", "docs:PRODUCT_CONTENT_ENGINE"],
    permissions: ["read_context", "call_tools", "write_temp_memory", "propose_action"],
    budget: {
      max_cost_per_run: 0.05,
      max_cost_per_day: 1,
      max_tokens_per_run: 4_000,
      max_runs_per_day: 30,
    },
    KPIs: [
      {
        id: "insight_backed_enrichment_rate",
        description: "% enrichments that retain originating_insight_id",
        measurement: "rate",
        target: "100%",
      },
    ],
    eval_suite: {
      id: "marketing_enricher_eval",
      description: "Rejects runs without originating insight; attributions present",
      cases: ["requires_insight_id", "open_library_hooks", "quote_optional"],
      min_pass_rate: 0.9,
    },
    failure_threshold: {
      max_consecutive_failures: 3,
      min_rolling_pass_rate: 0.75,
      rolling_window: 20,
    },
    retry_limit: 1,
    escalation_target: "human:founder",
    approval_requirements: {
      require_hitl_before_side_effects: true,
      min_risk_tier: "MEDIUM",
      approver_roles: ["founder", "marketing"],
    },
    status: "proposed",
    business_value: {
      narrative:
        "Raises content quality by attaching public reading/quote hooks to real Capital insights — not viewbait",
      estimated_monthly_value: null,
    },
    last_reviewed: now,
    capabilities: ["marketing", "customer_research"],
    justification: justification({
      workflow_id: "wf_product_to_content_enrichment",
      metric: "share_of_assets_with_sourced_hooks",
      baseline: "unknown / mostly unsourced",
      target: "≥80% enriched drafts cite Open Library or quote + insight id",
      why_independent_context:
        "Needs insight-linked working context separate from Sales CRM and canonical pricing",
      why_independent_tools:
        "Open Library + ZenQuotes only — must not access payment or deploy connectors",
      why_independent_reasoning:
        "Must refuse enrichment when originating_insight_id missing (anti-generic-AI rule)",
      evidence_refs: [
        "https://github.com/public-apis/public-apis",
        "docs/PRODUCT_CONTENT_ENGINE.md",
        "uri://workflow/product_to_content",
      ],
    }),
    created_at: now,
    updated_at: now,
  };
}

export function buildMarketSignalScoutAgent(): AgentRecord {
  const now = at();
  return {
    id: "agent_market_signal_scout",
    name: "Market Signal Scout",
    mission: "Observe public market/tech headlines and crypto price snapshots for research OBSERVE",
    business_problem:
      "Research lane lacks a low-cost OBSERVE feed; manual HN/price checks burn founder attention",
    allowed_inputs: ["watch_ids", "vs_currency", "hn_limit"],
    expected_outputs: ["signal_digest", "price_snapshot", "headline_list"],
    tools: ["publicApi:coinGecko", "publicApi:hackerNews"],
    model: "unassigned",
    context_sources: ["memory:temporary_working_context"],
    permissions: ["read_context", "call_tools", "write_agent_run_history", "propose_action"],
    budget: {
      max_cost_per_run: 0.02,
      max_cost_per_day: 0.5,
      max_tokens_per_run: 2_000,
      max_runs_per_day: 24,
    },
    KPIs: [
      {
        id: "founder_minutes_saved",
        description: "Minutes saved vs manual HN+price scan",
        measurement: "estimate minutes/day",
        target: "15+",
      },
    ],
    eval_suite: {
      id: "market_signal_scout_eval",
      description: "No trading advice; attributions; bounded headline count",
      cases: ["no_advice", "has_attribution", "hn_limit"],
      min_pass_rate: 0.85,
    },
    failure_threshold: {
      max_consecutive_failures: 3,
      min_rolling_pass_rate: 0.7,
      rolling_window: 20,
    },
    retry_limit: 1,
    escalation_target: "human:founder",
    approval_requirements: {
      require_hitl_before_side_effects: true,
      min_risk_tier: "LOW",
      approver_roles: ["founder", "research"],
    },
    status: "proposed",
    business_value: {
      narrative:
        "Compresses OBSERVE for research without paid data terminals — feeds operating loop, not trading",
      estimated_monthly_value: null,
    },
    last_reviewed: now,
    capabilities: ["market_research", "competitive_intelligence"],
    justification: justification({
      workflow_id: "wf_research_observe_digest",
      metric: "founder_minutes_per_daily_signal_scan",
      baseline: "20m",
      target: "≤5m review of digest",
      why_independent_context:
        "Market OBSERVE scratchpad must not mix with customer PII or Sales pipeline secrets",
      why_independent_tools:
        "CoinGecko + Hacker News only — no brokerage, Stripe, or deploy tools",
      why_independent_reasoning:
        "Must label outputs as non-advice signals and keep them in agent_run_history",
      evidence_refs: [
        "https://github.com/public-apis/public-apis",
        "docs/OPERATING_LOOP.md",
        "uri://workflow/research_observe_digest",
      ],
    }),
    created_at: now,
    updated_at: now,
  };
}

export const NEXT_AGENT_BUILDERS = [
  buildFinanceScenarioResearchAgent,
  buildMarketingInsightEnricherAgent,
  buildMarketSignalScoutAgent,
] as const;

/**
 * Register (proposed) + optionally activate the next justified agents.
 * Still fewer agents than POSSIBLE_CAPABILITIES (no one-per-role fill).
 */
export function bootstrapNextAgents(
  registry: AgentRegistry,
  opts: { activate?: boolean; reviewer?: string } = {},
): AgentRecord[] {
  const out: AgentRecord[] = [];
  for (const build of NEXT_AGENT_BUILDERS) {
    const draft = build();
    if (registry.get(draft.id)) continue;
    let rec = registry.register(draft);
    if (opts.activate) {
      rec = registry.activate(rec.id, opts.reviewer ?? "founder");
    }
    out.push(rec);
  }
  AgentRegistry.assertNotRoleFill(9, registry.count());
  return out;
}

export type AgentRunResult = {
  agent_id: string;
  ok: boolean;
  summary: string;
  evidence_refs: string[];
  output: Record<string, unknown>;
};

export async function runFinanceScenarioResearch(
  client: PublicApiClient,
  input: { base?: string; quotes?: string[]; term?: string },
): Promise<AgentRunResult> {
  const base = input.base ?? "USD";
  const quotes = input.quotes ?? ["EUR", "GBP"];
  const term = input.term ?? "interest";
  const fx = await client.frankfurterLatest(base, quotes);
  const def = await client.defineWord(term);
  return {
    agent_id: "agent_finance_scenario_research",
    ok: true,
    summary: `FX ${base}→${quotes.join(",")} on ${fx.date}; defined “${term}” (${def.definitions.length} senses)`,
    evidence_refs: [fx.attribution.docs_url, def.attribution.docs_url],
    output: {
      fx,
      definition: def,
      disclaimer: "Educational context only — not financial advice",
    },
  };
}

export async function runMarketingInsightEnricher(
  client: PublicApiClient,
  input: { originating_insight_id: string; insight_summary: string; theme?: string },
): Promise<AgentRunResult> {
  if (!input.originating_insight_id.trim()) {
    return {
      agent_id: "agent_marketing_insight_enricher",
      ok: false,
      summary: "Rejected — originating_insight_id required (no generic AI content)",
      evidence_refs: [],
      output: { error: "missing_insight" },
    };
  }
  const theme = input.theme ?? "personal finance";
  const books = await client.openLibrarySearch(theme, 3);
  const quote = await client.zenQuoteRandom();
  return {
    agent_id: "agent_marketing_insight_enricher",
    ok: true,
    summary: `Enriched insight ${input.originating_insight_id} with ${books.results.length} books + quote`,
    evidence_refs: [
      input.originating_insight_id,
      books.attribution.docs_url,
      quote.attribution.docs_url,
    ],
    output: {
      originating_insight_id: input.originating_insight_id,
      insight_summary: input.insight_summary,
      books,
      quote,
      note: "Draft enrichment only — Product-to-Content must keep insight lineage",
    },
  };
}

export async function runMarketSignalScout(
  client: PublicApiClient,
  input: { watch_ids?: string[]; vs?: string[]; hn_limit?: number } = {},
): Promise<AgentRunResult> {
  const prices = await client.coinGeckoSimplePrice(
    input.watch_ids ?? ["bitcoin", "ethereum"],
    input.vs ?? ["usd"],
  );
  const hn = await client.hackerNewsTopTitles(input.hn_limit ?? 5);
  return {
    agent_id: "agent_market_signal_scout",
    ok: true,
    summary: `Signals: ${Object.keys(prices.prices).length} prices, ${hn.titles.length} HN titles`,
    evidence_refs: [prices.attribution.docs_url, hn.attribution.docs_url],
    output: {
      prices,
      headlines: hn,
      disclaimer: "Public signals for research OBSERVE only — not investment advice",
    },
  };
}
