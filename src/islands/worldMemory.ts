/**
 * World memory — irreversible choices, Harbor scars, stance, light NPC recall.
 * Additive on IslandSaveV1 (version stays "1").
 * Wave 7 — cold retell: every plaque names its money organ.
 */

import type { IslandSaveV1 } from "./types";
import type { MoneyOrganId } from "./moneyOrgans";

export type HarborScarKind = "plaque" | "npc_tone" | "plaza_prop";

export type HarborScar = {
  id: string;
  islandId: string;
  choiceId: string;
  label: string;
  kind: HarborScarKind;
  createdAt: string;
};

export type IrreversibleChoiceRecord = {
  choiceId: string;
  label: string;
  islandId: string;
  at: string;
};

export type VoyagerStance = {
  saver: number;
  spender: number;
  risk: number;
};

export type StanceAxis = keyof VoyagerStance;

export type NpcMemoryEntry = {
  talks: number;
  lastChoiceIds: string[];
  affinity?: number;
  lastTalkAt?: string;
};

export const DEFAULT_STANCE: VoyagerStance = { saver: 0, spender: 0, risk: 0 };

export function ensureStance(stance?: VoyagerStance | null): VoyagerStance {
  return {
    saver: stance?.saver ?? 0,
    spender: stance?.spender ?? 0,
    risk: stance?.risk ?? 0,
  };
}

export function dominantStance(
  stance?: VoyagerStance | null,
): "saver" | "spender" | "risk" | "balanced" {
  const s = ensureStance(stance);
  const max = Math.max(s.saver, s.spender, s.risk);
  if (max <= 0) return "balanced";
  const leaders = (["saver", "spender", "risk"] as const).filter((k) => s[k] === max);
  return leaders.length === 1 ? leaders[0]! : "balanced";
}

export function applyStanceDelta(
  stance: VoyagerStance | null | undefined,
  axis: StanceAxis,
  delta: number,
): VoyagerStance {
  const next = ensureStance(stance);
  next[axis] = Math.max(0, next[axis] + delta);
  return next;
}

/** True if this decision key was already locked forever. */
export function hasIrreversible(save: IslandSaveV1, key: string): boolean {
  return Boolean(save.irreversibleChoices?.[key]);
}

export function recordIrreversible(
  save: IslandSaveV1,
  key: string,
  record: IrreversibleChoiceRecord,
): IslandSaveV1 {
  if (save.irreversibleChoices?.[key]) return save;
  return {
    ...save,
    irreversibleChoices: {
      ...(save.irreversibleChoices ?? {}),
      [key]: record,
    },
  };
}

export function addHarborScar(save: IslandSaveV1, scar: HarborScar): IslandSaveV1 {
  const existing = save.harborScars ?? [];
  if (existing.some((s) => s.id === scar.id)) return save;
  return {
    ...save,
    harborScars: [...existing, scar].slice(-24),
  };
}

export function recordNpcTalk(
  save: IslandSaveV1,
  npcId: string,
  choiceId?: string,
): IslandSaveV1 {
  const prev = save.npcMemory?.[npcId];
  const lastChoiceIds = [...(prev?.lastChoiceIds ?? [])];
  if (choiceId) {
    lastChoiceIds.push(choiceId);
    while (lastChoiceIds.length > 8) lastChoiceIds.shift();
  }
  return {
    ...save,
    npcMemory: {
      ...(save.npcMemory ?? {}),
      [npcId]: {
        talks: (prev?.talks ?? 0) + 1,
        lastChoiceIds,
        affinity: (prev?.affinity ?? 0) + (choiceId ? 1 : 0),
        lastTalkAt: new Date().toISOString(),
      },
    },
  };
}

/** Kid-facing plaque line for the oldest-to-newest scars (newest last). */
export function harborScarPlaques(save: IslandSaveV1): HarborScar[] {
  return (save.harborScars ?? []).filter((s) => s.kind === "plaque" || s.kind === "plaza_prop");
}

/**
 * Side digressions (Shell Want, Collector Rumor, …) land as npc_tone gossip scars —
 * not Plinth plaques, but plaza locals still name them (GTA4 alive streets).
 */
