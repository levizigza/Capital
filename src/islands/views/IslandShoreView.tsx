import { useCallback, useMemo, useState } from "react";
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
import { coinBagIslandTip } from "../story/coinBagBuddy";
import { WalkableIslandExplore } from "../world3d/WalkableIslandExplore";
import { buildShoreHotspots } from "../islandShoreLayout";
import { IslandPlayView } from "./IslandPlayView";

export type IslandShoreViewProps = {
  island: IslandDefinition;
  save: IslandSaveV1;
  userProfile: UserProfile;
  learningProfile: LearningProfileId;
  character?: CapitalCharacter | null;
  objectiveKey: (obj: QuestObjective) => string;
  onTalkNpc: (npcId: NpcId) => void;
  onCollectItem: (itemId: ItemId) => void;
  onPlayMinigame: (minigameId: string) => void;
  onOpenBoard: () => void;
  onOpenTravel: () => void;
  onOpenHub: () => void;
  onEnterArea: (areaId: string) => void;
  onStartQuest: (questId: string) => void;
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
  onTalkNpc,
  onCollectItem,
  onPlayMinigame,
  onOpenBoard,
  onOpenTravel,
  onOpenHub,
  onEnterArea,
  onStartQuest,
}: IslandShoreViewProps) {
  const theme = getIslandTheme(island.id, island.themeId);
  const era = getAnimationStyle(theme.animationStyle);
  const hotspots = useMemo(() => buildShoreHotspots(island), [island]);
  const [near, setNear] = useState<{ id: string; label: string } | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const buddy = coinBagIslandTip(save, island);

  useInputAction("map", onOpenTravel);
  useInputAction("menu", onOpenHub);
  useInputAction("cancel", () => {
    if (journalOpen) setJournalOpen(false);
    else onOpenHub();
  });

  const onNearChange = useCallback((id: string | null, label: string | null) => {
    setNear(id && label ? { id, label } : null);
  }, []);

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
      if (h.kind === "item" && h.refId) {
        if (!save.inventory.includes(h.refId)) onCollectItem(h.refId as ItemId);
        return;
      }
    },
    [hotspots, onOpenTravel, onOpenBoard, onTalkNpc, onPlayMinigame, onCollectItem, save.inventory],
  );

  return (
    <div className="relative h-full min-h-[100dvh] w-full" data-testid="island-shore-view">
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
              Explore first — walk, talk, then play pads. Quizzes come after movement games.
            </p>
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
              <HudBadge className="bg-black/55 text-white">WASD walk · find play pads · E interact</HudBadge>
            )}
            <p className="text-[11px] font-semibold tracking-wide text-white/75">
              Party Plaza = optional board · Quest Journal = chapter notes · Pier = carpet
            </p>
          </div>
        }
      >
        <div data-hud-pass className="flex h-full min-h-0 flex-col items-center justify-start gap-2 pt-1">
          <CoinBagBuddyHud tip={buddy.tip} coach={buddy.coach} />
          <div className="pointer-events-none max-w-sm rounded-2xl bg-black/65 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg">
            Immersion first — no quiz until you clear a play pad.
          </div>
        </div>
      </GameHudLayout>

      <GameModal
        open={journalOpen}
        onClose={() => setJournalOpen(false)}
        maxWidth="xl"
        usePortal={false}
        zIndex={40}
        title={`${island.name} · Quest Journal`}
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
