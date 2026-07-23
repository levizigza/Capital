import { Suspense, lazy, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  GameHudLayout,
  GameButton,
  GamePanel,
  GameTabs,
  GameListRow,
  HudBadge,
  useGameUi,
} from "@/game-ui";
import { useInputAction, InputPromptHint } from "@/input";

import { getQuestFailedAttempts } from "../settings";
import {
  resolveProfileText,
  shouldShowQuestHint,
  shouldShowStrongHint,
  formatScoreThreshold,
  getProfileDef,
  type LearningProfileId,
} from "../learningProfile";
import { isKinestheticComponent, partyPlayKind } from "../partyPlayStyle";
import type {
  AreaId,
  IslandDefinition,
  IslandSaveV1,
  ItemId,
  NpcId,
  QuestId,
  QuestObjective,
} from "../types";

const LazyEconomyWeather = lazy(() => import("../EconomyWeatherIndicator"));
const LazySkillStatsPanel = lazy(() => import("../SkillStatsPanel"));

import { createDefaultEconomyState } from "../economy";
import { createDefaultSkillStats } from "../skillStats";
import { AreaScene, isCoincraftIsland, NpcPortrait } from "@/art/coincraft";
import { getIslandTheme } from "../themes/islandThemes";
import { getAnimationStyle, isHomeLook, type AnimationStyleId } from "../animationStyles";
import { CharacterAvatar } from "./CharacterAvatar";
import { WealthHud } from "./WealthHud";
import type { CapitalCharacter } from "../character";
import { coinBagIslandTip } from "../story/coinBagBuddy";
import { CoinBagBuddyHud } from "./CoinBagBuddyHud";

type IslandSection = "explore" | "quests" | "bag";

export type IslandPlayViewProps = {
  island: IslandDefinition;
  save: IslandSaveV1;
  totalCoins?: number;
  activeAreaId?: AreaId;
  learningProfile: LearningProfileId;
  objectiveKey: (obj: QuestObjective) => string;
  character?: CapitalCharacter;
  animationStyle?: AnimationStyleId | string;
  onEnterArea: (areaId: AreaId) => void;
  onTalkNpc: (npcId: NpcId) => void;
  onCollectItem: (itemId: ItemId) => void;
  onStartQuest: (questId: QuestId) => void;
  onOpenTravel: () => void;
  onOpenHub: () => void;
  onOpenStudio?: () => void;
  onPlayMinigame?: (minigameId: string) => void;
  /** Optional Fortune Party board for this island */
  onOpenBoard?: () => void;
  devCheats?: ReactNode;
};

