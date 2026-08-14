import { describe, expect, it } from "vitest";
import {
  InstitutionalMemory,
  PROMOTION_LADDER,
  ValidationError,
  currentBody,
  nextStage,
  validateWrite,
} from "./index";
import type { MemoryRecord, PromotionRequest, PromotionStage } from "./types";

function humanObs(overrides: Partial<Parameters<InstitutionalMemory["write"]>[0]> = {}) {
  return {
    id: overrides.id ?? "obs-1",
    storage_class: overrides.storage_class ?? ("customer_evidence" as const),
    title: overrides.title ?? "Clip",
    body: overrides.body ?? "Player said hard",
    writer: overrides.writer ?? "ops",
    from_agent: overrides.from_agent ?? false,
    evidence_refs: overrides.evidence_refs ?? [{ ref: "file://clip.mp4" }],
    source_refs: overrides.source_refs,
    expires_at: overrides.expires_at,
    change_note: overrides.change_note,
    stage: overrides.stage,
  };
}

function promoteStep(
  record: MemoryRecord,
  to: PromotionStage,
  writer: string,
  approver?: string,
): PromotionRequest {
  return {
    record_id: record.id,
    to_stage: to,
    writer,
    approver: approver ?? null,
    evidence_refs: [{ ref: "uri://evidence" }],
    source_refs: [{ ref: "uri://source" }],
    change_note: `promote to ${to} with proof`,
  };
}

