/**
 * Soft Beat lookouts — quiet “see the world you changed” toys inside Money Structures.
 * Not a minigame dump — a hush moment before the storm / after a Take.
 * Organ-true: Coin Lid · Memory Teller · Clock Loft · Spiral Battlement.
 */

import { useEffect } from "react";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { moneyOrganForSoftBeat } from "../moneyOrgans";
import { prefersReducedMotion } from "../a11yMotion";
import { GameButton } from "@/game-ui";
import { softBeatEyebrow } from "../titleVoice";
import { coldOrganKidSentence, organVerbChip } from "../worldMemory";
import { softBeatScarVistaLine } from "@/design/designBible";
import { triggerJuice } from "@/juice";
import { pointerSafeActivate } from "../pointerSafeClick";
import { useOverlayEscape } from "./useOverlayEscape";
import { armSoftBeat } from "../softBeatArm";

export type SoftBeatKind = "lookout" | "umbrella" | "battlement" | "ledger";

/** Soft Beat = structure-depth aspiration (Hermans): quiet peek, not a re-Take or Harbor retell. */
const BEATS: Record<
  SoftBeatKind,
  { title: string; line: string; hushLine: string; accent: string }
> = {
  lookout: {
    title: "Lid Lookout",
    line: "From the lid you feel the jar’s weight in your chest — Coin holds what Cove chose. Look once. Leave changed.",
    hushLine: "Quiet under the lid. The jar remembers so you don’t have to shout it. Not a second Take.",
    accent: "#fbbf24",
  },
  umbrella: {
    title: "Umbrella Loft",
    line: "From the loft Main Street looks dry or thin — Clock shelters what Paycheck chose. Rain remembers. Look — then leave.",
    hushLine: "Quiet in the loft. Shelter is a choice you can still feel. Not a second Take.",
    accent: "#38bdf8",
  },
  battlement: {
    title: "Score Battlement",
    line: "From the wall the coil cools or tightens — Spiral withstands what Credit chose. Interest doesn’t yell. Look — then leave.",
    hushLine: "Quiet on the wall. Haste still echoes if you fed it. Not a second Take.",
    accent: "#a78bfa",
  },
  ledger: {
    title: "Teller Window",
    line: "Under glass every jar and stamp hums — Memory keeps. This is why the plaza remembers. Look — then leave.",
    hushLine: "Quiet at the marble. Memory keeps your plaque without a lecture. Look — then leave.",
    accent: "#f59e0b",
  },
};

type Props = {
  kind: SoftBeatKind;
  hushActive?: boolean;
  /** Latest plaque label — living receipt inside the Soft Beat */
  scarLabel?: string | null;
  onDone: () => void;
};

export function SoftBeatOverlay({
  kind,
  hushActive = false,
  scarLabel = null,
  onDone,
}: Props) {
  const beat = BEATS[kind];
  const organ = moneyOrganForSoftBeat(kind);
  useOverlayEscape(onDone);

  useEffect(() => {
    triggerJuice("complete", { burst: true });
    playOrganSfx(organ.id);
    if (!prefersReducedMotion() || hushActive) {
      playCapitalSfx(hushActive ? "scar_chime" : "soft_beat");
    }
    // Arm the next living Talk — Soft Beat is multiplicative, not a dead cinema.
    armSoftBeat(kind);
    void import("../analytics").then(({ analytics }) => {
      void analytics.track("soft_beat_armed", { kind, organ: organ.id });
      void analytics.track("core_loop_beat", { beat: "soft_beat", kind });
    });
    // Stay-until-Leave — toy value, not a timed cinema dump (pattern library #51).
  }, [hushActive, organ.id, kind]);

  const vista = softBeatScarVistaLine(kind, scarLabel);
  const body = hushActive ? beat.hushLine : (vista ?? beat.line);
  const kidSentence = coldOrganKidSentence(organ.id);
  const receipt =
    scarLabel && hushActive
      ? `“${scarLabel}” already lives on the Memory Plinth.`
      : scarLabel && kind === "ledger" && !vista
        ? `“${scarLabel}” is written in the marble.`
        : scarLabel && vista && !hushActive
          ? `Look — then leave. The Plinth still keeps this Take.`
          : null;

  const climbMotif =
    kind === "lookout"
      ? "lid-climb"
      : kind === "umbrella"
        ? "loft-climb"
        : kind === "battlement"
          ? "wall-climb"
          : "teller-step";

  const climbHint =
    kind === "lookout"
      ? "Climb the lid — peek from the Coin Jar"
      : kind === "umbrella"
        ? "Climb the loft — peek from the Payroll Tower"
        : kind === "battlement"
          ? "Climb the wall — peek from Interest Keep"
          : "Step to the teller — peek from Ledger Bank";

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[70] flex items-end justify-center bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/35 to-transparent"
      role="dialog"
      aria-label={beat.title}
      data-testid="soft-beat-overlay"
      data-soft-beat={kind}
      data-soft-beat-climb={climbMotif}
      data-soft-beat-layout="lower-third"
      data-organ={organ.id}
      data-nav-escape="window"
      onClick={onDone}
    >
      <div className="mb-[10vh] w-full max-w-xl px-5 text-center text-white">
        <p
          className="text-xs font-bold uppercase tracking-[0.22em]"
          style={{ color: beat.accent }}
        >
          {softBeatEyebrow(organ.id)} · {organVerbChip(organ.id)}
        </p>
        <p className="mt-1 text-[11px] font-semibold tracking-wide text-amber-100/85">
          {climbHint}
        </p>
        <h2 className="mt-2 font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
          {beat.title}
        </h2>
        <p className="mt-3 text-sm text-white/85">{body}</p>
        <p
          className="mt-2 text-sm font-semibold text-amber-100/95"
          data-testid="soft-beat-retell"
        >
          {kidSentence}
        </p>
        {receipt ? <p className="mt-2 text-xs text-white/65">{receipt}</p> : null}
        <GameButton
          variant="primary"
          className="mt-4"
          data-testid="soft-beat-leave"
          {...pointerSafeActivate(onDone)}
        >
          {organ.id === "coin"
            ? "Leave — back into the Jar"
            : organ.id === "clock"
              ? "Leave — back to the Clock loft"
              : organ.id === "spiral"
                ? "Leave — back to the Spiral"
                : "Leave — back to the ledger"}
        </GameButton>
        <p className="mt-2 text-[10px] tracking-wide text-white/45">Esc · Leave</p>
      </div>
    </div>
  );
}
