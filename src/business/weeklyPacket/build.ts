/**
 * Assemble Weekly Executive Packet sections from typed inputs.
 */

import type {
  AutomaticAction,
  FounderDecisionRequest,
  MetricLine,
  PacketBullet,
  PacketSection,
  PacketSectionId,
  WeeklyPacketInputs,
} from "./types";
import { PACKET_SECTIONS } from "./types";

function unknownSummary(topic: string): string {
  return `${topic}: UNKNOWN — no verified inputs this week.`;
}

function metric(label: string, value: number | string | null, unit?: string, note?: string): MetricLine {
  return { label, value: value ?? null, unit, note: value == null ? note ?? "UNKNOWN" : note };
}

function section(
  id: PacketSectionId,
  title: string,
  summary: string,
  bullets: PacketBullet[],
  metrics: MetricLine[],
  incomplete: boolean,
): PacketSection {
  return { id, title, summary, bullets, metrics, incomplete };
}

export function buildSections(inputs: WeeklyPacketInputs): PacketSection[] {
  const sections: PacketSection[] = [];

  // 1. WHAT HAPPENED
  {
    const items = inputs.what_happened ?? [];
    sections.push(
      section(
        "WHAT_HAPPENED",
        "1. WHAT HAPPENED",
        items.length
          ? `Week ${inputs.week_id}: ${items.length} notable event(s).`
          : unknownSummary("What happened"),
        items.map((t) => ({ text: t })),
        [],
        items.length === 0,
      ),
    );
  }

  // 2. CUSTOMER TRUTH
  {
    const c = inputs.customer_truth;
    const bullets: PacketBullet[] = [];
    for (const t of c?.themes ?? []) bullets.push({ text: `Theme: ${t}` });
    for (const v of c?.verbatim_samples ?? []) {
      bullets.push({ text: `Verbatim: “${v}”`, evidence_ref: c?.evidence_refs?.[0] });
    }
    for (const r of c?.evidence_refs ?? []) bullets.push({ text: `Evidence: ${r}`, evidence_ref: r });
    const incomplete = !c || (bullets.length === 0 && !c.open_severity);
    sections.push(
      section(
        "CUSTOMER_TRUTH",
        "2. CUSTOMER TRUTH",
        incomplete
          ? unknownSummary("Customer truth")
          : `Customer learning this week${c?.open_severity ? ` · severity ${c.open_severity}` : ""}.`,
        bullets,
        [metric("open_severity", c?.open_severity ?? null)],
        incomplete,
      ),
    );
  }

  // 3. PRODUCT TRUTH
  {
    const p = inputs.product_truth;
    const bullets: PacketBullet[] = [];
    for (const s of p?.shipped ?? []) bullets.push({ text: `Shipped: ${s}` });
    for (const f of p?.frictions ?? []) bullets.push({ text: `Friction: ${f}` });
    if (p?.signature_loop_health) {
      bullets.push({ text: `Signature loop: ${p.signature_loop_health}` });
    }
    const incomplete = !p || bullets.length === 0;
    sections.push(
      section(
        "PRODUCT_TRUTH",
        "3. PRODUCT TRUTH",
        incomplete ? unknownSummary("Product truth") : "Product reality vs. intent this week.",
        bullets,
        [metric("signature_loop_health", p?.signature_loop_health ?? null)],
        incomplete,
      ),
    );
  }

  // 4. DEMAND
  {
    const d = inputs.demand;
    const incomplete = !d || (d.traffic == null && d.signups == null && d.activation == null);
    sections.push(
      section(
        "DEMAND",
        "4. DEMAND",
        incomplete ? unknownSummary("Demand") : d?.note ?? "Demand funnel snapshot.",
        d?.note ? [{ text: d.note }] : [],
        [
          metric("traffic", d?.traffic ?? null),
          metric("signups", d?.signups ?? null),
          metric("activation", d?.activation ?? null),
        ],
        incomplete,
      ),
    );
  }

  // 5. REVENUE
  {
    const r = inputs.revenue;
    const incomplete = !r || (r.gross == null && r.net == null);
    sections.push(
      section(
        "REVENUE",
        "5. REVENUE",
        incomplete ? unknownSummary("Revenue") : r?.note ?? "Revenue snapshot.",
        r?.note ? [{ text: r.note }] : [],
        [
          metric("gross", r?.gross ?? null, r?.currency),
          metric("net", r?.net ?? null, r?.currency),
        ],
        incomplete,
      ),
    );
  }

  // 6. CONTRIBUTION PROFIT
  {
    const c = inputs.contribution_profit;
    const incomplete = !c || c.value == null;
    sections.push(
      section(
        "CONTRIBUTION_PROFIT",
        "6. CONTRIBUTION PROFIT",
        incomplete ? unknownSummary("Contribution profit") : c?.note ?? "Contribution profit.",
        c?.note ? [{ text: c.note }] : [],
        [metric("contribution_profit", c?.value ?? null, c?.currency)],
        incomplete,
      ),
    );
  }

  // 7. CASH
  {
    const c = inputs.cash;
    const incomplete = !c || (c.balance == null && c.runway_months == null);
    sections.push(
      section(
        "CASH",
        "7. CASH",
        incomplete ? unknownSummary("Cash") : c?.note ?? "Cash & runway.",
        c?.note ? [{ text: c.note }] : [],
        [
          metric("balance", c?.balance ?? null, c?.currency),
          metric("runway_months", c?.runway_months ?? null, "months"),
        ],
        incomplete,
      ),
    );
  }

  // 8. RETENTION
  {
    const r = inputs.retention;
    const bullets = (r?.anomalies ?? []).map((t) => ({ text: t }));
    const incomplete =
      !r || (r.day_7 == null && r.day_30 == null && r.paid == null && bullets.length === 0);
    sections.push(
      section(
        "RETENTION",
        "8. RETENTION",
        incomplete ? unknownSummary("Retention") : "Retention cohort health.",
        bullets,
        [
          metric("day_7", r?.day_7 ?? null),
          metric("day_30", r?.day_30 ?? null),
          metric("paid_retention", r?.paid ?? null),
        ],
        incomplete,
      ),
    );
  }

  // 9. SALES PIPELINE
  {
    const s = inputs.sales_pipeline;
    const incomplete =
      !s ||
      (s.leads == null &&
        s.qualified == null &&
        s.meetings == null &&
        s.offers == null &&
        s.paid == null);
    sections.push(
      section(
        "SALES_PIPELINE",
        "9. SALES PIPELINE",
        incomplete ? unknownSummary("Sales pipeline") : s?.note ?? "Pipeline snapshot.",
        s?.note ? [{ text: s.note }] : [],
        [
          metric("leads", s?.leads ?? null),
          metric("qualified", s?.qualified ?? null),
          metric("meetings", s?.meetings ?? null),
          metric("offers", s?.offers ?? null),
          metric("paid", s?.paid ?? null),
        ],
        incomplete,
      ),
    );
  }

  // 10. EXPERIMENT RESULTS
  {
    const e = inputs.experiments;
    const bullets: PacketBullet[] = [];
    for (const c of e?.completed ?? []) {
      bullets.push({ text: `${c.id}: ${c.result}`, evidence_ref: c.evidence_ref });
    }
    for (const f of e?.in_flight ?? []) bullets.push({ text: `In flight: ${f}` });
    const incomplete = !e || bullets.length === 0;
    sections.push(
      section(
        "EXPERIMENT_RESULTS",
        "10. EXPERIMENT RESULTS",
        incomplete ? unknownSummary("Experiments") : "Experiment outcomes this week.",
        bullets,
        [],
        incomplete,
      ),
    );
  }

  // 11. AGENT PERFORMANCE
  {
    const a = inputs.agent_performance;
    const bullets: PacketBullet[] = [];
    const metrics: MetricLine[] = [];
    for (const w of a?.workers ?? []) {
      bullets.push({
        text: `${w.id}: completion=${w.completion_rate ?? "UNKNOWN"} cost/task=${w.cost_per_task ?? "UNKNOWN"} escalations=${w.escalations ?? "UNKNOWN"}`,
      });
      metrics.push(metric(`${w.id}.completion_rate`, w.completion_rate ?? null));
    }
    if (a?.note) bullets.push({ text: a.note });
    const incomplete = !a || (bullets.length === 0 && !a.note);
    sections.push(
      section(
        "AGENT_PERFORMANCE",
        "11. AGENT PERFORMANCE",
        incomplete ? unknownSummary("Agent performance") : "AI worker health.",
        bullets,
        metrics,
        incomplete,
      ),
    );
  }

  // 12. FAILURES
  {
    const f = inputs.failures ?? [];
    sections.push(
      section(
        "FAILURES",
        "12. FAILURES",
        f.length ? `${f.length} failure(s) logged.` : unknownSummary("Failures"),
        f.map((t) => ({ text: t })),
        [],
        f.length === 0,
      ),
    );
  }

  // 13. RISKS
  {
    const r = inputs.risks ?? [];
    sections.push(
      section(
        "RISKS",
        "13. RISKS",
        r.length ? `${r.length} risk(s) flagged.` : unknownSummary("Risks"),
        r.map((t) => ({ text: t })),
        [],
        r.length === 0,
      ),
    );
  }

  // 14. OPPORTUNITIES
  {
    const o = inputs.opportunities ?? [];
    sections.push(
      section(
        "OPPORTUNITIES",
        "14. OPPORTUNITIES",
        o.length ? `${o.length} opportunity(ies).` : unknownSummary("Opportunities"),
        o.map((t) => ({ text: t })),
        [],
        o.length === 0,
      ),
    );
  }

  // 15. DECISIONS REQUIRED FROM FOUNDER
  {
    const decisions = inputs.founder_decisions ?? [];
    sections.push(
      section(
        "DECISIONS_REQUIRED_FROM_FOUNDER",
        "15. DECISIONS REQUIRED FROM FOUNDER",
        decisions.length
          ? `${decisions.length} decision(s) need founder judgment.`
          : "No founder decisions queued this week.",
        decisions.map((d) => ({
          text: `${d.title} — conf=${d.confidence} cost=${d.cost ?? "UNKNOWN"}`,
        })),
        [],
        false,
      ),
    );
  }

  // 16. AUTOMATIC ACTIONS PLANNED FOR NEXT WEEK
  {
    const actions = inputs.automatic_actions ?? [];
    sections.push(
      section(
        "AUTOMATIC_ACTIONS_PLANNED_FOR_NEXT_WEEK",
        "16. AUTOMATIC ACTIONS PLANNED FOR NEXT WEEK",
        actions.length
          ? `${actions.length} automatic action(s) scheduled.`
          : "No automatic actions planned.",
        actions.map((a) => ({
          text: `${a.action} · owner=${a.owner} · ${a.scheduled_for}`,
          evidence_ref: a.evidence_ref,
        })),
        [],
        false,
      ),
    );
  }

  // Ensure all 16 present in order
  if (sections.length !== PACKET_SECTIONS.length) {
    throw new Error(`Expected ${PACKET_SECTIONS.length} sections, got ${sections.length}`);
  }
  return sections;
}

