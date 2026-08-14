/**
 * Weekly CUSTOMER_TRUTH_REPORT — only from ingested evidence + annotations.
 * Confidence none/low/medium/high from evidence volume — not invented sentiment.
 */

import { aggregateThemes, annotationsInWeek, weekBounds, weekIdFromDate } from "./aggregate";
import type {
  CustomerTruthReport,
  VocConfidenceLevel,
  VocStore,
  VocThemeStat,
} from "./types";

function confidenceFor(evidenceCount: number, annotationCount: number): VocConfidenceLevel {
  if (evidenceCount === 0 || annotationCount === 0) return "none";
  if (evidenceCount < 3 || annotationCount < 5) return "low";
  if (evidenceCount < 10 || annotationCount < 20) return "medium";
  return "high";
}

function priorWeekId(weekId: string): string | null {
  const bounds = weekBounds(weekId);
  if (!bounds) return null;
  const d = new Date(bounds.start + "T12:00:00.000Z");
  d.setUTCDate(d.getUTCDate() - 7);
  return weekIdFromDate(d.toISOString());
}

function findGrowingPain(
  current: VocThemeStat[],
  prior: VocThemeStat[],
): CustomerTruthReport["fastest_growing_pain"] {
  const priorMap = new Map(
    prior.filter((t) => t.kind === "pain_point").map((t) => [t.label.toLowerCase(), t]),
  );
  let best: CustomerTruthReport["fastest_growing_pain"] = null;
  for (const t of current.filter((x) => x.kind === "pain_point")) {
    const p = priorMap.get(t.label.toLowerCase());
    const priorFreq = p?.frequency ?? 0;
    const delta = t.frequency - priorFreq;
    if (delta <= 0) continue;
    if (!best || delta > best.delta) {
      best = {
        label: t.label,
        prior_frequency: priorFreq,
        current_frequency: t.frequency,
        delta,
        evidence_uris: t.evidence_uris,
      };
    }
  }
  return best;
}

/** Labels that appear as both delight and churn/pain — surface as contradictions with evidence. */
function findContradictions(
  themes: VocThemeStat[],
): { summary: string; evidence_uris: string[] }[] {
  const byLabel = new Map<string, VocThemeStat[]>();
  for (const t of themes) {
    const k = t.label.toLowerCase();
    const list = byLabel.get(k) ?? [];
    list.push(t);
    byLabel.set(k, list);
  }
  const out: { summary: string; evidence_uris: string[] }[] = [];
  for (const [, list] of byLabel) {
    const kinds = new Set(list.map((t) => t.kind));
    const positive = kinds.has("delight") || kinds.has("retention_driver");
    const negative =
      kinds.has("pain_point") || kinds.has("churn_driver") || kinds.has("objection");
    if (positive && negative) {
      out.push({
        summary: `Same label “${list[0]!.label}” tagged as both positive (${[...kinds].filter((k) => k === "delight" || k === "retention_driver").join(", ")}) and negative (${[...kinds].filter((k) => k === "pain_point" || k === "churn_driver" || k === "objection").join(", ")}) — review evidence; do not invent resolution`,
        evidence_uris: [...new Set(list.flatMap((t) => t.evidence_uris))],
      });
    }
  }
  return out;
}

