import { describe, expect, it } from "vitest";
import {
  ASSET_KINDS,
  INSIGHT_KINDS,
  ProductContentEngine,
  ProductContentError,
  computeQualityScore,
  rankByCustomerQuality,
  validateAsset,
  withPerformanceFields,
  emptyFunnel,
} from "./index";
import type { ProductInsight } from "./types";

function insight(over: Partial<ProductInsight> & Pick<ProductInsight, "id" | "kind">): ProductInsight {
  return {
    id: over.id,
    kind: over.kind,
    title: over.title ?? "Players freeze at Soft Beat hush",
    summary:
      over.summary ??
      "Playtests show first Soft Beat hush is the memorable teach moment for Cove Change.",
    evidence_refs: over.evidence_refs ?? ["uri://playtest/2026-08-soft-beat"],
    anonymized_detail: over.anonymized_detail,
    themes: over.themes ?? ["soft-beat", "cove"],
    status: over.status ?? "captured",
    captured_at: over.captured_at ?? "2026-08-14T00:00:00.000Z",
    source_system: over.source_system ?? "playtest",
  };
}

describe("catalogs", () => {
  it("covers all insight and asset kinds", () => {
    expect(INSIGHT_KINDS).toHaveLength(9);
    expect(ASSET_KINDS).toHaveLength(8);
    expect(INSIGHT_KINDS).toContain("founder_insight");
    expect(ASSET_KINDS).toContain("shareable_financial_scenario");
  });
});

