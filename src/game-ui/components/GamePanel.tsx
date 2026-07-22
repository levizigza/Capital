import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type GamePanelProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: ReactNode;
  actions?: ReactNode;
  padding?: "none" | "default";
};

export function GamePanel({
  title,
  actions,
  padding = "default",
  className,
  children,
  ...props
}: GamePanelProps) {
  return (
    <div className={cn("game-panel flex flex-col min-w-0 min-h-0", className)} {...props}>
      {(title || actions) && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-black/5 p-[var(--game-panel-pad)] pb-3">
          {title ? <div className="font-bold text-lg min-w-0">{title}</div> : null}
          {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
        </div>
      )}
      <div
        className={cn(
          "min-h-0 min-w-0 flex-1",
          padding === "default" && "p-[var(--game-panel-pad)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
