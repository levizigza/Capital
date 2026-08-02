/**
 * Signature loop — Cove Change → Harbor felt that.
 * Pure helpers for QA, timing budgets, and day-2 surprise.
 * Freeze: deepen this loop; do not widen the map.
 */

import type { IslandSaveV1 } from "@/islands/types";
import { STORY_BIBLE_VERSION } from "@/islands/story/storyBible";
import { harborScarPlaques, scarTriggersChapterQuiet } from "@/islands/worldMemory";
import { localDayKey, pickDailyRumor } from "@/islands/harborRitual";
import { createDefaultIslandSave } from "@/islands/save";
import { COVE_CHANGE_QUEST_ID, COVE_ISLAND_ID } from "@/islands/islandIds";

/** Trailer-grade beat timings (ms). Reduced-motion scales by REDUCED_MOTION_MULT. */
export const SIGNATURE_TIMING = {
  /** Quiet breath before the organ mark. */
  hushMs: 550,
  /** Mark flash ends here — keep mark readable (~850ms). */
  revealMs: 1400,
  /** Spectacle hold (ScarSpectacleOverlay may still use doneMs). */
  holdEndMs: 3600,
  /**
   * Cold unseeded Take auto-dismiss — line + “Carpet home” CTA must land
   * before the shore quiet HUD (pier guide + bottom CTA).
   */
  doneMs: 4200,
  plinthGlowMs: 14000,
  trailerBeatMs: 24_000,
  reducedMotionMult: 0.55,
} as const;

export function signatureTiming(reducedMotion: boolean) {
  const m = reducedMotion ? SIGNATURE_TIMING.reducedMotionMult : 1;
  return {
    hushMs: Math.round(SIGNATURE_TIMING.hushMs * m),
    revealMs: Math.round(SIGNATURE_TIMING.revealMs * m),
    holdEndMs: Math.round(SIGNATURE_TIMING.holdEndMs * m),
    doneMs: Math.round(SIGNATURE_TIMING.doneMs * m),
    plinthGlowMs: SIGNATURE_TIMING.plinthGlowMs,
    trailerBeatMs: Math.round(SIGNATURE_TIMING.trailerBeatMs * (reducedMotion ? 0.7 : 1)),
  };
}

/** Cove / Paycheck / Credit Take cinema — captions over the organ landmark. */
export type TakeCinemaPhase = "hush" | "mark" | "line";

export function takeCinemaPhaseAt(
  elapsedMs: number,
  timing: ReturnType<typeof signatureTiming>,
): TakeCinemaPhase {
  if (elapsedMs < timing.hushMs) return "hush";
  if (elapsedMs < timing.revealMs) return "mark";
  return "line";
}

export type SignaturePhase =
  | "cove_quiet"
  | "spectacle_ready"
  | "share_ready"
  | "piggy_ready"
  | "day2_echo";

const COVE_SCAR = {
  id: "cove_saver_plaque",
  islandId: COVE_ISLAND_ID,
  choiceId: "save",
  label: "Jar before treat",
  kind: "plaque" as const,
  createdAt: "2026-07-27T18:00:00.000Z",
};

