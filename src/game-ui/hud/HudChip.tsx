import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type HudChipProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
};

export function HudChip({ title, subtitle, className }: HudChipProps) {
  return (
    <div className={cn("game-hud-chip min-w-0", className)}>
      <div className="truncate font-bold text-gray-800">{title}</div>
      {subtitle ? <div className="truncate text-sm text-gray-600">{subtitle}</div> : null}
    </div>
  );
}

export function HudBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-gray-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-800 shadow-sm",
        className
      )}
    >
      {children}
    </span>
  );
}