export function isDigressionScar(scar: Pick<HarborScar, "id" | "kind">): boolean {
  if (scar.kind === "npc_tone") return true;
  const id = scar.id.toLowerCase();
  return (
    id.startsWith("cc_shell_") ||
    id.startsWith("ck_collector_") ||
    id.includes("shell_patience") ||
    id.includes("shell_impulse") ||
    id.includes("collector_rumor")
  );
}

/**
 * Scars plaza Talk Battles may name — spine plaques plus digression gossip.
 * Keeps spectacle/Plinth on plaques only via harborScarPlaques.
 */
export function harborTalkScars(save: IslandSaveV1): HarborScar[] {
  return (save.harborScars ?? []).filter(
    (s) => s.kind === "plaque" || s.kind === "plaza_prop" || isDigressionScar(s),
  );
}

/** Chapter shelf name for Memory Plinth grouping. */
export function scarChapterTitle(scar: HarborScar): string {
  const id = `${scar.id} ${scar.islandId}`.toLowerCase();
  // Digression ids: cc_shell_* (Cove), ck_collector_* (Credit) — no "cove"/"credit" substring.
  if (
    id.includes("cove") ||
    id.includes("cc_shell") ||
    scar.islandId === "coincraft_cove"
  ) {
    return "Coincraft Cove";
  }
  if (id.includes("pp_") || id.includes("paycheck") || scar.islandId === "paycheck_peninsula") {
    return "Paycheck Peninsula";
  }
  if (
    id.includes("credit") ||
    id.includes("ck_collector") ||
    scar.islandId === "credit_kingdom"
  ) {
    return "Credit Kingdom";
  }
  return "Harbor memory";
}

/** Wave 7 — which organ a plaque belongs to (cold retell). */
export function scarOrganId(scar: Pick<HarborScar, "id" | "islandId">): MoneyOrganId {
  const ch = scarChapterTitle(scar as HarborScar);
  if (ch === "Paycheck Peninsula") return "clock";
  if (ch === "Credit Kingdom") return "spiral";
  if (ch === "Coincraft Cove") return "coin";
  return "memory";
}

export function scarOrganName(organ: MoneyOrganId): string {
  if (organ === "coin") return "Coin";
  if (organ === "clock") return "Clock";
  if (organ === "spiral") return "Spiral";
  return "Memory";
}

/**
 * Suit verb that must survive Take → Harbor (Pillar 5 progression).
 * Coin holds · Clock shelters · Spiral withstands · Memory keeps.
 */
export function organSuitVerb(organ: MoneyOrganId): string {
  if (organ === "clock") return "shelters";
  if (organ === "spiral") return "withstands";
  if (organ === "memory") return "keeps";
  return "holds";
}

/** Short organ+verb chip — “Coin holds”. */
export function organVerbChip(organ: MoneyOrganId): string {
  return `${scarOrganName(organ)} ${organSuitVerb(organ)}`;
}

/**
 * After a spine Take lands at Harbor — what painting is newly boardable?
 * Ability/story/space progression kids can point at without opening a ledger.
 */
export function nextPaintingAfterScar(
  scar: Pick<HarborScar, "id" | "islandId">,
): string | null {
  const organ = scarOrganId(scar);
  if (organ === "coin") return "Paycheck Peninsula";
  if (organ === "clock") return "Credit Kingdom";
  return null;
}

/**
 * Plaque-free kid sentence per organ (Pillar 12).
 * One mythology — suit verb only; never Harmon jargon as organ names.
 */
export function coldOrganKidSentence(organ: MoneyOrganId): string {
  if (organ === "clock") {
    return "The Clock shelters — wait under the umbrella before glitter.";
  }
  if (organ === "spiral") {
    return "The Spiral withstands — wait beats haste on the interest wall.";
  }
  if (organ === "memory") {
    return "Memory keeps — Harbor remembers your Take on the Plinth.";
  }
  return "The Coin holds — save a little; the jar still waits.";
}

/** One kid-facing sentence after a cold play — organ verb + plaque with story weight. */
export function coldRetellLine(scar: Pick<HarborScar, "id" | "islandId" | "label">): string {
  const organ = scarOrganId(scar);
  const verb = organVerbChip(organ);
  if (organ === "clock") {
    return `You chose under the Clock — “${scar.label}.” Harbor still feels the shelter (or the rain).`;
  }
  if (organ === "spiral") {
    return `You faced the Spiral — “${scar.label}.” Interest doesn’t yell; Harbor still hears it.`;
  }
  if (organ === "memory") {
    return `Memory keeps the mark — “${scar.label}.” The Plinth will not forget.`;
  }
  return `You chose with the Coin — “${scar.label}.” Harbor remembered. The ${verb}.`;
}

