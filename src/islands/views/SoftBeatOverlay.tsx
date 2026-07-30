/**
 * Soft Beat lookouts — quiet “see the world you changed” toys inside Money Structures.
 * Not a minigame dump — a hush moment before the storm / after a Take.
 */

import { useEffect } from "react";
import { playCapitalSfx } from "../audio/capitalSfx";
import { GameButton } from "@/game-ui";

export type SoftBeatKind = "lookout" | "umbrella" | "battlement" | "ledger";

const BEATS: Record<
  SoftBeatKind,
  { title: string; line: string; hushLine: string; accent: string }
> = {
  lookout: {
    title: "Lid Lookout",
    line: "Cove looks tiny from up here — save a little, the jar still holds.",
    hushLine: "After the Take, even the lid is quiet. Harbor is already listening.",
    accent: "#fbbf24",
  },
  umbrella: {
    title: "Umbrella Loft",
    line: "Rainy-day loft — Main Street looks small. Keep a little dry for later.",
    hushLine: "The loft remembers your Take. Fly home when you’re ready — Harbor felt it.",
    accent: "#38bdf8",
  },
  battlement: {
    title: "Score Battlement",
    line: "On-time history beats haste — interest feeds on rushing.",
    hushLine: "The spiral slowed after your choice. Interest leaves footprints on the Plinth.",
    accent: "#a78bfa",
  },
  ledger: {
    title: "Teller Window",
    line: "Marble cool under your hands — the ledger remembers every jar and stamp.",
    hushLine: "The ledger already carries your latest plaque. Money is alive here.",
    accent: "#f59e0b",
  },
};

type Props = {
  kind: SoftBeatKind;
  hushActive?: boolean;
  onDone: () => void;
};

export function SoftBeatOverlay({ kind, hushActive = false, onDone }: Props) {
  const beat = BEATS[kind];

  useEffect(() => {
    playCapitalSfx(hushActive ? "scar_chime" : "harbor_cheer");
    const t = window.setTimeout(onDone, hushActive ? 5200 : 4200);
    return () => window.clearTimeout(t);
  }, [hushActive, onDone]);

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[70] flex items-center justify-center bg-[#0f172a]/75 backdrop-blur-[2px]"
      role="dialog"
      aria-label={beat.title}
      data-testid="soft-beat-overlay"
      data-soft-beat={kind}
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
          Soft Beat
        </p>
        <h2 className="mt-2 text-xl font-black sm:text-2xl">{beat.title}</h2>
        <p className="mt-3 text-sm text-white/85">
          {hushActive ? beat.hushLine : beat.line}
        </p>
        <GameButton variant="primary" className="mt-4" onClick={onDone}>
          Keep walking
        </GameButton>
      </div>
    </div>
  );
}
