import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { useFx } from "./FxProvider";
import {
  createPostFxRenderer,
  overlayPixelSize,
  type PostFxRenderer,
} from "./postFxRenderer";
import { useHoverTarget } from "./useHoverTarget";

type FxOverlayProps = {
  containerRef: React.RefObject<HTMLElement | null>;
  className?: string;
};

/**
 * Lightweight WebGL overlay — one fullscreen triangle per frame.
 * Falls back to CSS vignette when WebGL is unavailable.
 */
export function FxOverlay({ containerRef, className }: FxOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PostFxRenderer | null>(null);
  const rafRef = useRef(0);
  const startRef = useRef(performance.now());

  const { dissolve, dissolveDir, reducedMotion, webglSupported, setWebglSupported } = useFx();
  const hover = useHoverTarget(containerRef);

  // Init WebGL once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const renderer = createPostFxRenderer(canvas);
    if (!renderer) {
      setWebglSupported(false);
      return;
    }

    rendererRef.current = renderer;
    setWebglSupported(true);

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [reducedMotion, setWebglSupported]);

  // RAF render loop — pauses when tab hidden
  useEffect(() => {
    if (reducedMotion || !webglSupported) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const renderFrame = () => {
      const renderer = rendererRef.current;
      if (!renderer) {
        rafRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      if (document.hidden) {
        rafRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const rect = container.getBoundingClientRect();
      const { w, h } = overlayPixelSize(rect.width, rect.height);
      const time = (performance.now() - startRef.current) / 1000;
      const intensity = 1;

      renderer.render(w, h, {
        time,
        intensity,
        dissolve,
        dissolveDir,
        hover,
      });

      rafRef.current = requestAnimationFrame(renderFrame);
    };

    rafRef.current = requestAnimationFrame(renderFrame);

    return () => cancelAnimationFrame(rafRef.current);
  }, [containerRef, dissolve, dissolveDir, hover, reducedMotion, webglSupported]);

  // Mark container for CSS fallback when WebGL unavailable
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!webglSupported) el.classList.add("game-fx--no-webgl");
    else el.classList.remove("game-fx--no-webgl");
  }, [containerRef, webglSupported]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "game-fx-overlay pointer-events-none absolute inset-0 z-30 h-full w-full",
        !webglSupported && "game-fx-overlay--css-fallback",
        className,
      )}
      aria-hidden
    />
  );
}
