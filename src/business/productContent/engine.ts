/**
 * Product-to-Content Engine — insight capture, asset generation, performance.
 */

import {
  aggregateBySource,
  emptyFunnel,
  rankByCustomerQuality,
  withPerformanceFields,
} from "./metrics";
import { generateAssetCandidates } from "./transform";
import { ProductContentError, validateAsset, validateInsight } from "./validate";
import type {
  AssetKind,
  AssetPerformance,
  ContentAsset,
  FunnelMetrics,
  ProductContentSnapshot,
  ProductInsight,
} from "./types";

export class ProductContentEngine {
  private insights = new Map<string, ProductInsight>();
  private assets = new Map<string, ContentAsset>();
  private performance = new Map<string, AssetPerformance>();

  captureInsight(insight: ProductInsight): ProductInsight {
    const result = validateInsight(insight);
    if (!result.ok) {
      throw new ProductContentError(
        result.issues.map((i) => i.message).join("; "),
        result.issues,
      );
    }
    if (this.insights.has(insight.id)) {
      throw new ProductContentError(`Insight already exists: ${insight.id}`);
    }
    this.insights.set(insight.id, structuredClone(insight));
    return structuredClone(insight);
  }

  approveInsightForContent(id: string): ProductInsight {
    const insight = this.requireInsight(id);
    insight.status = "approved_for_content";
    this.insights.set(id, insight);
    return structuredClone(insight);
  }

  getInsight(id: string): ProductInsight | null {
    const i = this.insights.get(id);
    return i ? structuredClone(i) : null;
  }

  listInsights(): ProductInsight[] {
    return [...this.insights.values()].map((i) => structuredClone(i));
  }

  /**
   * Generate candidates from an insight. Insight must exist and preferably
   * be approved_for_content (captured still allowed for draft candidates).
   */
  generateFromInsight(
    insightId: string,
    opts?: { kinds?: AssetKind[]; generated_by?: string },
  ): ContentAsset[] {
    const insight = this.requireInsight(insightId);
    if (insight.status === "retired") {
      throw new ProductContentError("Cannot generate from retired insight");
    }
    const known = new Set(this.insights.keys());
    const candidates = generateAssetCandidates(insight, opts);
    const saved: ContentAsset[] = [];
    for (const asset of candidates) {
      const v = validateAsset(asset, known);
      if (!v.ok) {
        throw new ProductContentError(
          v.issues.map((i) => i.message).join("; "),
          v.issues,
        );
      }
      // Dedupe ids if re-generated
      let id = asset.id;
      if (this.assets.has(id)) {
        id = `${asset.id}_${Date.now().toString(36)}`;
        asset.id = id;
      }
      this.assets.set(id, asset);
      this.performance.set(
        id,
        withPerformanceFields(id, asset.acquisition_source, emptyFunnel(), 0, null),
      );
      saved.push(structuredClone(asset));
    }
    return saved;
  }

  /**
   * Reject orphan assets (no originating insight).
   */
  addAsset(asset: ContentAsset): ContentAsset {
    const known = new Set(this.insights.keys());
    const v = validateAsset(asset, known);
    if (!v.ok) {
      throw new ProductContentError(
        v.issues.map((i) => i.message).join("; "),
        v.issues,
      );
    }
    if (this.assets.has(asset.id)) {
      throw new ProductContentError(`Asset already exists: ${asset.id}`);
    }
    this.assets.set(asset.id, structuredClone(asset));
    this.performance.set(
      asset.id,
      withPerformanceFields(
        asset.id,
        asset.acquisition_source,
        emptyFunnel(),
        0,
        null,
      ),
    );
    return structuredClone(asset);
  }

  listAssets(): ContentAsset[] {
    return [...this.assets.values()].map((a) => structuredClone(a));
  }

  getAsset(id: string): ContentAsset | null {
    const a = this.assets.get(id);
    return a ? structuredClone(a) : null;
  }

  /**
   * Record funnel metrics for an asset. Optimizes via quality_score, not views.
   */
  recordPerformance(
    assetId: string,
    funnel: Partial<FunnelMetrics>,
    opts?: { spend?: number; retention_rate?: number | null },
  ): AssetPerformance {
    const asset = this.assets.get(assetId);
    if (!asset) throw new ProductContentError(`Unknown asset ${assetId}`);
    const prev = this.performance.get(assetId) ?? withPerformanceFields(
      assetId,
      asset.acquisition_source,
      emptyFunnel(),
      0,
      null,
    );
    const nextFunnel: FunnelMetrics = {
      impressions: funnel.impressions ?? prev.impressions,
      engagement: funnel.engagement ?? prev.engagement,
      clicks: funnel.clicks ?? prev.clicks,
      qualified_traffic: funnel.qualified_traffic ?? prev.qualified_traffic,
      signup: funnel.signup ?? prev.signup,
      activation: funnel.activation ?? prev.activation,
      paid_conversion: funnel.paid_conversion ?? prev.paid_conversion,
    };
    const spend = opts?.spend ?? prev.spend;
    const retention =
      opts?.retention_rate !== undefined ? opts.retention_rate : prev.retention_rate;
    const perf = withPerformanceFields(
      assetId,
      asset.acquisition_source,
      nextFunnel,
      spend,
      retention,
    );
    this.performance.set(assetId, perf);
    return structuredClone(perf);
  }

  listPerformance(): AssetPerformance[] {
    return [...this.performance.values()].map((p) => structuredClone(p));
  }

  /** Rank by customer quality (activation/paid/retention), not impressions. */
  optimizeByCustomerQuality(): AssetPerformance[] {
    return rankByCustomerQuality(this.listPerformance());
  }

  retentionByAcquisitionSource(): {
    acquisition_source: string;
    retention_rate: number | null;
    cac: number | null;
    quality_score: number;
    paid_conversion: number;
  }[] {
    return aggregateBySource(this.listPerformance()).map((s) => ({
      acquisition_source: s.acquisition_source,
      retention_rate: s.retention_rate,
      cac: s.cac,
      quality_score: s.quality_score,
      paid_conversion: s.paid_conversion,
    }));
  }

  serialize(): ProductContentSnapshot {
    return {
      schema_version: "1",
      policy: "insight_backed_content_only",
      insights: this.listInsights(),
      assets: this.listAssets(),
      performance: this.listPerformance(),
      updated_at: new Date().toISOString(),
    };
  }

  hydrate(snap: ProductContentSnapshot): void {
    this.insights.clear();
    this.assets.clear();
    this.performance.clear();
    for (const i of snap.insights) this.insights.set(i.id, structuredClone(i));
    for (const a of snap.assets) this.assets.set(a.id, structuredClone(a));
    for (const p of snap.performance) this.performance.set(p.asset_id, structuredClone(p));
  }

  private requireInsight(id: string): ProductInsight {
    const i = this.insights.get(id);
    if (!i) throw new ProductContentError(`Unknown insight ${id}`);
    return i;
  }
}
