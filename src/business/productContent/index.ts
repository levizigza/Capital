export type {
  InsightKind,
  AssetKind,
  InsightStatus,
  ProductInsight,
  ContentAssetStatus,
  ContentAsset,
  FunnelMetrics,
  AcquisitionSourceMetrics,
  AssetPerformance,
  ProductContentSnapshot,
  ValidationIssue,
} from "./types";
export {
  INSIGHT_KINDS,
  ASSET_KINDS,
  QUALITY_WEIGHTS,
} from "./types";
export {
  validateInsight,
  validateAsset,
  ProductContentError,
} from "./validate";
export {
  generateAssetCandidates,
  INSIGHT_TO_ASSET_KINDS,
} from "./transform";
export {
  emptyFunnel,
  computeCac,
  computeQualityScore,
  withPerformanceFields,
  aggregateBySource,
  rankByCustomerQuality,
} from "./metrics";
export { ProductContentEngine } from "./engine";
