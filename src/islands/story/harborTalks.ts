/**
 * Harbor talk graphs — Piggy Penny + plaza locals.
 * Used for Pokémon-style Talk Battle encounters on Harbor Haven.
 */

import type { DialogueGraph, IslandNpc, ProfileText } from "../types";
import { resolveControlPlaceholders } from "@/input";
import { HARBOR_LOCAL_CAST, getMascot, type MoneyMascotId } from "../moneyCast";
import {
  normalizeHubGuidedIntro,
  STORY_BIBLE_VERSION,
  type HubGuidedStepId,
} from "./storyBible";
import {
  coldOrganKidSentence,
  isDigressionScar,
  nextPaintingAfterScar,
  piggyScarWeightLine,
  plaqueShelfLine,
  plazaScarGossipLine,
  scarOrganId,
  scarOrganName,
} from "../worldMemory";

export const HARBOR_NPCS: IslandNpc[] = HARBOR_LOCAL_CAST.map((slot) => {
  const m = getMascot(slot.mascotId);
  return {
    id: slot.mascotId,
    name: m.name,
    icon: m.emoji,
    areaId: "hh_plaza",
    dialogueGraphId: `dlg_harbor_${slot.mascotId}`,
    tagline: m.tagline,
    mascotId: slot.mascotId,
  };
});

/** Role-flavored tip beats — each Harbor local teaches a distinct money habit */
const ROLE_TIPS: Record<
  string,
  { tip: ProfileText; bye: ProfileText }
