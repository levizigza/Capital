/**
 * Soft Beat lookouts — quiet “see the world you changed” toys inside Money Structures.
 * Not a minigame dump — a hush moment before the storm / after a Take.
 * Organ-true: Coin Lid · Memory Teller · Clock Loft · Spiral Battlement.
 */

import { useEffect } from "react";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { moneyOrganForSoftBeat } from "../moneyOrgans";
import { cinemaTimeScale, systemPrefersReducedMotion } from "../a11yMotion";
import { GameButton } from "@/game-ui";

export type SoftBeatKind = "lookout" | "umbrella" | "battlement" | "ledger";

const BEATS: Record<
  SoftBeatKind,
  { title: string; line: string; hushLine: string; accent: string }
> = {
  lookout: {
    title: "Lid Lookout",
    line: "Cove looks tiny from up here — save a little, the jar still holds.",
    hushLine: "After the Coin Take, even the lid is quiet. Harbor is already listening.",
    accent: "#fbbf24",
  },
  umbrella: {
    title: "Umbrella Loft",
    line: "Rainy-day loft — Main Street looks small. Keep a little dry for later.",
    hushLine: "The Clock loft remembers your Take. Fly home — Harbor felt the Clock.",
    accent: "#38bdf8",
  },
  battlement: {
    title: "Score Battlement",
    line: "On-time history beats haste — interest feeds on rushing.",
    hushLine: "The Spiral slowed after your choice. Interest leaves footprints on the Plinth.",
    accent: "#a78bfa",
  },
  ledger: {
    title: "Teller Window",
    line: "Marble cool under your hands — the ledger remembers every jar and stamp.",
    hushLine: "Memory already carries your latest plaque. Money is alive here.",
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

  useEffect(() => {
    playOrganSfx(organ.id);
    if (!systemPrefersReducedMotion() || hushActive) {
      playCapitalSfx(hushActive ? "scar_chime" : "soft_beat");
    }
    const scale = cinemaTimeScale();
    const t = window.setTimeout(onDone, Math.round((hushActive ? 5200 : 4200) * scale));
    return () => window.clearTimeout(t);
  }, [hushActive, onDone, organ.id]);

  const body = hushActive ? beat.hushLine : beat.line;
  const receipt =
    scarLabel && hushActive
      ? `“${scarLabel}” already lives on the Memory Plinth.`
      : scarLabel && kind === "ledger"
        ? `“${scarLabel}” is written in the marble.`
        : null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[70] flex items-center justify-center bg-[#0f172a]/75 backdrop-blur-[2px]"
      role="dialog"
      aria-label={beat.title}
      data-testid="soft-beat-overlay"
      data-soft-beat={kind}
      data-organ={organ.id}
      onClick={onDone}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape" || e.key === " ") onDone();
      }}
    >
      <div
        className="relative mx-4 max-w-md rounded-2xl border px-6 py-5 text-center text-white shadow-2xl"
        style={{ borderColor: `${beat.accent}99`, background: "rgba(15,23,42,0.92)" }}
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: beat.accent }}
        >
          Soft Beat · {organ.name}
        </p>
        <h2 className="mt-2 text-xl font-black sm:text-2xl">{beat.title}</h2>
        <p className="mt-3 text-sm text-white/85">{body}</p>
        {receipt ? <p className="mt-2 text-xs text-white/65">{receipt}</p> : null}
        <p className="mt-2 text-[10px] uppercase tracking-wider text-white/45">
          {organ.suit} · {organ.metaphor}
        </p>
        <GameButton variant="primary" className="mt-4" onClick={onDone}>
          Keep walking
        </GameButton>
      </div>
    </div>
  );
}
