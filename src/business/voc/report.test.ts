import { describe, expect, it } from "vitest";
import { addAnnotation, createEmptyVocStore, ingestEvidence } from "./ingest";
import { generateCustomerTruthReport, formatCustomerTruthReportMarkdown } from "./report";
import { weekIdFromDate } from "./aggregate";
import type { VocStore } from "./types";

function seedTwoWeeks(): VocStore {
  let store = createEmptyVocStore();

  const add = (
    id: string,
    date: string,
    text: string,
    kind: "pain_point" | "objection" | "delight" | "feature_request" | "customer_language",
    label: string,
  ) => {
    const ing = ingestEvidence(store, {
      id,
      source_type: "support",
      evidence_uri: `https://evidence.test/${id}`,
      captured_at: date,
      raw_text: text,
      customer_segment: "families",
    });
    if (!("evidence" in ing)) {
      throw new Error(`ingest failed: ${JSON.stringify(ing.issues)}`);
    }
    store = ing.store;
    const ann = addAnnotation(store, {
      id: `a_${id}`,
      evidence_id: id,
      kind,
      label,
      quote: text,
    });
    if (!("annotation" in ann)) {
      throw new Error(`ann failed: ${JSON.stringify(ann.issues)}`);
    }
    store = ann.store;
  };

  // Prior week-ish: 2026-08-03 (ISO week W32)
  add("ev_w32_a", "2026-08-03T10:00:00.000Z", "We got lost after the carpet.", "pain_point", "navigation confusion");
  add("ev_w32_b", "2026-08-04T10:00:00.000Z", "Not sure where to go next.", "pain_point", "navigation confusion");

  // Current week W33 around 2026-08-12
  add("ev_w33_a", "2026-08-10T10:00:00.000Z", "We got lost after the carpet again.", "pain_point", "navigation confusion");
  add("ev_w33_b", "2026-08-11T10:00:00.000Z", "Still lost on Harbor.", "pain_point", "navigation confusion");
  add("ev_w33_c", "2026-08-11T11:00:00.000Z", "Lost again with my kid.", "pain_point", "navigation confusion");
  add("ev_w33_d", "2026-08-12T10:00:00.000Z", "I already use Greenlight for allowance.", "objection", "competitor greenlight");
  add("ev_w33_e", "2026-08-12T12:00:00.000Z", "The Plinth moment made us gasp.", "delight", "plinth gasp");
  add("ev_w33_f", "2026-08-12T13:00:00.000Z", "Can we get a parent progress email?", "feature_request", "parent email");
  add(
    "ev_w33_g",
    "2026-08-12T14:00:00.000Z",
    "Harbor felt that — we kept saying it all week.",
    "customer_language",
    "harbor felt that",
  );

  return store;
}

describe("CUSTOMER_TRUTH_REPORT", () => {
  it("returns UNKNOWN confidence none when store empty", () => {
    const week = weekIdFromDate("2026-08-12");
    const report = generateCustomerTruthReport(createEmptyVocStore(), week);
    expect(report.confidence).toBe("none");
    expect(report.most_common_pain).toBeNull();
    expect(report.auto_promoted_to_fact).toBe(false);
    expect(report.canonical_rank).toBe(6);
    expect(report.unknowns.length).toBeGreaterThan(0);
  });

  it("names most common pain from annotations with evidence URIs", () => {
    const store = seedTwoWeeks();
    const week = weekIdFromDate("2026-08-12");
    const report = generateCustomerTruthReport(store, week, "2026-08-14T00:00:00.000Z");
    expect(report.most_common_pain?.label).toBe("navigation confusion");
    expect(report.most_common_pain?.frequency).toBeGreaterThanOrEqual(3);
    expect(report.most_common_pain?.evidence_uris[0]).toMatch(/^https:\/\/evidence\.test\//);
    expect(report.new_objections.some((o) => /greenlight/i.test(o.label))).toBe(true);
    expect(report.strongest_customer_language.length).toBeGreaterThan(0);
    expect(report.product_opportunities.some((o) => /parent email/i.test(o.label))).toBe(true);
  });

  it("detects fastest-growing pain vs prior week without inventing", () => {
    const store = seedTwoWeeks();
    const week = weekIdFromDate("2026-08-12");
    const report = generateCustomerTruthReport(store, week);
    expect(report.fastest_growing_pain?.label).toBe("navigation confusion");
    expect(report.fastest_growing_pain!.delta).toBeGreaterThan(0);
  });

  it("markdown report includes confidence and non-promotion banner", () => {
    const store = seedTwoWeeks();
    const week = weekIdFromDate("2026-08-12");
    const report = generateCustomerTruthReport(store, week);
    const md = formatCustomerTruthReportMarkdown(report);
    expect(md).toMatch(/auto_promoted_to_fact: false/);
    expect(md).toMatch(/Most common pain/);
    expect(md).toMatch(/Confidence level/);
  });
});
