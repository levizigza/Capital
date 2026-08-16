/**
 * Load cycle sessions from docs/playtest/sessions and write PLAYTEST_FINDINGS.md
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PlaytestSession } from "./types";
import { synthesizeCycle } from "./synthesize";
import { renderPlaytestFindingsMarkdown } from "./renderFindings";

export function loadSessionsFromDir(dir: string, cycleId?: string): PlaytestSession[] {
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const sessions: PlaytestSession[] = [];
  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(dir, file), "utf8")) as PlaytestSession;
    if (cycleId && raw.cycleId !== cycleId) continue;
    sessions.push(raw);
  }
  return sessions.sort((a, b) => a.id.localeCompare(b.id));
}

export function compileCycleFindings(opts: {
  repoRoot: string;
  cycleId: string;
  title: string;
  hypothesis: string;
  minSessions?: number;
}): { markdown: string; outCycle: string; outLatest: string; patternCount: number } {
  const sessionsDir = join(opts.repoRoot, "docs/playtest/sessions");
  const sessions = loadSessionsFromDir(sessionsDir, opts.cycleId);
  if (sessions.length === 0) {
    throw new Error(`No sessions found for cycle ${opts.cycleId} in ${sessionsDir}`);
  }

  const dates = sessions.map((s) => s.date).sort();
  const cycle = synthesizeCycle({
    id: opts.cycleId,
    title: opts.title,
    startedAt: dates[0]!,
    endedAt: dates[dates.length - 1],
    hypothesis: opts.hypothesis,
    sessions,
    minSessions: opts.minSessions ?? 2,
  });

  const markdown = renderPlaytestFindingsMarkdown(cycle, sessions);
  const outDir = join(opts.repoRoot, "docs/playtest/cycles", opts.cycleId);
  mkdirSync(outDir, { recursive: true });
  const outCycle = join(outDir, "PLAYTEST_FINDINGS.md");
  const outLatest = join(opts.repoRoot, "docs/playtest/PLAYTEST_FINDINGS.md");
  writeFileSync(outCycle, markdown);
  writeFileSync(outLatest, markdown);
  return { markdown, outCycle, outLatest, patternCount: cycle.patterns.length };
}
