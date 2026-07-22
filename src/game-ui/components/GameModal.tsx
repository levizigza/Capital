import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import { useGameMotion } from "../useGameMotion";
import { GamePanel } from "./GamePanel";

export type GameModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  /** Sticky footer actions (always visible while body scrolls) */
  footer?: ReactNode;
  /** bottom sheet on compact viewports */
  placement?: "center" | "sheet";
  maxWidth?: "sm" | "md" | "lg" | "xl";
  zIndex?: number;
  /** When false, children render without an extra GamePanel wrapper */
  usePanel?: boolean;
  /** Render in document.body so HUD stacking never traps the dialog */
  usePortal?: boolean;
  /** Show an always-visible ✕ control (default true) */
  showCloseButton?: boolean;
  /** Close when backdrop clicked (default true) */
  closeOnBackdrop?: boolean;
};

const maxW = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

/**
 * Navigable dialog shell — Esc closes, body scrolls, actions can stick in footer.
 * Never leave players trapped behind content taller than the viewport.
 */
export function GameModal({
  open,
  onClose,
  children,
  title,
  footer,
  placement = "center",
  maxWidth = "md",
  zIndex = 50,
  usePanel = true,
  usePortal = true,
  showCloseButton = true,
  closeOnBackdrop = true,
}: GameModalProps) {
  const { fade, modal, reduced } = useGameMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const dialog = (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="game-modal"
          className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 game-ui-animate"
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
            onClick={() => {
              if (closeOnBackdrop) onClose();
            }}
          />
          <motion.div
            className={cn(
              "relative flex w-full max-h-[min(92dvh,920px)] flex-col",
              maxW[maxWidth],
              placement === "sheet" && "self-end sm:self-center",
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
              <GamePanel
                title={title}
                padding="none"
                className="flex min-h-0 max-h-[min(92dvh,920px)] flex-col overflow-hidden"
                actions={
                  showCloseButton ? (
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border-2 border-black/15 bg-white px-3 py-1 text-sm font-bold hover:bg-slate-50"
                      aria-label="Close"
                      data-testid="game-modal-close"
                    >
                      ✕ Close
                    </button>
                  ) : null
                }
              >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-[var(--game-panel-pad)]">
                  {children}
                </div>
                {footer ? (
                  <div className="shrink-0 border-t border-black/10 bg-[color-mix(in_oklab,var(--cap-card,white)_92%,transparent)] p-[var(--game-panel-pad)] pt-3">
                    {footer}
                  </div>
                ) : null}
              </GamePanel>
            ) : (
              <div className="game-panel flex max-h-[min(92dvh,920px)] min-h-0 flex-col overflow-hidden rounded-xl">
                {(title || showCloseButton) && (
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-black/10 px-4 py-3">
                    <div className="min-w-0 font-bold">{title}</div>
                    {showCloseButton ? (
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border-2 border-black/15 bg-white px-3 py-1 text-sm font-bold"
                        aria-label="Close"
                        data-testid="game-modal-close"
                      >
                        ✕ Close
                      </button>
                    ) : null}
                  </div>
                )}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-[var(--game-panel-pad)]">
                  {children}
                </div>
                {footer ? (
                  <div className="shrink-0 border-t border-black/10 p-[var(--game-panel-pad)] pt-3">
                    {footer}
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return usePortal ? createPortal(dialog, document.body) : dialog;
}
