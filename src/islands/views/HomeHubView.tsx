import { Suspense, lazy, useMemo, useState, useCallback } from "react";
import {
  GameHudLayout,
  GameButton,
  GameModal,
  HudBadge,
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
import { ensureLedger } from "../voyagerLedger";
import { OutfitterStudioOverlay } from "../world3d/OutfitterStudioOverlay";
import { CapsuleStudioOverlay } from "../world3d/CapsuleStudioOverlay";
import { WalkableHarborView, type HarborHotspot } from "../world3d";
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
import { guidedVisualBeats } from "../story/dialogueActionSync";
import { coinBagHarborTip, coinBagShouldPointPavilion } from "../story/coinBagBuddy";
import { CoinBagBuddyHud } from "./CoinBagBuddyHud";
import { resolveHarborGuideLookAt } from "../coinBagGuideTargets";

const LazySettingsPanel = lazy(() => import("../SettingsPanel"));

type HubModal = "outfitter" | "capsule" | "settings" | "pavilion" | null;

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
};

function guidedFromSave(save: IslandSaveV1): HubGuidedIntroState | null {
  if (!save.hubGuidedIntro) return null;
  if (isHubGuidedComplete(save.hubGuidedIntro)) return null;
  return save.hubGuidedIntro;
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
  onClearHomecoming,
  onExit,
}: HomeHubViewProps) {
  useInputAction("map", () => {
    onHubGuidedEvent("opened_map");
    onOpenTravel();
  });
  useInputAction("menu", () => setHubModal("settings"));
  useInputAction("cancel", () => {
    if (hubModal) setHubModal(null);
    else onExit();
  });

  const profile = getProfileDef(learningProfile);
  const boat = getEffectiveBoatTier(userProfile.totalCoins, save);
  const simplified = profile.hudMode === "simplified";
  const voyager = character ?? { ...BASE_VOYAGER, name: userProfile.name || "Voyager" };
  const freed = hasHarborFreedom(save);
  const guided = guidedFromSave(save);
  const guidedStep = guided ? getHubGuidedStep(guided) : null;
  const castleMode = !!guidedStep;

  const [outfitterStage, setOutfitterStage] = useState<"look" | "pet">("look");
  const [draft, setDraft] = useState<CapitalCharacter>(voyager);
  const [nearStore, setNearStore] = useState<{ id: string; label: string } | null>(null);
  const [nearNpc, setNearNpc] = useState<{ id: string; name: string; line: string } | null>(null);
  const plazaRoom = isRoomUnlocked(save, "market") ? "market" : "plaza";

  const visualBeats = guidedVisualBeats(guidedStep?.id);
  const nearKeeper = nearNpc?.id === HARBOR_KEEPER_MASCOT_ID;
  /** When near Piggy, wave becomes talk — conversation replaces the attractor. */
  const keeperEmote =
    nearKeeper && visualBeats.keeperEmote === "wave" ? "talk" : visualBeats.keeperEmote;
  const keeperSpeech = castleMode ? visualBeats.keeperBubbleWhenNear : null;
  const pulseHotspotId =
    visualBeats.pulseHotspot === "guide"
      ? null
      : visualBeats.pulseHotspot === "arcade"
        ? "arcade"
        : (visualBeats.pulseHotspot ?? null);

  const buddyTip = coinBagHarborTip(guided, {
    nearStoreLabel: nearStore?.label,
    nearNpcName: nearNpc && !nearStore ? nearNpc.name : null,
    hasFreedom: freed,
    currentIslandId: save.currentIslandId,
    homecomingPending: Boolean(save.harborHomecoming?.pending),
    homecomingMessage: save.harborHomecoming?.message,
    pavilionUnlocked: coinBagShouldPointPavilion(save),
  });
  const bagGuideTip = castleMode ? visualBeats.bagTip : buddyTip.tip;

  const showOutfitterHighlight =
    highlightOutfitter || guidedStep?.highlight === "outfitter";

  const pavilionOpen = isRoomUnlocked(save, "pavilion");

  const harborHotspots = useMemo<HarborHotspot[]>(
    () => [
      { id: "arcade", label: "Arcade", icon: "🕹️", position: [-6.5, 0, -5] },
      { id: "outfitter", label: "Outfitter", icon: "👗", position: [0, 0, -8] },
      { id: "capsule", label: "Capsule Stall", icon: "📦", position: [4.2, 0, -7.2] },
      { id: "studio", label: "VibeCode", icon: "✨", position: [6.5, 0, -5] },
      { id: "travel", label: "Carpet Dock", icon: "🪄", position: [0, 0, 13] },
      { id: "settings", label: "Settings", icon: "⚙️", position: [-8, 0, 3.5] },
      ...(pavilionOpen
        ? [
            {
              id: "pavilion",
              label: "Freedom Pavilion",
              icon: "🏆",
              position: [-4.5, 0, -9.5],
            } satisfies HarborHotspot,
          ]
        : []),
      ...(onOpenEditor
        ? [{ id: "editor", label: "Editor", icon: "🛠️", position: [8, 0, 3.5] } satisfies HarborHotspot]
        : []),
    ],
    [onOpenEditor, pavilionOpen],
  );

  const harborGuideLookAt = useMemo(
    () =>
      resolveHarborGuideLookAt({
        highlight: guidedStep?.highlight ?? (showOutfitterHighlight ? "outfitter" : null),
        hotspots: harborHotspots,
        homecomingPending: Boolean(save.harborHomecoming?.pending),
        nearStoreId: nearStore?.id ?? null,
        pointPavilion: coinBagShouldPointPavilion(save),
        defaultId: "travel",
      }),
    [
      guidedStep?.highlight,
      showOutfitterHighlight,
      harborHotspots,
      save.harborHomecoming?.pending,
      nearStore?.id,
      save,
    ],
  );

  const openOutfitter = () => {
    setDraft(voyager);
    setOutfitterStage("look");
    setHubModal("outfitter");
  };

  const onHarborHotspot = (id: string) => {
    if (id === "arcade") onOpenArcade();
    else if (id === "outfitter") {
      if (guidedStep?.id === "walk_outfitter" || guidedStep?.id === "become_you") {
        onHubGuidedEvent("near_outfitter");
      }
      openOutfitter();
    } else if (id === "studio") onOpenStudio();
    else if (id === "travel") {
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
    }
  };

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
        onHubGuidedEvent("talked_guide");
        setNearNpc({
          id: npc.id,
          name: npc.name,
          line: visualBeats.keeperBubbleWhenNear || guidedStep?.guideLine || npc.line,
        });
        return;
      }
      setNearNpc(npc);
    },
    [castleMode, guidedStep?.guideLine, onHubGuidedEvent, visualBeats.keeperBubbleWhenNear],
  );

  const nearTravel = nearStore?.id === "travel";
  const canResume =
    !!save.currentIslandId && !isHubIslandId(save.currentIslandId);

  const homecoming = save.harborHomecoming?.pending
    ? save.harborHomecoming
    : null;

  const coachText =
    homecoming?.message ||
    (nearNpc && !nearStore
      ? nearNpc.line
      : guidedStep?.coach ??
        (showOutfitterHighlight
          ? "Walk to the Outfitter (front center)"
          : freed
            ? pavilionOpen
              ? "Freedom Pavilion unlocked — walk left of the Outfitter"
              : "Freedom seal · carpet upgraded"
            : null));

  return (
    <>
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
                keeperEmote={castleMode ? keeperEmote : "idle"}
                keeperSpeech={keeperSpeech}
                pulseHotspotId={castleMode ? pulseHotspotId : showOutfitterHighlight ? "outfitter" : null}
              />
            )}
          </div>
        }
        topLeft={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openOutfitter}
              aria-label="Open Outfitter"
              className="rounded-full ring-2 ring-white/40"
            >
              <CharacterAvatar character={voyager} size={36} animationStyle="capital-default" />
            </button>
            <WealthHud totalCoins={userProfile.totalCoins} compact />
            {!simplified ? (
              <VoyagerLedgerHud ledger={ensureLedger(save.voyagerLedger)} compact />
            ) : null}
          </div>
        }
        topRight={
          <div className="flex items-center gap-1.5">
            <HudBadge>
              {profile.icon} {profile.label}
            </HudBadge>
            {onReplayIntro ? (
              <GameButton
                variant="ghost"
                size="sm"
                onClick={onReplayIntro}
                title="Replay opening animation"
                className="text-white/90"
              >
                ↻
              </GameButton>
            ) : null}
            <GameButton
              variant="outline"
              size="sm"
              onClick={onExit}
              className="bg-black/35 text-white"
              data-testid="hub-leave-islands"
              title="Leave Islands"
            >
              Leave
            </GameButton>
          </div>
        }
        bottom={
          <div className="flex w-full max-w-sm flex-col items-center gap-2 px-2">
            {/* Single primary action — never stack Enter + Board */}
            {nearStore ? (
              <GameButton
                variant="primary"
                size="lg"
                onClick={() => onHarborHotspot(nearStore.id)}
                className="w-full shadow-lg"
                data-testid="hub-enter-store"
              >
                {nearTravel ? `🪄 Board carpet` : `Enter ${nearStore.label}`}
              </GameButton>
            ) : guidedStep?.id === "practice_optional" ? (
              <div className="flex w-full flex-col gap-2">
                {onPlayHarborBoard ? (
                  <GameButton
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      onHubGuidedEvent("practice_opened");
                      onPlayHarborBoard();
                    }}
                    className="w-full shadow-lg"
                  >
                    Practice board
                  </GameButton>
                ) : null}
                <GameButton
                  variant="outline"
                  size="lg"
                  onClick={() => onHubGuidedEvent("skip_practice")}
                  className="w-full bg-white/90"
                >
                  Skip to Carpet Dock →
                </GameButton>
              </div>
            ) : guidedStep?.highlight === "travel" ? (
              <GameButton
                variant="primary"
                size="lg"
                onClick={() => {
                  onHubGuidedEvent("opened_map");
                  onOpenTravel();
                }}
                className="w-full shadow-lg"
                data-testid="hub-travel-map"
              >
                🪄 Archipelago map
              </GameButton>
            ) : (
              <GameButton
                variant="primary"
                size="lg"
                onClick={() => {
                  onHubGuidedEvent("opened_map");
                  onOpenTravel();
                }}
                className="w-full shadow-lg"
                data-testid="hub-travel-map"
              >
                🪄 Archipelago map
              </GameButton>
            )}
            <p className="text-[11px] font-semibold tracking-wide text-white/75">
              {castleMode
                ? `🐰 Coin Bag stays beside you · ${guidedStep?.verb}`
                : nearStore
                  ? "E enter · WASD walk"
                  : `WASD walk · M map · ${boat.emoji} ${boat.label}`}
            </p>
            {(canResume || onPlayHarborBoard) && !nearStore && !castleMode ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {canResume ? (
                  <GameButton variant="ghost" size="sm" onClick={onResume} className="text-white/85">
                    Resume {getIslandById(content, save.currentIslandId!)?.name ?? "voyage"}
                  </GameButton>
                ) : null}
                {onPlayHarborBoard ? (
                  <GameButton
                    variant="ghost"
                    size="sm"
                    onClick={onPlayHarborBoard}
                    className="text-white/70"
                  >
                    Practice board
                  </GameButton>
                ) : null}
              </div>
            ) : null}
          </div>
        }
      >
        {/* Pass-through stage — harbor canvas must receive clicks */}
        <div
          data-hud-pass
          className="flex h-full min-h-0 flex-col items-center justify-start gap-2 pt-1"
        >
          {castleMode ? (
            <div
              className="pointer-events-none max-w-md rounded-2xl bg-[#0c4a6e]/90 px-4 py-2 text-center shadow-lg"
              data-testid="castle-grounds-coach"
              data-guided-step={guidedStep?.id}
            >
              <div className="text-[10px] font-bold uppercase tracking-wide text-sky-200/90">
                Harbor Haven · {guidedStep?.verb}
              </div>
              <div className="text-sm font-semibold text-white">{guidedStep?.coach}</div>
            </div>
          ) : null}
          <CoinBagBuddyHud tip={buddyTip.tip} coach={buddyTip.coach} />
          {coachText && (!castleMode || nearNpc) ? (
            <div className="pointer-events-none max-w-sm rounded-2xl bg-black/70 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg">
              {nearNpc && !nearStore ? (
                <div className="text-[10px] uppercase tracking-wide text-white/70">{nearNpc.name}</div>
              ) : null}
              {nearNpc && !nearStore ? nearNpc.line : coachText}
            </div>
          ) : null}
          <div className="sr-only" data-testid="harbor-plaza" data-plaza-room={plazaRoom} />
        </div>
      </GameHudLayout>

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
          onAdoptPet={() => {
            onSaveCharacter(draft);
            setHubModal(null);
          }}
          onHarborPurchase={(price, companionId) => {
            const ok = onHarborPurchase({
              kind: "companion",
              companionId,
              price,
            });
            if (!ok) {
              toast.error(`Need 🪙 ${price} for that pet`);
              return false;
            }
            toast.success(`Adopted! −🪙 ${price}`);
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
        open={Boolean(homecoming)}
        onClose={() => onClearHomecoming?.()}
        maxWidth="md"
        usePortal
        showCloseButton
        title="Welcome home"
      >
        <div className="space-y-4 text-center">
          <div className="text-5xl">🐷</div>
          <h2 className="text-xl font-black">Piggy Penny noticed</h2>
          <p className="text-sm text-muted-foreground">
            {homecoming?.message ||
              "You earned, you chose, and you came back different. That’s the Change beat."}
          </p>
          {pavilionOpen ? (
            <p className="text-sm font-semibold text-emerald-800">
              Freedom Pavilion is open on the plaza — Coin Bag will point the way.
            </p>
          ) : (
            <p className="text-sm font-semibold text-sky-900">
              Keep practicing Harbor cashflow for a Freedom Seal — or float to your next painting.
            </p>
          )}
          <GameButton
            variant="primary"
            className="w-full"
            onClick={() => onClearHomecoming?.()}
            autoFocus
          >
            Thanks, Piggy →
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
