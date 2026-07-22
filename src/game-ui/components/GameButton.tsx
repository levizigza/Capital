import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useGameMotion } from "../useGameMotion";

const gameButtonVariants = cva(
  "game-ui-btn inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-semibold outline-none transition-[transform,box-shadow,background-color,border-color] duration-150 focus-visible:ring-2 focus-visible:ring-[var(--cap-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cap-paper)] disabled:pointer-events-none disabled:opacity-50 min-h-11 min-w-[2.75rem] touch-manipulation shrink-0 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  {
    variants: {
      variant: {
        primary:
          "border-2 border-[var(--cap-ink)] bg-[var(--cap-gold)] text-[var(--cap-ink)] shadow-[var(--cap-shadow-ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:bg-[var(--cap-gold-deep)]",
        secondary:
          "border-2 border-[var(--cap-ink)] bg-[var(--cap-card)] text-[var(--cap-ink)] shadow-[var(--cap-shadow-sm)] hover:-translate-y-[1px] hover:bg-[var(--cap-paper-2)]",
        outline:
          "border-2 border-[var(--cap-ink)]/45 bg-transparent text-[var(--cap-ink)] hover:border-[var(--cap-ink)] hover:bg-[var(--cap-card)]",
        ghost: "bg-transparent text-[var(--cap-ink)] hover:bg-[var(--cap-ink)]/8",
        danger:
          "border-2 border-[var(--cap-ink)] bg-[var(--cap-coral)] text-[var(--cap-ink)] shadow-[var(--cap-shadow-ink)] hover:-translate-y-[1px] hover:brightness-105",
        choice:
          "w-full justify-start text-left border-2 border-[var(--cap-ink)]/25 bg-[var(--cap-card)] text-[var(--cap-ink)] hover:border-[var(--cap-ink)] hover:bg-[color-mix(in_oklab,var(--cap-gold)_16%,var(--cap-card))] hover:shadow-[var(--cap-shadow-sm)]",
      },
      size: {
        sm: "text-sm px-3 py-2 min-h-9",
        md: "text-sm px-4 py-2.5",
        lg: "text-base px-6 py-3",
        icon: "p-2 min-w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type GameButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof gameButtonVariants> & {
    motionEnabled?: boolean;
  };

export const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(
  function GameButton(
    { className, variant, size, motionEnabled = true, children, ...props },
    ref
  ) {
    const { reduced, hover, tap } = useGameMotion();
    const { onClick, disabled, ...rest } = props;
    const classes = cn(gameButtonVariants({ variant, size }), className);
    const fxProps = disabled ? {} : { "data-fx-interactable": "" as const };

    if (!motionEnabled || reduced) {
      return (
        <button
          ref={ref}
          type="button"
          className={classes}
          onClick={onClick}
          disabled={disabled}
          {...fxProps}
          {...rest}
        >
          {children}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        type="button"
        className={classes}
        whileHover={disabled ? undefined : hover}
        whileTap={disabled ? undefined : tap}
        onClick={onClick}
        disabled={disabled}
        {...fxProps}
        {...(rest as Record<string, unknown>)}
      >
        {children}
      </motion.button>
    );
  }
);
