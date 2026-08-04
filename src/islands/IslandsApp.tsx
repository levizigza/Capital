import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { IslandShoreView } from "./views/IslandShoreView";
import { PartyRewardOverlay } from "./views/PartyRewardOverlay";
import { MinigameFailOverlay } from "./views/MinigameFailOverlay";
import { ArcadeView } from "./platform/ArcadeView";
import { VibeCodeStudio } from "./studio/VibeCodeStudio";
import { IslandThemeProvider } from "./themes/IslandThemeProvider";
import { getIslandTheme } from "./themes/islandThemes";
import type { CapitalCharacter } from "./character";
import { BASE_VOYAGER } from "./character";
import { HUB_ISLAND_ID, isHubIslandId } from "./worldMapLayout";
import { islandHasChapterContent, buildCoveChangeReplayTimeline, buildPaycheckChangeReplayTimeline } from "./chapterLoop";
import {
  COVE_CHANGE_QUEST_ID,
  COVE_ISLAND_ID,
  CREDIT_ORDEAL_QUEST_ID,
  PAYCHECK_CHANGE_QUEST_ID,
} from "./islandIds";
import { partyDashIdForIsland, isKinestheticComponent } from "./partyPlayStyle";
import { usesCourseWorld } from "./mainCourse";
import { CourseWorldOverlay } from "./views/CourseWorldOverlay";
import { TalkBattleScreen } from "./views/TalkBattleScreen";
import {
  minigameFailCopy,
  resolveMinigameFailReason,
  resolveTakeFailFlavor,
  type MinigameFailCopy,
} from "./minigameFail";
import { toast } from "sonner";
import {
  findHarborNpc,
  resolveHarborDialogue,
  HARBOR_DIALOGUES,
  piggyGuidedGraph,
  piggyHomecomingGraph,
} from "./story/harborTalks";
import { getMascot } from "./moneyCast";
import { capitalMusic } from "./audio";
import { playCapitalSfx } from "./audio/capitalSfx";
import { getGenreWorld } from "./genreWorlds";
import {
  harborScarPlaques,
  nextPaintingAfterScar,
  plaqueShelfLine,
  stanceGreetingHint,
  recordNpcTalk,
  scarTriggersChapterQuiet,
} from "./worldMemory";
import { CREDIT_REX_GRAPH_ID, creditRexStartNodeId } from "./creditEncounter";
import {
  syncHarborRitual,
  markRitualGreeted,
  markRumorSeen,
  markEchoSurpriseSeen,
  prepareDay2EchoSave,
  markPaydayDone,
  markRewardClaimed,
  bumpWeeklyTalk,
  bumpWeeklyStudio,
  DAILY_RITUAL_REWARD_COINS,
} from "./harborRitual";

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
import { saveTimeline } from "./decisionTimeline";
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
import {
  buildSignatureLoopSave,
  type SignaturePhase,
  type SignatureSpineOrgan,
} from "@/qa/signatureLoop";
import { computeMinigameReward, getPartyState } from "./partyBoard";
import type { MinigameBoardReward } from "./partyBoard";
import { applyPayday, ensureLedger, hasMasteryClear, markMasteryClear } from "./voyagerLedger";
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
  getHubGuidedStep,
  isHubGuidedComplete,
} from "./story/hubGuidedIntro";
import { resolveCarpetBootGuidedIntro } from "./harborFirstMeet";
import { normalizeHubGuidedIntro } from "./harborAshore";

type IslandsAppProps = {
  userProfile: UserProfile;
  setUserProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onExit: () => void;
  onReplayIntro?: () => void;
};

type View = "home" | "travel" | "voyage" | "explore" | "island" | "chapter" | "arcade" | "studio";
type VoyageReturn = "home" | "travel" | "island" | "chapter" | "explore";
type MinigameSource = "board" | "arcade" | "dialogue" | "qa" | "structure" | null;

type PendingMasteryClear = {
  gate: MasteryGateDef;
  mgId: MinigameId;
  score?: number;
  timeline?: DecisionTimeline;
  source: MinigameSource;
  firstClear: boolean;
};

