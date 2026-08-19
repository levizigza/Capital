/**
 * Piggy's Harbor chart — interactive island briefing after first Talk.
 * Tap paintings to hear place + games. Required: Harbor (you're here) + Cove (first painting).
 */

import { useCallback, useMemo, useState } from "react";
import { useInputAction } from "@/input";
import { pointerSafeActivate } from "../pointerSafeClick";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { SpinePaintingPortal } from "./AshoreTeachShowcases";
import {
  briefingReady,
  HARBOR_BRIEFING_CARDS,
  HARBOR_BRIEFING_GOAL,
  type HarborBriefingCard,
  type HarborBriefingCardId,
} from "../harborWorldBriefing";
import type { MoneyOrganId } from "../moneyOrgans";

type Props = {
  onContinue: () => void;
  onSkip: () => void;
};

function organForCard(card: HarborBriefingCard): MoneyOrganId {
  return card.organ;
}

export function HarborWorldBriefing({ onContinue, onSkip }: Props) {
  const [inspected, setInspected] = useState<HarborBriefingCardId[]>([]);
  const [active, setActive] = useState<HarborBriefingCardId | null>(null);
  const ready = briefingReady(inspected);
  const card = active ? HARBOR_BRIEFING_CARDS.find((c) => c.id === active) : null;

  const inspect = useCallback((id: HarborBriefingCardId) => {
    const next = HARBOR_BRIEFING_CARDS.find((c) => c.id === id);
    if (!next) return;
    playOrganSfx(next.organ);
    playCapitalSfx("talk_confirm");
    setActive(id);
    setInspected((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  useInputAction("cancel", onSkip);

  const hint = useMemo(() => {
    if (ready) return "Chart ready — Coin Bag will point the Money Carpet.";
    if (!inspected.includes("harbor_haven")) return "Tap Harbor Haven — you're standing on it.";
    if (!inspected.includes("coincraft_cove")) return "Tap Coincraft Cove — your first painting.";
    return "Peek at later shores if you like — then continue.";
  }, [inspected, ready]);

  return (
    <div
      className="fixed inset-0 z-[82] flex flex-col text-white"
      data-testid="harbor-world-briefing"
      role="dialog"
      aria-label="Piggy Penny island chart"
      style={{
        background:
          "radial-gradient(ellipse 85% 65% at 50% 28%, #1e3a5f 0%, #0f172a 55%, #020617 100%)",
      }}
    >
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/90">
            Piggy Penny · Harbor chart
          </p>
          <p className="mt-0.5 max-w-xl text-sm text-white/80">{HARBOR_BRIEFING_GOAL}</p>
        </div>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/25 hover:bg-white/10"
          data-testid="harbor-world-briefing-skip"
          {...pointerSafeActivate(onSkip)}
        >
          Leave · Esc
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-4">
        <div
          className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-5"
          data-testid="harbor-world-briefing-grid"
        >
          {HARBOR_BRIEFING_CARDS.map((c) => {
            const lit = inspected.includes(c.id) || active === c.id;
            const here = c.id === "harbor_haven";
            return (
              <button
                key={c.id}
                type="button"
                data-testid={`harbor-brief-card-${c.id}`}
                data-inspected={inspected.includes(c.id) ? "1" : "0"}
                className={`flex flex-col items-center rounded-2xl px-2 py-3 ring-1 transition ${
                  lit
                    ? "bg-white/15 ring-amber-200/70"
                    : "bg-white/5 ring-white/20 hover:bg-white/10"
                }`}
                {...pointerSafeActivate(() => inspect(c.id))}
              >
                <SpinePaintingPortal organ={organForCard(c)} lit={lit} size="sm" />
                <span className="mt-2 text-center text-[11px] font-black leading-tight text-amber-50">
                  {c.name}
                </span>
                <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-white/55">
                  {here ? "You are here" : c.lane === "side" ? "Side quests" : c.era}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="mt-5 w-full max-w-xl rounded-2xl bg-[#0f172a]/80 px-5 py-4 text-left ring-1 ring-white/20"
          data-testid="harbor-world-briefing-piggy"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
            Piggy Penny
          </p>
          {card ? (
            <>
              <p className="mt-2 text-base font-bold text-amber-50">{card.objective}</p>
              <p className="mt-2 text-sm text-white/80">{card.piggyLine}</p>
              <p className="mt-2 text-xs font-semibold text-amber-100/90">
                Games · {card.games}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-white/80">
              Tap a painting. Harbor is home. Cove is first. Later shores and the outer ring
              are extra — never homework.
            </p>
          )}
        </div>

        <button
          type="button"
          className="mt-5 min-h-12 rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-8 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917] disabled:opacity-40"
          data-testid="harbor-world-briefing-continue"
          disabled={!ready}
          {...pointerSafeActivate(() => {
            if (!ready) return;
            playCapitalSfx("talk_confirm");
            onContinue();
          })}
        >
          {ready ? "Got it — Coin Bag, let's go" : hint}
        </button>
        <p className="mt-2 text-center text-[11px] text-white/50">{hint}</p>
      </main>
    </div>
  );
}