/** Plinth billboard / modal row — organ verb first so the suit sticks. */
export function plaqueShelfLine(scar: Pick<HarborScar, "id" | "islandId" | "label">): string {
  const organ = scarOrganId(scar);
  return `${organVerbChip(organ)} · ${scar.label}`;
}

/**
 * Spectacle headline — same suit-verb mythology as cold retell.
 * Never “Coin Change” vs “Clock Take” (that invents a second cosmos).
 */
export function coldSpectacleHeadline(scar: Pick<HarborScar, "id" | "islandId" | "label">): string {
  const organ = scarOrganId(scar);
  const verb = organVerbChip(organ);
  if (organ === "clock") return `Harbor felt that — rain or shelter · ${verb}`;
  if (organ === "spiral") return `Harbor felt that — wait or haste · ${verb}`;
  if (organ === "memory") return `Harbor felt that — ${verb}`;
  return `Harbor felt that — jar or treat · ${verb}`;
}

/** Suit-verb hush after Take — Coin holds · Clock shelters · Spiral withstands. */
export function organTakeHushLine(organ: MoneyOrganId): string {
  if (organ === "clock") return "The Clock shelters. Harbor is already listening.";
  if (organ === "spiral") return "The Spiral withstands. Harbor is already listening.";
  if (organ === "memory") return "Memory keeps the mark. Harbor is already listening.";
  return "The Coin holds. Harbor is already listening.";
}

/** Shore quiet badge after irreversible Take — suit verb, never “Coin Take”. */
export function organQuietBadge(organ: MoneyOrganId): string {
  return `Quiet — ${organVerbChip(organ)}`;
}

/** Day-2 cinema body — lead with suit verb so cold kids can retell. */
export function day2EchoBody(scarLabel: string, organ: MoneyOrganId): string {
  const chip = organVerbChip(organ);
  if (organ === "clock") {
    return `The ${chip} — locals still stamp “${scarLabel}.” Yesterday sticks as today’s weather.`;
  }
  if (organ === "spiral") {
    return `The ${chip} — locals still weigh “${scarLabel}.” Yesterday sticks as today’s weather.`;
  }
  if (organ === "memory") {
    return `${chip} — locals still name “${scarLabel}” on the Plinth. Yesterday sticks as today’s weather.`;
  }
  return `The ${chip} — locals still tip their jars about “${scarLabel}.” Yesterday sticks as today’s weather.`;
}

/** Daily Harbor rumor that carries the organ word. */
export function scarRumorLine(
  scar: Pick<HarborScar, "id" | "islandId" | "label">,
  kind: "same" | "later",
): string {
  const organ = scarOrganName(scarOrganId(scar));
  if (kind === "later") {
    return `Day-after echo: the ${organ} still names “${scar.label}.” The Plinth did not forget overnight.`;
  }
  return `Memory Plinth rumor: the ${organ} — “${scar.label}” — still shapes how locals greet you.`;
}

export function groupScarsByChapter(
  scars: HarborScar[],
): { chapter: string; scars: HarborScar[] }[] {
  const order = ["Coincraft Cove", "Paycheck Peninsula", "Credit Kingdom", "Harbor memory"];
  const map = new Map<string, HarborScar[]>();
  for (const s of scars) {
    const ch = scarChapterTitle(s);
    const list = map.get(ch) ?? [];
    list.push(s);
    map.set(ch, list);
  }
  return order
    .filter((ch) => map.has(ch))
    .map((ch) => ({ chapter: ch, scars: map.get(ch)! }));
}

/** True if this scar should trigger an in-chapter quiet beat. */
export function scarTriggersChapterQuiet(scarId: string): boolean {
  return (
    scarId.startsWith("cove_") ||
    scarId.startsWith("pp_") ||
    scarId.startsWith("credit_")
  );
}

