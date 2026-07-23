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
import { getAnimationStyle } from "../animationStyles";
import { CharacterAvatar } from "./CharacterAvatar";
import { WealthHud } from "./WealthHud";
import { getPartyItem, type PartyItemId } from "../partyItems";
import { getRivalDef, simulateRivalRound } from "../partyRivals";
import {
  BOARD_LAYOUT,
  BOARD_SIZE,
  buildBoardForIsland,
  getPartyState,
  resolveMove,
  resolvePassStart,
  resolvePlayerSpace,
  rollDice,
  spaceAccent,
  usePartyItem,
  type BoardMoveResult,
  type BoardSpace,
  type PartyIslandState,
  type SpaceResolvePayload,
} from "../partyBoard";
import { ensureLedger, acceptDeal, type DealOffer } from "../voyagerLedger";
import { VoyagerLedgerHud } from "./VoyagerLedgerHud";
import { CoinBagBuddyHud } from "./CoinBagBuddyHud";
import { coinBagIslandTip } from "../story/coinBagBuddy";
import { resolveAdaptiveBuddyTip } from "../gameSystems";
import { getIslandCulture } from "../islandCulture";
import { getBoardEconomyMode, tracksHarborEscape, usesCashflowPassStart } from "../boardEconomy";
import { isHomeLook } from "../animationStyles";

export type IslandBoardViewProps = {
  island: IslandDefinition;
  save: IslandSaveV1;
  userProfile: UserProfile;
  character?: CapitalCharacter;
  onUpdatePartyState: (next: PartyIslandState) => void;
  onLaunchMinigame: (minigameId: string) => void;
  onSpaceReward: (payload: {
    coins: number;
    xp?: number;
    star?: boolean;
    message: string;
    itemTip?: string;
    ledger?: import("../voyagerLedger").VoyagerLedger;
  }) => void;
  onBoardBoat: () => void;
  onOpenArchipelago: () => void;
  onOpenHub: () => void;
  onOpenArcade: () => void;
  boardLocked?: boolean;
};

