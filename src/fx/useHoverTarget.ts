import { useEffect, useRef, useState, type RefObject } from "react";

import type { HoverTarget } from "./postFxRenderer";

const INTERACTABLE = "[data-fx-interactable]:not([disabled])";

function elementToHover(el: Element, viewport: DOMRect): HoverTarget | null {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const cx = (rect.left + rect.width * 0.5 - viewport.left) / viewport.width;
  const cy = 1 - (rect.top + rect.height * 0.5 - viewport.top) / viewport.height;
  const radius = Math.max(rect.width, rect.height) / viewport.width * 0.55;

  return {
    cx: Math.max(0, Math.min(1, cx)),
    cy: Math.max(0, Math.min(1, cy)),
    radius: Math.max(0.04, Math.min(0.35, radius)),
  };
}

/** Track pointer over `[data-fx-interactable]` elements for shader hover glow. */
export function useHoverTarget(containerRef: RefObject<HTMLElement | null>): HoverTarget | null {
  const [hover, setHover] = useState<HoverTarget | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const root = containerRef.current ?? document.body;

    const updateFromPoint = (clientX: number, clientY: number) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const target = document.elementFromPoint(clientX, clientY);
        const el = target?.closest(INTERACTABLE);
        const viewport = root.getBoundingClientRect();
        setHover(el ? elementToHover(el, viewport) : null);
      });
    };

    const onMove = (e: PointerEvent) => updateFromPoint(e.clientX, e.clientY);
    const onLeave = () => setHover(null);

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [containerRef]);

  return hover;
}
