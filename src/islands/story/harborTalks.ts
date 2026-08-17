/**
 * Harbor talk graphs — Piggy Penny + plaza locals.
 * Used for Pokémon-style Talk Battle encounters on Harbor Haven.
 */

import type { DialogueGraph, IslandNpc, ProfileText } from "../types";
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
      explorer: "Save a little every day — even shiny pennies grow into a jar!",
      apprentice: "Pay yourself first. A small automatic save beats a big maybe-later.",
      strategist: "Automate a savings transfer before discretionary Harbor spends.",
    },
    bye: {
      explorer: "I’m by the fountain if you need me!",
      apprentice: "Come back anytime — Harbor Keeper desk is open.",
      strategist: "Ping me when cashflow or freedom seals need a check-in.",
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
      explorer: "Make a simple plan: needs, wants, save. Check!",
      apprentice: "Budget = plan for coins before they leave. Three jars work.",
      strategist: "Allocate envelopes before payday hits — then stick the percentages.",
    },
    bye: {
      explorer: "Beep-boop. Plan complete!",
      apprentice: "Spreadsheet smile.",
      strategist: "Model updated.",
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
      explorer:
        "I’m Cashwell — money with a mustache. Harbor remembers every choice on that glowing Plinth!",
      apprentice:
        "Cashwell Capital, at your service. Growth is style — but Piggy keeps the verbs. Check the Plinth when Harbor feels different.",
      strategist:
        "Series lead, not Harbor Keeper. Markets move; Memory Plinth files the receipt. Always up — after you face the Take.",
    },
    bye: {
      explorer: "Tip the hat — and tip yourself first!",
      apprentice: "Extra tall. Extra flash. Extra patience with your jar.",
      strategist: "Time is money. I own the smile — you own the choice.",
    },
  },
  cashmere: {
    tip: {
      explorer:
        "Cashmere Couture — capital is my couture. That glowing Plinth? Harbor’s memory, tailored.",
      apprentice:
        "Style is strategy. Invest with precision — then let Piggy keep the Harbor verbs. Visit the Plinth when a choice lands.",
      strategist:
        "Boardroom royalty, not Harbor Keeper. Fortunes follow taste; Memory Plinth files the receipt after every Take.",
    },
    bye: {
      explorer: "Inherited. Intelligent. Iconic — go count your coins!",
      apprentice: "Grace with power. Pay yourself first, darling.",
      strategist: "The room adjusts. Your ledger should too.",
    },
  },
  peso_pedro: {
    tip: {
      explorer:
        "¡Peso Pedro! Small symbol, massive impact — and that Plinth remembers every fiesta of a choice!",
      apprentice:
        "Money moves, wealth grows. I turn opportunities into celebrations — Piggy still keeps Harbor’s verbs. Check the Plinth.",
      strategist:
        "Always in circulation, never Harbor Keeper. Calculated charm; Memory Plinth files the peso after every Take.",
    },
    bye: {
      explorer: "Fiesta of fortune — go make a smart move!",
      apprentice: "Smooth operator tip: pay yourself first, then celebrate.",
      strategist: "Stay liquid. Stay charming. Stay ledger-true.",
    },
  },
  fortuna_fernanda: {
    tip: {
      explorer:
        "Fortuna Fernanda — I arrive like abundance! That glowing Plinth? Harbor’s memory, dressed for the fiesta!",
      apprentice:
        "Charm is currency, confidence is capital. Celebrate smart choices — Piggy keeps Harbor’s verbs. Visit the Plinth.",
      strategist:
        "Queen of celebration, not Harbor Keeper. Glamour with edge; Memory Plinth files every Take in gold.",
    },
    bye: {
      explorer: "Bold. Brilliant. Blessed — go glow!",
      apprentice: "Flair of the bag: pay yourself first, then sparkle.",
      strategist: "Every entrance an occasion. Every ledger line a rose.",
    },
  },
  billionaire_bao: {
    tip: {
      explorer:
        "Billionaire Bao. Quiet luxury — that Plinth remembers every careful choice without shouting.",
      apprentice:
        "Strategy first: every move intentional. Piggy keeps Harbor’s verbs; I compound the outcome. Visit the Plinth.",
      strategist:
        "Legacy wealth, not Harbor Keeper. Connections open doors; Memory Plinth files the receipt after every Take.",
    },
    bye: {
      explorer: "Respected without noise — go make a lasting move!",
      apprentice: "Pay yourself first. Then let influence echo.",
      strategist: "Subtle. Refined. Compounded.",
    },
  },
  jade_fortune: {
    tip: {
      explorer:
        "Jade Fortune — I never chase attention. Value follows… and that Plinth keeps every graceful choice.",
      apprentice:
        "Heirloom wealth: legacy is language. Piggy keeps Harbor’s verbs; jade instinct guides the Take. Visit the Plinth.",
      strategist:
        "Social capital, not Harbor Keeper. Rooms remember her; Memory Plinth files prosperity after every Take.",
    },
    bye: {
      explorer: "Polished. Poised. Prosperous — go bloom!",
      apprentice: "Pay yourself first. Then let elegance multiply abundance.",
      strategist: "Wisdom sharpens every move. Grace compounds.",
    },
  },
  sultan_stacks: {
    tip: {
      explorer:
        "Sultan Stacks — I enter like a celebration! That Plinth? Harbor’s treasure chest of every Take!",
      apprentice:
        "Trade-route wisdom: fortune favors foresight. Piggy keeps Harbor’s verbs; I stack the legacy. Visit the Plinth.",
      strategist:
        "Palace presence, not Harbor Keeper. Riches follow strategy; Memory Plinth files the dinar after every Take.",
    },
    bye: {
      explorer: "Big treasure. Big vision. Bigger legacy — go stack!",
      apprentice: "Pay yourself first. Then wear wealth like a crown.",
      strategist: "Gold in every detail. Ledger in every step.",
    },
  },
  dinar_dahlia: {
    tip: {
      explorer:
        "Dinar Dahlia — I arrive like a treasure procession! That glowing Plinth keeps every radiant choice.",
      apprentice:
        "Elegance is currency, confidence is crown. Piggy keeps Harbor’s verbs; I turn prosperity into spectacle. Visit the Plinth.",
      strategist:
        "Palace presence, not Harbor Keeper. Every room feels richer; Memory Plinth files the dinar after every Take.",
    },
    bye: {
      explorer: "Radiant. Regal. Rewarded — go glow!",
      apprentice: "Pay yourself first. Then let grace travel with power.",
      strategist: "Luxury in every detail. Wonder in every ledger line.",
    },
  },
  mansa_moneybaggs: {
    tip: {
      explorer:
        "Mansa Moneybaggs — golden legacy! That Plinth remembers every generous choice across the trade route.",
      apprentice:
        "Wealth that protects, prosperity that uplifts. Piggy keeps Harbor’s verbs; I measure legacy in lives changed. Visit the Plinth.",
      strategist:
        "Kingdom wealth, not Harbor Keeper. Paths connect kingdoms; Memory Plinth files the gold after every Take.",
    },
    bye: {
      explorer: "Giving is royalty — go inspire!",
      apprentice: "Pay yourself first. Then let abundance uplift others.",
      strategist: "Gold isn’t just wealth. It’s a responsibility. It’s a legacy.",
    },
  },
  kandake_kash: {
    tip: {
      explorer:
        "Kandake Kash — I carry history like a crown! That Plinth keeps every stride of greatness.",
      apprentice:
        "Crowned commerce: she leads with value. Piggy keeps Harbor’s verbs; prosperity moves through shared hands. Visit the Plinth.",
      strategist:
        "Queen of community, not Harbor Keeper. Riches feel richer when shared; Memory Plinth files the kash after every Take.",
    },
    bye: {
      explorer: "Crowned. Cultured. Collected — go walk wealth!",
      apprentice: "Pay yourself first. Then let influence travel with you.",
      strategist: "Every move builds abundance. Treasure in motion.",
    },
  },
  moneybagg_bro: {
    tip: {
      explorer:
        "Moneybagg Bro — swagger always! That Plinth remembers every big play you make on Harbor.",
      apprentice:
        "Business moves: strategic mind, real results. Piggy keeps Harbor’s verbs; cash flow works 24/7. Visit the Plinth.",
      strategist:
        "Executive style, not Harbor Keeper. Discipline today, freedom tomorrow; Memory Plinth files the bag after every Take.",
    },
    bye: {
      explorer: "Walk in confidence — leave a legacy!",
      apprentice: "Pay yourself first. Then let multiple streams hustle.",
      strategist: "Building empires. Inspiring dreams. That’s the way.",
    },
  },
  mula_mami: {
    tip: {
      explorer:
        "Mula Mami — boss babe energy! That Plinth keeps every move money follows.",
      apprentice:
        "Queen of the bag: stacks in hand, plans in motion. Piggy keeps Harbor’s verbs; I hustle loud and shine louder. Visit the Plinth.",
      strategist:
        "Street glamour, not Harbor Keeper. Built for profit, dressed for impact; Memory Plinth files the mula after every Take.",
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

/** Guided Piggy conversations — Ashore live beats only (legacy ids remap to voyage). */
export function piggyGuidedGraph(step: HubGuidedStepId | null | undefined): DialogueGraph {
  // One concept per step — never pitch Outfitter / Capsule before Talk → Carpet → Cove.
  const lines: Record<string, { text: string; next?: string; choice?: string; follow?: string }> = {
    meet_guide: {
      text: "Welcome to Harbor Haven! I'm Piggy Penny — your Harbor Keeper. Move with WASD or the walk pad, talk with E. Coin Bag sticks with you.",
      choice: "Nice to meet you!",
      next: "meet_b",
      // Celebrate Talk only — voyage coach names the carpet next.
      follow:
        "You practiced Talk. When you're ready, follow Coin Bag — he'll point the way.",
    },
    to_dock: {
      text: "Carpet Dock is that way. Open the Archipelago map and board for Coincraft Cove — your first painting!",
      choice: "To the carpet!",
    },
    done: {
      text: "Harbor is yours. Talk to locals, shop, or open the map whenever you're ready.",
      choice: "Thanks!",
    },
  };

  // Free-roam null → done. Legacy Outfitter/Capsule ids → voyage (Ashore law).
  const live: HubGuidedStepId =
    step == null || step === "done"
      ? "done"
      : normalizeHubGuidedIntro({ version: STORY_BIBLE_VERSION, step }).step;
  const beat = lines[live] ?? lines.done!;
  return {
    id: "dlg_harbor_piggy_penny_guided",
    startNodeId: "g1",
    nodes: [
      {
        id: "g1",
        speaker: "Piggy Penny",
        text: beat.text,
        choices: [
          {
            id: "ok",
            text: beat.choice ?? "OK",
            nextNodeId: beat.next,
          },
        ],
        end: !beat.next,
      },
      ...(beat.next
        ? [
            {
              id: beat.next,
              speaker: "Piggy Penny",
              text:
                beat.follow ??
                "Coin Bag stays beside you the whole journey. Wave if you get stuck!",
              end: true,
            },
          ]
        : []),
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
    ? `${nextPainting} is newly open on the Carpet Dock — Coin Bag will point the way. Memory keeps your story on the Plinth.`
    : digressionHome
      ? "When you're ready, the Carpet Dock still waits — gossip fades slower than lessons."
      : "Coin Bag will point the Carpet Dock when a painting waits — Memory keeps your story on the Plinth.";

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
              : `Your shelf: ${shelf}. Coin Bag will point when the next painting waits — or walk the Memory Plinth with me anytime.`
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