/** Seed a save parked at Harbor right after Cove Change (cold playtest / e2e). */
export function buildSignatureLoopSave(
  phase: SignaturePhase = "spectacle_ready",
  now = new Date(),
): IslandSaveV1 {
  const base = createDefaultIslandSave();
  const dayKey = localDayKey(now);
  const scar =
    phase === "day2_echo"
      ? { ...COVE_SCAR, createdAt: "2026-07-20T12:00:00.000Z" }
      : { ...COVE_SCAR, createdAt: now.toISOString() };

  const save: IslandSaveV1 = {
    ...base,
    hubGuidedIntro: {
      version: STORY_BIBLE_VERSION,
      step: "done",
      didDock: true,
      didOutfitter: true,
      didSpendLesson: true,
    },
    questStatus: {
      ...base.questStatus,
      [COVE_CHANGE_QUEST_ID]: {
        started: true,
        completed: true,
        completedObjectives: ["talk:npc_keeper_kira"],
      },
    },
    discovered: {
      ...base.discovered,
      islands: [...new Set([...(base.discovered.islands ?? []), COVE_ISLAND_ID, "harbor_haven"])],
    },
    irreversibleChoices: {
      cove_save_vs_spend: {
        choiceId: "save",
        label: "Jar before treat",
        islandId: COVE_ISLAND_ID,
        at: scar.createdAt,
      },
    },
    harborScars: [scar],
    stance: { saver: 2, spender: 0, risk: 0 },
    scarSpectacle:
      phase === "spectacle_ready"
        ? { shownForCount: 0 }
        : { shownForCount: 1, lastShownAt: now.toISOString() },
    chapterQuietPending: phase === "cove_quiet",
    harborHomecoming:
      phase === "piggy_ready" || phase === "share_ready" || phase === "spectacle_ready"
        ? {
            pending: phase === "spectacle_ready",
            celebrated: phase !== "spectacle_ready",
            piggyTalked: false,
            quietPending: true,
            chapterIslandId: COVE_ISLAND_ID,
            questId: COVE_CHANGE_QUEST_ID,
            message:
              "Piggy Penny: You earned coins and made a real choice. Harbor feels different because YOU are. I already set a plaque: Jar before treat.",
          }
        : phase === "day2_echo"
          ? {
              pending: false,
              celebrated: true,
              piggyTalked: true,
              quietPending: false,
              chapterIslandId: COVE_ISLAND_ID,
              questId: COVE_CHANGE_QUEST_ID,
            }
          : undefined,
  };

  if (phase === "day2_echo") {
    const rumor = pickDailyRumor(save, dayKey);
    save.harborRitual = {
      lastDayKey: dayKey,
      streak: 2,
      today: {
        rumorId: rumor.id,
        rumorSeen: false,
        paydayDone: false,
        rewardClaimed: false,
        greeted: true,
        echoSurpriseSeen: false,
      },
    };
  }

  return save;
}

export type SignatureLoopCheck = {
  ok: boolean;
  phase: SignaturePhase | "unknown";
  notes: string[];
};

/** Cold-playtest invariants for the iconic sentence. */
export function auditSignatureLoop(save: IslandSaveV1, dayKey = localDayKey()): SignatureLoopCheck {
  const notes: string[] = [];
  const plaques = harborScarPlaques(save);
  const latest = plaques.at(-1);
  const coveScar = latest?.id.startsWith("cove_");

  if (save.chapterQuietPending && latest && scarTriggersChapterQuiet(latest.id)) {
    return { ok: true, phase: "cove_quiet", notes: ["Chapter hush active after Take"] };
  }

  if (
    plaques.length > (save.scarSpectacle?.shownForCount ?? 0) &&
    save.harborHomecoming &&
    !save.harborHomecoming.piggyTalked
  ) {
    notes.push("Spectacle should fire before Welcome home / Piggy");
    return { ok: true, phase: "spectacle_ready", notes };
  }

  if (
    (save.scarSpectacle?.shownForCount ?? 0) >= plaques.length &&
    plaques.length > 0 &&
    save.harborHomecoming &&
    !save.harborHomecoming.piggyTalked
  ) {
    notes.push("Share card + quiet Harbor → find Piggy");
    return { ok: true, phase: "piggy_ready", notes };
  }

  const rumor = pickDailyRumor(save, dayKey);
  const spineScar =
    Boolean(coveScar) ||
    Boolean(latest?.id.startsWith("pp_")) ||
    Boolean(latest?.id.startsWith("credit_"));
  if (rumor.id.startsWith("scar_echo_") && spineScar) {
    notes.push("Day-2 plaza should surprise without a tutorial — organ scar still named");
    return { ok: true, phase: "day2_echo", notes };
  }

  if (plaques.length > 0) {
    notes.push("Plaques present — loop partially complete");
    return { ok: true, phase: "share_ready", notes };
  }

  return {
    ok: false,
    phase: "unknown",
    notes: ["No spine scar yet — play a Cove / Paycheck / Credit Take first"],
  };
}

/** Trailer shot list (captions) — ~24s mute-friendly. Cold-retell names organs. */
export const SIGNATURE_TRAILER_SHOTS = [
  { atMs: 0, caption: "A choice you can't undo" },
  { atMs: 3500, caption: "Coin · Clock · Spiral go quiet" },
  { atMs: 7000, caption: "Harbor felt that · Coin · Clock · Spiral" },
  { atMs: 12_000, caption: "Memory Plinth remembers yesterday" },
  { atMs: 16_500, caption: "Piggy names the organ" },
  { atMs: 20_500, caption: "Money is alive" },
] as const;
