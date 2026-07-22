import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";
import { InsightCard, useQuizJuice } from "../quiz";
import "../quiz/livingQuiz.css";

/**
 * Don't Break the Basket — learn diversification by DOING it. Spread your coins
 * across assets, then weather a random market year. Pile everything into one
 * risky basket and a crash wipes you out; spread it and you ride the storm.
 */

type Asset = {
  id: string;
  name: string;
  emoji: string;
  /** 0 = safe, 1 = wild. Drives swing size. */
  risk: number;
};

type Config = {
  coins: number;
  rounds: number;
  assets: Asset[];
};

const DEFAULT_ASSETS: Asset[] = [
  { id: "cash", name: "Cash", emoji: "💵", risk: 0.05 },
  { id: "bonds", name: "Bonds", emoji: "🏦", risk: 0.2 },
  { id: "index", name: "Index Fund", emoji: "🧺", risk: 0.45 },
  { id: "stock", name: "Hot Stock", emoji: "🚀", risk: 0.8 },
  { id: "crypto", name: "Crypto", emoji: "🪙", risk: 1 },
];

const DEFAULTS: Config = { coins: 12, rounds: 3, assets: DEFAULT_ASSETS };
const COIN_VALUE = 100;

type Phase = "allocate" | "storm" | "insight";