> = {
  piggy_penny: {
    tip: {
      explorer: "Memory keeps — Harbor names what you chose on the Plinth.",
      apprentice: "Coin holds · Clock shelters · Spiral withstands — the organs speak if you listen.",
      strategist: "Harbor remembers your Take. The Plinth is the receipt — not a quiz score.",
    },
    bye: {
      explorer: "I’m by the fountain if Harbor needs a keeper!",
      apprentice: "Come back — Memory keeps your mark.",
      strategist: "Ping me when a new scar lands on the Plinth.",
    },
  },
  coiny: {
    tip: {
      explorer: "Count your coins before you spend — know what you have!",
      apprentice: "Know your pouch balance before Capsule Stall. Surprises hurt.",
      strategist: "Reconcile pouch vs ledger before any impulse buy.",
    },
    bye: {
      explorer: "Clink-clink! See you around the fountain!",
      apprentice: "Catch you on the plaza.",
      strategist: "Back to circulating.",
    },
  },
  dollar_dash: {
    tip: {
      explorer: "Earn first, then race to the fun stuff!",
      apprentice: "Speed is cool — but finish the Main Quest before side dashes.",
      strategist: "Velocity without a plan is just burn rate. Chart the beat first.",
    },
    bye: {
      explorer: "Gotta dash — bye!",
      apprentice: "Keep moving!",
      strategist: "Stay liquid.",
    },
  },
  budget_bot: {
    tip: {
      explorer: "Clock shelters — needs, wants, and save can share one umbrella.",
      apprentice: "The Clock organ stamps time before glitter — Harbor hears the rhythm.",
      strategist: "Paycheck buckets are Clock practice — not a spreadsheet grade.",
    },
    bye: {
      explorer: "Beep-boop. Harbor keeps!",
      apprentice: "Clock tick — Memory waits.",
      strategist: "Model the month, not the mood.",
    },
  },
  spendy_sue: {
    tip: {
      explorer: "Wants are fun — wait one sleep before big buys!",
      apprentice: "Impulse stall? Wait 24 hours. Still want it? Then maybe.",
      strategist: "Cooling-off period beats buyer’s remorse every time.",
    },
    bye: {
      explorer: "Okay okay… I’ll try to wait!",
      apprentice: "Shopping cart parked.",
      strategist: "Desire logged, not executed.",
    },
  },
  vault_vince: {
    tip: {
      explorer: "Keep some coins safe for rainy days!",
      apprentice: "Emergency pouch = sleep-easy money. Don’t raid it for toys.",
      strategist: "Liquidity buffer first — then riskier Harbor plays.",
    },
    bye: {
      explorer: "Vault’s locked. You’re good!",
      apprentice: "Secure.",
      strategist: "Reserves intact.",
    },
  },
  tip_jar_tom: {
    tip: {
      explorer: "A tiny tip for helpers can feel great — if you can afford it!",
      apprentice: "Gratitude’s cheap; over-tipping your budget isn’t. Decide first.",
      strategist: "Discretionary gratitude belongs in the fun envelope, not the rent jar.",
    },
    bye: {
      explorer: "Thanks for chatting!",
      apprentice: "Tip of the day delivered.",
      strategist: "Appreciate the dwell time.",
    },
  },
  cashwell: {
    tip: {
      explorer: "Cashwell Capital — tip your hat! Markets move; Piggy keeps Harbor’s verbs.",
      apprentice: "Series lead on the terrace — style is mine, Take receipts are Piggy’s.",
      strategist: "Boardroom flash, not Harbor Keeper. Compound patience beats chasing every ticker.",
    },
    bye: {
      explorer: "Tip the hat — pay yourself first!",
      apprentice: "Extra tall. Extra flash. Harbor stays Piggy’s.",
      strategist: "Time is money. You own the choice.",
    },
  },
  cashmere: {
    tip: {
      explorer: "Cashmere Couture — capital is couture. I tip my hat; Piggy names what Harbor remembers.",
      apprentice: "Style is strategy — but the Carpet and Plinth belong to Piggy, not the terrace.",
      strategist: "Boardroom royalty, not Keeper. Taste opens doors; discipline keeps the ledger.",
    },
    bye: {
      explorer: "Inherited. Intelligent. Iconic — go count your coins!",
      apprentice: "Grace with power. Pay yourself first, darling.",
      strategist: "The room adjusts. Your ledger should too.",
    },
  },
  peso_pedro: {
    tip: {
      explorer: "¡Peso Pedro! Small symbol, big circulation — I celebrate; Piggy steers Harbor.",
      apprentice: "Fiesta energy on the terrace — earn first, then celebrate with Piggy’s map.",
      strategist: "Charm in motion, not Harbor Keeper. Liquidity before spectacle.",
    },
    bye: {
      explorer: "Fiesta of fortune — go make a smart move!",
      apprentice: "Smooth operator tip: pay yourself first, then celebrate.",
      strategist: "Stay liquid. Stay charming. Stay ledger-true.",
    },
  },
  fortuna_fernanda: {
    tip: {
      explorer: "Fortuna Fernanda — abundance arrives loud! I sparkle; Piggy keeps the Harbor verbs.",
      apprentice: "Confidence is capital — tip your hat, then follow Piggy to the next painting.",
      strategist: "Celebration queen, not Keeper. Glamour without a plan is just burn rate.",
    },
    bye: {
      explorer: "Bold. Brilliant. Blessed — go glow!",
      apprentice: "Flair of the bag: pay yourself first, then sparkle.",
      strategist: "Every entrance an occasion. Every ledger line a rose.",
    },
  },
  billionaire_bao: {
    tip: {
      explorer: "Billionaire Bao — quiet luxury. I tip my hat; Piggy files the Take.",
      apprentice: "Intentional moves compound — terrace flash, Harbor discipline.",
      strategist: "Legacy wealth, not Keeper. Connections open doors; buffers keep them open.",
    },
    bye: {
      explorer: "Respected without noise — go make a lasting move!",
      apprentice: "Pay yourself first. Then let influence echo.",
      strategist: "Subtle. Refined. Compounded.",
    },
  },
  jade_fortune: {
    tip: {
      explorer: "Jade Fortune — grace without chasing lights. Piggy keeps Harbor; I keep poise.",
      apprentice: "Heirloom patience — tip your hat, then let Piggy point the Carpet.",
      strategist: "Social capital, not Keeper. Elegance multiplies when cashflow is calm.",
    },
    bye: {
      explorer: "Polished. Poised. Prosperous — go bloom!",
      apprentice: "Pay yourself first. Then let elegance multiply abundance.",
      strategist: "Wisdom sharpens every move. Grace compounds.",
    },
  },
  sultan_stacks: {
    tip: {
      explorer: "Sultan Stacks — big vision, bigger stacks! Terrace royalty; Piggy runs Harbor.",
      apprentice: "Trade-route foresight — stack slow, sail when Piggy opens the Clock.",
      strategist: "Palace presence, not Keeper. Strategy stacks; impulse scatters.",
    },
    bye: {
      explorer: "Big treasure. Big vision. Bigger legacy — go stack!",
      apprentice: "Pay yourself first. Then wear wealth like a crown.",
      strategist: "Gold in every detail. Ledger in every step.",
    },
  },
  dinar_dahlia: {
    tip: {
      explorer: "Dinar Dahlia — radiant entrance! I tip my hat; Piggy remembers the Take.",
      apprentice: "Elegance is currency — celebrate after Piggy’s spine lesson lands.",
      strategist: "Regal flair, not Keeper. Prosperity travels with a plan.",
    },
    bye: {
      explorer: "Radiant. Regal. Rewarded — go glow!",
      apprentice: "Pay yourself first. Then let grace travel with power.",
      strategist: "Luxury in every detail. Wonder in every ledger line.",
    },
  },
  mansa_moneybaggs: {
    tip: {
      explorer: "Mansa Moneybaggs — golden legacy on the terrace! Generosity scales when Piggy’s map is clear.",
      apprentice: "Wealth that uplifts — tip your hat, then walk Piggy’s Harbor route.",
      strategist: "Kingdom wealth, not Keeper. Legacy is responsibility, not flex alone.",
    },
    bye: {
      explorer: "Giving is royalty — go inspire!",
      apprentice: "Pay yourself first. Then let abundance uplift others.",
      strategist: "Gold isn’t just wealth. It’s a responsibility. It’s a legacy.",
    },
  },
  kandake_kash: {
    tip: {
      explorer: "Kandake Kash — crowned commerce! Community riches when Piggy’s verbs lead.",
      apprentice: "Shared prosperity — terrace tip, Harbor walk with Piggy.",
      strategist: "Queen of community, not Keeper. Riches feel richer when the ledger is honest.",
    },
    bye: {
      explorer: "Crowned. Cultured. Collected — go walk wealth!",
      apprentice: "Pay yourself first. Then let influence travel with you.",
      strategist: "Every move builds abundance. Treasure in motion.",
    },
  },
  moneybagg_bro: {
    tip: {
      explorer: "Moneybagg Bro — swagger on the terrace! Hustle loud; Piggy keeps Harbor honest.",
      apprentice: "Multiple streams need one map — Piggy’s, not mine.",
      strategist: "Executive style, not Keeper. Discipline today beats flex tomorrow.",
    },
    bye: {
      explorer: "Walk in confidence — leave a legacy!",
      apprentice: "Pay yourself first. Then let multiple streams hustle.",
      strategist: "Building empires. Inspiring dreams. That’s the way.",
    },
  },
  mula_mami: {
    tip: {
      explorer: "Mula Mami — boss energy! I shine on the terrace; Piggy steers the Harbor.",
      apprentice: "Stacks in hand, plans in motion — follow Piggy before the side dash.",
      strategist: "Street glamour, not Keeper. Profit with poise, not Plinth lectures.",
    },
    bye: {
      explorer: "Bold. Bossed up. Bankrolled — go shine!",
      apprentice: "Pay yourself first. Then let cash confidence lead.",
      strategist: "Luxury with edge. Style with status. Ledger with heels.",
    },
  },
};

