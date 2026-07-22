import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";
import { InsightCard, useQuizJuice } from "../quiz";
import "../quiz/livingQuiz.css";

/**
 * Set the Price — learn price elasticity by DOING it. Drag the price lever and
 * watch customers walk in or out in real time; the profit meter reacts live.
 * Too cheap = crowds but no margin; too dear = margin but no crowd. Find the
 * sweet spot, then lock it in.
 */

type Config = {
  product: string;
  emoji: string;
  cost: number;
  maxDemand: number;
  /** price at which demand hits ~zero */
  chokePrice: number;
};

const DEFAULTS: Config = {
  product: "Lemonade",
  emoji: "🍋",
  cost: 2,
  maxDemand: 40,
  chokePrice: 12,
};

/** Linear demand: buyers fall from maxDemand at price=cost to ~0 at chokePrice. */
function demandAt(price: number, cfg: Config): number {
  const span = Math.max(1, cfg.chokePrice - cfg.cost);
  const frac = 1 - (price - cfg.cost) / span;
  return Math.max(0, Math.round(cfg.maxDemand * frac));
}
function profitAt(price: number, cfg: Config): number {
  return Math.round((price - cfg.cost) * demandAt(price, cfg));
}

export default function PriceItRightGame({ minigameId, island, onComplete, onClose }: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const cfg = useMemo<Config>(() => {
    const raw = (def?.modules?.[0]?.config ?? {}) as Partial<Config>;
    return { ...DEFAULTS, ...raw };
  }, [def]);

  const sfx = useQuizJuice();
  const [price, setPrice] = useState(() => Math.round((cfg.cost + cfg.chokePrice) / 2));
  const [locked, setLocked] = useState<number | null>(null);
  const [phase, setPhase] = useState<"play" | "insight">("play");

  const buyers = demandAt(price, cfg);
  const profit = profitAt(price, cfg);
  const margin = price - cfg.cost;

  // Optimal price for linear demand ≈ midpoint of cost and choke.
  const optimal = useMemo(() => {
    let best = cfg.cost;
    let bestP = -Infinity;
    for (let p = cfg.cost; p <= cfg.chokePrice; p += 0.5) {
      const pr = profitAt(p, cfg);
      if (pr > bestP) {
        bestP = pr;
        best = p;
      }
    }
    return { price: best, profit: bestP };
  }, [cfg]);

  const lockIn = useCallback(() => {
    setLocked(price);
    sfx.complete();
    window.setTimeout(() => setPhase("insight"), 500);
  }, [price, sfx]);

  const lockedProfit = locked != null ? profitAt(locked, cfg) : 0;
  const score = useMemo(
    () => clampScore((lockedProfit / Math.max(1, optimal.profit)) * 100),
    [lockedProfit, optimal.profit],
  );
  const success = score >= 70;

  // crowd visualization — one face per ~2 buyers, capped
  const faces = Math.min(20, Math.ceil(buyers / Math.max(1, Math.round(cfg.maxDemand / 20))));

  if (phase === "insight") {
    return (
      <GameVisualShell shell="notebook" title="Set the Price" icon={cfg.emoji} onClose={onClose}>
        <div className="mb-3 rounded-xl bg-black/10 p-3 text-center">
          <div className="text-xs uppercase tracking-widest opacity-60">Your price</div>
          <div className="text-3xl font-black">${locked}</div>
          <div className="text-sm">
            made <b className="text-emerald-600">${lockedProfit}</b> · best possible was{" "}
            <b>${optimal.profit}</b> at ${optimal.price}
          </div>
        </div>
        <InsightCard
          insight={{
            headline: "There's a profit peak — not too cheap, not too dear",
            story:
              "Drop the price and crowds show up but each sale barely beats cost. Raise it and margins are fat but the crowd thins. Profit peaks in between.",
            systemLesson:
              "Profit = (price − cost) × quantity, and quantity falls as price rises (elasticity). The maximum sits where a small price change stops adding profit. Businesses hunt this sweet spot constantly.",
            realWorld:
              "Airlines, streaming services, and shops A/B test prices to ride this curve — and raise prices when demand is less elastic.",
          }}
          success={success}
          onContinue={() => onComplete(success, score)}
        />
      </GameVisualShell>
    );
  }

  return (
    <GameVisualShell
      shell="notebook"
      title={def?.name ?? "Set the Price"}
      icon={def?.icon ?? cfg.emoji}
      genre="simulation"
      complexity="easy"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-sm font-medium">
          You sell <b>{cfg.product}</b> {cfg.emoji}. Each one costs you <b>${cfg.cost}</b> to make. Slide the
          price and watch the crowd and your profit react — then lock in your best price.
        </p>

        {/* Stall / crowd */}
        <div className="relative h-28 overflow-hidden rounded-xl border-2 border-amber-600/30 bg-gradient-to-b from-amber-50 to-amber-100 p-2">
          <div className="text-3xl">{cfg.emoji}🧃</div>
          <div className="absolute inset-x-2 bottom-2 flex flex-wrap gap-0.5">
            <AnimatePresence>
              {Array.from({ length: faces }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, y: 8 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="text-lg"
                >
                  🧍
                </motion.span>
              ))}
            </AnimatePresence>
            {faces === 0 ? <span className="text-xs font-bold text-red-600">crickets… too pricey</span> : null}
          </div>
        </div>

        {/* Live meters */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <Meter label="Price" value={`$${price}`} />
          <Meter label="Buyers" value={`${buyers}`} />
          <Meter label="Margin/sale" value={`$${margin}`} accent={margin <= 0 ? "bad" : undefined} />
        </div>

        {/* Profit bar */}
        <div>
          <div className="mb-1 flex justify-between text-xs font-bold">
            <span>Profit this batch</span>
            <span className={profit <= 0 ? "text-red-600" : "text-emerald-600"}>${profit}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full bg-emerald-500"
              animate={{ width: `${clampScore((profit / Math.max(1, optimal.profit)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Price lever */}
        <div>
          <input
            type="range"
            min={cfg.cost}
            max={cfg.chokePrice}
            step={1}
            value={price}
            onChange={(e) => {
              const p = Number(e.target.value);
              setPrice(p);
              if (demandAt(p, cfg) > 0) sfx.correct();
            }}
            className="w-full accent-amber-600"
            aria-label="Price"
          />
          <div className="flex justify-between text-[10px] font-bold opacity-60">
            <span>${cfg.cost} (cost)</span>
            <span>${cfg.chokePrice} (too dear)</span>
          </div>
        </div>

        <GameButton variant="primary" className="w-full" onClick={lockIn}>
          🔒 Lock in ${price}
        </GameButton>
      </div>
    </GameVisualShell>
  );
}

function Meter({ label, value, accent }: { label: string; value: string; accent?: "bad" }) {
  return (
    <div className="rounded-lg bg-black/5 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide opacity-60">{label}</div>
      <div className={`text-sm font-black ${accent === "bad" ? "text-red-600" : ""}`}>{value}</div>
    </div>
  );
}
