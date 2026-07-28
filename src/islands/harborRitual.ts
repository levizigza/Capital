/**
 * Harbor daily ritual + weekly archipelago challenge.
 * Islands-native retention — not legacy dailyChallenges.
 */

import type { IslandSaveV1 } from "./types";
import { harborScarPlaques } from "./worldMemory";

export type HarborRitualToday = {
  paydayDone?: boolean;
  rumorId?: string;
  rumorSeen?: boolean;
  rewardClaimed?: boolean;
  /** Modal already shown for this day */
  greeted?: boolean;
};

export type WeeklyChallengeId = "talk_three" | "one_payday" | "studio_play";

export type HarborWeeklyChallenge = {
  weekKey: string;
  id: WeeklyChallengeId;
  progress: number;
  target: number;
  done?: boolean;
};

export type HarborRitualState = {
  lastDayKey: string;
  streak: number;
  today: HarborRitualToday;
  weekly?: HarborWeeklyChallenge;
};

const RUMORS = [
  { id: "piggy_wave", text: "Piggy Penny says Coin Bag slept by the dock again — he dreams of carpets." },
  { id: "market_whisper", text: "Pasaran Lane whispers: needs before wants, even on glitter days." },
  { id: "thread_hum", text: "The Fortune Thread hums louder when someone jars before they treat." },
  { id: "debt_fog", text: "Far islands talk of interest storms — haste feeds the Debt Cloud." },
  { id: "studio_spark", text: "Someone left a new painting idea in Vibe Studio — peek the gallery?" },
];

const WEEKLY_ROTATION: Array<{ id: WeeklyChallengeId; target: number; title: string; blurb: string }> = [
  {
    id: "talk_three",
    target: 3,
    title: "Plaza chats",
    blurb: "Talk to 3 Harbor locals this week.",
  },
  {
    id: "one_payday",
    target: 1,
    title: "Ritual Pay Day",
    blurb: "Collect one Harbor Pay Day from the daily ritual.",
  },
  {
    id: "studio_play",
    target: 1,
    title: "Studio voyage",
    blurb: "Play or open one community Studio level.",
  },
];

export function localDayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ISO-ish week key YYYY-Www (Mon-based). */
export function localWeekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function weeklyMeta(id: WeeklyChallengeId) {
  return WEEKLY_ROTATION.find((w) => w.id === id) ?? WEEKLY_ROTATION[0]!;
}

function weekChallengeForKey(weekKey: string): HarborWeeklyChallenge {
  const idx =
    Math.abs(
      [...weekKey].reduce((a, c) => a + c.charCodeAt(0), 0),
    ) % WEEKLY_ROTATION.length;
  const meta = WEEKLY_ROTATION[idx]!;
  return {
    weekKey,
    id: meta.id,
    progress: 0,
    target: meta.target,
    done: false,
  };
}

export function pickDailyRumor(save: IslandSaveV1, dayKey: string): { id: string; text: string } {
  const plaques = harborScarPlaques(save);
  if (plaques.length > 0) {
    const p = plaques[plaques.length - 1]!;
    const scarDay = (p.createdAt || "").slice(0, 10);
    // Day 2+: Harbor still names the plaque — world proved it remembers
    if (scarDay && scarDay < dayKey) {
      return {
        id: `scar_echo_${p.id}`,
        text: `Day-after echo: locals still tip their jars about “${p.label}.” The Plinth did not forget overnight.`,
      };
    }
    return {
      id: `scar_${p.id}`,
      text: `Memory Plinth rumor: “${p.label}” still shapes how locals greet you.`,
    };
  }
  const idx =
    Math.abs([...dayKey].reduce((a, c) => a + c.charCodeAt(0), 0)) % RUMORS.length;
  return RUMORS[idx]!;
}

/** Roll ritual to today / this week. Call on Harbor enter. */
export function syncHarborRitual(save: IslandSaveV1, now = new Date()): IslandSaveV1 {
  const dayKey = localDayKey(now);
  const weekKey = localWeekKey(now);
  const prev = save.harborRitual;
  let ritual: HarborRitualState;

  if (!prev || prev.lastDayKey !== dayKey) {
    const streak =
      prev && consecutiveDay(prev.lastDayKey, dayKey)
        ? (prev.streak || 0) + 1
        : 1;
    const rumor = pickDailyRumor(save, dayKey);
    ritual = {
      lastDayKey: dayKey,
      streak,
      today: {
        rumorId: rumor.id,
        paydayDone: false,
        rumorSeen: false,
        rewardClaimed: false,
        greeted: false,
      },
      weekly:
        prev?.weekly?.weekKey === weekKey
          ? prev.weekly
          : weekChallengeForKey(weekKey),
    };
  } else {
    ritual = {
      ...prev,
      weekly:
        prev.weekly?.weekKey === weekKey
          ? prev.weekly
          : weekChallengeForKey(weekKey),
    };
  }

  return { ...save, harborRitual: ritual };
}