function tipFor(mascotId: MoneyMascotId): { tip: ProfileText; bye: ProfileText } {
  return (
    ROLE_TIPS[mascotId] ?? {
      tip: {
        explorer: "Pay yourself first — even one coin in the jar counts. Then play!",
        apprentice: "Budget the fun money after you set aside savings.",
        strategist: "Separate needs, wants, and buffers before impulse buys.",
      },
      bye: {
        explorer: "Wave when you want to chat!",
        apprentice: "Door’s open on the plaza.",
        strategist: "Find me when you’re ready.",
      },
    }
  );
}

function localGraph(mascotId: MoneyMascotId): DialogueGraph {
  const m = getMascot(mascotId);
  const gid = `dlg_harbor_${mascotId}`;
  const beat = tipFor(mascotId);
  // Design Bible: no hollow yes/later fake choice — one continue into the tip.
  return {
    id: gid,
    startNodeId: "n1",
    nodes: [
      {
        id: "n1",
        speaker: m.name,
        text: {
          explorer: `Hi! I’m ${m.name}. ${m.tagline}`,
          apprentice: `${m.name} here. ${m.tagline}`,
          strategist: `${m.name}. ${m.tagline}`,
        },
        choices: [
          {
            id: "hear",
            text: {
              explorer: "What do you notice?",
              apprentice: "What’s on your mind?",
              strategist: "Read the plaza.",
            },
            nextNodeId: "n2",
          },
        ],
      },
      {
        id: "n2",
        speaker: m.name,
        text: beat.tip,
        choices: [
          {
            id: "ok",
            text: {
              explorer: "Thanks!",
              apprentice: "Got it.",
              strategist: "Noted.",
            },
            nextNodeId: "n3",
          },
        ],
      },
      {
        id: "n3",
        speaker: m.name,
        text: beat.bye,
        end: true,
      },
    ],
  };
}

export type PiggyGuidedOpts = {
  ashoreTeachComplete?: boolean;
  coveChangeDone?: boolean;
  paycheckChangeDone?: boolean;
};

