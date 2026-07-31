import { useCallback, useMemo, useState, useEffect } from "react";
import {
  GameHudLayout,
  GameButton,
  GameModal,
  HudBadge,
} from "@/game-ui";
import { useInputAction } from "@/input";

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
import { getAnimationStyle } from "../animationStyles";
import { CharacterAvatar } from "./CharacterAvatar";
import { WealthHud } from "./WealthHud";
import { CoinBagBuddyHud } from "./CoinBagBuddyHud";
import { GuideEdgeCue, type GuideProjection } from "./GuideWayfinder";
import { coinBagIslandTip } from "../story/coinBagBuddy";
import { resolveAdaptiveBuddyTip, syncWorldPlace, gameEvents } from "../gameSystems";
import { WalkableIslandExplore } from "../world3d/WalkableIslandExplore";
import { MoneyStructureInteriorView } from "../world3d/MoneyStructureInteriorView";
import { buildShoreHotspots } from "../islandShoreLayout";
import { moneyStructureForIsland, type MoneyStructurePart } from "../moneyStructures";
import { playCapitalSfx } from "../audio/capitalSfx";
import { WorldArriveOverlay } from "./WorldArriveOverlay";
import { SoftBeatOverlay, type SoftBeatKind } from "./SoftBeatOverlay";
import { resolveShoreGuideLookAt } from "../coinBagGuideTargets";
import { IslandPlayView } from "./IslandPlayView";
import { nextMainCourseStep, mainCourseProgress, SIDE_TOMFOOLERY } from "../mainCourse";
import { getIslandCulture } from "../islandCulture";
import { getIslandBiome } from "../world3d/islandBiomes";
import type { AccessibilitySettings } from "../settings";
import { getGenreWorld, getGenreDistrict, genreShoreBlurb } from "../genreWorlds";

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
  onOpenBoard,
  onOpenTravel,
  onOpenHub,
  onEnterArea,
  onStartQuest,
  talkOpen = false,
}: IslandShoreViewProps) {
  const theme = getIslandTheme(island.id, island.themeId);
  const era = getAnimationStyle(theme.animationStyle);
  const hotspots = useMemo(() => buildShoreHotspots(island), [island]);
  const structure = useMemo(() => moneyStructureForIsland(island.id), [island.id]);
  const [near, setNear] = useState<{ id: string; label: string } | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [structureOpen, setStructureOpen] = useState(false);
  const [enteringJar, setEnteringJar] = useState(false);
  const [softBeat, setSoftBeat] = useState<SoftBeatKind | null>(null);
  const [guideProjection, setGuideProjection] = useState<GuideProjection | null>(null);
  const guideLookAt = useMemo(
    () => resolveShoreGuideLookAt(island, save, hotspots),
    [island, save, hotspots],
  );
  const guideArrows = a11y?.guideArrows !== false;
  const nextStep = useMemo(() => nextMainCourseStep(save), [save]);
  const courseProg = useMemo(() => mainCourseProgress(save), [save]);
  const culture = useMemo(() => getIslandCulture(island), [island]);
  const biome = useMemo(() => getIslandBiome(island.id), [island.id]);
  const genre = useMemo(() => getGenreWorld(island.id), [island.id]);
  const district = useMemo(() => getGenreDistrict(island.id), [island.id]);
  const genreBlurb = useMemo(() => genreShoreBlurb(island.id), [island.id]);

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

  const structuralBuddy = coinBagIslandTip(save, island);
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
    playCapitalSfx("plinth_hum");
  }, []);

  const onEnterPart = useCallback(
    (part: MoneyStructurePart) => {
      if (part.softBeat === "lookout" || part.softBeat === "umbrella" || part.softBeat === "battlement") {
        setSoftBeat(part.softBeat);
        return;
      }
      if (part.minigameId) {
        playCapitalSfx("scar_chime");
        onPlayMinigame(part.minigameId);
      }
    },
    [onPlayMinigame],
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
              hushActive={Boolean(save.chapterQuietPending)}
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
              inputFrozen={talkOpen || enteringJar || structureOpen}
              chapterQuiet={Boolean(save.chapterQuietPending)}
            />
            <GuideEdgeCue
              projection={guideProjection}
              enabled={guideArrows}
              label={buddy.tip}
            />
          </div>
        }
        topLeft={
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl">{island.icon}</span>
              <h1 className="text-xl font-black text-white drop-shadow sm:text-2xl">{island.name}</h1>
              <span className="era-badge text-[10px]">{era.eraLabel}</span>
            </div>
            <p className="max-w-md text-xs text-white/85 drop-shadow">
              {genre ? (
                <>
                  <span className="font-bold text-amber-200">{genre.canonName}</span>
                  {" · "}
                  {district?.districtName ?? genre.cityLabel}
                  {" — "}
                  {culture.cultureName}
                </>
              ) : (
                <>
                  {biome.label} — {culture.cultureName}
                </>
              )}
              {" · "}
              {district?.feel ?? culture.vibe}
            </p>
            {genreBlurb ? (
              <p className="max-w-md text-[10px] text-white/70 drop-shadow">{genreBlurb}</p>
            ) : null}
            {genre ? (
              <p className="max-w-md text-[10px] text-white/55 drop-shadow">
                Cast: {genre.signatureCast.slice(0, 2).join(" · ")} · Machines:{" "}
                {genre.signatureMachines.slice(0, 2).join(" · ")}
              </p>
            ) : null}
            {nextStep ? (
              <div className="mt-1 max-w-md rounded-xl border border-amber-300/40 bg-black/45 px-2 py-1 text-[11px] text-amber-100">
                <span className="font-bold uppercase tracking-wide text-amber-200">Main course</span>
                {" · "}
                {nextStep.title} ({courseProg.done}/{courseProg.total})
              </div>
            ) : (
              <div className="mt-1 text-[11px] font-bold text-emerald-200">Main course clear — explore freely</div>
            )}
            {save.chapterQuietPending ? (
              <HudBadge className="mt-1 bg-slate-900/80 text-white">
                {island.id === "paycheck_peninsula"
                  ? "Quiet after the rainy-day Take · fly home changed"
                  : island.id === "credit_kingdom"
                    ? "Quiet after the interest Take · fly home changed"
                    : "Quiet after the Take · fly home changed"}
              </HudBadge>
            ) : null}
          </div>
        }
        topRight={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <WealthHud totalCoins={userProfile.totalCoins} compact />
            {character ? (
              <CharacterAvatar
                character={character}
                size={40}
                animationStyle={theme.animationStyle}
                morphFromHome
              />
            ) : null}
            <GameButton variant="outline" size="sm" onClick={onOpenTravel}>
              🪄 Float
            </GameButton>
            <GameButton variant="primary" size="sm" onClick={onOpenHub}>
              🏠 Hub
            </GameButton>
          </div>
        }
        bottom={
          <div className="flex w-full flex-col items-center gap-2 pb-2">
            {near ? (
              <GameButton
                variant="primary"
                size="lg"
                autoFocus
                data-testid="shore-interact"
                onClick={() => activate(near.id)}
                className="shadow-lg"
              >
                {hotspots.find((h) => h.id === near.id)?.kind === "npc"
                  ? `Talk · ${near.label}`
                  : hotspots.find((h) => h.id === near.id)?.kind === "money_structure"
                    ? `Enter · ${near.label}`
                    : `Go · ${near.label}`}
              </GameButton>
            ) : (
              <p className="cap-hint-whisper">WASD walk · E interact when near</p>
            )}
          </div>
        }
      >
        <div data-hud-pass className="flex h-full min-h-0 flex-col items-center justify-start gap-2 pt-1">
          <CoinBagBuddyHud
          tip={buddy.tip}
          detail={buddy.coach}
          track={buddy.track}
          guideArrows={guideArrows}
          onToggleGuide={onA11yChange ? toggleGuide : undefined}
        />
        </div>
      </GameHudLayout>
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