type TurnPhase = "idle" | "rolling" | "moving" | "resolving" | "rivals";

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
  onBoardBoat,
  onOpenArchipelago,
  onOpenHub,
  onOpenArcade,
  boardLocked = false,
}: IslandBoardViewProps) {
  useInputAction("cancel", onOpenHub);

  const { reduced } = useGameMotion();
  const theme = getIslandTheme(island.id, island.themeId);
  const era = getAnimationStyle(theme.animationStyle);
  const boardMode = getBoardEconomyMode(island);
  const board = useMemo(() => buildBoardForIsland(island), [island]);
  const party = getPartyState(save, island.id);
  const minigameCount = island.minigames?.length ?? 0;
  const [eraArrive, setEraArrive] = useState(!isHomeLook(theme.animationStyle));

  useEffect(() => {
    setEraArrive(!isHomeLook(theme.animationStyle));
  }, [island.id, theme.animationStyle]);

  useEffect(() => {
    if (!eraArrive || reduced) return;
    const t = window.setTimeout(() => setEraArrive(false), 2200);
    return () => window.clearTimeout(t);
  }, [eraArrive, island.id, reduced]);

  const [phase, setPhase] = useState<TurnPhase>("idle");
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [displayPosition, setDisplayPosition] = useState(party.position);
  const [moveResult, setMoveResult] = useState<BoardMoveResult | null>(null);
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [rivalLog, setRivalLog] = useState<string[]>([]);
  const [pendingDoubleRoll, setPendingDoubleRoll] = useState(false);
  const [dealOffer, setDealOffer] = useState<DealOffer | null>(null);
  const [dealPartyState, setDealPartyState] = useState<PartyIslandState | null>(null);

  useEffect(() => {
    setDisplayPosition(party.position);
  }, [party.position]);

  // Ensure rivals exist when entering an island board
  useEffect(() => {
    if (!save.partyBoard?.[island.id]?.rivals) {
      onUpdatePartyState(party);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once per island enter
  }, [island.id]);

  const tokenLayout = BOARD_LAYOUT[displayPosition] ?? BOARD_LAYOUT[0]!;

  const applyPayload = useCallback(
    (payload: SpaceResolvePayload, tip?: string) => {
      onSpaceReward({
        coins: payload.coins,
        xp: payload.xp,
        star: payload.star,
        message: payload.message,
        itemTip: tip,
        ledger: payload.ledger,
      });
      if (payload.message) setEventMessage(payload.message);
    },
    [onSpaceReward],
  );

  const runRivalTurns = useCallback(
    async (stateAfterPlayer: PartyIslandState) => {
      setPhase("rivals");
      const sim = simulateRivalRound(
        stateAfterPlayer.rivals ?? [],
        BOARD_SIZE,
        userProfile.totalCoins,
        !!stateAfterPlayer.buffs?.shielded,
        { cashflowMode: usesCashflowPassStart(boardMode) },
      );
      setRivalLog(sim.summaries.map((s) => s.message));

      let next: PartyIslandState = {
        ...stateAfterPlayer,
        rivals: sim.rivals,
        buffs: {
          ...stateAfterPlayer.buffs,
          shielded: sim.playerShieldConsumed ? false : stateAfterPlayer.buffs?.shielded,
        },
        turnsPlayed: stateAfterPlayer.turnsPlayed + 1,
        turnsRemaining:
          stateAfterPlayer.turnsRemaining != null
            ? Math.max(0, stateAfterPlayer.turnsRemaining - 1)
            : undefined,
      };

      onUpdatePartyState(next);

      if (sim.playerCoinDelta !== 0) {
        onSpaceReward({
          coins: sim.playerCoinDelta,
          message:
            sim.playerCoinDelta < 0
              ? `Rivals raided your pouch for ${Math.abs(sim.playerCoinDelta)} coins.`
              : "",
        });
      }

      await new Promise((r) => setTimeout(r, reduced ? 200 : 900));
      setPhase("idle");
      setMoveResult(null);
    },
    [boardMode, onSpaceReward, onUpdatePartyState, reduced, userProfile.totalCoins],
  );

  const resolveLanding = useCallback(
    async (result: BoardMoveResult, state: PartyIslandState) => {
      const { space } = result;
      let working = { ...state };

      if (result.passedStart) {
        applyPayload(resolvePassStart(boardMode, save.voyagerLedger));
      }

      if (space.type === "minigame" && space.minigameId) {
        onUpdatePartyState(working);
        onLaunchMinigame(space.minigameId);
        setPhase("idle");
        // Rival turns run after minigame closes via parent; kick a light rival pass now for feel
        await runRivalTurns(working);
        return;
      }

      const { next, payload } = resolvePlayerSpace(
        space,
        working,
        userProfile.totalCoins,
        save.voyagerLedger,
        { trackHarborEscape: tracksHarborEscape(boardMode) },
      );
      working = next;
      onUpdatePartyState(working);

      const tip =
        payload.itemGained && getPartyItem(payload.itemGained)
          ? getPartyItem(payload.itemGained)!.moneyTip
          : undefined;
      applyPayload(payload, tip);

      if (payload.pendingDeal) {
        setDealOffer(payload.pendingDeal);
        setDealPartyState(working);
        setPhase("idle");
        return;
      }

      await runRivalTurns(working);
    },
    [
      applyPayload,
      boardMode,
      onLaunchMinigame,
      onUpdatePartyState,
      runRivalTurns,
      save.voyagerLedger,
      userProfile.totalCoins,
    ],
  );

  const resolveDealOffer = useCallback(
    (accept: boolean) => {
      if (!dealOffer || !dealPartyState) return;
      const offer = dealOffer;
      const state = dealPartyState;
      setDealOffer(null);
      setDealPartyState(null);

      if (accept) {
        if (userProfile.totalCoins < offer.purchaseCost) {
          setEventMessage(
            `Need ${offer.purchaseCost} coins for ${offer.name} — earn more, then catch the next Deal.`,
          );
        } else {
          const result = acceptDeal(ensureLedger(save.voyagerLedger), offer);
          applyPayload({
            coins: result.coins,
            xp: 8,
            ledger: result.ledger,
            message: `Deal closed! ${offer.icon} ${offer.name} (+$${offer.monthlyAmount}/mo) for ${offer.purchaseCost} coins.`,
          });
        }
      } else {
        setEventMessage(`Passed on ${offer.name}. Patience is a cashflow skill too.`);
      }

      void runRivalTurns(state);
    },
    [
      applyPayload,
      dealOffer,
      dealPartyState,
      runRivalTurns,
      save.voyagerLedger,
      userProfile.totalCoins,
    ],
  );

  const animateMove = useCallback(
    async (result: BoardMoveResult, state: PartyIslandState) => {
      setPhase("moving");
      for (let step = 1; step <= result.steps; step++) {
        const pos = (result.from + step) % BOARD_SIZE;
        setDisplayPosition(pos);
        await new Promise((r) => setTimeout(r, reduced ? 70 : 180));
      }
      const moved: PartyIslandState = {
        ...state,
        position: result.to,
      };
      onUpdatePartyState(moved);
      setPhase("resolving");
      await resolveLanding(result, moved);
    },
    [onUpdatePartyState, reduced, resolveLanding],
  );

  const handleRoll = useCallback(async () => {
    if (phase !== "idle" || boardLocked || minigameCount === 0 || dealOffer) return;
    if (party.turnsRemaining === 0) {
      setEventMessage("Session complete! Compare Ledger Seals with your rivals, then float on.");
      return;
    }

    setPhase("rolling");
    setEventMessage(null);
    setRivalLog([]);

    let value: number;
    if (pendingDoubleRoll) {
      value = rollDice() + rollDice();
      setPendingDoubleRoll(false);
    } else {
      value = rollDice();
    }
    setLastRoll(value);

    await new Promise((r) => setTimeout(r, reduced ? 200 : 550));

    const result = resolveMove(board, party.position, value);
    setMoveResult(result);
    await animateMove(result, party);
  }, [
    animateMove,
    board,
    boardLocked,
    dealOffer,
    minigameCount,
    party,
    pendingDoubleRoll,
    phase,
    reduced,
  ]);

  const handleUseItem = useCallback(
    (itemId: PartyItemId) => {
      if (phase !== "idle" || boardLocked || dealOffer) return;
      const { next, payload, extraSteps } = usePartyItem(itemId, party, userProfile.totalCoins);
      onUpdatePartyState(next);
      applyPayload(payload, getPartyItem(itemId)?.moneyTip);

      if (itemId === "double_die" || extraSteps != null) {
        setPendingDoubleRoll(true);
        setEventMessage("Twin Tallies ready — your next roll uses two dice!");
      }
    },
    [applyPayload, boardLocked, dealOffer, onUpdatePartyState, party, phase, userProfile.totalCoins],
  );

  const busy = phase !== "idle" || boardLocked || Boolean(dealOffer);
  const boardSkin = era.boardSkinClass;
  const culture = getIslandCulture(island);
  const buddy = resolveAdaptiveBuddyTip({
    save,
    ecosystemMotion: culture.ecosystemMotion,
    structuralTip: coinBagIslandTip(save, island),
  });

  return (
    <GameHudLayout
      className="!min-h-0"
      background={
        <div
          className="absolute inset-0"
          style={{ background: theme.background, fontFamily: theme.fontFamily }}
        />
      }
      topLeft={
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
            <span className="text-3xl">{island.icon}</span>
            <span className="truncate">{island.name}</span>
          </h1>
          <p className="text-sm line-clamp-2 opacity-90">
            <span className="era-badge mr-2">{era.eraLabel}</span>
            {era.tagline}
          </p>
        </div>
      }
      topRight={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <VoyagerLedgerHud ledger={ensureLedger(save.voyagerLedger)} compact />
          <WealthHud totalCoins={userProfile.totalCoins} compact />
          <HudBadge className="bg-violet-100 text-violet-900">🏅 {party.stars}</HudBadge>
          {party.turnsRemaining != null ? (
            <HudBadge className="bg-amber-100 text-amber-950">Turns {party.turnsRemaining}</HudBadge>
          ) : null}
          <GameButton variant="outline" size="sm" onClick={onOpenArchipelago}>
            🗺️ Map
          </GameButton>
          <GameButton variant="primary" size="sm" onClick={onBoardBoat}>
            🪄 Carpet
          </GameButton>
          <GameButton variant="outline" size="sm" onClick={onOpenHub}>
            🏠 Hub
          </GameButton>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-[var(--game-content-max)] space-y-4 pb-4">
        <CoinBagBuddyHud tip={buddy.tip} coach={buddy.coach} track={buddy.track} />
        {minigameCount === 0 ? (
          <GamePanel title="Island under construction" padding="default">
            <p className="text-sm text-gray-700 mb-3">
              This shore is still being charted. Try the Arcade, or sail to an era island with minigames.
            </p>
            <div className="flex flex-wrap gap-2">
              <GameButton variant="primary" onClick={onOpenArcade}>
                🕹️ Arcade
              </GameButton>
              <GameButton variant="primary" onClick={onBoardBoat}>
                🪄 Board carpet
              </GameButton>
              <GameButton variant="outline" onClick={onOpenArchipelago}>
                🗺️ Archipelago map
              </GameButton>
            </div>
          </GamePanel>
        ) : (
          <>
            <div className={`party-board-shell ${boardSkin} island-board-enter`} data-testid="island-party-board" data-era={era.id}>
              <AnimatePresence>
                {eraArrive && !isHomeLook(theme.animationStyle) ? (
                  <motion.div
                    className="island-era-arrive"
                    initial={reduced ? false : { opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: reduced ? 0.15 : 0.55 }}
                    data-testid="island-era-arrive"
                  >
                    <div className="island-era-arrive__badge">{era.eraLabel}</div>
                    <div className="island-era-arrive__title">Morphing into {era.decade}</div>
                    <p className="island-era-arrive__tag">{era.tagline}</p>
                    <p className="island-era-arrive__form">{era.characterForm}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              {board.map((space) => (
                <SpaceTile
                  key={space.index}
                  space={space}
                  layout={BOARD_LAYOUT[space.index] ?? BOARD_LAYOUT[0]!}
                  isActive={displayPosition === space.index}
                  isTarget={moveResult?.to === space.index && phase === "resolving"}
                />
              ))}

              {(party.rivals ?? []).map((rival, i) => {
                const layout = BOARD_LAYOUT[rival.position] ?? BOARD_LAYOUT[0]!;
                const def = getRivalDef(rival.id);
                const offset = (i + 1) * 3;
                return (
                  <div
                    key={rival.id}
                    className="party-rival-token"
                    style={{
                      left: `calc(${layout.x}% + ${offset}px)`,
                      top: `calc(${layout.y}% + ${offset}px)`,
                      background: def.accent,
                    }}
                    title={def.name}
                  >
                    {def.icon}
                  </div>
                );
              })}

              <div className="party-token" style={{ left: `${tokenLayout.x}%`, top: `${tokenLayout.y}%` }}>
                {character ? (
                  <CharacterAvatar
                    character={character}
                    size={40}
                    animationStyle={theme.animationStyle}
                    reducedMotion={reduced}
                    morphFromHome={!isHomeLook(theme.animationStyle)}
                  />
                ) : (
                  <span className="text-3xl">🧑‍✈️</span>
                )}
              </div>

              <div className="party-board-center">
                <div className="cap-eyebrow text-[10px]">
                  {phase === "rivals" ? "Rival turns…" : `Your turn · ${party.turnsPlayed + 1}`}
                </div>
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
                  {phase === "rolling"
                    ? "Rolling…"
                    : phase === "moving"
                      ? "Moving…"
                      : phase === "rivals"
                        ? "Rivals…"
                        : pendingDoubleRoll
                          ? "Roll Twin Tallies"
                          : "Roll Dice"}
                </GameButton>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <GamePanel title="Standings" padding="default">
                <div className="party-standings">
                  <div className="party-standings__row" style={{ borderColor: "var(--cap-gold)" }}>
                    <span>🧑‍✈️ You</span>
                    <span>
                      🏅 {party.stars} · 🪙 pouch
                    </span>
                  </div>
                  {(party.rivals ?? []).map((r) => {
                    const def = getRivalDef(r.id);
                    return (
                      <div key={r.id} className="party-standings__row">
                        <span>
                          {def.icon} {def.name}
                        </span>
                        <span>
                          🏅 {r.seals} · 🪙 {r.coins}
                          {usesCashflowPassStart(boardMode) ? (
                            <span className="block text-[0.65rem] text-[var(--cap-ink-soft)]">
                              CF {(r.monthlyIncome ?? 0) - (r.monthlyExpenses ?? 0) >= 0 ? "+" : ""}
                              {(r.monthlyIncome ?? 0) - (r.monthlyExpenses ?? 0)}/mo
                            </span>
                          ) : null}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </GamePanel>

              <GamePanel title="Fortune Capsules" padding="default">
                {(party.items ?? []).length === 0 ? (
                  <p className="text-sm text-gray-600">Land on 📦 Capsule spaces to collect items.</p>
                ) : (
                  <div className="party-item-tray">
                    {(party.items ?? []).map((id, idx) => {
                      const item = getPartyItem(id);
                      if (!item) return null;
                      return (
                        <button
                          key={`${id}-${idx}`}
                          type="button"
                          className="party-item-chip"
                          disabled={busy}
                          title={item.description}
                          onClick={() => handleUseItem(id)}
                        >
                          {item.icon} {item.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                {(party.buffs?.shielded || party.buffs?.doubleCoinsNext || party.buffs?.bailoutReady) && (
                  <p className="mt-2 text-xs text-emerald-800">
                    Buffs:
                    {party.buffs.shielded ? " 🛡️ Shield " : ""}
                    {party.buffs.doubleCoinsNext ? " 🧲 Magnet " : ""}
                    {party.buffs.bailoutReady ? " 🛟 Bailout" : ""}
                  </p>
                )}
              </GamePanel>

              <GamePanel title="How Fortune Party works" padding="default">
                <ul className="text-sm space-y-1 text-gray-700 list-disc pl-4">
                  <li>Roll, move, and race rival captains for <strong>Ledger Seals</strong>.</li>
                  <li>Minigame spaces teach money skills in this era&apos;s art style.</li>
                  <li>Capsules let you raid, shield, fog, or compound — with money tips.</li>
                  <li>Collector spaces = surprise fees. Chance is part of the lesson.</li>
                  <li>Your look morphs to this decade; sail home to return to Harbor form.</li>
                </ul>
              </GamePanel>
            </div>

            <GamePanel title={`${era.decade} · Island minigames`} padding="default">
              <p className="text-xs text-gray-600 mb-2">{era.literacyFocus}</p>
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
          </>
        )}

        <AnimatePresence>
          {dealOffer ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <GamePanel
                title="Deal offer"
                padding="default"
                className="border-cyan-300 bg-cyan-50/90"
                data-testid="harbor-deal-offer"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{dealOffer.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-[var(--cap-ink)]">{dealOffer.name}</div>
                    <p className="text-sm text-[var(--cap-ink-soft)]">
                      Pay <b>{dealOffer.purchaseCost} coins</b> now to add{" "}
                      <b className="text-emerald-700">+${dealOffer.monthlyAmount}/mo</b> income to your
                      Voyager Ledger.
                    </p>
                    <p className="mt-1 text-xs text-[var(--cap-ink-soft)]">
                      Your pouch: 🪙 {userProfile.totalCoins}
                      {userProfile.totalCoins < dealOffer.purchaseCost
                        ? " — not enough yet (you can pass)."
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <GameButton variant="outline" className="flex-1" onClick={() => resolveDealOffer(false)}>
                    Pass
                  </GameButton>
                  <GameButton
                    variant="primary"
                    className="flex-1"
                    data-testid="harbor-deal-accept"
                    onClick={() => resolveDealOffer(true)}
                  >
                    Buy deal
                  </GameButton>
                </div>
              </GamePanel>
            </motion.div>
          ) : null}
        </AnimatePresence>

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

        <AnimatePresence>
          {rivalLog.length > 0 && phase === "rivals" ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GamePanel title="Rival captains" padding="default" className="border-rose-200 bg-rose-50/70">
                <ul className="text-sm space-y-1">
                  {rivalLog.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </GamePanel>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </GameHudLayout>
  );
}
