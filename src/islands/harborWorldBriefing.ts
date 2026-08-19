/**
 * Harbor world briefing — Piggy's interactive chart after first Talk.
 * Curiosity, not a syllabus: name places + game flavor, never map Cove Take → Paycheck.
 */

import type { MoneyOrganId } from "./moneyOrgans";

export type HarborBriefingCardId =
  | "harbor_haven"
  | "coincraft_cove"
  | "paycheck_peninsula"
  | "credit_kingdom"
  | "side_shores";

export type HarborBriefingLane = "home" | "spine" | "side";

export type HarborBriefingCard = {
  id: HarborBriefingCardId;
  name: string;
  lane: HarborBriefingLane;
  organ: MoneyOrganId;
  era: string;
  /** One-line objective — kid sentence */
  objective: string;
  /** Financial games flavor — curiosity, not a checklist */
  games: string;
  piggyLine: string;
  required: boolean;
};

export const HARBOR_BRIEFING_CARDS: HarborBriefingCard[] = [
  {
    id: "harbor_haven",
    name: "Harbor Haven",
    lane: "home",
    organ: "memory",
    era: "Home",
    objective: "This plaza is home. Walk, talk, and the Memory Plinth keeps your marks.",
    games: "Talk locals · Ledger Bank memory toys · Plinth proof",
    piggyLine:
      "You're already here — Harbor Haven. Walk the fountain, talk to me, then Coin Bag points the carpet. Later the Plinth will glow with what you chose.",
    required: true,
  },
  {
    id: "coincraft_cove",
    name: "Coincraft Cove",
    lane: "spine",
    organ: "coin",
    era: "1990s",
    objective: "First painting — earn fair coins, then choose. Harbor remembers.",
    games: "Coin sort · Coin catcher · Giant Coin Jar",
    piggyLine:
      "Coincraft Cove is your first painting. Play coin games, then make a choice that sticks. Don't worry about later shores yet.",
    required: true,
  },
  {
    id: "paycheck_peninsula",
    name: "Paycheck Peninsula",
    lane: "spine",
    organ: "clock",
    era: "1960s",
    objective: "Opens after Cove Change — a stall with two prices. Clock organ; Harbor won't map the answer.",
    games: "Budget buckets · Inbox storm · Payroll Tower",
    piggyLine:
      "Paycheck Peninsula waits until Harbor trusts your Cove mark. Clock games live there — I won't map the answer.",
    required: false,
  },
  {
    id: "credit_kingdom",
    name: "Credit Kingdom",
    lane: "spine",
    organ: "spiral",
    era: "2010s",
    objective: "Late ordeal — borrow and withstand. Opens after Harbor trusts your transfer.",
    games: "Score scanner · Interest Keep · spiral recovery",
    piggyLine:
      "Credit Kingdom is the far Keep. Spiral games about borrowing. It stays locked until Harbor sees you can transfer what you learned.",
    required: false,
  },
  {
    id: "side_shores",
    name: "Outer ring · side shores",
    lane: "side",
    organ: "memory",
    era: "Open world",
    objective: "Extra financial games — not required. They wake after Paycheck Change.",
    games: "Kart budgets · neon wages · gene reefs · orbital deeds · and more",
    piggyLine:
      "The outer ring is open-world extra. Side quests wake after Paycheck Change — never gate the ending.",
    required: false,
  },
];

export const HARBOR_BRIEFING_GOAL =
  "Leave a mark Harbor keeps — then come home changed. Inner ring is the main voyage. Outer ring is extra.";

export function briefingCard(id: HarborBriefingCardId): HarborBriefingCard {
  return HARBOR_BRIEFING_CARDS.find((c) => c.id === id)!;
}

export function requiredBriefingIds(): HarborBriefingCardId[] {
  return HARBOR_BRIEFING_CARDS.filter((c) => c.required).map((c) => c.id);
}

export function briefingReady(inspected: Iterable<string>): boolean {
  const have = new Set(inspected);
  return requiredBriefingIds().every((id) => have.has(id));
}