type PendingMinigameFail = {
  mgId: MinigameId;
  source: MinigameSource;
  copy: MinigameFailCopy;
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
  const viewRef = useRef(view);
  const saveRef = useRef(save);
  viewRef.current = view;
  // Keep ref aligned with React state for external setSave paths (load/reset/seed).
  // updateSave writes saveRef synchronously before setSave — do not clobber mid-tick.
  useEffect(() => {
    saveRef.current = save;
  }, [save]);
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
  /** After closing Talk Battle, brief cooldown so re-press doesn’t reopen instantly */
  const talkCooldownRef = useRef<{ npcId: string; until: number } | null>(null);
  /** Last Talk Battle choice id — flushed into npcMemory on finishTalk */
  const lastTalkChoiceRef = useRef<string | null>(null);

  const [hubModal, setHubModal] = useState<
    | "outfitter"
    | "capsule"
    | "settings"
    | "pavilion"
    | "market"
    | "memory"
    | "ritual"
    | "gallery"
    | "family"
    | null
  >(null);
  const [devCheatsOpen, setDevCheatsOpen] = useState(false);
  const [activeMinigameId, setActiveMinigameId] = useState<MinigameId | null>(null);
  const [minigameSource, setMinigameSource] = useState<MinigameSource>(null);
  const [pendingBoardReward, setPendingBoardReward] = useState<MinigameBoardReward | null>(null);
  const [pendingBoardMinigameName, setPendingBoardMinigameName] = useState<string | null>(null);
  const [pendingMastery, setPendingMastery] = useState<PendingMasteryClear | null>(null);
  const [pendingMinigameFail, setPendingMinigameFail] = useState<PendingMinigameFail | null>(null);
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
    capitalMusic.setEnabled(next.musicEnabled !== false);
    capitalMusic.setVolume(next.musicVolume ?? 0.42);
    analytics.track("settings_changed", { ...next });
  }, []);

  useEffect(() => {
    let mounted = true;
    const failsafe = window.setTimeout(() => {
      if (!mounted) return;
      if (saveRef.current) return;
      console.warn("[islands] save load timed out — starting default Harbor save");
      const fresh = createDefaultIslandSave();
      saveRef.current = fresh;
      setSave(fresh);
    }, 3_000);
    (async () => {
      try {
        const loaded = await loadIslandSave();
        if (!mounted) return;
        saveRef.current = loaded;
        setSave(loaded);
        if (loaded.currentIslandId) setActiveIslandId(loaded.currentIslandId);
      } catch (e) {
        console.warn("[islands] save load failed", e);
        if (!mounted) return;
        const fresh = createDefaultIslandSave();
        saveRef.current = fresh;
        setSave(fresh);
      }
    })();
    return () => {
      mounted = false;
      window.clearTimeout(failsafe);
    };
  }, []);

  /** After reload, put mid-chapter / mid-board players back where they were — never soft-drop on Harbor with no Resume. */
  const didResumeRef = useRef(false);
  useEffect(() => {
    if (!save || bootLandHub || didResumeRef.current) return;
    if (content.islands.length === 0) return;
    didResumeRef.current = true;
    const id = save.currentIslandId;
    if (!id || isHubIslandId(id)) {
      setView("home");
      return;
    }
    const isl = getIslandById(content, id);
    if (!isl) {
      setView("home");
      return;
    }
    setActiveIslandId(id);
    // Always resume on the walkable shore — never dump into board/quiz menus.
    setView(islandHasChapterContent(isl) || (isl.minigames?.length ?? 0) > 0 || isl.areas.length > 0 ? "explore" : "island");
  }, [save, bootLandHub, content]);

  useEffect(() => {
    // Sync prefs on mount (Settings may have been changed in a prior session)
    capitalMusic.setEnabled(a11y.musicEnabled !== false);
    capitalMusic.setVolume(a11y.musicVolume ?? 0.42);
  }, []);

  useEffect(() => {
    if (dialogueState.open) {
      capitalMusic.playPlace({ kind: "talk" });
      return;
    }
    if (view === "home") {
      capitalMusic.playPlace({ kind: "harbor" });
      return;
    }
    if (view === "travel") {
      capitalMusic.playPlace({ kind: "map" });
      return;
    }
    if (view === "voyage") {
      capitalMusic.playPlace({ kind: "voyage" });
      return;
    }
    if (activeIslandId && (view === "explore" || view === "island" || view === "chapter")) {
      const genre = getGenreWorld(activeIslandId);
      capitalMusic.playPlace({
        kind: "shore",
        islandId: activeIslandId,
        genreId: genre?.id ?? null,
        hush: Boolean(save?.chapterQuietPending),
      });
      return;
    }
    if (view === "arcade" || view === "studio") {
      capitalMusic.playPlace({ kind: "harbor" });
    }
  }, [view, activeIslandId, dialogueState.open, save?.chapterQuietPending]);

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

  /**
   * Apply save updates synchronously through saveRef, then mirror into React state.
   * Side-effect gates (quest complete → homecoming, objective touch lists) read
   * flags set inside the updater — those must run before the next await, not on
   * a later React flush.
   */
  const updateSave = useCallback((updater: (prev: IslandSaveV1) => IslandSaveV1) => {
    const prev = saveRef.current;
    if (!prev) return;
    const next = updater(prev);
    saveRef.current = next;
    setSave(next);
  }, []);

  const replaceSave = useCallback((next: IslandSaveV1) => {
    saveRef.current = next;
    setSave(next);
  }, []);

  /** Debounced persist — always writes the latest save, never a stale in-flight body. */
  useEffect(() => {
    if (!save) return;
    const t = window.setTimeout(() => {
      persistIslandSave(save).catch((e) => console.warn("[islands] failed to persist save", e));
    }, 120);
    return () => window.clearTimeout(t);
  }, [save]);

  const saveCharacter = useCallback(
    (character: CapitalCharacter) => {
      updateSave((prev) => {
        const guided = prev.hubGuidedIntro ?? createDefaultHubGuidedIntro();
        let next = {
          ...prev,
          character,
          hubGuidedIntro: advanceHubGuided(guided, "saved_outfitter"),
        };
        // Persist companion ownership (free Slow Coin always counts as owned)
        if (character.companion && character.companion !== "none") {
          next = applyCompanionPurchase(next, character.companion);
        } else {
          next = applyCompanionPurchase(next, "tortoise");
          next = {
            ...next,
            character: { ...character, companion: "tortoise" },
          };
        }
        return next;
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
      // Free grants (starter pet) skip the coin charge path
      if (purchase.price <= 0) {
        updateSave((prev) => {
          let next = prev;
          if (purchase.kind === "companion") next = applyCompanionPurchase(prev, purchase.companionId);
          else if (purchase.kind === "capsule") next = applyCapsulePurchase(prev, purchase.itemId);
          else if (purchase.kind === "carpet") next = applyCarpetPolish(prev, purchase.tierId);
          else if (purchase.kind === "plaza_pass") next = applyPlazaPass(prev, purchase.room);
          return next;
        });
        return true;
      }
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
        const guided = normalizeHubGuidedIntro(
          prev.hubGuidedIntro ?? createDefaultHubGuidedIntro(),
        );
        return { ...prev, hubGuidedIntro: advanceHubGuided(guided, event) };
      });
    },
    [updateSave],
  );

  const enterIsland = useCallback(
    async (islandId: string, opts?: { instant?: boolean }) => {
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
              islands: uniq([
                ...prev.discovered.islands,
                HUB_ISLAND_ID,
                islandId,
              ]),
              areas: defaultArea ? uniq([...prev.discovered.areas, defaultArea]) : prev.discovered.areas,
            },
          };
        });

        setActiveIslandId(islandId);
        setVoyageTargetId(null);
        // Harbor Haven is the 3D walkable plaza — never dump players on the party board by default.
        // Every other island docks onto a walkable shore (explore) — immerse before board/quiz.
        if (isHubIslandId(islandId)) {
          setView("home");
        } else {
          setView("explore");
        }
      };

      // QA / reduced motion: skip dissolve so tests and a11y never race FX.
      if (opts?.instant || !fx || a11y.reducedMotion) {
        await applyEnter();
        return;
      }
      await fx.playAreaTransition(applyEnter);
    },
    [a11y.reducedMotion, content, fx, updateSave]
  );

  const completeOnboarding = useCallback(() => {
    updateSave((prev) => ({
      ...prev,
      onboardingComplete: true,
      character: prev.character ?? { ...BASE_VOYAGER },
      hubGuidedIntro: normalizeHubGuidedIntro(
        prev.hubGuidedIntro ?? createDefaultHubGuidedIntro(),
      ),
    }));
    void analytics.track("onboarding_completed", { via: "ashore_land" });
    // Ashore law: land Harbor Talk Piggy → Carpet → Cove (no Outfitter-card hero).
    setActiveIslandId(HUB_ISLAND_ID);
    setView("home");
  }, [updateSave]);

  /**
   * Demote Outfitter-card WelcomeOnboarding — boot cast already picked a look.
   * First session UI is Harbor Ashore only (Talk → Carpet → Cove).
   * Never stomp signature seeds / mid-run Harbor memory.
   */
  useEffect(() => {
    if (!save || save.onboardingComplete || bootLandHub) return;
    if (content.islands.length === 0) return;
    const hasProgress =
      isHubGuidedComplete(save.hubGuidedIntro) ||
      (save.harborScars?.length ?? 0) > 0 ||
      Boolean(save.harborHomecoming) ||
      Boolean(save.hubGuidedIntro && save.hubGuidedIntro.step !== "meet_guide");
    if (hasProgress) {
      updateSave((prev) => ({ ...prev, onboardingComplete: true }));
      return;
    }
    completeOnboarding();
  }, [save, bootLandHub, content.islands.length, completeOnboarding, updateSave]);

  // Carpet opening lands you on Harbor Haven plaza (3D walk) — not the party board yet.
  useEffect(() => {
    if (!save || !bootLandHub || bootHubHandled || content.islands.length === 0) return;
    setBootHubHandled(true);
    const hub = getIslandById(content, HUB_ISLAND_ID);
    const defaultArea = hub?.areas[0]?.id;
    updateSave((prev) => {
      // Preserve only an in-progress Castle Grounds lap. Never keep a finished
      // tutorial (or leftover quiet homecoming) over the opening carpet ceremony —
      // that steals first-meet and strands players with no coach.
      const { hubGuidedIntro, clearQuietPending } = resolveCarpetBootGuidedIntro(prev);
      return {
        ...prev,
        onboardingComplete: true,
        character: prev.character ?? { ...BASE_VOYAGER, name: userProfile.name || "Voyager" },
        currentIslandId: HUB_ISLAND_ID,
        currentAreaId: defaultArea ?? prev.currentAreaId,
        hubGuidedIntro,
        // Opening ceremony owns first-meet — do not let a leftover homecoming steal Piggy.
        harborHomecoming: clearQuietPending
          ? {
              ...(prev.harborHomecoming ?? {}),
              quietPending: false,
              pending: false,
            }
          : prev.harborHomecoming,
        discovered: {
          ...prev.discovered,
          islands: uniq([...prev.discovered.islands, HUB_ISLAND_ID]),
          areas: defaultArea ? uniq([...prev.discovered.areas, defaultArea]) : prev.discovered.areas,
        },
      };
    });
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

  const onSyncHarborRitual = useCallback(() => {
    updateSave((prev) => syncHarborRitual(prev));
  }, [updateSave]);

  const onClaimRitualPayday = useCallback(() => {
    let applied: number | null = null;
    updateSave((prev) => {
      if (prev.harborRitual?.today.paydayDone) return prev;
      const { ledger, coins } = applyPayday(ensureLedger(prev.voyagerLedger), 1, {
        trackHarborEscape: true,
      });
      applied = coins;
      return markPaydayDone(
        withHarborFreedomRewards({
          ...prev,
          voyagerLedger: ledger,
        }),
      );
    });
    if (applied !== null) {
      setUserProfile((prev) => ({
        ...prev,
        totalCoins: Math.max(0, prev.totalCoins + applied!),
      }));
      toast.message(
        applied >= 0 ? `Pay Day +${applied} coins` : `Pay Day shortfall ${applied}`,
        { description: "Ledger cashflow hit your pouch." },
      );
    }
  }, [setUserProfile, updateSave]);

  const onClaimRitualReward = useCallback(() => {
    let claimed = false;
    updateSave((prev) => {
      if (prev.harborRitual?.today.rewardClaimed) return prev;
      if (!prev.harborRitual?.today.paydayDone || !prev.harborRitual?.today.rumorSeen) {
        return prev;
      }
      claimed = true;
      return markRewardClaimed(prev);
    });
    if (claimed) {
      setUserProfile((prev) => ({
        ...prev,
        totalCoins: prev.totalCoins + DAILY_RITUAL_REWARD_COINS,
      }));
      toast.message(`+${DAILY_RITUAL_REWARD_COINS} ritual coins`, {
        description: "Tiny thank-you for showing up today — never pay-to-win.",
      });
    }
  }, [setUserProfile, updateSave]);

  const onMarkRitualRumor = useCallback(() => {
    updateSave((prev) => markRumorSeen(prev));
  }, [updateSave]);

  const onMarkRitualGreeted = useCallback(() => {
    updateSave((prev) => markRitualGreeted(prev));
  }, [updateSave]);

  const onMarkEchoSurprise = useCallback(() => {
    updateSave((prev) => markEchoSurpriseSeen(prev));
  }, [updateSave]);

  const onStudioGalleryOpened = useCallback(() => {
    updateSave((prev) => bumpWeeklyStudio(prev));
  }, [updateSave]);

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

  const talkNpcRef = useRef<(npcId: NpcId) => void>(() => {});
  const collectItemRef = useRef<(itemId: ItemId) => Promise<boolean>>(async () => false);

  useEffect(() => {
    if (!save) return;
    return mountQABridge({
      ready: true,
      getView: () => viewRef.current as import("@/qa/qaBridge").QAView,
      getSave: () => saveRef.current,
      enterIsland: (islandId) => enterIsland(islandId, { instant: true }),
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
      talkNpc: (npcId) => {
        talkNpcRef.current(npcId as NpcId);
      },
      collectItem: (itemId) => collectItemRef.current(itemId as ItemId),
      persistSave: async () => {
        const current = saveRef.current;
        if (current) await persistIslandSave(current);
      },
      resetSave: async () => {
        const fresh = createDefaultIslandSave();
        replaceSave(fresh);
        setActiveIslandId(null);
        setView("home");
        await persistIslandSave(fresh);
      },
      seedSignatureLoop: async (phase?: SignaturePhase, organ?: SignatureSpineOrgan) => {
        const resolved = phase ?? "spectacle_ready";
        const seeded = buildSignatureLoopSave(resolved, new Date(), organ ?? "coin");
        replaceSave(seeded);
        setHubModal(null);
        await persistIslandSave(seeded);
        // Take cinema lives on the shore — land Cove quiet on the organ landmark.
        if (resolved === "cove_quiet") {
          await enterIsland(COVE_ISLAND_ID, { instant: true });
          return;
        }
        setActiveIslandId(null);
        setView("home");
      },
      prepareDay2Echo: () => {
        const prev = saveRef.current;
        if (!prev) return;
        const next = prepareDay2EchoSave(prev);
        replaceSave(next);
        setHubModal(null);
        setActiveIslandId(null);
        setView("home");
        void persistIslandSave(next);
      },
      playSignatureTrailer: () => {
        setView("home");
        window.dispatchEvent(new Event("capital:signature-trailer"));
      },
      enterMoneyStructure: () => {
        const api = (
          window as Window & {
            __QA_STRUCTURE__?: { enter: () => void };
          }
        ).__QA_STRUCTURE__;
        if (api?.enter) api.enter();
        else window.dispatchEvent(new Event("capital:enter-money-structure"));
      },
      enterStructurePart: (partId: string) => {
        const api = (
          window as Window & {
            __QA_STRUCTURE__?: { enterPart: (id: string) => boolean };
          }
        ).__QA_STRUCTURE__;
        if (api?.enterPart) {
          api.enterPart(partId);
          return;
        }
        window.dispatchEvent(
          new CustomEvent("capital:enter-structure-part", { detail: { partId } }),
        );
      },
    });
  }, [save, enterIsland, startQuest, activeIslandId, replaceSave]);

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
        updateSave((prev) => {
          const lastScar = (prev.harborScars ?? []).at(-1);
          const scarBit = lastScar
            ? ` ${plaqueShelfLine(lastScar)}.`
            : "";
          const next = lastScar ? nextPaintingAfterScar(lastScar) : "Paycheck Peninsula";
          return {
            ...prev,
            harborHomecoming: {
              pending: true,
              celebrated: false,
              piggyTalked: false,
              quietPending: true,
              chapterIslandId: activeIsland.id,
              questId,
              message: `Piggy Penny: The Coin holds — save a little; the jar still waits.${scarBit} ${next} is newly open on the Carpet.`,
            },
          };
        });
        const timeline = buildCoveChangeReplayTimeline({
          islandId: activeIsland.id,
          islandName:
            typeof activeIsland.name === "string"
              ? activeIsland.name
              : "Coincraft Cove",
        });
        saveTimeline(timeline);
        setPendingReplayTimeline(timeline);
      }

      // Paycheck Peninsula Change → Harbor homecoming
      if (questId === PAYCHECK_CHANGE_QUEST_ID) {
        updateSave((prev) => {
          const lastScar = (prev.harborScars ?? []).at(-1);
          const scarBit = lastScar
            ? ` ${plaqueShelfLine(lastScar)}.`
            : "";
          const next = lastScar ? nextPaintingAfterScar(lastScar) : "Credit Kingdom";
          return {
            ...prev,
            harborHomecoming: {
              pending: true,
              celebrated: false,
              piggyTalked: false,
              quietPending: true,
              chapterIslandId: activeIsland.id,
              questId,
              message: `Piggy Penny: The Clock shelters — wait under the umbrella before glitter.${scarBit} ${next} is newly open on the Carpet.`,
            },
          };
        });
        const ppChoice = save?.irreversibleChoices?.paycheck_protect_vs_spend?.choiceId;
        const timeline = buildPaycheckChangeReplayTimeline({
          islandId: activeIsland.id,
          islandName:
            typeof activeIsland.name === "string"
              ? activeIsland.name
              : "Paycheck Peninsula",
          choiceId: ppChoice,
        });
        saveTimeline(timeline);
        setPendingReplayTimeline(timeline);
      }

      // Credit Kingdom Ordeal clear → Harbor homecoming
      if (questId === CREDIT_ORDEAL_QUEST_ID) {
        updateSave((prev) => {
          const lastScar = (prev.harborScars ?? []).at(-1);
          const scarBit = lastScar
            ? ` ${plaqueShelfLine(lastScar)}.`
            : "";
          return {
            ...prev,
            harborHomecoming: {
              pending: true,
              celebrated: false,
              piggyTalked: false,
              quietPending: true,
              chapterIslandId: activeIsland.id,
              questId,
              message: `Piggy Penny: The Spiral withstands — wait beats haste on the interest wall.${scarBit} Memory keeps your Ordeal on the Plinth.`,
            },
          };
        });
      }
    },
    [activeIsland, learningProfile, setUserProfile, updateSave, save?.questStatus]
  );

  const completeObjective = useCallback(
    async (objective: QuestObjective) => {
      if (!activeIsland) return;

      const key = objectiveKey(objective);
      // Read started quests from updater `prev` — startQuest may have just flipped
      // started in the same tick (Penny First Coins), so closure `save` is stale.
      let touchedQuestIds: QuestId[] = [];
      updateSave((prev) => {
        touchedQuestIds = activeIsland.quests
          .map((q) => q.id)
          .filter(
            (id) =>
              prev.questStatus[id]?.started && !prev.questStatus[id]?.completed,
          );
        if (touchedQuestIds.length === 0) return prev;
        const nextQuestStatus = { ...prev.questStatus };
        for (const questId of touchedQuestIds) {
          const status = nextQuestStatus[questId];
          if (!status || status.completed) continue;
          nextQuestStatus[questId] = {
            ...status,
            completedObjectives: uniq([...status.completedObjectives, key]),
          };
        }
        return { ...prev, questStatus: nextQuestStatus };
      });

      for (const questId of touchedQuestIds) {
        await maybeCompleteQuest(questId);
      }
    },
    [activeIsland, maybeCompleteQuest, updateSave]
  );

  const collectItem = useCallback(
    async (itemId: ItemId): Promise<boolean> => {
      const islandId =
        activeIsland?.id ??
        activeIslandId ??
        saveRef.current?.currentIslandId ??
        null;
      const island = islandId ? getIslandById(content, islandId) : activeIsland;
      if (!island || isHubIslandId(island.id)) return false;
      const item = island.items.find((i) => i.id === itemId);
      if (!item) return false;

      await analytics.track("item_collected", { islandId: island.id, itemId });

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
      return true;
    },
    [activeIsland, activeIslandId, completeObjective, content, updateSave]
  );
  collectItemRef.current = (itemId) => collectItem(itemId);

  const openNpcDialogue = useCallback(
    async (npcId: NpcId) => {
      if (dialogueState.open) return;
      const cool = talkCooldownRef.current;
      if (cool && cool.npcId === npcId && Date.now() < cool.until) return;

      const island =
        activeIsland ??
        (view === "home" ? getIslandById(content, HUB_ISLAND_ID) : undefined);
      const harborNpc = findHarborNpc(npcId);
      const npc = island?.npcs.find((n) => n.id === npcId) ?? harborNpc;
      if (!npc) return;

      if (view === "home" || isHubIslandId(island?.id)) {
        setActiveIslandId(HUB_ISLAND_ID);
      }

      await analytics.track("dialogue_started", {
        islandId: island?.id ?? HUB_ISLAND_ID,
        npcId,
      });

      if (island) {
        updateSave((prev) => ({
          ...prev,
          discovered: {
            ...prev.discovered,
            npcs: uniq([...prev.discovered.npcs, npcId]),
          },
        }));
      }

      const guided =
        save?.hubGuidedIntro && !isHubGuidedComplete(save.hubGuidedIntro)
          ? getHubGuidedStep(save.hubGuidedIntro)?.id
          : null;
      const hc = save?.harborHomecoming;
      const upcomingBond =
        hc && !hc.piggyTalked && (hc.pending || hc.celebrated)
          ? (save?.piggyBondHomecomings ?? 0) + 1
          : (save?.piggyBondHomecomings ?? 0);
      const harborGraph = resolveHarborDialogue(npcId, {
        guidedStep: guided,
        homecoming: save?.harborHomecoming,
        scars: harborScarPlaques(save ?? ({} as IslandSaveV1)),
        bondBeat: Math.max(
          upcomingBond,
          save?.harborHomecoming?.celebrated ? 1 : 0,
        ),
        stanceHint: stanceGreetingHint(save?.stance),
        npcTalks: save?.npcMemory?.[npcId]?.talks,
      });
      const graphId = harborGraph?.id ?? npc.dialogueGraphId;
      // Credit canyon — open Rex on the earned Ordeal fork after Score Scanner.
      const nodeId =
        graphId === CREDIT_REX_GRAPH_ID ? creditRexStartNodeId(save) : undefined;

      setDialogueState({ open: true, graphId, nodeId, npcId });
      // Quiet homecoming reward sting — Piggy presence, not a checklist modal.
      if (graphId === "dlg_harbor_piggy_penny_homecoming") {
        playCapitalSfx("piggy_homecoming");
      }

      void trackScreenEnter(`dialogue:${npcId}`, {
        islandId: island?.id ?? HUB_ISLAND_ID,
        npcId,
      });

      if (island && !isHubIslandId(island.id)) {
        await completeObjective({ type: "talkToNpc", npcId });
      }
    },
    [
      activeIsland,
      completeObjective,
      content,
      dialogueState.open,
      save,
      save?.hubGuidedIntro,
      save?.harborHomecoming,
      save?.piggyBondHomecomings,
      save?.harborScars,
      save?.stance,
      save?.npcMemory,
      updateSave,
      view,
    ],
  );
  talkNpcRef.current = (npcId) => {
    void openNpcDialogue(npcId);
  };

  const applyDialogueEffects = useCallback(
    async (effects: Array<{ type: string; [k: string]: any }> | undefined) => {
      if (!effects) return;
      for (const effect of effects) {
        if (effect.type === "startQuest") {
          await startQuest(effect.questId);
          // Talk often opens before the quest starts (Penny First Coins).
          // Re-credit talkToNpc once the quest exists.
          if (dialogueState.npcId) {
            await completeObjective({
              type: "talkToNpc",
              npcId: dialogueState.npcId,
            });
          }
        }
        if (effect.type === "giveItem") {
          await collectItem(effect.itemId);
        }
        if (effect.type === "startMinigame") {
          let playId = effect.minigameId as string;
          if (activeIsland) {
            const games = activeIsland.minigames ?? [];
            const requested = games.find((g) => g.id === playId);
            // Dialogue quizzes/sims → kinesthetic play pad first (party action pairing).
            if (requested && !isKinestheticComponent(requested.componentId)) {
              const lead = games.find((g) => isKinestheticComponent(g.componentId));
              playId = lead?.id ?? partyDashIdForIsland(activeIsland.id);
              toast.message("Movement game first", {
                description:
                  "Clear the play pad — then the mastery quiz. That’s the Party style pairing.",
              });
            }
          }
          const diff = getDifficultyForMinigame(playId);
          await analytics.track("minigame_started", {
            islandId: activeIsland?.id,
            minigameId: playId,
            difficulty: diff,
            source: "dialogue",
          });
          setMinigameSource("dialogue");
          setMinigameStartedAt(Date.now());
          setActiveMinigameId(playId as MinigameId);
          void trackScreenEnter(`minigame:${playId}`, {
            islandId: activeIsland?.id,
            minigameId: playId,
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
        if (effect.type === "setIrreversible") {
          updateSave((prev) => {
            if (prev.irreversibleChoices?.[effect.key]) return prev;
            return {
              ...prev,
              irreversibleChoices: {
                ...(prev.irreversibleChoices ?? {}),
                [effect.key]: {
                  choiceId: effect.choiceId,
                  label: effect.label,
                  islandId: activeIsland?.id ?? HUB_ISLAND_ID,
                  at: new Date().toISOString(),
                },
              },
            };
          });
        }
        if (effect.type === "addScar") {
          updateSave((prev) => {
            const scars = prev.harborScars ?? [];
            if (scars.some((s) => s.id === effect.id)) return prev;
            const stanceAxis = effect.stance as "saver" | "spender" | "risk" | undefined;
            const stanceDelta = typeof effect.stanceDelta === "number" ? effect.stanceDelta : 1;
            const stance = { ...(prev.stance ?? { saver: 0, spender: 0, risk: 0 }) };
            if (stanceAxis) {
              stance[stanceAxis] = Math.max(0, (stance[stanceAxis] ?? 0) + stanceDelta);
            }
            const quiet = scarTriggersChapterQuiet(effect.id);
            return {
              ...prev,
              stance,
              chapterQuietPending: quiet ? true : prev.chapterQuietPending,
              harborScars: [
                ...scars,
                {
                  id: effect.id,
                  islandId: activeIsland?.id ?? HUB_ISLAND_ID,
                  choiceId: effect.id,
                  label: effect.label,
                  kind: (effect.kind as "plaque" | "npc_tone" | "plaza_prop") ?? "plaque",
                  createdAt: new Date().toISOString(),
                },
              ].slice(-24),
            };
          });
        }
      }
    },
    [
      activeIsland,
      analytics,
      collectItem,
      completeObjective,
      dialogueState.npcId,
      startQuest,
      updateSave,
    ]
  );

  const dialogueGraph = useMemo(() => {
    if (!dialogueState.graphId) return undefined;
    const fromIsland = activeIsland
      ? findDialogue(activeIsland.dialogues, dialogueState.graphId)
      : undefined;
    if (fromIsland) return fromIsland;
    if (dialogueState.graphId === "dlg_harbor_piggy_penny_homecoming") {
      const upcoming =
        (save?.piggyBondHomecomings ?? 0) +
        (save?.harborHomecoming && !save.harborHomecoming.piggyTalked ? 1 : 0);
      return piggyHomecomingGraph(save?.harborHomecoming?.message, {
        scars: harborScarPlaques(save ?? ({} as IslandSaveV1)),
        bondBeat: Math.max(upcoming, 1),
      });
    }
    // Guided Piggy graphs share one id — never use the static "done" mint from HARBOR_DIALOGUES.
    if (dialogueState.graphId === "dlg_harbor_piggy_penny_guided") {
      const guided =
        save?.hubGuidedIntro && !isHubGuidedComplete(save.hubGuidedIntro)
          ? getHubGuidedStep(save.hubGuidedIntro)?.id
          : "done";
      return piggyGuidedGraph(guided);
    }
    const fromHarbor = findDialogue(HARBOR_DIALOGUES, dialogueState.graphId);
    if (fromHarbor) return fromHarbor;
    // Homecoming / memory Piggy graphs are minted and may not be in the static list
    if (dialogueState.npcId) {
      const guided =
        save?.hubGuidedIntro && !isHubGuidedComplete(save.hubGuidedIntro)
          ? getHubGuidedStep(save.hubGuidedIntro)?.id
          : null;
      return resolveHarborDialogue(dialogueState.npcId, {
        guidedStep: guided,
        homecoming: save?.harborHomecoming,
        scars: harborScarPlaques(save ?? ({} as IslandSaveV1)),
        bondBeat: save?.piggyBondHomecomings ?? 0,
        stanceHint: stanceGreetingHint(save?.stance),
        npcTalks: save?.npcMemory?.[dialogueState.npcId]?.talks,
      });
    }
    return undefined;
  }, [
    activeIsland,
    dialogueState.graphId,
    dialogueState.npcId,
    save?.hubGuidedIntro,
    save?.harborHomecoming,
    save?.piggyBondHomecomings,
    save?.harborScars,
    save?.stance,
    save?.npcMemory,
  ]);

  const dialogueNode = useMemo(() => {
    if (!dialogueGraph) return undefined;
    const nodeId = (dialogueState.nodeId || dialogueGraph.startNodeId) as DialogueNodeId;
    return findNode(dialogueGraph, nodeId);
  }, [dialogueGraph, dialogueState.nodeId]);

  const talkNpcMeta = useMemo(() => {
    if (!dialogueState.npcId) return { name: "Local", icon: "💬", tagline: undefined as string | undefined };
    const harbor = findHarborNpc(dialogueState.npcId);
    if (harbor) return { name: harbor.name, icon: harbor.icon, tagline: harbor.tagline };
    const islandNpc = activeIsland?.npcs.find((n) => n.id === dialogueState.npcId);
    if (islandNpc) {
      const mascot = islandNpc.mascotId ? getMascot(islandNpc.mascotId as any) : null;
      return {
        name: islandNpc.name,
        icon: islandNpc.icon || mascot?.emoji || "💬",
        tagline: islandNpc.tagline ?? mascot?.tagline,
      };
    }
    return { name: "Local", icon: "💬", tagline: undefined };
  }, [activeIsland?.npcs, dialogueState.npcId]);

  const finishTalk = useCallback(() => {
    const npcId = dialogueState.npcId;
    if (npcId) {
      talkCooldownRef.current = { npcId, until: Date.now() + 2800 };
    }
    // Advance Castle Grounds only after Piggy Talk Battle ends (incl. Skip)
    if (
      npcId === "piggy_penny" &&
      save?.hubGuidedIntro &&
      !isHubGuidedComplete(save.hubGuidedIntro)
    ) {
      onHubGuidedEvent("talked_guide");
    }
    if (npcId) {
      const welcomedPiggy =
        npcId === "piggy_penny" &&
        save?.harborHomecoming &&
        !save.harborHomecoming.piggyTalked &&
        (save.harborHomecoming.pending || save.harborHomecoming.celebrated);
      updateSave((prev) => {
        let next = recordNpcTalk(prev, npcId, lastTalkChoiceRef.current ?? undefined);
        lastTalkChoiceRef.current = null;
        if (welcomedPiggy) {
          next = {
            ...next,
            piggyBondHomecomings: (next.piggyBondHomecomings ?? 0) + 1,
            harborHomecoming: {
              ...(next.harborHomecoming ?? {}),
              pending: false,
              celebrated: true,
              piggyTalked: true,
              quietPending: false,
            },
          };
        }
        next = bumpWeeklyTalk(next);
        return next;
      });
    } else {
      lastTalkChoiceRef.current = null;
    }
    setDialogueState({ open: false });
    void trackScreenEnter(
      view === "home"
        ? "harbor_haven"
        : `islands_play:${activeIsland?.id ?? "unknown"}`,
      { islandId: activeIsland?.id ?? HUB_ISLAND_ID },
    );
  }, [
    activeIsland?.id,
    dialogueState.npcId,
    onHubGuidedEvent,
    save?.hubGuidedIntro,
    save?.harborHomecoming,
    updateSave,
    view,
  ]);

  const onDialogueChoice = useCallback(
    async (choiceId: string) => {
      if (!dialogueNode || !dialogueGraph) return;
      const choice = dialogueNode.choices?.find((c) => c.id === choiceId);
      if (!choice) return;

      lastTalkChoiceRef.current = choiceId;

      await analytics.track("dialogue_choice", {
        islandId: activeIsland?.id ?? HUB_ISLAND_ID,
        graphId: dialogueGraph.id,
        nodeId: dialogueNode.id,
        choiceId,
      });

      await applyDialogueEffects(choice.effects as any);

      if (choice.nextNodeId) {
        setDialogueState((s) => ({ ...s, nodeId: choice.nextNodeId }));
      } else {
        finishTalk();
      }
    },
    [activeIsland?.id, analytics, applyDialogueEffects, dialogueGraph, dialogueNode, finishTalk],
  );

  const closeDialogue = useCallback(() => {
    finishTalk();
  }, [finishTalk]);

  const onDialogueContinue = useCallback(() => {
    // No choices left on this node — end the Talk Battle
    if (dialogueNode?.end || !(dialogueNode?.choices && dialogueNode.choices.length > 0)) {
      finishTalk();
    }
  }, [dialogueNode, finishTalk]);
  const handleMinigameAbandon = useCallback(async () => {
    if (!activeMinigameId) {
      setActiveMinigameId(null);
      setMinigameStartedAt(null);
      return;
    }
    const source = minigameSource;
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
    if (source === "structure") {
      setView("home");
      setActiveIslandId(HUB_ISLAND_ID);
      void trackScreenEnter("harbor_haven", { islandId: HUB_ISLAND_ID });
      return;
    }
    void trackScreenEnter(`islands_play:${activeIsland?.id ?? "unknown"}`, {
      islandId: activeIsland?.id,
    });
  }, [activeIsland?.id, activeMinigameId, minigameStartedAt, minigameSource]);

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
        if (source === "structure") {
          setView("home");
          setActiveIslandId(HUB_ISLAND_ID);
          void trackScreenEnter("harbor_haven", { islandId: HUB_ISLAND_ID });
        } else {
          void trackScreenEnter(`islands_play:${activeIsland.id}`, { islandId: activeIsland.id });
        }
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
        const failReason = resolveMinigameFailReason({
          reportedSuccess: success,
          meetsThreshold,
        });
        const resolvedThreshold = thresholdObjective?.scoreThreshold
          ? resolveProfileNumber(thresholdObjective.scoreThreshold, learningProfile)
          : undefined;

        await analytics.track("fail_reason", {
          context: "minigame",
          minigameId: activeMinigameId,
          islandId: activeIsland.id,
          reason: failReason,
          score,
          scoreThreshold: resolvedThreshold,
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

        // Consolation for board attempts — quiet coins only; fail chrome owns the moment.
        if (source === "board") {
          const consolation = computeMinigameReward(false, score, firstClear, false);
          setUserProfile((prev) => ({
            ...prev,
            totalCoins: prev.totalCoins + consolation.coins,
            xp: prev.xp + consolation.xp,
          }));
        }

        const mgName =
          activeIsland.minigames?.find((m) => m.id === mgId)?.name ?? String(mgId);
        setPendingMinigameFail({
          mgId,
          source,
          copy: minigameFailCopy({
            reason: failReason,
            minigameName: mgName,
            score,
            scoreThreshold: resolvedThreshold,
            source,
            takeFlavor: resolveTakeFailFlavor({
              irreversibleChoices: save?.irreversibleChoices,
            }),
          }),
        });
        setActiveMinigameId(null);
        setMinigameStartedAt(null);
        setMinigameSource(null);
        // Stay put — never soft-dump to Harbor after a miss.
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

  const handleMinigameFailRetry = useCallback(() => {
    if (!pendingMinigameFail) return;
    const { mgId, source } = pendingMinigameFail;
    setPendingMinigameFail(null);
    setMinigameSource(source);
    setActiveMinigameId(mgId);
    setMinigameStartedAt(Date.now());
    void trackScreenEnter(`minigame:${mgId}`, {
      islandId: activeIsland?.id,
      minigameId: mgId,
      source: source ?? "retry",
    });
  }, [activeIsland?.id, pendingMinigameFail]);

  const handleMinigameFailWalk = useCallback(() => {
    if (!pendingMinigameFail) return;
    setPendingMinigameFail(null);
    if (activeIsland) {
      void trackScreenEnter(`islands_play:${activeIsland.id}`, { islandId: activeIsland.id });
    }
  }, [activeIsland, pendingMinigameFail]);

  const activeMinigameDef = useMemo(() => {
    if (!activeMinigameId) return undefined;
    if (activeIsland) {
      const found = activeIsland.minigames?.find((m) => m.id === activeMinigameId);
      if (found) return found;
      if (activeMinigameId === partyDashIdForIsland(activeIsland.id)) {
        return {
          id: activeMinigameId,
          name: `${activeIsland.name} Painting Arena`,
          icon: "🖼️",
          description: "Dive the painting — 3D Fortune Party action world. Quiz after clear.",
          componentId: "PartyArenaMinigame",
        };
      }
    }
    for (const island of content.islands) {
      const found = island.minigames?.find((m) => m.id === activeMinigameId);
      if (found) return found;
    }
    return undefined;
  }, [activeIsland, activeMinigameId, content.islands]);

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

  // Outfitter-card WelcomeOnboarding demoted — Ashore land effect completes above.
  // Never mount card plaza as hero teach (docs/harbor-ashore.md).

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
                    replaceSave(fresh);
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
                setView("explore");
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
                  // Keep quiet until Piggy Talk Battle — signature hush
                  quietPending: prev.harborHomecoming?.quietPending ?? true,
                },
              }));
            }}
            onSyncHarborRitual={onSyncHarborRitual}
            onClaimRitualPayday={onClaimRitualPayday}
            onClaimRitualReward={onClaimRitualReward}
            onMarkRitualRumor={onMarkRitualRumor}
            onMarkRitualGreeted={onMarkRitualGreeted}
            onStudioGalleryOpened={onStudioGalleryOpened}
            onMarkScarSpectacle={(scarCount) => {
              updateSave((prev) => ({
                ...prev,
                scarSpectacle: {
                  shownForCount: Math.max(prev.scarSpectacle?.shownForCount ?? 0, scarCount),
                  lastShownAt: new Date().toISOString(),
                },
              }));
            }}
            onMarkEchoSurprise={onMarkEchoSurprise}
            onClearChapterQuiet={() =>
              updateSave((prev) =>
                prev.chapterQuietPending ? { ...prev, chapterQuietPending: false } : prev,
              )
            }
            onPlayStructureMinigame={(minigameId) => {
              const host =
                content.islands.find((i) => i.minigames?.some((m) => m.id === minigameId))?.id ??
                null;
              if (host) setActiveIslandId(host);
              setMinigameSource("structure");
              setActiveMinigameId(minigameId as MinigameId);
              setMinigameStartedAt(Date.now());
              void analytics.track("minigame_started", {
                islandId: host ?? HUB_ISLAND_ID,
                minigameId,
                source: "money_structure",
              });
            }}
            onOpenEditor={import.meta.env.DEV ? () => setShowEditor(true) : undefined}
            onTalkNpc={(npcId) => void openNpcDialogue(npcId)}
            talkOpen={dialogueState.open}
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
            onPublish={(level) => {
              updateSave((prev) => {
                const marks = prev.harborStudioMarks ?? [];
                const next = {
                  levelId: level.id,
                  title: level.title || "Untitled level",
                  author: level.author || userProfile.name || "Creator",
                  stampedAt: new Date().toISOString(),
                };
                const filtered = marks.filter((m) => m.levelId !== level.id);
                return {
                  ...prev,
                  harborStudioMarks: [next, ...filtered].slice(0, 12),
                };
              });
              toast.success("Harbor stamped your Studio mark on the plaza!");
            }}
          />
        ) : view === "explore" && activeIsland && !(activeMinigameId && activeMinigameDef && usesCourseWorld(activeMinigameDef.componentId)) ? (
          <IslandThemeProvider islandId={activeIsland.id} themeId={activeIsland.themeId}>
            <IslandShoreView
              island={activeIsland}
              save={save}
              userProfile={userProfile}
              learningProfile={learningProfile}
              character={save.character}
              objectiveKey={objectiveKey}
              a11y={a11y}
              onA11yChange={updateA11y}
              onTalkNpc={(npcId) => void openNpcDialogue(npcId)}
              onCollectItem={(itemId) => void collectItem(itemId)}
              onPlayMinigame={(minigameId) => {
                setMinigameSource("dialogue");
                setActiveMinigameId(minigameId as MinigameId);
                setMinigameStartedAt(Date.now());
              }}
              onOpenBoard={() => setView("island")}
              onOpenTravel={() => setView("travel")}
              onOpenHub={() => setView("home")}
              onEnterArea={(areaId) => void enterArea(areaId)}
              onStartQuest={(questId) => void startQuest(questId)}
              talkOpen={dialogueState.open}
            />
          </IslandThemeProvider>
        ) : view === "explore" && activeIsland ? (
          /* Shore unmounted while inside a painting course world (single Canvas). */
          <div className="sr-only" data-testid="shore-suspended-for-course" />
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
              chapterQuiet={Boolean(save?.chapterQuietPending)}
              onClearChapterQuiet={() =>
                updateSave((prev) => ({ ...prev, chapterQuietPending: false }))
              }
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
              onOpenHub={() => setView(isHubIslandId(activeIsland.id) ? "home" : "explore")}
              onOpenArcade={() => setView("arcade")}
              boardLocked={Boolean(activeMinigameId) || Boolean(pendingMastery)}
            />
          </IslandThemeProvider>
        ) : null}
        </GameScreenStack>

        {dialogueState.open && dialogueNode ? (
          <TalkBattleScreen
            open
            npcName={talkNpcMeta.name}
            npcIcon={talkNpcMeta.icon}
            npcTagline={talkNpcMeta.tagline}
            player={
              save.character ?? {
                ...BASE_VOYAGER,
                name: userProfile.name || "Voyager",
              }
            }
            node={dialogueNode}
            learningProfile={learningProfile}
            placeId={
              view === "home"
                ? HUB_ISLAND_ID
                : (activeIsland?.id ?? save?.currentIslandId ?? HUB_ISLAND_ID)
            }
            onChoice={(id) => void onDialogueChoice(id)}
            onContinue={onDialogueContinue}
            onSkip={closeDialogue}
          />
        ) : null}

        {activeMinigameId && activeIsland && activeMinigameDef && usesCourseWorld(activeMinigameDef.componentId) ? (
          <CourseWorldOverlay
            island={activeIsland}
            character={save?.character}
            minigameId={activeMinigameId}
            title={activeMinigameDef.name}
            onComplete={(ok, score) => void onMinigameComplete(ok, score)}
            onExit={() => void handleMinigameAbandon()}
          />
        ) : activeMinigameId && MinigameComponent && activeIsland ? (
          <GameModal
            open
            onClose={() => void handleMinigameAbandon()}
            maxWidth="lg"
            usePortal={false}
            zIndex={50}
          >
            <IslandThemeProvider islandId={activeIsland.id} themeId={activeIsland.themeId}>
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
            </IslandThemeProvider>
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

        {pendingMinigameFail ? (
          <MinigameFailOverlay
            copy={pendingMinigameFail.copy}
            onRetry={handleMinigameFailRetry}
            onKeepWalking={handleMinigameFailWalk}
          />
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