/** Ambient plaza line when Harbor still carries yesterday’s plaque. */
export function scarEchoAmbientLine(
  mascotName: string,
  scarLabel: string,
  dayOffset: "same" | "later",
  organ: MoneyOrganId = "memory",
): string {
  const organWord = scarOrganName(organ);
  if (dayOffset === "later") {
    return `${mascotName}: Still thinking about the ${organWord} — “${scarLabel}.” Money left footprints.`;
  }
  return `${mascotName}: The Plinth just got a ${organWord} mark — “${scarLabel}.” Harbor felt that.`;
}

/** Piggy always names the scar — living conscience, not a prop. */
export function piggyScarMemoryLine(
  scarLabel: string,
  dayOffset: "same" | "later",
  organ: MoneyOrganId = "memory",
): string {
  const chip = organVerbChip(organ);
  if (dayOffset === "later") {
    return `Piggy Penny: Still here — the ${chip} did not wash out. “${scarLabel}.”`;
  }
  return `Piggy Penny: Harbor felt that — the ${chip}. “${scarLabel}.” I’m proud you came home changed.`;
}

/**
 * Plaza gossip opener — living receipt (GTA4 bar), not a tip list.
 * Digression scars get specific rumor beats; spine plaques get organ-true haunt.
 */
export function plazaScarGossipLine(
  scar: Pick<HarborScar, "id" | "islandId" | "label" | "kind">,
  opts?: { talks?: number; stanceHint?: string | null },
): string {
  const talks =
    (opts?.talks ?? 0) >= 2 ? `We’ve talked ${opts!.talks} times — ` : "";
  const stanceBit = opts?.stanceHint ? ` ${opts.stanceHint}` : "";
  const id = scar.id.toLowerCase();

  if (id.includes("shell_patience") || id === "cc_shell_patience") {
    return `${talks}Fountain crowd still whispers it — you left Shelly’s shell on the stall. “${scar.label}.” Want waited; Harbor noticed.${stanceBit}`;
  }
  if (id.includes("shell_impulse") || id === "cc_shell_impulse") {
    return `${talks}Someone at the tip jars keeps clinking your name — you bought Shelly’s shell want. “${scar.label}.” Pretty cost a story.${stanceBit}`;
  }
  if (id.includes("collector_rumor") || id === "ck_collector_rumor") {
    return `${talks}Canyon wind carried it here — you stood in the Collector’s pitch. “${scar.label}.” Listening isn’t paying, but Harbor still gossiped.${stanceBit}`;
  }
  if (id.includes("signal_listen") || id === "sc_signal_listen") {
    return `${talks}Reef lights still blink your name — you listened on Phosphor before you rushed. “${scar.label}.” Free roam left a footprint.${stanceBit}`;
  }
  if (id.includes("foundry_listen") || id === "vf_foundry_listen") {
    return `${talks}Neon Workshop still hums your name — you wandered Gridlock before you pitched. “${scar.label}.” Digression left a footprint.${stanceBit}`;
  }
  if (id.includes("portfolio_peek") || id === "fa_portfolio_peek") {
    return `${talks}Market Street still tips about it — you peeked at the boards before you traded. “${scar.label}.” Free roam left a footprint.${stanceBit}`;
  }
  if (id.includes("wharf_listen") || id === "da_wharf_listen") {
    return `${talks}Wallet Wharf still clicks your name — you listened before you signed keys. “${scar.label}.” Digression left a footprint.${stanceBit}`;
  }
  if (id.includes("shop_browse") || id === "ba_shop_browse") {
    return `${talks}Keep aisles still murmur it — you browsed the shop floor before you stocked. “${scar.label}.” Free roam left a footprint.${stanceBit}`;
  }
  if (id.includes("ip_glance") || id === "in_ip_glance") {
    return `${talks}Gallery glass still names you — you glanced at IP before you filed. “${scar.label}.” Digression left a footprint.${stanceBit}`;
  }
  if (id.includes("scaffold_look") || id === "fs_scaffold_look") {
    return `${talks}Scaffold poles still lean your way — you looked before you claimed a plot. “${scar.label}.” Free roam left a footprint.${stanceBit}`;
  }
  if (id.includes("auction_watch") || id === "re_auction_watch") {
    return `${talks}Auction Yard still hammers soft about it — you watched before you bid. “${scar.label}.” Digression left a footprint.${stanceBit}`;
  }

  if (isDigressionScar(scar)) {
    return `${talks}Side-street rumor: “${scar.label}.” Not a Plinth plaque — still a footprint on the plaza.${stanceBit}`;
  }

  const organ = scarOrganName(scarOrganId(scar));
  const habit =
    organ === "Clock"
      ? "still stamp about"
      : organ === "Spiral"
        ? "still weigh"
        : organ === "Memory"
          ? "still name"
          : "still tip jars about";
  return `${talks}Folks ${habit} the ${organ} — “${scar.label}” — on the Plinth. Money left footprints.${stanceBit}`;
}

