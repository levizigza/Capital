import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  GameHudLayout,
  GameButton,
  GamePanel,
  HudBadge,
  useGameMotion,
} from "@/game-ui";
import { useInputAction } from "@/input";

import type { UserProfile } from "@/App";
import type { IslandDefinition, IslandSaveV1 } from "../types";
import type { CapitalCharacter } from "../character";
import { getIslandTheme } from "../themes/islandThemes";
import { CharacterAvatar } from "./CharacterAvatar";
import { WealthHud } from "./WealthHud";
import {
  BOARD_LAYOUT,
  BOARD_SIZE,
  buildBoardForIsland,
  getPartyState,
  resolveMove,
  rollDice,
  spaceAccent,
  type BoardMoveResult,
  type BoardSpace,
  type PartyIslandState,
} from "../partyBoard";

export type IslandBoardViewProps = {
  island: IslandDefinition;
  save: IslandSaveV1;
  userProfile: UserProfile;
  character?: CapitalCharacter;
  onUpdatePartyState: (next: PartyIslandState) => void;
  onLaunchMinigame: (minigameId: string) => void;
  onSpaceReward: (payload: { coins: number; xp?: number; star?: boolean; message: string }) => void;
  onOpenTravel: () => void;
  onOpenHub: () => void;
  onOpenArcade: () => void;
  boardLocked?: boolean;
};

type TurnPhase = "idle" | "rolling" | "moving" | "resolving";

function SpaceTile({
  space,
  layout,
  isActive,
  isTarget,
}: {
  space: BoardSpace;
  layout: { x: number; y: number };
  isActive: boolean;
  isTarget: boolean;
}) {
  return (
    <div
      className={`party-space ${isActive ? "party-space--active" : ""} ${isTarget ? "party-space--target" : ""}`}
      style={{
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        background: spaceAccent(space.type),
      }}
      title={space.label}
      data-testid={`party-space-${space.index}`}
    >
      <span className="party-space__icon">{space.icon}</span>
      <span className="party-space__label">{space.label}</span>
    </div>
  );
}

