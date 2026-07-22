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

const LazySettingsPanel = lazy(() => import("../SettingsPanel"));

type HubModal = "outfitter" | "capsule" | "settings" | null;

export type HomeHubViewProps = {
  userProfile: UserProfile;
  save: IslandSaveV1;
  content: IslandsContent;
  learningProfile: LearningProfileId;
  character?: CapitalCharacter;
  onSaveCharacter: (c: CapitalCharacter) => void;
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
  const plazaRoom = "plaza";

  const pets = useMemo(() => CHARACTER_COMPANIONS.filter((c) => c.id !== "none"), []);

  const harborHotspots = useMemo<HarborHotspot[]>(
    () => [
      { id: "arcade", label: "Arcade", icon: "🕹️", position: [-6.5, 0, -5] },
      { id: "outfitter", label: "Outfitter", icon: "👗", position: [0, 0, -8] },
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
        {/* Quiet stage — only tutorial coach when needed */}
        <div className="pointer-events-none flex h-full min-h-0 flex-col items-center justify-start pt-1">
          {highlightOutfitter ? (
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
                      onSaveCharacter(draft);
                      setHubModal(null);
                    }}
                  >
                    {draft.companion === "none" ? "Pick a pet" : "Leave shop ✓"}
                  </GameButton>
                </div>
              </div>
            )}
          </OutfitterInterior>
        ) : null}

        {hubModal === "capsule" ? (
          <div className="space-y-4 text-center">
            <div className="text-5xl">📦</div>
            <div className="text-xl font-black">Capsule Stall</div>
            <p className="text-sm text-muted-foreground">
              Fortune Capsules also wash up on island boards. This stall previews what you can find at sea.
            </p>
            <GamePanel padding="default" className="space-y-2 text-left text-sm">
              <div>🛡️ <strong>Emergency Ledger</strong> — block a raid</div>
              <div>🧲 <strong>Dividend Magnet</strong> — double a payday</div>
              <div>📜 <strong>Fee Writ</strong> — take coins from a rival</div>
              <div className="pt-2 font-bold">Your balance: 🪙 {userProfile.totalCoins}</div>
            </GamePanel>
            <GameButton variant="primary" className="w-full" onClick={() => setHubModal(null)}>
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
