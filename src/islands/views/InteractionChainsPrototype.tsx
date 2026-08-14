/**
 * Three strongest multiplicative interaction chains — no new islands/features.
 * Open with ?interact=1
 * Canon: SYSTEM_INTERACTION_MATRIX.md
 */

import { useEffect, useState } from "react";
import { playCapitalSfx, playOrganSfx } from "../audio/capitalSfx";
import { capitalMusic } from "../audio/capitalMusic";
import { pointerSafeActivate } from "../pointerSafeClick";
import { GameButton } from "@/game-ui";
import { triggerJuice } from "@/juice";
import {
  resolveDay2WeatherChain,
  resolveOrganPaydayChain,
  resolveStanceDealChain,
  type InteractionChainResult,
} from "../systemInteractions";
import type { MoneyOrganId } from "../moneyOrgans";
import type { VoyagerStance } from "../worldMemory";

type Props = { onExit: () => void };

type Screen = "pick" | "result";

export function InteractionChainsPrototype({ onExit }: Props) {
  const [screen, setScreen] = useState<Screen>("pick");
  const [result, setResult] = useState<InteractionChainResult | null>(null);
  const [cf, setCf] = useState(18);

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

  const run = (chain: InteractionChainResult, organ: MoneyOrganId = "coin") => {
    setResult(chain);
    setCf((c) => c + chain.cashflowDelta);
    setScreen("result");
    playOrganSfx(organ);
    playCapitalSfx("harbor_felt");
    triggerJuice("complete", { burst: true });
  };

  const stance: VoyagerStance = { saver: 2, spender: 0, risk: 0 };

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col text-white"
      data-testid="interaction-chains-prototype"
      data-interact-screen={screen}
      style={{
        background:
          "radial-gradient(ellipse 80% 55% at 50% 25%, #1e3a5f 0%, #0f172a 55%, #020617 100%)",
      }}
    >
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-200/90">
            Capital · System interactions
          </p>
          <p className="text-[10px] text-white/50">
            A→B→C→A · no new islands · CF {cf}
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/25 hover:bg-white/10"
          data-testid="interact-exit"
          {...pointerSafeActivate(onExit)}
        >
          Leave · Esc
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-6">
        {screen === "pick" ? (
          <div className="w-full max-w-lg text-center">
            <h1 className="font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black sm:text-3xl">
              Three multiplicative chains
            </h1>
            <p className="mt-2 text-sm text-white/75">
              Existing systems only — pick a chain to feel the feedback loop.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <GameButton
                variant="primary"
                className="min-h-14 text-left text-sm font-bold"
                data-testid="interact-chain-organ"
                {...pointerSafeActivate(() =>
                  run(
                    resolveOrganPaydayChain({ organ: "coin", cashflow: cf }),
                    "coin",
                  ),
                )}
              >
                1 · Organ → Pay Day → Weather → Soft Beat
              </GameButton>
              <GameButton
                variant="secondary"
                className="min-h-14 text-left text-sm font-bold"
                data-testid="interact-chain-stance"
                {...pointerSafeActivate(() =>
                  run(
                    resolveStanceDealChain({
                      stance,
                      cashflow: cf,
                      dealPicked: "asset_first",
                    }),
                    "clock",
                  ),
                )}
              >
                2 · Stance → Deals → CF → Weather → Talk
              </GameButton>
              <GameButton
                variant="outline"
                className="min-h-14 text-left text-sm font-bold"
                data-testid="interact-chain-day2"
                {...pointerSafeActivate(() =>
                  run(
                    resolveDay2WeatherChain({ organ: "spiral", cashflow: cf }),
                    "spiral",
                  ),
                )}
              >
                3 · Day-2 → Weather law → Soft Beat → Next Take
              </GameButton>
            </div>
          </div>
        ) : null}

        {screen === "result" && result ? (
          <div className="w-full max-w-lg" data-testid="interact-chain-result" data-chain-id={result.id}>
            <h1 className="text-center font-[family-name:var(--cap-display,Georgia,serif)] text-2xl font-black">
              {result.title}
            </h1>
            <ol className="mt-4 space-y-2 text-left text-sm">
              {result.steps.map((s) => (
                <li
                  key={s.system}
                  className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/15"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200/80">
                    {s.system}
                  </p>
                  <p className="mt-1 font-semibold text-white/95">{s.effect}</p>
                </li>
              ))}
              <li className="rounded-xl bg-emerald-500/10 px-4 py-3 ring-1 ring-emerald-300/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">
                  Feedback → A
                </p>
                <p className="mt-1 font-semibold" data-testid="interact-feedback">
                  {result.feedback}
                </p>
              </li>
              <li className="rounded-xl bg-amber-500/10 px-4 py-3 ring-1 ring-amber-300/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200/80">
                  New strategy
                </p>
                <p className="mt-1 font-semibold" data-testid="interact-strategy">
                  {result.strategy}
                </p>
              </li>
            </ol>
            <p className="mt-3 text-center text-xs text-white/50" data-testid="interact-pouch-hint">
              {result.pouchHint} · weather {result.weather} · Pay Day ×{result.paydayMult}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <GameButton
                variant="primary"
                className="min-h-12 flex-1"
                data-testid="interact-again"
                {...pointerSafeActivate(() => setScreen("pick"))}
              >
                Try another chain
              </GameButton>
              <GameButton
                variant="outline"
                className="min-h-12 flex-1"
                {...pointerSafeActivate(onExit)}
              >
                Leave
              </GameButton>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export function shouldOpenInteractionChainsPrototype(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("interact") === "1";
  } catch {
    return false;
  }
}
