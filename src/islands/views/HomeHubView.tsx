import { Suspense, lazy, useMemo, useState, useCallback } from "react";
import {
  GameHudLayout,
  GameButton,
  GameModal,
  HudBadge,
  GamePanel,
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
  CHARACTER_COMPANIONS,
  companionEmoji,
} from "../character";
import { CharacterCreator } from "./CharacterCreator";
import { CharacterAvatar } from "./CharacterAvatar";
import { WealthHud } from "./WealthHud";
import { VoyagerLedgerHud } from "./VoyagerLedgerHud";
import { ensureLedger } from "../voyagerLedger";
import { OutfitterInterior } from "./OutfitterBuilding";
import { WalkableHarborView, type HarborHotspot } from "../world3d";
import { HUB_ISLAND_ID } from "../worldMapLayout";
import {
  CAPSULE_OFFERS,
  PLAZA_PASS_PRICE,
  canBuyCapsule,
  capsuleLabel,
  companionPrice,
  hubPartyItems,
  isRoomUnlocked,
  nextPurchasableCarpet,
  ownsCompanion,
} from "../harborShop";
import { PARTY_ITEMS } from "../partyItems";
import type { PartyItemId } from "../partyItems";
import { toast } from "sonner";

const LazySettingsPanel = lazy(() => import("../SettingsPanel"));

type HubModal = "outfitter" | "capsule" | "settings" | null;

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
};

