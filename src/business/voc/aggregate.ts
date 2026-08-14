/**
 * Aggregate VoC themes from annotations only — never invent pain or sentiment.
 */

import type {
  VocAnnotation,
  VocEvidence,
  VocExtractKind,
  VocStore,
  VocThemeStat,
} from "./types";

function evidenceMap(store: VocStore): Map<string, VocEvidence> {
  return new Map(store.evidence.map((e) => [e.id, e]));
}

export function aggregateThemes(
  store: VocStore,
  kind?: VocExtractKind,
): VocThemeStat[] {
  const emap = evidenceMap(store);
  const filtered = kind
    ? store.annotations.filter((a) => a.kind === kind)
    : store.annotations;

  const groups = new Map<string, VocAnnotation[]>();
  for (const a of filtered) {
    const key = `${a.kind}::${a.label.toLowerCase()}`;
    const list = groups.get(key) ?? [];
    list.push(a);
    groups.set(key, list);
  }

  const stats: VocThemeStat[] = [];
  for (const list of groups.values()) {
    const first = list[0]!;
    const evidence_ids = [...new Set(list.map((a) => a.evidence_id))];
    const evidence_uris = evidence_ids
      .map((id) => emap.get(id)?.evidence_uri)
      .filter((u): u is string => Boolean(u));
    const severities = list
      .map((a) => a.severity)
      .filter((s): s is 1 | 2 | 3 | 4 | 5 => s != null);
    stats.push({
      kind: first.kind,
      label: first.label,
      frequency: list.length,
      max_severity: severities.length ? Math.max(...severities) : null,
      evidence_ids,
      evidence_uris,
      sample_quotes: [...new Set(list.map((a) => a.quote))].slice(0, 5),
    });
  }

  return stats.sort((a, b) => b.frequency - a.frequency || a.label.localeCompare(b.label));
}

export function annotationsInWeek(
  store: VocStore,
  weekStartIso: string,
  weekEndIso: string,
): VocStore {
  const inRange = (iso: string) => iso >= weekStartIso && iso <= weekEndIso;
  const evidenceIds = new Set(
    store.evidence.filter((e) => inRange(e.captured_at)).map((e) => e.id),
  );
  // Include annotations whose evidence was captured in week OR annotation created in week
  const annotations = store.annotations.filter((a) => {
    if (evidenceIds.has(a.evidence_id)) return true;
    return inRange(a.created_at);
  });
  const neededEvidence = new Set(annotations.map((a) => a.evidence_id));
  return {
    schema_version: "1",
    evidence: store.evidence.filter((e) => neededEvidence.has(e.id)),
    annotations,
  };
}

/** ISO week id YYYY-Www from a date string. */
export function weekIdFromDate(isoDate: string): string {
  const d = new Date(isoDate.slice(0, 10) + "T12:00:00.000Z");
  // ISO week
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function weekBounds(weekId: string): { start: string; end: string } | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekId);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  // Thursday of ISO week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayNum = jan4.getUTCDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - dayNum + 1);
  const start = new Date(mondayWeek1);
  start.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const fmt = (x: Date) => x.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) + "T23:59:59.999Z" };
}
