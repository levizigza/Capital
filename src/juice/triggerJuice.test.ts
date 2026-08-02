import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { persistJuiceSettings } from "./settings";
import { triggerJuice } from "./triggerJuice";
import { juiceSfx } from "./juiceSfx";
import type { JuiceLevel } from "./types";

const memoryStore = new Map<string, string>();

function installLocalStorage() {
  memoryStore.clear();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => memoryStore.get(k) ?? null,
    setItem: (k: string, v: string) => {
      memoryStore.set(k, v);
    },
    removeItem: (k: string) => {
      memoryStore.delete(k);
    },
  });
}

function setLevel(level: JuiceLevel) {
  persistJuiceSettings({ version: 1, level });
}

function installDom(html: string) {
  const root = {
    classList: {
      _set: new Set<string>(),
      add(cls: string) {
        this._set.add(cls);
      },
      remove(cls: string) {
        this._set.delete(cls);
      },
      contains(cls: string) {
        return this._set.has(cls);
      },
    },
    dataset: {} as Record<string, string>,
    offsetWidth: 1,
    querySelector: (_sel: string) => null as unknown,
  };
  // Seed classes from the markup string.
  for (const cls of html.match(/class="([^"]+)"/)?.[1]?.split(/\s+/) ?? []) {
    root.classList.add(cls);
  }

  const bodyKids: { remove: () => void }[] = [];
  const doc = {
    querySelector: (sel: string) => {
      if (sel.includes("game-viewport") || sel.includes("juice-viewport")) return root;
      return null;
    },
    body: {
      appendChild: (node: { remove: () => void }) => {
        bodyKids.push(node);
      },
      innerHTML: "",
    },
    createElement: (_tag: string) => {
      const style: Record<string, string> = {};
      const node = {
        className: "",
        style: {
          setProperty: (k: string, v: string) => {
            style[k] = v;
          },
          left: "",
          top: "",
        },
        textContent: "",
        setAttribute: () => undefined,
        remove: () => undefined,
      };
      return node;
    },
  };

  vi.stubGlobal("document", doc);
  return { root, bodyKids };
}

describe("triggerJuice — Pillar 4 feel contract", () => {
  beforeEach(() => {
    installLocalStorage();
    vi.stubGlobal("window", {
      ...globalThis,
      innerWidth: 800,
      innerHeight: 600,
      matchMedia: () => ({ matches: false }),
      setTimeout: globalThis.setTimeout.bind(globalThis),
      dispatchEvent: () => true,
    });
    setLevel("high");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("plays complete SFX and nudges the viewport on high juice", () => {
    const { root } = installDom(`<div class="game-viewport juice-viewport"></div>`);
    const complete = vi.spyOn(juiceSfx, "playComplete");
    triggerJuice("complete", { burst: true, x: 100, y: 100 });
    expect(complete).toHaveBeenCalledWith("high");
    expect(root.classList.contains("juice-nudge-active")).toBe(true);
  });

  it("stays silent when Game Feel is off", () => {
    setLevel("off");
    installDom(`<div class="game-viewport"></div>`);
    const accept = vi.spyOn(juiceSfx, "playAccept");
    triggerJuice("accept");
    expect(accept).not.toHaveBeenCalled();
  });

  it("shakes on fail at high juice", () => {
    const { root } = installDom(`<div class="game-viewport juice-viewport"></div>`);
    const fail = vi.spyOn(juiceSfx, "playFail");
    triggerJuice("fail");
    expect(fail).toHaveBeenCalledWith("high");
    expect(root.classList.contains("juice-shake-active")).toBe(true);
  });
});
