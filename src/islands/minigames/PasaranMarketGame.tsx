import { useCallback, useEffect, useMemo, useState } from "react";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";

type Goods = { id: string; name: string; price: number; icon: string };

const GOODS: Goods[] = [
  { id: "rice", name: "Rice scoop", price: 12, icon: "🍚" },
  { id: "cloth", name: "Cloth scrap", price: 18, icon: "🧵" },
  { id: "fruit", name: "Fruit bunch", price: 9, icon: "🥭" },
  { id: "spice", name: "Spice tin", price: 15, icon: "🌶️" },
];

const COINS = [1, 5, 10, 25] as const;

/**
 * Pasaran Market — cultural market role-play remixed as fair trade + exact change.
 * Pedagogy from traditional pasaran / shop games; original Capital presentation.
 */
export default function PasaranMarketGame({
  minigameId,
  island,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [tendered, setTendered] = useState(0);
  const [offered, setOffered] = useState(20);
  const [feedback, setFeedback] = useState<string | null>(null);

  const goods = useMemo(() => GOODS[round % GOODS.length]!, [round]);
  const changeDue = offered - goods.price;
  const done = round >= 5;

  useEffect(() => {
    const over = COINS[Math.floor(Math.random() * COINS.length)]! + goods.price;
    setOffered(over);
    setTendered(0);
  }, [goods.price, round]);

  const addCoin = (v: number) => setTendered((t) => t + v);

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
      setRound((r) => r + 1);
    }, 900);
  }, [changeDue, goods.name, goods.price, role, tendered]);

  if (done) {
    const success = score >= 70;
    return (
      <GameVisualShell
        shell="explore"
        title={def?.name ?? "Pasaran Market"}
        icon="🧺"
        genre="party"
        complexity="easy"
        homage={def?.homage}
      onClose={onClose}
      >
        <div className="space-y-3 p-4 text-center">
          <div className="text-4xl">🧺</div>
          <p className="font-black text-lg">Market closed — score {score}</p>
          <p className="text-sm text-[var(--cap-ink-soft)]">
            Pasaran role-play trains exact change and fair prices — the same skills as a real market stall.
          </p>
          <GameButton variant="primary" className="w-full" onClick={() => onComplete(success, score)}>
            {success ? "Finish strong" : "Finish (retry later)"}
          </GameButton>
        </div>
      </GameVisualShell>
    );
  }

  return (
    <GameVisualShell
      shell="explore"
      title={def?.name ?? "Pasaran Market"}
      icon={def?.icon ?? "🧺"}
      genre="party"
      complexity="easy"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-3 p-4" data-testid="pasaran-market-game">
        <div className="text-center text-xs font-bold uppercase tracking-widest text-[var(--cap-ink-soft)]">
          Round {round + 1}/5 · You are the {role}
        </div>
        <div className="rounded-2xl border-2 border-[var(--cap-ink)]/15 bg-[var(--cap-paper)] p-4 text-center">
          <div className="text-4xl">{goods.icon}</div>
          <div className="font-black text-lg">{goods.name}</div>
          <div className="text-sm">
            Price: <b>{goods.price}</b> coins
          </div>
          {role === "seller" ? (
            <p className="mt-2 text-sm text-[var(--cap-ink-soft)]">
              Buyer tenders <b>{offered}</b>. Make exact change ({changeDue}).
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--cap-ink-soft)]">
              Tender coins to buy — enough, but not wildly over.
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {COINS.map((c) => (
            <GameButton key={c} variant="outline" size="sm" onClick={() => addCoin(c)}>
              +{c}
            </GameButton>
          ))}
          <GameButton variant="ghost" size="sm" onClick={() => setTendered(0)}>
            Clear
          </GameButton>
        </div>
        <div className="text-center font-display text-2xl font-black">Tendered: {tendered}</div>
        {feedback ? <p className="text-center text-sm font-semibold">{feedback}</p> : null}
        <GameButton variant="primary" className="w-full" data-testid="pasaran-submit" onClick={submit}>
          {role === "seller" ? "Give change" : "Pay stall"}
        </GameButton>
      </div>
    </GameVisualShell>
  );
}