export function generateCustomerTruthReport(
  store: VocStore,
  weekId: string,
  generatedAt = new Date().toISOString(),
): CustomerTruthReport {
  const bounds = weekBounds(weekId);
  const unknowns: string[] = [];

  if (!bounds) {
    return emptyReport(weekId, generatedAt, store, [
      `Invalid week_id “${weekId}” — expected YYYY-Www`,
    ]);
  }

  const weekStore = annotationsInWeek(store, bounds.start, bounds.end);
  const themes = aggregateThemes(weekStore);
  const pains = themes.filter((t) => t.kind === "pain_point");
  const objections = themes.filter((t) => t.kind === "objection");

  const priorId = priorWeekId(weekId);
  let priorPains: VocThemeStat[] = [];
  if (priorId) {
    const pb = weekBounds(priorId);
    if (pb) {
      priorPains = aggregateThemes(annotationsInWeek(store, pb.start, pb.end));
    }
  }

  const mostCommon = pains[0] ?? null;
  const fastestGrowing = findGrowingPain(pains, priorPains);

  // New objections = in this week, not in prior week labels
  const priorObj = new Set(
    aggregateThemes(
      priorId && weekBounds(priorId)
        ? annotationsInWeek(store, weekBounds(priorId)!.start, weekBounds(priorId)!.end)
        : createEmptySlice(),
      "objection",
    ).map((t) => t.label.toLowerCase()),
  );
  const newObjections = objections.filter((o) => !priorObj.has(o.label.toLowerCase()));

  const language = weekStore.annotations
    .filter((a) => a.kind === "customer_language" || a.kind === "pain_point" || a.kind === "delight")
    .map((a) => {
      const ev = weekStore.evidence.find((e) => e.id === a.evidence_id);
      return {
        quote: a.quote,
        evidence_id: a.evidence_id,
        evidence_uri: ev?.evidence_uri ?? "(missing uri)",
      };
    })
    // Prefer longer verbatim quotes as "strongest language" proxy — not sentiment
    .sort((a, b) => b.quote.length - a.quote.length)
    .slice(0, 10);

  // Dedupe quotes
  const seen = new Set<string>();
  const strongest_customer_language = language.filter((l) => {
    if (seen.has(l.quote)) return false;
    seen.add(l.quote);
    return true;
  });

  const product_opportunities = themes.filter(
    (t) => t.kind === "feature_request" || t.kind === "desired_outcome",
  );
  const pricing_evidence = themes.filter((t) => t.kind === "pricing_signal");
  const retention_evidence = themes.filter(
    (t) =>
      t.kind === "retention_driver" ||
      t.kind === "retention_signal" ||
      t.kind === "churn_driver" ||
      t.kind === "delight",
  );

  if (weekStore.evidence.length === 0) {
    unknowns.push("No evidence captured in this week — all pains/objections UNKNOWN");
  }
  if (pains.length === 0) unknowns.push("most_common_pain: UNKNOWN (no pain_point annotations)");
  if (!fastestGrowing) {
    unknowns.push("fastest_growing_pain: UNKNOWN (need comparable prior-week pain annotations)");
  }
  if (pricing_evidence.length === 0) unknowns.push("pricing_evidence: none tagged");
  if (retention_evidence.length === 0) unknowns.push("retention_evidence: none tagged");

  const conf = confidenceFor(weekStore.evidence.length, weekStore.annotations.length);

  return {
    schema_version: "1",
    canonical_rank: 6,
    claim_status: "observation",
    auto_promoted_to_fact: false,
    week_id: weekId,
    generated_at: generatedAt,
    evidence_count: weekStore.evidence.length,
    annotation_count: weekStore.annotations.length,
    confidence: conf,
    most_common_pain: mostCommon,
    fastest_growing_pain: fastestGrowing,
    new_objections: newObjections,
    strongest_customer_language,
    contradictions: findContradictions(themes),
    product_opportunities,
    pricing_evidence,
    retention_evidence,
    unknowns,
  };
}

function createEmptySlice(): VocStore {
  return { schema_version: "1", evidence: [], annotations: [] };
}

function emptyReport(
  weekId: string,
  generatedAt: string,
  store: VocStore,
  unknowns: string[],
): CustomerTruthReport {
  return {
    schema_version: "1",
    canonical_rank: 6,
    claim_status: "observation",
    auto_promoted_to_fact: false,
    week_id: weekId,
    generated_at: generatedAt,
    evidence_count: store.evidence.length,
    annotation_count: store.annotations.length,
    confidence: "none",
    most_common_pain: null,
    fastest_growing_pain: null,
    new_objections: [],
    strongest_customer_language: [],
    contradictions: [],
    product_opportunities: [],
    pricing_evidence: [],
    retention_evidence: [],
    unknowns,
  };
}

