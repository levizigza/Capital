import { nextMainCourseStep } from "../mainCourse";
import { ensureLedger, netCashflow } from "../voyagerLedger";
import { getConceptDef, getConceptPhase } from "../conceptProgression";
import { HUB_ISLAND_ID } from "../islandIds";
import { getIslandById } from "../content/loader";
import type { IslandSaveV1, IslandsContent } from "../types";
import type { ReturningBriefing } from "./types";

function formatConceptLabel(conceptId: string): string {
  return conceptId.replace(/_/g, " ");
}

function recentMajorEvents(save: IslandSaveV1): string[] {
  const lines: string[] = [];
  const home = save.harborHomecoming;
  if (home?.pending && !home.celebrated) {
    lines.push("Harbor is waiting to celebrate a chapter homecoming.");
  } else if (home?.celebrated) {
    lines.push("You recently returned from a chapter — Harbor remembers.");
  }
  const scars = save.harborScars ?? [];
  if (scars.length > 0) {
    const last = scars[scars.length - 1]!;
    lines.push(`Latest Harbor scar: ${last.label ?? last.id}.`);
  }
  const events = save.eventHistory ?? [];
  if (events.length > 0) {
    const last = events[events.length - 1]!;
    lines.push(`Recent scenario: ${last.eventId} (${last.deckId}).`);
  }
  if (save.chapterQuietPending) {
    lines.push("Quiet mode — a Take is still settling. Walk or travel when ready.");
  }
  return lines.slice(0, 4);
}

function newlyIntroducedSystems(save: IslandSaveV1): string[] {
  const seenAt = save.playerOnboarding?.systemsSeenAt ?? {};
  const out: string[] = [];
  const concepts = save.conceptProgress?.concepts ?? {};
  for (const [id, entry] of Object.entries(concepts)) {
    if (!entry) continue;
    const phase = entry.phase;
    if (phase === "LOCKED" || phase === "AVAILABLE") continue;
    const def = getConceptDef(id);
    if (!def) continue;
    const firstSeen = seenAt[id] ?? entry.guidedEnteredAt ?? entry.lastTransitionAt;
    const lastActive = save.playerOnboarding?.lastActiveAt;
    if (lastActive && firstSeen && Date.parse(firstSeen) > Date.parse(lastActive)) {
      out.push(`${formatConceptLabel(id)} — ${def.instruction}`);
    } else if (!lastActive && phase === "GUIDED") {
      out.push(`${formatConceptLabel(id)} — ${def.instruction}`);
    }
  }
  if (out.length === 0) {
    for (const [id, entry] of Object.entries(concepts)) {
      if (entry?.phase === "GUIDED" || entry?.phase === "REDUCED_GUIDANCE") {
        const def = getConceptDef(id);
        if (def) out.push(`${formatConceptLabel(id)} — ${def.instruction}`);
      }
    }
  }
  return out.slice(0, 5);
}

export function buildReturningBriefing(
  save: IslandSaveV1,
  content: IslandsContent,
): ReturningBriefing {
  const islandId = save.currentIslandId ?? HUB_ISLAND_ID;
  const island = getIslandById(content, islandId);
  const placeName = island?.name ?? "Fortune Archipelago";
  const area =
    island?.areas.find((a) => a.id === save.currentAreaId)?.name ?? "shore";

  const next = nextMainCourseStep(save);
  const ledger = ensureLedger(save.voyagerLedger);
  const cashflow = netCashflow(ledger);

  const sections: ReturningBriefing["sections"] = [
    {
      id: "situation",
      title: "Where you are",
      body: `${placeName} · ${area}. Your Voyager ${
        save.character?.name ?? "is ready"
      } — Harbor kept your story.`,
    },
    {
      id: "objectives",
      title: "Current objectives",
      body: next
        ? `${next.title}: ${next.blurb}`
        : "Main course complete — explore side tomfoolery or replay paintings for mastery.",
    },
    {
      id: "financial",
      title: "Financial state",
      body: `Monthly cashflow ${cashflow >= 0 ? "+" : ""}${cashflow} · Pay Day streak ${
        ledger.positivePaydayStreak
      }${ledger.harborEscaped ? " · Harbor escape earned." : " · Still in Harbor Grind."}`,
    },
  ];

  const events = recentMajorEvents(save);
  if (events.length > 0) {
    sections.push({
      id: "events",
      title: "Recent major events",
      body: events.join(" "),
    });
  }

  const systems = newlyIntroducedSystems(save);
  if (systems.length > 0) {
    sections.push({
      id: "systems",
      title: "New or active systems",
      body: systems.join(" · "),
    });
  }

  const refreshers: ReturningBriefing["refreshers"] = [
    { id: "ashore", label: "Replay walk & talk chambers", action: "ashore_chambers" },
    { id: "controls", label: "Show control hints", action: "controls_hint" },
    { id: "ledger", label: "Open Voyager Ledger", action: "ledger_hud" },
  ];

  return {
    mode: "returning",
    headline: "Welcome back",
    sections,
    refreshers,
  };
}

/** Stamp concept first-seen times for returning “new systems” detection. */
export function syncSystemsSeenAt(save: IslandSaveV1, now = new Date().toISOString()): IslandSaveV1 {
  const concepts = save.conceptProgress?.concepts ?? {};
  const prev = save.playerOnboarding?.systemsSeenAt ?? {};
  const nextSeen = { ...prev };
  for (const [id, entry] of Object.entries(concepts)) {
    if (!entry) continue;
    const phase = getConceptPhase(save, id);
    if (phase === "LOCKED" || phase === "AVAILABLE") continue;
    if (!nextSeen[id]) {
      nextSeen[id] = entry.guidedEnteredAt ?? entry.lastTransitionAt ?? now;
    }
  }
  return {
    ...save,
    playerOnboarding: {
      version: 1,
      ...save.playerOnboarding,
      systemsSeenAt: nextSeen,
    },
  };
}
