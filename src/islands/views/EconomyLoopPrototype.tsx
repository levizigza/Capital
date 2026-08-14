/**
 * Economy loop prototype — decision → direct → market → actor → next risk/opp.
 * Isolated: no XP, no Freedom grind chrome, no map.
 * Open with ?economy=1
 *
 * Canon: GAME_DESIGN_ECONOMY.md
 */

import { useCallback, useEffect, useState } from "react";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { capitalMusic } from "../audio/capitalMusic";
import { MONEY_ORGANS } from "../moneyOrgans";
import { organVerbChip } from "../worldMemory";
import { triggerJuice } from "@/juice";
import { pointerSafeActivate } from "../pointerSafeClick";
import { GameButton } from "@/game-ui";
import {
  createEconomyStocks,
  ECONOMY_DECISION_PAIRS,
  isEscapeReady,
  resolveEconomyDecision,
  type EconomyConsequence,
  type EconomyStock,
} from "../economyDynamics";

type Phase = "choose" | "chain" | "between";

type Props = {
  onExit: () => void;
};

export function EconomyLoopPrototype({ onExit }: Props) {
  const [pairIndex, setPairIndex] = useState(0);
  const [stocks, setStocks] = useState<EconomyStock>(() => createEconomyStocks());
  const [phase, setPhase] = useState<Phase>("choose");
  const [chain, setChain] = useState<EconomyConsequence | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [cycles, setCycles] = useState(0);

  const pair = ECONOMY_DECISION_PAIRS[pairIndex % ECONOMY_DECISION_PAIRS.length]!;
  const organ = pair[0].organ;
  const accent = MONEY_ORGANS[organ].accentHint;

  useEffect(() => {
    capitalMusic.unlock();
    capitalMusic.playPlace({ kind: "harbor" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  const commit = useCallback(
    (decisionId: (typeof pair)[number]["id"]) => {
      if (phase !== "choose") return;
      const result = resolveEconomyDecision(decisionId, stocks);
      setChain(result);
      setStocks(result.stocks);
      setPhase("chain");
      playOrganSfx(organ);
      playCapitalSfx("take_mark");
      triggerJuice("accept");
      window.setTimeout(() => {
        playCapitalSfx("harbor_felt");
        triggerJuice("complete", { burst: true });
      }, 500);
    },
    [organ, pair, phase, stocks],
  );

  const nextPair = () => {
    if (chain) {
      setHistory((h) => [...h, `${chain.decisionId} · ${chain.market.mood}`]);
    }
    setChain(null);
    setPairIndex((i) => i + 1);
    setCycles((c) => c + 1);
    setPhase("choose");
    playOrganSfx(ECONOMY_DECISION_PAIRS[(pairIndex + 1) % ECONOMY_DECISION_PAIRS.length]![0].organ);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col text-white"
      data-testid="economy-loop-prototype"
      data-economy-phase={phase}
      data-economy-mood={chain?.market.mood ?? "fair"}
      style={{
        background:
          "radial-gradient(ellipse 80% 55% at 50% 28%, #134e4a 0%, #0f172a 52%, #020617 100%)",
      }}
    >
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200/90">
            Capital · Living economy
          </p>
          <p className="text-[10px] text-white/50">
            Decision → market → actors · opportunity cost · no XP
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/25 hover:bg-white/10"
          data-testid="economy-exit"
          {...pointerSafeActivate(onExit)}
        >
          Leave · Esc
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-6 pt-2">
        <ul
          className="mb-4 grid w-full max-w-lg grid-cols-2 gap-2 sm:grid-cols-4"
          data-testid="economy-stocks"
        >
          {(
            [
              ["Pouch", stocks.pouch],
              ["Cashflow", stocks.cashflow],
              ["Memory", stocks.memory],
              ["Escape", `${stocks.escapeStreak}/3`],
            ] as const
          ).map(([k, v]) => (
            <li
              key={k}
              className="rounded-xl bg-black/35 px-3 py-2 text-center ring-1 ring-white/15"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{k}</p>
              <p className="text-lg font-black text-emerald-100">{v}</p>
            </li>
          ))}
        </ul>

        {isEscapeReady(stocks) ? (
          <p
            className="mb-3 rounded-lg bg-amber-400/20 px-3 py-1.5 text-xs font-bold text-amber-100 ring-1 ring-amber-200/40"
            data-testid="economy-escape-ready"
          >
            Escape ready — Freedom path open (still no XP)
          </p>
        ) : null}

        {phase === "choose" ? (
          <div className="w-full max-w-lg text-center">
            <p
              className="text-[11px] font-black uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              {organVerbChip(organ)} · opportunity cost
            </p>
            <h1 className="mt-2 font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
              {pair[0].prompt}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Both paths are valid. Futures differ — pick what you forgo.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {pair.map((d, i) => (
                <GameButton
                  key={d.id}
                  variant={i === 0 ? "primary" : "secondary"}
                  className="min-h-14 text-base font-black"
                  data-testid={`economy-choice-${d.id}`}
                  {...pointerSafeActivate(() => commit(d.id))}
                >
                  {d.label}
                </GameButton>
              ))}
            </div>
          </div>
        ) : null}

        {phase === "chain" && chain ? (
          <div className="w-full max-w-lg" data-testid="economy-consequence-chain">
            <h1 className="text-center font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black">
              Second-order chain
            </h1>
            <ol className="mt-4 space-y-3 text-left text-sm">
              <li className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/15">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                  Direct effect
                </p>
                <p className="mt-1 font-semibold text-white" data-testid="economy-direct">
                  {chain.direct.label}
                </p>
                <p className="mt-1 text-amber-100/90" data-testid="economy-opportunity-cost">
                  {chain.opportunityCost}
                </p>
              </li>
              <li className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/15">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                  Market response
                </p>
                <p className="mt-1 font-semibold" data-testid="economy-market">
                  {chain.market.line}{" "}
                  <span className="text-white/60">(×{chain.market.priceMult})</span>
                </p>
              </li>
              <li className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/15">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                  Actor response
                </p>
                <p className="mt-1 font-semibold" data-testid="economy-actor">
                  {chain.actor.line}
                </p>
              </li>
              <li
                className={`rounded-xl px-4 py-3 ring-1 ${
                  chain.next.kind === "risk"
                    ? "bg-rose-500/10 ring-rose-300/30"
                    : "bg-emerald-500/10 ring-emerald-300/30"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                  New {chain.next.kind}
                </p>
                <p className="mt-1 font-semibold" data-testid="economy-next">
                  {chain.next.line}
                </p>
              </li>
            </ol>
            <GameButton
              variant="primary"
              className="mt-5 min-h-12 w-full"
              data-testid="economy-next-cycle"
              {...pointerSafeActivate(nextPair)}
            >
              Next living decision
            </GameButton>
          </div>
        ) : null}

        {history.length > 0 ? (
          <p className="mt-6 max-w-lg text-center text-[11px] text-white/40" data-testid="economy-history">
            Path: {history.join(" → ")}
          </p>
        ) : null}

        <p className="mt-4 text-center text-[11px] text-white/40">
          Cycles {cycles} · Pass bar: each choice changes the next market
        </p>
      </main>
    </div>
  );
}

export function shouldOpenEconomyLoopPrototype(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("economy") === "1";
  } catch {
    return false;
  }
}
