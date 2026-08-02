import { describe, expect, it } from "vitest";
import { join } from "node:path";
import {
  ICONIC_FREEZE_LAWS,
  ICONIC_LATER_DOC,
  ICONIC_MVP_SENTENCE,
  assertSpineTravelFrozen,
  auditIconicLaterDoc,
  auditParkedIslandDocs,
  iconicScopeSnapshot,
  parkedIslandDocsSlug,
} from "./iconicScopeFreeze";
import { PARKED_ISLAND_IDS } from "./spineContentRegistry";
import { existsSync, readFileSync } from "node:fs";

const root = join(__dirname, "../..");

describe("Iconic scope freeze (Pillar 17)", () => {
  it("keeps MVP sentence + four freeze laws", () => {
    expect(ICONIC_MVP_SENTENCE).toMatch(/cold-retell/i);
    expect(ICONIC_MVP_SENTENCE).toMatch(/Cove|Paycheck|Credit/i);
    expect(ICONIC_FREEZE_LAWS).toHaveLength(4);
    expect(ICONIC_FREEZE_LAWS.map((l) => l.id).sort()).toEqual([
      "cut_before_add",
      "no_fake_mmo",
      "no_foreign_merge",
      "no_map_width",
    ]);
  });

  it("freezes travel surface to Harbor · Cove · Paycheck · Credit", () => {
    const audit = assertSpineTravelFrozen();
    expect(audit.ok, audit.reason).toBe(true);
    expect(audit.ids).toEqual([
      "harbor_haven",
      "coincraft_cove",
      "paycheck_peninsula",
      "credit_kingdom",
    ]);
  });

  it("parks a later list doc that sinks creep", () => {
    expect(existsSync(join(root, ICONIC_LATER_DOC))).toBe(true);
    const later = auditIconicLaterDoc(root);
    expect(later.missing, later.missing.join(", ")).toEqual([]);
    expect(later.ok).toBe(true);
  });

  it("marks every on-disk parked island story-circle with PARKED", () => {
    const audit = auditParkedIslandDocs(root);
    expect(audit.missingFolders, audit.missingFolders.join(", ")).toEqual([]);
    expect(audit.missingBanner, audit.missingBanner.join(", ")).toEqual([]);
    expect(audit.present.length).toBeGreaterThanOrEqual(8);
    // starter_key_cove has no docs folder — still parked in registry
    expect(PARKED_ISLAND_IDS).toContain("starter_key_cove");
    expect(parkedIslandDocsSlug("signal_city")).toBe("signal-city");
  });

  it("cursor freeze rule still names the three hard bans", () => {
    const rule = readFileSync(join(root, ".cursor/rules/iconic-freeze.mdc"), "utf8");
    expect(rule).toMatch(/Cove.*Paycheck.*Credit/s);
    expect(rule).toMatch(/Family Room/);
    expect(rule).toMatch(/Nathan|BMO|CBE/);
    expect(rule).toMatch(/iconic-path/);
  });

  it("scope snapshot stays four-wide spine", () => {
    const snap = iconicScopeSnapshot();
    expect(snap.spineTravelCount).toBe(4);
    expect(snap.parkedIslandCount).toBeGreaterThanOrEqual(9);
    expect(snap.parkedMinigameCount).toBeGreaterThanOrEqual(6);
    expect(snap.freezeLawCount).toBe(4);
  });
});
