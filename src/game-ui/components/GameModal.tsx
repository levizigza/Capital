import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useGameMotion } from "../useGameMotion";
import { GamePanel } from "./GamePanel";

export type GameModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  /** bottom sheet on compact viewports */
  placement?: "center" | "sheet";
  maxWidth?: "sm" | "md" | "lg";
  zIndex?: number;
  /** When false, children render without an extra GamePanel wrapper */
  usePanel?: boolean;
};

const maxW = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function GameModal({
  open,
  onClose,
  children,
  title,
  placement = "center",
  maxWidth = "md",
  zIndex = 50,
  usePanel = true,
}: GameModalProps) {
  const { fade, modal, reduced } = useGameMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="game-modal"
          className="fixed inset-0 flex items-center justify-center p-4 game-ui-animate"
          style={{ zIndex }}
          initial={fade.initial}
          animate={fade.animate}
          exit={fade.exit}
          transition={reduced ? { duration: 0.12 } : undefined}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close dialog"
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "relative w-full",
              maxW[maxWidth],
              placement === "sheet" && "self-end sm:self-center"
            )}
            initial={modal.initial}
            animate={modal.animate}
            exit={modal.exit}
            transition={reduced ? { duration: 0.12 } : undefined}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {usePanel ? (
              <GamePanel title={title} padding="default">
                {children}
              </GamePanel>
            ) : (
              <div className="game-panel rounded-xl p-[var(--game-panel-pad)]">{children}</div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
