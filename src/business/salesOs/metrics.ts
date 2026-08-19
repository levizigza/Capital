/**
 * Funnel + CAC + cycle + revenue/retention by source.
 */

import type {
  Lead,
  LeadSource,
  SourceMetrics,
  StageConversionMetrics,
} from "./types";

function rate(num: number, den: number): number {
  if (den <= 0) return 0;
  return Math.round((num / den) * 1000) / 1000;
}

export function stageConversionMetrics(leads: Lead[]): StageConversionMetrics {
  const counts = {
    captured: leads.length,
    qualified: 0,
    meeting_demo: 0,
    offer: 0,
    paid: 0,
    lost: 0,
  };
  for (const l of leads) {
    const o = stageOrdinal(l.pipeline_stage);
    if (o >= 1 || l.qualification === "qualified") counts.qualified++;
    if (o >= 2) counts.meeting_demo++;
    if (o >= 3) counts.offer++;
    if (l.pipeline_stage === "paid" || l.conversion.converted) counts.paid++;
    if (l.pipeline_stage === "lost") counts.lost++;
  }
  // Unique-ish: requalify counts for people who reached stage
  const reachedQualified = leads.filter(
    (l) => stageOrdinal(l.pipeline_stage) >= 1 || l.qualification === "qualified",
  ).length;
  const reachedMeeting = leads.filter((l) => stageOrdinal(l.pipeline_stage) >= 2).length;
  const reachedOffer = leads.filter((l) => stageOrdinal(l.pipeline_stage) >= 3).length;
  const paid = leads.filter((l) => l.pipeline_stage === "paid" || l.conversion.converted).length;

  return {
    lead_to_qualified: rate(reachedQualified, leads.length),
    qualified_to_meeting: rate(reachedMeeting, Math.max(reachedQualified, 1)),
    meeting_to_offer: rate(reachedOffer, Math.max(reachedMeeting, 1)),
    offer_to_paid: rate(paid, Math.max(reachedOffer, 1)),
    counts: {
      captured: leads.length,
      qualified: reachedQualified,
      meeting_demo: reachedMeeting,
      offer: reachedOffer,
      paid,
      lost: counts.lost,
    },
  };
}

function stageOrdinal(stage: string): number {
  switch (stage) {
    case "captured":
      return 0;
    case "qualified":
      return 1;
    case "meeting_demo":
      return 2;
    case "offer":
      return 3;
    case "paid":
      return 4;
    default:
      return -1;
  }
}

export function salesCycleDays(lead: Lead): number | null {
  if (!lead.conversion.paid_at) return null;
  const a = Date.parse(lead.captured_at);
  const b = Date.parse(lead.conversion.paid_at);
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  return Math.round(((b - a) / (1000 * 60 * 60 * 24)) * 10) / 10;
}

export function metricsBySource(
  leads: Lead[],
  spendBySource: Partial<Record<LeadSource, number>> = {},
): SourceMetrics[] {
  const sources = new Map<LeadSource, Lead[]>();
  for (const l of leads) {
    const list = sources.get(l.lead_source) ?? [];
    list.push(l);
    sources.set(l.lead_source, list);
  }
  const out: SourceMetrics[] = [];
  for (const [lead_source, list] of sources) {
    const paidLeads = list.filter((l) => l.pipeline_stage === "paid" || l.conversion.converted);
    const revenue = paidLeads.reduce(
      (s, l) => s + (l.conversion.amount ?? l.expected_value),
      0,
    );
    const spend = spendBySource[lead_source] ?? 0;
    const cycles = paidLeads
      .map(salesCycleDays)
      .filter((d): d is number => d != null);
    const avgCycle =
      cycles.length > 0
        ? Math.round((cycles.reduce((a, b) => a + b, 0) / cycles.length) * 10) / 10
        : null;
    const retVals = list
      .map((l) => l.retention_rate)
      .filter((r): r is number => typeof r === "number");
    const retention =
      retVals.length > 0
        ? Math.round((retVals.reduce((a, b) => a + b, 0) / retVals.length) * 1000) / 1000
        : null;
    out.push({
      lead_source,
      leads: list.length,
      paid: paidLeads.length,
      revenue,
      spend,
      cac: paidLeads.length > 0 ? Math.round((spend / paidLeads.length) * 100) / 100 : null,
      avg_sales_cycle_days: avgCycle,
      retention_rate: retention,
    });
  }
  return out.sort((a, b) => b.revenue - a.revenue);
}
