/**
 * Render PLAYTEST_FINDINGS.md for a cycle.
 */

import type { PlaytestCycle, PlaytestSession } from "./types";

export function renderPlaytestFindingsMarkdown(
  cycle: PlaytestCycle,
  sessions: PlaytestSession[],
): string {
  const lines: string[] = [];
  lines.push(`# PLAYTEST_FINDINGS — ${cycle.title}`);
  lines.push("");
  lines.push(`**Cycle id:** \`${cycle.id}\`  `);
  lines.push(`**Window:** ${cycle.startedAt}${cycle.endedAt ? ` → ${cycle.endedAt}` : ""}  `);
  lines.push(`**Sessions:** ${cycle.sessionIds.length} (\`${cycle.sessionIds.join("`, `")}\`)  `);
  lines.push("");
  lines.push(`## Hypothesis`);
  lines.push("");
  lines.push(cycle.hypothesis);
  lines.push("");
  lines.push(`## Summary`);
  lines.push("");
  lines.push(cycle.summary);
  lines.push("");
  lines.push(`> **Law:** OBSERVATION ≠ INTERPRETATION ≠ PROPOSED FIX.  `);
  lines.push(`> Do **not** fix every individual complaint — ship work only against **recurring** patterns.`);
  lines.push("");

  lines.push(`## Recurring behavioral patterns`);
  lines.push("");
  if (cycle.patterns.length === 0) {
    lines.push(`_No patterns met the recurrence threshold. Run more sessions before changing craft._`);
    lines.push("");
  } else {
    for (const p of cycle.patterns) {
      lines.push(`### ${p.id} — ${p.title}`);
      lines.push("");
      lines.push(`Sessions: ${p.sessionCount} · Codes: ${p.momentCodes.join(", ")} · Reactions: ${p.reactionKinds.join(", ") || "—"}`);
      lines.push("");
      lines.push(`#### OBSERVATION`);
      lines.push("");
      lines.push(p.observation);
      lines.push("");
      lines.push(`#### INTERPRETATION`);
      lines.push("");
      lines.push(p.interpretation);
      lines.push("");
      lines.push(`#### PROPOSED FIX`);
      lines.push("");
      lines.push(p.proposedFix);
      lines.push("");
      lines.push(`**Disposition:** \`${p.disposition}\``);
      lines.push("");
    }
  }

  lines.push(`## Ship candidates (still need craft owner)`);
  lines.push("");
  if (cycle.shipCandidates.length === 0) {
    lines.push(`_None this cycle._`);
    lines.push("");
  } else {
    for (const t of cycle.shipCandidates) {
      lines.push(`### ${t.id}`);
      lines.push("");
      lines.push(`- **OBSERVATION:** ${t.observation}`);
      lines.push(`- **INTERPRETATION:** ${t.interpretation}`);
      lines.push(`- **PROPOSED FIX:** ${t.proposedFix}`);
      lines.push("");
    }
  }

  lines.push(`## Parked one-offs (not every complaint)`);
  lines.push("");
  lines.push(`These appeared once or lack recurrence. Keep for the next cycle; do not open drive-by PRs.`);
  lines.push("");
  if (cycle.parkedOneOffs.length === 0) {
    lines.push(`_None logged._`);
    lines.push("");
  } else {
    for (const t of cycle.parkedOneOffs) {
      lines.push(`- \`${t.id}\` — ${t.observation.slice(0, 120)}${t.observation.length > 120 ? "…" : ""}`);
    }
    lines.push("");
  }

  lines.push(`## Session index`);
  lines.push("");
  lines.push(`| Session | Player | Device | Source | Moments |`);
  lines.push(`|---------|--------|--------|--------|---------|`);
  for (const s of sessions) {
    lines.push(
      `| ${s.id} | ${s.playerLabel} | ${s.device}${s.reducedMotion ? " · RM" : ""} | ${s.source} | ${s.moments.length} |`,
    );
  }
  lines.push("");

  lines.push(`## Six-question rollup`);
  lines.push("");
  for (const s of sessions) {
    const q = s.sixQuestions;
    lines.push(`### ${s.id}`);
    lines.push("");
    if (q.misunderstoodWhatToDo) lines.push(`1. Misunderstood: ${q.misunderstoodWhatToDo}`);
    if (q.feltUnfair) lines.push(`2. Unfair: ${q.feltUnfair}`);
    if (q.repetitiveWithoutNewBeat) lines.push(`3. Repetitive: ${q.repetitiveWithoutNewBeat}`);
    if (q.ignoredPlayerAbility) lines.push(`4. Ignored ability: ${q.ignoredPlayerAbility}`);
    if (q.gotLost) lines.push(`5. Lost: ${q.gotLost}`);
    if (q.funOrOnlyFunctional) lines.push(`6. Fun vs functional: ${q.funOrOnlyFunctional}`);
    lines.push("");
  }

  lines.push(`## Next cycle`);
  lines.push("");
  lines.push(`1. Copy \`docs/playtest/session-template.md\` (or JSON schema) per player.`);
  lines.push(`2. Fill moments with attempted / believed / actual + reaction tags.`);
  lines.push(`3. Run \`npm run playtest:findings -- --cycle <id>\` after ≥2 sessions.`);
  lines.push(`4. Only schedule craft work from **recurring patterns** with disposition \`investigate\` → \`ship_candidate\`.`);
  lines.push("");

  return lines.join("\n");
}