export default function DiversifyBasketsGame({ minigameId, island, onComplete, onClose }: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const cfg = useMemo<Config>(() => {
    const raw = (def?.modules?.[0]?.config ?? {}) as Partial<Config>;
    return {
      coins: raw.coins ?? DEFAULTS.coins,
      rounds: raw.rounds ?? DEFAULTS.rounds,
      assets: raw.assets && raw.assets.length ? raw.assets : DEFAULTS.assets,
    };
  }, [def]);

  const sfx = useQuizJuice();

  const [alloc, setAlloc] = useState<Record<string, number>>(() =>
    Object.fromEntries(cfg.assets.map((a) => [a.id, 0])),
  );
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("allocate");
  const [wallet, setWallet] = useState(cfg.coins * COIN_VALUE);
  const [results, setResults] = useState<{ assetId: string; deltaPct: number }[] | null>(null);
  const [concentrationSum, setConcentrationSum] = useState(0);

  const placed = Object.values(alloc).reduce((s, n) => s + n, 0);
  const remaining = cfg.coins - placed;

  const addCoin = (id: string) => {
    if (remaining <= 0) return;
    setAlloc((a) => ({ ...a, [id]: a[id] + 1 }));
    sfx.correct();
  };
  const removeCoin = (id: string) => {
    if (alloc[id] <= 0) return;
    setAlloc((a) => ({ ...a, [id]: a[id] - 1 }));
  };
  const spreadEvenly = () => {
    const per = Math.floor(cfg.coins / cfg.assets.length);
    const next: Record<string, number> = Object.fromEntries(cfg.assets.map((a) => [a.id, per]));
    let left = cfg.coins - per * cfg.assets.length;
    for (const a of cfg.assets) {
      if (left <= 0) break;
      next[a.id] += 1;
      left -= 1;
    }
    setAlloc(next);
    sfx.correct();
  };

  // Herfindahl-style concentration: 1 = all in one basket, ~1/n = perfectly spread
  const concentration = useMemo(() => {
    if (placed === 0) return 1;
    return Object.values(alloc).reduce((s, n) => s + Math.pow(n / placed, 2), 0);
  }, [alloc, placed]);

  const weatherStorm = useCallback(() => {
    // Each asset gets a random return this year; swing scales with its risk.
    const res = cfg.assets.map((a) => {
      const swing = a.risk; // up to ±(risk)
      // Bias: risky assets have higher expected return but brutal tails.
      const roll = (Math.random() * 2 - 1) * swing; // -risk..+risk
      const drift = a.risk * 0.12; // small positive expected drift for risk
      const deltaPct = Math.round((roll + drift) * 100);
      return { assetId: a.id, deltaPct };
    });
    setResults(res);

    // apply to wallet
    let newValue = 0;
    for (const a of cfg.assets) {
      const coins = alloc[a.id];
      const r = res.find((x) => x.assetId === a.id)!.deltaPct / 100;
      newValue += coins * COIN_VALUE * (1 + r);
    }
    setWallet(Math.round(newValue));
    setConcentrationSum((c) => c + concentration);
    setPhase("storm");
    const worst = Math.min(...res.map((r) => r.deltaPct));
    if (worst < -25 && concentration > 0.5) sfx.wrong();
    else sfx.complete();
  }, [cfg.assets, alloc, concentration, sfx]);

  const nextRound = useCallback(() => {
    if (round >= cfg.rounds) {
      setPhase("insight");
      return;
    }
    // reinvest current wallet as fresh coins for the next year
    const coinsNow = Math.max(1, Math.round(wallet / COIN_VALUE));
    setRound((r) => r + 1);
    setResults(null);
    setPhase("allocate");
    setAlloc(Object.fromEntries(cfg.assets.map((a) => [a.id, 0])));
    // scale coins to current wealth (kept simple: reuse original coin count, track wallet)
    void coinsNow;
  }, [round, cfg.rounds, cfg.assets, wallet]);

  const startWorth = cfg.coins * COIN_VALUE;
  const avgConcentration = concentrationSum / Math.max(1, round);
  const grew = wallet >= startWorth;
  const wellSpread = avgConcentration < 0.4;
  const score = useMemo(() => {
    const growthScore = clampScore(((wallet - startWorth) / startWorth) * 120 + 55);
    const spreadScore = clampScore((1 - avgConcentration) * 100);
    return clampScore(growthScore * 0.5 + spreadScore * 0.5);
  }, [wallet, startWorth, avgConcentration]);
  const success = score >= 55;

  if (phase === "insight") {
    return (
      <GameVisualShell shell="flat" title="Don't Break the Basket" icon="🧺" onClose={onClose}>
        <div className="mb-3 rounded-xl bg-black/10 p-3 text-center">
          <div className="text-xs uppercase tracking-widest opacity-60">After {cfg.rounds} market years</div>
          <div className="text-3xl font-black">${wallet.toLocaleString()}</div>
          <div className="text-xs opacity-70">
            started with ${startWorth.toLocaleString()} · {wellSpread ? "well diversified" : "concentrated"}
          </div>
        </div>
        <InsightCard
          insight={{
            headline: "Diversification trades lottery tickets for staying power",
            story: grew
              ? "You spread your coins, so one bad basket couldn't sink you. Steady beats spectacular."
              : "A crash in a crowded basket hurt. Spreading across assets would have softened the blow.",
            systemLesson:
              "Concentrated bets have the biggest upside AND the biggest wipeout risk. Spreading across assets that don't move together lowers volatility for a similar expected return — the closest thing to a free lunch in finance.",
            realWorld:
              "Index funds bundle thousands of companies for this reason; pros rebalance across stocks, bonds, and cash.",
          }}
          success={success}
          onContinue={() => onComplete(success, score)}
        />
      </GameVisualShell>
    );
  }

  if (phase === "storm" && results) {
    return (
      <GameVisualShell shell="flat" title={`Market Year ${round}`} icon="🌩️" onClose={onClose}>
        <div className="space-y-3">
          <p className="text-sm font-medium">The market rolled the dice. Here&apos;s how each basket did:</p>
          <div className="space-y-2">
            {cfg.assets.map((a) => {
              const r = results.find((x) => x.assetId === a.id)!;
              const coins = alloc[a.id];
              const held = coins > 0;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: held ? 1 : 0.4, x: 0 }}
                  className="flex items-center justify-between rounded-lg border-2 px-3 py-2"
                  style={{ borderColor: r.deltaPct >= 0 ? "#34d399" : "#f87171" }}
                >
                  <span className="font-bold">
                    {a.emoji} {a.name} <span className="opacity-60">· {coins} coins</span>
                  </span>
                  <span className={`font-black ${r.deltaPct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {r.deltaPct >= 0 ? "+" : ""}
                    {r.deltaPct}%
                  </span>
                </motion.div>
              );
            })}
          </div>
          <div className="rounded-xl bg-black/10 p-3 text-center">
            <div className="text-xs uppercase tracking-widest opacity-60">Your wallet</div>
            <motion.div
              key={wallet}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`text-2xl font-black ${wallet >= startWorth ? "text-emerald-600" : "text-red-600"}`}
            >
              ${wallet.toLocaleString()}
            </motion.div>
          </div>
          <GameButton variant="primary" className="w-full" onClick={nextRound}>
            {round >= cfg.rounds ? "Final tally →" : `Reinvest & sail to year ${round + 1} →`}
          </GameButton>
        </div>
      </GameVisualShell>
    );
  }

  // allocate phase
  return (
    <GameVisualShell
      shell="flat"
      title={def?.name ?? "Don't Break the Basket"}
      icon={def?.icon ?? "🧺"}
      genre="strategy"
      complexity="easy"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Year {round} of {cfg.rounds}. Tap baskets to drop in your coins.
          </p>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-900">
            🪙 {remaining} left
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {cfg.assets.map((a) => {
            const coins = alloc[a.id];
            const riskLabel = a.risk < 0.25 ? "Safe" : a.risk < 0.6 ? "Balanced" : "Risky";
            const riskColor = a.risk < 0.25 ? "text-emerald-600" : a.risk < 0.6 ? "text-amber-600" : "text-red-600";
            return (
              <motion.button
                key={a.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => addCoin(a.id)}
                className="flex items-center justify-between rounded-xl border-2 border-black/15 bg-white p-3 text-left hover:border-black/40"
              >
                <div className="min-w-0">
                  <div className="font-black">
                    {a.emoji} {a.name}
                  </div>
                  <div className={`text-xs font-bold ${riskColor}`}>
                    {riskLabel} · swing ±{Math.round(a.risk * 100)}%
                  </div>
                  <AnimatePresence>
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {Array.from({ length: coins }).map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-sm"
                        >
                          🪙
                        </motion.span>
                      ))}
                    </div>
                  </AnimatePresence>
                </div>
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCoin(a.id);
                  }}
                  className="ml-2 shrink-0 rounded-lg bg-black/10 px-2 py-1 text-xs font-black hover:bg-black/20"
                >
                  −
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <GameButton variant="outline" size="sm" onClick={spreadEvenly}>
            Spread evenly
          </GameButton>
          <div className="ml-auto text-xs font-bold">
            {concentration > 0.6 ? "⚠️ concentrated" : concentration < 0.35 ? "🛡️ diversified" : "◐ mixed"}
          </div>
        </div>

        <GameButton
          variant="primary"
          className="w-full"
          disabled={remaining !== 0}
          onClick={weatherStorm}
        >
          {remaining === 0 ? "🌊 Weather the market year" : `Place ${remaining} more coin${remaining === 1 ? "" : "s"}`}
        </GameButton>
      </div>
    </GameVisualShell>
  );
}