describe("validateWrite", () => {
  it("blocks agent writes to canonical and other truth classes", () => {
    const bad = validateWrite({
      id: "bad-canon",
      storage_class: "canonical",
      title: "Fake",
      body: "AI invents policy",
      writer: "agent",
      from_agent: true,
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      expect(bad.issues.some((i) => i.code === "no_auto_canonical" || i.code === "agent_forbidden")).toBe(
        true,
      );
    }

    const metrics = validateWrite({
      id: "bad-metrics",
      storage_class: "metrics",
      title: "ARR",
      body: "1",
      writer: "agent",
      from_agent: true,
    });
    expect(metrics.ok).toBe(false);
  });

  it("allows agent_run_history and temporary_working_context", () => {
    expect(
      validateWrite({
        id: "run-1",
        storage_class: "agent_run_history",
        title: "Run",
        body: "summary",
        writer: "agent",
        from_agent: true,
      }).ok,
    ).toBe(true);

    expect(
      validateWrite({
        id: "tmp-1",
        storage_class: "temporary_working_context",
        title: "Scratch",
        body: "wip",
        writer: "agent",
        from_agent: true,
        expires_at: "2099-01-01T00:00:00.000Z",
      }).ok,
    ).toBe(true);
  });
});

describe("InstitutionalMemory", () => {
  it("rejects direct write to canonical", () => {
    const store = new InstitutionalMemory();
    expect(() =>
      store.write({
        id: "canon-1",
        storage_class: "canonical",
        title: "Policy",
        body: "truth",
        writer: "founder",
        from_agent: false,
      }),
    ).toThrow(/promote|canonical/i);
  });

  it("requires sequential promotion with evidence/source refs", () => {
    const store = new InstitutionalMemory();
    let rec = store.write(humanObs());

    expect(() =>
      store.promote({
        record_id: rec.id,
        to_stage: "hypothesis",
        writer: "ops",
        evidence_refs: [{ ref: "e1" }],
        source_refs: [{ ref: "s1" }],
        change_note: "skip stages illegally",
      }),
    ).toThrow(/skip|next stage/i);

    expect(nextStage(rec.stage)).toBe("evidence");

    expect(() =>
      store.promote({
        record_id: rec.id,
        to_stage: "evidence",
        writer: "ops",
        evidence_refs: [],
        source_refs: [],
        change_note: "missing evidence refs here",
      }),
    ).toThrow(/evidence/i);

    rec = store.promote(promoteStep(rec, "evidence", "ops"));
    expect(rec.stage).toBe("evidence");
    expect(rec.storage_class).toBe("customer_evidence");
  });

  it("promotes full ladder to canonical only with human approver", () => {
    const store = new InstitutionalMemory();
    let rec = store.write(
      humanObs({
        id: "ladder-1",
        storage_class: "temporary_working_context",
        expires_at: "2099-01-01T00:00:00.000Z",
        from_agent: false,
      }),
    );

    for (const stage of PROMOTION_LADDER.slice(1)) {
      const needHuman = stage === "approved_decision" || stage === "canonical_policy";
      if (needHuman) {
        expect(() =>
          store.promote(promoteStep(rec, stage, "ops", "agent")),
        ).toThrow(/human|approver/i);
      }
      rec = store.promote(promoteStep(rec, stage, "ops", needHuman ? "founder" : undefined));
      expect(rec.stage).toBe(stage);
    }

    expect(rec.storage_class).toBe("canonical");
    expect(store.listByClass("canonical")).toHaveLength(1);
  });

  it("keeps version history and supports rollback", () => {
    const store = new InstitutionalMemory();
    let rec = store.write({
      id: "metric-1",
      storage_class: "metrics",
      title: "ARR",
      body: "1",
      writer: "ops",
      from_agent: false,
    });
    rec = store.revise(rec.id, "2", "ops", "bump");
    expect(rec.versions).toHaveLength(2);
    expect(currentBody(rec)).toBe("2");

    rec = store.rollback(rec.id, 1, "ops");
    expect(rec.versions).toHaveLength(3);
    expect(currentBody(rec)).toBe("1");
  });

  it("blocks canonical revise; rollback needs human", () => {
    const store = new InstitutionalMemory();
    let rec = store.write(humanObs({ id: "dec-1", storage_class: "decisions" }));
    for (const stage of PROMOTION_LADDER.slice(1)) {
      const human = stage === "approved_decision" || stage === "canonical_policy";
      rec = store.promote(promoteStep(rec, stage, "ops", human ? "founder" : undefined));
    }
    expect(() => store.revise(rec.id, "nope", "founder", "edit")).toThrow(/immutable|Canonical/i);
    expect(() => store.rollback(rec.id, 1, "agent")).toThrow(/human/i);
    rec = store.rollback(rec.id, 1, "founder", "undo");
    expect(currentBody(rec)).toBe("Player said hard");
  });

  it("purgeExpired removes temp context", () => {
    const store = new InstitutionalMemory();
    store.write({
      id: "old-tmp",
      storage_class: "temporary_working_context",
      title: "old",
      body: "x",
      writer: "agent",
      from_agent: true,
      expires_at: "2020-01-01T00:00:00.000Z",
    });
    store.write({
      id: "keep-tmp",
      storage_class: "temporary_working_context",
      title: "keep",
      body: "y",
      writer: "agent",
      from_agent: true,
      expires_at: "2099-01-01T00:00:00.000Z",
    });
    expect(store.purgeExpired(new Date("2024-01-01"))).toBe(1);
    expect(store.listByClass("temporary_working_context")).toHaveLength(1);
  });

  it("serialize / hydrate round-trip", () => {
    const store = new InstitutionalMemory();
    store.write({
      id: "run-rt",
      storage_class: "agent_run_history",
      title: "r",
      body: "ok",
      writer: "agent",
      from_agent: true,
    });
    const snap = store.serialize();
    const store2 = new InstitutionalMemory();
    store2.hydrate(snap);
    expect(store2.listByClass("agent_run_history")).toHaveLength(1);
    expect(snap.schema_version).toBe("1");
  });

  it("never auto-promotes agent output to canonical", () => {
    const store = new InstitutionalMemory();
    const run = store.write({
      id: "agent-out",
      storage_class: "agent_run_history",
      title: "AI draft policy",
      body: "We should charge $99",
      writer: "gpt-bot",
      from_agent: true,
    });
    expect(run.storage_class).toBe("agent_run_history");
    expect(run.storage_class).not.toBe("canonical");
    // Cannot jump to canonical
    expect(() =>
      store.promote({
        record_id: run.id,
        to_stage: "canonical_policy",
        writer: "gpt-bot",
        approver: "gpt-bot",
        evidence_refs: [{ ref: "x" }],
        source_refs: [{ ref: "y" }],
        change_note: "auto promote this nonsense",
      }),
    ).toThrow();
  });
});
