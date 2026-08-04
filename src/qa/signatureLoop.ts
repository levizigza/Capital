/**
 * Signature loop — Cove Change → Harbor felt that.
 * Pure helpers for QA, timing budgets, and day-2 surprise.
 * Freeze: deepen this loop; do not widen the map.
 */

import type { IslandSaveV1 } from "@/islands/types";
import { STORY_BIBLE_VERSION } from "@/islands/story/storyBible";
import {
  coldOrganKidSentence,
  harborScarPlaques,
  scarTriggersChapterQuiet,
  type HarborScar,
} from "@/islands/worldMemory";
import { localDayKey, pickDailyRumor } from "@/islands/harborRitual";
import { createDefaultIslandSave } from "@/islands/save";
import {
  COVE_CHANGE_QUEST_ID,
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  CREDIT_ORDEAL_QUEST_ID,
  PAYCHECK_CHANGE_QUEST_ID,
  PAYCHECK_PENINSULA_ID,
} from "@/islands/islandIds";
import type { MoneyOrganId } from "@/islands/moneyOrgans";

/** Trailer-grade beat timings (ms). Reduced-motion scales by REDUCED_MOTION_MULT. */
export const SIGNATURE_TIMING = {
  /** Quiet breath before the organ mark. */
  hushMs: 550,
  /** Mark flash ends here — keep mark readable (~850ms). */
  revealMs: 1400,
  /** Spectacle hold (ScarSpectacleOverlay may still use doneMs). */
  holdEndMs: 3600,
  /**
   * Cold unseeded Take auto-dismiss — line + kid sentence + “Carpet home”
   * must land before the shore quiet HUD (pier guide + bottom CTA).
   * Slightly longer than hold so the combine chamber is readable.
   */
  doneMs: 5200,
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

/** Spine Take organ for cold retell seeds (Memory arrives via day-2 / Plinth). */
export type SignatureSpineOrgan = Extract<MoneyOrganId, "coin" | "clock" | "spiral">;

type SpineScarSeed = {
  scar: Omit<HarborScar, "createdAt"> & { createdAt?: string };
  irreversibleKey: string;
  choiceId: string;
  questId: string;
  islandId: string;
};

const SPINE_SCARS: Record<SignatureSpineOrgan, SpineScarSeed> = {
  coin: {
    scar: {
      id: "cove_saver_plaque",
      islandId: COVE_ISLAND_ID,
      choiceId: "save",
      label: "Jar before treat",
      kind: "plaque",
    },
    irreversibleKey: "cove_save_vs_spend",
    choiceId: "save",
    questId: COVE_CHANGE_QUEST_ID,
    islandId: COVE_ISLAND_ID,
  },
  clock: {
    scar: {
      id: "pp_protector_plaque",
      islandId: PAYCHECK_PENINSULA_ID,
      choiceId: "protect",
      label: "Umbrella before glitter",
      kind: "plaque",
    },
    irreversibleKey: "paycheck_protect_vs_spend",
    choiceId: "protect",
    questId: PAYCHECK_CHANGE_QUEST_ID,
    islandId: PAYCHECK_PENINSULA_ID,
  },
  spiral: {
    scar: {
      id: "credit_patience_plaque",
      islandId: CREDIT_KINGDOM_ID,
      choiceId: "wait",
      label: "Waited the spiral",
      kind: "plaque",
    },
    irreversibleKey: "credit_borrow_vs_wait",
    choiceId: "wait",
    questId: CREDIT_ORDEAL_QUEST_ID,
    islandId: CREDIT_KINGDOM_ID,
  },
};

/** Seed a save parked at Harbor after a spine Take (cold playtest / e2e). */
export function buildSignatureLoopSave(
  phase: SignaturePhase = "spectacle_ready",
  now = new Date(),
  organ: SignatureSpineOrgan = "coin",
): IslandSaveV1 {
  const base = createDefaultIslandSave();
  const dayKey = localDayKey(now);
  const seed = SPINE_SCARS[organ];
  const createdAt =
    phase === "day2_echo" ? "2026-07-20T12:00:00.000Z" : now.toISOString();
  const scar: HarborScar = { ...seed.scar, createdAt };
  const kid = coldOrganKidSentence(organ);

  const save: IslandSaveV1 = {
    ...base,
    // Ashore land must not remount card onboarding over signature seeds.
    onboardingComplete: true,
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
      ...(organ === "clock" || organ === "spiral"
        ? {
            [PAYCHECK_CHANGE_QUEST_ID]: {
              started: true,
              completed: true,
              completedObjectives: [] as string[],
            },
          }
        : {}),
      ...(organ === "spiral"
        ? {
            [CREDIT_ORDEAL_QUEST_ID]: {
              started: true,
              completed: true,
              completedObjectives: [] as string[],
            },
          }
        : {}),
      [seed.questId]: {
        started: true,
        completed: true,
        completedObjectives: [] as string[],
      },
    },
    discovered: {
      ...base.discovered,
      islands: [
        ...new Set([
          ...(base.discovered.islands ?? []),
          COVE_ISLAND_ID,
          "harbor_haven",
          ...(organ === "clock" || organ === "spiral" ? [PAYCHECK_PENINSULA_ID] : []),
          ...(organ === "spiral" ? [CREDIT_KINGDOM_ID] : []),
        ]),
      ],
    },
    irreversibleChoices: {
      [seed.irreversibleKey]: {
        choiceId: seed.choiceId,
        label: scar.label,
        islandId: seed.islandId,
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
            chapterIslandId: seed.islandId,
            questId: seed.questId,
            message: `Piggy Penny: ${kid} Harbor remembered: “${scar.label}.”`,
          }
        : phase === "day2_echo"
          ? {
              pending: false,
              celebrated: true,
              piggyTalked: true,
              quietPending: false,
              chapterIslandId: seed.islandId,
              questId: seed.questId,
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