describe("ProductContentEngine", () => {
  it("rejects insights without evidence", () => {
    const eng = new ProductContentEngine();
    expect(() =>
      eng.captureInsight(
        insight({
          id: "ins_bad",
          kind: "customer_question",
          evidence_refs: [],
        }),
      ),
    ).toThrow(ProductContentError);
  });

  it("rejects generic filler posing as insight", () => {
    const eng = new ProductContentEngine();
    expect(() =>
      eng.captureInsight(
        insight({
          id: "ins_generic",
          kind: "founder_insight",
          summary: "Synergy leverage disrupt general tips for growth",
        }),
      ),
    ).toThrow(/generic/i);
  });

  it("generates assets that all reference originating insight", () => {
    const eng = new ProductContentEngine();
    eng.captureInsight(
      insight({ id: "ins_soft", kind: "product_discovery", status: "approved_for_content" }),
    );
    const assets = eng.generateFromInsight("ins_soft");
    expect(assets.length).toBeGreaterThan(0);
    for (const a of assets) {
      expect(a.originating_insight_ids).toContain("ins_soft");
      expect(a.insight_lineage).toMatch(/ins_soft/);
      expect(a.insight_lineage).toMatch(/evidence/i);
      expect(ASSET_KINDS).toContain(a.kind);
    }
  });

  it("refuses orphan assets without originating insights", () => {
    const eng = new ProductContentEngine();
    const orphan = validateAsset({
      id: "asset_orphan",
      kind: "social_post",
      title: "Random tips",
      concept: "Generic AI content about money",
      hook: "Money tips",
      originating_insight_ids: [],
      insight_lineage: "",
      status: "candidate",
      acquisition_source: "organic",
      created_at: "2026-08-14T00:00:00.000Z",
      updated_at: "2026-08-14T00:00:00.000Z",
      generated_by: "gpt",
    });
    expect(orphan.ok).toBe(false);

    expect(() =>
      eng.addAsset({
        id: "asset_orphan2",
        kind: "article",
        title: "Filler",
        concept: "Filler post with no learning",
        hook: "Hello",
        originating_insight_ids: ["missing"],
        insight_lineage: "pretend lineage here",
        status: "candidate",
        acquisition_source: "organic",
        created_at: "2026-08-14T00:00:00.000Z",
        updated_at: "2026-08-14T00:00:00.000Z",
        generated_by: "workflow:x",
      }),
    ).toThrow(/Unknown insight|originating/i);
  });

  it("maps each insight kind into asset candidates", () => {
    const eng = new ProductContentEngine();
    for (const kind of INSIGHT_KINDS) {
      const id = `ins_${kind}`;
      eng.captureInsight(
        insight({
          id,
          kind,
          title: `Learning ${kind}`,
          summary: `Concrete product/customer learning for ${kind} with enough detail`,
          evidence_refs: [`uri://ev/${kind}`],
        }),
      );
      const assets = eng.generateFromInsight(id);
      expect(assets.length).toBeGreaterThan(0);
      expect(assets.every((a) => a.originating_insight_ids[0] === id)).toBe(true);
    }
  });

  it("tracks funnel metrics including CAC and retention by source", () => {
    const eng = new ProductContentEngine();
    eng.captureInsight(insight({ id: "ins_q", kind: "customer_question" }));
    const [asset] = eng.generateFromInsight("ins_q", { kinds: ["email_lesson"] });
    const perf = eng.recordPerformance(
      asset!.id,
      {
        impressions: 5000,
        engagement: 800,
        clicks: 400,
        qualified_traffic: 200,
        signup: 80,
        activation: 40,
        paid_conversion: 10,
      },
      { spend: 250, retention_rate: 0.6 },
    );
    expect(perf.cac).toBe(25);
    expect(perf.retention_rate).toBe(0.6);
    expect(perf.quality_score).toBeGreaterThan(0);

    const bySource = eng.retentionByAcquisitionSource();
    expect(bySource[0]?.acquisition_source).toBe(asset!.acquisition_source);
    expect(bySource[0]?.retention_rate).toBe(0.6);
    expect(bySource[0]?.cac).toBe(25);
  });

  it("optimizes by customer quality not views alone", () => {
    const vanity = withPerformanceFields(
      "a_vanity",
      "src_vanity",
      {
        impressions: 100_000,
        engagement: 20_000,
        clicks: 5_000,
        qualified_traffic: 100,
        signup: 10,
        activation: 0,
        paid_conversion: 0,
      },
      1000,
      0,
    );
    const quality = withPerformanceFields(
      "a_quality",
      "src_quality",
      {
        impressions: 2_000,
        engagement: 800,
        clicks: 400,
        qualified_traffic: 300,
        signup: 150,
        activation: 100,
        paid_conversion: 40,
      },
      400,
      0.7,
    );
    expect(vanity.quality_score).toBeLessThan(quality.quality_score);
    const ranked = rankByCustomerQuality([vanity, quality]);
    expect(ranked[0]?.asset_id).toBe("a_quality");

    // Engine path
    const eng = new ProductContentEngine();
    eng.captureInsight(insight({ id: "ins_a", kind: "experiment" }));
    eng.captureInsight(
      insight({
        id: "ins_b",
        kind: "customer_pain_point",
        title: "Pain at paycheck island",
        summary: "Parents bounce when paycheck timing feels unclear in the sim",
        evidence_refs: ["uri://voc/paycheck"],
      }),
    );
    const [vAsset] = eng.generateFromInsight("ins_a", { kinds: ["social_post"] });
    const [qAsset] = eng.generateFromInsight("ins_b", { kinds: ["email_lesson"] });
    eng.recordPerformance(
      vAsset!.id,
      {
        impressions: 50_000,
        engagement: 10_000,
        clicks: 2000,
        qualified_traffic: 50,
        signup: 5,
        activation: 0,
        paid_conversion: 0,
      },
      { spend: 500, retention_rate: 0 },
    );
    eng.recordPerformance(
      qAsset!.id,
      {
        impressions: 3_000,
        engagement: 900,
        clicks: 500,
        qualified_traffic: 400,
        signup: 200,
        activation: 120,
        paid_conversion: 30,
      },
      { spend: 300, retention_rate: 0.65 },
    );
    const rankedEng = eng.optimizeByCustomerQuality();
    expect(rankedEng[0]?.asset_id).toBe(qAsset!.id);
  });

  it("vanity traffic alone scores poorly", () => {
    const score = computeQualityScore(
      {
        impressions: 10_000,
        engagement: 2_000,
        clicks: 500,
        qualified_traffic: 0,
        signup: 0,
        activation: 0,
        paid_conversion: 0,
      },
      0,
    );
    expect(score).toBeLessThan(0.2);
  });

  it("serialize preserves insight lineage policy", () => {
    const eng = new ProductContentEngine();
    eng.captureInsight(insight({ id: "ins_ser", kind: "educational_module" }));
    eng.generateFromInsight("ins_ser", { kinds: ["lead_magnet"] });
    const snap = eng.serialize();
    expect(snap.policy).toBe("insight_backed_content_only");
    expect(snap.assets[0]?.originating_insight_ids).toEqual(["ins_ser"]);
    const eng2 = new ProductContentEngine();
    eng2.hydrate(snap);
    expect(eng2.getInsight("ins_ser")?.kind).toBe("educational_module");
  });
});

describe("empty funnel helper", () => {
  it("starts at zeros", () => {
    expect(emptyFunnel().impressions).toBe(0);
  });
});
