/**
 * Pillar 16 — Testing & iteration cadence.
 *
 * After each pillar fix:
 * 1. `npm run test:iconic` (unit contracts + content validate)
 * 2. When Harbor / Cove / carpet touched: `npm run test:iconic:e2e`
 * 3. One cold human run (fresh profile or QA seed) + six questions below
 * 4. Update docs/iconic-craft-plan.md status board
 *
 * Cold checklist prose lives in docs/iconic-path.md — this module is the
 * machine-readable map so coverage cannot rot silently.
 */

export const ICONIC_ITERATION_QUESTIONS = [
  "Did the player misunderstand what to do?",
  "Did anything feel unfair?",
  "Did anything feel repetitive without a new beat?",
  "Did the game ignore a clear ability the player already had?",
  "Did the player get lost (place or goal)?",
  "Did the moment feel fun, or only functional?",
] as const;

export type ColdCheckMode = "unit" | "e2e" | "human";

export type ColdCheckRow = {
  id: string;
  /** Matches a row in docs/iconic-path.md Cold playtest checklist. */
  step: string;
  modes: ColdCheckMode[];
  /** Repo-relative paths that guard this step (empty ⇒ human-only). */
  guards: string[];
};

/** Signature cold path — keep in sync with docs/iconic-path.md. */
export const ICONIC_COLD_CHECKLIST: readonly ColdCheckRow[] = [
  {
    id: "cove_take",
    step: "Cove Take",
    modes: ["unit", "e2e", "human"],
    guards: ["src/qa/signatureLoop.test.ts", "e2e/signature-loop.spec.ts"],
  },
  {
    id: "carpet_rail",
    step: "Carpet to Cove",
    modes: ["unit", "human"],
    guards: ["src/islands/world3d/carpetVoyageRail.test.ts"],
  },
  {
    id: "structure_enter",
    step: "Structure enter",
    modes: ["unit", "human"],
    guards: [
      "src/islands/world3d/structureInteriorNeverVoid.test.ts",
      "src/islands/world3d/structureInteriorArchitecture.test.ts",
    ],
  },
  {
    id: "structure_pads",
    step: "Structure pads",
    modes: ["unit", "human"],
    guards: ["src/islands/world3d/StructurePartSilhouette.test.ts"],
  },
  {
    id: "structure_exit",
    step: "Structure exit",
    modes: ["unit", "e2e", "human"],
    guards: [
      "src/islands/world3d/structureSoftBeatExit.test.ts",
      "e2e/structure-soft-beat.spec.ts",
    ],
  },
  {
    id: "piggy_first_meet",
    step: "Piggy first meet",
    modes: ["unit", "e2e", "human"],
    guards: [
      "src/islands/harborAshore.test.ts",
      "src/islands/harborFirstMeet.test.ts",
      "src/islands/views/ashoreComprehensionTutorial.test.ts",
      "src/islands/story/onboardingNoAhead.test.ts",
      "src/islands/pointerSafeClick.test.ts",
      "e2e/harbor-tutorial.spec.ts",
    ],
  },
  {
    id: "no_coach_ahead",
    step: "No coach ahead",
    modes: ["unit", "e2e"],
    guards: [
      "src/islands/story/onboardingNoAhead.test.ts",
      "e2e/harbor-tutorial.spec.ts",
    ],
  },
  {
    id: "quiet_chrome",
    step: "Quiet chrome",
    modes: ["unit", "e2e", "human"],
    guards: ["src/islands/harborFirstMeet.test.ts", "e2e/harbor-tutorial.spec.ts"],
  },
  {
    id: "myth_fallback",
    step: "Slow-device Harbor",
    modes: ["unit", "human"],
    guards: ["src/islands/world3d/harborLoadFailsafe.test.ts"],
  },
  {
    id: "carpet_home",
    step: "Carpet home",
    modes: ["unit", "e2e", "human"],
    guards: ["src/qa/signatureLoop.test.ts", "e2e/signature-loop.spec.ts"],
  },
  {
    id: "spectacle",
    step: "Spectacle",
    modes: ["unit", "e2e", "human"],
    guards: [
      "src/qa/signatureLoop.test.ts",
      "src/islands/storyColdRetell.test.ts",
      "e2e/signature-loop.spec.ts",
    ],
  },
  {
    id: "share",
    step: "Share",
    modes: ["unit", "e2e", "human"],
    guards: [
      "src/islands/views/weeklyShareCard.test.ts",
      "e2e/signature-loop.spec.ts",
    ],
  },
  {
    id: "piggy_presence",
    step: "Piggy",
    modes: ["unit", "e2e", "human"],
    guards: ["src/islands/story/iconicCraft.test.ts", "e2e/signature-loop.spec.ts"],
  },
  {
    id: "day2",
    step: "Day 2",
    modes: ["unit", "e2e", "human"],
    guards: ["src/qa/signatureLoop.test.ts", "e2e/signature-loop.spec.ts"],
  },
  {
    id: "soft_beat",
    step: "Soft Beat",
    modes: ["unit", "human"],
    guards: [
      "src/islands/storyColdRetell.test.ts",
      "src/islands/structureToyCulture.test.ts",
    ],
  },
  {
    id: "trailer",
    step: "Trailer",
    modes: ["unit", "human"],
    guards: ["src/qa/signatureLoop.test.ts"],
  },
  {
    id: "mute_stingers",
    step: "Mute-test stingers",
    modes: ["unit", "human"],
    guards: ["src/islands/audio/signatureMuteAudio.test.ts"],
  },
  {
    id: "esc_leave",
    step: "Esc · Leave overlays",
    modes: ["unit", "human"],
    guards: ["src/islands/views/useOverlayEscape.test.ts"],
  },
  {
    id: "corrupt_save",
    step: "Corrupt save never bricks",
    modes: ["unit", "human"],
    guards: ["src/islands/save.test.ts"],
  },
  {
    id: "reduced_motion",
    step: "Reduced motion (Settings OR OS)",
    modes: ["unit", "human"],
    guards: ["src/islands/signatureA11y.test.ts", "src/islands/a11yMotion.test.ts"],
  },
] as const;

