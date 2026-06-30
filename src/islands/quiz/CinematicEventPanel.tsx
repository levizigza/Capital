import { motion } from "framer-motion";
import { GameButton } from "@/game-ui";

export type CinematicEventPanelProps = {
  icon: string;
  title: string;
  prompt: string;
  explanation?: string;
  choices: { label: string; index: number }[];
  disabled?: boolean;
  onChoose: (index: number, label: string) => void;
};

export function CinematicEventPanel({
  icon,
  title,
  prompt,
  explanation,
  choices,
  disabled,
  onChoose,
}: CinematicEventPanelProps) {
  return (
    <motion.div
      className="lq-event-cinematic p-5 space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-3">
        <motion.span
          className="text-4xl"
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.6 }}
        >
          {icon}
        </motion.span>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-amber-400/90">
            Scenario incoming
          </div>
          <div className="text-xl font-black text-amber-50">{title}</div>
        </div>
      </div>

      <p className="text-base leading-relaxed text-amber-50/90">{prompt}</p>

      {explanation ? (
        <p className="text-xs italic text-amber-200/70 border-l-2 border-amber-500/50 pl-3">
          Hint: {explanation}
        </p>
      ) : null}

      <div className="grid gap-2">
        {choices.map((c, i) => (
          <motion.div
            key={c.index}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <GameButton
              variant="choice"
              className="w-full text-left !justify-start border-amber-500/30 bg-black/20 hover:bg-amber-500/10"
              disabled={disabled}
              onClick={() => onChoose(c.index, c.label)}
            >
              <span className="font-mono text-amber-400 mr-2">{String.fromCharCode(65 + i)}.</span>
              {c.label}
            </GameButton>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
