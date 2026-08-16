/**
 * Knowledge-as-progression — literacy discoveries + fail→hypothesis copy.
 * Canon: GAME_DESIGN_KNOWLEDGE.md
 *
 * Never names the optimal strategy. Failures give observation + open question.
 */

import type { MoneyOrganId } from "./moneyOrgans";
import { organVerbChip } from "./worldMemory";

export type KnowledgeTier =
  | "basic"
  | "intermediate"
  | "advanced"
  | "system"
  | "edge"
  | "meta";

export type KnowledgeDiscoveryId =
  | "money_alive"
  | "commit_sticks"
  | "walk_talk_board"
  | "piggy_points"
  | "one_next_verb"
  | "pouch_vs_scar"
  | "organ_verbs"
  | "hush_then_felt"
  | "plaque_vocabulary"
  | "soft_beat_look"
  | "structure_enter"
  | "quiet_chrome"
  | "equal_forks"
  | "scar_unlocks_next"
  | "day2_echo"
  | "share_is_proof"
  | "organ_aspiration"
  | "weather_stance"
  | "soft_gate_named"
  | "memory_reads_spine"
  | "coinbag_never_races"
  | "structure_fail_stay"
  | "arcade_vs_soft"
  | "era_after_cove"
  | "freedom_is_economy"
  | "double_take_blocked"
  | "mute_still_reads"
  | "reduce_motion"
  | "corrupt_save_boots"
  | "talk_never_ambush"
  | "spend_fail_dignity"
  | "cold_retell_test"
  | "hypothesis_over_spoilers"
  | "depth_before_width"
  | "pass_bar_want"
  | "teach_when_needed";

export type KnowledgeDiscovery = {
  id: KnowledgeDiscoveryId;
  tier: KnowledgeTier;
  /** Kid-facing retell line once earned — never a strategy spoiler. */
  retell: string;
  /** When play naturally exposes this (doc mapping). */
  exposedBy: string;
};

