import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useGameMotion } from "../useGameMotion";

const gameButtonVariants = cva(
  "game-ui-btn inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-11 min-w-[2.75rem] touch-manipulation shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white shadow-md hover:bg-blue-700",
        secondary: "bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200",
        outline: "bg-white/90 text-gray-900 border border-gray-200 shadow-sm hover:bg-white",
        ghost: "bg-transparent text-gray-800 hover:bg-black/5",
        danger: "bg-red-600 text-white hover:bg-red-700",
        choice: "w-full justify-start bg-gray-50 text-gray-900 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-left",
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
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);
