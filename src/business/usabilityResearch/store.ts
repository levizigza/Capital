/**
 * Usability research — observational test definitions + finding classes.
 * No PII. Does not drive Harbor runtime UX.
 */

export type FindingClass =
  | "CRITICAL_BLOCKER"
  | "MAJOR_FRICTION"
  | "MINOR_FRICTION"
  | "DELIGHT"
  | "OPPORTUNITY"
  | "UNEXPECTED_BEHAVIOR";

export type TestId =
  | "UT-01"
  | "UT-02"
  | "UT-03"
  | "UT-04"
  | "UT-05"
  | "UT-06"
  | "UT-07"
  | "UT-08"
  | "UT-09"
  | "UT-10"
  | "UT-11"
  | "UT-12"
  | "UT-13";

export interface ObservationalTest {
  id: TestId;
  researchQuestion: string;
  targetUser: string;
  startingState: string;
  /** Goal phrasing — never step-by-step UI instructions */
  task: string;
  expectedBehavior: string;
  successCondition: string;
  failureCondition: string;
  observableSignals: string[];
  /** Soft time box for success window (seconds), if any */
  successTimeBoxSec?: number;
}

export interface UsabilityFinding {
  id: string;
  class: FindingClass;
  testIds: TestId[];
  participantIds: string[];
  evidenceRefs: string[];
  confidence: "low" | "med" | "high";
  summary: string;
  recommendation:
    | "no_change"
    | "copy"
    | "ux"
    | "bugfix"
    | "needs_more_evidence";
}

/** Phrases that must never appear in participant-facing task text. */
export const FORBIDDEN_TASK_PATTERNS: RegExp[] = [
  /click\s+the/i,
  /press\s+e\b/i,
  /open\s+settings/i,
  /board\s+the\s+money\s+carpet/i,
  /talk\s+to\s+piggy/i,
  /select\s+.+\s+and\s+/i,
];

