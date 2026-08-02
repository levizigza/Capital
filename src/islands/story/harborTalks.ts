/**
 * Harbor talk graphs — Piggy Penny + plaza locals.
 * Used for Pokémon-style Talk Battle encounters on Harbor Haven.
 */

import type { DialogueGraph, IslandNpc, ProfileText } from "../types";
import { HARBOR_LOCAL_CAST, getMascot, type MoneyMascotId } from "../moneyCast";
import type { HubGuidedStepId } from "./storyBible";
import { scarOrganId, scarOrganName } from "../worldMemory";

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
      explorer: "I’m always near the Outfitter if you need me!",
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
  return {
    id: gid,
    startNodeId: "n1",
    nodes: [
      {
        id: "n1",
        speaker: m.name,
        text: {
          explorer: `Hi! I’m ${m.name}. ${m.tagline} Want a tiny money tip?`,
          apprentice: `${m.name} here. ${m.tagline} Got a minute for a Harbor tip?`,
          strategist: `${m.name}. ${m.tagline} Quick beat before you sail?`,
        },
        choices: [
          {
            id: "yes",
            text: {
              explorer: "Yes please!",
              apprentice: "Sure — tip me.",
              strategist: "Go ahead.",
            },
            nextNodeId: "n2",
          },
          {
            id: "later",
            text: {
              explorer: "Maybe later!",
              apprentice: "Catch you later.",
              strategist: "Not now.",
            },
            nextNodeId: "n3",
          },
        ],
      },
      {
        id: "n2",
        speaker: m.name,
        text: beat.tip,
        end: true,
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

/** Guided Piggy conversations — one short turn-based beat per Castle Grounds step */
export function piggyGuidedGraph(step: HubGuidedStepId | null | undefined): DialogueGraph {
  const lines: Record<string, { text: string; next?: string; choice?: string }> = {
    meet_guide: {
      text: "Welcome to Harbor Haven! I'm Piggy Penny. Stick with Coin Bag — first we'll make YOU at the Outfitter.",
      choice: "Let's go!",
      next: "meet_b",
    },
    walk_outfitter: {
      text: "See that Outfitter door? Walk over and press Enter. Become the Voyager you want to be!",
      choice: "On my way!",
    },
    become_you: {
      text: "Looking sharp already. Finish Body · Coat · Gear on the mirror, then come say hi again.",
      choice: "Got it!",
    },
    tiny_spend: {
      text: "Coins can buy help. Peek Capsule Stall with Coin Bag — a tiny spend is still a choice.",
      choice: "I'll peek!",
    },
    practice_optional: {
      text: "Practice board if you want drills — or skip straight to the Carpet Dock. Your call!",
      choice: "Thanks, Piggy!",
    },
    to_dock: {
      text: "Carpet Dock is that way. Open the Archipelago map and sail to your first painting!",
      choice: "To the dock!",
    },
    first_island: {
      text: "Coincraft Cove is waiting. I'll be here when you fly home changed.",
      choice: "See you soon!",
    },
    done: {
      text: "Harbor is yours. Talk to locals, shop, or open the map whenever you're ready.",
      choice: "Thanks!",
    },
  };

  const beat = lines[step ?? "done"] ?? lines.done!;
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
              text: "Coin Bag stays beside you the whole journey. Wave if you get stuck!",
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

/** Welcome-back Talk Battle after Cove Change (or any chapter homecoming). */
export function piggyHomecomingGraph(
  message?: string | null,
  opts?: {
    scars?: { id?: string; label: string; islandId?: string }[];
    bondBeat?: number;
  },
): DialogueGraph {
  const opener =
    message?.replace(/^Piggy Penny:\s*/i, "").trim() ||
    "You earned coins and made a real choice. Harbor feels different because YOU are.";

  const named = (opts?.scars ?? [])
    .slice(-3)
    .map((s) => {
      const id = `${s.id ?? ""} ${s.islandId ?? ""}`.toLowerCase();
      if (id.includes("cove")) return `Cove — ${s.label}`;
      if (id.includes("pp_") || id.includes("paycheck")) return `Peninsula — ${s.label}`;
      if (id.includes("credit")) return `Kingdom — ${s.label}`;
      return s.label;
    });
  const scarLine =
    named.length > 0
      ? `Your Memory Plinth holds: ${named.join(" · ")}.`
      : "Coin Bag and I watched you grow.";
  const bond =
    opts?.bondBeat && opts.bondBeat >= 3
      ? "Three homecomings. Cove, Dotgraph, Kingdom — I trust your pouch, and you."
      : opts?.bondBeat && opts.bondBeat >= 2
        ? "Second time you've flown home changed. I'm proud — and a little sniffly."
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
        : phase === "trust"
          ? bond
          : bond;

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
        text: "Coin Bag will point the Carpet Dock when a painting waits — or wander the plaza and read your Memory Plinth. Harbor keeps your story.",
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
  scars?: { id?: string; label: string; islandId?: string }[];
  /** Count of celebrated homecomings / scars for Piggy bond depth */
  bondBeat?: number;
  /** Dominant stance for local greeting flavor */
  stanceHint?: string | null;
  /** Prior talks with this NPC */
  npcTalks?: number;
};

function formatScarShelf(
  scars: { id?: string; label: string; islandId?: string }[],
): string {
  return scars
    .slice(-3)
    .map((s) => {
      const id = `${s.id ?? ""} ${s.islandId ?? ""}`.toLowerCase();
      if (id.includes("cove")) return `Cove — ${s.label}`;
      if (id.includes("pp_") || id.includes("paycheck")) return `Peninsula — ${s.label}`;
      if (id.includes("credit")) return `Kingdom — ${s.label}`;
      return s.label;
    })
    .join(" · ");
}

/** Free-roam Piggy when plaques exist — conscience that remembers. */
export function piggyMemoryGraph(
  scars: { id?: string; label: string; islandId?: string }[],
  opts?: { stanceHint?: string | null },
): DialogueGraph {
  const shelf = formatScarShelf(scars);
  const latestScar = scars[scars.length - 1];
  const latest = latestScar?.label ?? "your choice";
  const organ = latestScar
    ? scarOrganName(
        scarOrganId({
          id: latestScar.id ?? "",
          islandId: latestScar.islandId ?? "",
        }),
      )
    : "Memory";
  const stance = opts?.stanceHint ? ` ${opts.stanceHint}` : "";
  return {
    id: "dlg_harbor_piggy_penny_memory",
    startNodeId: "m1",
    nodes: [
      {
        id: "m1",
        speaker: "Piggy Penny",
        text: `The Plinth still holds the ${organ} — “${latest}.”${stance} Harbor doesn’t forget — and neither do I.`,
        choices: [{ id: "m1_ok", text: "I see it too", nextNodeId: "m2" }],
      },
      {
        id: "m2",
        speaker: "Piggy Penny",
        text:
          shelf.length > 0
            ? `Your shelf: ${shelf}. Coin Bag will point when the next painting waits — or walk the Memory Plinth with me anytime.`
            : "Coin Bag sticks with you. When a painting calls, we’ll float together.",
        choices: [{ id: "m2_ok", text: "Thanks, Piggy!" }],
        end: true,
      },
    ],
  };
}

/** Plaza local who names the scar — living receipt, not ambient prop. */
function scarMemoryLocalGraph(
  mascotId: MoneyMascotId,
  scars: { id?: string; label: string; islandId?: string }[],
  opts: { stanceHint?: string | null; npcTalks?: number },
): DialogueGraph {
  const base = localGraph(mascotId);
  const m = getMascot(mascotId);
  const latestScar = scars[scars.length - 1];
  const latest = latestScar?.label ?? "that choice";
  const organ = latestScar
    ? scarOrganName(
        scarOrganId({
          id: latestScar.id ?? "",
          islandId: latestScar.islandId ?? "",
        }),
      )
    : "Memory";
  const talks =
    (opts.npcTalks ?? 0) >= 2 ? ` We’ve talked ${opts.npcTalks} times —` : "";
  const stanceBit = opts.stanceHint ? ` ${opts.stanceHint}` : "";
  const habit =
    organ === "Clock"
      ? "still stamp about"
      : organ === "Spiral"
        ? "still weigh"
        : organ === "Memory"
          ? "still name"
          : "still tip jars about";
  return {
    ...base,
    id: `dlg_harbor_${mascotId}_scar_memory`,
    startNodeId: "s0",
    nodes: [
      {
        id: "s0",
        speaker: m.name,
        text: `${talks} Folks ${habit} the ${organ} — “${latest}” — on the Plinth.${stanceBit} Money left footprints.`,
        choices: [{ id: "s0_ok", text: "Harbor felt that", nextNodeId: "n1" }],
      },
      ...base.nodes,
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

  if (npcId !== "piggy_penny" && hasScars) {
    try {
      return scarMemoryLocalGraph(npcId as MoneyMascotId, scars, {
        stanceHint: opts.stanceHint,
        npcTalks: opts.npcTalks,
      });
    } catch {
      /* fall through */
    }
  }

  if (npcId !== "piggy_penny" && (opts.stanceHint || (opts.npcTalks ?? 0) >= 2)) {
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
