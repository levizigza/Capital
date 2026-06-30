import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

import { useGameUi } from "../GameUiContext";
import type { GameToastVariant } from "../types";
import { useGameMotion } from "../useGameMotion";

const variantClass: Record<GameToastVariant, string> = {
  info: "bg-blue-100 text-blue-900 border-blue-200",
  success: "bg-green-100 text-green-900 border-green-200",
  warning: "bg-amber-100 text-amber-900 border-amber-200",
  error: "bg-red-100 text-red-900 border-red-200",
};

export function GameToastStack() {
  const { toasts } = useGameUi();
  const { fade, reduced } = useGameMotion();

  return (
    <div className="game-toast-stack" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            className={cn(
              "pointer-events-auto max-w-sm w-full sm:w-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg game-ui-animate",
              variantClass[t.variant ?? "info"]
            )}
            initial={fade.initial}
            animate={fade.animate}
            exit={fade.exit}
            transition={reduced ? { duration: 0.1 } : undefined}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
