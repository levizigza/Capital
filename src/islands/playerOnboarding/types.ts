export const PLAYER_ONBOARDING_VERSION = 1 as const;

/** Session intent — distinct from learningProfile text difficulty. */
export type PlayerOnboardingMode = "new" | "experienced" | "returning";

export type PlayerOnboardingState = {
  version: typeof PLAYER_ONBOARDING_VERSION;
  /** Chosen at cast select — persists across sessions. */
  declaredMode?: "new" | "experienced";
  /** Updated on every save persist — absence detection for returning briefing. */
  lastActiveAt?: string;
  /** Last time the returning briefing was dismissed. */
  reorientationSeenAt?: string;
  /** Concept ids first seen in GUIDED+ since last session (returning “new systems”). */
  systemsSeenAt?: Record<string, string>;
};

export type ReturningBriefingSection = {
  id: string;
  title: string;
  body: string;
};

export type ReturningBriefingRefresher = {
  id: string;
  label: string;
  /** Settings action key IslandsApp understands. */
  action: "ashore_chambers" | "controls_hint" | "ledger_hud";
};

export type ReturningBriefing = {
  mode: "returning";
  headline: string;
  sections: ReturningBriefingSection[];
  refreshers: ReturningBriefingRefresher[];
};
