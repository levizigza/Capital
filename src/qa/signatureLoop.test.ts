import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  auditSignatureLoop,
  buildSignatureLoopSave,
  signatureTiming,
  takeCinemaPhaseAt,
  SIGNATURE_TRAILER_SHOTS,
  SIGNATURE_TIMING,
} from "./signatureLoop";

describe("signature loop QA", () => {
  it("seeds spectacle_ready for cold Harbor playtest", () => {
    const save = buildSignatureLoopSave("spectacle_ready");
    const audit = auditSignatureLoop(save);
    expect(audit.ok).toBe(true);
    expect(audit.phase).toBe("spectacle_ready");
    expect(save.harborScars?.[0]?.id).toMatch(/^cove_/);
    expect(save.scarSpectacle?.shownForCount ?? 0).toBe(0);
    expect(save.hubGuidedIntro?.step).toBe("done");
    expect(save.hubGuidedIntro?.didDock).toBe(true);
  });

  it("seeds Clock and Spiral spectacle for spine cold retell", () => {
    const clock = buildSignatureLoopSave("spectacle_ready", new Date(), "clock");
    expect(clock.harborScars?.[0]?.id).toBe("pp_protector_plaque");
    expect(auditSignatureLoop(clock).phase).toBe("spectacle_ready");
    expect(clock.harborHomecoming?.message).toMatch(/Clock shelters/);

    const spiral = buildSignatureLoopSave("spectacle_ready", new Date(), "spiral");
    expect(spiral.harborScars?.[0]?.id).toBe("credit_patience_plaque");
    expect(auditSignatureLoop(spiral).phase).toBe("spectacle_ready");
    expect(spiral.harborHomecoming?.message).toMatch(/Spiral withstands/);
  });

  it("seeds day2_echo with overnight surprise rumor", () => {
    const save = buildSignatureLoopSave("day2_echo", new Date(2026, 6, 28));
    const audit = auditSignatureLoop(save, "2026-07-28");
    expect(audit.phase).toBe("day2_echo");
    expect(save.harborRitual?.today.rumorId).toMatch(/^scar_echo_/);
    expect(save.harborRitual?.today.echoSurpriseSeen).toBe(false);
  });

  it("keeps trailer under ~30s and hush shorter under reduced motion", () => {
    expect(SIGNATURE_TIMING.trailerBeatMs).toBeLessThanOrEqual(30_000);
    expect(SIGNATURE_TRAILER_SHOTS.length).toBeGreaterThanOrEqual(5);
    const full = signatureTiming(false);
    const soft = signatureTiming(true);
    expect(soft.doneMs).toBeLessThan(full.doneMs);
    expect(full.doneMs).toBeLessThanOrEqual(6000);
  });

  it("Take cinema phases: hush → mark → line", () => {
    const t = signatureTiming(false);
    expect(takeCinemaPhaseAt(0, t)).toBe("hush");
    expect(takeCinemaPhaseAt(t.hushMs - 1, t)).toBe("hush");
    expect(takeCinemaPhaseAt(t.hushMs, t)).toBe("mark");
    expect(takeCinemaPhaseAt(t.revealMs - 1, t)).toBe("mark");
    expect(takeCinemaPhaseAt(t.revealMs, t)).toBe("line");
    expect(t.revealMs).toBeLessThan(t.holdEndMs);
    // Mark stays readable; line + Carpet CTA own the rest until doneMs.
    expect(t.revealMs - t.hushMs).toBeGreaterThanOrEqual(800);
    expect(t.doneMs - t.revealMs).toBeGreaterThanOrEqual(2800);
    expect(t.doneMs).toBeLessThanOrEqual(6000);
  });

  it("TakeHushOverlay auto-dismisses on doneMs (cold unseeded path)", () => {
    const take = readFileSync(
      join(__dirname, "../islands/views/TakeHushOverlay.tsx"),
      "utf8",
    );
    expect(take).toMatch(/t\.doneMs/);
    expect(take).not.toMatch(/t\.holdEndMs/);
  });

  it("flags cove_quiet when chapter hush is pending", () => {
    const save = buildSignatureLoopSave("cove_quiet");
    expect(auditSignatureLoop(save).phase).toBe("cove_quiet");
  });
});