export function HomeHubView({
  userProfile,
  save,
  content,
  learningProfile,
  character,
  onSaveCharacter,
  onHarborPurchase,
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
}: HomeHubViewProps) {
  useInputAction("map", onOpenTravel);
  useInputAction("menu", () => setHubModal("settings"));

  const profile = getProfileDef(learningProfile);
  const boat = getEffectiveBoatTier(userProfile.totalCoins, save);
  const simplified = profile.hudMode === "simplified";
  const voyager = character ?? { ...BASE_VOYAGER, name: userProfile.name || "Voyager" };
  const freed = hasHarborFreedom(save);

  const [outfitterStage, setOutfitterStage] = useState<"look" | "pet">("look");
  const [draft, setDraft] = useState<CapitalCharacter>(voyager);
  const [nearStore, setNearStore] = useState<{ id: string; label: string } | null>(null);
  const [nearNpc, setNearNpc] = useState<{ id: string; name: string; line: string } | null>(null);
  const plazaRoom = isRoomUnlocked(save, "market") ? "market" : "plaza";

  const pets = useMemo(() => CHARACTER_COMPANIONS.filter((c) => c.id !== "none"), []);

  const harborHotspots = useMemo<HarborHotspot[]>(
    () => [
      { id: "arcade", label: "Arcade", icon: "🕹️", position: [-6.5, 0, -5] },
      { id: "outfitter", label: "Outfitter", icon: "👗", position: [0, 0, -8] },
      { id: "capsule", label: "Capsule Stall", icon: "📦", position: [4.2, 0, -7.2] },
      { id: "studio", label: "VibeCode", icon: "✨", position: [6.5, 0, -5] },
      { id: "travel", label: "Carpet Dock", icon: "🪄", position: [0, 0, 13] },
      { id: "settings", label: "Settings", icon: "⚙️", position: [-8, 0, 3.5] },
      ...(onOpenEditor
        ? [{ id: "editor", label: "Editor", icon: "🛠️", position: [8, 0, 3.5] } satisfies HarborHotspot]
        : []),
    ],
    [onOpenEditor],
  );

  const openOutfitter = () => {
    setDraft(voyager);
    setOutfitterStage("look");
    setHubModal("outfitter");
  };

  const onHarborHotspot = (id: string) => {
    if (id === "arcade") onOpenArcade();
    else if (id === "outfitter") openOutfitter();
    else if (id === "studio") onOpenStudio();
    else if (id === "travel") onOpenTravel();
    else if (id === "settings") setHubModal("settings");
    else if (id === "editor" && onOpenEditor) onOpenEditor();
    else if (id === "capsule") setHubModal("capsule");
  };

  const onNearChange = useCallback((id: string | null, label: string | null) => {
    setNearStore(id && label ? { id, label } : null);
  }, []);

  const nearTravel = nearStore?.id === "travel";
  const canResume =
    !!save.currentIslandId && save.currentIslandId !== HUB_ISLAND_ID;

  return (
    <>
      <GameHudLayout
        background={
          <div className="absolute inset-0">
            <WalkableHarborView
              character={voyager}
              hotspots={harborHotspots}
              onHotspot={onHarborHotspot}
              onOpenTravel={onOpenTravel}
              onNearChange={onNearChange}
              onNearNpc={setNearNpc}
            />
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
            ) : (
              <GameButton
                variant="primary"
                size="lg"
                onClick={onOpenTravel}
                className="w-full shadow-lg"
                data-testid="hub-travel-map"
              >
                🪄 Archipelago map
              </GameButton>
            )}
            <p className="text-[11px] font-semibold tracking-wide text-white/75">
              {nearStore
                ? "E enter · WASD walk"
                : `WASD walk · M map · ${boat.emoji} ${boat.label}`}
            </p>
            {(canResume || onPlayHarborBoard) && !nearStore ? (
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
          className="flex h-full min-h-0 flex-col items-center justify-start pt-1"
        >
          {nearNpc && !nearStore ? (
            <div className="pointer-events-none max-w-sm rounded-2xl bg-black/70 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg">
              <div className="text-[10px] uppercase tracking-wide text-white/70">{nearNpc.name}</div>
              {nearNpc.line}
            </div>
          ) : highlightOutfitter ? (
            <div className="rounded-full bg-amber-500/90 px-4 py-1.5 text-sm font-bold text-[#16283b] shadow-lg">
              Walk to the Outfitter (front center)
            </div>
          ) : freed ? (
            <div className="rounded-full bg-emerald-600/80 px-3 py-1 text-[11px] font-bold text-white">
              Freedom seal · carpet upgraded
            </div>
          ) : null}
          <div className="sr-only" data-testid="harbor-plaza" data-plaza-room={plazaRoom} />
        </div>
      </GameHudLayout>

      <GameModal
        open={hubModal !== null}
        onClose={() => setHubModal(null)}
        maxWidth="md"
        usePortal={hubModal !== "settings" && hubModal !== "outfitter"}
      >
        {hubModal === "outfitter" ? (
          <OutfitterInterior onLeave={() => setHubModal(null)}>
            {outfitterStage === "look" ? (
              <CharacterCreator
                character={draft}
                defaultName={userProfile.name}
                variant="outfitter"
                hideCompanion
                saveLabel="Next: pick a pet →"
                onSave={(c) => {
                  setDraft({ ...c, companion: draft.companion });
                  setOutfitterStage("pet");
                }}
                onCancel={() => setHubModal(null)}
              />
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex justify-center">
                  <CharacterAvatar character={draft} size={88} animationStyle="capital-default" />
                </div>
                <div>
                  <div className="text-lg font-black">Companion crates</div>
                  <p className="text-sm text-muted-foreground">Choose a pet waiting by the Outfitter dock.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {pets.map((pet) => {
                    const active = draft.companion === pet.id;
                    const price = companionPrice(pet.id);
                    const owned = ownsCompanion(save, pet.id);
                    return (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, companion: pet.id }))}
                        className={`flex min-w-[5.25rem] flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 transition ${
                          active
                            ? "border-[var(--cap-gold)] bg-[var(--cap-gold)]/20 scale-105"
                            : "border-[var(--cap-ink)]/15 bg-white hover:border-[var(--cap-tide)]"
                        }`}
                      >
                        <span className="text-3xl">{companionEmoji(pet.id)}</span>
                        <span className="text-xs font-bold">{pet.label}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {owned ? "Owned" : `🪙 ${price}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <GameButton variant="outline" className="flex-1" onClick={() => setOutfitterStage("look")}>
                    ← Looks
                  </GameButton>
                  <GameButton
                    variant="primary"
                    className="flex-1"
                    disabled={draft.companion === "none"}
                    onClick={() => {
                      const price = companionPrice(draft.companion);
                      const owned = ownsCompanion(save, draft.companion);
                      if (!owned && price > 0) {
                        const ok = onHarborPurchase({
                          kind: "companion",
                          companionId: draft.companion,
                          price,
                        });
                        if (!ok) {
                          toast.error(`Need 🪙 ${price} for that pet`);
                          return;
                        }
                        toast.success(`Adopted! −🪙 ${price}`);
                      }
                      onSaveCharacter(draft);
                      setHubModal(null);
                    }}
                  >
                    {draft.companion === "none"
                      ? "Pick a pet"
                      : ownsCompanion(save, draft.companion)
                        ? "Leave shop ✓"
                        : `Adopt · 🪙 ${companionPrice(draft.companion)}`}
                  </GameButton>
                </div>
              </div>
            )}
          </OutfitterInterior>
        ) : null}

        {hubModal === "capsule" ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-5xl">📦</div>
              <div className="text-xl font-black">Capsule Stall</div>
              <p className="text-sm text-muted-foreground">
                Spend coins on Fortune Capsules, carpet polish, and a Market pass.
              </p>
              <div className="mt-1 text-sm font-bold">Balance: 🪙 {userProfile.totalCoins}</div>
            </div>

            <GamePanel padding="default" className="space-y-2 text-left">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Fortune Capsules
              </div>
              {CAPSULE_OFFERS.map((offer) => {
                const def = PARTY_ITEMS[offer.itemId];
                const check = canBuyCapsule(save, userProfile.totalCoins, offer.itemId, offer.price);
                const owned = hubPartyItems(save).includes(offer.itemId);
                return (
                  <div
                    key={offer.itemId}
                    className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold">
                        {def.icon} {def.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{def.moneyTip}</div>
                    </div>
                    <GameButton
                      size="sm"
                      variant={owned ? "ghost" : "primary"}
                      disabled={!check.ok}
                      onClick={() => {
                        const ok = onHarborPurchase({
                          kind: "capsule",
                          itemId: offer.itemId,
                          price: offer.price,
                        });
                        if (ok) toast.success(`Bought ${capsuleLabel(offer.itemId)}`);
                        else toast.error(check.reason ?? "Can't buy");
                      }}
                    >
                      {owned ? "Owned" : `🪙 ${offer.price}`}
                    </GameButton>
                  </div>
                );
              })}
            </GamePanel>

            <GamePanel padding="default" className="space-y-2 text-left">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Carpet polish
              </div>
              {(() => {
                const next = nextPurchasableCarpet(userProfile.totalCoins, save);
                if (!next) {
                  return <p className="text-sm text-muted-foreground">Your carpet is maxed out.</p>;
                }
                const can = userProfile.totalCoins >= next.price;
                return (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold">
                        {next.tier.emoji} Unlock {next.tier.label}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Early unlock — cheaper than earning every coin for the tier.
                      </div>
                    </div>
                    <GameButton
                      size="sm"
                      variant="primary"
                      disabled={!can}
                      onClick={() => {
                        const ok = onHarborPurchase({
                          kind: "carpet",
                          tierId: next.tier.id,
                          price: next.price,
                        });
                        if (ok) toast.success(`${next.tier.label} unlocked!`);
                        else toast.error(`Need 🪙 ${next.price}`);
                      }}
                    >
                      🪙 {next.price}
                    </GameButton>
                  </div>
                );
              })()}
            </GamePanel>

            <GamePanel padding="default" className="space-y-2 text-left">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Plaza pass
              </div>
              {isRoomUnlocked(save, "market") ? (
                <p className="text-sm text-muted-foreground">🧺 Pasaran Lane unlocked.</p>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold">🧺 Pasaran Lane pass</div>
                    <div className="text-[11px] text-muted-foreground">
                      Open the market wing of Harbor Haven.
                    </div>
                  </div>
                  <GameButton
                    size="sm"
                    variant="primary"
                    disabled={userProfile.totalCoins < PLAZA_PASS_PRICE}
                    onClick={() => {
                      const ok = onHarborPurchase({
                        kind: "plaza_pass",
                        room: "market",
                        price: PLAZA_PASS_PRICE,
                      });
                      if (ok) toast.success("Pasaran Lane unlocked!");
                      else toast.error(`Need 🪙 ${PLAZA_PASS_PRICE}`);
                    }}
                  >
                    🪙 {PLAZA_PASS_PRICE}
                  </GameButton>
                </div>
              )}
            </GamePanel>

            <GameButton variant="outline" className="w-full" onClick={() => setHubModal(null)}>
              Back to plaza
            </GameButton>
          </div>
        ) : null}

        {hubModal === "settings" ? (
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
        ) : null}
      </GameModal>
    </>
  );
}