function consecutiveDay(prevKey: string, todayKey: string): boolean {
  const prev = parseDay(prevKey);
  const today = parseDay(todayKey);
  if (!prev || !today) return false;
  const diff = (today.getTime() - prev.getTime()) / 86400000;
  return diff === 1;
}

function parseDay(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function dailyRumorText(save: IslandSaveV1): string {
  const ritual = save.harborRitual;
  if (!ritual?.today.rumorId) {
    return pickDailyRumor(save, localDayKey()).text;
  }
  if (ritual.today.rumorId.startsWith("scar_")) {
    return pickDailyRumor(save, ritual.lastDayKey).text;
  }
  return RUMORS.find((r) => r.id === ritual.today.rumorId)?.text
    ?? pickDailyRumor(save, ritual.lastDayKey).text;
}

/** Tiny non-P2W reward for completing the daily triad. */
export const DAILY_RITUAL_REWARD_COINS = 5;

export function markRitualGreeted(save: IslandSaveV1): IslandSaveV1 {
  if (!save.harborRitual) return save;
  return {
    ...save,
    harborRitual: {
      ...save.harborRitual,
      today: { ...save.harborRitual.today, greeted: true },
    },
  };
}

export function markRumorSeen(save: IslandSaveV1): IslandSaveV1 {
  if (!save.harborRitual) return save;
  return {
    ...save,
    harborRitual: {
      ...save.harborRitual,
      today: { ...save.harborRitual.today, rumorSeen: true },
    },
  };
}

export function markPaydayDone(save: IslandSaveV1): IslandSaveV1 {
  if (!save.harborRitual) return save;
  let weekly = save.harborRitual.weekly;
  if (weekly && weekly.id === "one_payday" && !weekly.done) {
    const progress = Math.min(weekly.target, weekly.progress + 1);
    weekly = { ...weekly, progress, done: progress >= weekly.target };
  }
  return {
    ...save,
    harborRitual: {
      ...save.harborRitual,
      today: { ...save.harborRitual.today, paydayDone: true },
      weekly,
    },
  };
}

export function markRewardClaimed(save: IslandSaveV1): IslandSaveV1 {
  if (!save.harborRitual) return save;
  return {
    ...save,
    harborRitual: {
      ...save.harborRitual,
      today: { ...save.harborRitual.today, rewardClaimed: true },
    },
  };
}

export function bumpWeeklyTalk(save: IslandSaveV1): IslandSaveV1 {
  const weekly = save.harborRitual?.weekly;
  if (!weekly || weekly.id !== "talk_three" || weekly.done) return save;
  const progress = Math.min(weekly.target, weekly.progress + 1);
  return {
    ...save,
    harborRitual: {
      ...save.harborRitual!,
      weekly: { ...weekly, progress, done: progress >= weekly.target },
    },
  };
}

export function bumpWeeklyStudio(save: IslandSaveV1): IslandSaveV1 {
  const weekly = save.harborRitual?.weekly;
  if (!weekly || weekly.id !== "studio_play" || weekly.done) return save;
  const progress = Math.min(weekly.target, weekly.progress + 1);
  return {
    ...save,
    harborRitual: {
      ...save.harborRitual!,
      weekly: { ...weekly, progress, done: progress >= weekly.target },
    },
  };
}

export function weeklyShareText(weekly: HarborWeeklyChallenge, voyagerName: string): string {
  const meta = weeklyMeta(weekly.id);
  if (weekly.done) {
    return `${voyagerName} cleared Harbor weekly: ${meta.title} (${weekly.progress}/${weekly.target}) in Capital!`;
  }
  return `${voyagerName} is chasing Harbor weekly: ${meta.title} — ${weekly.progress}/${weekly.target}`;
}

export function ritualNeedsAttention(save: IslandSaveV1): boolean {
  const t = save.harborRitual?.today;
  if (!t) return true;
  return !t.paydayDone || !t.rumorSeen || !t.rewardClaimed;
}