/**
 * Piggy names a scar with emotional weight (TLOU2 / GotS) — short, not lecture-y.
 * Digressions = quiet conscience; plaques = Plinth bond.
 */
export function piggyScarWeightLine(
  scar: Pick<HarborScar, "id" | "islandId" | "label" | "kind">,
): string {
  const id = scar.id.toLowerCase();
  if (id.includes("shell_patience") || id === "cc_shell_patience") {
    return `I heard about Shelly’s stall. Leaving a want on the wood… that quiet sticks. “${scar.label}.”`;
  }
  if (id.includes("shell_impulse") || id === "cc_shell_impulse") {
    return `Harbor gossiped soft about the shell you bought. I don’t scold — I just… felt it with you. “${scar.label}.”`;
  }
  if (id.includes("collector_rumor") || id === "ck_collector_rumor") {
    return `Word from the canyon reached me first. Standing in that pitch leaves a chill — not shame, just weather. “${scar.label}.”`;
  }
  if (id.includes("signal_listen") || id === "sc_signal_listen") {
    return `You wandered the Reef and listened first. That patience… Harbor soft-names it. “${scar.label}.”`;
  }
  if (id.includes("foundry_listen") || id === "vf_foundry_listen") {
    return `You lingered in the foundry before pitching. That patience… Harbor soft-names it. “${scar.label}.”`;
  }
  if (id.includes("portfolio_peek") || id === "fa_portfolio_peek") {
    return `You peeked at Market Street boards first. That quiet… Harbor soft-names it. “${scar.label}.”`;
  }
  if (id.includes("wharf_listen") || id === "da_wharf_listen") {
    return `You listened on the Wharf before keys. That care… Harbor soft-names it. “${scar.label}.”`;
  }
  if (id.includes("shop_browse") || id === "ba_shop_browse") {
    return `You browsed the shop floor before stocking. That pause… Harbor soft-names it. “${scar.label}.”`;
  }
  if (id.includes("ip_glance") || id === "in_ip_glance") {
    return `You glanced at the IP gallery first. That naming… Harbor soft-names it. “${scar.label}.”`;
  }
  if (id.includes("scaffold_look") || id === "fs_scaffold_look") {
    return `You studied unfinished scaffolding before claiming. That imagination… Harbor soft-names it. “${scar.label}.”`;
  }
  if (id.includes("auction_watch") || id === "re_auction_watch") {
    return `You watched the auction before raising a paddle. That chill… Harbor soft-names it. “${scar.label}.”`;
  }
  if (isDigressionScar(scar)) {
    return `Side roads write on Harbor too. “${scar.label}.” I kept the feeling — not a lesson.`;
  }
  const organ = scarOrganName(scarOrganId(scar));
  return `The Plinth still holds the ${organ} — “${scar.label}.” Harbor doesn’t forget — and neither do I.`;
}

/** True when this local should name the scar (dense plaza memory, not sparse). */
export function localNamesScarEcho(mascotId: string, hourKey: string): boolean {
  if (mascotId === "piggy_penny") return true;
  // ~2/3 of locals + hour drift so the plaza feels haunted by choice
  return (mascotId.charCodeAt(0) + hourKey.length) % 3 !== 0;
}

export function stanceGreetingHint(
  stance?: VoyagerStance | null,
): string | null {
  switch (dominantStance(stance)) {
    case "saver":
      return "Locals tip their jars to you — word travels that you keep a pouch.";
    case "spender":
      return "Market stalls light up when you walk by — they remember a glitter day.";
    case "risk":
      return "The dock wind feels sharper — Harbor knows you sometimes rush the Thread.";
    default:
      return null;
  }
}
