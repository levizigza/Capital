/**
 * Pillar 9 — navigability law: every overlay answers Esc even when focus is lost.
 */

import { useEffect } from "react";

/** Window-level Escape → leave. Prefer this over element onKeyDown alone. */
export function useOverlayEscape(onLeave: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onLeave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onLeave, enabled]);
}
