/**
 * Slow-device Harbor — still a myth composition, never a settings dashboard.
 */

import { GameButton } from "@/game-ui";
import {
  mythFallbackActions,
  type HarborFallbackMode,
} from "../harborFirstMeet";

type Props = {
  mode: HarborFallbackMode;
  killSwitch?: boolean;
  onTalkPiggy: () => void;
  onBoardCarpet: () => void;
  onEnterBank?: () => void;
};

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
      className="relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden px-6 text-center"
      data-testid="harbor-myth-fallback"
      data-fallback-mode={mode}
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 40%, #bae6fd 0%, #7dd3fc 45%, #38bdf8 100%)",
      }}
    >
      {/* Soft island silhouette */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[28%] w-[120%] -translate-x-1/2 rounded-[100%] bg-[#86efac]/55"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[18%] left-[18%] h-16 w-16 rounded-full bg-[#4ade80]/70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[20%] right-[22%] h-20 w-20 rounded-full bg-[#22c55e]/55"
        aria-hidden
      />

      <p className="relative text-xs font-bold uppercase tracking-[0.22em] text-[#0f172a]/70">
        Harbor Haven
      </p>

      {mode === "myth_meet" ? (
        <>
          <div className="relative" aria-hidden>
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-[#86efac]">
              <div className="h-14 w-16 rounded-full bg-[#4ade80]" />
            </div>
            <div className="absolute -right-2 -top-2 h-10 w-10 rounded-full bg-[#fde68a]" />
          </div>
          <h2 className="relative max-w-sm text-2xl font-black text-[#16283b]">
            Piggy Penny is waving
          </h2>
          <p className="relative max-w-md text-sm font-medium text-[#16283b]/85">
            Money is alive here. Walk up and talk — Coin Bag sticks with you.
          </p>
        </>
      ) : mode === "myth_travel" ? (
        <>
          <div
            className="relative flex h-24 w-40 items-center justify-center rounded-2xl bg-[#f4a629]"
            aria-hidden
          >
            <div className="h-3 w-28 rounded-full bg-[#16283b]/25" />
          </div>
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
            onPointerUp={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              onTalkPiggy();
            }}
            onClick={(e) => {
              e.preventDefault();
              onTalkPiggy();
            }}
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
            onClick={(e) => {
              e.preventDefault();
              onBoardCarpet();
            }}
          >
            Board the Money Carpet
          </button>
        ) : null}
        {actions.bank && onEnterBank ? (
          <button
            type="button"
            className="min-h-12 w-full touch-manipulation rounded-2xl border-2 border-[#1c1917]/50 bg-white/90 px-4 py-3 text-base font-bold text-[#16283b]"
            data-testid="fallback-ledger-bank"
            onClick={(e) => {
              e.preventDefault();
              onEnterBank();
            }}
          >
            Enter Ledger Bank
          </button>
        ) : null}
      </div>
    </div>
  );
}
