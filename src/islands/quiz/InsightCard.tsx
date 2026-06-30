import { motion } from "framer-motion";
import { GameButton } from "@/game-ui";

export type InsightPayload = {
  headline: string;
  story: string;
  systemLesson: string;
  realWorld?: string;
};

export function InsightCard({
  insight,
  success,
  onContinue,
}: {
  insight: InsightPayload;
  success: boolean;
  onContinue: () => void;
}) {
  return (
    <motion.div
      className="lq-insight-card p-5 space-y-4 text-slate-100"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{success ? "💡" : "🔍"}</span>
        <div>
          <div className="text-xs uppercase tracking-widest text-violet-300 font-bold">
            {success ? "Signal decoded" : "Learning moment"}
          </div>
          <div className="text-lg font-black">{insight.headline}</div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-300 italic border-l-2 border-violet-500 pl-3">
        {insight.story}
      </p>

      <div className="rounded-xl bg-violet-950/60 border border-violet-500/30 p-4">
        <div className="text-xs font-bold text-amber-300 mb-1">How the system works</div>
        <p className="text-sm text-slate-200 leading-relaxed">{insight.systemLesson}</p>
      </div>

      {insight.realWorld ? (
        <div className="text-xs text-cyan-300/90">
          <span className="font-bold">In the real world: </span>
          {insight.realWorld}
        </div>
      ) : null}

      <GameButton variant="primary" className="w-full" onClick={onContinue}>
        Continue →
      </GameButton>
    </motion.div>
  );
}