export function IslandBoardView({
  island,
  save,
  userProfile,
  character,
  onUpdatePartyState,
  onLaunchMinigame,
  onSpaceReward,
  onOpenTravel,
  onOpenHub,
  onOpenArcade,
  boardLocked = false,
}: IslandBoardViewProps) {
  useInputAction("cancel", onOpenHub);

  const { reduced } = useGameMotion();
  const theme = getIslandTheme(island.id, island.themeId);
  const board = useMemo(() => buildBoardForIsland(island), [island]);
  const party = getPartyState(save, island.id);
  const minigameCount = island.minigames?.length ?? 0;

  const [phase, setPhase] = useState<TurnPhase>("idle");
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [displayPosition, setDisplayPosition] = useState(party.position);
  const [moveResult, setMoveResult] = useState<BoardMoveResult | null>(null);
  const [eventMessage, setEventMessage] = useState<string | null>(null);

  useEffect(() => {
    setDisplayPosition(party.position);
  }, [party.position]);

  const tokenLayout = BOARD_LAYOUT[displayPosition] ?? BOARD_LAYOUT[0]!;

  const resolveLanding = useCallback(
    (result: BoardMoveResult) => {
      const { space } = result;

      if (space.type === "minigame" && space.minigameId) {
        onLaunchMinigame(space.minigameId);
        setPhase("idle");
        return;
      }

      if (space.type === "coins" || space.type === "lucky") {
        const coins = space.coinReward ?? 10;
        onSpaceReward({
          coins,
          xp: 5,
          message: `You collected ${coins} coins!`,
        });
      } else if (space.type === "star") {
        onSpaceReward({
          coins: 0,
          star: true,
          message: "You earned a star on this island!",
        });
      } else if (space.type === "event" || space.type === "start") {
        setEventMessage(space.eventText ?? "Keep rolling to find minigames!");
      }

      setPhase("idle");
      setMoveResult(null);
    },
    [onLaunchMinigame, onSpaceReward],
  );

  const animateMove = useCallback(
    async (result: BoardMoveResult) => {
      setPhase("moving");
      let pos = result.from;
      for (let step = 1; step <= result.steps; step++) {
        pos = (result.from + step) % BOARD_SIZE;
        setDisplayPosition(pos);
        await new Promise((r) => setTimeout(r, reduced ? 80 : 220));
      }
      onUpdatePartyState({
        ...party,
        position: result.to,
        turnsPlayed: party.turnsPlayed + 1,
      });
      setPhase("resolving");
      resolveLanding(result);
    },
    [onUpdatePartyState, party, reduced, resolveLanding],
  );

  const handleRoll = useCallback(async () => {
    if (phase !== "idle" || boardLocked || minigameCount === 0) return;

    setPhase("rolling");
    setEventMessage(null);
    const value = rollDice();
    setLastRoll(value);

    await new Promise((r) => setTimeout(r, reduced ? 200 : 550));

    const result = resolveMove(board, party.position, value);
    setMoveResult(result);
    await animateMove(result);
  }, [animateMove, board, boardLocked, minigameCount, party.position, phase, reduced]);

  const busy = phase !== "idle" || boardLocked;

  return (
    <GameHudLayout
      className="!min-h-0"
      style={{ background: theme.background }}
      topLeft={
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
            <span className="text-3xl">{island.icon}</span>
            <span className="truncate">{island.name}</span>
          </h1>
          <p className="text-sm text-gray-700 line-clamp-2">Island party board — roll, move, play minigames!</p>
        </div>
      }
      topRight={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <WealthHud totalCoins={userProfile.totalCoins} compact />
          <HudBadge className="bg-violet-100 text-violet-900">⭐ {party.stars}</HudBadge>
          <GameButton variant="outline" size="sm" onClick={onOpenTravel}>
            🗺️ Map
          </GameButton>
          <GameButton variant="primary" size="sm" onClick={onOpenHub}>
            🏠 Hub
          </GameButton>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-[var(--game-content-max)] space-y-4 pb-4">
        {minigameCount === 0 ? (
          <GamePanel title="No minigames yet" padding="default">
            <p className="text-sm text-gray-700 mb-3">
              This island is still being built. Try the Arcade for instant minigames, or sail to another island.
            </p>
            <div className="flex flex-wrap gap-2">
              <GameButton variant="primary" onClick={onOpenArcade}>
                🕹️ Arcade
              </GameButton>
              <GameButton variant="outline" onClick={onOpenTravel}>
                🗺️ World Map
              </GameButton>
            </div>
          </GamePanel>
        ) : (
          <>
            <div className="party-board-shell" data-testid="island-party-board">
              {board.map((space) => (
                <SpaceTile
                  key={space.index}
                  space={space}
                  layout={BOARD_LAYOUT[space.index] ?? BOARD_LAYOUT[0]!}
                  isActive={displayPosition === space.index}
                  isTarget={moveResult?.to === space.index && phase === "resolving"}
                />
              ))}

              <div className="party-token" style={{ left: `${tokenLayout.x}%`, top: `${tokenLayout.y}%` }}>
                {character ? (
                  <CharacterAvatar character={character} size={40} animationStyle={theme.animationStyle} />
                ) : (
                  <span className="text-3xl">🧑‍🚀</span>
                )}
              </div>

              <div className="party-board-center">
                <div className="cap-eyebrow text-[10px]">Turn {party.turnsPlayed + 1}</div>
                <div
                  className={`party-dice mx-auto my-2 ${phase === "rolling" ? "party-dice--rolling" : ""}`}
                  aria-label={lastRoll ? `Dice showing ${lastRoll}` : "Dice"}
                >
                  {phase === "rolling" ? "🎲" : lastRoll ?? "?"}
                </div>
                <GameButton
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={busy}
                  data-testid="party-roll-dice"
                  onClick={() => void handleRoll()}
                >
                  {phase === "rolling" ? "Rolling…" : phase === "moving" ? "Moving…" : "Roll Dice"}
                </GameButton>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <GamePanel title="How to play" padding="default">
                <ul className="text-sm space-y-1 text-gray-700 list-disc pl-4">
                  <li>Roll the dice to move around the island board.</li>
                  <li>Landing on <strong>minigame spaces</strong> launches a challenge.</li>
                  <li>Coin, star, and event spaces grant bonuses between games.</li>
                  <li>Sail to other islands from the world map for new boards.</li>
                </ul>
              </GamePanel>

              <GamePanel title="Island minigames" padding="default">
                <div className="flex flex-wrap gap-2">
                  {island.minigames!.map((mg) => {
                    const cleared = save.completedMinigames?.includes(mg.id);
                    return (
                      <HudBadge key={mg.id} className={cleared ? "bg-emerald-100 text-emerald-900" : undefined}>
                        {mg.icon} {mg.name}
                        {cleared ? " ✓" : ""}
                      </HudBadge>
                    );
                  })}
                </div>
                <GameButton variant="outline" size="sm" className="mt-3" onClick={onOpenArcade}>
                  🕹️ Free Play in Arcade
                </GameButton>
              </GamePanel>
            </div>
          </>
        )}

        <AnimatePresence>
          {eventMessage ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <GamePanel title="Space event" padding="default" className="border-blue-300 bg-blue-50/80">
                <p className="text-sm text-blue-950">{eventMessage}</p>
                <GameButton variant="primary" size="sm" className="mt-2" onClick={() => setEventMessage(null)}>
                  Got it!
                </GameButton>
              </GamePanel>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </GameHudLayout>
  );
}
