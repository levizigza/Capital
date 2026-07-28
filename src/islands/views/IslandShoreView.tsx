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
import { toast } from "sonner";
import { playCapitalSfx } from "../audio/capitalSfx";
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
  /** True while Talk Battle is open — freeze world + don't re-trigger auto-talk */
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

  // Auto-start Talk Battle when you walk up to an NPC pad
  useEffect(() => {
    if (!near || talkOpen || structureOpen || enteringJar) return;
    const h = hotspots.find((x) => x.id === near.id);
    if (h?.kind === "npc" && h.refId) {
      const t = window.setTimeout(() => onTalkNpc(h.refId as NpcId), 350);
      return () => window.clearTimeout(t);
    }
  }, [near, hotspots, onTalkNpc, talkOpen, structureOpen, enteringJar]);

  const enterStructure = useCallback(() => {
    if (!structure || enteringJar) return;
    setEnteringJar(true);
    playCapitalSfx("scar_chime");
    window.setTimeout(() => {
      setEnteringJar(false);
      setStructureOpen(true);
      playCapitalSfx("plinth_hum");
    }, 900);
  }, [structure, enteringJar]);

  const onEnterPart = useCallback(
    (part: MoneyStructurePart) => {
      if (part.softBeat === "lookout") {
        playCapitalSfx("harbor_cheer");
        toast.message("Lid Lookout", {
          description: "Cove looks tiny from up here — save a little, the jar still holds.",
        });
        return;
      }
      if (part.softBeat === "umbrella") {
        playCapitalSfx("harbor_cheer");
        toast.message("Umbrella Loft", {
          description: "Rainy-day loft — Main Street looks small. Keep a little dry for later.",
        });
        return;
      }
      if (part.softBeat === "battlement") {
        playCapitalSfx("harbor_cheer");
        toast.message("Score Battlement", {
          description: "On-time history beats haste — interest feeds on rushing.",
        });
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

  if (structureOpen && structure) {
    return (
      <MoneyStructureInteriorView
        structure={structure}
        character={character}
        onExit={() => setStructureOpen(false)}
        onEnterPart={onEnterPart}
      />
    );
  }

  return (
    <div className="relative h-full min-h-[100dvh] w-full" data-testid="island-shore-view">
      {enteringJar ? (
        <div
          className="absolute inset-0 z-[50] flex flex-col items-center justify-center bg-[#0f172a]/92 text-center text-white"
          data-testid="money-structure-enter-transition"
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200/90">
            Money is a machine
          </p>
          <h2 className="mt-3 text-2xl font-black">
            {structure.enterTransition}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-white/70">
            Inside the Jar, every piece opens a world.
          </p>
        </div>
      ) : null}
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
              inputFrozen={talkOpen || enteringJar}
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
                Enter · {near.label}
              </GameButton>
            ) : (
              <p className="cap-hint-whisper">WASD walk · E interact</p>
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
