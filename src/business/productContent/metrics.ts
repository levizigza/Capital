/**
 * Funnel metrics + quality scoring (optimize customer quality, not views alone).
 */

import type {
  AcquisitionSourceMetrics,
  AssetPerformance,
  FunnelMetrics,
} from "./types";
import { QUALITY_WEIGHTS } from "./types";

export function emptyFunnel(): FunnelMetrics {
  return {
    impressions: 0,
    engagement: 0,
    clicks: 0,
    qualified_traffic: 0,
    signup: 0,
    activation: 0,
    paid_conversion: 0,
  };
}

export function computeCac(spend: number, paidConversion: number): number | null {
  if (paidConversion <= 0) return null;
  if (spend < 0) return null;
  return Math.round((spend / paidConversion) * 100) / 100;
}

/**
 * Quality score in ~0..1 favoring downstream outcomes over vanity views.
 * Rates are relative to impressions (or 1 if no impressions — uses absolute soft caps).
 */
export function computeQualityScore(
  funnel: FunnelMetrics,
  retentionRate: number | null,
): number {
  const imp = Math.max(funnel.impressions, 1);
  const rates = {
    impressions: Math.min(1, funnel.impressions / Math.max(imp, 1000)), // weak
    engagement: funnel.engagement / imp,
    clicks: funnel.clicks / imp,
    qualified_traffic: funnel.qualified_traffic / imp,
    signup: funnel.signup / imp,
    activation: funnel.activation / imp,
    paid_conversion: funnel.paid_conversion / imp,
    retention: retentionRate == null ? 0 : Math.min(1, Math.max(0, retentionRate)),
  };

  // Clamp rates
  for (const k of Object.keys(rates) as (keyof typeof rates)[]) {
    rates[k] = Math.min(1, Math.max(0, rates[k]));
  }

  let wSum = 0;
  let score = 0;
  for (const [k, w] of Object.entries(QUALITY_WEIGHTS) as [keyof typeof QUALITY_WEIGHTS, number][]) {
    score += rates[k] * w;
    wSum += w;
  }
  const normalized = wSum > 0 ? score / wSum : 0;

  // Explicit penalty: high impressions + near-zero activation/paid → suppress vanity
  const vanity =
    funnel.impressions >= 1000 &&
    funnel.activation === 0 &&
    funnel.paid_conversion === 0;
  const adjusted = vanity ? normalized * 0.35 : normalized;

  return Math.round(Math.min(1, Math.max(0, adjusted)) * 1000) / 1000;
}

export function withPerformanceFields(
  assetId: string,
  acquisitionSource: string,
  funnel: FunnelMetrics,
  spend: number,
  retentionRate: number | null,
): AssetPerformance {
  return {
    asset_id: assetId,
    acquisition_source: acquisitionSource,
    ...funnel,
    spend,
    cac: computeCac(spend, funnel.paid_conversion),
    retention_rate: retentionRate,
    quality_score: computeQualityScore(funnel, retentionRate),
    updated_at: new Date().toISOString(),
  };
}

export function aggregateBySource(
  rows: AssetPerformance[],
): AcquisitionSourceMetrics[] {
  const map = new Map<string, AssetPerformance[]>();
  for (const r of rows) {
    const list = map.get(r.acquisition_source) ?? [];
    list.push(r);
    map.set(r.acquisition_source, list);
  }
  const out: AcquisitionSourceMetrics[] = [];
  for (const [source, list] of map) {
    const funnel = emptyFunnel();
    let spend = 0;
    let retSum = 0;
    let retN = 0;
    for (const r of list) {
      funnel.impressions += r.impressions;
      funnel.engagement += r.engagement;
      funnel.clicks += r.clicks;
      funnel.qualified_traffic += r.qualified_traffic;
      funnel.signup += r.signup;
      funnel.activation += r.activation;
      funnel.paid_conversion += r.paid_conversion;
      spend += r.spend;
      if (r.retention_rate != null) {
        retSum += r.retention_rate;
        retN++;
      }
    }
    const retention = retN ? retSum / retN : null;
    out.push({
      acquisition_source: source,
      ...funnel,
      spend,
      cac: computeCac(spend, funnel.paid_conversion),
      retention_rate: retention,
      quality_score: computeQualityScore(funnel, retention),
    });
  }
  return out.sort((a, b) => b.quality_score - a.quality_score);
}

/** Rank assets by quality_score (not impressions). */
export function rankByCustomerQuality(rows: AssetPerformance[]): AssetPerformance[] {
  return [...rows].sort((a, b) => {
    if (b.quality_score !== a.quality_score) return b.quality_score - a.quality_score;
    // Tie-break: activation + paid, then lower CAC
    const av = a.activation + a.paid_conversion * 2;
    const bv = b.activation + b.paid_conversion * 2;
    if (bv !== av) return bv - av;
    const ac = a.cac ?? Number.POSITIVE_INFINITY;
    const bc = b.cac ?? Number.POSITIVE_INFINITY;
    return ac - bc;
  });
}
