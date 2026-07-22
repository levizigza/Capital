import { useCallback, useMemo, useState } from "react";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";

/**
 * Cash Flow Sim — run a neighborhood store for 12 months. Each month you choose
 * how to spend (restock, promo, cut costs, or hold cash). Fixed costs hit every
 * month; random demand and risk events teach that cash timing beats revenue.
 */

const MONTHS = 12;
const START_CASH = 5000;
const RENT = 900;
const UTILITIES = 200;

type ChoiceId = "restock" | "promo" | "cut" | "hold";

type Choice = {
  id: ChoiceId;
  label: string;
  spend: number;
  /** Base sales multiplier vs a quiet month */
  demandMult: number;
  tip: string;
};

const CHOICES: Choice[] = [
  {
    id: "restock",
    label: "Restock inventory",
    spend: 800,
    demandMult: 1.35,
    tip: "More stock → more sales, but cash leaves first.",
  },
  {
    id: "promo",
    label: "Run a weekend promo",
    spend: 450,
    demandMult: 1.55,
    tip: "Boosts traffic now; thin margins if you overdo it.",
  },
  {
    id: "cut",
    label: "Cut hours / trim stock",
    spend: 0,
    demandMult: 0.7,
    tip: "Saves cash this month; customers notice.",
  },
  {
    id: "hold",
    label: "Hold cash — no extra spend",
    spend: 0,
    demandMult: 0.95,
    tip: "Safe buffer. Growth stalls if you only hold.",
  },
];

type RiskEvent = {
  month: number;
  title: string;
  delta: number;
  note: string;
};

const RISK_POOL: Omit<RiskEvent, "month">[] = [
  { title: "Fridge repair", delta: -650, note: "Unexpected equipment bill." },
  { title: "Slow foot traffic", delta: -400, note: "Rainy stretch cut walk-ins." },
  { title: "Supplier discount", delta: 300, note: "Bulk deal landed." },
  { title: "Local festival boom", delta: 700, note: "Street fair flooded the aisle." },
  { title: "Shoplifting spike", delta: -250, note: "Shrink hit inventory." },
  { title: "Loyal-customer tip jar", delta: 180, note: "Community goodwill." },
];

type MonthRow = {
  month: number;
  choice: string;
  sales: number;
  costs: number;
  event?: string;
  cash: number;
};

function seededPick(seed: number, len: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return Math.floor((x - Math.floor(x)) * len);
}

