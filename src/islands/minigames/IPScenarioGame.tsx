import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameButton } from "@/game-ui";
import type { MinigameProps } from "../types";
import { GameVisualShell } from "./GameVisualShell";
import { clampScore } from "./minigameUtils";
import { InsightCard, ConsequenceTheater, useQuizJuice, type InsightPayload } from "../quiz";
import "../quiz/livingQuiz.css";

type Choice = {
  label: string;
  next: string;
  points: number;
  emoji: string;
  consequence: { label: string; amount: number; emoji: string }[];
};

type ScenarioNode = {
  id: string;
  title: string;
  text: string;
  choices: Choice[];
  insight?: InsightPayload;
};

const SCENARIO: Record<string, ScenarioNode> = {
  start: {
    id: "start",
    title: "The Spark",
    text: "Your app lights up classrooms. A rival could copy it tomorrow. How do you protect your creation?",
    choices: [
      {
        label: "Patent the core invention",
        next: "patent",
        points: 20,
        emoji: "📜",
        consequence: [
          { label: "Legal shield", amount: 25, emoji: "🛡️" },
          { label: "Filing fees", amount: -12, emoji: "💸" },
        ],
      },
      {
        label: "Open-source & build community",
        next: "open",
        points: 10,
        emoji: "🌍",
        consequence: [
          { label: "Fast contributors", amount: 18, emoji: "🤝" },
          { label: "Fork risk", amount: -8, emoji: "🔀" },
        ],
      },
      {
        label: "Trademark the brand only",
        next: "tm",
        points: 15,
        emoji: "™️",
        consequence: [
          { label: "Name protected", amount: 15, emoji: "✅" },
          { label: "Idea exposed", amount: -10, emoji: "👀" },
        ],
      },
    ],
  },
  patent: {
    id: "patent",
    title: "The Giant Knocks",
    text: "MegaCorp ships your feature. Your patent is real — but lawsuits cost fortunes.",
    choices: [
      {
        label: "License to them (royalties)",
        next: "end",
        points: 25,
        emoji: "🤝",
        consequence: [
          { label: "Royalty stream", amount: 30, emoji: "💰" },
          { label: "Peace", amount: 10, emoji: "☮️" },
        ],
      },
      {
        label: "Sue immediately",
        next: "end",
        points: 5,
        emoji: "⚖️",
        consequence: [
          { label: "Legal bills", amount: -40, emoji: "📉" },
          { label: "Stress years", amount: -15, emoji: "😰" },
        ],
      },
    ],
    insight: {
      headline: "Patents are swords and shields",
      story: "Patents don't stop copying — they give you leverage to negotiate.",
      systemLesson:
        "Intellectual property law creates temporary monopolies in exchange for public disclosure. The system trades secrecy for innovation incentives.",
    },
  },
  open: {
    id: "open",
    title: "The Fork",
    text: "Developers love you! A competitor forks your code and undercuts your price.",
    choices: [
      {
        label: "Win on brand, support & speed",
        next: "end",
        points: 20,
        emoji: "🚀",
        consequence: [
          { label: "Community loyalty", amount: 22, emoji: "❤️" },
          { label: "Market share", amount: 12, emoji: "📈" },
        ],
      },
      {
        label: "Close-source future updates",
        next: "end",
        points: 5,
        emoji: "🔒",
        consequence: [
          { label: "Contributor exodus", amount: -25, emoji: "🏃" },
          { label: "Trust lost", amount: -15, emoji: "💔" },
        ],
      },
    ],
    insight: {
      headline: "Open source trades control for velocity",
      story: "When code is free, your moat is trust, service, and taste.",
      systemLesson:
        "IP isn't one thing — copyright, patent, trademark, trade secret each protect different layers. Open source uses copyright licenses to define sharing rules.",
    },
  },
  tm: {
    id: "tm",
    title: "The Clone",
    text: "Your name is protected, but the idea isn't. A clone appears overnight.",
    choices: [
      {
        label: "Out-innovate & out-care",
        next: "end",
        points: 18,
        emoji: "💡",
        consequence: [
          { label: "User love", amount: 20, emoji: "⭐" },
          { label: "Feature lead", amount: 10, emoji: "🏁" },
        ],
      },
      {
        label: "Give up",
        next: "end",
        points: 0,
        emoji: "🏳️",
        consequence: [{ label: "Dream paused", amount: -30, emoji: "🌧️" }],
      },
    ],
    insight: {
      headline: "Trademarks guard identity, not ideas",
      story: "Customers follow names they trust — but only if the product keeps delivering.",
      systemLesson:
        "Trademark law prevents confusion in the marketplace. It doesn't stop similar products with different names.",
    },
  },
  end: {
    id: "end",
    title: "Case closed",
    text: "Every path through IP law teaches the same truth: protection has a price, and strategy beats panic.",
    choices: [],
    insight: {
      headline: "You are a builder in a rules-based world",
      story: "Creators who understand IP choose tools on purpose — not by accident.",
      systemLesson:
        "The financial value of ideas often lives in combinations: patents + brand + execution + community. Law is one layer; business model is another.",
    },
  },
};

