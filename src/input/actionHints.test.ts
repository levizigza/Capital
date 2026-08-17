import { describe, expect, it } from "vitest";
import {
  actionBindingLabel,
  DEFAULT_HINT_CTX,
  formatInteractPhrase,
  formatMovePhrase,
  resolveControlPlaceholders,
} from "./actionHints";
import { DEFAULT_BINDINGS } from "./defaultBindings";

describe("actionHints", () => {
  it("formats move phrase from default WASD bindings", () => {
    const phrase = formatMovePhrase(DEFAULT_HINT_CTX);
    expect(phrase).toMatch(/W/);
    expect(phrase).toMatch(/walk pad/);
  });

  it("formats interact from remapped binding", () => {
    const ctx = {
      bindings: {
        ...DEFAULT_BINDINGS,
        interact: {
          keyboard: [{ type: "keyboard" as const, code: "KeyF" }],
        },
      },
      device: "keyboard" as const,
    };
    expect(actionBindingLabel("interact", ctx)).toBe("F");
    expect(formatInteractPhrase({ ctx })).toMatch(/F/);
  });

  it("resolves placeholders in tutorial copy", () => {
    const out = resolveControlPlaceholders(
      "Move with {move}. Talk with {interact}. Map {map}.",
      DEFAULT_HINT_CTX,
    );
    expect(out).not.toMatch(/\{move\}/);
    expect(out).toMatch(/M/);
  });
});