/** Full expert inventory — beginners earn these through play, not menus. */
export const KNOWLEDGE_DISCOVERIES: readonly KnowledgeDiscovery[] = [
  {
    id: "money_alive",
    tier: "basic",
    retell: "Money is alive here.",
    exposedBy: "Ashore Fantasy poke · organ toys",
  },
  {
    id: "commit_sticks",
    tier: "basic",
    retell: "A choice sticks — you cannot put it back.",
    exposedBy: "First Cove Commit",
  },
  {
    id: "walk_talk_board",
    tier: "basic",
    retell: "Walk, Talk when ready, board the lit painting.",
    exposedBy: "Ashore Walk · Talk · Dock",
  },
  {
    id: "piggy_points",
    tier: "basic",
    retell: "Piggy names what changed and what opens next.",
    exposedBy: "Harbor Talk after Change",
  },
  {
    id: "one_next_verb",
    tier: "basic",
    retell: "After a beat, one next verb — not a dashboard.",
    exposedBy: "Quiet plaza after spectacle",
  },
  {
    id: "pouch_vs_scar",
    tier: "basic",
    retell: "Takes cost Memory, not your whole pouch.",
    exposedBy: "First irreversible Take",
  },
  {
    id: "organ_verbs",
    tier: "intermediate",
    retell: "Coin holds · Clock shelters · Spiral withstands · Memory keeps.",
    exposedBy: "Hush lines + Soft Beat + cold retell",
  },
  {
    id: "hush_then_felt",
    tier: "intermediate",
    retell: "Take → hush → Harbor felt that on the Plinth.",
    exposedBy: "Signature loop first time",
  },
  {
    id: "plaque_vocabulary",
    tier: "intermediate",
    retell: "Fork words become plaque lines Harbor can name.",
    exposedBy: "Spectacle shelf + Share",
  },
  {
    id: "soft_beat_look",
    tier: "intermediate",
    retell: "Soft Beat is look and leave — not a second Take.",
    exposedBy: "Lid / Loft / Battlement / Teller",
  },
  {
    id: "structure_enter",
    tier: "intermediate",
    retell: "Money Structures are machines you climb into.",
    exposedBy: "Coin Jar · Payroll Tower · Interest Keep · Ledger Bank",
  },
  {
    id: "quiet_chrome",
    tier: "intermediate",
    retell: "After Memory speaks, chrome stays quiet until Talk.",
    exposedBy: "First meet + homecoming quiet",
  },
  {
    id: "equal_forks",
    tier: "intermediate",
    retell: "Both forks leave Harbor truth — neither is a shame path.",
    exposedBy: "Spender/haste cinema dignity",
  },
  {
    id: "scar_unlocks_next",
    tier: "advanced",
    retell: "A scar lights the next organ painting.",
    exposedBy: "Coin scar → Paycheck; Clock scar → Credit",
  },
  {
    id: "day2_echo",
    tier: "advanced",
    retell: "Yesterday’s plaque still hums on day two.",
    exposedBy: "Day-2 Soft Beat cinema",
  },
  {
    id: "share_is_proof",
    tier: "advanced",
    retell: "Share is Memory’s receipt — Harbor felt that.",
    exposedBy: "Post-spectacle Share PNG",
  },
  {
    id: "organ_aspiration",
    tier: "advanced",
    retell: "Each island remixes the loop with a new organ facet.",
    exposedBy: "Paycheck then Credit chapters",
  },
  {
    id: "weather_stance",
    tier: "advanced",
    retell: "Haste and stance can tint Harbor’s weather and greetings.",
    exposedBy: "Credit haste scar · stance flavor",
  },
  {
    id: "soft_gate_named",
    tier: "advanced",
    retell: "Soft-locks speak organ truth out loud.",
    exposedBy: "Early Credit / painting soft-lock hints",
  },
  {
    id: "memory_reads_spine",
    tier: "system",
    retell: "Harbor Memory reads scars from the whole spine.",
    exposedBy: "Plinth shelf with multiple plaques",
  },
  {
    id: "coinbag_never_races",
    tier: "system",
    retell: "Coin Bag points — it never races ahead alone.",
    exposedBy: "Buddy coach after Ashore",
  },
  {
    id: "structure_fail_stay",
    tier: "system",
    retell: "A soft miss keeps you in the structure.",
    exposedBy: "Structure minigame fail walk label",
  },
  {
    id: "arcade_vs_soft",
    tier: "system",
    retell: "Arcade scores; Soft Beat hushes — same organ, different toys.",
    exposedBy: "Structure pads side by side",
  },
  {
    id: "era_after_cove",
    tier: "system",
    retell: "Era shores open after Cove Change — side stories.",
    exposedBy: "Map side row after Cove scar",
  },
  {
    id: "freedom_is_economy",
    tier: "system",
    retell: "Freedom Seal and quizzes are not organ mastery.",
    exposedBy: "Doc law + quiet chrome after spectacle",
  },
  {
    id: "double_take_blocked",
    tier: "edge",
    retell: "You cannot rewrite a plaque by Taking again.",
    exposedBy: "Second Take attempt on same chapter",
  },
  {
    id: "mute_still_reads",
    tier: "edge",
    retell: "Even muted, the mark and Harbor-felt beats still read.",
    exposedBy: "Mute-test signature cinema",
  },
  {
    id: "reduce_motion",
    tier: "edge",
    retell: "Softer cinema — same hush → felt → share shape.",
    exposedBy: "prefers-reduced-motion / settings",
  },
  {
    id: "corrupt_save_boots",
    tier: "edge",
    retell: "A broken save still boots into Harbor.",
    exposedBy: "Sanitize → playable defaults",
  },
  {
    id: "talk_never_ambush",
    tier: "edge",
    retell: "Talk never starts just because you walked near.",
    exposedBy: "Opt-in Talk (E / Enter / Talk)",
  },
  {
    id: "spend_fail_dignity",
    tier: "edge",
    retell: "Treat-first paths get the same soft-fail dignity.",
    exposedBy: "Spend-flavored minigame fail copy",
  },
  {
    id: "cold_retell_test",
    tier: "meta",
    retell: "Mastery = naming organ + suit verb in kid words.",
    exposedBy: "Cold playtest after Harbor return",
  },
  {
    id: "hypothesis_over_spoilers",
    tier: "meta",
    retell: "Misses give clues — you form the next try.",
    exposedBy: "Fail→hypothesis contract",
  },
  {
    id: "depth_before_width",
    tier: "meta",
    retell: "Master Cove→Harbor before hunting new shores.",
    exposedBy: "Iconic path freeze",
  },
  {
    id: "pass_bar_want",
    tier: "meta",
    retell: "Want another Commit without XP chrome.",
    exposedBy: "Core loop pass bar",
  },
  {
    id: "teach_when_needed",
    tier: "meta",
    retell: "Soft Beat and later organs teach when earned.",
    exposedBy: "Ashore Chamber 00 defer list",
  },
] as const;

