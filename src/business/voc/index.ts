/**
 * Capital Voice-of-Customer system.
 * Ingest evidence → human/verified annotations → weekly CUSTOMER_TRUTH_REPORT.
 * Never invents sentiment or customer facts.
 */

export type {
  CustomerTruthReport,
  VocAnnotation,
  VocConfidenceLevel,
  VocEvidence,
  VocExtractKind,
  VocSourceType,
  VocStore,
  VocThemeStat,
  VocValidationIssue,
} from "./types";

export {
  addAnnotation,
  createEmptyVocStore,
  ingestEvidence,
  parseVocStore,
  serializeVocStore,
  validateAnnotation,
  validateEvidence,
} from "./ingest";

export {
  aggregateThemes,
  annotationsInWeek,
  weekBounds,
  weekIdFromDate,
} from "./aggregate";

export {
  formatCustomerTruthReportMarkdown,
  generateCustomerTruthReport,
} from "./report";