function QuestLogPanel({
  island,
  save,
  learningProfile,
  objectiveKey,
  onStartQuest,
}: Pick<IslandPlayViewProps, "island" | "save" | "learningProfile" | "objectiveKey" | "onStartQuest">) {
  return (
    <GamePanel title="Quest Log" className="h-full">
      <div className="space-y-3">
        {island.quests.map((q) => {
          const status = save.questStatus[q.id];
          const started = !!status?.started;
          const completed = !!status?.completed;
          const required = q.objectives.map(objectiveKey);
          const have = status?.completedObjectives || [];
          const doneCount = required.filter((k) => have.includes(k)).length;
          const progress = required.length === 0 ? 0 : Math.round((doneCount / required.length) * 100);

          const resolveLabel = (obj: QuestObjective): string => {
            if (obj.type === "talkToNpc") {
              const npc = island.npcs.find((n) => n.id === obj.npcId);
              return `Talk to ${npc?.name || obj.npcId}`;
            }
            if (obj.type === "collectItem") {
              const item = island.items.find((i) => i.id === obj.itemId);
              return `Collect ${item?.name || obj.itemId}`;
            }
            if (obj.type === "completeMinigame") {
              const mg = island.minigames?.find((m) => m.id === obj.minigameId);
              const base = `Complete ${mg?.name || obj.minigameId}`;
              if (obj.scoreThreshold !== undefined) {
                return `${base} (score ≥ ${formatScoreThreshold(obj.scoreThreshold, learningProfile)})`;
              }
              return base;
            }
            return "Unknown objective";
          };

          const nextObjective =
            started && !completed
              ? q.objectives.find((obj) => !have.includes(objectiveKey(obj)))
              : undefined;

          const statusBadge = completed ? (
            <HudBadge className="bg-green-100 text-green-800">Done</HudBadge>
          ) : started ? (
            <HudBadge>In progress</HudBadge>
          ) : (
            <HudBadge className="bg-gray-50">Not started</HudBadge>
          );

          return (
            <div key={q.id} className="rounded-lg border border-gray-200 bg-white/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold">{resolveProfileText(q.title, learningProfile)}</div>
                  <div className="text-sm text-gray-600">{resolveProfileText(q.description, learningProfile)}</div>
                </div>
                {statusBadge}
              </div>
              <div className="mt-2 space-y-1">
                {q.objectives.map((obj, idx) => {
                  const k = objectiveKey(obj);
                  const done = have.includes(k);
                  return (
                    <div key={idx} className="text-sm">
                      {done ? "✅" : "⬜"} {resolveLabel(obj)}
                    </div>
                  );
                })}
              </div>
              {started && !completed && nextObjective ? (
                <div className="mt-2 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
                  ➡️ Next: {resolveLabel(nextObjective)}
                </div>
              ) : null}
              {(() => {
                if (!started || completed || !q.hint) return null;
                const fails = getQuestFailedAttempts(q.id);
                if (!shouldShowQuestHint(fails, learningProfile, started)) return null;
                const hintText = resolveProfileText(q.hint, learningProfile);
                return (
                  <div className="mt-1 space-y-1 rounded bg-amber-50 px-2 py-1 text-xs italic text-amber-800">
                    <div>💡 {hintText}</div>
                    {shouldShowStrongHint(fails, learningProfile) && nextObjective ? (
                      <div className="font-semibold">
                        🔑 Try: {resolveLabel(nextObjective)}
                      </div>
                    ) : null}
                  </div>
                );
              })()}
              <div className="mt-2 text-xs text-gray-500">Progress: {progress}%</div>
              {!started && !completed ? (
                <GameButton size="sm" variant="primary" className="mt-2" onClick={() => onStartQuest(q.id)}>
                  Start
                </GameButton>
              ) : null}
            </div>
          );
        })}
      </div>
    </GamePanel>
  );
}

