import { useGameUiOptional } from "./GameUiContext";

const FADE = { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const };
const SLIDE = { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const };

export function useGameMotion() {
  const ctx = useGameUiOptional();
  const reduced = ctx?.reducedMotion ?? false;

  return {
    reduced,
    screen: reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: SLIDE },
    fade: reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
      : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: FADE },
    modal: reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
      : { initial: { opacity: 0, scale: 0.94 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.96 }, transition: FADE },
    hover: reduced ? {} : { scale: 1.04, y: -2 },
    tap: reduced ? {} : { scale: 0.97 },
  };
}
