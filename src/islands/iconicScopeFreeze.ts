/**
 * Pillar 17 — Scope and production.
 *
 * Main quest spine stays Harbor · Cove → Paycheck → Credit.
 * Era side shores are discoverable extras (not new main-course chips).
 * Design prose: docs/iconic-later.md · docs/era-shores-restore.md.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  PARKED_ISLAND_IDS,
  PARKED_MINIGAME_IDS,
} from "./spineContentRegistry";
import {
  SIDE_SHORE_TRAVEL_IDS,
  SPINE_TRAVEL_IDS,
} from "./spineArchipelago";

/** One-sentence MVP — signature loop + triangle organs cold-retellable. */
export const ICONIC_MVP_SENTENCE =
  "Signature loop + Cove · Paycheck · Credit organs cold-retellable at Harbor.";

/** Hard freeze laws — must stay true while polishing toward iconic. */
export const ICONIC_FREEZE_LAWS = [
  {
    id: "no_map_width",
    law: "Main quest spine stays Harbor · Cove → Paycheck → Credit (era side shores are extras, not new main-course islands)",
  },
  {
    id: "no_fake_mmo",
    law: "No fake multiplayer backend; Family Room stays local",
  },
  {
    id: "no_foreign_merge",
    law: "No Nathan Project / BMO / CBE merge into Capital",
  },
  {
    id: "cut_before_add",
    law: "New main-course island < deeper Take / feel / Plinth proof",
  },
] as const;

/** Docs folder slug for an island id (`signal_city` → `signal-city`). */
export function parkedIslandDocsSlug(islandId: string): string {
  return islandId.replace(/_/g, "-");
}

/** Still-parked chapters that ship a docs/islands/<slug>/ folder. */
export const PARKED_ISLAND_DOCS_SLUGS = PARKED_ISLAND_IDS.map(parkedIslandDocsSlug);

/** Restored era side shores — docs should say SIDE SHORE, not PARKED. */
export const SIDE_SHORE_DOCS_SLUGS = SIDE_SHORE_TRAVEL_IDS.map(parkedIslandDocsSlug);

/**
 * Banner every parked island story-circle must carry (when docs exist).
 * Case-insensitive match on file contents.
 */
export const PARKED_DOCS_BANNER_RE = /\bPARKED\b/;

/** Banner for live era side-shore story-circles. */
export const SIDE_SHORE_DOCS_BANNER_RE = /\bSIDE SHORE\b/;

export const ICONIC_LATER_DOC = "docs/iconic-later.md";

/** Frozen main-course travel surface — exactly four strip chips. */
export function assertSpineTravelFrozen(): {
  ok: boolean;
  ids: readonly string[];
  reason?: string;
} {
  const expected = [
    "harbor_haven",
    "coincraft_cove",
    "paycheck_peninsula",
    "credit_kingdom",
  ];
  if (SPINE_TRAVEL_IDS.length !== 4) {
    return {
      ok: false,
      ids: SPINE_TRAVEL_IDS,
      reason: `spine widened to ${SPINE_TRAVEL_IDS.length} travel ids`,
    };
  }
  for (let i = 0; i < expected.length; i++) {
    if (SPINE_TRAVEL_IDS[i] !== expected[i]) {
      return {
        ok: false,
        ids: SPINE_TRAVEL_IDS,
        reason: `spine order drift at ${i}: want ${expected[i]}, got ${SPINE_TRAVEL_IDS[i]}`,
      };
    }
  }
  return { ok: true, ids: SPINE_TRAVEL_IDS };
}

export type ParkedDocsAudit = {
  ok: boolean;
  missingFolders: string[];
  missingBanner: string[];
  present: string[];
};

/** Audit parked island docs for explicit PARKED banners (repo root relative). */
export function auditParkedIslandDocs(repoRoot: string): ParkedDocsAudit {
  const missingFolders: string[] = [];
  const missingBanner: string[] = [];
  const present: string[] = [];

  for (const slug of PARKED_ISLAND_DOCS_SLUGS) {
    const folder = join(repoRoot, "docs/islands", slug);
    const story = join(folder, "story-circle.md");
    // starter_key_cove may lack docs — only require banner when folder exists
    if (!existsSync(folder)) {
      continue;
    }
    if (!existsSync(story)) {
      missingFolders.push(slug);
      continue;
    }
    const body = readFileSync(story, "utf8");
    if (!PARKED_DOCS_BANNER_RE.test(body)) {
      missingBanner.push(slug);
    } else {
      present.push(slug);
    }
  }

  return {
    ok: missingFolders.length === 0 && missingBanner.length === 0,
    missingFolders,
    missingBanner,
    present,
  };
}

/** Audit side-shore docs for SIDE SHORE banners (restored era chapters). */
export function auditSideShoreIslandDocs(repoRoot: string): ParkedDocsAudit {
  const missingFolders: string[] = [];
  const missingBanner: string[] = [];
  const present: string[] = [];

  for (const slug of SIDE_SHORE_DOCS_SLUGS) {
    const folder = join(repoRoot, "docs/islands", slug);
    const story = join(folder, "story-circle.md");
    if (!existsSync(folder) || !existsSync(story)) {
      missingFolders.push(slug);
      continue;
    }
    const body = readFileSync(story, "utf8");
    if (!SIDE_SHORE_DOCS_BANNER_RE.test(body)) {
      missingBanner.push(slug);
    } else {
      present.push(slug);
    }
  }

  return {
    ok: missingFolders.length === 0 && missingBanner.length === 0,
    missingFolders,
    missingBanner,
    present,
  };
}

/** Later-doc must name freeze + lanes so the list stays the creep sink. */
export function auditIconicLaterDoc(repoRoot: string): {
  ok: boolean;
  missing: string[];
} {
  const path = join(repoRoot, ICONIC_LATER_DOC);
  if (!existsSync(path)) {
    return { ok: false, missing: [ICONIC_LATER_DOC] };
  }
  const body = readFileSync(path, "utf8");
  const needles = [
    "No map width",
    "Family Room",
    "Nathan",
    "signal_city",
    "mg_news_shocks",
    "Talk Battle",
    "SIDE SHORE",
    ICONIC_MVP_SENTENCE,
  ];
  const missing = needles.filter((n) => !body.includes(n));
  return { ok: missing.length === 0, missing };
}

/** Snapshot counts — creep shows up as unexpected growth here. */
export function iconicScopeSnapshot() {
  return {
    spineTravelCount: SPINE_TRAVEL_IDS.length,
    sideShoreCount: SIDE_SHORE_TRAVEL_IDS.length,
    parkedIslandCount: PARKED_ISLAND_IDS.length,
    parkedMinigameCount: PARKED_MINIGAME_IDS.length,
    freezeLawCount: ICONIC_FREEZE_LAWS.length,
  };
}

/** List docs/islands children that look like outer chapters (for diagnostics). */
export function listIslandDocFolders(repoRoot: string): string[] {
  const dir = join(repoRoot, "docs/islands");
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .sort();
}
