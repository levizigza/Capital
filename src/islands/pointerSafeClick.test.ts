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
      currentTarget: target,
    });
    onClick({
      preventDefault: () => undefined,
      currentTarget: target,
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("fires on click alone (keyboard / element.click)", () => {
    const handler = vi.fn();
    const { onClick } = pointerSafeActivate(handler);
    onClick({
      preventDefault: () => undefined,
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
      currentTarget: {} as EventTarget,
    });
    expect(handler).not.toHaveBeenCalled();
  });
});
