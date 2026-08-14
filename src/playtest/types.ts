/**
 * Structured playtesting — session capture + pattern synthesis.
 * OBSERVATION ≠ INTERPRETATION ≠ PROPOSED FIX.
 * @see docs/playtest/README.md
 */

/** Signature / Harbor beats used to tag moments */
export type PlaytestMomentCode =
  | "ashore_cast"
  | "ashore_piggy_talk"
  | "carpet_to_cove"
  | "cove_explore"
  | "cove_take"
  | "take_hush"
  | "carpet_home"
  | "scar_spectacle"
  | "plinth_share"
  | "piggy_homecoming"
  | "day2_echo"
  | "soft_beat"
  | "structure_enter"
  | "structure_exit"
  | "harbor_plaza"
  | "outfitter"
  | "capsule"
  | "daily_ritual"
  | "family_room"
  | "travel_map"
  | "paycheck"
  | "credit"
  | "other";

export type ReactionKind =
  | "hesitation"
  | "failure"
  | "smile"
  | "confusion"
  | "ignored_intent"
  | "unexpected_strategy"
  | "delight"
  | "frustration"
  | "boredom";

export type EvidenceSource =
  | "live_session"
  | "remote_recording"
  | "desk_synthesis"
  | "e2e_observation"
  | "telemetry_hint";

/** One atomic beat inside a session — still raw observation-first */
export type PlaytestMoment = {
  id: string;
  /** Wall-clock or approximate mm:ss from session start */
  at?: string;
  momentCode: PlaytestMomentCode;
  /** What the player tried to do (behavior) */
  attempted: string;
  /** What they said/thought would happen (belief) — quote when possible */
  believedWouldHappen: string;
  /** What the build actually did */
  actuallyHappened: string;
  reactions: ReactionKind[];
  /** Free notes — still observation layer */
  notes?: string;
};

/**
 * Triage card — only filled after observation is written.
 * Never skip OBSERVATION.
 */
export type TriageCard = {
  id: string;
  /** Links to moment ids and/or session ids */
  basedOn: string[];
  observation: string;
  interpretation: string;
  proposedFix: string;
  /** Recurring? leave null until pattern pass */
  patternId?: string | null;
  /** Ship / park / needs more sessions */
  disposition: "investigate" | "park" | "ship_candidate" | "wont_fix";
};

export type PlaytestSession = {
  id: string;
  cycleId: string;
  date: string;
  facilitator: string;
  playerLabel: string;
  /** Age band or role — never real names/emails in committed files */
  playerProfile: string;
  device: "phone" | "tablet" | "desktop";
  reducedMotion: boolean;
  buildRef?: string;
  source: EvidenceSource;
  /** Fresh profile / QA seed / mid-save */
  startCondition: string;
  goalPrompt: string;
  moments: PlaytestMoment[];
  /** Six iconic questions — short answers */
  sixQuestions: {
    misunderstoodWhatToDo?: string;
    feltUnfair?: string;
    repetitiveWithoutNewBeat?: string;
    ignoredPlayerAbility?: string;
    gotLost?: string;
    funOrOnlyFunctional?: string;
  };
  triage?: TriageCard[];
  rawNotes?: string;
};

export type RecurringPattern = {
  id: string;
  title: string;
  /** How many independent sessions showed this */
  sessionCount: number;
  sessionIds: string[];
  momentCodes: PlaytestMomentCode[];
  reactionKinds: ReactionKind[];
  observation: string;
  interpretation: string;
  proposedFix: string;
  /** Do not auto-ship — needs craft owner */
  disposition: TriageCard["disposition"];
};

export type PlaytestCycle = {
  id: string;
  title: string;
  startedAt: string;
  endedAt?: string;
  hypothesis: string;
  sessionIds: string[];
  /** Patterns with sessionCount >= threshold */
  patterns: RecurringPattern[];
  /** One-off cards parked — not every complaint becomes a fix */
  parkedOneOffs: TriageCard[];
  shipCandidates: TriageCard[];
  summary: string;
};
