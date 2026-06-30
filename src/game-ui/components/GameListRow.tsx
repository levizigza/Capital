import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { GameButton } from "./GameButton";

export type GameListRowProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  locked?: boolean;
  className?: string;
  "data-testid"?: string;
};

export function GameListRow({
  icon,
  title,
  description,
  trailing,
  onClick,
  disabled,
  active,
  locked,
  className,
  "data-testid": testId,
}: GameListRowProps) {
  const content = (
    <>
      {icon ? <span className="shrink-0 text-xl leading-none" aria-hidden>{icon}</span> : null}
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold text-sm">{title}</div>
        {description ? (
          <div className="truncate text-xs text-gray-600">{description}</div>
        ) : null}
      </div>
      {trailing ? <span className="shrink-0 text-xs text-gray-500">{trailing}</span> : null}
    </>
  );

  if (onClick) {
    return (
      <GameButton
        variant={active ? "primary" : "choice"}
        size="md"
        disabled={disabled || locked}
        onClick={onClick}
        motionEnabled={false}
        className={cn("w-full", className)}
        data-testid={testId}
      >
        {locked ? <span aria-hidden>🔒 </span> : null}
        {content}
      </GameButton>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-gray-200 bg-white/60 px-3 py-2 min-h-11",
        className
      )}
    >
      {content}
    </div>
  );
}
