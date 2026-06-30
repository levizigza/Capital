import { describe, expect, it } from "vitest";

import { loadAllDecks } from "@/content/events/engine";
import { validateIslandsContent } from "@/islands/validate";

import { validateEventDeck } from "./validateEventDeck";

const islandModules = import.meta.glob<{ default?: unknown } | unknown>(
  "../islands/content/*.islands.json",
  { eager: true },
);

const eventModules = import.meta.glob<{ default?: unknown } | unknown>(
  "../content/events/*.json",
  { eager: true },
);

function unwrapModule(raw: { default?: unknown } | unknown): unknown {
  return (raw as { default?: unknown }).default ?? raw;
}

describe("content validation snapshots", () => {
  it("all island JSON files pass schema + cross-ref validation", () => {
    const summaries: Record<string, { errors: string[]; warnings: string[] }> = {};

    for (const [path, raw] of Object.entries(islandModules)) {
      const file = path.split("/").pop()!;
      const { issues } = validateIslandsContent(unwrapModule(raw));
      const errors = issues.filter((i) => i.level === "error").map((i) => i.message);
      const warnings = issues.filter((i) => i.level === "warning").map((i) => i.message);
      summaries[file] = { errors, warnings };
      expect(errors, `${file} has validation errors`).toEqual([]);
    }

    expect(summaries).toMatchSnapshot();
  });

  it("all event deck JSON files pass schema validation", () => {
    const summaries: Record<string, { errors: string[] }> = {};

    for (const [path, raw] of Object.entries(eventModules)) {
      const file = path.split("/").pop()!;
      const { issues } = validateEventDeck(unwrapModule(raw));
      const errors = issues.map((i) => `${i.path}: ${i.message}`);
      summaries[file] = { errors };
      expect(errors, `${file} has validation errors`).toEqual([]);
    }

    expect(summaries).toMatchSnapshot();
  });

  it("loaded event decks match on-disk JSON count", () => {
    const loaded = loadAllDecks();
    expect(Object.keys(loaded).length).toBe(Object.keys(eventModules).length);
    expect(Object.keys(loaded).sort()).toMatchSnapshot();
  });
});