/** Guided Piggy conversations — Ashore live beats only (legacy ids remap to voyage). */
export function piggyGuidedGraph(
  step: HubGuidedStepId | null | undefined,
  opts?: PiggyGuidedOpts,
): DialogueGraph {
  const live: HubGuidedStepId =
    step == null || step === "done"
      ? "done"
      : normalizeHubGuidedIntro({ version: STORY_BIBLE_VERSION, step }).step;

  if (live === "meet_guide") {
    if (opts?.ashoreTeachComplete) {
      return {
        id: "dlg_harbor_piggy_penny_guided",
        startNodeId: "g1",
        nodes: [
          {
            id: "g1",
            speaker: "Piggy Penny",
            text: resolveControlPlaceholders(
              "Ashore proved the organs — this plaza is home. I'm Piggy Penny, Harbor Keeper. Memory keeps. Coin Bag points the Money Carpet to Coincraft Cove when you're ready.",
            ),
            choices: [{ id: "go", text: "To the carpet!", end: true }],
          },
        ],
      };
    }
    return {
      id: "dlg_harbor_piggy_penny_guided",
      startNodeId: "g1",
      nodes: [
        {
          id: "g1",
          speaker: "Piggy Penny",
          text: resolveControlPlaceholders(
            "You're standing on Harbor Haven — this is home. I'm Piggy Penny, your Harbor Keeper. Walk with {move}, talk with {interact}. Coin Bag stays beside you.",
          ),
          choices: [
            { id: "where", text: "Where am I?", nextNodeId: "g_where" },
            { id: "do", text: "What do I do here?", nextNodeId: "g_do" },
          ],
        },
        {
          id: "g_where",
          speaker: "Piggy Penny",
          text: "Harbor Haven is the plaza that remembers. Walk the fountain, talk to me, come back to the Memory Plinth later — it keeps the marks you make on other shores.",
          choices: [
            { id: "first", text: "What should I do first?", nextNodeId: "g_do" },
          ],
        },
        {
          id: "g_do",
          speaker: "Piggy Penny",
          text: "Right now: walk this plaza and talk. Next I'll show you a chart of the islands — tap each painting so the world makes sense. Then Coin Bag points the way.",
          choices: [
            { id: "chart", text: "Show me the islands", nextNodeId: "g_chart" },
          ],
        },
        {
          id: "g_chart",
          speaker: "Piggy Penny",
          text: "Tap Harbor (you're here) and Coincraft Cove (first painting). Peek at Paycheck, Credit, and the outer ring if you're curious — extra games, not homework.",
          end: true,
        },
      ],
    };
  }

  if (live === "to_dock") {
    const afterText = opts?.paycheckChangeDone
      ? "The outer ring is side quests — extra games after Paycheck Change. Inner ring: Credit when Harbor trusts your transfer."
      : opts?.coveChangeDone
        ? "Paycheck Peninsula waits on the inner ring — Clock organ after Harbor felt your Cove mark."
        : "First: Coincraft Cove only. Paycheck Peninsula and Credit Kingdom wake after you come home changed. Outer-ring side quests open after Paycheck Change — extra games, not homework.";

    return {
      id: "dlg_harbor_piggy_penny_guided",
      startNodeId: "g1",
      nodes: [
        {
          id: "g1",
          speaker: "Piggy Penny",
          text: resolveControlPlaceholders(
            "Coin Bag points the Money Carpet. Open the Archipelago map ({map}) and board Coincraft Cove — your first painting. Earn coins, then choose. Harbor will remember.",
          ),
          choices: [
            { id: "after", text: "What's after Cove?", nextNodeId: "g_after" },
            { id: "go", text: "To the carpet!", nextNodeId: "g_go" },
          ],
        },
        {
          id: "g_after",
          speaker: "Piggy Penny",
          text: afterText,
          choices: [{ id: "go", text: "To the carpet!", nextNodeId: "g_go" }],
        },
        {
          id: "g_go",
          speaker: "Piggy Penny",
          text: "Follow Coin Bag to the dock. I'll be at the fountain when you fly home.",
          end: true,
        },
      ],
    };
  }

  return {
    id: "dlg_harbor_piggy_penny_guided",
    startNodeId: "g1",
    nodes: [
      {
        id: "g1",
        speaker: "Piggy Penny",
        text: "Harbor is yours. Talk to locals, shop, or open the map whenever you're ready. Outer-ring side shores are extra — play them when you're curious.",
        choices: [{ id: "ok", text: "Thanks!" }],
        end: true,
      },
    ],
  };
}

export const HARBOR_DIALOGUES: DialogueGraph[] = [
  ...HARBOR_LOCAL_CAST.map((s) => localGraph(s.mascotId)),
  piggyGuidedGraph("done"),
];

type TalkScar = {
  id?: string;
  label: string;
  islandId?: string;
  kind?: "plaque" | "npc_tone" | "plaza_prop";
};

