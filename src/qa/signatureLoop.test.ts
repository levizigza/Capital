import { describe, expect, it } from "vitest";
import {
  auditSignatureLoop,
  buildSignatureLoopSave,
  signatureTiming,
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

  it("flags cove_quiet when chapter hush is pending", () => {
    const save = buildSignatureLoopSave("cove_quiet");
    expect(auditSignatureLoop(save).phase).toBe("cove_quiet");
  });
});
