export type IslandId = string;
export type AreaId = string;
export type NpcId = string;
export type ItemId = string;
export type QuestId = string;
export type MinigameId = string;

export type DialogueNodeId = string;

/** A text field that supports per-profile variants. Plain string = same for all profiles. */
export type ProfileText = string | { explorer?: string; apprentice?: string; strategist?: string };

/** A numeric field that supports per-profile variants. Plain number = same for all profiles. */
export type ProfileNumber = number | { explorer?: number; apprentice?: number; strategist?: number };

export type AnalyticsEventName =
  | "session_started"
  | "session_ended"
  | "screen_enter"
  | "screen_exit"
  | "tutorial_started"
  | "tutorial_completed"
  | "tutorial_step"
  | "quest_started"
  | "quest_completed"
  | "quest_failed_attempt"
  | "minigame_started"
  | "minigame_completed"
  | "minigame_retry"
  | "fail_reason"
  | "dialogue_started"
  | "dialogue_choice"
  | "item_collected"
  | "area_entered"
  | "island_entered"
  | "islands_exit"
  | "difficulty_changed"
  | "settings_changed"
  | "character_saved"
  | "onboarding_completed"
  | "hint_escalated";

export type AnalyticsEvent = {
  id: string;
  ts: string;
  name: AnalyticsEventName;
  payload?: Record<string, unknown>;
};

export type DialogueChoice = {
  id: string;
  text: ProfileText;
  nextNodeId?: DialogueNodeId;
  effects?: DialogueEffect[];
  requiresItems?: ItemId[];
};

export type DialogueNode = {
  id: DialogueNodeId;
  speaker: string;
  text: ProfileText;
  choices?: DialogueChoice[];
  end?: boolean;
};

export type DialogueGraph = {
  id: string;
  startNodeId: DialogueNodeId;
  nodes: DialogueNode[];
};

export type DialogueEffect =
  | { type: "startQuest"; questId: QuestId }
  | { type: "completeQuest"; questId: QuestId }
  | { type: "giveItem"; itemId: ItemId }
  | { type: "startMinigame"; minigameId: MinigameId };

export type IslandItem = {
  id: ItemId;
  name: string;
  description: string;
  icon: string;
  location: { areaId: AreaId };
  tagline?: string;
  homage?: string;
};

export type IslandNpc = {
  id: NpcId;
  name: string;
  icon: string;
  areaId: AreaId;
  dialogueGraphId: string;
  /** Optional money-culture wink shown under the name */
  tagline?: string;
  /** Money Mascot body id from the world cast */
  mascotId?: string;
};

export type QuestObjective =
  | { type: "talkToNpc"; npcId: NpcId }
  | { type: "collectItem"; itemId: ItemId }
  | { type: "completeMinigame"; minigameId: MinigameId; scoreThreshold?: ProfileNumber };

export type IslandQuest = {
  id: QuestId;
  title: ProfileText;
  description: ProfileText;
  hint?: ProfileText;
  objectives: QuestObjective[];
  rewards?: { coins?: number; xp?: number; items?: ItemId[] };
};

export type IslandArea = {
  id: AreaId;
  name: string;
  description: string;
  icon: string;
  connections?: AreaId[];
  requiredItems?: ItemId[];
};

export type MinigameModuleRef = {
  /** Registry key, e.g. "EarnSpend", "EnvelopeBudget" */
  id: string;
  /** JSON-serialisable config passed to module.init() */
  config: Record<string, unknown>;
};

export type IslandMinigame = {
  id: MinigameId;
  name: string;
  description: string;
  icon: string;
  componentId: string;
  areaId?: AreaId;
  /** Mechanic modules that compose this minigame's logic */
  modules?: MinigameModuleRef[];
  /** Platform catalog metadata */
  genre?: string;
  complexity?: "easy" | "medium" | "hard";
  visualShell?: string;
  estimatedMinutes?: number;
  /** Short pop-culture wink line (safe homage, not a trademarked title) */
  homage?: string;
};

export type ContentProvenance = {
  learning_objectives: string[];
  mechanics_used: string[];
  originality_notes: string;
  forbidden_references: string[];
};

export type IslandDefinition = {
  id: IslandId;
  name: string;
  description: string;
  icon: string;
  /** Override visual theme preset (defaults to island id) */
  themeId?: string;
  requiredItems?: ItemId[];
  provenance?: ContentProvenance;
  areas: IslandArea[];
  npcs: IslandNpc[];
  items: IslandItem[];
  quests: IslandQuest[];
  dialogues: DialogueGraph[];
  minigames?: IslandMinigame[];
};

export type MinigameProps = {
  minigameId: MinigameId;
  island: IslandDefinition;
  save: IslandSaveV1;
  difficulty: "easy" | "normal" | "hard";
  learningProfile: import("./learningProfile").LearningProfileId;
  onComplete: (success: boolean, score?: number, timeline?: import("./decisionTimeline").DecisionTimeline) => void;
  onClose: () => void;
};

export type IslandsContent = {
  version: string;
  islands: IslandDefinition[];
};

export type QuestStatus = {
  started: boolean;
  completed: boolean;
  completedObjectives: string[];
  startedAt?: string;
  completedAt?: string;
};

/** A resolved scenario event stored for replay/audit. */
export type SavedEvent = {
  eventId: string;
  deckId: string;
  choiceIndex: number;
  timestamp: string;
};

export type IslandSaveV1 = {
  version: "1";
  updatedAt: string;
  currentIslandId?: IslandId;
  currentAreaId?: AreaId;
  inventory: ItemId[];
  questStatus: Record<QuestId, QuestStatus>;
  completedMinigames: MinigameId[];
  discovered: {
    npcs: NpcId[];
    items: ItemId[];
    areas: AreaId[];
    islands: IslandId[];
  };
  /** Last N resolved scenario events for replay/audit */
  eventHistory?: SavedEvent[];
  /** RPG soft-skill stats (Resilience, Discipline, Foresight) */
  skillStats?: import("./skillStats").SkillStatsState;
  /** Dynamic economy macro-phase state (Boom/Normal/Recession) */
  economyState?: import("./economy").EconomyState;
  /** Player's home-island avatar/character */
  character?: import("./character").CapitalCharacter;
  /** Whether the first-run world onboarding has been completed */
  onboardingComplete?: boolean;
  /** Voyager Ledger — Cashflow-style income/expenses/holdings */
  voyagerLedger?: import("./voyagerLedger").VoyagerLedger;
  /** Harbor Haven purchases — carpet polish, plaza passes, owned pets */
  harborShop?: import("./harborShop").HarborShopState;
  /**
   * Fortune Archipelago party state per island:
   * position, Ledger Seals, Fortune Capsules, rival captains, session turns.
   */
  partyBoard?: Record<
    IslandId,
    {
      position: number;
      turnsPlayed: number;
      /** Ledger Seals earned on this island */
      stars: number;
      items?: import("./partyItems").PartyItemId[];
      buffs?: {
        doubleCoinsNext?: boolean;
        shielded?: boolean;
        bailoutReady?: boolean;
      };
      rivals?: import("./partyRivals").RivalBoardState[];
      turnsRemaining?: number;
    }
  >;
};