function asTalkScar(s: TalkScar) {
  return {
    id: s.id ?? "",
    islandId: s.islandId ?? "",
    label: s.label,
    kind:
      s.kind ??
      (s.id && isDigressionScar({ id: s.id, kind: "plaque" }) ? "npc_tone" : "plaque"),
  } as const;
}

/** Welcome-back Talk Battle after Cove Change (or any chapter homecoming). */
export function piggyHomecomingGraph(
  message?: string | null,
  opts?: {
    scars?: TalkScar[];
    bondBeat?: number;
    /** Real ledger footprint after Cove Take — diegetic math echo */
    footprintLine?: string | null;
  },
): DialogueGraph {
  const opener =
    message?.replace(/^Piggy Penny:\s*/i, "").trim() ||
    "You came home changed. The Plinth already knows — Harbor feels different because YOU are.";

  const shelfScars = (opts?.scars ?? []).slice(-3);
  const latestScar = shelfScars.at(-1);
  const latest = latestScar ? asTalkScar(latestScar) : null;
  const digressionHome = latest && isDigressionScar(latest);

  const plaqueNamed = shelfScars
    .filter((s) => !isDigressionScar(asTalkScar(s)))
    .map((s) =>
      plaqueShelfLine({
        id: s.id ?? "",
        islandId: s.islandId ?? "",
        label: s.label,
      }),
    );
  const digressionNamed = shelfScars
    .filter((s) => isDigressionScar(asTalkScar(s)))
    .map((s) => `“${s.label}”`);

  const latestOrgan = latest
    ? scarOrganId({
        id: latest.id,
        islandId: latest.islandId,
        label: latest.label,
      })
    : null;
  const kidLine =
    latestOrgan && !digressionHome ? coldOrganKidSentence(latestOrgan) : null;

  // Emotional weight first — digressions are gossip conscience; plaques are Plinth bond.
  const weightLine = latest ? piggyScarWeightLine(latest) : null;
  const shelfBit =
    plaqueNamed.length > 0
      ? `Your Memory Plinth: ${plaqueNamed.join(" · ")}.`
      : digressionNamed.length > 0
        ? `Plaza gossip still carries ${digressionNamed.join(" · ")}.`
        : null;
  const mathBit = opts?.footprintLine?.trim() || null;
  const scarLine =
    [weightLine, kidLine, mathBit, shelfBit].filter(Boolean).join(" ") ||
    "Coin Bag and I watched you grow.";

  const nextPainting =
    latest && !digressionHome
      ? nextPaintingAfterScar({
          id: latest.id,
          islandId: latest.islandId,
        })
      : null;
  const bond =
    opts?.bondBeat && opts.bondBeat >= 3
      ? "Three homecomings. Cove, Paycheck, Kingdom — I trust your pouch, and you."
      : opts?.bondBeat && opts.bondBeat >= 2
        ? "Second time you've flown home changed. I'm proud — and a little sniffly."
        : digressionHome
          ? "Side roads count. I won't turn them into a lecture."
          : "That's the Change beat — earn fair, then choose.";

  const phase =
    (opts?.bondBeat ?? 0) >= 3
      ? "trust"
      : (opts?.scars?.length ?? 0) >= 2 && (opts?.bondBeat ?? 0) < 2
        ? "strain"
        : (opts?.bondBeat ?? 0) >= 1
          ? "repair"
          : "welcome";

  const phaseLine =
    phase === "strain"
      ? "I worried when the plaza took a harder mark — but you came back. That matters."
      : phase === "repair"
        ? (opts?.bondBeat ?? 0) >= 2
          ? bond
          : "We patched over a hard choice together. Coin Bag and I still walk with you."
        : bond;

  const nextLine = nextPainting
    ? `${nextPainting} is newly open on the Carpet Dock. Walk it when you’re curious — Memory keeps your story on the Plinth.`
    : digressionHome
      ? "When you're ready, the Carpet Dock still waits — gossip fades slower than lessons."
      : "The Carpet Dock waits when a painting wakes — Memory keeps your story on the Plinth.";

  return {
    id: "dlg_harbor_piggy_penny_homecoming",
    startNodeId: "h1",
    nodes: [
      {
        id: "h1",
        speaker: "Piggy Penny",
        text: opener,
        choices: [
          {
            id: "h1_ok",
            text: "I felt that choice!",
            nextNodeId: "h2",
          },
        ],
      },
      {
        id: "h2",
        speaker: "Piggy Penny",
        text: `${scarLine} ${phaseLine}`,
        choices: [
          {
            id: "h2_go",
            text: "Show me what's next!",
            nextNodeId: "h3",
          },
        ],
      },
      {
        id: "h3",
        speaker: "Piggy Penny",
        text: nextLine,
        choices: [
          {
            id: "h3_ok",
            text: "Thanks, Piggy!",
          },
        ],
        end: true,
      },
    ],
  };
}