export type FailHypothesis = {
  /** What the living world did — visible / audible. */
  observation: string;
  /** Open question — enough for a new hypothesis, never the answer. */
  question: string;
  /** Which discovery this miss is nudging toward. */
  nudges: KnowledgeDiscoveryId;
};

const ORGAN_FAIL: Record<MoneyOrganId, FailHypothesis> = {
  coin: {
    observation: "The jar still rattled after that try — something stayed loose.",
    question: "What was still meant to hold?",
    nudges: "organ_verbs",
  },
  clock: {
    observation: "Payday stamped, but the loft stayed quiet.",
    question: "What was still meant to stay dry?",
    nudges: "organ_verbs",
  },
  spiral: {
    observation: "The coil tightened when the try rushed past.",
    question: "What still needed weighing?",
    nudges: "organ_verbs",
  },
  memory: {
    observation: "Harbor went quiet, but the Plinth stayed dark.",
    question: "What mark was Memory waiting to keep?",
    nudges: "hush_then_felt",
  },
};

const SOURCE_FAIL: Record<string, FailHypothesis> = {
  structure: {
    observation: "The machine hummed — the room did not kick you out.",
    question: "What part still wants another careful try?",
    nudges: "structure_fail_stay",
  },
  soft_beat: {
    observation: "The lookout stayed hush — no new plaque wrote itself.",
    question: "If this is not a Take, what is it for?",
    nudges: "soft_beat_look",
  },
  soft_lock: {
    observation: "The painting stayed dim — the strip would not board yet.",
    question: "Which organ still has no scar for Harbor to feel?",
    nudges: "soft_gate_named",
  },
  double_take: {
    observation: "The plaque is already written. Harbor does not erase.",
    question: "If you cannot rewrite it, what can you still do here?",
    nudges: "double_take_blocked",
  },
};

export function failHypothesisFor(opts: {
  organId?: MoneyOrganId | null;
  source?: "board" | "arcade" | "dialogue" | "qa" | "structure" | "soft_beat" | "soft_lock" | "double_take" | null;
}): FailHypothesis {
  if (opts.source && SOURCE_FAIL[opts.source]) {
    return SOURCE_FAIL[opts.source]!;
  }
  if (opts.organId && ORGAN_FAIL[opts.organId]) {
    return ORGAN_FAIL[opts.organId]!;
  }
  return {
    observation: "Money is alive here — that try did not clear yet.",
    question: "What did the world do that you can use on the next try?",
    nudges: "hypothesis_over_spoilers",
  };
}

/**
 * Player-facing fail hint: observation + question.
 * May include score facts (threshold) — never optimal strategy.
 */
export function knowledgeFailHint(opts: {
  organId?: MoneyOrganId | null;
  source?: "board" | "arcade" | "dialogue" | "qa" | "structure" | null;
  scoreLine?: string | null;
}): string {
  const hypo = failHypothesisFor({
    organId: opts.organId,
    source: opts.source,
  });
  const score = opts.scoreLine?.trim();
  if (score) {
    return `${score} ${hypo.observation} ${hypo.question}`;
  }
  return `${hypo.observation} ${hypo.question}`;
}

/** Spoiler guard — fail copy must never prescribe the optimal fork. */
const SPOILER_PATTERNS = [
  /always choose/i,
  /you should have saved/i,
  /correct answer/i,
  /jar before treat is (right|correct|best)/i,
  /wait(ed)? the spiral is (right|correct|best)/i,
  /never spend/i,
  /optimal/i,
];

export function assertNoStrategySpoiler(text: string): boolean {
  return !SPOILER_PATTERNS.some((re) => re.test(text));
}

export function discoveriesByTier(tier: KnowledgeTier): KnowledgeDiscovery[] {
  return KNOWLEDGE_DISCOVERIES.filter((d) => d.tier === tier);
}

export function discoveryById(id: KnowledgeDiscoveryId): KnowledgeDiscovery | undefined {
  return KNOWLEDGE_DISCOVERIES.find((d) => d.id === id);
}

/** Kid cold-retell line for an organ — mastery proof, not a tip. */
export function organMasteryRetell(organId: MoneyOrganId): string {
  return `The ${organVerbChip(organId)}.`;
}
