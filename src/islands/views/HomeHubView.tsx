import { Suspense, lazy, useMemo, useState, useCallback, useEffect } from "react";
import { GuideEdgeCue, type GuideProjection } from "./GuideWayfinder";
import {
  GameHudLayout,
  GameButton,
  GameModal,
} from "@/game-ui";
import { useInputAction } from "@/input";

import type { UserProfile } from "@/App";
import type { IslandSaveV1, IslandsContent } from "../types";
import { getIslandById } from "../content/loader";
import { getEffectiveBoatTier } from "../boats";
import { hasHarborFreedom } from "../progressGates";
import { getProfileDef, type LearningProfileId } from "../learningProfile";
import type { AccessibilitySettings } from "../settings";
import {
  type CapitalCharacter,
  BASE_VOYAGER,
} from "../character";
import { CharacterAvatar } from "./CharacterAvatar";
import { WealthHud } from "./WealthHud";
import { VoyagerLedgerHud } from "./VoyagerLedgerHud";
import { ensureLedger, freedomPlazaChip } from "../voyagerLedger";
import { OutfitterStudioOverlay } from "../world3d/OutfitterStudioOverlay";
import { CapsuleStudioOverlay } from "../world3d/CapsuleStudioOverlay";
import { HarborMarketOverlay } from "../world3d/HarborMarketOverlay";
import { WalkableHarborView, type HarborHotspot } from "../world3d";
import {
  harborMemoryPlinthHotspot,
  MEMORY_PLINTH_CINEMA_EYE,
  MEMORY_PLINTH_LOOK_AT,
} from "../harborIcon";
import { HARBOR_PLAZA, plazaSlotById } from "../harborPlazaPlan";
import { isHubIslandId } from "../worldMapLayout";
import { isRoomUnlocked } from "../harborShop";
import type { PartyItemId } from "../partyItems";
import { toast } from "sonner";
import {
  HARBOR_KEEPER_MASCOT_ID,
  getHubGuidedStep,
  isHubGuidedComplete,
  type HubGuidedEvent,
  type HubGuidedIntroState,
} from "../story/hubGuidedIntro";
import { resolveHarborVisualBeats } from "../story/dialogueActionSync";
import { coinBagHarborTip, coinBagShouldPointPavilion } from "../story/coinBagBuddy";
import { CoinBagBuddyHud } from "./CoinBagBuddyHud";
import { resolveHarborGuideLookAt } from "../coinBagGuideTargets";
import { resolveAdaptiveBuddyTip, syncWorldPlace, gameEvents } from "../gameSystems";
import { hasCompletedCoveChange, hasCompletedPaycheckChange } from "../chapterLoop";
import { canOpenSignatureCinema } from "../signatureCinemaGate";
import {
  harborScarPlaques,
  stanceGreetingHint,
  groupScarsByChapter,
  scarChapterTitle,
  scarOrganId,
  coldRetellLine,
  plaqueShelfLine,
} from "../worldMemory";
import {
  dailyRumorText,
  ritualNeedsAttention,
  weeklyMeta,
  weeklyShareText,
  localDayKey,
} from "../harborRitual";
import {
  loadVisibleCommunityLevels,
  hideCommunityLevel,
  bumpPlays,
} from "../studio/communityStorage";
import type { VibeLevel } from "../studio/levelSchema";
import {
  createFamilyRoom,
  getActiveFamilyRoom,
  importFamilyRoomJson,
  joinFamilyRoom,
  leaveFamilyRoom,
  exportFamilyRoomJson,
  pinLevelToRoom,
  roomPinnedLevels,
  familyPlaqueMythLine,
} from "../familyRoom";
import { harborWeatherMood, weatherFogParams, weatherCoachLine } from "../harborWeather";
import {
  ScarSpectacleOverlay,
  type SpectacleCinemaPhase,
} from "./ScarSpectacleOverlay";
import { SoftBeatOverlay, type SoftBeatKind } from "./SoftBeatOverlay";
import { ChoicesCounselStrip } from "./ChoicesCounselStrip";
import { SignatureTrailerOverlay } from "./SignatureTrailerOverlay";
import { HarborFeltShareOverlay } from "./HarborFeltShareOverlay";
import { Day2EchoOverlay } from "./Day2EchoOverlay";
import { TouchWalkPad } from "./TouchWalkPad";
import { MoneyStructureInteriorView } from "../world3d/MoneyStructureInteriorView";
import {
  ashorePresenceLine,
  normalizeHubGuidedIntro,
  shouldAutoOpenDailyRitual,
  shouldForceTalkCta,
  shouldShowCastleCoach,
  shouldStripPlazaForPresence,
} from "../harborAshore";
import { pointerSafeActivate } from "../pointerSafeClick";
import {
  harborFallbackMode,
  isFirstMeetStep,
  isPiggyPresenceBeat,
  resolvePulseHotspotId,
} from "../harborFirstMeet";
import { downloadWeeklyShareCard, harborFeltCardDataUrl, shareHarborFeltCard } from "./weeklyShareCard";
import { playCapitalSfx } from "../audio/capitalSfx";
import { capitalMusic } from "../audio/capitalMusic";
import { WorldArriveOverlay } from "./WorldArriveOverlay";
import { SIGNATURE_TIMING } from "@/qa/signatureLoop";
import { isKilled } from "@/sre";
import {
  moneyStructureForIsland,
  type MoneyStructurePart,
} from "../moneyStructures";
import { HARBOR_HAVEN_ID } from "../islandIds";

const LazySettingsPanel = lazy(() => import("../SettingsPanel"));

type HubModal =
  | "outfitter"
  | "capsule"
  | "settings"
  | "pavilion"
  | "market"
  | "memory"
  | "ritual"
  | "gallery"
  | "family"
  | "studio_stele"
  | null;

export type HarborPurchase =
  | { kind: "capsule"; itemId: PartyItemId; price: number }
  | { kind: "carpet"; tierId: string; price: number }
  | { kind: "plaza_pass"; room: "market"; price: number }
  | { kind: "companion"; companionId: string; price: number };

export type HomeHubViewProps = {
  userProfile: UserProfile;
  save: IslandSaveV1;
  content: IslandsContent;
  learningProfile: LearningProfileId;
  character?: CapitalCharacter;
  onSaveCharacter: (c: CapitalCharacter) => void;
  /** Spend coins + mutate harbor shop / capsules */
  onHarborPurchase: (purchase: HarborPurchase) => boolean;
  /** Castle Grounds Story Bible guided events */
  onHubGuidedEvent: (event: HubGuidedEvent) => void;
  hubModal: HubModal;
  setHubModal: (m: HubModal) => void;
  onExit: () => void;
  onOpenTravel: () => void;
  onOpenArcade: () => void;
  onOpenStudio: () => void;
  onReplayIntro?: () => void;
  onResume: () => void;
  /** Open the Harbor Fortune Party board (2D) — optional side activity. */
  onPlayHarborBoard?: () => void;
  onOpenEditor?: () => void;
  onOpenAnalytics?: () => void;
  a11y: AccessibilitySettings;
  updateA11y: (next: AccessibilitySettings) => void;
  updateLearningProfile: (id: LearningProfileId) => void;
  /** Pulse the Outfitter and show coach text (tutorial) */
  highlightOutfitter?: boolean;
  /** Clear Harbor Return/Change celebration */
  onClearHomecoming?: () => void;
  /** Auto / manual talk with a Harbor local (opens Talk Battle) */
  onTalkNpc?: (npcId: string) => void;
  /** True while Talk Battle is open — freeze world input */
  talkOpen?: boolean;
  onSyncHarborRitual?: () => void;
  onClaimRitualPayday?: () => void;
  onClaimRitualReward?: () => void;
  onMarkRitualRumor?: () => void;
  onMarkRitualGreeted?: () => void;
  onStudioGalleryOpened?: () => void;
  /** Persist scar spectacle shownForCount */
  onMarkScarSpectacle?: (scarCount: number) => void;
  /** Day-2 scar echo surprise acknowledged */
  onMarkEchoSurprise?: () => void;
  /** Clear Cove hush once Harbor mounts (hush rides the carpet home) */
  onClearChapterQuiet?: () => void;
  /** Launch a minigame from a Money Structure part (may be hosted on another island) */
  onPlayStructureMinigame?: (minigameId: string) => void;
  /** Soft Beat completed — arms next Pay Day */
  onSoftBeatComplete?: (kind: SoftBeatKind) => void;
};

