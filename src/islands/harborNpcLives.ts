/**
 * Harbor ambient NPC schedules — light GTA-style lives for Money Mascots.
 * Time-of-day slots + one-liners when the Voyager walks near.
 * Motion mix: some locals hold a stall/post (static), others roam (dynamic).
 */

import {
  HARBOR_LOCAL_CAST,
  getMascot,
  isSeriesLeadMascot,
  type MoneyMascotId,
} from "./moneyCast";
import { PLAZA_POP_CAMEOS } from "./moneyPopCulture";
import {
  localNamesScarEcho,
  pickRotatingAliveStreetLine,
  piggyScarMemoryLine,
  type AliveStreetScarEcho,
} from "./worldMemory";

export type HarborHour = "morning" | "midday" | "afternoon" | "evening";

/** Static = tableau keeper; dynamic = Unity Behavior wander + schedule */
export type HarborMotion = "static" | "dynamic";

export type HarborNpcLife = {
  mascotId: MoneyMascotId;
  /** Base plaza slot from HARBOR_LOCAL_CAST */
  home: [number, number, number];
  yaw: number;
  /** Where they drift during each slice of the day */
  schedule: Record<HarborHour, [number, number, number]>;
  lines: Record<HarborHour, string>;
  /** Still vs roaming — Harbor is a mixed Ordinary World */
  motion: HarborMotion;
  /** Short tip-hat ambient (series leads) when no scar echo */
  ambientNear?: string;
};

const CAMEO_LINES: Record<string, string> = Object.fromEntries(
  PLAZA_POP_CAMEOS.map((c) => [c.name, c.line]),
);

function hourFromClock(ms = Date.now()): HarborHour {
  const h = new Date(ms).getHours();
  if (h < 11) return "morning";
  if (h < 15) return "midday";
  if (h < 19) return "afternoon";
  return "evening";
}

/** Export for tests / HUD */
export function currentHarborHour(): HarborHour {
  return hourFromClock();
}

/**
 * Harbor motion mix — Piggy holds the fountain; series leads micro-sway on the
 * terrace (static agents, tiny schedule); most plaza locals roam so streets feel alive.
 */
function harborMotionForIndex(i: number, mascotId: MoneyMascotId): HarborMotion {
  if (mascotId === "piggy_penny") return "static";
  // Series leads hold the Memory Courtyard terrace — readable silhouettes.
  if (isSeriesLeadMascot(mascotId)) return "static";
  // ~2/3 of remaining locals wander (GTA4 bar density)
  return i % 3 === 0 ? "static" : "dynamic";
}

/** Tiny terrace sway for tip-hat leads — alive without leaving the courtyard. */
function seriesLeadTerraceDrift(
  pos: [number, number, number],
  i: number,
): Record<HarborHour, [number, number, number]> {
  const [x, y, z] = pos;
  const a = (i % 4) * 0.35;
  return {
    morning: [x, y, z],
    midday: [x + 0.45 + a * 0.1, y, z + 0.35],
    afternoon: [x - 0.35, y, z + 0.55 + a * 0.08],
    evening: [x + 0.25, y, z - 0.4],
  };
}

function seriesLeadHourLines(
  ambientNear: string | undefined,
  name: string,
): Record<HarborHour, string> {
  const near =
    ambientNear ??
    `${name}: Tip the hat — Memory Courtyard keeps the receipt.`;
  // Same short tip-hat line across the day — when near, streets feel authored.
  return {
    morning: near,
    midday: near,
    afternoon: near,
    evening: near,
  };
}

/**
 * Build living locals from the harbor cast.
 * Positions shift by time-of-day; lines teach a tiny money beat.
 */
export function buildHarborNpcLives(): HarborNpcLife[] {
  return HARBOR_LOCAL_CAST.map((slot, i) => {
    const m = getMascot(slot.mascotId);
    const [x, y, z] = slot.pos;
    // Small schedule offsets so they migrate around shops / dock / market
    const drift: [number, number, number][] = [
      [x, y, z],
      [x + (i % 2 ? 2.2 : -1.9), y, z + 1.6],
      [x - 1.6, y, z + (i % 3 === 0 ? 3.0 : -2.2)],
      [x + 1.1, y, z - 2.4],
    ];
    const motion = harborMotionForIndex(i, slot.mascotId);
    const lead = isSeriesLeadMascot(slot.mascotId);
    const defaultLines: Record<HarborHour, string> = lead
      ? seriesLeadHourLines(slot.ambientNear, m.name)
      : {
          morning: `${m.name}: ${m.tagline} Coffee first, then the ledger.`,
          midday: CAMEO_LINES[m.name] ?? `${m.name}: Midday rush — budget before you browse.`,
          afternoon: `${m.name}: Afternoon tip — pay yourself first, then play.`,
          evening: `${m.name}: Harbor lights on. Count today's coins, dream tomorrow's.`,
        };
    const schedule: Record<HarborHour, [number, number, number]> = lead
      ? seriesLeadTerraceDrift(slot.pos, i)
      : {
          morning: motion === "static" ? slot.pos : drift[0]!,
          midday: motion === "static" ? slot.pos : drift[1]!,
          afternoon: motion === "static" ? slot.pos : drift[2]!,
          evening: motion === "static" ? slot.pos : drift[3]!,
        };
    return {
      mascotId: slot.mascotId,
      home: slot.pos,
      yaw: slot.yaw,
      schedule,
      lines: defaultLines,
      motion,
      ambientNear: slot.ambientNear,
    };
  });
}

export function harborNpcPose(
  life: HarborNpcLife,
  hour: HarborHour = currentHarborHour(),
  memory?: { talks?: number; lastChoiceIds?: string[] } | null,
  scarEcho?: AliveStreetScarEcho | null,
): { position: [number, number, number]; yaw: number; line: string; name: string } {
  const mascot = getMascot(life.mascotId);
  let line = life.lines[hour];
  // Cast-as-memory: plaza locals + Piggy name the scar so Harbor feels haunted by choice
  if (scarEcho?.label && localNamesScarEcho(life.mascotId, hour)) {
    const organ = scarEcho.organ ?? "memory";
    line =
      life.mascotId === "piggy_penny"
        ? piggyScarMemoryLine(scarEcho.label, scarEcho.dayOffset, organ)
        : pickRotatingAliveStreetLine(life.mascotId, mascot.name, hour, {
            label: scarEcho.label,
            dayOffset: scarEcho.dayOffset,
            organ,
          });
  } else if (life.ambientNear && isSeriesLeadMascot(life.mascotId)) {
    // Tip-hat series leads — short ambient when near (no scar)
    line = life.ambientNear;
  } else if (memory && (memory.talks ?? 0) >= 1) {
    const last = memory.lastChoiceIds?.at(-1);
    if (last) {
      line = `${mascot.name}: I remember you chose “${last}”. ${line.includes(": ") ? line.split(": ").slice(1).join(": ") : line}`;
    } else if ((memory.talks ?? 0) >= 2) {
      line = `${mascot.name}: Good to see you again (${memory.talks} chats). ${line.includes(": ") ? line.split(": ").slice(1).join(": ") : line}`;
    }
  }
  return {
    position: life.schedule[hour],
    yaw: life.yaw + (hour === "evening" && life.motion === "dynamic" ? 0.4 : 0),
    line,
    name: mascot.name,
  };
}

export const NPC_TALK_RADIUS = 2.4;