type Phase = "choose" | "consequence" | "insight" | "finale";

export default function IPScenarioGame({
  minigameId,
  island,
  onComplete,
  onClose,
}: MinigameProps) {
  const def = island.minigames?.find((m) => m.id === minigameId);
  const sfx = useQuizJuice();
  const [nodeId, setNodeId] = useState("start");
  const [phase, setPhase] = useState<Phase>("choose");
  const [score, setScore] = useState(0);
  const [lastChoice, setLastChoice] = useState<Choice | null>(null);

  const node = SCENARIO[nodeId];

  const choose = useCallback(
    (c: Choice) => {
      setScore((s) => s + c.points);
      setLastChoice(c);
      if (c.points >= 15) sfx.correct();
      else if (c.points <= 5) sfx.wrong();
      else sfx.correct();
      setPhase("consequence");
    },
    [sfx],
  );

  const afterConsequence = () => {
    if (lastChoice?.next === "end") {
      setNodeId("end");
      setPhase("finale");
      onComplete(clampScore(score) >= 50, clampScore(score));
    } else if (lastChoice) {
      setNodeId(lastChoice.next);
      setPhase("insight");
    }
  };

  const afterInsight = () => {
    setPhase("choose");
    setLastChoice(null);
  };

  return (
    <GameVisualShell
      shell="notebook"
      title={def?.name ?? "IP Courtroom"}
      icon={def?.icon ?? "⚖️"}
      genre="puzzle"
      complexity="medium"
      homage={def?.homage}
      onClose={onClose}
    >
      <div className="space-y-4 min-h-[320px]">
        <div className="flex justify-between text-xs font-bold text-amber-900/70">
          <span>⚖️ Case file</span>
          <span>Merit {score}</span>
        </div>

        <AnimatePresence mode="wait">
          {phase === "choose" ? (
            <motion.div key={nodeId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div>
                <div className="text-lg font-black">{node.title}</div>
                <p className="mt-2 text-sm leading-relaxed">{node.text}</p>
              </div>
              <div className="flex flex-col gap-2">
                {node.choices.map((c) => (
                  <GameButton key={c.label} variant="choice" onClick={() => choose(c)}>
                    {c.emoji} {c.label}
                  </GameButton>
                ))}
              </div>
            </motion.div>
          ) : null}

          {phase === "consequence" && lastChoice ? (
            <motion.div key="cons" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ConsequenceTheater
                title="What unfolded..."
                beats={lastChoice.consequence}
                success={lastChoice.points >= 15}
              />
              <GameButton variant="primary" className="w-full mt-3" onClick={afterConsequence}>
                Continue case →
              </GameButton>
            </motion.div>
          ) : null}

          {phase === "insight" && node.insight ? (
            <InsightCard insight={node.insight} success={(lastChoice?.points ?? 0) >= 15} onContinue={afterInsight} />
          ) : null}

          {phase === "finale" && node.insight ? (
            <div className="space-y-3">
              <InsightCard insight={node.insight} success={score >= 50} onContinue={onClose} />
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </GameVisualShell>
  );
}
