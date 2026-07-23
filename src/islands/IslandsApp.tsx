import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";

import {
  GameViewport,
  GameScreenStack,
  GameModal,
  GameButton,
  GamePanel,
  GameTooltipProvider,
} from "@/game-ui";

import { HomeHubView } from "./views/HomeHubView";
import { TravelMapView } from "./views/TravelMapView";
import { PovVoyageView } from "./views/PovVoyageView";
import { IslandBoardView } from "./views/IslandBoardView";
import { IslandPlayView } from "./views/IslandPlayView";
import { PartyRewardOverlay } from "./views/PartyRewardOverlay";
import { ArcadeView } from "./platform/ArcadeView";
import { VibeCodeStudio } from "./studio/VibeCodeStudio";
import { IslandThemeProvider } from "./themes/IslandThemeProvider";
import { getIslandTheme } from "./themes/islandThemes";
import { WelcomeOnboarding } from "./views/WelcomeOnboarding";
import type { CapitalCharacter } from "./character";
import { BASE_VOYAGER } from "./character";
import { HUB_ISLAND_ID, isHubIslandId } from "./worldMapLayout";
import { islandHasChapterContent } from "./chapterLoop";
import { COVE_CHANGE_QUEST_ID } from "./islandIds";

import { COINCRAFT_SKIN_CLASS, isCoincraftIsland, NpcPortrait, shouldUseCoincraftSkin } from "@/art/coincraft";
import { cn } from "@/lib/utils";

import type { UserProfile } from "@/App";

import { analytics } from "./analytics";
import { trackScreenEnter, trackScreenExit } from "./analytics/screenTracking";
import { loadIslandsContent, getIslandById, invalidateContentCache, ISLANDS_CONTENT_RELOAD_EVENT } from "./content/loader";
import { loadIslandSave, persistIslandSave, createDefaultIslandSave } from "./save";
import type {
  AreaId,
  DialogueGraph,
  DialogueNode,
  DialogueNodeId,
  IslandDefinition,
  IslandSaveV1,
  ItemId,
  MinigameId,
  NpcId,
  QuestId,
  QuestObjective,
} from "./types";
import { getMinigameComponent } from "./minigames/registry";
import {
  loadAccessibilitySettings,
  persistAccessibilitySettings,
  textSizeClass,
  recordMinigameAttempt,
  recordQuestFailedAttempt,
  getQuestFailedAttempts,
  getDifficultyForMinigame,
  type AccessibilitySettings,
  type DifficultyLevel,
} from "./settings";
import {
  loadLearningProfile,
  persistLearningProfile,
  resolveProfileText,
  meetsScoreThreshold,
  resolveProfileNumber,
  type LearningProfileId,
} from "./learningProfile";

const LazyIslandEditor = lazy(() => import("./IslandEditor"));
const LazyReplayModal = lazy(() => import("./ReplayModal"));
const LazyAnalyticsExport = lazy(() => import("./analytics/AnalyticsExportView"));

const TUTORIAL_STARTED_KEY = "islands_tutorial_started_v1";
const TUTORIAL_QUEST_IDS = new Set(["q_cc_first_coins"]);

import type { DecisionTimeline } from "./decisionTimeline";
import {
  createDefaultSkillStats,
  applySkillChanges,
  questCompletionBonuses,
} from "./skillStats";
import {
  createDefaultEconomyState,
  advanceEconomy,
} from "./economy";
import { useFxOptional } from "@/fx";
import { mountQABridge } from "@/qa/qaBridge";
import { computeMinigameReward, getPartyState } from "./partyBoard";
import type { MinigameBoardReward } from "./partyBoard";
import { ensureLedger, hasMasteryClear, markMasteryClear } from "./voyagerLedger";
import { getMasteryGateForMinigame, type MasteryGateDef } from "./masteryGate";
import { MasteryQuiz } from "./views/MasteryQuiz";
import { withHarborFreedomRewards } from "./progressGates";
import {
  applyCapsulePurchase,
  applyCarpetPolish,
  applyPlazaPass,
  applyCompanionPurchase,
} from "./harborShop";
import {
  advanceHubGuided,
  createDefaultHubGuidedIntro,
  isHubGuidedComplete,
} from "./story/hubGuidedIntro";

type IslandsAppProps = {
  userProfile: UserProfile;
  setUserProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onExit: () => void;
  onReplayIntro?: () => void;
};

type View = "home" | "travel" | "voyage" | "island" | "chapter" | "arcade" | "studio";
type VoyageReturn = "home" | "travel" | "island" | "chapter";
type MinigameSource = "board" | "arcade" | "dialogue" | "qa" | null;

type PendingMasteryClear = {
  gate: MasteryGateDef;
  mgId: MinigameId;
  score?: number;
  timeline?: DecisionTimeline;
  source: MinigameSource;
  firstClear: boolean;
};

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function objectiveKey(obj: QuestObjective): string {
  if (obj.type === "talkToNpc") return `talk:${obj.npcId}`;
  if (obj.type === "collectItem") return `item:${obj.itemId}`;
  if (obj.type === "completeMinigame") return `minigame:${obj.minigameId}`;
  return JSON.stringify(obj);
}

function findDialogue(graphs: DialogueGraph[], graphId: string): DialogueGraph | undefined {
  return graphs.find((g) => g.id === graphId);
}

function findNode(graph: DialogueGraph, nodeId: DialogueNodeId): DialogueNode | undefined {
  return graph.nodes.find((n) => n.id === nodeId);
}

