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

/** Story Circle gate — every live island must have docs/islands/<slug>/story-circle.md */
const storyCircleModules = import.meta.glob("../../docs/islands/*/story-circle.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

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

  it("every live island pack has a story-circle.md", () => {
    const storyFolders = new Set(
      Object.keys(storyCircleModules)
        .map((p) => p.split("/").slice(-2, -1)[0]!)
        .filter((slug) => slug !== "_template"),
    );
    const missing: string[] = [];

    for (const [path, raw] of Object.entries(islandModules)) {
      const file = path.split("/").pop()!;
      if (file === "demo.islands.json") continue;
      const data = unwrapModule(raw) as { islands?: Array<{ id: string }> };
      for (const island of data.islands ?? []) {
        if (island.id === "starter_key_cove") continue;
        const slug = island.id.replace(/_/g, "-");
        if (!storyFolders.has(slug)) missing.push(`${island.id} → docs/islands/${slug}/story-circle.md`);
      }
    }

    expect(missing, missing.join("\n")).toEqual([]);
  });
});