export const OBSERVATIONAL_TESTS: ObservationalTest[] = [
  {
    id: "UT-01",
    researchQuestion:
      "Can a new player find a meaningful next action in Harbor without instruction?",
    targetUser: "S1 parent cold start (solo or with child observing)",
    startingState: "Fresh profile; Harbor plaza interactive after Ashore",
    task: "You’ve arrived somewhere new. Figure out what you’re supposed to do next here.",
    expectedBehavior: "Approach guide and Talk; avoid treating utilities as the quest",
    successCondition: "Initiates guide Talk or states+executes correct next goal within 4 minutes",
    failureCondition: "No Talk/carpet progress in 4 minutes; only utilities; abandon",
    observableSignals: [
      "hesitation",
      "misinterpretation",
      "questions",
      "uninstructed_discovery",
      "delight",
    ],
    successTimeBoxSec: 240,
  },
  {
    id: "UT-02",
    researchQuestion: "Can the player discover how to travel to the first island adventure?",
    targetUser: "S1 after first guide Talk",
    startingState: "Harbor post-Piggy Talk; carpet available",
    task: "You want to go on your first money adventure away from this harbor. Show me how you’d get there.",
    expectedBehavior: "Board Money Carpet / travel to Coincraft Cove",
    successCondition: "Arrives on Cove shore within 5 minutes",
    failureCondition: "Cannot leave Harbor in 5 minutes; Outfitter mistaken for adventure",
    observableSignals: ["hesitation", "mistakes", "abandon", "time_to_complete"],
    successTimeBoxSec: 300,
  },
  {
    id: "UT-03",
    researchQuestion:
      "Can the player complete an irreversible money choice and notice it is consequential?",
    targetUser: "S1 parent or parent+child co-play",
    startingState: "Coincraft Cove shore, chapter playable",
    task: "Somewhere on this shore, you’ll need to make a money choice you can’t undo. Find that moment and make the choice you think is right — then tell me what you think will happen because of it.",
    expectedBehavior: "Find irreversible Take Talk; choose; experience hush/cinema",
    successCondition: "Completes Take and verbalizes a consequence prediction; hush begins",
    failureCondition: "No Take in 10 minutes; unrelated activities only; soft-lock",
    observableSignals: [
      "cause_and_effect",
      "hesitation",
      "delight",
      "misinterpretation",
      "expectation_mismatch",
    ],
    successTimeBoxSec: 600,
  },
  {
    id: "UT-04",
    researchQuestion: "After Take hush, can the player return to Harbor?",
    targetUser: "Continues from UT-03",
    startingState: "Cove post-Take; chapterQuietPending / soft home cue",
    task: "Things feel different now. Get back to the place you started from today.",
    expectedBehavior: "Carpet / travel home",
    successCondition: "Harbor plaza within 3 minutes",
    failureCondition: "Stuck on Cove ≥3 minutes; tries to undo Take",
    observableSignals: ["hesitation", "abandon", "uninstructed_discovery"],
    successTimeBoxSec: 180,
  },
  {
    id: "UT-05",
    researchQuestion: "Does the player connect Cove choice to Harbor’s reaction?",
    targetUser: "Continues from UT-04",
    startingState: "Harbor quiet homecoming / scar spectacle",
    task: "Something happened here because of what you did earlier. Show me how you can tell — and what you think this place is trying to show you.",
    expectedBehavior: "Attend Plinth spectacle; link to prior choice",
    successCondition: "Points to Harbor reaction and links to Cove choice within 4 minutes",
    failureCondition: "No meaning ascribed; no Plinth attention; bug attribution only",
    observableSignals: ["cause_and_effect", "delight", "questions", "expectation_mismatch"],
    successTimeBoxSec: 240,
  },
  {
    id: "UT-06",
    researchQuestion: "Can the player obtain the share PNG without prescribed clicks?",
    targetUser: "Post-spectacle when share UI available",
    startingState: "HarborFelt share overlay reachable",
    task: "You want to show a friend or family member what just happened — using something from the game, not a phone photo of the whole screen. Show me how you’d do that.",
    expectedBehavior: "Share or download Harbor-felt card",
    successCondition: "Share or download within 2 minutes",
    failureCondition: "Only manual screenshot; cannot find share; permanent dismiss",
    observableSignals: ["mistakes", "expectation_mismatch", "delight", "abandon"],
    successTimeBoxSec: 120,
  },
  {
    id: "UT-07",
    researchQuestion: "Can the player identify the newly available next adventure?",
    targetUser: "Post Piggy homecoming",
    startingState: "Harbor; Paycheck unlocked",
    task: "If you came back tomorrow, where would you go next to keep learning about money? Show me how you’d get there — you don’t have to finish that place.",
    expectedBehavior: "Indicate Paycheck via carpet/map",
    successCondition: "Correct next destination selected/highlighted within 3 minutes",
    failureCondition: "Only Cove; utilities as next learning",
    observableSignals: ["hesitation", "misinterpretation", "cause_and_effect"],
    successTimeBoxSec: 180,
  },
  {
    id: "UT-08",
    researchQuestion: "Can players enter a Money Structure, interact once, and exit cleanly?",
    targetUser: "S1 or cold adult",
    startingState: "Harbor Ledger Bank available or Cove Coin Jar pre-Take",
    task: "There’s a landmark here that’s about money in a bigger way than a normal stall. Get inside it, try one thing, then get back out to walking around outside.",
    expectedBehavior: "Enter, poke part/toy, exit to walkable world",
    successCondition: "Enter + interact + exit within 5 minutes",
    failureCondition: "Cannot enter/exit; crash mental model",
    observableSignals: ["hesitation", "delight", "mistakes", "abandon"],
    successTimeBoxSec: 300,
  },
  {
    id: "UT-09",
    researchQuestion: "Can the participant retell choice → Harbor consequence?",
    targetUser: "Completed UT-03–05",
    startingState: "Harbor after spectacle",
    task: "Pretend I wasn’t watching. Tell me the story of what you chose and what changed because of it. You can use the game to help you remember, but you don’t have to.",
    expectedBehavior: "Retell fork + Harbor-side consequence",
    successCondition: "Names choice fork and ≥1 Harbor consequence",
    failureCondition: "No recall; combat framing; nothing changed",
    observableSignals: ["cause_and_effect", "uninstructed_discovery"],
  },
  {
    id: "UT-10",
    researchQuestion: "On return, can the player see the world still remembers the scar?",
    targetUser: "Returning S1 same profile",
    startingState: "Day-2 / scar_echo ready",
    task: "You’re back after some time away. Has anything about your earlier money choice stuck around? Show me how you can tell.",
    expectedBehavior: "Notice echo / Plinth memory",
    successCondition: "Identifies day-2 memory signal within 4 minutes",
    failureCondition: "Treats Harbor as new; ignores echo",
    observableSignals: ["delight", "misinterpretation", "cause_and_effect"],
    successTimeBoxSec: 240,
  },
  {
    id: "UT-11",
    researchQuestion: "In co-play, where does control handoff break task success?",
    targetUser: "S1 parent+child 7–10",
    startingState: "Fresh or mid Cove; shared device",
    task: "Together, get to a money choice that matters and finish it. Decide between yourselves who steers — I won’t assign roles.",
    expectedBehavior: "Handoff; complete Take; both can state choice",
    successCondition: "Take completed; both state the choice",
    failureCondition: "Child fully disengaged; rage-quit; no progress ≥8 minutes",
    observableSignals: ["hesitation", "questions", "abandon", "delight"],
    successTimeBoxSec: 480,
  },
  {
    id: "UT-12",
    researchQuestion: "Can a comfort-seeking player find text/motion relief without a tour?",
    targetUser: "Adult wanting larger text or less motion",
    startingState: "Harbor free roam",
    task: "The motion or text isn’t comfortable for you. Make this easier to play using anything in the product — then return to walking around.",
    expectedBehavior: "Find Settings; adjust a11y; return",
    successCondition: "Changes ≥1 relevant setting and returns within 3 minutes",
    failureCondition: "Cannot find Settings; leaves due to comfort",
    observableSignals: ["hesitation", "mistakes", "delight"],
    successTimeBoxSec: 180,
  },
  {
    id: "UT-13",
    researchQuestion: "Can household share work without assuming cloud multiplayer?",
    targetUser: "S1 multi-device household",
    startingState: "Harbor; Family Room available",
    task: "You want another person in your household to continue this adventure on their device later — without an account on a company server if you can help it. Show me what you’d try.",
    expectedBehavior: "Family Room export/import or correct local-only conclusion",
    successCondition: "Export/import success or correct local-only understanding in 5 minutes",
    failureCondition: "Assumes cloud friends; cannot find Feature; save corruption",
    observableSignals: ["expectation_mismatch", "misinterpretation", "questions"],
    successTimeBoxSec: 300,
  },
];

export const COLD_SIGNATURE_BUNDLE: TestId[] = [
  "UT-01",
  "UT-02",
  "UT-03",
  "UT-04",
  "UT-05",
  "UT-06",
  "UT-07",
  "UT-09",
];

export function testById(id: TestId, tests = OBSERVATIONAL_TESTS): ObservationalTest {
  const t = tests.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown test ${id}`);
  return t;
}

export function assertTasksAreGoals(tests = OBSERVATIONAL_TESTS): void {
  for (const t of tests) {
    for (const re of FORBIDDEN_TASK_PATTERNS) {
      if (re.test(t.task)) {
        throw new Error(`${t.id} task looks instructional: /${re.source}/`);
      }
    }
  }
}

export function findingHasEvidence(f: UsabilityFinding): boolean {
  return (
    f.evidenceRefs.length > 0 &&
    f.participantIds.length > 0 &&
    f.testIds.length > 0 &&
    f.summary.trim().length > 0
  );
}

export function assertFindingEvidence(f: UsabilityFinding): void {
  if (!findingHasEvidence(f)) {
    throw new Error(`${f.id} missing required evidence fields`);
  }
}
