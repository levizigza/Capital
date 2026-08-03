import { describe, expect, it, vi } from "vitest";
import { pointerSafeActivate } from "./pointerSafeClick";

describe("pointerSafeActivate", () => {
  it("fires once for pointerup then click (Playwright / mouse)", () => {
    const handler = vi.fn();
    const { onPointerUp, onClick } = pointerSafeActivate(handler);
    const target = {} as EventTarget;
    onPointerUp({
      button: 0,
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      currentTarget: target,
    });
    onClick({
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      currentTarget: target,
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("fires on click alone (keyboard / element.click)", () => {
    const handler = vi.fn();
    const { onClick } = pointerSafeActivate(handler);
    onClick({
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      currentTarget: {} as EventTarget,
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores non-primary pointer buttons", () => {
    const handler = vi.fn();
    const { onPointerUp } = pointerSafeActivate(handler);
    onPointerUp({
      button: 2,
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      currentTarget: {} as EventTarget,
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("can stopPropagation for nested CTAs", () => {
    const handler = vi.fn();
    const stop = vi.fn();
    const { onClick } = pointerSafeActivate(handler, { stopPropagation: true });
    onClick({
      preventDefault: () => undefined,
      stopPropagation: stop,
      currentTarget: {} as EventTarget,
    });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(1);
  });
});
