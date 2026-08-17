/**
 * Pointer-safe primary CTA: fire once on pointerup (touch / computerUse /
 * Playwright pointer sequence) OR on click alone (keyboard / evaluate click).
 * Prevents double-advance when both pointerup and click arrive.
 *
 * IMPORTANT: Do not put infinite CSS transform animations on elements that use
 * this helper — hit targets must stay layout-stable for real mice.
 */

const FLAG = "__capitalPointerActivated";

type FlagTarget = EventTarget & { [FLAG]?: boolean };

type ActivateEvent = {
  button?: number;
  preventDefault: () => void;
  stopPropagation: () => void;
  currentTarget: EventTarget;
};

export function pointerSafeActivate(
  handler: () => void,
  opts?: { stopPropagation?: boolean },
) {
  return {
    onPointerUp: (e: ActivateEvent) => {
      // Some hosts omit `button` on synthetic pointerup — treat as primary.
      if ((e.button ?? 0) !== 0) return;
      e.preventDefault();
      if (opts?.stopPropagation) e.stopPropagation();
      (e.currentTarget as FlagTarget)[FLAG] = true;
      handler();
    },
    onClick: (e: ActivateEvent) => {
      e.preventDefault();
      if (opts?.stopPropagation) e.stopPropagation();
      const t = e.currentTarget as FlagTarget;
      if (t[FLAG]) {
        t[FLAG] = false;
        return;
      }
      handler();
    },
  };
}
