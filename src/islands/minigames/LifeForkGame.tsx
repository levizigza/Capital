import { useMemo, useState } from "react";
import { GameButton, GamePanel } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";

type Fork = {
  id: string;
  prompt: string;
  a: { label: string; cashflow: number; tip: string };
  b: { label: string; cashflow: number; tip: string };
  better: "a" | "b";
};

const FORKS: Fork[] = [
  {
    id: "school",
    prompt: "School vs job — what builds longer cashflow?",
    a: {
      label: "Take a skills course (−20 now, +12/mo later)",
      cashflow: 12,
      tip: "Human capital is an asset — income rises after the cost.",
    },
    b: {
      label: "Buy a gadget loan for fun (−12/mo forever)",
      cashflow: -12,
      tip: "Fun now, liability forever — classic paycheck trap.",
    },
    better: "a",
  },
  {
    id: "insurance",
    prompt: "A storm is forecast. What protects the ledger?",
    a: {
      label: "Skip insurance and hope (−0/mo, big risk)",
      cashflow: 0,
      tip: "Hope isn’t a plan — one bill can wipe the pouch.",
    },
    b: {
      label: "Pay a small premium (−4/mo, shield ready)",
      cashflow: -4,
      tip: "Insurance is a planned expense that prevents ruin.",
    },
    better: "b",
  },
  {
    id: "side",
    prompt: "Weekend free time — invest it how?",
    a: {
      label: "Open a craft booth (+10/mo income)",
      cashflow: 10,
      tip: "A small asset beats idle hours for cashflow.",
    },
    b: {
      label: "Snack tab crawl (−8/mo)",
      cashflow: -8,
      tip: "Lifestyle creep is a quiet liability.",
    },
    better: "a",
  },
  {
    id: "emergency",
    prompt: "You got a windfall of 40 coins.",
    a: {
      label: "Spend it all on wants today",
      cashflow: 0,
      tip: "Windfalls vanish without a plan.",
    },
    b: {
      label: "Split: half emergency fund, half joyful want",
      cashflow: 5,
      tip: "Pay yourself first — then enjoy without guilt.",
    },
    better: "b",
  },
];

/**
 * Life Fork — Game-of-Life pedagogy remix: career/debt/protection choices.
 * Original Capital scenarios; no franchise cloning.
 */
export default function LifeForkGame({
  minigameId,
  island,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const [idx, setIdx] = useState(0);
  const [cf, setCf] = useState(15);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const fork = FORKS[idx];
  const done = idx >= FORKS.length;

  const pick = (side: "a" | "b") => {
    if (!fork) return;
    const choice = side === "a" ? fork.a : fork.b;
    const good = side === fork.better;
    setCf((c) => c + choice.cashflow);
    setScore((s) => s + (good ? 25 : 8));
    setLog((l) => [`${choice.label} → ${choice.tip}`, ...l].slice(0, 6));
    setIdx((i) => i + 1);
  };

  const success = useMemo(() => score >= 70 && cf >= 20, [cf, score]);

  if (done) {
    const cfLabel = `${cf >= 0 ? "+" : ""}${cf}/mo`;
    return (
      <GameVisualShell
        shell="notebook"
        title={def?.name ?? "Life Fork"}
        icon="🔀"
        genre="quiz"
        complexity="medium"
        homage={def?.homage}
        onClose={onClose}
      >
        <div className="space-y-3 p-4 text-center">
          <div className="text-4xl">🧭</div>
          <p className="font-black text-lg">Path complete</p>
          <p>
            Cashflow now{" "}
            <b className={cf >= 20 ? "text-emerald-700" : "text-rose-700"}>{cfLabel}</b>
            {" · "}Score {score}
          </p>
          <ul className="text-left text-xs space-y-1 max-h-32 overflow-y-auto">
            {log.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <GameButton variant="primary" className="w-full" onClick={() => onComplete(success, score)}>
            Continue
          </GameButton>
        </div>
      </GameVisualShell>
    );
  }

  return (
    <GameVisualShell
      shell="notebook"
      title={def?.name ?? "Life Fork"}
      icon={def?.icon ?? "🔀"}
      genre="quiz"
      complexity="medium"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-3 p-4" data-testid="life-fork-game">
        <div className="text-center text-xs font-bold uppercase tracking-widest text-[var(--cap-ink-soft)]">
          Fork {idx + 1}/{FORKS.length} · Cashflow {cf >= 0 ? "+" : ""}
          {cf}/mo
        </div>
        <GamePanel padding="default">
          <p className="font-black text-[var(--cap-ink)]">{fork!.prompt}</p>
        </GamePanel>
        <div className="grid gap-2">
          <GameButton variant="primary" className="h-auto whitespace-normal py-3" onClick={() => pick("a")}>
            {fork!.a.label}
          </GameButton>
          <GameButton variant="outline" className="h-auto whitespace-normal py-3" onClick={() => pick("b")}>
            {fork!.b.label}
          </GameButton>
        </div>
        {log[0] ? <p className="text-xs text-center text-[var(--cap-ink-soft)]">{log[0]}</p> : null}
      </div>
    </GameVisualShell>
  );
}
