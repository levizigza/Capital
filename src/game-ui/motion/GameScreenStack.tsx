import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

import { useGameMotion } from "../useGameMotion";

export type GameScreenStackProps = {
  screenKey: string;
  children: ReactNode;
  mode?: "fade" | "slide";
  className?: string;
};

export function GameScreenStack({
  screenKey,
  children,
  mode = "slide",
  className,
}: GameScreenStackProps) {
  const { screen, fade, reduced } = useGameMotion();
  const motionProps = mode === "fade" ? fade : screen;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
        className={className}
        initial={motionProps.initial}
        animate={motionProps.animate}
        exit={motionProps.exit}
        transition={reduced ? { duration: 0.12 } : motionProps.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