export default function IslandsApp({ userProfile, setUserProfile, onExit, onReplayIntro }: IslandsAppProps) {
  const [contentTick, setContentTick] = useState(0);
  const content = useMemo(() => {
    void contentTick;
    return loadIslandsContent();
  }, [contentTick]);

  useEffect(() => {
    const onReload = () => setContentTick((t) => t + 1);
    window.addEventListener(ISLANDS_CONTENT_RELOAD_EVENT, onReload);
    return () => window.removeEventListener(ISLANDS_CONTENT_RELOAD_EVENT, onReload);
  }, []);

  const [view, setView] = useState<View>("home");
  const [save, setSave] = useState<IslandSaveV1 | null>(null);
  /** After carpet POV boot flight — skip 2D welcome cards and land on Harbor. */
  const [bootLandHub] = useState(() => {
    try {
      if (sessionStorage.getItem("capital_boot_land_hub") === "1") {
        sessionStorage.removeItem("capital_boot_land_hub");
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  });
  const [bootHubHandled, setBootHubHandled] = useState(false);

  const [activeIslandId, setActiveIslandId] = useState<string | null>(null);
  const activeIsland = useMemo(
    () => (activeIslandId ? getIslandById(content, activeIslandId) : undefined),
    [content, activeIslandId]
  );

  const [dialogueState, setDialogueState] = useState<{
    open: boolean;
    graphId?: string;
    nodeId?: string;
    npcId?: NpcId;
  }>({ open: false });

  const [hubModal, setHubModal] = useState<
    "outfitter" | "capsule" | "settings" | "pavilion" | null
  >(null);
  const [devCheatsOpen, setDevCheatsOpen] = useState(false);
  const [activeMinigameId, setActiveMinigameId] = useState<MinigameId | null>(null);
  const [minigameSource, setMinigameSource] = useState<MinigameSource>(null);
  const [pendingBoardReward, setPendingBoardReward] = useState<MinigameBoardReward | null>(null);
  const [pendingBoardMinigameName, setPendingBoardMinigameName] = useState<string | null>(null);
  const [pendingMastery, setPendingMastery] = useState<PendingMasteryClear | null>(null);
  const [voyageTargetId, setVoyageTargetId] = useState<string | null>(null);
  const [voyageReturnView, setVoyageReturnView] = useState<VoyageReturn>("travel");
  const [showEditor, setShowEditor] = useState(
    () => import.meta.env.DEV && new URLSearchParams(window.location.search).get("islandEditor") === "1"
  );
  const [a11y, setA11y] = useState<AccessibilitySettings>(() => loadAccessibilitySettings());
  const [learningProfile, setLearningProfile] = useState<LearningProfileId>(() => loadLearningProfile());
  const [minigameStartedAt, setMinigameStartedAt] = useState<number | null>(null);
  const [pendingReplayTimeline, setPendingReplayTimeline] = useState<DecisionTimeline | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsSessionReady, setAnalyticsSessionReady] = useState(false);
  const fx = useFxOptional();

  const updateLearningProfile = useCallback((id: LearningProfileId) => {
    setLearningProfile(id);
    persistLearningProfile(id);
    analytics.track("settings_changed", { learningProfile: id });
  }, []);

  const updateA11y = useCallback((next: AccessibilitySettings) => {
    setA11y(next);
    persistAccessibilitySettings(next);
    analytics.track("settings_changed", { ...next });
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const loaded = await loadIslandSave();
      if (!mounted) return;
      setSave(loaded);
      if (loaded.currentIslandId) setActiveIslandId(loaded.currentIslandId);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!save || analyticsSessionReady) return;
    void (async () => {
      await analytics.track("session_started", {});
      if (!localStorage.getItem(TUTORIAL_STARTED_KEY)) {
        await analytics.track("tutorial_started", { source: "first_islands_session" });
        localStorage.setItem(TUTORIAL_STARTED_KEY, "1");
      }
      setAnalyticsSessionReady(true);
    })();
  }, [save, analyticsSessionReady]);

  useEffect(() => {
    if (!save || !analyticsSessionReady) return;
    const screen =
      view === "home"
        ? "islands_hub"
        : view === "travel"
          ? "islands_travel"
          : view === "voyage"
            ? "islands_voyage"
            : view === "arcade"
            ? "islands_arcade"
            : view === "studio"
              ? "islands_studio"
              : `islands_play:${activeIslandId ?? "unknown"}`;
    void trackScreenEnter(screen, {
      view,
      islandId: activeIslandId ?? undefined,
    });
  }, [view, activeIslandId, save, analyticsSessionReady]);

  const handleExit = useCallback(async () => {
    await trackScreenExit("user_exit");
    await analytics.track("islands_exit", {});
    await analytics.track("session_ended", { reason: "user_exit" });
    onExit();
  }, [onExit]);

  const updateSave = useCallback((updater: (prev: IslandSaveV1) => IslandSaveV1) => {
    setSave((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      persistIslandSave(next).catch((e) => console.warn("[islands] failed to persist save", e));
      return next;
    });
  }, []);

  const saveCharacter = useCallback(
    (character: CapitalCharacter) => {
      updateSave((prev) => {
        const guided = prev.hubGuidedIntro ?? createDefaultHubGuidedIntro();
        return {
          ...prev,
          character,
          hubGuidedIntro: advanceHubGuided(guided, "saved_outfitter"),
        };
      });
      if (character.name) {
        setUserProfile((prev) => (prev ? { ...prev, name: character.name } : prev));
      }
      void analytics.track("character_saved", { base: character.base, color: character.color });
    },
    [updateSave, setUserProfile]
  );

  const onHarborPurchase = useCallback(
    (purchase: import("./views/HomeHubView").HarborPurchase): boolean => {
      let charged = false;
      setUserProfile((prev) => {
        if (!prev || prev.totalCoins < purchase.price) return prev;
        charged = true;
        return { ...prev, totalCoins: prev.totalCoins - purchase.price };
      });
      if (!charged) return false;
      updateSave((prev) => {
        let next = prev;
        if (purchase.kind === "capsule") next = applyCapsulePurchase(prev, purchase.itemId);
        else if (purchase.kind === "carpet") next = applyCarpetPolish(prev, purchase.tierId);
        else if (purchase.kind === "plaza_pass") next = applyPlazaPass(prev, purchase.room);
        else if (purchase.kind === "companion") next = applyCompanionPurchase(prev, purchase.companionId);
        const guided = next.hubGuidedIntro ?? createDefaultHubGuidedIntro();
        return {
          ...next,
          hubGuidedIntro:
            purchase.kind === "capsule"
              ? advanceHubGuided(guided, "capsule_bought")
              : guided,
        };
      });
      void analytics.track("harbor_purchase", { kind: purchase.kind, price: purchase.price });
      return true;
    },
    [setUserProfile, updateSave],
  );

  const onHubGuidedEvent = useCallback(
    (event: Parameters<typeof advanceHubGuided>[1]) => {
      updateSave((prev) => {
        if (isHubGuidedComplete(prev.hubGuidedIntro)) return prev;
        const guided = prev.hubGuidedIntro ?? createDefaultHubGuidedIntro();
        return { ...prev, hubGuidedIntro: advanceHubGuided(guided, event) };
      });
    },
    [updateSave],
  );

  const enterIsland = useCallback(
    async (islandId: string) => {
      const island = getIslandById(content, islandId);
      if (!island) return;

      const applyEnter = async () => {
        await analytics.track("island_entered", { islandId });

        updateSave((prev) => {
          const defaultArea = island.areas[0]?.id;
          return {
            ...prev,
            currentIslandId: islandId,
            currentAreaId: prev.currentIslandId === islandId ? prev.currentAreaId || defaultArea : defaultArea,
            discovered: {
              ...prev.discovered,
              islands: uniq([...prev.discovered.islands, islandId]),
              areas: defaultArea ? uniq([...prev.discovered.areas, defaultArea]) : prev.discovered.areas,
            },
          };
        });

        setActiveIslandId(islandId);
        setVoyageTargetId(null);
        // Harbor Haven is the 3D walkable plaza — never dump players on the party board by default.
        if (isHubIslandId(islandId)) {
          setView("home");
        } else if (islandHasChapterContent(island)) {
          setView("chapter");
        } else {
          setView("island");
        }
      };

      // Dissolve at mid-point so the era theme + morph land together (skip if reduced motion / no FX).
      if (fx && !a11y.reducedMotion) {
        await fx.playAreaTransition(applyEnter);
      } else {
        await applyEnter();
      }
    },
    [a11y.reducedMotion, content, fx, updateSave]
  );

  const completeOnboarding = useCallback(() => {
    updateSave((prev) => ({
      ...prev,
      onboardingComplete: true,
      character: prev.character ?? { ...BASE_VOYAGER },
      hubGuidedIntro: prev.hubGuidedIntro ?? createDefaultHubGuidedIntro(),
    }));
    void analytics.track("onboarding_completed", {});
    // After card onboarding, still run Castle Grounds verbs in 3D Harbor — not straight to board.
    setActiveIslandId(HUB_ISLAND_ID);
    setView("home");
  }, [updateSave]);

  // Carpet opening lands you on Harbor Haven plaza (3D walk) — not the party board yet.
  useEffect(() => {
    if (!save || !bootLandHub || bootHubHandled || content.islands.length === 0) return;
    setBootHubHandled(true);
    const hub = getIslandById(content, HUB_ISLAND_ID);
    const defaultArea = hub?.areas[0]?.id;
    updateSave((prev) => ({
      ...prev,
      onboardingComplete: true,
      character: prev.character ?? { ...BASE_VOYAGER, name: userProfile.name || "Voyager" },
      currentIslandId: HUB_ISLAND_ID,
      currentAreaId: defaultArea ?? prev.currentAreaId,
      // Castle Grounds guided lap — carpet magic stays; teaching starts here.
      hubGuidedIntro: prev.hubGuidedIntro?.step
        ? prev.hubGuidedIntro
        : createDefaultHubGuidedIntro(),
      discovered: {
        ...prev.discovered,
        islands: uniq([...prev.discovered.islands, HUB_ISLAND_ID]),
        areas: defaultArea ? uniq([...prev.discovered.areas, defaultArea]) : prev.discovered.areas,
      },
    }));
    if (!save.onboardingComplete) {
      void analytics.track("onboarding_completed", { via: "carpet_boot" });
    }
    void analytics.track("island_entered", { islandId: HUB_ISLAND_ID, via: "carpet_boot" });
    setActiveIslandId(HUB_ISLAND_ID);
    setView("home");
  }, [save, bootLandHub, bootHubHandled, content, updateSave, userProfile.name]);

  const updatePartyState = useCallback(
    (islandId: string, next: import("./partyBoard").PartyIslandState) => {
      updateSave((prev) => ({
        ...prev,
        partyBoard: {
          ...prev.partyBoard,
          [islandId]: next,
        },
      }));
    },
    [updateSave]
  );

  const awardPartyStar = useCallback(
    (islandId: string) => {
      updateSave((prev) => {
        const current = getPartyState(prev, islandId);
        return {
          ...prev,
          partyBoard: {
            ...prev.partyBoard,
            [islandId]: { ...current, stars: current.stars + 1 },
          },
        };
      });
    },
    [updateSave]
  );

  const handleBoardSpaceReward = useCallback(
    (payload: {
      coins: number;
      xp?: number;
      star?: boolean;
      message: string;
      itemTip?: string;
      ledger?: import("./voyagerLedger").VoyagerLedger;
    }) => {
      if (payload.coins || payload.xp) {
        setUserProfile((prev) => ({
          ...prev,
          totalCoins: Math.max(0, prev.totalCoins + (payload.coins || 0)),
          xp: prev.xp + (payload.xp || 0),
        }));
      }
      if (payload.star && activeIslandId) {
        awardPartyStar(activeIslandId);
      }
      if (payload.ledger) {
        updateSave((prev) => {
          const next = {
            ...prev,
            voyagerLedger: payload.ledger,
          };
          return withHarborFreedomRewards(next);
        });
      }
    },
    [activeIslandId, awardPartyStar, setUserProfile, updateSave]
  );

  const startVoyage = useCallback((targetIslandId: string, returnView: VoyageReturn) => {
    setVoyageTargetId(targetIslandId);
    setVoyageReturnView(returnView);
    setView("voyage");
  }, []);

  const boardBoat = useCallback((returnView: VoyageReturn) => {
    setVoyageTargetId(null);
    setVoyageReturnView(returnView);
    setView("voyage");
  }, []);

  const cancelVoyage = useCallback(() => {
    setVoyageTargetId(null);
    setView(voyageReturnView);
  }, [voyageReturnView]);

  const launchBoardMinigame = useCallback(
    (minigameId: MinigameId) => {
      if (!activeIsland) return;
      setMinigameSource("board");
      setActiveMinigameId(minigameId);
      setMinigameStartedAt(Date.now());
      void analytics.track("minigame_started", {
        islandId: activeIsland.id,
        minigameId,
        source: "board",
      });
      void trackScreenEnter(`minigame:${minigameId}`, {
        islandId: activeIsland.id,
        minigameId,
        source: "board",
      });
    },
    [activeIsland]
  );

  const enterArea = useCallback(
    async (areaId: AreaId) => {
      if (!activeIsland || !save) return;
      if (!activeIsland.areas.some((a) => a.id === areaId)) return;
      if (save.currentAreaId === areaId) return;

      const applyEnter = async () => {
        await analytics.track("area_entered", { islandId: activeIsland.id, areaId });
        updateSave((prev) => ({
          ...prev,
          currentAreaId: areaId,
          discovered: {
            ...prev.discovered,
            areas: uniq([...prev.discovered.areas, areaId]),
          },
        }));
      };

      if (fx && !a11y.reducedMotion) {
        await fx.playAreaTransition(applyEnter);
      } else {
        await applyEnter();
      }
    },
    [activeIsland, save, updateSave, fx, a11y.reducedMotion],
  );

  const startQuest = useCallback(
    async (questId: QuestId) => {
      if (!activeIsland) return;

      const quest = activeIsland.quests.find((q) => q.id === questId);
      if (!quest) return;

      await analytics.track("quest_started", { islandId: activeIsland.id, questId });

      updateSave((prev) => {
        const existing = prev.questStatus[questId];
        if (existing?.started) return prev;
        return {
          ...prev,
          questStatus: {
            ...prev.questStatus,
            [questId]: {
              started: true,
              completed: false,
              completedObjectives: [],
              startedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [activeIsland, updateSave]
  );

  useEffect(() => {
    if (!save) return;
    return mountQABridge({
      ready: true,
      getView: () => view,
      getSave: () => save,
      enterIsland: (islandId) => {
        void enterIsland(islandId);
      },
      openTravel: () => setView("travel"),
      openHub: () => setView("home"),
      startMinigame: (minigameId) => {
        setMinigameSource("qa");
        setActiveMinigameId(minigameId as MinigameId);
        setMinigameStartedAt(Date.now());
        void analytics.track("minigame_started", {
          islandId: activeIslandId ?? undefined,
          minigameId,
          source: "qa_bridge",
        });
        void trackScreenEnter(`minigame:${minigameId}`, { minigameId, source: "qa_bridge" });
      },
      startQuest: (questId) => {
        void startQuest(questId as QuestId);
      },
      persistSave: async () => {
        await persistIslandSave(save);
      },
      resetSave: async () => {
        const fresh = createDefaultIslandSave();
        setSave(fresh);
        setActiveIslandId(null);
        setView("home");
        await persistIslandSave(fresh);
      },
    });
  }, [save, view, enterIsland, startQuest, activeIslandId]);

  const maybeCompleteQuest = useCallback(
    async (questId: QuestId) => {
      if (!activeIsland) return;
      const quest = activeIsland.quests.find((q) => q.id === questId);
      if (!quest) return;

      let shouldComplete = false;
      updateSave((prev) => {
        const status = prev.questStatus[questId];
        if (!status?.started || status.completed) return prev;
        const required = quest.objectives.map(objectiveKey);
        const have = status.completedObjectives;
        const allDone = required.every((k) => have.includes(k));
        if (!allDone) return prev;
        shouldComplete = true;
        return {
          ...prev,
          questStatus: {
            ...prev.questStatus,
            [questId]: {
              ...status,
              completed: true,
              completedAt: new Date().toISOString(),
            },
          },
        };
      });

      if (!shouldComplete) return;

      await analytics.track("quest_completed", { islandId: activeIsland.id, questId });

      if (TUTORIAL_QUEST_IDS.has(questId)) {
        await analytics.track("tutorial_completed", {
          questId,
          islandId: activeIsland.id,
          source: "tutorial_quest",
        });
      } else {
        const completedCount = Object.values(save?.questStatus ?? {}).filter((q) => q.completed).length;
        if (completedCount === 0) {
          await analytics.track("tutorial_completed", {
            questId,
            islandId: activeIsland.id,
            source: "first_quest",
          });
        }
      }

      const rewards = quest.rewards;
      if (rewards?.coins || rewards?.xp) {
        setUserProfile((prev) => ({
          ...prev,
          totalCoins: prev.totalCoins + (rewards.coins || 0),
          xp: prev.xp + (rewards.xp || 0),
        }));
      }

      if (rewards?.items && rewards.items.length > 0) {
        updateSave((prev) => ({
          ...prev,
          inventory: uniq([...prev.inventory, ...rewards.items!]),
          discovered: {
            ...prev.discovered,
            items: uniq([...prev.discovered.items, ...rewards.items!]),
          },
        }));
      }

      // Apply skill stat bonuses for completing the quest
      const questSkillBonuses = questCompletionBonuses(questId, resolveProfileText(quest.title, learningProfile));
      if (questSkillBonuses.length > 0) {
        updateSave((prev) => {
          const stats = prev.skillStats ?? createDefaultSkillStats();
          return { ...prev, skillStats: applySkillChanges(stats, questSkillBonuses) };
        });
      }

      // Cove Change beat → Harbor homecoming celebration + unlock Island 2.
      if (questId === COVE_CHANGE_QUEST_ID) {
        updateSave((prev) => ({
          ...prev,
          harborHomecoming: {
            pending: true,
            celebrated: false,
            chapterIslandId: activeIsland.id,
            questId,
            message:
              "Piggy Penny: You earned coins and made a real choice. Harbor feels different because YOU are.",
          },
        }));
      }
    },
    [activeIsland, learningProfile, setUserProfile, updateSave, save?.questStatus]
  );

  const completeObjective = useCallback(
    async (objective: QuestObjective) => {
      if (!activeIsland) return;

      const key = objectiveKey(objective);

      const startedQuestIds = activeIsland.quests
        .map((q) => q.id)
        .filter((id) => save?.questStatus[id]?.started && !save?.questStatus[id]?.completed);

      updateSave((prev) => {
        const nextQuestStatus = { ...prev.questStatus };
        for (const questId of startedQuestIds) {
          const status = nextQuestStatus[questId];
          if (!status || status.completed) continue;
          nextQuestStatus[questId] = {
            ...status,
            completedObjectives: uniq([...status.completedObjectives, key]),
          };
        }
        return { ...prev, questStatus: nextQuestStatus };
      });

      for (const questId of startedQuestIds) {
        await maybeCompleteQuest(questId);
      }
    },
    [activeIsland, maybeCompleteQuest, save?.questStatus, updateSave]
  );

  const collectItem = useCallback(
    async (itemId: ItemId) => {
      if (!activeIsland) return;
      const item = activeIsland.items.find((i) => i.id === itemId);
      if (!item) return;

      await analytics.track("item_collected", { islandId: activeIsland.id, itemId });

      updateSave((prev) => {
        if (prev.inventory.includes(itemId)) return prev;
        return {
          ...prev,
          inventory: uniq([...prev.inventory, itemId]),
          discovered: {
            ...prev.discovered,
            items: uniq([...prev.discovered.items, itemId]),
          },
        };
      });

      await completeObjective({ type: "collectItem", itemId });
    },
    [activeIsland, completeObjective, updateSave]
  );

  const openNpcDialogue = useCallback(
    async (npcId: NpcId) => {
      if (!activeIsland) return;
      const npc = activeIsland.npcs.find((n) => n.id === npcId);
      if (!npc) return;

      await analytics.track("dialogue_started", { islandId: activeIsland.id, npcId });

      updateSave((prev) => ({
        ...prev,
        discovered: {
          ...prev.discovered,
          npcs: uniq([...prev.discovered.npcs, npcId]),
        },
      }));

      setDialogueState({ open: true, graphId: npc.dialogueGraphId, nodeId: undefined, npcId });

      void trackScreenEnter(`dialogue:${npcId}`, { islandId: activeIsland.id, npcId });

      await completeObjective({ type: "talkToNpc", npcId });
    },
    [activeIsland, completeObjective, updateSave]
  );

  const applyDialogueEffects = useCallback(
    async (effects: Array<{ type: string; [k: string]: any }> | undefined) => {
      if (!effects) return;
      for (const effect of effects) {
        if (effect.type === "startQuest") {
          await startQuest(effect.questId);
        }
        if (effect.type === "giveItem") {
          await collectItem(effect.itemId);
        }
        if (effect.type === "startMinigame") {
          const diff = getDifficultyForMinigame(effect.minigameId);
          await analytics.track("minigame_started", {
            islandId: activeIsland?.id,
            minigameId: effect.minigameId,
            difficulty: diff,
            source: "dialogue",
          });
          setMinigameSource("dialogue");
          setMinigameStartedAt(Date.now());
          setActiveMinigameId(effect.minigameId);
          void trackScreenEnter(`minigame:${effect.minigameId}`, {
            islandId: activeIsland?.id,
            minigameId: effect.minigameId,
          });
        }
        if (effect.type === "completeQuest") {
          await analytics.track("quest_completed", { islandId: activeIsland?.id, questId: effect.questId });
          updateSave((prev) => {
            const status = prev.questStatus[effect.questId];
            if (!status) return prev;
            return {
              ...prev,
              questStatus: {
                ...prev.questStatus,
                [effect.questId]: {
                  ...status,
                  started: true,
                  completed: true,
                  completedAt: new Date().toISOString(),
                },
              },
            };
          });
        }
      }
    },
    [activeIsland?.id, analytics, collectItem, startQuest, updateSave]
  );

  const dialogueGraph = useMemo(() => {
    if (!activeIsland || !dialogueState.graphId) return undefined;
    return findDialogue(activeIsland.dialogues, dialogueState.graphId);
  }, [activeIsland, dialogueState.graphId]);

  const dialogueNode = useMemo(() => {
    if (!dialogueGraph) return undefined;
    const nodeId = (dialogueState.nodeId || dialogueGraph.startNodeId) as DialogueNodeId;
    return findNode(dialogueGraph, nodeId);
  }, [dialogueGraph, dialogueState.nodeId]);

  const onDialogueChoice = useCallback(
    async (choiceId: string) => {
      if (!dialogueNode || !dialogueGraph) return;
      const choice = dialogueNode.choices?.find((c) => c.id === choiceId);
      if (!choice) return;

      await analytics.track("dialogue_choice", {
        islandId: activeIsland?.id,
        graphId: dialogueGraph.id,
        nodeId: dialogueNode.id,
        choiceId,
      });

      await applyDialogueEffects(choice.effects as any);

      if (choice.nextNodeId) {
        setDialogueState((s) => ({ ...s, nodeId: choice.nextNodeId }));
      } else {
        setDialogueState({ open: false });
        void trackScreenEnter(`islands_play:${activeIsland?.id ?? "unknown"}`, {
          islandId: activeIsland?.id,
        });
      }
    },
    [activeIsland?.id, analytics, applyDialogueEffects, dialogueGraph, dialogueNode]
  );

  const closeDialogue = useCallback(() => {
    setDialogueState({ open: false });
    void trackScreenEnter(`islands_play:${activeIsland?.id ?? "unknown"}`, {
      islandId: activeIsland?.id,
    });
  }, [activeIsland?.id]);

  const handleMinigameAbandon = useCallback(async () => {
    if (!activeMinigameId) {
      setActiveMinigameId(null);
      setMinigameStartedAt(null);
      return;
    }
    const durationMs = minigameStartedAt ? Date.now() - minigameStartedAt : 0;
    await analytics.track("fail_reason", {
      context: "minigame",
      minigameId: activeMinigameId,
      islandId: activeIsland?.id,
      reason: "abandoned",
      durationMs,
    });
    setActiveMinigameId(null);
    setMinigameStartedAt(null);
    setMinigameSource(null);
    void trackScreenEnter(`islands_play:${activeIsland?.id ?? "unknown"}`, {
      islandId: activeIsland?.id,
    });
  }, [activeIsland?.id, activeMinigameId, minigameStartedAt]);

  const onMinigameComplete = useCallback(
    async (success: boolean, score?: number, timeline?: DecisionTimeline) => {
      if (!activeMinigameId || !activeIsland || !save) return;

      const source = minigameSource;
      const mgId = activeMinigameId;
      const firstClear = !save.completedMinigames.includes(mgId);
      const durationMs = minigameStartedAt ? Date.now() - minigameStartedAt : 0;
      const difficulty = getDifficultyForMinigame(activeMinigameId);
      const thresholdObjective = activeIsland.quests
        .flatMap((q) => q.objectives)
        .find(
          (o): o is Extract<QuestObjective, { type: "completeMinigame" }> =>
            o.type === "completeMinigame" &&
            o.minigameId === activeMinigameId &&
            o.scoreThreshold !== undefined,
        );
      const meetsThreshold = meetsScoreThreshold(score, thresholdObjective?.scoreThreshold, learningProfile);
      const questSuccess = success && meetsThreshold;
      const perf = recordMinigameAttempt(activeMinigameId, questSuccess, score, durationMs);

      await analytics.track("minigame_completed", {
        islandId: activeIsland.id,
        minigameId: activeMinigameId,
        success: questSuccess,
        score,
        scoreThreshold: thresholdObjective?.scoreThreshold
          ? resolveProfileNumber(thresholdObjective.scoreThreshold, learningProfile)
          : undefined,
        learningProfile,
        durationMs,
        difficulty,
        attempt: perf.attempts,
        successRate: perf.attempts > 0 ? (perf.successes / perf.attempts).toFixed(2) : "0",
        source: source ?? undefined,
      });

      const applyBoardReward = (fromSource: MinigameSource, clearFirst: boolean) => {
        if (fromSource !== "board") return;
        const reward = computeMinigameReward(questSuccess, score, clearFirst, false);
        setUserProfile((prev) => ({
          ...prev,
          totalCoins: prev.totalCoins + reward.coins,
          xp: prev.xp + reward.xp,
        }));
        if (reward.starEarned) {
          awardPartyStar(activeIsland.id);
        }
        setPendingBoardReward(reward);
        setPendingBoardMinigameName(
          activeIsland.minigames?.find((m) => m.id === mgId)?.name ?? null
        );
      };

      const finalizeSuccessfulClear = async (
        clearFirst: boolean,
        masteryGateId?: string,
      ) => {
        updateSave((prev) => {
          const skillStats = prev.skillStats ?? createDefaultSkillStats();
          const updatedSkillStats = timeline?.skillChanges?.length
            ? applySkillChanges(skillStats, timeline.skillChanges)
            : skillStats;
          const economy = prev.economyState ?? createDefaultEconomyState();
          const updatedEconomy = advanceEconomy(economy);
          let ledger = ensureLedger(prev.voyagerLedger);
          if (masteryGateId) {
            ledger = markMasteryClear(ledger, masteryGateId);
          }
          return {
            ...prev,
            completedMinigames: uniq([...prev.completedMinigames, mgId]),
            skillStats: updatedSkillStats,
            economyState: updatedEconomy,
            voyagerLedger: ledger,
          };
        });
        await completeObjective({ type: "completeMinigame", minigameId: mgId });
        applyBoardReward(source, clearFirst);
        setActiveMinigameId(null);
        setMinigameStartedAt(null);
        setMinigameSource(null);
        setPendingMastery(null);
        void trackScreenEnter(`islands_play:${activeIsland.id}`, { islandId: activeIsland.id });
        if (timeline && timeline.entries.length > 0) {
          setPendingReplayTimeline(timeline);
        }
      };

      if (questSuccess) {
        const gate = getMasteryGateForMinigame(mgId);
        const ledger = ensureLedger(save.voyagerLedger);
        if (gate && !hasMasteryClear(ledger, gate.id)) {
          setPendingMastery({
            gate,
            mgId,
            score,
            timeline,
            source,
            firstClear,
          });
          setActiveMinigameId(null);
          setMinigameStartedAt(null);
          setMinigameSource(null);
          return;
        }
        await finalizeSuccessfulClear(firstClear);
      } else {
        await analytics.track("fail_reason", {
          context: "minigame",
          minigameId: activeMinigameId,
          islandId: activeIsland.id,
          reason: success && !meetsThreshold ? "score_below_threshold" : "objective_not_met",
          score,
          scoreThreshold: thresholdObjective?.scoreThreshold
            ? resolveProfileNumber(thresholdObjective.scoreThreshold, learningProfile)
            : undefined,
          learningProfile,
          durationMs,
          difficulty,
        });

        await analytics.track("minigame_retry", {
          islandId: activeIsland.id,
          minigameId: activeMinigameId,
          attempt: perf.attempts,
        });

        const relatedQuests = activeIsland.quests.filter((q) =>
          q.objectives.some((o) => o.type === "completeMinigame" && o.minigameId === activeMinigameId)
        );
        for (const q of relatedQuests) {
          const failCount = recordQuestFailedAttempt(q.id);
          if (failCount === 2) {
            await analytics.track("hint_escalated", {
              islandId: activeIsland.id,
              questId: q.id,
              hintLevel: failCount,
            });
          }
        }

        const nextDifficulty = getDifficultyForMinigame(activeMinigameId);
        if (nextDifficulty !== difficulty) {
          await analytics.track("difficulty_changed", {
            minigameId: activeMinigameId,
            from: difficulty,
            to: nextDifficulty,
          });
        }

        applyBoardReward(source, firstClear);
        setActiveMinigameId(null);
        setMinigameStartedAt(null);
        setMinigameSource(null);
        void trackScreenEnter(`islands_play:${activeIsland.id}`, { islandId: activeIsland.id });
      }
    },
    [
      activeIsland,
      activeMinigameId,
      awardPartyStar,
      completeObjective,
      learningProfile,
      minigameSource,
      minigameStartedAt,
      save,
      setUserProfile,
      updateSave,
    ]
  );

  const handleMasteryPassed = useCallback(async () => {
    if (!pendingMastery || !activeIsland || !save) return;
    const { gate, mgId, score, timeline, source, firstClear } = pendingMastery;

    updateSave((prev) => {
      const skillStats = prev.skillStats ?? createDefaultSkillStats();
      const updatedSkillStats = timeline?.skillChanges?.length
        ? applySkillChanges(skillStats, timeline.skillChanges)
        : skillStats;
      const economy = prev.economyState ?? createDefaultEconomyState();
      const updatedEconomy = advanceEconomy(economy);
      return {
        ...prev,
        completedMinigames: uniq([...prev.completedMinigames, mgId]),
        skillStats: updatedSkillStats,
        economyState: updatedEconomy,
        voyagerLedger: markMasteryClear(ensureLedger(prev.voyagerLedger), gate.id),
      };
    });
    await completeObjective({ type: "completeMinigame", minigameId: mgId });

    if (source === "board") {
      const reward = computeMinigameReward(true, score, firstClear, false);
      setUserProfile((prev) => ({
        ...prev,
        totalCoins: prev.totalCoins + reward.coins,
        xp: prev.xp + reward.xp,
      }));
      if (reward.starEarned) {
        awardPartyStar(activeIsland.id);
      }
      setPendingBoardReward(reward);
      setPendingBoardMinigameName(
        activeIsland.minigames?.find((m) => m.id === mgId)?.name ?? null
      );
    }

    setPendingMastery(null);
    void trackScreenEnter(`islands_play:${activeIsland.id}`, { islandId: activeIsland.id });
    if (timeline && timeline.entries.length > 0) {
      setPendingReplayTimeline(timeline);
    }
  }, [
    activeIsland,
    awardPartyStar,
    completeObjective,
    pendingMastery,
    save,
    setUserProfile,
    updateSave,
  ]);

  const handleMasteryFailed = useCallback(() => {
    if (!pendingMastery) return;
    const { mgId, source } = pendingMastery;
    setPendingMastery(null);
    setMinigameSource(source);
    setActiveMinigameId(mgId);
    setMinigameStartedAt(Date.now());
  }, [pendingMastery]);

  const activeMinigameDef = useMemo(() => {
    if (!activeIsland || !activeMinigameId) return undefined;
    return activeIsland.minigames?.find((m) => m.id === activeMinigameId);
  }, [activeIsland, activeMinigameId]);

  const MinigameComponent = useMemo(() => {
    if (!activeMinigameDef) return null;
    return getMinigameComponent(activeMinigameDef.componentId);
  }, [activeMinigameDef]);

  const activeDifficulty: DifficultyLevel = useMemo(
    () => (activeMinigameId ? getDifficultyForMinigame(activeMinigameId) : "normal"),
    [activeMinigameId]
  );

  const coincraftSkinActive = shouldUseCoincraftSkin(
    view,
    activeIslandId,
    save?.currentIslandId
  );

  const playArcadeGame = useCallback(
    async (islandId: string, minigameId: MinigameId) => {
      const island = getIslandById(content, islandId);
      if (!island) return;
      setActiveIslandId(islandId);
      setMinigameSource("arcade");
      await analytics.track("minigame_started", {
        islandId,
        minigameId,
        source: "arcade",
      });
      setMinigameStartedAt(Date.now());
      setActiveMinigameId(minigameId);
      void trackScreenEnter(`minigame:${minigameId}`, { islandId, minigameId, source: "arcade" });
    },
    [content],
  );

  if (!save) {
    return (
      <GameViewport className="bg-gradient-to-br from-sky-200 via-emerald-100 to-yellow-100">
        <div className="flex min-h-dvh items-center justify-center">
          <div className="text-xl font-bold">Loading islands…</div>
        </div>
      </GameViewport>
    );
  }

  if (import.meta.env.DEV && showEditor) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading editor…</div>}>
        <LazyIslandEditor onClose={() => {
          invalidateContentCache();
          setShowEditor(false);
        }} />
      </Suspense>
    );
  }

  // First-run world onboarding (skipped when carpet POV boot already lands you on Harbor).
  if (
    !save.onboardingComplete &&
    !bootLandHub &&
    content.islands.length > 0 &&
    import.meta.env.VITE_QA !== "1"
  ) {
    return (
      <WelcomeOnboarding
        playerName={userProfile.name}
        character={save.character}
        islandsCount={content.islands.length}
        onSaveCharacter={saveCharacter}
        onComplete={completeOnboarding}
        onSkip={completeOnboarding}
      />
    );
  }

  const rootA11yClasses = [
    a11y.highContrast ? "contrast-more" : "",
    a11y.reducedMotion ? "motion-reduce" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const devCheatsPanel =
    import.meta.env.DEV && activeIsland && save ? (
      <GamePanel title="🛠️ Dev Cheats" className="border-dashed border-orange-400 bg-orange-50/80">
        <button
          type="button"
          onClick={() => setDevCheatsOpen((o) => !o)}
          className="mb-2 flex w-full items-center gap-2 text-left text-sm font-bold text-orange-700"
        >
          {devCheatsOpen ? "▲ collapse" : "▼ expand"}
        </button>
        {devCheatsOpen ? (
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs font-bold text-orange-700">Jump to Area</div>
              <div className="flex flex-wrap gap-1">
                {activeIsland.areas.map((area) => (
                  <GameButton
                    key={area.id}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      updateSave((prev) => ({
                        ...prev,
                        currentAreaId: area.id,
                        discovered: { ...prev.discovered, areas: uniq([...prev.discovered.areas, area.id]) },
                      }));
                    }}
                  >
                    {area.icon} {area.name}
                  </GameButton>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold text-orange-700">Grant Item</div>
              <div className="flex flex-wrap gap-1">
                {activeIsland.items.map((item) => {
                  const has = save.inventory.includes(item.id);
                  return (
                    <GameButton
                      key={item.id}
                      size="sm"
                      variant={has ? "secondary" : "outline"}
                      disabled={has}
                      onClick={() => {
                        updateSave((prev) => ({
                          ...prev,
                          inventory: uniq([...prev.inventory, item.id]),
                          discovered: { ...prev.discovered, items: uniq([...prev.discovered.items, item.id]) },
                        }));
                      }}
                    >
                      {item.icon} {item.name}
                    </GameButton>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold text-orange-700">Quests</div>
              <div className="flex flex-wrap gap-1">
                {activeIsland.quests.map((q) => {
                  const qs = save.questStatus[q.id];
                  return (
                    <span key={q.id} className="inline-flex gap-1">
                      <GameButton size="sm" variant="outline" disabled={!!qs?.started} onClick={() => startQuest(q.id)}>
                        Start: {resolveProfileText(q.title, learningProfile)}
                      </GameButton>
                      <GameButton
                        size="sm"
                        variant="outline"
                        disabled={!!qs?.completed}
                        onClick={() => {
                          updateSave((prev) => ({
                            ...prev,
                            questStatus: {
                              ...prev.questStatus,
                              [q.id]: {
                                started: true,
                                completed: true,
                                completedObjectives: q.objectives.map(objectiveKey),
                                startedAt: prev.questStatus[q.id]?.startedAt || new Date().toISOString(),
                                completedAt: new Date().toISOString(),
                              },
                            },
                          }));
                        }}
                      >
                        Force Complete
                      </GameButton>
                    </span>
                  );
                })}
              </div>
            </div>
            <GameButton
              size="sm"
              variant="danger"
              onClick={() => {
                if (confirm("Reset all island save data?")) {
                  import("./save").then(({ createDefaultIslandSave, persistIslandSave }) => {
                    const fresh = createDefaultIslandSave();
                    setSave(fresh);
                    setActiveIslandId(null);
                    setView("home");
                    persistIslandSave(fresh);
                  });
                }
              }}
            >
              🗑️ Reset Save
            </GameButton>
          </div>
        ) : null}
      </GamePanel>
    ) : null;

  return (
    <GameViewport
      className={cn(
        coincraftSkinActive
          ? COINCRAFT_SKIN_CLASS
          : "bg-gradient-to-br from-sky-200 via-emerald-100 to-yellow-100",
        rootA11yClasses
      )}
      reducedMotion={a11y.reducedMotion}
      highContrast={a11y.highContrast}
      textSizeClass={textSizeClass(a11y.textSize)}
    >
      <GameTooltipProvider>
        <GameScreenStack
          screenKey={view}
          mode="slide"
          className={
            view === "voyage"
              ? "relative h-dvh min-h-dvh w-full"
              : "min-h-dvh min-h-screen"
          }
        >
        {view === "home" ? (
          <HomeHubView
            userProfile={userProfile}
            save={save}
            content={content}
            learningProfile={learningProfile}
            character={save.character}
            onSaveCharacter={saveCharacter}
            onHarborPurchase={onHarborPurchase}
            onHubGuidedEvent={onHubGuidedEvent}
            hubModal={hubModal}
            setHubModal={setHubModal}
            onExit={handleExit}
            onOpenTravel={() => setView("travel")}
            onOpenArcade={() => setView("arcade")}
            onOpenStudio={() => setView("studio")}
            onReplayIntro={onReplayIntro}
            onOpenAnalytics={() => setShowAnalytics(true)}
            onResume={() => {
              const id = save.currentIslandId || HUB_ISLAND_ID;
              setActiveIslandId(id);
              if (isHubIslandId(id)) {
                setView("home");
              } else {
                const isl = getIslandById(content, id);
                setView(isl && islandHasChapterContent(isl) ? "chapter" : "island");
              }
            }}
            onPlayHarborBoard={() => {
              setActiveIslandId(HUB_ISLAND_ID);
              setView("island");
            }}
            onClearHomecoming={() => {
              updateSave((prev) => ({
                ...prev,
                harborHomecoming: {
                  ...(prev.harborHomecoming ?? {}),
                  pending: false,
                  celebrated: true,
                },
              }));
            }}
            onOpenEditor={import.meta.env.DEV ? () => setShowEditor(true) : undefined}
            a11y={a11y}
            updateA11y={updateA11y}
            updateLearningProfile={updateLearningProfile}
          />
        ) : view === "travel" ? (
          <TravelMapView
            userProfile={userProfile}
            islands={content.islands}
            save={save}
            onBack={() => setView("home")}
            onStartVoyage={(islandId) => startVoyage(islandId, "travel")}
          />
        ) : view === "voyage" ? (
          <PovVoyageView
            userProfile={userProfile}
            islands={content.islands}
            save={save}
            character={save.character}
            voyageTargetId={voyageTargetId}
            onBack={cancelVoyage}
            onEnterIsland={enterIsland}
          />
        ) : view === "arcade" ? (
          <ArcadeView
            save={save}
            userName={userProfile.name}
            onBack={() => setView("home")}
            onPlayGame={(islandId, minigameId) => void playArcadeGame(islandId, minigameId as MinigameId)}
            onOpenStudio={() => setView("studio")}
          />
        ) : view === "studio" ? (
          <VibeCodeStudio
            authorName={userProfile.name || "Creator"}
            onClose={() => setView("home")}
          />
        ) : view === "chapter" && activeIsland ? (
          <IslandThemeProvider islandId={activeIsland.id} themeId={activeIsland.themeId}>
            <IslandPlayView
              island={activeIsland}
              save={save}
              totalCoins={userProfile.totalCoins}
              activeAreaId={save.currentAreaId}
              learningProfile={learningProfile}
              objectiveKey={objectiveKey}
              character={save.character}
              animationStyle={getIslandTheme(activeIsland.id, activeIsland.themeId).animationStyle}
              onEnterArea={(areaId) => void enterArea(areaId)}
              onTalkNpc={(npcId) => void openNpcDialogue(npcId)}
              onCollectItem={(itemId) => void collectItem(itemId)}
              onStartQuest={(questId) => void startQuest(questId)}
              onOpenTravel={() => setView("travel")}
              onOpenHub={() => setView("home")}
              onOpenStudio={() => setView("studio")}
              onPlayMinigame={(minigameId) => {
                setMinigameSource("dialogue");
                setActiveMinigameId(minigameId as MinigameId);
                setMinigameStartedAt(Date.now());
              }}
              onOpenBoard={() => setView("island")}
            />
          </IslandThemeProvider>
        ) : view === "island" && activeIsland ? (
          <IslandThemeProvider islandId={activeIsland.id} themeId={activeIsland.themeId}>
            <IslandBoardView
              island={activeIsland}
              save={save}
              userProfile={userProfile}
              character={save.character}
              onUpdatePartyState={(next) => updatePartyState(activeIsland.id, next)}
              onLaunchMinigame={launchBoardMinigame}
              onSpaceReward={handleBoardSpaceReward}
              onBoardBoat={() => boardBoat("island")}
              onOpenArchipelago={() => setView("travel")}
              onOpenHub={() => setView("home")}
              onOpenArcade={() => setView("arcade")}
              boardLocked={Boolean(activeMinigameId) || Boolean(pendingMastery)}
            />
          </IslandThemeProvider>
        ) : null}
        </GameScreenStack>

        {dialogueState.open && dialogueNode ? (
          <GameModal
            open
            onClose={closeDialogue}
            maxWidth="md"
            usePortal
            showCloseButton
            title={
              dialogueState.npcId
                ? activeIsland?.npcs.find((n) => n.id === dialogueState.npcId)?.name ?? "Conversation"
                : "Conversation"
            }
            zIndex={45}
          >
            <div className="space-y-4" data-testid="dialogue-modal">
              <p className="text-base font-medium leading-relaxed">
                {resolveProfileText(dialogueNode.text, learningProfile)}
              </p>
              <div className="flex flex-col gap-2">
                {(dialogueNode.choices ?? []).map((choice) => (
                  <GameButton
                    key={choice.id}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => void onDialogueChoice(choice.id)}
                  >
                    {resolveProfileText(choice.text, learningProfile)}
                  </GameButton>
                ))}
                {!(dialogueNode.choices && dialogueNode.choices.length > 0) ? (
                  <GameButton variant="primary" className="w-full" onClick={closeDialogue}>
                    Continue
                  </GameButton>
                ) : null}
              </div>
            </div>
          </GameModal>
        ) : null}

        {activeMinigameId && MinigameComponent && activeIsland ? (
          <GameModal
            open
            onClose={() => void handleMinigameAbandon()}
            maxWidth="lg"
            usePanel={false}
            zIndex={50}
          >
            <div data-testid="minigame-modal">
              <Suspense fallback={<div className="py-8 text-center">Loading minigame…</div>}>
                <MinigameComponent
                  minigameId={activeMinigameId}
                  island={activeIsland}
                  save={save}
                  difficulty={activeDifficulty}
                  learningProfile={learningProfile}
                  onComplete={onMinigameComplete}
                  onClose={() => void handleMinigameAbandon()}
                />
              </Suspense>
            </div>
          </GameModal>
        ) : null}

        {pendingMastery ? (
          <GameModal
            open
            onClose={handleMasteryFailed}
            maxWidth="md"
            usePanel={false}
            zIndex={55}
          >
            <MasteryQuiz
              key={pendingMastery.gate.id}
              gate={pendingMastery.gate}
              onPassed={() => void handleMasteryPassed()}
              onFailed={handleMasteryFailed}
            />
          </GameModal>
        ) : null}

        {pendingReplayTimeline ? (
          <Suspense fallback={null}>
            <LazyReplayModal
              timeline={pendingReplayTimeline}
              onClose={() => setPendingReplayTimeline(null)}
            />
          </Suspense>
        ) : null}

        {pendingBoardReward ? (
          <PartyRewardOverlay
            reward={pendingBoardReward}
            minigameName={pendingBoardMinigameName ?? undefined}
            onContinue={() => {
              setPendingBoardReward(null);
              setPendingBoardMinigameName(null);
            }}
          />
        ) : null}

        <GameModal open={showAnalytics} onClose={() => setShowAnalytics(false)} maxWidth="lg">
          <Suspense fallback={<div className="py-8 text-center">Loading analytics…</div>}>
            <LazyAnalyticsExport onClose={() => setShowAnalytics(false)} />
          </Suspense>
        </GameModal>
      </GameTooltipProvider>
    </GameViewport>
  );
}
