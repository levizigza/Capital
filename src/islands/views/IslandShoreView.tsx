import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  GameHudLayout,
  GameButton,
  GameModal,
  HudBadge,
} from "@/game-ui";
import { useInputAction } from "@/input";
import { MoveTalkMapHint } from "./FtueControlsHint";

import type { UserProfile } from "@/App";
import type {
  IslandDefinition,
  IslandSaveV1,
  ItemId,
  NpcId,
  QuestObjective,
} from "../types";
import type { LearningProfileId } from "../learningProfile";
import type { CapitalCharacter } from "../character";
import { getIslandTheme } from "../themes/islandThemes";
import { CharacterAvatar } from "./CharacterAvatar";
import { WealthHud } from "./WealthHud";
import { CoinBagBuddyHud } from "./CoinBagBuddyHud";
import { GuideEdgeCue, type GuideProjection } from "./GuideWayfinder";
import { coinBagIslandTip } from "../story/coinBagBuddy";
import {
  clearLastConsumedSoftBeat,
  peekLastConsumedSoftBeat,
  peekSoftBeatArm,
  softBeatArmWhisper,
  softBeatSpentHushLine,
} from "../softBeatArm";
import { resolveAdaptiveBuddyTip, syncWorldPlace, gameEvents } from "../gameSystems";
import { WalkableIslandExplore } from "../world3d/WalkableIslandExplore";
import { MoneyStructureInteriorView } from "../world3d/MoneyStructureInteriorView";
import { buildShoreHotspots } from "../islandShoreLayout";
import { moneyStructureForIsland, type MoneyStructurePart } from "../moneyStructures";
import { playCapitalSfx } from "../audio/capitalSfx";
import { WorldArriveOverlay } from "./WorldArriveOverlay";
import { SoftBeatOverlay, type SoftBeatKind } from "./SoftBeatOverlay";
import { TakeHushOverlay, type TakeCinemaPhase } from "./TakeHushOverlay";
import { takeFootprintFeedbackLine } from "../firstFinancialScenario";
import { TouchWalkPad } from "./TouchWalkPad";
import { resolveShoreGuideLookAt } from "../coinBagGuideTargets";
import { IslandPlayView } from "./IslandPlayView";
import { nextMainCourseStep, SIDE_TOMFOOLERY } from "../mainCourse";
import { getIslandCulture } from "../islandCulture";
import { isSideShoreTravelId, isSpineTravelId } from "../spineArchipelago";
import type { AccessibilitySettings } from "../settings";
import {
  harborScarPlaques,
  organQuietBadge,
  organTakeHushLine,
  organVerbChip,
  plaqueShelfLine,
} from "../worldMemory";
import { moneyOrganForIsland } from "../moneyOrgans";
import {
  SHORE_MONEY_CARPET,
  SHORE_TO_HARBOR,
  structureEnterCta,
} from "../titleVoice";
import { pointerSafeActivate } from "../pointerSafeClick";

export type IslandShoreViewProps = {
  island: IslandDefinition;
  save: IslandSaveV1;
  userProfile: UserProfile;
  learningProfile: LearningProfileId;
  character?: CapitalCharacter | null;
  objectiveKey: (obj: QuestObjective) => string;
  a11y?: AccessibilitySettings;
  onA11yChange?: (next: AccessibilitySettings) => void;
  onTalkNpc: (npcId: NpcId) => void;
  onCollectItem: (itemId: ItemId) => void;
  onPlayMinigame: (minigameId: string) => void;
  /** Money Structure part pads — stay-put fail source */
  onPlayStructureMinigame?: (minigameId: string) => void;
  onOpenBoard: () => void;
  onOpenTravel: () => void;
  onOpenHub: () => void;
  onEnterArea: (areaId: string) => void;
  onStartQuest: (questId: string) => void;
  /** True while Talk Battle is open — freeze world input */
  talkOpen?: boolean;
};

/**
 * Docked island experience — walkable shore first (Harbor-like),
 * journal / party board as opt-in pads. Never auto-launches a quiz.
 */