export default function CashFlowSimGame({
  minigameId,
  island,
  difficulty,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const baseDemand = difficulty === "easy" ? 1600 : difficulty === "hard" ? 1200 : 1400;
  const eventChance = difficulty === "easy" ? 0.35 : difficulty === "hard" ? 0.65 : 0.5;

  const [month, setMonth] = useState(1);
  const [cash, setCash] = useState(START_CASH);
  const [history, setHistory] = useState<MonthRow[]>([]);
  const [feedback, setFeedback] = useState(
    "Cash in ≠ profit. Pay rent and restock before sales land.",
  );
  const [done, setDone] = useState(false);
  const [wentBroke, setWentBroke] = useState(false);
  const [lowestCash, setLowestCash] = useState(START_CASH);

  const peakCash = useMemo(
    () => Math.max(START_CASH, ...history.map((h) => h.cash), cash),
    [history, cash],
  );

  const finish = useCallback(
    (finalCash: number, broke: boolean, hist: MonthRow[]) => {
      setDone(true);
      const neverNegative = hist.every((h) => h.cash >= 0) && finalCash >= 0;
      const growth = ((finalCash - START_CASH) / START_CASH) * 100;
      let pts = 40;
      if (neverNegative) pts += 25;
      if (finalCash >= 7000) pts += 25;
      else if (finalCash >= 5500) pts += 15;
      else if (finalCash >= 4000) pts += 8;
      if (growth > 40) pts += 10;
      if (broke) pts = Math.min(pts, 35);
      const score = clampScore(pts);
      onComplete(score >= 60 && !broke, score);
    },
    [onComplete],
  );

  const pick = useCallback(
    (choice: Choice) => {
      if (done || month > MONTHS) return;
      if (cash < choice.spend) {
        setFeedback(`Not enough cash for "${choice.label}". Hold or cut instead.`);
        return;
      }

      const noise = 0.85 + (seededPick(month * 97 + cash, 30) / 100);
      const sales = Math.round(baseDemand * choice.demandMult * noise);
      const fixed = RENT + UTILITIES;
      let eventCost = 0;
      let eventTitle: string | undefined;

      if (seededPick(month * 31 + choice.spend, 100) / 100 < eventChance) {
        const ev = RISK_POOL[seededPick(month * 17 + sales, RISK_POOL.length)];
        eventCost = ev.delta;
        eventTitle = ev.title;
      }

      const nextCash = cash - choice.spend - fixed + sales + eventCost;

      const row: MonthRow = {
        month,
        choice: choice.label,
        sales,
        costs: choice.spend + fixed + Math.abs(Math.min(0, eventCost)),
        event: eventTitle,
        cash: nextCash,
      };
      const nextHist = [...history, row];
      setHistory(nextHist);
      setCash(nextCash);
      setLowestCash((l) => Math.min(l, nextCash));

      let note = `Sales $${sales.toLocaleString()} − rent/utils $${fixed}`;
      if (choice.spend) note += ` − spend $${choice.spend}`;
      if (eventTitle) {
        note += ` · ${eventTitle} (${eventCost >= 0 ? "+" : ""}$${eventCost})`;
      }
      note += `. ${choice.tip}`;
      setFeedback(note);

      if (nextCash < 0) {
        setWentBroke(true);
        finish(nextCash, true, nextHist);
        return;
      }

      if (month >= MONTHS) {
        finish(nextCash, false, nextHist);
      } else {
        setMonth((m) => m + 1);
      }
    },
    [baseDemand, cash, done, eventChance, finish, history, month],
  );

  return (
    <GameVisualShell
      shell="retro"
      title={def?.name ?? "Cash Flow Sim"}
      icon={def?.icon ?? "💵"}
      genre="simulation"
      complexity="medium"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-3 font-mono text-yellow-100">
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <span>MONTH {Math.min(month, MONTHS)}/{MONTHS}</span>
          <span className={cash < 1500 ? "text-red-300 font-bold" : ""}>
            CASH ${cash.toLocaleString()}
          </span>
        </div>

        <p className="text-xs opacity-80">
          Fixed burn: rent ${RENT} + utilities ${UTILITIES}/mo. Stay solvent while growing the till.
        </p>

        {/* Simple cash sparkline */}
        <div className="flex h-14 items-end gap-0.5 rounded border border-yellow-700/50 bg-black/30 p-1">
          {[START_CASH, ...history.map((h) => h.cash)].map((v, i) => {
            const h = Math.max(8, Math.round((v / Math.max(peakCash, 1)) * 100));
            return (
              <div
                key={i}
                title={`$${v}`}
                className={`flex-1 rounded-t ${v < 0 ? "bg-red-500" : v < START_CASH ? "bg-amber-500" : "bg-emerald-400"}`}
                style={{ height: `${Math.min(100, h)}%` }}
              />
            );
          })}
        </div>

        <div className="rounded border border-yellow-700/40 bg-black/20 px-2 py-1.5 text-xs leading-snug">
          {feedback}
        </div>

        {!done ? (
          <div className="flex flex-col gap-2">
            {CHOICES.map((c) => (
              <GameButton
                key={c.id}
                variant="outline"
                className="justify-between text-left text-yellow-100 border-yellow-600"
                disabled={cash < c.spend}
                onClick={() => pick(c)}
              >
                <span>{c.label}</span>
                <span className="text-xs opacity-70">
                  {c.spend ? `−$${c.spend}` : "free"} · ×{c.demandMult.toFixed(2)} sales
                </span>
              </GameButton>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="font-bold">
              {wentBroke
                ? `Out of cash in month ${history.length}. Cash timing killed the store.`
                : `Year done. Final cash $${cash.toLocaleString()} · low watermark $${lowestCash.toLocaleString()}`}
            </div>
            <p className="text-xs opacity-80">
              Lesson: revenue looks good on paper; payroll and rent hit first. Buffer + timing keep you open.
            </p>
            <GameButton variant="primary" className="w-full" onClick={onClose}>
              Close
            </GameButton>
          </div>
        )}

        {history.length > 0 ? (
          <div className="max-h-28 overflow-y-auto text-[11px] opacity-70 space-y-0.5">
            {[...history].reverse().map((h) => (
              <div key={h.month}>
                M{h.month}: ${h.cash.toLocaleString()} · {h.choice}
                {h.event ? ` · ${h.event}` : ""}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </GameVisualShell>
  );
}