export function IslandPlayView({
  island,
  save,
  totalCoins,
  activeAreaId,
  learningProfile,
  objectiveKey,
  character,
  animationStyle,
  onEnterArea,
  onTalkNpc,
  onCollectItem,
  onStartQuest,
  onOpenTravel,
  onOpenHub,
  onOpenStudio,
  onPlayMinigame,
  onOpenBoard,
  devCheats,
}: IslandPlayViewProps) {
  const { uiScale } = useGameUi();
  const compact = uiScale === "compact";
  const era = getAnimationStyle(animationStyle);
  const [section, setSection] = useState<IslandSection>("explore");
  const profileDef = getProfileDef(learningProfile);
  const buddy = coinBagIslandTip(save, island);

  useInputAction("map", onOpenTravel);
  useInputAction("menu", onOpenHub);
  useInputAction("inventory", () => setSection("bag"));
  useInputAction("quest_log", () => setSection("quests"));

  const activeArea = island.areas.find((a) => a.id === activeAreaId);
  const visibleNpcs = island.npcs.filter((n) => n.areaId === activeAreaId);
  const allItemsInArea = island.items.filter((i) => i.location?.areaId === activeAreaId);
  const useCoincraftArt = isCoincraftIsland(island.id);
  const theme = getIslandTheme(island.id, island.themeId);

  const explorePanel = (
    <GamePanel title="Explore">
      <div className="space-y-4">
        {useCoincraftArt && activeAreaId ? (
          <>
            <AreaScene areaId={activeAreaId} areaName={activeArea?.name} />
            <div className="cc-rope-divider" aria-hidden />
          </>
        ) : null}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {island.areas.map((area) => {
            const isCurrent = save.currentAreaId === area.id;
            const isConnected =
              (activeArea?.connections?.includes(area.id) ?? false) ||
              (area.connections?.includes(save.currentAreaId as AreaId) ?? false);
            const missingItems = (area.requiredItems || []).filter((id) => !save.inventory.includes(id));
            const isLocked = missingItems.length > 0;
            const canEnter = isCurrent || (isConnected && !isLocked);

            return (
              <GameListRow
                key={area.id}
                icon={isLocked && isConnected ? "🔒" : area.icon}
                title={area.name}
                trailing={isCurrent ? "Here" : isLocked ? "Locked" : undefined}
                active={isCurrent}
                locked={isLocked && isConnected}
                disabled={!canEnter}
                onClick={() => canEnter && onEnterArea(area.id)}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <GamePanel title="NPCs here" padding="default">
            <InputPromptHint action="interact" className="mb-2">
              Talk —
            </InputPromptHint>
            {visibleNpcs.length === 0 ? (
              <p className="text-sm text-gray-600">No one is here.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {visibleNpcs.map((npc) => (
                  <GameListRow
                    key={npc.id}
                    data-testid={`npc-${npc.id}`}
                    icon={
                      useCoincraftArt ? (
                        <NpcPortrait npcId={npc.id} fallbackIcon={npc.icon} />
                      ) : (
                        npc.icon
                      )
                    }
                    title={npc.name}
                    description={npc.tagline}
                    onClick={() => onTalkNpc(npc.id)}
                  />
                ))}
              </div>
            )}
          </GamePanel>

          <GamePanel title="Items here" padding="default">
            {allItemsInArea.length === 0 ? (
              <p className="text-sm text-gray-600">Nothing to pick up.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {allItemsInArea.map((item) => {
                  const already = save.inventory.includes(item.id);
                  return (
                    <GameListRow
                      key={item.id}
                      data-testid={`item-${item.id}`}
                      icon={item.icon}
                      title={already ? `Collected: ${item.name}` : `Pick up: ${item.name}`}
                      disabled={already}
                      onClick={() => !already && onCollectItem(item.id)}
                    />
                  );
                })}
              </div>
            )}
          </GamePanel>
        </div>
      </div>
    </GamePanel>
  );

  const inventoryPanel = (
    <GamePanel title="🎒 Inventory">
      {save.inventory.length === 0 ? (
        <p className="text-sm text-gray-600">No items yet. Explore areas to find things!</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {save.inventory.map((itemId) => {
            const item = island.items.find((i) => i.id === itemId);
            if (!item) return null;
            return (
              <GameListRow
                key={itemId}
                icon={item.icon}
                title={item.name}
                description={item.description}
              />
            );
          })}
        </div>
      )}
    </GamePanel>
  );

  const questPanel = (
    <QuestLogPanel
      island={island}
      save={save}
      learningProfile={learningProfile}
      objectiveKey={objectiveKey}
      onStartQuest={onStartQuest}
    />
  );

  return (
    <GameHudLayout
      className={cn("!min-h-0", !useCoincraftArt && theme.skinClass)}
      background={
        !useCoincraftArt ? (
          <div className="absolute inset-0" style={{ background: theme.background }} />
        ) : undefined
      }
      topLeft={
        <div className="min-w-0 max-w-full">
          <h1 className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
            <span className="text-3xl sm:text-4xl">{island.icon}</span>
            <span className="truncate">{island.name}</span>
          </h1>
          <p className="line-clamp-2 text-sm text-gray-700">{island.description}</p>
          {activeArea ? (
            <HudBadge className="mt-2">
              {activeArea.icon} {activeArea.name}
            </HudBadge>
          ) : null}
        </div>
      }
      topRight={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {typeof totalCoins === "number" ? <WealthHud totalCoins={totalCoins} compact /> : null}
          {character ? (
            <div className="flex flex-col items-center gap-0.5">
              <CharacterAvatar
                character={character}
                size={44}
                animationStyle={animationStyle}
                morphFromHome={!isHomeLook(animationStyle ?? "capital-default")}
              />
              <span className="era-badge text-[9px]">{era.eraLabel}</span>
            </div>
          ) : null}
          <span title={profileDef.description}>
            <HudBadge className="bg-indigo-50 text-indigo-900">
              {profileDef.icon} {profileDef.label}
            </HudBadge>
          </span>
          <Suspense fallback={null}>
            <LazyEconomyWeather economy={save.economyState ?? createDefaultEconomyState()} />
          </Suspense>
          <GameButton variant="outline" size="sm" onClick={onOpenTravel}>
            🪄 Float
          </GameButton>
          {onOpenBoard ? (
            <GameButton variant="outline" size="sm" onClick={onOpenBoard}>
              🎲 Party board
            </GameButton>
          ) : null}
          <GameButton variant="primary" size="sm" onClick={onOpenHub}>
            🏠 Hub
          </GameButton>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-[var(--game-content-max)] space-y-[var(--game-gap)] pb-4">
        <CoinBagBuddyHud tip={buddy.tip} coach={buddy.coach} />
        {island.id === "future_shores" && onOpenStudio ? (
          <GamePanel padding="default" className="border-dashed border-amber-400 bg-amber-50/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="cap-eyebrow text-amber-800">Kids of the future</div>
                <p className="text-sm font-medium text-amber-950">
                  This island is unfinished on purpose. Open VibeCode Studio to carve out games for your era.
                </p>
              </div>
              <GameButton variant="primary" onClick={onOpenStudio}>
                ✨ Open VibeCode Studio
              </GameButton>
            </div>
          </GamePanel>
        ) : null}

        {onPlayMinigame && (island.minigames?.length ?? 0) > 0 ? (
          <GamePanel title="Party play pads & challenges" padding="default">
            <p className="mb-3 text-sm text-gray-600">
              Movement games first (Mario Party style). Quizzes prove mastery after you clear a play
              pad — prefer the walkable shore pads when you can.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[...island.minigames!]
                .sort((a, b) => {
                  const ka = isKinestheticComponent(a.componentId) ? 0 : 1;
                  const kb = isKinestheticComponent(b.componentId) ? 0 : 1;
                  return ka - kb;
                })
                .map((mg) => {
                const cleared = save.completedMinigames?.includes(mg.id);
                const kind = partyPlayKind(mg.componentId);
                const kindLabel =
                  kind === "kinesthetic"
                    ? "🏃 Play pad"
                    : kind === "quiz"
                      ? "📝 After play"
                      : "🎯 Strategy";
                return (
                  <button
                    key={mg.id}
                    type="button"
                    data-testid={`island-minigame-${mg.id}`}
                    onClick={() => onPlayMinigame(mg.id)}
                    className="flex items-center gap-3 rounded-xl border-2 border-black/15 bg-white/80 p-3 text-left transition-transform hover:-translate-y-0.5 hover:border-black/40"
                  >
                    <span className="text-2xl shrink-0">{mg.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 font-bold">
                        {mg.name}
                        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                          {kindLabel}
                        </span>
                        {cleared ? <span className="text-xs text-emerald-600">✓ cleared</span> : null}
                      </span>
                      <span className="line-clamp-2 text-xs text-gray-600">{mg.description}</span>
                      {mg.homage ? (
                        <span className="mt-0.5 block text-[10px] italic text-gray-500">{mg.homage}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-lg">▶</span>
                  </button>
                );
              })}
            </div>
          </GamePanel>
        ) : null}

        <Suspense fallback={null}>
          <LazySkillStatsPanel
            stats={(save.skillStats ?? createDefaultSkillStats()).current}
            history={(save.skillStats ?? createDefaultSkillStats()).history}
            compact
          />
        </Suspense>

        {compact ? (
          <>
            <GameTabs
              tabs={[
                { id: "explore", label: "Explore", icon: "🗺️" },
                { id: "quests", label: "Quests", icon: "📜" },
                { id: "bag", label: "Bag", icon: "🎒" },
              ]}
              activeId={section}
              onChange={(id) => setSection(id as IslandSection)}
            />
            {section === "explore" ? explorePanel : null}
            {section === "quests" ? questPanel : null}
            {section === "bag" ? inventoryPanel : null}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-[var(--game-gap)] lg:grid-cols-3">
              <div className="lg:col-span-2">{explorePanel}</div>
              <div>{questPanel}</div>
            </div>
            {inventoryPanel}
          </>
        )}

        {devCheats}
      </div>
    </GameHudLayout>
  );
}