export type PillarContract = {
  pillar: number;
  name: string;
  /** Unit (and optional e2e) guards shipped with that pillar pass. */
  guards: string[];
};

/** Pillar contract suite for `npm run test:iconic` (7–17 + signature + cadence). */
export const ICONIC_PILLAR_CONTRACTS: readonly PillarContract[] = [
  { pillar: 7, name: "Content", guards: ["src/islands/spineContentRegistry.test.ts"] },
  { pillar: 8, name: "Balance", guards: ["src/islands/balanceSheet.test.ts"] },
  {
    pillar: 9,
    name: "UI / comms",
    guards: [
      "src/islands/views/useOverlayEscape.test.ts",
      "src/islands/pointerSafeClick.test.ts",
    ],
  },
  {
    pillar: 10,
    name: "Art direction",
    guards: ["src/islands/world3d/StructurePartSilhouette.test.ts"],
  },
  {
    pillar: 11,
    name: "Audio",
    guards: ["src/islands/audio/signatureMuteAudio.test.ts"],
  },
  {
    pillar: 12,
    name: "Story",
    guards: ["src/islands/storyColdRetell.test.ts"],
  },
  {
    pillar: 13,
    name: "Onboarding",
    guards: ["src/islands/story/onboardingNoAhead.test.ts"],
  },
  {
    pillar: 14,
    name: "Technical",
    guards: [
      "src/islands/save.test.ts",
      "src/islands/world3d/harborLoadFailsafe.test.ts",
      "src/islands/views/playableIslandsContract.test.ts",
      "e2e/harbor-3d-failsafe.spec.ts",
    ],
  },
  {
    pillar: 15,
    name: "Accessibility",
    guards: ["src/islands/signatureA11y.test.ts", "src/islands/a11yMotion.test.ts"],
  },
  {
    pillar: 16,
    name: "Testing",
    guards: [
      "src/qa/iconicCraftCadence.test.ts",
      "src/qa/signatureLoop.test.ts",
      "src/qa/iconicProofLaw.test.ts",
    ],
  },
  {
    pillar: 17,
    name: "Scope",
    guards: ["src/islands/iconicScopeFreeze.test.ts", "src/islands/spineArchipelago.test.ts"],
  },
] as const;

/** Unique vitest paths for the iconic craft unit gate. */
export function iconicUnitTestPaths(): string[] {
  const set = new Set<string>([
    "src/qa/signatureLoop.test.ts",
    "src/qa/iconicCraftCadence.test.ts",
    "src/qa/iconicProofLaw.test.ts",
    "src/islands/story/iconicCraft.test.ts",
    "src/islands/signatureCinemaGate.test.ts",
    "src/islands/views/signatureJuiceContract.test.ts",
    "src/islands/views/minigameFailContract.test.ts",
    "src/islands/minigameFail.test.ts",
    "src/islands/moneyStructures.test.ts",
    "src/islands/islandShoreLayout.test.ts",
    "src/islands/views/progressionContract.test.ts",
    "src/islands/views/talkBattleFantasy.test.ts",
    "src/islands/ashoreColdRetell.test.ts",
    "src/islands/input/walkFeel.test.ts",
    "src/islands/creditEncounter.test.ts",
  ]);
  for (const row of ICONIC_COLD_CHECKLIST) {
    for (const g of row.guards) {
      if (g.endsWith(".test.ts")) set.add(g);
    }
  }
  for (const p of ICONIC_PILLAR_CONTRACTS) {
    for (const g of p.guards) {
      if (g.endsWith(".test.ts")) set.add(g);
    }
  }
  return [...set].sort();
}

/** Playwright specs for signature Harbor / Cove smoke. */
export const ICONIC_E2E_SPECS = [
  "e2e/signature-loop.spec.ts",
  "e2e/harbor-tutorial.spec.ts",
  "e2e/harbor-3d-failsafe.spec.ts",
  "e2e/cast-select.spec.ts",
  "e2e/structure-soft-beat.spec.ts",
] as const;