export type HarborDialogueOpts = {
  guidedStep?: HubGuidedStepId | null;
  /** Show Piggy's welcome-back graph when pending/celebrated and not yet talked */
  homecoming?: {
    pending?: boolean;
    celebrated?: boolean;
    piggyTalked?: boolean;
    message?: string | null;
  } | null;
  scars?: TalkScar[];
  /** Count of celebrated homecomings / scars for Piggy bond depth */
  bondBeat?: number;
  /** Dominant stance for local greeting flavor */
  stanceHint?: string | null;
  /** Prior talks with this NPC */
  npcTalks?: number;
};

function formatScarShelf(scars: TalkScar[]): string {
  return scars
    .slice(-3)
    .map((s) => {
      const t = asTalkScar(s);
      if (isDigressionScar(t)) return `“${t.label}”`;
      return plaqueShelfLine(t);
    })
    .join(" · ");
}

/** Role-colored receipt beat after naming a scar — gossip, not a tip lecture. */
function localScarReceiptBeat(
  mascotId: MoneyMascotId,
  scar: ReturnType<typeof asTalkScar>,
): { mid: string; bye: string } {
  const label = scar.label;
  const dig = isDigressionScar(scar);
  const organ = scarOrganName(scarOrganId(scar));
  const byRole: Partial<Record<string, { mid: string; bye: string }>> = {
    coiny: {
      mid: dig
        ? `Clink — I keep hearing “${label}” between coin counts. Plaza doesn’t need a tip sheet for that.`
        : `I counted the ${organ} mark twice. “${label}.” Your pouch and the Plinth agree.`,
      bye: dig ? "Gossip spends itself. Catch you at the fountain." : "Clink-clink. Plinth still glows.",
    },
    spendy_sue: {
      mid: dig
        ? `Ohhh I felt that digression. “${label}.” Want or wait — Harbor still talks like a market aisle.`
        : `Impulse stalls go quiet when the ${organ} plaque reads “${label}.” I’m… trying to listen.`,
      bye: "Okay okay — I’ll stop shopping the rumor.",
    },
    tip_jar_tom: {
      mid: dig
        ? `Tip jar’s full of whispers: “${label}.” Not advice — just receipts passing hand to hand.`
        : `Someone tipped a story into my jar — ${organ}, “${label}.” I’m only the messenger.`,
      bye: "Keep the change. Keep the memory.",
    },
    vault_vince: {
      mid: dig
        ? `Side doors leave marks too. Locked “${label}” behind my teeth. Harbor still overheard.`
        : `Vault hears the ${organ}. “${label}.” Secure doesn’t mean forgotten.`,
      bye: "Reserves intact. Story filed.",
    },
    budget_bot: {
      mid: dig
        ? `Beep. Digression logged — “${label}.” Not a budget line. A street line.`
        : `Model updated: ${organ} plaque “${label}.” Numbers can’t hold the feeling. I still try.`,
      bye: "Plan complete. Heart optional.",
    },
    dollar_dash: {
      mid: dig
        ? `Raced past the rumor twice — still “${label}.” Digressions stick to sneakers.`
        : `Speed doesn’t outrun a ${organ} plaque. “${label}.” Felt that on the dock wind.`,
      bye: "Gotta dash — rumor’s faster.",
    },
    cashwell: {
      mid: dig
        ? `Even side streets tip their hats. “${label}.” Style without the Main Quest? Harbor still files the gossip.`
        : `Plinth glow, darling — ${organ}, “${label}.” Growth is style; memory is the receipt.`,
      bye: "Tip the hat. Tip the truth.",
    },
    cashmere: {
      mid: dig
        ? `Side-aisle couture: “${label}.” I don’t lecture — I tailor the rumor to fit.`
        : `Memory Courtyard stitched the ${organ} into “${label}.” Precision with feeling.`,
      bye: dig ? "Grace when the gossip cools." : "Inherited. Intelligent. Remembered.",
    },
    peso_pedro: {
      mid: dig
        ? `¡Fiesta side-quest! “${label}” still dances past the tip jars.`
        : `Small symbol, huge plaque — ${organ} says “${label}.” Celebration with a ledger.`,
      bye: dig ? "Keep circulating." : "Stay liquid. Stay ledger-true.",
    },
    fortuna_fernanda: {
      mid: dig
        ? `Digression dressed for the plaza — “${label}.” Charm heard it first.`
        : `Roses on the ${organ}: “${label}.” Abundance that remembers.`,
      bye: dig ? "Blessed rumor, darling." : "Every entrance an occasion.",
    },
    billionaire_bao: {
      mid: dig
        ? `Quiet compound interest on gossip — “${label}.” No shout required.`
        : `Subtle ${organ} filing: “${label}.” Legacy without noise.`,
      bye: dig ? "Influence listens." : "Refined. Compounded.",
    },
    jade_fortune: {
      mid: dig
        ? `Jade doesn’t chase rumors — they arrive polished. “${label}.”`
        : `Heirloom hush: the ${organ} still names “${label}.” Grace compounds.`,
      bye: dig ? "Poised. Prosperous. Patient." : "Rooms remember her — and you.",
    },
    sultan_stacks: {
      mid: dig
        ? `Side streets wear crowns too. “${label}.” Treasure of a digression.`
        : `Palace Plinth — ${organ}, “${label}.” Fortune favors the remembered Take.`,
      bye: dig ? "Stack soft." : "Gold in every detail.",
    },
    dinar_dahlia: {
      mid: dig
        ? `Procession gossip: “${label}.” Radiant without a lecture.`
        : `Treasure glow on the ${organ} — “${label}.” Spectacle with a spine.`,
      bye: dig ? "Radiant rumor." : "Wonder in every ledger line.",
    },
    mansa_moneybaggs: {
      mid: dig
        ? `Caravan news: “${label}.” Side roads still write kingdoms.`
        : `Trade-route ${organ}: “${label}.” Giving is royalty — memory is duty.`,
      bye: dig ? "Uplift soft." : "Gold is a legacy.",
    },
    kandake_kash: {
      mid: dig
        ? `Community hush: “${label}.” Shared hands, shared streets.`
        : `Crowned commerce names the ${organ} — “${label}.” Riches walk together.`,
      bye: dig ? "Stride on." : "Treasure in motion.",
    },
    moneybagg_bro: {
      mid: dig
        ? `Big-play digression still hustling: “${label}.” No tip sheet — just streets.`
        : `Empire receipt — ${organ}, “${label}.” Discipline today, memory forever.`,
      bye: dig ? "Keep the swagger honest." : "Building empires. Naming Takes.",
    },
    mula_mami: {
      mid: dig
        ? `Boss-babe side street: “${label}.” Heels heard it before the Plinth.`
        : `Stacks and ${organ} glow — “${label}.” Dressed for impact, filed for memory.`,
      bye: dig ? "Shine when it cools." : "Luxury with a ledger.",
    },
  };
  return (
    byRole[mascotId] ?? {
      mid: dig
        ? `Alive streets remember digressions. “${label}.” I’m not here to coach — just to say Harbor heard.`
        : `The ${organ} still names “${label}” on the Plinth. Living receipt. Not a tip list.`,
      bye: dig ? "Wave when the rumor cools." : "See you by the Memory Courtyard.",
    }
  );
}

