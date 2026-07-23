/**
 * Harbor ambient NPC schedules — light GTA-style lives for Money Mascots.
 * Time-of-day slots + one-liners when the Voyager walks near.
 * Motion mix: some locals hold a stall/post (static), others roam (dynamic).
 */

import { HARBOR_LOCAL_CAST, getMascot, type MoneyMascotId } from "./moneyCast";
import { PLAZA_POP_CAMEOS } from "./moneyPopCulture";

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
 * Harbor motion mix — Piggy & even-index locals lean static (readable anchors);
 * odd-index cast wanders so the plaza still feels alive.
 */
function harborMotionForIndex(i: number, mascotId: MoneyMascotId): HarborMotion {
  if (mascotId === "piggy_penny") return "static";
  return i % 2 === 0 ? "static" : "dynamic";
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
      [x + (i % 2 ? 1.8 : -1.5), y, z + 1.2],
      [x - 1.2, y, z + (i % 3 === 0 ? 2.5 : -1.8)],
      [x + 0.8, y, z - 2.0],
    ];
    const defaultLines: Record<HarborHour, string> = {
      morning: `${m.name}: ${m.tagline} Coffee first, then the ledger.`,
      midday: CAMEO_LINES[m.name] ?? `${m.name}: Midday rush — budget before you browse.`,
      afternoon: `${m.name}: Afternoon tip — pay yourself first, then play.`,
      evening: `${m.name}: Harbor lights on. Count today's coins, dream tomorrow's.`,
    };
    const motion = harborMotionForIndex(i, slot.mascotId);
    return {
      mascotId: slot.mascotId,
      home: slot.pos,
      yaw: slot.yaw,
      schedule: {
        // Static keepers stay home all day — schedule still defined for greet lines
        morning: motion === "static" ? slot.pos : drift[0]!,
        midday: motion === "static" ? slot.pos : drift[1]!,
        afternoon: motion === "static" ? slot.pos : drift[2]!,
        evening: motion === "static" ? slot.pos : drift[3]!,
      },
      lines: defaultLines,
      motion,
    };
  });
}

export function harborNpcPose(
  life: HarborNpcLife,
  hour: HarborHour = currentHarborHour(),
): { position: [number, number, number]; yaw: number; line: string; name: string } {
  const mascot = getMascot(life.mascotId);
  return {
    position: life.schedule[hour],
    yaw: life.yaw + (hour === "evening" && life.motion === "dynamic" ? 0.4 : 0),
    line: life.lines[hour],
    name: mascot.name,
  };
}

export const NPC_TALK_RADIUS = 2.4;