function guidedFromSave(save: IslandSaveV1): HubGuidedIntroState | null {
  if (!save.hubGuidedIntro) return null;
  const guided = normalizeHubGuidedIntro(save.hubGuidedIntro);
  if (isHubGuidedComplete(guided)) return null;
  return guided;
}

export function HomeHubView({
  userProfile,
  save,
  content,
  learningProfile,
  character,
  onSaveCharacter,
  onHarborPurchase,
  onHubGuidedEvent,
  hubModal,
  setHubModal,
  onOpenTravel,
  onOpenArcade,
  onOpenStudio,
  onReplayIntro,
  onResume,
  onPlayHarborBoard,
  onOpenEditor,
  onOpenAnalytics,
  a11y,
  updateA11y,
  updateLearningProfile,
  highlightOutfitter = false,
  onClearHomecoming: _onClearHomecoming,
  onExit,
  onTalkNpc,
  talkOpen = false,
  onSyncHarborRitual,
  onClaimRitualPayday,
  onClaimRitualReward,
  onMarkRitualRumor,
  onMarkRitualGreeted,
  onStudioGalleryOpened,
  onMarkScarSpectacle,
  onMarkEchoSurprise,
  onClearChapterQuiet,
  onPlayStructureMinigame,
  onSoftBeatComplete,
}: HomeHubViewProps) {
  useInputAction("map", () => {
    if (hubModal || talkOpen) return;
    onHubGuidedEvent("opened_map");
    onOpenTravel();
  });
  useInputAction("menu", () => {
    // O opens settings — never while a store owns the screen
    if (hubModal || talkOpen) return;
    setHubModal("settings");
  });
  useInputAction("cancel", () => {
    // Talk Battle owns Esc while open
    if (talkOpen) return;
    if (bankOpen) {
      setBankOpen(false);
      return;
    }
    // Outfitter / Capsule / Market own Esc (save-or-leave). Don't discard drafts here.
    if (hubModal === "outfitter" || hubModal === "capsule" || hubModal === "market") return;
    if (hubModal) setHubModal(null);
    else onExit();
  });

  const profile = getProfileDef(learningProfile);
  const boat = getEffectiveBoatTier(userProfile.totalCoins, save);
  const simplified = profile.hudMode === "simplified";
  const voyager = character ?? { ...BASE_VOYAGER, name: userProfile.name || "Voyager" };
  const freed = hasHarborFreedom(save);
  const freedomPlazaLine = freedomPlazaChip({
    freed,
    boatLabel: boat.label,
    ledger: ensureLedger(save.voyagerLedger),
  });
  const guided = guidedFromSave(save);
  const guidedStep = guided ? getHubGuidedStep(guided) : null;
  const castleMode = !!guidedStep;

  const [outfitterStage, setOutfitterStage] = useState<"select" | "look" | "pet">("select");
  const [draft, setDraft] = useState<CapitalCharacter>(voyager);
  const [nearStore, setNearStore] = useState<{ id: string; label: string } | null>(null);
  const [nearNpc, setNearNpc] = useState<{ id: string; name: string; line: string } | null>(null);
  const [guideProjection, setGuideProjection] = useState<GuideProjection | null>(null);
  const plazaRoom = isRoomUnlocked(save, "market") ? "market" : "plaza";
  const guideArrows = a11y.guideArrows !== false;
  const toggleGuide = useCallback(() => {
    updateA11y({ ...a11y, guideArrows: !guideArrows });
  }, [a11y, updateA11y, guideArrows]);

  const peninsulaChapterDone = hasCompletedPaycheckChange(save);
  const needsPiggyWelcome =
    Boolean(save.harborHomecoming) &&
    !save.harborHomecoming?.piggyTalked &&
    Boolean(save.harborHomecoming?.pending || save.harborHomecoming?.celebrated);
  const quietHarbor =
    needsPiggyWelcome && Boolean(save.harborHomecoming?.quietPending);
  const firstMeet = isFirstMeetStep(guidedStep?.id);
  /** Early Ashore — soft coach; voyage uses Carpet CTA (no Outfitter early chrome). */
  const earlyCastle = Boolean(castleMode && firstMeet);
  /** Piggy wave / bubble — first meet + quiet homecoming. */
  const piggyPresence = isPiggyPresenceBeat({
    firstMeet,
    quietHomecoming: quietHarbor,
  });
  /** Only scar hush strips stalls — first meet stays walkable after pre-carpet teach. */
  const stripPlaza = shouldStripPlazaForPresence({
    firstMeet,
    quietHomecoming: quietHarbor,
  });
  const nearPiggy =
    nearNpc?.id === HARBOR_KEEPER_MASCOT_ID ||
    nearNpc?.id === "guide";
  const forceTalkCta = shouldForceTalkCta({
    firstMeet,
    quietHomecoming: quietHarbor,
    nearPiggy,
  });
  const fallbackMode = harborFallbackMode({
    firstMeet,
    quietHomecoming: quietHarbor,
    castleActive: Boolean(castleMode && guidedStep && guidedStep.id !== "done"),
  });
  // Outfitter is plaza discovery after Ashore — never a guided hero teach.
  const showOutfitterChrome = !quietHarbor && !castleMode && !firstMeet;
  /** Map chrome on voyage — free roam uses diegetic Money Carpet. */
  const showTravelChip =
    !quietHarbor && Boolean(castleMode) && guidedStep?.id === "to_dock";
  const showLeaveChrome = !quietHarbor && !castleMode;
  const pointNextPainting =
    hasCompletedCoveChange(save) &&
    Boolean(save.harborHomecoming?.piggyTalked) &&
    !peninsulaChapterDone;

  const plaques = harborScarPlaques(save);
  const plaqueGroups = groupScarsByChapter(plaques);
  const studioMarks = save.harborStudioMarks ?? [];
  const stanceLine = stanceGreetingHint(save.stance);
  const bondStrain =
    plaques.length >= 2 && (save.piggyBondHomecomings ?? 0) < 2;

  const [spectacleOpen, setSpectacleOpen] = useState(false);
  /** Lamp peaks after hush — not under the dark beat. */
  const [spectaclePhase, setSpectaclePhase] = useState<SpectacleCinemaPhase | null>(null);
  const [plinthGlow, setPlinthGlow] = useState(false);
  const [feltShareOpen, setFeltShareOpen] = useState(false);
  /** Plaza playable (3D or myth) — signature cinema must wait for this. */
  const [plazaReady, setPlazaReady] = useState(false);
  const markPlazaReady = useCallback((ok: boolean) => setPlazaReady(ok), []);
  const [feltPreviewUrl, setFeltPreviewUrl] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [echoSurpriseOpen, setEchoSurpriseOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [enteringBank, setEnteringBank] = useState(false);
  const [bankSoftBeat, setBankSoftBeat] = useState<SoftBeatKind | null>(null);
  const ledgerBank = useMemo(() => moneyStructureForIsland(HARBOR_HAVEN_ID), []);

  const visualBeats = resolveHarborVisualBeats({
    guidedStepId: guidedStep?.id,
    homecomingPending: needsPiggyWelcome,
    pointNextPainting,
    scarSpectacleActive: spectacleOpen,
    // Share freeze keeps Plinth pulse alive even after the 14s glow timer.
    plinthGlowActive: (plinthGlow || feltShareOpen) && !spectacleOpen,
  });
  const nearKeeper = nearNpc?.id === HARBOR_KEEPER_MASCOT_ID;
  /** When near Piggy, wave becomes talk — conversation replaces the attractor. */
  const keeperEmote =
    nearKeeper && visualBeats.keeperEmote === "wave" ? "talk" : visualBeats.keeperEmote;
  const homecomingActive = needsPiggyWelcome || pointNextPainting;
  const plinthShareBeat = spectacleOpen || plinthGlow || feltShareOpen;
  const keeperSpeech =
    castleMode || homecomingActive || plinthShareBeat
      ? visualBeats.keeperBubbleWhenNear || null
      : null;
  // Keep "guide" — Piggy’s ring lights when pulseHotspotId === "guide"
  const pulseHotspotId = resolvePulseHotspotId(visualBeats.pulseHotspot);

  const latestPlaque = plaques[plaques.length - 1] ?? null;
  const latestOrgan = latestPlaque ? scarOrganId(latestPlaque) : null;
  const familyMyth = familyPlaqueMythLine(latestPlaque?.label, latestOrgan);
  const scarDay = (latestPlaque?.createdAt || "").slice(0, 10);
  const scarEcho =
    latestPlaque != null
      ? {
          label: latestPlaque.label,
          dayOffset: (scarDay && scarDay < localDayKey() ? "later" : "same") as
            | "same"
            | "later",
          organ: scarOrganId(latestPlaque),
        }
      : null;

  useEffect(() => {
    syncWorldPlace({ place: "harbor", islandId: "harbor_haven", ecosystemMotion: "mixed" });
    gameEvents.emit("world.entered", { place: "harbor", ecosystemMotion: "mixed" });
    onSyncHarborRitual?.();
  }, [onSyncHarborRitual]);

  useEffect(() => {
    if (save.chapterQuietPending) onClearChapterQuiet?.();
  }, [save.chapterQuietPending, onClearChapterQuiet]);

  useEffect(() => {
    const count = plaques.length;
    if (count < 1) return;
    const shown = save.scarSpectacle?.shownForCount ?? 0;
    if (count <= shown) return;
    // Unshown scars own the plaza — dismiss Daily Ritual so it cannot sit above cinema.
    if (hubModal === "ritual") {
      setHubModal(null);
      return;
    }
    if (
      !canOpenSignatureCinema({
        plazaReady,
        talkOpen,
        hubModal: Boolean(hubModal),
        spectacleOpen,
        feltShareOpen,
        guidedComplete: !guided || isHubGuidedComplete(guided),
      })
    ) {
      return;
    }
    setSpectacleOpen(true);
  }, [
    plaques.length,
    save.scarSpectacle?.shownForCount,
    hubModal,
    guided,
    talkOpen,
    spectacleOpen,
    feltShareOpen,
    plazaReady,
    setHubModal,
  ]);

  const closeSpectacle = useCallback(() => {
    setSpectacleOpen(false);
    onMarkScarSpectacle?.(plaques.length);
    setPlinthGlow(true);
    setFeltShareOpen(true);
    playCapitalSfx("plinth_hum");
  }, [plaques.length, onMarkScarSpectacle]);

  useEffect(() => {
    if (!feltShareOpen || !latestPlaque) {
      setFeltPreviewUrl(null);
      return;
    }
    let cancelled = false;
    void harborFeltCardDataUrl({
      voyagerName: voyager.name || "Voyager",
      scarLabel: latestPlaque.label,
      chapter: scarChapterTitle(latestPlaque),
      scarId: latestPlaque.id,
      islandId: latestPlaque.islandId,
      organId: latestOrgan,
    }).then((url) => {
      if (!cancelled) setFeltPreviewUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [feltShareOpen, latestPlaque, latestOrgan, voyager.name]);

  useEffect(() => {
    // Hold glow through the share freeze-frame so the lamp doesn't die mid-PNG.
    // Day-2 cinema also holds the peak until the echo closes.
    if (!plinthGlow || feltShareOpen || echoSurpriseOpen) return;
    const t = window.setTimeout(() => setPlinthGlow(false), SIGNATURE_TIMING.plinthGlowMs);
    return () => window.clearTimeout(t);
  }, [plinthGlow, feltShareOpen, echoSurpriseOpen]);

  useEffect(() => {
    if (!spectacleOpen) setSpectaclePhase(null);
  }, [spectacleOpen]);

  // Pillar 11 — duck Memory bed during spectacle / share so Harbor-felt stingers read.
  useEffect(() => {
    const hush = spectacleOpen || feltShareOpen;
    capitalMusic.playPlace({ kind: "harbor", hush });
    return () => {
      if (hush) capitalMusic.playPlace({ kind: "harbor" });
    };
  }, [spectacleOpen, feltShareOpen]);

  useEffect(() => {
    const rumorId = save.harborRitual?.today.rumorId;
    if (!rumorId?.startsWith("scar_echo_")) return;
    if (save.harborRitual?.today.echoSurpriseSeen) return;
    if (trailerOpen) return;
    // Micro-loop order: Piggy homecoming before day-2 echo — never stack.
    if (save.harborHomecoming?.pending) return;
    if (save.harborHomecoming && !save.harborHomecoming.piggyTalked) return;
    // Day-2 Soft Beat owns the plaza — never leave Daily Ritual parked above it.
    if (hubModal === "ritual") {
      setHubModal(null);
      return;
    }
    if (
      !canOpenSignatureCinema({
        plazaReady,
        talkOpen,
        hubModal: Boolean(hubModal),
        spectacleOpen,
        feltShareOpen,
        guidedComplete: !guided || isHubGuidedComplete(guided),
      })
    ) {
      return;
    }
    setEchoSurpriseOpen(true);
    // Lamp peaks for day-2 Soft Beat cinema — prove the Plinth before any modal.
    setPlinthGlow(true);
  }, [
    save.harborRitual?.today.rumorId,
    save.harborRitual?.today.echoSurpriseSeen,
    save.harborHomecoming?.pending,
    save.harborHomecoming?.piggyTalked,
    hubModal,
    talkOpen,
    spectacleOpen,
    feltShareOpen,
    trailerOpen,
    guided,
    plazaReady,
    setHubModal,
  ]);

  useEffect(() => {
    const onQaTrailer = () => setTrailerOpen(true);
    window.addEventListener("capital:signature-trailer", onQaTrailer);
    return () => window.removeEventListener("capital:signature-trailer", onQaTrailer);
  }, []);

  useEffect(() => {
    // Memory organ: Daily Ritual after Cove Change — never steals first-meet / voyage.
    if (
      !shouldAutoOpenDailyRitual({
        save,
        guidedActive: Boolean(guided && !isHubGuidedComplete(guided)),
        anyBlockingOverlay: Boolean(
          hubModal ||
            talkOpen ||
            spectacleOpen ||
            feltShareOpen ||
            trailerOpen ||
            echoSurpriseOpen,
        ),
        homecomingPending: Boolean(
          save.harborHomecoming?.pending ||
            (save.harborHomecoming && !save.harborHomecoming.piggyTalked),
        ),
      })
    ) {
      return;
    }
    setHubModal("ritual");
  }, [
    save,
    hubModal,
    guided,
    setHubModal,
    spectacleOpen,
    feltShareOpen,
    trailerOpen,
    echoSurpriseOpen,
    talkOpen,
  ]);

  const structuralBuddy = coinBagHarborTip(guided, {
    nearStoreLabel: nearStore?.label,
    nearNpcName: nearNpc && !nearStore ? nearNpc.name : null,
    hasFreedom: freed,
    currentIslandId: save.currentIslandId,
    homecomingPending: needsPiggyWelcome,
    homecomingMessage: save.harborHomecoming?.message,
    pavilionUnlocked: coinBagShouldPointPavilion(save),
    nextPaintingHint: pointNextPainting ? "Paycheck Peninsula" : null,
    bondStrain,
    latestScarLabel: latestPlaque?.label ?? null,
    plinthGlow: plinthGlow || feltShareOpen,
    day2Echo: Boolean(save.harborRitual?.today.rumorId?.startsWith("scar_echo_")),
    carpetTierLabel: boat.label,
  });
  const buddyTip = resolveAdaptiveBuddyTip({
    save,
    profileId: learningProfile,
    guidedActive: Boolean(guided && !isHubGuidedComplete(guided)),
    ecosystemMotion: "mixed",
    structuralTip: structuralBuddy,
  });
  const bagGuideTip =
    castleMode || homecomingActive || plinthShareBeat
      ? visualBeats.bagTip
      : buddyTip.tip;

  // Never pulse Outfitter during Ashore first session (discovery after voyage).
  const showOutfitterHighlight =
    !stripPlaza &&
    !firstMeet &&
    guidedStep?.id !== "to_dock" &&
    (highlightOutfitter || guidedStep?.highlight === "outfitter");

  const pavilionOpen = isRoomUnlocked(save, "pavilion");

  const marketOpen = isRoomUnlocked(save, "market");

  const harborHotspots = useMemo<HarborHotspot[]>(
    () => {
      // Quiet homecoming only: hush stalls. First meet keeps the plaza walkable.
      if (stripPlaza) {
        return [harborMemoryPlinthHotspot({ scarCount: plaques.length })];
      }
      const arcadeSlot = plazaSlotById("arcade")!;
      const outfitterSlot = plazaSlotById("outfitter")!;
      const carpetSlot = plazaSlotById("travel")!;
      const noticeSlot = plazaSlotById("practice")!;
      const bankSlot = plazaSlotById("ledger_bank");
      return [
      // —— Plaza heroes (master plan — see docs/harbor-plaza-plan.md) ——
      {
        id: "arcade",
        label: "Arcade",
        icon: "🕹️",
        position: arcadeSlot.position,
        yaw: arcadeSlot.yaw,
        kind: "arcade",
      },
      {
        id: "outfitter",
        label: "Outfitter",
        icon: "👗",
        position: outfitterSlot.position,
        yaw: outfitterSlot.yaw,
        kind: "outfitter",
      },
      {
        id: "travel",
        label: "Money Carpet",
        icon: "🪄",
        position: carpetSlot.position,
        yaw: carpetSlot.yaw,
        kind: "carpet_gate",
      },
      ...(onPlayHarborBoard && !isKilled("partyBoard")
        ? [
            {
              id: "practice",
              label: "Harbor Board",
              icon: "🎲",
              position: noticeSlot.position,
              yaw: noticeSlot.yaw,
              kind: "notice_board" as const,
            } satisfies HarborHotspot,
          ]
        : [
            {
              id: "ritual",
              label: ritualNeedsAttention(save) ? "Daily Ritual" : "Weekly Challenge",
              icon: "☀️",
              position: noticeSlot.position,
              yaw: noticeSlot.yaw,
              kind: "notice_board" as const,
            } satisfies HarborHotspot,
          ]),
      // One Harbor icon — always present (empty shelf → scar-lit after Take)
      {
        ...harborMemoryPlinthHotspot({ scarCount: plaques.length }),
        yaw: plazaSlotById("memory")?.yaw,
      },
      // Hide vault during first Piggy meet — E must not steal Talk.
      ...(ledgerBank && bankSlot && guidedStep?.id !== "meet_guide"
        ? [
            {
              id: "ledger_bank",
              label: ledgerBank.exteriorLabel,
              icon: ledgerBank.icon,
              position: bankSlot.position,
              yaw: bankSlot.yaw,
              kind: "money_structure" as const,
            } satisfies HarborHotspot,
          ]
        : []),
      // —— Utility quays (west / east edges — never bank door apron) ——
      {
        id: "capsule",
        label: "Capsule Stall",
        icon: "📦",
        position: [-10.2, 0, -1.2],
        kind: "signpost",
        accent: "#a78bfa",
      },
      ...(!isKilled("studioGallery")
        ? [
            {
              id: "gallery",
              label: "Studio Gallery",
              icon: "🖼️",
              position: [-10.2, 0, 1.2],
              kind: "signpost" as const,
              accent: "#f9a8d4",
            } satisfies HarborHotspot,
          ]
        : []),
      {
        id: "studio",
        label: "VibeCode",
        icon: "✨",
        position: [-10.2, 0, 3.6],
        kind: "signpost",
        accent: "#fde68a",
      },
      {
        id: "settings",
        label: "Settings",
        icon: "⚙️",
        position: [13.2, 0, 4.8],
        kind: "signpost",
        accent: "#94a3b8",
      },
      ...(!isKilled("familyRooms")
        ? [
            {
              id: "family",
              label: "Family Room",
              icon: "🏠",
              position: [13.2, 0, 3.2],
              kind: "signpost" as const,
              accent: "#86efac",
            } satisfies HarborHotspot,
          ]
        : []),
      // Ritual stays reachable when practice board owns the notice mesh
      ...(onPlayHarborBoard && !isKilled("partyBoard")
        ? [
            {
              id: "ritual",
              label: ritualNeedsAttention(save) ? "Daily Ritual" : "Weekly Challenge",
              icon: "☀️",
              position: [-6.8, 0, 6.8],
              kind: "signpost" as const,
              accent: "#fbbf24",
            } satisfies HarborHotspot,
          ]
        : []),
      ...(studioMarks.length > 0
        ? [
            {
              id: "studio_stele",
              label: "Studio Stele",
              icon: "🗿",
              position: [13.2, 0, 1.0] as [number, number, number],
              kind: "signpost" as const,
              accent: "#c4b5fd",
            } satisfies HarborHotspot,
          ]
        : []),
      ...(pavilionOpen
        ? [
            {
              id: "pavilion",
              label: "Freedom Pavilion",
              icon: "🏆",
              position: HARBOR_PLAZA.pavilion,
              kind: "signpost" as const,
              accent: "#fcd34d",
            } satisfies HarborHotspot,
          ]
        : []),
      ...(marketOpen
        ? [
            {
              id: "market",
              label: "Pasaran Lane",
              icon: "🧺",
              position: HARBOR_PLAZA.market,
              kind: "signpost" as const,
              accent: "#fdba74",
            } satisfies HarborHotspot,
          ]
        : []),
      ...(onOpenEditor
        ? [
            {
              id: "editor",
              label: "Editor",
              icon: "🛠️",
              position: [13.2, 0, -0.8],
              kind: "signpost" as const,
              accent: "#64748b",
            } satisfies HarborHotspot,
          ]
        : []),
    ];
    },
    [
      stripPlaza,
      onOpenEditor,
      pavilionOpen,
      marketOpen,
      onPlayHarborBoard,
      plaques.length,
      studioMarks.length,
      save.harborRitual,
      ledgerBank,
      guidedStep?.id,
    ],
  );

  const harborGuideLookAt = useMemo(
    () =>
      resolveHarborGuideLookAt({
        highlight: guidedStep?.highlight ?? (showOutfitterHighlight ? "outfitter" : null),
        hotspots: harborHotspots,
        homecomingPending: needsPiggyWelcome,
        pointNextPainting,
        nearStoreId: nearStore?.id ?? null,
        pointPavilion: coinBagShouldPointPavilion(save),
        // Spectacle / afterglow — Coin Bag points at Plinth before Piggy welcome.
        pointMemoryPlinth: spectacleOpen || plinthGlow || feltShareOpen,
        defaultId: "travel",
      }),
    [
      guidedStep?.highlight,
      showOutfitterHighlight,
      harborHotspots,
      needsPiggyWelcome,
      pointNextPainting,
      nearStore?.id,
      save,
      spectacleOpen,
      plinthGlow,
      feltShareOpen,
    ],
  );

  // Hold Plinth framing through share + afterglow + day-2 so the kid can see the lamp.
  const plinthCinemaLock =
    spectacleOpen || feltShareOpen || plinthGlow || echoSurpriseOpen;
  const plinthLampPeak =
    feltShareOpen ||
    plinthGlow ||
    echoSurpriseOpen ||
    (spectacleOpen && spectaclePhase != null && spectaclePhase !== "hush");
  /** Hide chrome that steals clicks from Soft Beat / share lower-thirds. */
  const hideHudForCinema = spectacleOpen || feltShareOpen || echoSurpriseOpen || trailerOpen;
  /**
   * Loading veil lives in the HUD background (z-0). Footer/header are z-10 and
   * were stealing taps from “Enter Harbor Haven” — keep chrome off until plazaReady.
   */
  const hideHudForHarborLoad = !plazaReady && !hideHudForCinema;

  const openOutfitter = () => {
    setDraft(voyager);
    setOutfitterStage("select");
    setHubModal("outfitter");
  };

  const [galleryLevels, setGalleryLevels] = useState<VibeLevel[]>([]);
  const [familyRoom, setFamilyRoom] = useState(() => getActiveFamilyRoom());
  const [familyName, setFamilyName] = useState("");
  const [familyCode, setFamilyCode] = useState("");
  const [familyImport, setFamilyImport] = useState("");

  useEffect(() => {
    if (hubModal === "gallery") {
      setGalleryLevels(loadVisibleCommunityLevels());
    }
    if (hubModal === "family") {
      setFamilyRoom(getActiveFamilyRoom());
    }
  }, [hubModal]);

  const weekly = save.harborRitual?.weekly;
  const weeklyInfo = weekly ? weeklyMeta(weekly.id) : null;
  const rumor = dailyRumorText(save);

  const closeRitual = () => {
    onMarkRitualGreeted?.();
    setHubModal(null);
  };

  const onHarborHotspot = (id: string) => {
    // Quiet homecoming hush: Piggy owns the plaza — never open Plinth/stalls.
    if (stripPlaza) return;
    if (id === "arcade") onOpenArcade();
    else if (id === "outfitter") {
      // Discovery only — never a guided Ashore gate.
      openOutfitter();
    } else if (id === "studio") onOpenStudio();
    else if (id === "gallery") {
      onStudioGalleryOpened?.();
      setHubModal("gallery");
    } else if (id === "ritual") {
      setHubModal("ritual");
    } else if (id === "family") {
      setHubModal("family");
    } else if (id === "travel") {
      onHubGuidedEvent("near_dock");
      onHubGuidedEvent("opened_map");
      onOpenTravel();
    } else if (id === "settings") setHubModal("settings");
    else if (id === "editor" && onOpenEditor) onOpenEditor();
    else if (id === "capsule") {
      onHubGuidedEvent("capsule_visit");
      setHubModal("capsule");
    } else if (id === "pavilion") {
      setHubModal("pavilion");
    } else if (id === "market") {
      setHubModal("market");
    } else if (id === "memory") {
      playCapitalSfx("plinth_hum");
      setHubModal("memory");
    } else if (id === "studio_stele") {
      setHubModal("studio_stele");
    } else if (id === "practice" && onPlayHarborBoard) {
      onHubGuidedEvent("practice_opened");
      onPlayHarborBoard();
    } else if (id === "ledger_bank" && ledgerBank) {
      if (enteringBank) return;
      setEnteringBank(true);
    }
  };

  const finishBankEnter = useCallback(() => {
    setEnteringBank(false);
    setBankOpen(true);
  }, []);

  const onEnterBankPart = useCallback(
    (part: MoneyStructurePart) => {
      if (part.softBeat === "ledger") {
        setBankSoftBeat("ledger");
        return;
      }
      if (part.minigameId) {
        playCapitalSfx("organ_memory");
        onPlayStructureMinigame?.(part.minigameId);
      }
    },
    [onPlayStructureMinigame],
  );

  const onNearChange = useCallback(
    (id: string | null, label: string | null) => {
      setNearStore(id && label ? { id, label } : null);
      if (id === "outfitter") onHubGuidedEvent("near_outfitter");
      if (id === "travel") onHubGuidedEvent("near_dock");
      if (id === "capsule") onHubGuidedEvent("capsule_visit");
    },
    [onHubGuidedEvent],
  );

  const onNearNpcHandler = useCallback(
    (npc: { id: string; name: string; line: string } | null) => {
      if (!npc) {
        setNearNpc(null);
        return;
      }
      const isKeeper = npc.id === HARBOR_KEEPER_MASCOT_ID;
      if (isKeeper && castleMode) {
        setNearNpc({
          id: npc.id,
          name: npc.name,
          line: visualBeats.keeperBubbleWhenNear || guidedStep?.guideLine || npc.line,
        });
      } else {
        setNearNpc(npc);
      }
      // Opt-in only — never auto-open Talk Battle on walk-by (Zelda/BOTW courtesy).
    },
    [castleMode, guidedStep?.guideLine, visualBeats.keeperBubbleWhenNear],
  );

  /** Zelda/BOTW courtesy: approach shows prompt; E / Enter opts in — never ambush. */
  const tryInteract = useCallback(() => {
    if (hubModal || talkOpen || spectacleOpen || feltShareOpen || trailerOpen || echoSurpriseOpen) {
      return;
    }
    if (bankOpen) return;
    // Quiet homecoming: Talk wins. First meet: only when near Piggy (opt-in).
    if (stripPlaza && onTalkNpc) {
      onTalkNpc(nearNpc?.id ?? HARBOR_KEEPER_MASCOT_ID);
      return;
    }
    if (nearStore) {
      onHarborHotspot(nearStore.id);
      return;
    }
    if (nearNpc && onTalkNpc) {
      onTalkNpc(nearNpc.id);
    }
  }, [
    hubModal,
    talkOpen,
    spectacleOpen,
    feltShareOpen,
    trailerOpen,
    echoSurpriseOpen,
    stripPlaza,
    bankOpen,
    nearStore,
    nearNpc,
    onTalkNpc,
  ]);

  useInputAction("interact", tryInteract);
  useInputAction("confirm", tryInteract);

  const nearTravel = nearStore?.id === "travel";
  const canResume =
    !!save.currentIslandId && !isHubIslandId(save.currentIslandId);

  // Presence over tutorial checklist: no “Piggy Penny noticed” modal interrupt.
  // Quiet HUD + pulsing Piggy + diegetic bubble carry the welcome-back.

  return (
    <>
      <ChoicesCounselStrip save={save} />
      {enteringBank && ledgerBank ? (
        <WorldArriveOverlay
          islandId={HARBOR_HAVEN_ID}
          islandName={ledgerBank.name}
          kind="structure_enter"
          headline={ledgerBank.enterTransition}
          durationMs={1700}
          onDone={finishBankEnter}
        />
      ) : null}
      {/* Keep Harbor mounted under the bank — Structure exit must not remount the plaza. */}
      {bankOpen && ledgerBank ? (
        <>
          <MoneyStructureInteriorView
            structure={ledgerBank}
            character={voyager}
            onExit={() => setBankOpen(false)}
            onEnterPart={onEnterBankPart}
            inputFrozen={Boolean(bankSoftBeat)}
          />
          {bankSoftBeat ? (
            <SoftBeatOverlay
              kind={bankSoftBeat}
              hushActive={plaques.length > 0}
              scarLabel={latestPlaque?.label ?? null}
              onDone={() => {
                onSoftBeatComplete?.(bankSoftBeat);
                setBankSoftBeat(null);
              }}
            />
          ) : null}
        </>
      ) : null}
      <div
        style={bankOpen ? { visibility: "hidden" } : undefined}
        aria-hidden={bankOpen || undefined}
      >
      <GameHudLayout
        background={
          <div className="absolute inset-0">
            {hubModal === "outfitter" || hubModal === "capsule" || hubModal === "pavilion" ? (
              <div
                className={`h-full w-full ${
                  hubModal === "capsule"
                    ? "bg-[#0f172a]"
                    : hubModal === "pavilion"
                      ? "bg-[#1a1625]"
                      : "bg-[#2a1f18]"
                }`}
                aria-hidden
              />
            ) : (
              <>
                <WalkableHarborView
                  character={voyager}
                  hotspots={harborHotspots}
                  onHotspot={onHarborHotspot}
                  onOpenTravel={() => {
                    onHubGuidedEvent("opened_map");
                    onOpenTravel();
                  }}
                  onNearChange={onNearChange}
                  onNearNpc={onNearNpcHandler}
                  guideHighlight={guidedStep?.highlight}
                  guideLookAt={harborGuideLookAt}
                  guideTip={bagGuideTip}
                  keeperEmote={
                    castleMode || homecomingActive || plinthShareBeat || piggyPresence
                      ? keeperEmote
                      : "idle"
                  }
                  keeperSpeech={
                    castleMode || homecomingActive || plinthShareBeat || piggyPresence
                      ? keeperSpeech || visualBeats.keeperBubbleWhenNear || null
                      : null
                  }
                  pulseHotspotId={
                    castleMode || plinthShareBeat || homecomingActive || piggyPresence
                      ? pulseHotspotId
                      : showOutfitterHighlight
                        ? "outfitter"
                        : null
                  }
                  guideArrows={guideArrows}
                  onGuideProject={setGuideProjection}
                  inputFrozen={
                    talkOpen ||
                    spectacleOpen ||
                    feltShareOpen ||
                    trailerOpen ||
                    echoSurpriseOpen ||
                    enteringBank ||
                    bankOpen
                  }
                  cinemaFocus={plinthCinemaLock ? MEMORY_PLINTH_LOOK_AT : null}
                  cinemaEye={plinthCinemaLock ? MEMORY_PLINTH_CINEMA_EYE : null}
                  plinthSpectacleActive={plinthLampPeak}
                  weatherFog={
                    spectacleOpen ||
                    feltShareOpen ||
                    plinthGlow ||
                    echoSurpriseOpen ||
                    trailerOpen
                      ? { near: 8, far: 42 }
                      : weatherFogParams(harborWeatherMood(save))
                  }
                  npcMemory={save.npcMemory ?? null}
                  scarEcho={scarEcho}
                  fallbackMode={fallbackMode}
                  onFallbackTalkPiggy={
                    onTalkNpc
                      ? () => onTalkNpc(HARBOR_KEEPER_MASCOT_ID)
                      : undefined
                  }
                  onFallbackEnterBank={
                    ledgerBank
                      ? () => {
                          if (enteringBank || bankOpen) return;
                          setEnteringBank(true);
                        }
                      : undefined
                  }
                  piggyPresenceBeat={stripPlaza}
                  cinemaActive={hideHudForCinema}
                  onPlazaReady={markPlazaReady}
                />
                <GuideEdgeCue
                  projection={guideProjection}
                  enabled={guideArrows && !hideHudForCinema}
                />
                {spectacleOpen ? (
                  <ScarSpectacleOverlay
                    scars={plaques}
                    onDone={closeSpectacle}
                    onPhaseChange={setSpectaclePhase}
                  />
                ) : null}
                {feltShareOpen && !spectacleOpen && latestPlaque ? (
                  <HarborFeltShareOverlay
                    scarLabel={latestPlaque.label}
                    chapter={scarChapterTitle(latestPlaque)}
                    organId={latestOrgan}
                    scarMeta={{ id: latestPlaque.id, islandId: latestPlaque.islandId }}
                    previewUrl={feltPreviewUrl}
                    onShare={async () => {
                      try {
                        const result = await shareHarborFeltCard({
                          voyagerName: voyager.name || "Voyager",
                          scarLabel: latestPlaque.label,
                          chapter: scarChapterTitle(latestPlaque),
                          scarId: latestPlaque.id,
                          islandId: latestPlaque.islandId,
                          organId: latestOrgan,
                        });
                        toast.message(result === "shared" ? "Shared" : "Share card downloaded");
                      } catch (err) {
                        if (err instanceof DOMException && err.name === "AbortError") return;
                        toast.error("Couldn’t build share card");
                      }
                      setFeltShareOpen(false);
                    }}
                    onKeepWalking={() => setFeltShareOpen(false)}
                  />
                ) : null}
                {echoSurpriseOpen && !spectacleOpen && !feltShareOpen && !trailerOpen ? (
                  <Day2EchoOverlay
                    scarLabel={latestPlaque?.label ?? "your Take"}
                    organId={latestOrgan ?? "memory"}
                    onVisitPlinth={() => {
                      setEchoSurpriseOpen(false);
                      onMarkEchoSurprise?.();
                      playCapitalSfx("plinth_hum");
                      // Live lamp peak first — plaque modal after a short hold so glow reads.
                      setPlinthGlow(true);
                      window.setTimeout(() => setHubModal("memory"), 1400);
                    }}
                    onDismiss={() => {
                      setEchoSurpriseOpen(false);
                      onMarkEchoSurprise?.();
                      setPlinthGlow(true);
                    }}
                  />
                ) : null}
                <SignatureTrailerOverlay
                  open={trailerOpen}
                  scarLabel={latestPlaque?.label}
                  onDone={() => setTrailerOpen(false)}
                />
              </>
            )}
          </div>
        }
        topLeft={
          hideHudForCinema || hideHudForHarborLoad ? null : stripPlaza ? (
            <div className="cap-play-hud-left">
              <p
                className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white/90"
                data-testid="harbor-quiet-chip"
              >
                Harbor is quiet — Piggy’s here
              </p>
            </div>
          ) : earlyCastle && !showOutfitterChrome ? (
            <div className="cap-play-hud-left">
              <p className="rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white/90">
                Harbor Haven
              </p>
            </div>
          ) : (
          <div className="cap-play-hud-left">
            {showOutfitterChrome ? (
              <button
                type="button"
                onClick={openOutfitter}
                aria-label="Open Outfitter"
                className="rounded-full ring-2 ring-white/40"
              >
                <CharacterAvatar character={voyager} size={36} animationStyle="capital-default" />
              </button>
            ) : null}
            {!earlyCastle ? <WealthHud totalCoins={userProfile.totalCoins} compact /> : null}
            {!simplified && !castleMode ? (
              <VoyagerLedgerHud ledger={ensureLedger(save.voyagerLedger)} compact />
            ) : null}
            {freedomPlazaLine && !castleMode && !piggyPresence ? (
              <p
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ${
                  freed
                    ? "bg-emerald-900/55 text-emerald-50 ring-emerald-200/35"
                    : "bg-amber-950/60 text-amber-50 ring-amber-200/35"
                }`}
                data-testid="harbor-freedom-chip"
                title={
                  freed
                    ? "Harbor Freedom Seal — Pavilion + carpet tier"
                    : "Freedom Seal chase — keep cashflow strong after pouch dips"
                }
              >
                {freedomPlazaLine}
              </p>
            ) : null}
          </div>
          )
        }
        topRight={
          hideHudForCinema ||
          hideHudForHarborLoad ||
          quietHarbor ||
          earlyCastle ||
          firstMeet ? null : (
          <div className="flex items-center gap-1.5">
            {/* Learning profile lives in Settings — plaza stays myth, not SaaS rank chip */}
            {showLeaveChrome ? (
              <GameButton
                variant="outline"
                size="sm"
                onClick={onExit}
                className="bg-black/35 text-white"
                data-testid="hub-leave-islands"
                title="Leave Fortune Archipelago"
              >
                Leave Fortune Archipelago
              </GameButton>
            ) : null}
          </div>
          )
        }
        bottom={
          hideHudForCinema || hideHudForHarborLoad ? null : (
          <div className="flex w-full max-w-sm flex-col items-center gap-2 px-2">
            {firstMeet || stripPlaza ? (
              <p
                className="max-w-xs text-center text-sm font-semibold text-white/90 drop-shadow"
                data-testid="harbor-piggy-presence"
              >
                {ashorePresenceLine({ firstMeet: firstMeet && !stripPlaza })}
              </p>
            ) : showTravelChip ? null : (
            <CoinBagBuddyHud
              tip={buddyTip.tip}
              detail={castleMode ? guidedStep?.coach : undefined}
              guideArrows={guideArrows}
              onToggleGuide={earlyCastle ? undefined : toggleGuide}
            />
            )}
            {/* Talk only when near Piggy (or quiet homecoming). No ambush CTA. */}
            {forceTalkCta && onTalkNpc ? (
                <button
                  type="button"
                  className="min-h-12 w-full touch-manipulation rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-4 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917]"
                  data-testid="hub-talk-npc"
                  {...pointerSafeActivate(() =>
                    onTalkNpc(nearNpc?.id ?? HARBOR_KEEPER_MASCOT_ID),
                  )}
                >
                  Talk to {nearNpc?.name ?? "Piggy Penny"}?
                </button>
            ) : showTravelChip ? (
              <button
                type="button"
                data-testid="hub-travel-map"
                {...pointerSafeActivate(() => {
                  onHubGuidedEvent("opened_map");
                  onOpenTravel();
                })}
                className="min-h-12 w-full touch-manipulation rounded-2xl border-2 border-[#1c1917] bg-[#f4b942] px-4 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917]"
              >
                Board Money Carpet · Coincraft Cove
              </button>
            ) : nearStore ? (
              <GameButton
                variant="primary"
                size="lg"
                onClick={() => onHarborHotspot(nearStore.id)}
                className="w-full shadow-lg"
                data-testid="hub-enter-store"
              >
                {nearTravel ? `Board carpet · open map` : `Enter ${nearStore.label}`}
              </GameButton>
            ) : nearNpc && onTalkNpc ? (
              <GameButton
                variant="primary"
                size="lg"
                onClick={() => onTalkNpc(nearNpc.id)}
                className="w-full shadow-lg"
                data-testid="hub-talk-npc"
              >
                Talk to {nearNpc.name}
              </GameButton>
            ) : (
              <p className="text-center text-[11px] font-medium text-white/75 drop-shadow">
                WASD / walk pad · E talk
              </p>
            )}
            <p
              className="text-center text-[11px] font-semibold text-white/85 drop-shadow"
              data-testid="harbor-controls-whisper"
            >
              {firstMeet && !nearPiggy
                ? "WASD · walk to Piggy · E when near"
                : showTravelChip
                  ? "Or walk to the Money Carpet"
                  : nearStore
                    ? "E enter · Esc leaves shops"
                    : nearNpc
                      ? "WASD · E"
                      : "WASD · E · map at Money Carpet"}
            </p>
          </div>
          )
        }
      >
        {/* Pass-through stage — harbor canvas must receive clicks; no stacked center banners */}
        {hideHudForCinema || hideHudForHarborLoad ? null : (
        <div data-hud-pass className="flex h-full min-h-0 flex-col">
          <div className="sr-only" data-testid="harbor-plaza" data-plaza-room={plazaRoom} />
          {castleMode &&
          guidedStep &&
          shouldShowCastleCoach({
            guidedStepId: guidedStep.id,
            quietHomecoming: quietHarbor,
          }) ? (
            <div
              className="pointer-events-none absolute inset-x-0 top-3 z-[5] flex justify-center px-3"
              data-testid="castle-grounds-coach"
              data-guided-step={guidedStep.id}
            >
              <div className="max-w-md rounded-2xl border border-amber-200/35 bg-black/70 px-4 py-2.5 text-center shadow-lg backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
                  {guidedStep.verb} · Harbor Haven
                </p>
                <p className="mt-0.5 text-sm font-semibold text-white">{guidedStep.coach}</p>
              </div>
            </div>
          ) : null}
        </div>
        )}
      </GameHudLayout>
      <TouchWalkPad
        enabled={
          plazaReady &&
          !talkOpen &&
          !spectacleOpen &&
          !feltShareOpen &&
          !trailerOpen &&
          !echoSurpriseOpen &&
          !hubModal
        }
      />
      </div>

      {hubModal === "outfitter" ? (
        <OutfitterStudioOverlay
          draft={draft}
          setDraft={setDraft}
          stage={outfitterStage}
          setStage={setOutfitterStage}
          save={save}
          defaultName={userProfile.name}
          onLeave={() => setHubModal(null)}
          onSaveLook={(c) => setDraft({ ...c, companion: draft.companion })}
          onAdoptPet={(c) => {
            onSaveCharacter(
              c ?? (draft.companion === "none" ? { ...draft, companion: "tortoise" } : draft),
            );
          }}
          onHarborPurchase={(price, companionId) => {
            const ok = onHarborPurchase({
              kind: "companion",
              companionId,
              price,
            });
            if (!ok && price > 0) {
              toast.error(`Need 🪙 ${price} for that pet`);
              return false;
            }
            if (price > 0) toast.success(`Adopted! −🪙 ${price}`);
            else if (companionId !== "none") toast.success("Companion ready!");
            return true;
          }}
        />
      ) : null}

      {hubModal === "capsule" ? (
        <CapsuleStudioOverlay
          save={save}
          userProfile={userProfile}
          onLeave={() => setHubModal(null)}
          onHarborPurchase={(purchase) => onHarborPurchase(purchase)}
          showPeekDone={guidedStep?.id === "tiny_spend"}
          onPeekDone={() => onHubGuidedEvent("capsule_visit")}
        />
      ) : null}

      {hubModal === "market" ? (
        <HarborMarketOverlay onLeave={() => setHubModal(null)} />
      ) : null}

      <GameModal
        open={hubModal === "pavilion"}
        onClose={() => setHubModal(null)}
        maxWidth="md"
        usePortal
        showCloseButton
        title="Freedom Pavilion"
      >
        <div className="space-y-4 text-center">
          <div className="text-5xl">🏆</div>
          <h2 className="text-xl font-black">You escaped paycheck-to-paycheck</h2>
          <p className="text-sm text-muted-foreground">
            This wing opens when your Harbor ledger proves Freedom. Your carpet already got a boost —
            polish it further at the Capsule Stall anytime.
          </p>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
            {boat.emoji} Current carpet: {boat.label}
          </div>
          <GameButton
            variant="primary"
            className="w-full"
            onClick={() => setHubModal("capsule")}
          >
            Polish carpet at Capsules →
          </GameButton>
          <GameButton variant="outline" className="w-full" onClick={() => setHubModal(null)}>
            Back to plaza
          </GameButton>
        </div>
      </GameModal>

      <GameModal
        open={hubModal === "memory"}
        onClose={() => setHubModal(null)}
        maxWidth="md"
        usePortal
        showCloseButton
        title="Memory Plinth"
      >
        <div className="space-y-4 text-left" data-testid="harbor-memory-modal">
          <p className="text-sm text-muted-foreground text-center">
            Harbor remembers by organ — Coin · Clock · Spiral · Memory.
          </p>
          {latestPlaque ? (
            <p
              className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950"
              data-testid="memory-plinth-retell"
            >
              {coldRetellLine(latestPlaque)}
            </p>
          ) : null}
          {stanceLine ? (
            <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-950">
              {stanceLine}
            </p>
          ) : null}
          <div className="space-y-4">
            {plaqueGroups.map((group) => (
              <div key={group.chapter}>
                <p className="mb-1 text-xs font-black uppercase tracking-wide text-stone-500">
                  {group.chapter}
                </p>
                <ul className="space-y-2">
                  {group.scars.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-900"
                      data-testid={`plinth-plaque-${p.id}`}
                    >
                      {plaqueShelfLine(p)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {plaques.length > 0 ? (
            <GameButton
              variant="outline"
              className="w-full"
              data-testid="replay-signature-beat"
              onClick={() => {
                setHubModal(null);
                setTrailerOpen(true);
              }}
            >
              Replay signature beat (~24s)
            </GameButton>
          ) : null}
          <GameButton variant="primary" className="w-full" onClick={() => setHubModal(null)}>
            Back to plaza
          </GameButton>
        </div>
      </GameModal>

      <GameModal
        open={hubModal === "studio_stele"}
        onClose={() => setHubModal(null)}
        maxWidth="md"
        usePortal
        showCloseButton
        title="Studio Stele"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-muted-foreground text-center">
            Levels you published leave a permanent mark on Harbor. Identity over grind.
          </p>
          <ul className="space-y-2">
            {studioMarks.map((m) => (
              <li
                key={m.levelId}
                className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-950"
              >
                <p className="font-bold">{m.title}</p>
                <p className="text-xs opacity-80">
                  by {m.author} · stamped {new Date(m.stampedAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
          <GameButton variant="primary" className="w-full" onClick={() => setHubModal(null)}>
            Back to plaza
          </GameButton>
        </div>
      </GameModal>

      <GameModal
        open={hubModal === "ritual"}
        onClose={closeRitual}
        maxWidth="md"
        usePortal
        showCloseButton
        title="Harbor Daily Ritual"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-muted-foreground text-center">
            Streak {save.harborRitual?.streak ?? 1} day
            {(save.harborRitual?.streak ?? 1) === 1 ? "" : "s"} — show up, listen, collect.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <p className="font-bold">Mascot rumor</p>
            <p className="mt-1">{rumor}</p>
            {!save.harborRitual?.today.rumorSeen ? (
              <GameButton
                variant="outline"
                className="mt-2 w-full"
                onClick={() => onMarkRitualRumor?.()}
              >
                Heard it →
              </GameButton>
            ) : (
              <p className="mt-2 text-xs font-semibold text-emerald-800">Heard today</p>
            )}
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950">
            <p className="font-bold">Pay Day</p>
            <p className="mt-1 text-muted-foreground">
              One ledger Pay Day for Harbor escape streak — same math as the board.
            </p>
            <GameButton
              variant="primary"
              className="mt-2 w-full"
              disabled={Boolean(save.harborRitual?.today.paydayDone)}
              onClick={() => onClaimRitualPayday?.()}
            >
              {save.harborRitual?.today.paydayDone ? "Pay Day collected" : "Collect Pay Day"}
            </GameButton>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
            <p className="font-bold">Tiny reward</p>
            <p className="mt-1 text-muted-foreground">
              +5 coins after rumor + Pay Day — never buys progress.
            </p>
            <GameButton
              variant="outline"
              className="mt-2 w-full"
              disabled={
                Boolean(save.harborRitual?.today.rewardClaimed) ||
                !save.harborRitual?.today.paydayDone ||
                !save.harborRitual?.today.rumorSeen
              }
              onClick={() => onClaimRitualReward?.()}
            >
              {save.harborRitual?.today.rewardClaimed ? "Reward claimed" : "Claim +5 coins"}
            </GameButton>
          </div>
          {weekly && weeklyInfo ? (
            <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-950">
              <p className="font-bold">Weekly · {weeklyInfo.title}</p>
              <p className="mt-1">{weeklyInfo.blurb}</p>
              <p className="mt-1 font-semibold">
                {weekly.progress}/{weekly.target}
                {weekly.done ? " — cleared!" : ""}
              </p>
              <GameButton
                variant="outline"
                className="mt-2 w-full"
                onClick={async () => {
                  const text = weeklyShareText(weekly, voyager.name || "Voyager");
                  try {
                    await navigator.clipboard.writeText(text);
                    toast.message("Share line copied", { description: text });
                  } catch {
                    toast.message(text);
                  }
                }}
              >
                Copy share line
              </GameButton>
              <GameButton
                variant="primary"
                className="mt-2 w-full"
                onClick={async () => {
                  try {
                    await downloadWeeklyShareCard({
                      voyagerName: voyager.name || "Voyager",
                      title: weeklyInfo.title,
                      progress: `${weekly.progress}/${weekly.target}${weekly.done ? " cleared" : ""}`,
                      streak: save.harborRitual?.streakDays ?? 0,
                      plinthHint:
                        plaques.length > 0
                          ? `Memory Plinth · ${plaques.length} plaque${plaques.length === 1 ? "" : "s"}`
                          : "Money is alive in Harbor Haven",
                    });
                    toast.message("Share card downloaded");
                  } catch {
                    toast.error("Couldn’t build share card");
                  }
                }}
              >
                Download PNG card
              </GameButton>
            </div>
          ) : null}
          <GameButton variant="primary" className="w-full" onClick={closeRitual}>
            Back to plaza
          </GameButton>
        </div>
      </GameModal>

      <GameModal
        open={hubModal === "gallery"}
        onClose={() => setHubModal(null)}
        maxWidth="md"
        usePortal
        showCloseButton
        title="Studio Gallery"
      >
        <div className="space-y-3 text-left">
          <p className="text-sm text-muted-foreground text-center">
            Local community levels from Vibe Studio. Hide anything you don’t want — no pay-to-win.
          </p>
          {galleryLevels.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-300 px-3 py-6 text-center text-sm text-muted-foreground">
              No published levels yet. Open VibeCode, build, and publish — they’ll show here.
            </p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {galleryLevels.map((lvl) => (
                <li
                  key={lvl.id}
                  className="flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2"
                >
                  <span className="text-xl" aria-hidden>
                    {lvl.icon || "🎮"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{lvl.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      by {lvl.author} · {lvl.plays} plays
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <GameButton
                      variant="outline"
                      className="h-8 px-2 text-xs"
                      onClick={() => {
                        bumpPlays(lvl.id);
                        pinLevelToRoom(lvl.id);
                        onStudioGalleryOpened?.();
                        setHubModal(null);
                        onOpenStudio();
                        toast.message(`Opening Studio for “${lvl.title}”`);
                      }}
                    >
                      Open
                    </GameButton>
                    <GameButton
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() => {
                        hideCommunityLevel(lvl.id);
                        setGalleryLevels(loadVisibleCommunityLevels());
                        toast.message("Hidden on this device");
                      }}
                    >
                      Hide
                    </GameButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <GameButton variant="primary" className="w-full" onClick={() => setHubModal(null)}>
            Back to plaza
          </GameButton>
          <GameButton
            variant="outline"
            className="w-full"
            onClick={() => {
              setHubModal(null);
              onOpenStudio();
            }}
          >
            Open Vibe Studio →
          </GameButton>
        </div>
      </GameModal>

      <GameModal
        open={hubModal === "family"}
        onClose={() => setHubModal(null)}
        maxWidth="md"
        usePortal
        showCloseButton
        title="Family Room"
      >
        <div className="space-y-3 text-left" data-testid="family-room-modal">
          <p className="text-sm text-muted-foreground text-center">
            Local household / classroom room — invite code stays on-device. Share JSON to join on another device. Never pay-to-win.
          </p>
          {familyMyth ? (
            <p
              className="rounded-xl border border-amber-200/60 bg-amber-50 px-3 py-2 text-center text-sm text-amber-950"
              data-testid="family-plaque-myth"
            >
              {familyMyth}
            </p>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              After a Cove Take, this room will name your plaque — still local, still myth.
            </p>
          )}
          {familyRoom ? (
            <>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                <p className="font-bold">{familyRoom.name}</p>
                <p className="font-mono text-lg tracking-widest">{familyRoom.code}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {familyRoom.members.length} member
                  {familyRoom.members.length === 1 ? "" : "s"}:{" "}
                  {familyRoom.members.map((m) => m.name).join(", ")}
                </p>
              </div>
              <ul className="space-y-1 text-sm">
                {roomPinnedLevels(familyRoom).map((lvl) => (
                  <li key={lvl.id} className="rounded-lg border px-2 py-1">
                    {lvl.icon} {lvl.title}
                  </li>
                ))}
              </ul>
              <GameButton
                variant="outline"
                className="w-full"
                onClick={async () => {
                  const text = exportFamilyRoomJson(familyRoom);
                  try {
                    await navigator.clipboard.writeText(text);
                    toast.message("Room JSON copied — paste on another device to join");
                  } catch {
                    toast.message(text);
                  }
                }}
              >
                Copy share JSON
              </GameButton>
              <GameButton
                variant="ghost"
                className="w-full"
                onClick={() => {
                  leaveFamilyRoom();
                  setFamilyRoom(null);
                  toast.message("Left Family Room");
                }}
              >
                Leave room
              </GameButton>
            </>
          ) : (
            <>
              <div className="space-y-2 rounded-xl border px-3 py-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Create</p>
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  placeholder="Room name"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                />
                <GameButton
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    const room = createFamilyRoom(familyName || "Family Harbor", voyager.name);
                    setFamilyRoom(room);
                    toast.message(`Room ${room.code} created`);
                  }}
                >
                  Create room
                </GameButton>
              </div>
              <div className="space-y-2 rounded-xl border px-3 py-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Join with code</p>
                <input
                  className="w-full rounded border px-2 py-1 font-mono text-sm uppercase"
                  placeholder="ABC123"
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value)}
                />
                <GameButton
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const room = joinFamilyRoom(familyCode, voyager.name);
                    if (!room) {
                      toast.error("Code not found on this device — import share JSON first");
                      return;
                    }
                    setFamilyRoom(room);
                    toast.message(`Joined ${room.name}`);
                  }}
                >
                  Join
                </GameButton>
              </div>
              <div className="space-y-2 rounded-xl border px-3 py-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Import share JSON</p>
                <textarea
                  className="h-20 w-full rounded border px-2 py-1 font-mono text-xs"
                  placeholder='{"code":"..."}'
                  value={familyImport}
                  onChange={(e) => setFamilyImport(e.target.value)}
                />
                <GameButton
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    try {
                      const room = importFamilyRoomJson(familyImport);
                      setFamilyRoom(room);
                      toast.message(`Imported ${room.code}`);
                    } catch {
                      toast.error("Invalid room JSON");
                    }
                  }}
                >
                  Import
                </GameButton>
              </div>
            </>
          )}
          <p className="text-center text-xs text-muted-foreground">
            {weatherCoachLine(harborWeatherMood(save))}
          </p>
          <GameButton variant="primary" className="w-full" onClick={() => setHubModal(null)}>
            Back to plaza
          </GameButton>
        </div>
      </GameModal>

      <GameModal
        open={hubModal === "settings"}
        onClose={() => setHubModal(null)}
        maxWidth="md"
        usePortal
        showCloseButton
        title="Settings"
      >
        <Suspense fallback={<div className="py-4 text-center">Loading settings…</div>}>
          <LazySettingsPanel
            settings={a11y}
            onChange={updateA11y}
            onClose={() => setHubModal(null)}
            learningProfile={learningProfile}
            onProfileChange={updateLearningProfile}
            onOpenAnalytics={onOpenAnalytics}
          />
        </Suspense>
      </GameModal>
    </>
  );
}
