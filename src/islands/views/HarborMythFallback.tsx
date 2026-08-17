/**
 * Slow-device Harbor — still a myth composition, never a settings dashboard.
 * Civic mini-plan keeps fountain as court center (doors off the pier axis).
 */

import {
  mythFallbackActions,
  type HarborFallbackMode,
} from "../harborFirstMeet";
import { pointerSafeActivate } from "../pointerSafeClick";

type Props = {
  mode: HarborFallbackMode;
  killSwitch?: boolean;
  onTalkPiggy: () => void;
  onBoardCarpet: () => void;
  onEnterBank?: () => void;
};

/** Flat civic sketch — same planner law as 3D Harbor plaza. */
function CivicPlazaSketch() {
  return (
    <div
      className="relative mx-auto h-36 w-56 overflow-hidden rounded-2xl border-2 border-[#16283b]/25 bg-[#e7e5e4]/90 shadow-[3px_3px_0_rgba(22,40,59,0.2)]"
      data-testid="harbor-civic-sketch"
      aria-hidden
    >
      {/* Court stone */}
      <div className="absolute inset-[12%] rounded-full bg-[#f5f5f4]" />
      {/* Fountain center */}
      <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#38bdf8] ring-4 ring-[#7dd3fc]/80" />
      {/* Outfitter NNW — off pier axis */}
      <div className="absolute left-[28%] top-[8%] h-6 w-9 rounded-md bg-[#f9a8d4]" title="Outfitter" />
      {/* Arcade west */}
      <div className="absolute left-[6%] top-[38%] h-8 w-6 rounded-md bg-[#a78bfa]" title="Arcade" />
      {/* Ledger Bank east */}
      <div className="absolute right-[6%] top-[42%] h-9 w-7 rounded-md bg-[#94a3b8]" title="Ledger Bank" />
      {/* Plinth SE */}
      <div className="absolute bottom-[18%] right-[22%] h-5 w-5 rounded-sm bg-[#fde68a]" title="Memory Plinth" />
      {/* Piggy SW */}
      <div className="absolute bottom-[22%] left-[28%] h-4 w-4 rounded-full bg-[#86efac]" title="Piggy" />
      {/* Carpet south */}
      <div className="absolute bottom-[4%] left-1/2 h-3 w-14 -translate-x-1/2 rounded-full bg-[#f4a629]" title="Money Carpet" />
      <p className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wide text-[#16283b]/55">
        Court · doors on the rim
      </p>
    </div>
  );
}

export function HarborMythFallback({
  mode,
  killSwitch,
  onTalkPiggy,
  onBoardCarpet,
  onEnterBank,
}: Props) {
  const actions = mythFallbackActions(mode);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden px-6 text-center"
      data-testid="harbor-myth-fallback"
      data-fallback-mode={mode}
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 40%, #bae6fd 0%, #7dd3fc 45%, #38bdf8 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[28%] w-[120%] -translate-x-1/2 rounded-[100%] bg-[#86efac]/55"
        aria-hidden
      />

      <p className="relative text-xs font-bold uppercase tracking-[0.22em] text-[#0f172a]/70">
        Harbor Haven
      </p>

      <CivicPlazaSketch />

      {mode === "myth_meet" ? (
        <>
          <h2 className="relative max-w-sm text-2xl font-black text-[#16283b]">
            Piggy Penny is waving
          </h2>
          <p
            className="relative max-w-md text-sm font-medium text-[#16283b]/85"
            data-testid="harbor-piggy-presence"
          >
            Fountain court — walk to Piggy when you’re ready. Talk is yours to start.
          </p>
        </>
      ) : mode === "myth_travel" ? (
        <>
          <h2 className="relative max-w-sm text-2xl font-black text-[#16283b]">
            Board the Money Carpet
          </h2>
          <p className="relative max-w-md text-sm font-medium text-[#16283b]/85">
            Coincraft Cove is your first painting — a short carpet rail away.
          </p>
        </>
      ) : (
        <>
          <h2 className="relative text-2xl font-black text-[#16283b]">
            {killSwitch ? "Harbor Haven (safe mode)" : "Harbor Haven"}
          </h2>
          <p className="relative max-w-md text-sm font-medium text-[#16283b]/85">
            {killSwitch
              ? "3D is resting — the Harbor myth still works from here."
              : "3D is slow on this device — keep the myth going with one clear next step."}
          </p>
        </>
      )}

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-2">
        {actions.talkPiggy ? (
          <button
            type="button"
            className="min-h-12 w-full touch-manipulation rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-4 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917]"
            data-testid="fallback-talk-piggy"
            {...pointerSafeActivate(onTalkPiggy)}
          >
            Talk to Piggy Penny
          </button>
        ) : null}
        {actions.carpet ? (
          <button
            type="button"
            className={`min-h-12 w-full touch-manipulation rounded-2xl border-2 border-[#1c1917] px-4 py-3 text-base font-black shadow-[3px_3px_0_#1c1917] ${
              mode === "myth_travel"
                ? "bg-[#f4b942] text-[#1c1917]"
                : "bg-white/95 text-[#16283b]"
            }`}
            data-testid="fallback-board-carpet"
            {...pointerSafeActivate(onBoardCarpet)}
          >
            Board the Money Carpet
          </button>
        ) : null}
        {actions.bank && onEnterBank ? (
          <button
            type="button"
            className="min-h-12 w-full touch-manipulation rounded-2xl border-2 border-[#1c1917]/50 bg-white/90 px-4 py-3 text-base font-bold text-[#16283b]"
            data-testid="fallback-ledger-bank"
            {...pointerSafeActivate(onEnterBank)}
          >
            Enter Ledger Bank
          </button>
        ) : null}
      </div>
    </div>
  );
}