/** Free-roam Piggy when plaques exist — conscience that remembers. */
export function piggyMemoryGraph(
  scars: TalkScar[],
  opts?: { stanceHint?: string | null },
): DialogueGraph {
  const shelf = formatScarShelf(scars);
  const latestScar = scars[scars.length - 1];
  const latest = latestScar ? asTalkScar(latestScar) : null;
  const stance = opts?.stanceHint ? ` ${opts.stanceHint}` : "";
  const opener = latest
    ? `${piggyScarWeightLine(latest)}${stance}`
    : `Harbor doesn’t forget — and neither do I.${stance}`;
  const dig = latest ? isDigressionScar(latest) : false;
  return {
    id: "dlg_harbor_piggy_penny_memory",
    startNodeId: "m1",
    nodes: [
      {
        id: "m1",
        speaker: "Piggy Penny",
        text: opener,
        choices: [{ id: "m1_ok", text: "I see it too", nextNodeId: "m2" }],
      },
      {
        id: "m2",
        speaker: "Piggy Penny",
        text:
          shelf.length > 0
            ? dig
              ? `Still carrying: ${shelf}. No lecture — just the weight. Coin Bag stays; walk when you’re ready.`
              : `Your shelf: ${shelf}. A painting may be open on the Carpet — or walk the Memory Plinth with me anytime.`
            : "Coin Bag sticks with you. When a painting calls, we’ll float together.",
        choices: [{ id: "m2_ok", text: "Thanks, Piggy!" }],
        end: true,
      },
    ],
  };
}

