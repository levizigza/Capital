/**
 * Harbor talk graphs — Piggy Penny + plaza locals.
 * Used for Pokémon-style Talk Battle encounters on Harbor Haven.
 */

import type { DialogueGraph, IslandNpc, ProfileText } from "../types";
import { HARBOR_LOCAL_CAST, getMascot, type MoneyMascotId } from "../moneyCast";
import type { HubGuidedStepId } from "./storyBible";

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

export function resolveHarborDialogue(
  npcId: string,
  guidedStep?: HubGuidedStepId | null,
): DialogueGraph | undefined {
  if (npcId === "piggy_penny" && guidedStep && guidedStep !== "done") {
    return piggyGuidedGraph(guidedStep);
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
