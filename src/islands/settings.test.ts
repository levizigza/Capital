import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadAccessibilitySettings,
  persistAccessibilitySettings,
  textSizeClass,
  recordMinigameAttempt,
  recordQuestFailedAttempt,
  getQuestFailedAttempts,
  getDifficultyForMinigame,
  getHintLevel,
  loadPerformanceData,
  type AccessibilitySettings,
} from "./settings";

/* ── localStorage stub ──────────────────────────────────────────────── */

const store: Record<string, string> = {};

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];

  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  });
});

/* ── Accessibility Settings ─────────────────────────────────────────── */

describe("Accessibility settings", () => {
  it("returns defaults when localStorage is empty", () => {
    const s = loadAccessibilitySettings();
    expect(s).toEqual({
      textSize: "normal",
      reducedMotion: false,
      highContrast: false,
      guideArrows: true,
    });
  });

  it("round-trips through persist → load", () => {
    const custom: AccessibilitySettings = {
      textSize: "xl",
      reducedMotion: true,
      highContrast: true,
      guideArrows: false,
    };
    persistAccessibilitySettings(custom);
    expect(loadAccessibilitySettings()).toEqual(custom);
  });

  it("merges partial stored data with defaults", () => {
    store["island_settings_v1"] = JSON.stringify({ textSize: "large" });
    const s = loadAccessibilitySettings();
    expect(s.textSize).toBe("large");
    expect(s.reducedMotion).toBe(false);
    expect(s.highContrast).toBe(false);
    expect(s.guideArrows).toBe(true);
  });

  it("returns defaults when stored JSON is corrupted", () => {
    store["island_settings_v1"] = "NOT_JSON";
    const s = loadAccessibilitySettings();
    expect(s).toEqual({
      textSize: "normal",
      reducedMotion: false,
      highContrast: false,
      guideArrows: true,
    });
  });

  it("defaults guideArrows on for soft wayfinding", () => {
    expect(loadAccessibilitySettings().guideArrows).toBe(true);
  });
});

describe("textSizeClass", () => {
  it("maps normal → text-base", () => expect(textSizeClass("normal")).toBe("text-base"));
  it("maps large → text-lg", () => expect(textSizeClass("large")).toBe("text-lg"));
  it("maps xl → text-xl", () => expect(textSizeClass("xl")).toBe("text-xl"));
});

/* ── Performance / Difficulty ───────────────────────────────────────── */

describe("recordMinigameAttempt", () => {
  it("tracks attempts and successes", () => {
    const r1 = recordMinigameAttempt("mg1", false, undefined, 1000);
    expect(r1.attempts).toBe(1);
    expect(r1.successes).toBe(0);

    const r2 = recordMinigameAttempt("mg1", true, 80, 2000);
    expect(r2.attempts).toBe(2);
    expect(r2.successes).toBe(1);
    expect(r2.lastScore).toBe(80);
    expect(r2.bestScore).toBe(80);
    expect(r2.totalTimeMs).toBe(3000);
  });

  it("keeps bestScore across attempts", () => {
    recordMinigameAttempt("mg2", true, 90, 100);
    const r = recordMinigameAttempt("mg2", true, 70, 100);
    expect(r.bestScore).toBe(90);
  });

  it("persists across load cycles", () => {
    recordMinigameAttempt("mg3", true, 50, 500);
    const data = loadPerformanceData();
    expect(data.minigames["mg3"].attempts).toBe(1);
  });
});

describe("getDifficultyForMinigame", () => {
  it("returns normal for unknown minigame", () => {
    expect(getDifficultyForMinigame("unknown")).toBe("normal");
  });

  it("returns easy when success rate ≤ 30%", () => {
    // 0 successes in 4 attempts → 0% rate
    for (let i = 0; i < 4; i++) recordMinigameAttempt("hard_game", false, undefined, 100);
    expect(getDifficultyForMinigame("hard_game")).toBe("easy");
  });

  it("returns hard when success rate ≥ 70% with 2+ attempts", () => {
    recordMinigameAttempt("easy_game", true, 100, 100);
    recordMinigameAttempt("easy_game", true, 100, 100);
    expect(getDifficultyForMinigame("easy_game")).toBe("hard");
  });

  it("returns normal for a single successful attempt (not enough data for hard)", () => {
    recordMinigameAttempt("one_shot", true, 100, 100);
    // 100% rate but only 1 attempt → still normal (needs ≥ 2)
    expect(getDifficultyForMinigame("one_shot")).toBe("normal");
  });
});

/* ── Quest Failed Attempts / Hints ──────────────────────────────────── */

describe("quest failed attempts + hints", () => {
  it("starts at 0", () => {
    expect(getQuestFailedAttempts("q1")).toBe(0);
  });

  it("increments on each call", () => {
    expect(recordQuestFailedAttempt("q2")).toBe(1);
    expect(recordQuestFailedAttempt("q2")).toBe(2);
    expect(getQuestFailedAttempts("q2")).toBe(2);
  });

  it("getHintLevel reflects failed attempts", () => {
    recordQuestFailedAttempt("q3");
    recordQuestFailedAttempt("q3");
    expect(getHintLevel("q3")).toBe(2);
  });

  it("persists across load cycles", () => {
    recordQuestFailedAttempt("q4");
    recordQuestFailedAttempt("q4");
    const data = loadPerformanceData();
    expect(data.questFailedAttempts["q4"]).toBe(2);
  });
});
