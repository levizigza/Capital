import type { DecisionCommitSpec } from "./types";

const PLAYER = { kind: "player" as const, id: "player:self", label: "Voyager" };
const HARBOR = { kind: "place" as const, id: "place:harbor_haven", label: "Harbor Haven" };
const KIRA = { kind: "npc" as const, id: "npc:kira", label: "Kira" };

const ALTS = [
  { id: "save", label: "Start a savings jar" },
  { id: "spend", label: "Buy the treat" },
];

/** Authored Cove-shaped Take — fixture only, not wired to IslandsApp. */
export function coveTakeCommit(choiceId: "save" | "spend"): DecisionCommitSpec {
  const saveBranch = choiceId === "save";
  return {
    id: "cove_save_vs_spend",
    verb: "take",
    choiceId,
    chosenLabel: saveBranch ? "Start a savings jar" : "Buy the treat",
    alternatives: ALTS,
    context: { placeId: "coincraft_cove", questId: "q_cc_save_or_spend", npcId: "kira" },
    consequences: saveBranch
      ? [
          {
            key: "business:IMMEDIATE",
            domain: "business",
            horizon: "IMMEDIATE",
            visibility: "felt",
            certainty_type: "certain",
            reversibility: "irreversible",
            magnitude: 5,
            affected_entities: [PLAYER, { kind: "holding", id: "holding:cove_jar", label: "Jar hold" }],
            explanation_data: {
              whatHappened: "A jar holding started catching leftover coins.",
              whyItHappened: "You chose to hold instead of spend.",
              priorDecisionHint: null,
              counterfactual: "Buy the treat would have opened a snack tab instead of a jar.",
              organHint: "Coin holds",
            },
          },
          {
            key: "liquidity:IMMEDIATE",
            domain: "liquidity",
            horizon: "IMMEDIATE",
            visibility: "felt",
            certainty_type: "certain",
            reversibility: "irreversible",
            magnitude: 5,
            affected_entities: [PLAYER],
            explanation_data: {
              whatHappened: "Monthly leftover improved a little.",
              whyItHappened: "The jar is an asset, not a bill.",
              priorDecisionHint: null,
              counterfactual: "Buy the treat would have tightened liquidity.",
              organHint: "Coin holds",
            },
          },
          {
            key: "story:SHORT_TERM",
            domain: "story",
            horizon: "SHORT_TERM",
            visibility: "named",
            certainty_type: "certain",
            reversibility: "irreversible",
            magnitude: 0,
            affected_entities: [HARBOR, KIRA],
            explanation_data: {
              whatHappened: "Harbor kept a plaque for the jar Take.",
              whyItHappened: "Memory keeps irreversible money choices.",
              priorDecisionHint: null,
              counterfactual: "Buy the treat would have left a different plaque.",
              organHint: "Memory keeps",
            },
          },
          {
            key: "neighborhood:MEDIUM_TERM",
            domain: "neighborhood",
            horizon: "MEDIUM_TERM",
            visibility: "felt",
            certainty_type: "likely",
            reversibility: "costly",
            magnitude: 1,
            affected_entities: [HARBOR],
            explanation_data: {
              whatHappened: "Harbor sky eased after leftover improved.",
              whyItHappened: "Cashflow weather follows the jar holding.",
              priorDecisionHint: null,
              counterfactual: "Buy the treat would have kept the sky tighter.",
              organHint: "Memory keeps",
            },
          },
          {
            key: "future_opportunities:LONG_TERM",
            domain: "future_opportunities",
            horizon: "LONG_TERM",
            visibility: "foreshadowed",
            certainty_type: "certain",
            reversibility: "irreversible",
            magnitude: 0,
            affected_entities: [{ kind: "opportunity", id: "opportunity:paycheck", label: "Paycheck painting" }],
            explanation_data: {
              whatHappened: "A later painting woke — a new situation, not the same jar.",
              whyItHappened: "Change on Cove opens the Clock shore.",
              priorDecisionHint: null,
              counterfactual: "Buy the treat still opens the painting, but with a tighter pouch.",
              organHint: "Clock shelters",
            },
          },
        ]
      : [
          {
            key: "debt:IMMEDIATE",
            domain: "debt",
            horizon: "IMMEDIATE",
            visibility: "felt",
            certainty_type: "certain",
            reversibility: "irreversible",
            magnitude: 5,
            affected_entities: [PLAYER, { kind: "holding", id: "holding:cove_tab", label: "Treat tab" }],
            explanation_data: {
              whatHappened: "A treat tab started nibbling leftover coins.",
              whyItHappened: "You chose to spend instead of hold.",
              priorDecisionHint: null,
              counterfactual: "Start a savings jar would have added an asset, not a tab.",
              organHint: "Coin holds",
            },
          },
          {
            key: "risk:IMMEDIATE",
            domain: "risk",
            horizon: "IMMEDIATE",
            visibility: "felt",
            certainty_type: "certain",
            reversibility: "irreversible",
            magnitude: 1,
            affected_entities: [PLAYER],
            explanation_data: {
              whatHappened: "A small bill made the next surprise harder.",
              whyItHappened: "Spending first raises exposure.",
              priorDecisionHint: null,
              counterfactual: "Start a savings jar would have lowered that exposure.",
              organHint: "Coin holds",
            },
          },
          {
            key: "liquidity:IMMEDIATE",
            domain: "liquidity",
            horizon: "IMMEDIATE",
            visibility: "felt",
            certainty_type: "certain",
            reversibility: "irreversible",
            magnitude: -5,
            affected_entities: [PLAYER],
            explanation_data: {
              whatHappened: "Monthly leftover shrank.",
              whyItHappened: "The tab is a liability.",
              priorDecisionHint: null,
              counterfactual: "Start a savings jar would have improved leftover.",
              organHint: "Coin holds",
            },
          },
          {
            key: "story:SHORT_TERM",
            domain: "story",
            horizon: "SHORT_TERM",
            visibility: "named",
            certainty_type: "certain",
            reversibility: "irreversible",
            magnitude: 0,
            affected_entities: [HARBOR, KIRA],
            explanation_data: {
              whatHappened: "Harbor kept a plaque for the treat Take.",
              whyItHappened: "Memory keeps irreversible money choices.",
              priorDecisionHint: null,
              counterfactual: "Start a savings jar would have left a jar plaque.",
              organHint: "Memory keeps",
            },
          },
          {
            key: "neighborhood:MEDIUM_TERM",
            domain: "neighborhood",
            horizon: "MEDIUM_TERM",
            visibility: "felt",
            certainty_type: "likely",
            reversibility: "costly",
            magnitude: -1,
            affected_entities: [HARBOR],
            explanation_data: {
              whatHappened: "Harbor sky tightened after leftover shrank.",
              whyItHappened: "Cashflow weather follows the treat tab.",
              priorDecisionHint: null,
              counterfactual: "Start a savings jar would have eased the sky.",
              organHint: "Memory keeps",
            },
          },
          {
            key: "future_opportunities:LONG_TERM",
            domain: "future_opportunities",
            horizon: "LONG_TERM",
            visibility: "foreshadowed",
            certainty_type: "certain",
            reversibility: "irreversible",
            magnitude: 0,
            affected_entities: [{ kind: "opportunity", id: "opportunity:paycheck", label: "Paycheck painting" }],
            explanation_data: {
              whatHappened: "A later painting woke — a new situation, not the same stall.",
              whyItHappened: "Change on Cove opens the Clock shore.",
              priorDecisionHint: null,
              counterfactual: "Start a savings jar still opens the painting, with more leftover.",
              organHint: "Clock shelters",
            },
          },
        ],
  };
}

