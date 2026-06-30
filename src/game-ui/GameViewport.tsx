import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { FxOverlay, FxProvider } from "@/fx";
import "@/fx/fx.css";
import { PerformanceOverlay } from "@/perf";

import { GameUiProvider } from "./GameUiContext";
import type { UiAspect, UiScale } from "./types";
import { GameToastStack } from "./components/GameToast";

function detectLayout(width: number, height: number): { scale: UiScale; aspect: UiAspect } {
  const ratio = width / Math.max(height, 1);

  let aspect: UiAspect = "standard";
  if (ratio >= 2.1) aspect = "ultrawide";
  else if (ratio <= 1.45) aspect = "tall";

  let scale: UiScale = "standard";
  if (width < 640) scale = "compact";
  else if (width >= 1440 && aspect !== "tall") scale = "wide";

  return { scale, aspect };
}

export type GameViewportProps = {
  children: ReactNode;
  className?: string;
  reducedMotion?: boolean;
  highContrast?: boolean;
  textSizeClass?: string;
};

export function GameViewport({
  children,
  className,
  reducedMotion = false,
  highContrast = false,
  textSizeClass = "",
}: GameViewportProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ scale: UiScale; aspect: UiAspect }>({
    scale: "standard",
    aspect: "standard",
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setLayout(detectLayout(rect.width, rect.height));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <GameUiProvider
      reducedMotion={reducedMotion}
      highContrast={highContrast}
      uiScale={layout.scale}
      uiAspect={layout.aspect}
    >
      <FxProvider reducedMotion={reducedMotion}>
        <div
          ref={ref}
          className={cn(
            "game-viewport fx-fallback-vignette relative isolate min-h-dvh min-h-screen w-full overflow-hidden",
            textSizeClass,
            className
          )}
          data-ui-scale={layout.scale}
          data-ui-aspect={layout.aspect}
          data-reduced-motion={reducedMotion ? "true" : "false"}
          data-high-contrast={highContrast ? "true" : "false"}
        >
          <div className="game-viewport__stage relative flex min-h-dvh min-h-screen w-full flex-col">
            {children}
          </div>
          <FxOverlay containerRef={ref} />
          <PerformanceOverlay />
          <GameToastStack />
        </div>
      </FxProvider>
    </GameUiProvider>
  );
}