export function renderPacketMarkdown(
  sections: PacketSection[],
  decisions: FounderDecisionRequest[],
  actions: AutomaticAction[],
): string {
  const lines: string[] = ["# Weekly Executive Packet", ""];
  for (const s of sections) {
    lines.push(`## ${s.title}`);
    lines.push(s.summary);
    for (const b of s.bullets) lines.push(`- ${b.text}`);
    for (const m of s.metrics) {
      lines.push(`- **${m.label}**: ${m.value ?? "UNKNOWN"}${m.unit ? ` ${m.unit}` : ""}`);
    }
    lines.push("");
  }
  if (decisions.length) {
    lines.push("## Founder decision detail");
    for (const d of decisions) {
      lines.push(`### ${d.title}`);
      lines.push(`- Recommendation: ${d.recommendation}`);
      lines.push(`- Evidence: ${d.evidence.join("; ")}`);
      lines.push(`- Expected upside: ${d.expected_upside}`);
      lines.push(`- Cost: ${d.cost ?? "UNKNOWN"} (${d.cost_note})`);
      lines.push(`- Confidence: ${d.confidence}`);
      lines.push(`- Reversibility: ${d.reversibility}`);
      lines.push(`- Worst case: ${d.worst_case}`);
      lines.push(`- Alternative: ${d.alternative}`);
      lines.push("");
    }
  }
  if (actions.length) {
    lines.push("## Automatic actions detail");
    for (const a of actions) {
      lines.push(`- ${a.id}: ${a.action} (${a.owner}, ${a.scheduled_for})`);
    }
  }
  return lines.join("\n");
}