/** Second commit that depends on Cove Change — tests chained prior decisions. */
export function paycheckTakeCommit(opts: { priorCoveDecisionId: string }): DecisionCommitSpec {
  return {
    id: "paycheck_protect_vs_spend",
    verb: "take",
    choiceId: "protect",
    chosenLabel: "Umbrella before glitter",
    alternatives: [
      { id: "protect", label: "Umbrella before glitter" },
      { id: "spend", label: "Glitter ate the umbrella" },
    ],
    priorDecisionIds: [opts.priorCoveDecisionId],
    consequences: [
      {
        key: "liquidity:IMMEDIATE",
        domain: "liquidity",
        horizon: "IMMEDIATE",
        visibility: "felt",
        certainty_type: "certain",
        reversibility: "irreversible",
        magnitude: 4,
        affected_entities: [PLAYER],
        explanation_data: {
          whatHappened: "An umbrella buffer started catching rainy-day hits.",
          whyItHappened: "You chose shelter before glitter.",
          priorDecisionHint: "Cove Change already taught hold-vs-spend — this is a new stall.",
          counterfactual: "Glitter ate the umbrella would have added a glitter tab instead.",
          organHint: "Clock shelters",
        },
      },
      {
        key: "future_opportunities:LONG_TERM",
        domain: "future_opportunities",
        horizon: "LONG_TERM",
        visibility: "hidden",
        certainty_type: "conditional",
        conditionId: "freedom_seal",
        reversibility: "irreversible",
        magnitude: 0,
        affected_entities: [{ kind: "opportunity", id: "opportunity:credit", label: "Credit Kingdom" }],
        explanation_data: {
          whatHappened: "Credit's door unlatched after Freedom plus this Change.",
          whyItHappened: "The spiral ordeal waits on escape and Paycheck judgment.",
          priorDecisionHint: "Cove Change opened Paycheck; Freedom plus this Take opens Credit.",
          counterfactual: "Glitter ate the umbrella still completes Change, with less leftover.",
          organHint: "Spiral withstands",
        },
      },
    ],
  };
}
