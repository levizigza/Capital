import { motion } from "framer-motion";

export function StreakMeter({ streak, max = 5 }: { streak: number; max?: number }) {
  if (streak < 2) return null;
  return (
    <motion.div
      className="text-center text-sm font-black lq-streak-fire"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      key={streak}
    >
      🔥 {streak} streak! {streak >= max ? "MAX COMBO" : ""}
    </motion.div>
  );
}
