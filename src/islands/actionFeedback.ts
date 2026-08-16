/**
 * Reusable action feedback — layered confirm / economy / progress without copy-paste.
 * See GAME_DESIGN_FEEDBACK.md. Does not replace signature cinema stacks.
 *
 * INPUT → immediate playActionFeedback → juice layers ± Capital SFX → caller does STATE.
 */

import { triggerJuice, type JuiceEvent, type JuiceTriggerOptions } from "@/juice";
import { playCapitalSfx, type CapitalSfxId } from "./audio/capitalSfx";

export type ActionImportance = "micro" | "confirm" | "economy" | "progress" | "signature";

/** Top frequent actions + a few siblings that share the same feel contract. */
export type ActionFeedbackId =
  | "hotspot_activate"
  | "talk_open"
  | "talk_choice"
  | "collect_item"
  | "dice_roll"
  | "deal_accept"
  | "deal_pass"
  | "payday_claim"
  | "shop_purchase"
  | "carpet_rail"
  | "carpet_land"
  | "near_enter"
  | "ritual_open";

export type ActionFeedbackSpec = {
  id: ActionFeedbackId;
  importance: ActionImportance;
  /** Chain note for audits / docs */
  chain: string;
  juice: JuiceEvent | null;
  /** When set, juice SFX is muted so Capital owns the ear */
  capitalSfx?: CapitalSfxId;
  /** Burst particles — default false for frequent actions */
  burst?: boolean;
  /** Nudge viewport (high only via juice) */
  nudge?: boolean;
  /** Min ms between fires for same throttleKey (micro) */
  throttleMs?: number;
};

/** Catalog — single source of truth for frequent-feel. */
export const ACTION_FEEDBACK: Record<ActionFeedbackId, ActionFeedbackSpec> = {
  hotspot_activate: {
    id: "hotspot_activate",
    importance: "confirm",
    chain: "E/click → accept juice → modal/view",
    juice: "accept",
  },
  talk_open: {
    id: "talk_open",
    importance: "confirm",
    chain: "Talk CTA → accept juice → Talk Battle",
    juice: "accept",
  },
  talk_choice: {
    id: "talk_choice",
    importance: "confirm",
    chain: "Reply → accept juice → graph advance",
    juice: "accept",
  },
  collect_item: {
    id: "collect_item",
    importance: "economy",
    chain: "Pick up → reward juice (no shake) → inventory",
    juice: "reward",
    burst: false,
  },
  dice_roll: {
    id: "dice_roll",
    importance: "confirm",
    chain: "Roll → accept juice → dice CSS",
    juice: "accept",
  },
  deal_accept: {
    id: "deal_accept",
    importance: "economy",
    chain: "Buy deal → reward juice → ledger",
    juice: "reward",
    burst: false,
  },
  deal_pass: {
    id: "deal_pass",
    importance: "confirm",
    chain: "Pass → soft accept → patience message",
    juice: "accept",
  },
  payday_claim: {
    id: "payday_claim",
    importance: "economy",
    chain: "Collect Pay Day → reward juice → pouch toast",
    juice: "reward",
    burst: false,
  },
  shop_purchase: {
    id: "shop_purchase",
    importance: "economy",
    chain: "Buy stall item → reward juice → toast",
    juice: "reward",
    burst: false,
  },
  carpet_rail: {
    id: "carpet_rail",
    importance: "confirm",
    chain: "Board rail → accept only (not scar_chime)",
    juice: "accept",
  },
  carpet_land: {
    id: "carpet_land",
    importance: "progress",
    chain: "Land → complete + cheer → arrive",
    juice: "complete",
    capitalSfx: "harbor_cheer",
    burst: false,
  },
  near_enter: {
    id: "near_enter",
    importance: "micro",
    chain: "Enter range → muted accept bounce (throttled)",
    juice: "accept",
    throttleMs: 2000,
  },
  ritual_open: {
    id: "ritual_open",
    importance: "confirm",
    chain: "Open Daily Ritual → accept",
    juice: "accept",
  },
};

const lastFire = new Map<string, number>();

export type PlayActionFeedbackOpts = JuiceTriggerOptions & {
  /** Throttle bucket — defaults to action id */
  throttleKey?: string;
};

/**
 * Play layered feedback for a named frequent action.
 * Call ASAP on INPUT; then mutate state. Safe outside React.
 */
export function playActionFeedback(
  id: ActionFeedbackId,
  opts: PlayActionFeedbackOpts = {},
): boolean {
  const spec = ACTION_FEEDBACK[id];
  if (!spec) return false;

  const throttleKey = opts.throttleKey ?? id;
  const throttleMs = spec.throttleMs ?? 0;
  if (throttleMs > 0) {
    const now = Date.now();
    const prev = lastFire.get(throttleKey) ?? 0;
    if (now - prev < throttleMs) return false;
    lastFire.set(throttleKey, now);
  }

  if (spec.capitalSfx) {
    playCapitalSfx(spec.capitalSfx);
  }

  if (spec.juice) {
    const layers: JuiceTriggerOptions["layers"] = {
      // Avoid double beep when Capital identity SFX owns the ear
      sfx: !spec.capitalSfx,
      motion: true,
      burst: Boolean(spec.burst),
      shake: false,
    };
    triggerJuice(spec.juice, {
      ...opts,
      burst: spec.burst,
      layers,
    });
  }

  return true;
}

/** Reset throttle map (tests). */
export function resetActionFeedbackThrottle(): void {
  lastFire.clear();
}

export function actionFeedbackIds(): ActionFeedbackId[] {
  return Object.keys(ACTION_FEEDBACK) as ActionFeedbackId[];
}

/** Top 10 priority list (docs + tests). */
export const TOP_FREQUENT_ACTIONS: ActionFeedbackId[] = [
  "hotspot_activate",
  "talk_open",
  "talk_choice",
  "collect_item",
  "dice_roll",
  "deal_accept",
  "deal_pass",
  "payday_claim",
  "shop_purchase",
  "carpet_land",
];