export function IslandShoreView({
  island,
  save,
  userProfile,
  learningProfile,
  character,
  objectiveKey,
  a11y,
  onA11yChange,
  onTalkNpc,
  onCollectItem,
  onPlayMinigame,
  onPlayStructureMinigame,
  onOpenBoard,
  onOpenTravel,
  onOpenHub,
  onEnterArea,
  onStartQuest,
  talkOpen = false,
}: IslandShoreViewProps) {
  const theme = getIslandTheme(island.id, island.themeId);
  const hotspots = useMemo(() => buildShoreHotspots(island), [island]);
  const structure = useMemo(() => moneyStructureForIsland(island.id), [island.id]);
  const organ = useMemo(() => moneyOrganForIsland(island.id), [island.id]);
  const [near, setNear] = useState<{ id: string; label: string } | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [structureOpen, setStructureOpen] = useState(false);
  const [enteringJar, setEnteringJar] = useState(false);
  const [softBeat, setSoftBeat] = useState<SoftBeatKind | null>(null);
  const [takeHushOpen, setTakeHushOpen] = useState(false);
  const [takeCinemaPhase, setTakeCinemaPhase] = useState<TakeCinemaPhase | null>(null);
  const takeHushSeenRef = useRef(false);
  const [guideProjection, setGuideProjection] = useState<GuideProjection | null>(null);
  const chapterQuiet = Boolean(save.chapterQuietPending);
  const latestScar = harborScarPlaques(save).at(-1) ?? null;

  // World cinema after Talk dismisses — never under the Talk Battle card.
  useEffect(() => {
    if (!chapterQuiet) {
      takeHushSeenRef.current = false;
      setTakeHushOpen(false);
      setTakeCinemaPhase(null);
      return;
    }
    if (talkOpen) return;
    if (!takeHushSeenRef.current) {
      takeHushSeenRef.current = true;
      setTakeCinemaPhase("hush");
      setTakeHushOpen(true);
    }
  }, [chapterQuiet, talkOpen]);

  const dismissTakeHush = useCallback(() => {
    clearLastConsumedSoftBeat();
    setTakeHushOpen(false);
    setTakeCinemaPhase(null);
  }, []);
  const guideLookAt = useMemo(
    () => resolveShoreGuideLookAt(island, save, hotspots),
    [island, save, hotspots],
  );
  const guideArrows = a11y?.guideArrows !== false;
  const nextStep = useMemo(() => nextMainCourseStep(save), [save]);
  const sideShore = isSideShoreTravelId(island.id);
  /** Spine shores lead with organ verb — genre city chrome stays parked. */
  const spineShore = isSpineTravelId(island.id);
  const culture = useMemo(() => getIslandCulture(island), [island]);

  useEffect(() => {
    syncWorldPlace({
      place: "shore",
      islandId: island.id,
      ecosystemMotion: culture.ecosystemMotion,
    });
    gameEvents.emit("world.entered", {
      place: "shore",
      ecosystemMotion: culture.ecosystemMotion,
    });
  }, [island.id, culture.ecosystemMotion]);

  const armWhisper = softBeatArmWhisper(peekSoftBeatArm());
  const structuralBuddy =
    armWhisper && !chapterQuiet
      ? {
          tip: armWhisper,
          coach: "Soft Beat armed your next Talk — organ chemistry on this shore too.",
        }
      : coinBagIslandTip(save, island);
  const buddy = resolveAdaptiveBuddyTip({
    save,
    profileId: learningProfile,
    ecosystemMotion: culture.ecosystemMotion,
    structuralTip: structuralBuddy,
  });

  const toggleGuide = useCallback(() => {
    if (!a11y || !onA11yChange) return;
    onA11yChange({ ...a11y, guideArrows: !guideArrows });
  }, [a11y, onA11yChange, guideArrows]);

  useInputAction("map", () => {
    if (talkOpen) return;
    onOpenTravel();
  });
  useInputAction("menu", () => {
    if (talkOpen) return;
    onOpenHub();
  });
  useInputAction("cancel", () => {
    if (talkOpen) return;
    if (structureOpen) {
      setStructureOpen(false);
      return;
    }
    if (journalOpen) setJournalOpen(false);
    else onOpenHub();
  });

  const onNearChange = useCallback((id: string | null, label: string | null) => {
    setNear(id && label ? { id, label } : null);
  }, []);

  const enterStructure = useCallback(() => {
    if (!structure || enteringJar) return;
    setEnteringJar(true);
  }, [structure, enteringJar]);

  const finishStructureEnter = useCallback(() => {
    setEnteringJar(false);
    setStructureOpen(true);
  }, []);

  useEffect(() => {
    const onQaStructure = (ev: Event) => {
      const detail = (ev as CustomEvent<{ action?: string; islandId?: string }>).detail;
      if (!detail?.action || !structure) return;
      if (detail.islandId && detail.islandId !== island.id) return;
      if (detail.action === "enter") {
        setEnteringJar(false);
        setStructureOpen(true);
        return;
      }
      if (detail.action === "softBeat") {
        const soft = structure.parts.find((p) => p.softBeat)?.softBeat;
        if (soft === "lookout" || soft === "umbrella" || soft === "battlement") {
          setStructureOpen(true);
          setSoftBeat(soft);
        }
        return;
      }
      if (detail.action === "exit") {
        setSoftBeat(null);
        setStructureOpen(false);
      }
    };
    window.addEventListener("capital:qa-structure", onQaStructure);
    return () => window.removeEventListener("capital:qa-structure", onQaStructure);
  }, [structure, island.id]);

  const onEnterPart = useCallback(
    (part: MoneyStructurePart) => {
      if (part.softBeat === "lookout" || part.softBeat === "umbrella" || part.softBeat === "battlement") {
        setSoftBeat(part.softBeat);
        return;
      }
      if (part.minigameId) {
        playCapitalSfx("scar_chime");
        setStructureOpen(false);
        (onPlayStructureMinigame ?? onPlayMinigame)(part.minigameId);
      }
    },
    [onPlayMinigame, onPlayStructureMinigame],
  );

  const activate = useCallback(
    (hotspotId: string) => {
      const h = hotspots.find((x) => x.id === hotspotId);
      if (!h) return;
      if (h.kind === "pier") {
        onOpenTravel();
        return;
      }
      if (h.kind === "party_board") {
        onOpenBoard();
        return;
      }
      if (h.kind === "journal") {
        setJournalOpen(true);
        return;
      }
      if (h.kind === "npc" && h.refId) {
        onTalkNpc(h.refId as NpcId);
        return;
      }
      if (h.kind === "play_pad" && h.minigameId) {
        onPlayMinigame(h.minigameId);
        return;
      }
      if (h.kind === "money_structure") {
        enterStructure();
        return;
      }
      if (h.kind === "item" && h.refId) {
        if (!save.inventory.includes(h.refId)) onCollectItem(h.refId as ItemId);
        return;
      }
    },
    [
      hotspots,
      onOpenTravel,
      onOpenBoard,
      onTalkNpc,
      onPlayMinigame,
      onCollectItem,
      save.inventory,
      enterStructure,
    ],
  );

  return (
    <div className="relative h-full min-h-[100dvh] w-full" data-testid="island-shore-view">
      {structureOpen && structure ? (
        <>
          <MoneyStructureInteriorView
            structure={structure}
            character={character}
            onExit={() => setStructureOpen(false)}
            onEnterPart={onEnterPart}
            inputFrozen={Boolean(softBeat)}
          />
            {softBeat ? (
            <SoftBeatOverlay
              kind={softBeat}
              hushActive={chapterQuiet}
              scarLabel={latestScar?.label ?? null}
              onDone={() => setSoftBeat(null)}
            />
          ) : null}
        </>
      ) : null}
      {enteringJar && structure ? (
        <WorldArriveOverlay
          islandId={island.id}
          islandName={structure.name}
          kind="structure_enter"
          headline={structure.enterTransition}
          durationMs={1700}
          onDone={finishStructureEnter}
        />
      ) : null}
      <div
        style={structureOpen ? { visibility: "hidden" } : undefined}
        aria-hidden={structureOpen || undefined}
      >
      <GameHudLayout
        background={
          <div className="absolute inset-0">
            <WalkableIslandExplore
              island={island}
              character={character}
              hotspots={hotspots}
              onHotspot={activate}
              onNearChange={onNearChange}
              collectedItemIds={save.inventory}
              guideTip={buddy.tip}
              guideLookAt={guideLookAt}
              guideArrows={guideArrows}
              onGuideProject={setGuideProjection}
              inputFrozen={talkOpen || enteringJar || structureOpen || takeHushOpen}
              chapterQuiet={chapterQuiet}
              hushCinemaPhase={takeCinemaPhase}
            />
            <GuideEdgeCue
              projection={guideProjection}
              enabled={guideArrows && !takeHushOpen}
              label={
                chapterQuiet ? "Carpet home — Harbor felt that" : buddy.tip
              }
            />
            {takeHushOpen && latestScar ? (
              <TakeHushOverlay
                scarLabel={latestScar.label}
                organId={organ?.id ?? "coin"}
                islandId={island.id}
                footprintLine={takeFootprintFeedbackLine(save)}
                organLine={(() => {
                  const base = organ
                    ? organTakeHushLine(organ.id)
                    : organTakeHushLine("coin");
                  const spent = softBeatSpentHushLine(peekLastConsumedSoftBeat());
                  return spent ? `${base} ${spent}` : base;
                })()}
                onPhaseChange={setTakeCinemaPhase}
                onDone={dismissTakeHush}
              />
            ) : null}
          </div>
        }
        topLeft={
          takeHushOpen ? null : chapterQuiet ? (
            <div className="space-y-1">
              <HudBadge className="mt-1 bg-slate-900/80 text-white" data-testid="shore-take-hush">
                {organQuietBadge(organ?.id ?? "coin")}
              </HudBadge>
              {latestScar ? (
                <p className="max-w-xs text-[11px] text-white/75 drop-shadow">
                  {plaqueShelfLine(latestScar)} · Harbor felt that
                </p>
              ) : null}
            </div>
          ) : (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl" aria-hidden>
                {island.icon}
              </span>
              <h1 className="text-xl font-black text-white drop-shadow sm:text-2xl">{island.name}</h1>
            </div>
            {spineShore ? (
              <p className="max-w-md text-xs text-white/85 drop-shadow" data-testid="shore-organ-line">
                <span className="font-bold text-amber-200">
                  {organVerbChip(organ?.id ?? "coin")}
                </span>
                {" — living money on this shore"}
              </p>
            ) : null}
            {sideShore ? (
              <div
                className="mt-1 max-w-sm rounded-xl border border-sky-300/30 bg-black/40 px-2.5 py-1.5 text-[11px] text-sky-50"
                data-testid="shore-next-verb"
                data-free-roam="1"
              >
                <span className="font-bold uppercase tracking-wide text-sky-200">Free roam</span>
                {" · "}
                Side shore — stray as you like; main story waits on the spine
              </div>
            ) : nextStep ? (
              <div
                className="mt-1 max-w-sm rounded-xl border border-amber-300/35 bg-black/40 px-2.5 py-1.5 text-[11px] text-amber-50"
                data-testid="shore-next-verb"
              >
                <span className="font-bold uppercase tracking-wide text-amber-200">
                  {organVerbChip(moneyOrganForIsland(island.id)?.id ?? "coin")}
                </span>
                {" · "}
                {nextStep.title}
              </div>
            ) : (
              <div className="mt-1 text-[11px] font-bold text-emerald-200" data-testid="shore-next-verb">
                {organVerbChip(moneyOrganForIsland(island.id)?.id ?? "coin")} — explore freely
              </div>
            )}
          </div>
          )
        }
        topRight={
          takeHushOpen ? null : (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!chapterQuiet ? (
              <WealthHud totalCoins={userProfile.totalCoins} compact />
            ) : null}
            {!chapterQuiet && character ? (
              <CharacterAvatar
                character={character}
                size={40}
                animationStyle={theme.animationStyle}
                morphFromHome
              />
            ) : null}
            {!chapterQuiet ? (
              <GameButton
                variant="outline"
                size="sm"
                {...pointerSafeActivate(onOpenTravel)}
              >
                {SHORE_MONEY_CARPET}
              </GameButton>
            ) : null}
            {chapterQuiet ? (
              <GameButton
                variant="primary"
                size="sm"
                data-testid="shore-carpet-home"
                {...pointerSafeActivate(onOpenTravel)}
              >
                Carpet home — Harbor felt that
              </GameButton>
            ) : (
              <GameButton
                variant="primary"
                size="sm"
                {...pointerSafeActivate(onOpenHub)}
              >
                {SHORE_TO_HARBOR}
              </GameButton>
            )}
          </div>
          )
        }
        bottom={
          takeHushOpen ? null : (
          <div className="flex w-full flex-col items-center gap-2 pb-2">
            {chapterQuiet ? (
              <GameButton
                variant="primary"
                size="lg"
                data-testid="shore-carpet-home-cta"
                {...pointerSafeActivate(onOpenTravel)}
                className="shadow-lg"
              >
                {near?.id === "pier"
                  ? "Board the carpet home"
                  : "Carpet home — Harbor felt that"}
              </GameButton>
            ) : near ? (
              <GameButton
                variant="primary"
                size="lg"
                autoFocus
                data-testid="shore-interact"
                {...pointerSafeActivate(() => activate(near.id))}
                className="shadow-lg"
              >
                {hotspots.find((h) => h.id === near.id)?.kind === "npc"
                  ? `Talk · ${near.label}`
                  : hotspots.find((h) => h.id === near.id)?.kind === "money_structure"
                    ? structureEnterCta(
                        structure?.entryVerb ?? "",
                        near.label,
                      )
                    : `Go · ${near.label}`}
              </GameButton>
            ) : (
              <p className="cap-hint-whisper">
                <MoveTalkMapHint compact className="justify-center" />
              </p>
            )}
          </div>
          )
        }
      >
        {takeHushOpen ? null : (
        <div data-hud-pass className="flex h-full min-h-0 flex-col items-center justify-start gap-2 pt-1">
          <CoinBagBuddyHud
          tip={
            chapterQuiet
              ? near?.id === "pier"
                ? "Board the carpet home"
                : "Walk to the pier · board Carpet"
              : buddy.tip
          }
          detail={chapterQuiet ? undefined : buddy.coach}
          track={buddy.track}
          guideArrows={guideArrows}
          onToggleGuide={onA11yChange ? toggleGuide : undefined}
        />
        </div>
        )}
      </GameHudLayout>
      <TouchWalkPad enabled={!talkOpen && !takeHushOpen && !enteringJar} />
      </div>

      <GameModal
        open={journalOpen}
        onClose={() => setJournalOpen(false)}
        maxWidth="xl"
        usePortal={false}
        zIndex={40}
        title={`${island.name} · Financial Quest Journal`}
        showCloseButton
      >
        <IslandPlayView
          island={island}
          save={save}
          totalCoins={userProfile.totalCoins}
          activeAreaId={save.currentAreaId}
          learningProfile={learningProfile}
          objectiveKey={objectiveKey}
          character={character ?? undefined}
          animationStyle={theme.animationStyle}
          onEnterArea={onEnterArea}
          onTalkNpc={(id) => {
            setJournalOpen(false);
            onTalkNpc(id);
          }}
          onCollectItem={onCollectItem}
          onStartQuest={onStartQuest}
          onOpenTravel={() => {
            setJournalOpen(false);
            onOpenTravel();
          }}
          onOpenHub={() => {
            setJournalOpen(false);
            onOpenHub();
          }}
          onPlayMinigame={(id) => {
            setJournalOpen(false);
            onPlayMinigame(id);
          }}
          onOpenBoard={() => {
            setJournalOpen(false);
            onOpenBoard();
          }}
        />
      </GameModal>
    </div>
  );
}