/** Plaza local who names the scar — living receipt, not tip-list mannequin. */
function scarMemoryLocalGraph(
  mascotId: MoneyMascotId,
  scars: TalkScar[],
  opts: { stanceHint?: string | null; npcTalks?: number },
): DialogueGraph {
  const m = getMascot(mascotId);
  const latestScar = scars[scars.length - 1];
  const latest = latestScar
    ? asTalkScar(latestScar)
    : asTalkScar({ id: "", label: "that choice", islandId: "" });
  const gossip = plazaScarGossipLine(latest, {
    talks: opts.npcTalks,
    stanceHint: opts.stanceHint,
  });
  const beat = localScarReceiptBeat(mascotId, latest);
  const dig = isDigressionScar(latest);
  return {
    id: `dlg_harbor_${mascotId}_scar_memory`,
    startNodeId: "s0",
    nodes: [
      {
        id: "s0",
        speaker: m.name,
        text: gossip,
        choices: [
          {
            id: "s0_ok",
            text: dig ? "The streets remember" : "Harbor felt that",
            nextNodeId: "s1",
          },
        ],
      },
      {
        id: "s1",
        speaker: m.name,
        text: beat.mid,
        choices: [
          {
            id: "s1_ok",
            text: dig ? "Yeah… I hear it" : "Got it",
            nextNodeId: "s2",
          },
        ],
      },
      {
        id: "s2",
        speaker: m.name,
        text: beat.bye,
        end: true,
      },
    ],
  };
}

function stanceLocalGraph(
  mascotId: MoneyMascotId,
  opts: { stanceHint?: string | null; npcTalks?: number },
): DialogueGraph {
  const base = localGraph(mascotId);
  const m = getMascot(mascotId);
  const recall =
    (opts.npcTalks ?? 0) >= 2
      ? `Back again — I've counted ${opts.npcTalks} chats with you.`
      : null;
  const hint = opts.stanceHint;
  if (!hint && !recall) return base;

  const opener = [recall, hint].filter(Boolean).join(" ");
  return {
    ...base,
    id: base.id,
    startNodeId: "n0",
    nodes: [
      {
        id: "n0",
        speaker: m.name,
        text: opener,
        choices: [{ id: "n0_ok", text: "Hi!", nextNodeId: "n1" }],
      },
      ...base.nodes,
    ],
  };
}

export function resolveHarborDialogue(
  npcId: string,
  guidedStepOrOpts?: HubGuidedStepId | null | HarborDialogueOpts,
): DialogueGraph | undefined {
  const opts: HarborDialogueOpts =
    guidedStepOrOpts && typeof guidedStepOrOpts === "object"
      ? guidedStepOrOpts
      : { guidedStep: guidedStepOrOpts as HubGuidedStepId | null | undefined };

  const scars = opts.scars ?? [];
  const hasScars = scars.length > 0;

  if (npcId === "piggy_penny") {
    if (opts.guidedStep && opts.guidedStep !== "done") {
      return piggyGuidedGraph(opts.guidedStep);
    }
    const hc = opts.homecoming;
    if (hc && !hc.piggyTalked && (hc.pending || hc.celebrated)) {
      return piggyHomecomingGraph(hc.message, {
        scars,
        bondBeat: opts.bondBeat,
      });
    }
    if (hasScars) {
      return piggyMemoryGraph(scars, { stanceHint: opts.stanceHint });
    }
  }

  // Scar / stance memory lines are Harbor plaza locals only — never steal
  // island quest graphs (Vendor Vee Take, Alma, Priya, …).
  const harborLocal = Boolean(findHarborNpc(npcId));

  if (harborLocal && npcId !== "piggy_penny" && hasScars) {
    try {
      return scarMemoryLocalGraph(npcId as MoneyMascotId, scars, {
        stanceHint: opts.stanceHint,
        npcTalks: opts.npcTalks,
      });
    } catch {
      /* fall through */
    }
  }

  if (
    harborLocal &&
    npcId !== "piggy_penny" &&
    (opts.stanceHint || (opts.npcTalks ?? 0) >= 2)
  ) {
    try {
      return stanceLocalGraph(npcId as MoneyMascotId, {
        stanceHint: opts.stanceHint,
        npcTalks: opts.npcTalks,
      });
    } catch {
      /* fall through */
    }
  }

  return HARBOR_DIALOGUES.find((g) => g.id === `dlg_harbor_${npcId}`);
}

export function findHarborNpc(npcId: string): IslandNpc | undefined {
  return HARBOR_NPCS.find((n) => n.id === npcId);
}

/** Distinct tip text per mascot — used by tests / HUD previews */
export function harborTipPreview(mascotId: MoneyMascotId): ProfileText {
  return tipFor(mascotId).tip;
}
