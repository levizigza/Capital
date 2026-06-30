import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ConsequenceBeat = {
  label: string;
  amount: number;
  emoji: string;
};

export function ConsequenceTheater({
  title,
  beats,
  success,
}: {
  title: string;
  beats: ConsequenceBeat[];
  success: boolean;
}) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    const timers = beats.map((_, i) =>
      window.setTimeout(() => setVisible(i + 1), 400 + i * 600),
    );
    return () => timers.forEach(clearTimeout);
  }, [beats, title]);

  return (
    <div className={`rounded-xl p-4 ${success ? "lq-consequence-good bg-emerald-950/40 border border-emerald-500/40" : "lq-consequence-bad bg-red-950/30 border border-red-500/40"}`}>
      <div className="text-sm font-black mb-3">{title}</div>
      <div className="space-y-2">
        <AnimatePresence>
          {beats.slice(0, visible).map((b, i) => (
            <motion.div
              key={`${b.label}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {b.emoji} {b.label}
              </span>
              <span className={`font-mono font-bold ${b.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {b.amount >= 0 ? "+" : ""}
                {b.amount}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