/** Markdown for company memory — Rank 6 observation, not constitution FACT. */
export function formatCustomerTruthReportMarkdown(report: CustomerTruthReport): string {
  const lines: string[] = [
    "---",
    `id: company-os/reports/CUSTOMER_TRUTH_REPORT_${report.week_id}`,
    "title: Customer Truth Report",
    "doc_type: customer_truth_report",
    `week_id: "${report.week_id}"`,
    `generated_at: "${report.generated_at}"`,
    "canonical_rank: 6",
    "claim_status: observation",
    "auto_promoted_to_fact: false",
    `confidence: ${report.confidence}`,
    "---",
    "",
    `# Customer Truth Report — ${report.week_id}`,
    "",
    `**Confidence:** ${report.confidence} · Evidence: ${report.evidence_count} · Annotations: ${report.annotation_count}`,
    "",
    "> Observation only. Does **not** auto-promote to canonical FACT. Link every claim to evidence URIs.",
    "",
    "## Most common pain",
    report.most_common_pain
      ? `- **${report.most_common_pain.label}** (n=${report.most_common_pain.frequency}` +
        (report.most_common_pain.max_severity != null
          ? `, max human severity ${report.most_common_pain.max_severity}`
          : ", severity UNKNOWN") +
        `)\n  - Quotes: ${report.most_common_pain.sample_quotes.map((q) => JSON.stringify(q)).join("; ")}\n  - Evidence: ${report.most_common_pain.evidence_uris.join(", ") || "UNKNOWN"}`
      : "- UNKNOWN",
    "",
    "## Fastest-growing pain",
    report.fastest_growing_pain
      ? `- **${report.fastest_growing_pain.label}** Δ +${report.fastest_growing_pain.delta} (${report.fastest_growing_pain.prior_frequency} → ${report.fastest_growing_pain.current_frequency})\n  - Evidence: ${report.fastest_growing_pain.evidence_uris.join(", ")}`
      : "- UNKNOWN",
    "",
    "## New objections",
    report.new_objections.length
      ? report.new_objections
          .map(
            (o) =>
              `- **${o.label}** (n=${o.frequency}) — ${o.evidence_uris.join(", ")}\n  - “${o.sample_quotes[0] ?? ""}”`,
          )
          .join("\n")
      : "- NONE / UNKNOWN",
    "",
    "## Strongest customer language (verbatim)",
    report.strongest_customer_language.length
      ? report.strongest_customer_language
          .map((l) => `- “${l.quote}” — ${l.evidence_uri}`)
          .join("\n")
      : "- UNKNOWN",
    "",
    "## Contradictions",
    report.contradictions.length
      ? report.contradictions
          .map((c) => `- ${c.summary}\n  - Evidence: ${c.evidence_uris.join(", ")}`)
          .join("\n")
      : "- NONE observed in tags",
    "",
    "## Product opportunities",
    report.product_opportunities.length
      ? report.product_opportunities
          .map((o) => `- **${o.label}** [${o.kind}] n=${o.frequency} — ${o.evidence_uris.join(", ")}`)
          .join("\n")
      : "- UNKNOWN",
    "",
    "## Pricing evidence",
    report.pricing_evidence.length
      ? report.pricing_evidence
          .map((o) => `- **${o.label}** n=${o.frequency} — ${o.evidence_uris.join(", ")}`)
          .join("\n")
      : "- UNKNOWN",
    "",
    "## Retention evidence",
    report.retention_evidence.length
      ? report.retention_evidence
          .map((o) => `- **${o.label}** [${o.kind}] n=${o.frequency} — ${o.evidence_uris.join(", ")}`)
          .join("\n")
      : "- UNKNOWN",
    "",
    "## Confidence level",
    "",
    report.confidence,
    "",
    "## Unknowns",
    "",
    ...report.unknowns.map((u) => `- ${u}`),
    "",
  ];
  return lines.join("\n");
}
