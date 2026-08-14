/**
 * Transform product/customer insights into content asset candidates.
 */

import type { AssetKind, ContentAsset, ProductInsight } from "./types";

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

/** Default asset kinds suggested per insight kind (still insight-backed). */
export const INSIGHT_TO_ASSET_KINDS: Record<ProductInsight["kind"], AssetKind[]> = {
  new_simulation: [
    "short_form_video",
    "shareable_financial_scenario",
    "social_post",
    "interactive_quiz",
  ],
  financial_scenario: [
    "shareable_financial_scenario",
    "long_form_video",
    "article",
    "email_lesson",
  ],
  customer_question: ["email_lesson", "short_form_video", "social_post", "article"],
  customer_pain_point: [
    "short_form_video",
    "article",
    "lead_magnet",
    "email_lesson",
  ],
  experiment: ["article", "social_post", "email_lesson", "long_form_video"],
  product_discovery: [
    "short_form_video",
    "social_post",
    "article",
    "interactive_quiz",
  ],
  educational_module: [
    "email_lesson",
    "long_form_video",
    "interactive_quiz",
    "lead_magnet",
  ],
  anonymized_behavior_pattern: [
    "social_post",
    "short_form_video",
    "article",
    "shareable_financial_scenario",
  ],
  founder_insight: ["long_form_video", "article", "email_lesson", "social_post"],
};

function conceptFor(kind: AssetKind, insight: ProductInsight): { title: string; concept: string; hook: string } {
  const theme = insight.themes[0] ?? insight.kind;
  switch (kind) {
    case "short_form_video":
      return {
        title: `Short: ${insight.title}`,
        hook: insight.title,
        concept: `15–45s video dramatizing insight (${insight.kind}): ${insight.summary.slice(0, 160)}`,
      };
    case "long_form_video":
      return {
        title: `Deep dive: ${insight.title}`,
        hook: `What we learned about ${theme}`,
        concept: `Long-form walkthrough of product/customer learning: ${insight.summary}`,
      };
    case "article":
      return {
        title: `Article: ${insight.title}`,
        hook: insight.title,
        concept: `Written piece grounded in ${insight.kind} evidence ${insight.evidence_refs[0]} — ${insight.summary}`,
      };
    case "email_lesson":
      return {
        title: `Email lesson: ${insight.title}`,
        hook: `One lesson from ${theme}`,
        concept: `Single email teaching from insight: ${insight.summary}`,
      };
    case "social_post":
      return {
        title: `Social: ${insight.title}`,
        hook: insight.title.slice(0, 80),
        concept: `Feed post citing product learning (${insight.kind}): ${insight.summary.slice(0, 140)}`,
      };
    case "interactive_quiz":
      return {
        title: `Quiz: ${theme}`,
        hook: `Can you spot this money pattern?`,
        concept: `Quiz items derived from insight ${insight.id}: ${insight.summary.slice(0, 140)}`,
      };
    case "lead_magnet":
      return {
        title: `Lead magnet: ${insight.title}`,
        hook: `Free guide from a real Capital learning`,
        concept: `Downloadable checklist/PDF from ${insight.kind}: ${insight.summary}`,
      };
    case "shareable_financial_scenario":
      return {
        title: `Scenario: ${insight.title}`,
        hook: `Try this money scenario`,
        concept: `Shareable scenario card from ${insight.kind}: ${insight.summary}`,
      };
  }
}

/**
 * Generate candidate assets from an approved insight.
 * Every asset includes originating_insight_ids + insight_lineage.
 */
export function generateAssetCandidates(
  insight: ProductInsight,
  opts: {
    generated_by?: string;
    kinds?: AssetKind[];
    acquisition_source_prefix?: string;
  } = {},
): ContentAsset[] {
  if (insight.status === "retired") return [];
  const kinds = opts.kinds ?? INSIGHT_TO_ASSET_KINDS[insight.kind];
  const by = opts.generated_by ?? "workflow:product-content-engine";
  const prefix = opts.acquisition_source_prefix ?? "p2c";
  const at = new Date().toISOString();
  const lineage = `From ${insight.kind} “${insight.title}” (${insight.id}); evidence: ${insight.evidence_refs.join(", ")}`;

  return kinds.map((kind) => {
    const { title, concept, hook } = conceptFor(kind, insight);
    const id = `asset_${kind}_${slug(insight.id)}_${slug(kind)}`.slice(0, 80);
    const asset: ContentAsset = {
      id,
      kind,
      title,
      concept,
      hook,
      originating_insight_ids: [insight.id],
      insight_lineage: lineage,
      status: "candidate",
      acquisition_source: `${prefix}:${kind}:${insight.id}`,
      created_at: at,
      updated_at: at,
      generated_by: by,
    };
    return asset;
  });
}
