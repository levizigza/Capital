import { describe, expect, it, beforeEach, vi } from "vitest";
import { capitalMusic } from "./capitalMusic";
import { setCapitalMusicEnabled, toggleCapitalMusicMute } from "./musicMute";
import { loadAccessibilitySettings } from "../settings";

const store: Record<string, string> = {};

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
  });
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  setCapitalMusicEnabled(true);
});

describe("musicMute", () => {
  it("toggles capitalMusic and mirrors a11y musicEnabled", () => {
    expect(capitalMusic.isEnabled()).toBe(true);
    expect(toggleCapitalMusicMute()).toBe(false);
    expect(capitalMusic.isEnabled()).toBe(false);
    expect(loadAccessibilitySettings().musicEnabled).toBe(false);

    expect(toggleCapitalMusicMute()).toBe(true);
    expect(capitalMusic.isEnabled()).toBe(true);
    expect(loadAccessibilitySettings().musicEnabled).toBe(true);
  });

  it("setCapitalMusicEnabled writes both music prefs and settings", () => {
    setCapitalMusicEnabled(false);
    expect(capitalMusic.isEnabled()).toBe(false);
    expect(loadAccessibilitySettings().musicEnabled).toBe(false);
    setCapitalMusicEnabled(true);
    expect(capitalMusic.isEnabled()).toBe(true);
    expect(loadAccessibilitySettings().musicEnabled).toBe(true);
  });
});
