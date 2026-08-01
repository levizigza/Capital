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
  piggyScarMemoryLine,
  scarEchoAmbientLine,
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
  // Series leads hold the Memory Courtyard terrace — readable silhouettes.
  if (isSeriesLeadMascot(mascotId)) return "static";
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
    const defaultLines: Record<HarborHour, string> =
      slot.mascotId === "cashwell"
        ? {
            morning: "Cashwell: Extra tall. Extra flash. The Plinth already knows yesterday.",
            midday: "Cashwell: Always up — after you face the Take. Piggy keeps the verbs.",
            afternoon: "Cashwell: Wealth in every detail. Memory Courtyard never forgets a choice.",
            evening: "Cashwell: Time is money. Tip the hat — then tip yourself first.",
          }
        : slot.mascotId === "cashmere"
          ? {
              morning: "Cashmere Couture: Luxury with lineage. The Plinth keeps yesterday tailored.",
              midday: "Cashmere: Style is strategy — Piggy keeps the Harbor verbs.",
              afternoon: "Cashmere: She invests with precision. Memory Courtyard never forgets.",
              evening: "Cashmere: Fortunes flourish around taste. Tip yourself first, darling.",
            }
          : slot.mascotId === "peso_pedro"
            ? {
                morning: "Peso Pedro: Golden charisma — the Plinth already heard yesterday’s fiesta.",
                midday: "Peso Pedro: Small symbol, massive impact. Piggy keeps the Harbor verbs.",
                afternoon: "Peso Pedro: Opportunities into celebrations. Memory Courtyard never forgets.",
                evening: "Peso Pedro: Always in circulation. Tip yourself first — then dance.",
              }
            : {
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
  memory?: { talks?: number; lastChoiceIds?: string[] } | null,
  scarEcho?: {
    label: string;
    dayOffset: "same" | "later";
    organ?: import("./moneyOrgans").MoneyOrganId;
  } | null,
): { position: [number, number, number]; yaw: number; line: string; name: string } {
  const mascot = getMascot(life.mascotId);
  let line = life.lines[hour];
  // Cast-as-memory: plaza locals + Piggy name the scar so Harbor feels haunted by choice
  if (scarEcho?.label && localNamesScarEcho(life.mascotId, hour)) {
    const organ = scarEcho.organ ?? "memory";
    line =
      life.mascotId === "piggy_penny"
        ? piggyScarMemoryLine(scarEcho.label, scarEcho.dayOffset, organ)
        : scarEchoAmbientLine(mascot.name, scarEcho.label, scarEcho.dayOffset, organ);
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
