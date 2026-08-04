/**
 * Soft Beat lookouts — quiet “see the world you changed” toys inside Money Structures.
 * Not a minigame dump — a hush moment before the storm / after a Take.
 * Organ-true: Coin Lid · Memory Teller · Clock Loft · Spiral Battlement.
 */

import { useEffect } from "react";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { moneyOrganForSoftBeat } from "../moneyOrgans";
import { cinemaTimeScale, prefersReducedMotion } from "../a11yMotion";
import { GameButton } from "@/game-ui";
import { softBeatEyebrow } from "../titleVoice";
import { coldOrganKidSentence, organVerbChip } from "../worldMemory";
import { useOverlayEscape } from "./useOverlayEscape";

export type SoftBeatKind = "lookout" | "umbrella" | "battlement" | "ledger";

const BEATS: Record<
  SoftBeatKind,
  { title: string; line: string; hushLine: string; accent: string }
> = {
  lookout: {
    title: "Lid Lookout",
    line: "Cove looks tiny — the Coin holds. Save a little; the jar still waits.",
    hushLine: "Quiet — Coin holds. Even the lid listens. Harbor felt that.",
    accent: "#fbbf24",
  },
  umbrella: {
    title: "Umbrella Loft",
    line: "Rainy-day loft — the Clock shelters. Keep a little dry for later.",
    hushLine: "Quiet — Clock shelters. Fly home — Harbor felt that.",
    accent: "#38bdf8",
  },
  battlement: {
    title: "Score Battlement",
    line: "The Spiral withstands — on-time history beats haste.",
    hushLine: "Quiet — Spiral withstands. Interest leaves footprints on the Plinth.",
    accent: "#a78bfa",
  },
  ledger: {
    title: "Teller Window",
    line: "Memory keeps — the ledger remembers every jar and stamp.",
    hushLine: "Quiet — Memory keeps your plaque. Money is alive here.",
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
    playOrganSfx(organ.id);
    if (!prefersReducedMotion() || hushActive) {
      playCapitalSfx(hushActive ? "scar_chime" : "soft_beat");
    }
    const scale = cinemaTimeScale();
    const t = window.setTimeout(onDone, Math.round((hushActive ? 5200 : 4200) * scale));
    return () => window.clearTimeout(t);
  }, [hushActive, onDone, organ.id]);

  const body = hushActive ? beat.hushLine : beat.line;
  const kidSentence = coldOrganKidSentence(organ.id);
  const receipt =
    scarLabel && hushActive
      ? `“${scarLabel}” already lives on the Memory Plinth.`
      : scarLabel && kind === "ledger"
        ? `“${scarLabel}” is written in the marble.`
        : null;

  const climbMotif =
    kind === "lookout"
      ? "lid-climb"
      : kind === "umbrella"
        ? "loft-climb"
        : kind === "battlement"
          ? "wall-climb"
          : "teller-step";

  // Lid Lookout — lower-third cinema over the jar room (not a centered card).
  if (kind === "lookout") {
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
            Climb the lid — peek from the Coin Jar
          </p>
          <h2 className="mt-2 font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
            {beat.title}
          </h2>
          <p className="mt-2 text-sm text-white/88">{body}</p>
          <p
            className="mt-2 text-sm font-semibold text-amber-100"
            data-testid="soft-beat-retell"
          >
            {kidSentence}
          </p>
          {receipt ? <p className="mt-2 text-xs text-white/65">{receipt}</p> : null}
          <GameButton
            variant="primary"
            className="mt-4"
            onClick={onDone}
            data-testid="soft-beat-leave"
          >
            Leave — back into the Jar
          </GameButton>
          <p className="mt-2 text-[10px] tracking-wide text-white/45">Esc · Leave</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[70] flex items-center justify-center bg-[#0f172a]/75 backdrop-blur-[2px]"
      role="dialog"
      aria-label={beat.title}
      data-testid="soft-beat-overlay"
      data-soft-beat={kind}
      data-soft-beat-climb={climbMotif}
      data-organ={organ.id}
      data-nav-escape="window"
      onClick={onDone}
    >
      <div
        className="relative mx-4 max-w-md rounded-2xl border px-6 py-5 text-center text-white shadow-2xl"
        style={{ borderColor: `${beat.accent}99`, background: "rgba(15,23,42,0.92)" }}
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: beat.accent }}
        >
          {softBeatEyebrow(organ.id)} · {organVerbChip(organ.id)}
        </p>
        {kind === "umbrella" ? (
          <p className="mt-1 text-[11px] font-semibold tracking-wide text-sky-100/80">
            Climb the loft — peek from the Payroll Tower
          </p>
        ) : null}
        {kind === "battlement" ? (
          <p className="mt-1 text-[11px] font-semibold tracking-wide text-violet-100/80">
            Climb the wall — peek from Interest Keep
          </p>
        ) : null}
        {kind === "ledger" ? (
          <p className="mt-1 text-[11px] font-semibold tracking-wide text-amber-100/80">
            Step to the teller — peek from Ledger Bank
          </p>
        ) : null}
        <h2 className="mt-2 text-xl font-black sm:text-2xl">{beat.title}</h2>
        <p className="mt-3 text-sm text-white/85">{body}</p>
        <p
          className="mt-2 text-sm font-semibold text-amber-100/95"
          data-testid="soft-beat-retell"
        >
          {kidSentence}
        </p>
        {receipt ? <p className="mt-2 text-xs text-white/65">{receipt}</p> : null}
        <p className="mt-2 text-[10px] uppercase tracking-wider text-white/45">
          {organ.suit} · {organ.metaphor}
        </p>
        <GameButton variant="primary" className="mt-4" onClick={onDone} data-testid="soft-beat-leave">
          {organ.id === "clock"
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
