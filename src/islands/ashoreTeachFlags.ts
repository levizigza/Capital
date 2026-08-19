/**
 * Ashore FTUE-7 vs Harbor Piggy — one teach spine.
 * Complete Ashore → skip chart overlay; skipped Ashore → Piggy + chart owns places.
 */

export const ASHORE_TEACH_SESSION_KEY = "capital_ashore_teach";

export type AshoreTeachDone = "complete" | "skipped";

export function stashAshoreTeachResult(kind: "complete" | "leave"): void {
  try {
    sessionStorage.setItem(
      ASHORE_TEACH_SESSION_KEY,
      kind === "complete" ? "complete" : "skipped",
    );
  } catch {
    /* ignore */
  }
}

export function consumeAshoreTeachResult(): AshoreTeachDone | undefined {
  try {
    const v = sessionStorage.getItem(ASHORE_TEACH_SESSION_KEY);
    sessionStorage.removeItem(ASHORE_TEACH_SESSION_KEY);
    if (v === "complete" || v === "skipped") return v;
  } catch {
    /* ignore */
  }
  return undefined;
}

export function shouldShowHarborWorldBriefing(
  ashoreTeachDone?: AshoreTeachDone | null,
): boolean {
  return ashoreTeachDone !== "complete";
}
