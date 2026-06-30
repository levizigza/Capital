import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type GameHudLayoutProps = {
  topLeft?: ReactNode;
  topRight?: ReactNode;
  bottom?: ReactNode;
  children: ReactNode;
  className?: string;
  background?: ReactNode;
};

/** Three-band HUD shell: top bar (left + right), scrollable main, bottom actions. */
export function GameHudLayout({
  topLeft,
  topRight,
  bottom,
  children,
  className,
  background,
}: GameHudLayoutProps) {
  return (
    <div className={cn("game-hud-layout relative", className)}>
      {background ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          {background}
        </div>
      ) : null}

      <header className="game-hud-layout__top relative">
        {topLeft ? <div className="min-w-0 flex-1 shrink">{topLeft}</div> : <div />}
        {topRight ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{topRight}</div>
        ) : null}
      </header>

      <main className="game-hud-layout__main relative">{children}</main>

      {bottom ? <footer className="game-hud-layout__bottom relative w-full">{bottom}</footer> : null}
    </div>
  );
}
