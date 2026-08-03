/**
 * Pointer-safe primary CTA: fire once on pointerup (touch / computerUse /
 * Playwright pointer sequence) OR on click alone (keyboard / evaluate click).
 * Prevents double-advance when both pointerup and click arrive.
 */

const FLAG = "__capitalPointerActivated";

type FlagTarget = EventTarget & { [FLAG]?: boolean };

export function pointerSafeActivate(handler: () => void) {
  return {
    onPointerUp: (e: { button: number; preventDefault: () => void; currentTarget: EventTarget }) => {
      if (e.button !== 0) return;
      e.preventDefault();
      (e.currentTarget as FlagTarget)[FLAG] = true;
      handler();
    },
    onClick: (e: { preventDefault: () => void; currentTarget: EventTarget }) => {
      e.preventDefault();
      const t = e.currentTarget as FlagTarget;
      if (t[FLAG]) {
        t[FLAG] = false;
        return;
      }
      handler();
    },
  };
}
