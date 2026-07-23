import { useCallback, useEffect, useMemo, useState } from "react";
import { GameButton, GamePanel } from "@/game-ui";

type Goods = { id: string; name: string; price: number; icon: string };

const GOODS: Goods[] = [
  { id: "rice", name: "Rice scoop", price: 12, icon: "🍚" },
  { id: "cloth", name: "Cloth scrap", price: 18, icon: "🧵" },
  { id: "fruit", name: "Fruit bunch", price: 9, icon: "🥭" },
  { id: "spice", name: "Spice tin", price: 15, icon: "🌶️" },
];

const COINS = [1, 5, 10, 25] as const;

type Props = {
  onLeave: () => void;
};

/**
 * Pasaran Lane — Harbor plaza market wing.
 * Exact-change practice with a clear leave path (no soft-lock).
 */
export function HarborMarketOverlay({ onLeave }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [tendered, setTendered] = useState(0);
  const [offered, setOffered] = useState(20);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const goods = useMemo(() => GOODS[round % GOODS.length]!, [round]);
  const changeDue = offered - goods.price;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onLeave();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onLeave]);

  useEffect(() => {
    if (done) return;
    const over = COINS[Math.floor(Math.random() * COINS.length)]! + goods.price;
    setOffered(over);
    setTendered(0);
  }, [goods.price, round, done]);

  const submit = useCallback(() => {
    if (role === "seller") {
      const ok = tendered === changeDue;
      setFeedback(
        ok
          ? `Fair change! You returned ${changeDue} coins.`
          : `Not exact — change due was ${changeDue}, you gave ${tendered}.`,
      );
      setScore((s) => s + (ok ? 20 : 4));
    } else {
      const ok = tendered >= goods.price && tendered <= goods.price + 10;
      setFeedback(
        ok
          ? `Bought ${goods.name} fairly for ${tendered}.`
          : tendered < goods.price
            ? `Not enough — ${goods.name} costs ${goods.price}.`
            : `Overpaid wildly — practice mindful spending.`,
      );
      setScore((s) => s + (ok ? 18 : 5));
    }
    window.setTimeout(() => {
      setTendered(0);
      setFeedback(null);
      setRole((r) => (r === "buyer" ? "seller" : "buyer"));
      setRound((r) => {
        const next = r + 1;
        if (next >= 5) setDone(true);
        return next;
      });
    }, 800);
  }, [changeDue, goods.name, goods.price, role, tendered]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-gradient-to-b from-amber-100 via-orange-50 to-sky-100"
      data-testid="harbor-market-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Pasaran Lane market"
    >
      <header className="flex items-start justify-between gap-3 p-3 sm:p-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-amber-800/80">
            Harbor Haven · Pasaran Lane
          </div>
          <h2 className="text-xl font-black text-stone-900 sm:text-2xl">Fair trade practice</h2>
          <p className="max-w-md text-xs text-stone-700 sm:text-sm">
            Pay exact prices as a buyer, or return exact change as a seller. Esc always leaves.
          </p>
        </div>
        <button
          type="button"
          onClick={onLeave}
          className="rounded-full border-2 border-stone-400/50 bg-white/80 px-3 py-1.5 text-sm font-bold text-stone-800 hover:bg-white"
          data-testid="market-leave"
        >
          ✕ Leave
        </button>
      </header>

      <div className="relative z-[2] mx-auto mt-auto w-full max-w-lg px-3 pb-4 sm:px-4">
        <GamePanel padding="default" className="space-y-3 border-amber-200/80 bg-white/95 text-left shadow-xl">
          {done ? (
            <div className="space-y-3 text-center">
              <div className="text-4xl">🧺</div>
              <h3 className="text-lg font-black">Stall closed for now</h3>
              <p className="text-sm text-muted-foreground">
                Score {score}. Fair prices and exact change are lifelong money skills — come back anytime.
              </p>
              <GameButton variant="primary" className="w-full" onClick={onLeave}>
                Back to plaza
              </GameButton>
              <GameButton
                variant="outline"
                className="w-full"
                onClick={() => {
                  setDone(false);
                  setRound(0);
                  setScore(0);
                  setRole("buyer");
                  setFeedback(null);
                }}
              >
                Practice again
              </GameButton>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <span>
                  Round {Math.min(round + 1, 5)} / 5 · {role === "buyer" ? "You buy" : "You sell"}
                </span>
                <span>Score {score}</span>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-center">
                <div className="text-3xl">{goods.icon}</div>
                <div className="text-base font-black">
                  {goods.name} · 🪙 {goods.price}
                </div>
                <p className="mt-1 text-sm text-stone-600">
                  {role === "buyer"
                    ? `Customer offers 🪙 ${offered}. Pay a fair amount (price to price+10).`
                    : `Customer paid 🪙 ${offered}. Give exact change: 🪙 ${changeDue}.`}
                </p>
              </div>
              <div className="text-center text-2xl font-black tabular-nums">Tendered: 🪙 {tendered}</div>
              <div className="flex flex-wrap justify-center gap-2">
                {COINS.map((c) => (
                  <GameButton key={c} size="sm" variant="outline" onClick={() => setTendered((t) => t + c)}>
                    +{c}
                  </GameButton>
                ))}
                <GameButton size="sm" variant="ghost" onClick={() => setTendered(0)}>
                  Clear
                </GameButton>
              </div>
              {feedback ? (
                <p className="text-center text-sm font-semibold text-emerald-800" role="status">
                  {feedback}
                </p>
              ) : null}
              <GameButton variant="primary" className="w-full" onClick={submit} disabled={!!feedback}>
                {role === "buyer" ? "Pay" : "Give change"}
              </GameButton>
              <GameButton variant="outline" className="w-full" onClick={onLeave}>
                Back to plaza
              </GameButton>
            </>
          )}
        </GamePanel>
      </div>
    </div>
  );
}
