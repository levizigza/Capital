import { describe, expect, it } from "vitest";
import {
  addAnnotation,
  createEmptyVocStore,
  ingestEvidence,
  validateAnnotation,
} from "./ingest";

describe("VoC ingest — no invented facts", () => {
  it("requires evidence_uri to preserve original link", () => {
    const r = ingestEvidence(createEmptyVocStore(), {
      id: "ev1",
      source_type: "support",
      evidence_uri: "",
      captured_at: "2026-08-10",
      raw_text: "hello",
    });
    expect("issues" in r).toBe(true);
  });

  it("ingests evidence with URI and optional text", () => {
    const r = ingestEvidence(createEmptyVocStore(), {
      id: "ev_support_1",
      source_type: "support",
      evidence_uri: "https://example.com/tickets/1",
      captured_at: "2026-08-10T12:00:00.000Z",
      raw_text: "My kid got lost after the carpet — we quit for the night.",
      customer_segment: "families",
    });
    expect("evidence" in r).toBe(true);
    if ("evidence" in r) {
      expect(r.evidence.evidence_uri).toContain("tickets/1");
    }
  });

  it("rejects annotation quote not in evidence text", () => {
    let store = createEmptyVocStore();
    const ing = ingestEvidence(store, {
      id: "ev2",
      source_type: "review",
      evidence_uri: "file://reviews/1",
      captured_at: "2026-08-11",
      raw_text: "Love the Plinth glow.",
    });
    expect("evidence" in ing).toBe(true);
    if (!("evidence" in ing)) return;
    store = ing.store;
    const ann = addAnnotation(store, {
      id: "an1",
      evidence_id: "ev2",
      kind: "pain_point",
      label: "invented pain",
      quote: "This quote was never said",
      severity: 5,
      severity_source: "human",
    });
    expect("issues" in ann).toBe(true);
  });

  it("rejects severity without human source (no invented severity)", () => {
    const evidence = {
      id: "ev3",
      source_type: "interview" as const,
      evidence_uri: "https://example.com/i/3",
      captured_at: "2026-08-12",
      raw_text: "Too expensive for what we got.",
      customer_segment: null,
      ingest_notes: null,
    };
    const v = validateAnnotation(
      {
        id: "an2",
        evidence_id: "ev3",
        kind: "pricing_signal",
        label: "price concern",
        quote: "Too expensive for what we got.",
        severity: 4,
        severity_source: null,
      },
      evidence,
    );
    expect(v.ok).toBe(false);
  });

  it("accepts verbatim quote with human severity", () => {
    let store = createEmptyVocStore();
    const text = "Too expensive for what we got.";
    const ing = ingestEvidence(store, {
      id: "ev4",
      source_type: "cancellation",
      evidence_uri: "https://example.com/cancel/4",
      captured_at: "2026-08-12",
      raw_text: text,
    });
    if (!("evidence" in ing)) throw new Error("expected evidence");
    store = ing.store;
    const ann = addAnnotation(store, {
      id: "an3",
      evidence_id: "ev4",
      kind: "churn_driver",
      label: "price value",
      quote: text,
      severity: 4,
      severity_source: "human",
    });
    expect("annotation" in ann).toBe(true);
  });
});
