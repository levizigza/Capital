/**
 * Harbor talk graphs — Piggy Penny + plaza locals.
 * Used for Pokémon-style Talk Battle encounters on Harbor Haven.
 */

import type { DialogueGraph, IslandNpc } from "../types";
import { HARBOR_LOCAL_CAST, getMascot } from "../moneyCast";
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

function localGraph(mascotId: string): DialogueGraph {
  const m = getMascot(mascotId as Parameters<typeof getMascot>[0]);
  const gid = `dlg_harbor_${mascotId}`;
  return {
    id: gid,
    startNodeId: "n1",
    nodes: [
      {
        id: "n1",
        speaker: m.name,
        text: {
          explorer: `Hi! I'm ${m.name}. ${m.tagline} Want a tiny money tip?`,
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
        text: {
          explorer: "Pay yourself first — even one coin in the jar counts. Then play!",
          apprentice: "Budget the fun money after you set aside savings. Harbor smiles when you do both.",
          strategist: "Separate needs, wants, and buffers before you browse Capsule Stall impulse buys.",
        },
        end: true,
      },
      {
        id: "n3",
        speaker: m.name,
        text: {
          explorer: "Okay! Wave when you want to chat.",
          apprentice: "Door's open. I'll be on the plaza.",
          strategist: "Understood. Find me when you're ready.",
        },
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
