import { Suspense, lazy, useMemo, useState } from "react";
import {
  GameHudLayout,
  GameButton,
  GameModal,
  HudBadge,
  HudChip,
  GamePanel,
} from "@/game-ui";
import { useInputAction, InputPromptHint } from "@/input";

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
  const hudSubtitle = `⭐ Level ${userProfile.level} · ${boat.emoji} ${boat.label}`;
  const voyager = character ?? { ...BASE_VOYAGER, name: userProfile.name || "Voyager" };
  const freed = hasHarborFreedom(save);

  const [outfitterStage, setOutfitterStage] = useState<"look" | "pet">("look");
  const [draft, setDraft] = useState<CapitalCharacter>(voyager);
  const plazaRoom = "plaza";

  const pets = useMemo(() => CHARACTER_COMPANIONS.filter((c) => c.id !== "none"), []);

  const harborHotspots = useMemo<HarborHotspot[]>(
    () => [
      { id: "arcade", label: "Arcade", icon: "🕹️", position: [-6, 0, -4] },
      { id: "outfitter", label: "Outfitter", icon: "👗", position: [0, 0, -7] },
      { id: "studio", label: "VibeCode", icon: "✨", position: [6, 0, -4] },
      { id: "travel", label: "Carpet Dock", icon: "🪄", position: [0, 0, 10] },
      { id: "settings", label: "Settings", icon: "⚙️", position: [-7, 0, 4] },
      ...(onOpenEditor
        ? [{ id: "editor", label: "Editor", icon: "🛠️", position: [7, 0, 4] } satisfies HarborHotspot]
        : []),
    ],
    [onOpenEditor],
  );

  const onHarborHotspot = (id: string) => {
    if (id === "arcade") onOpenArcade();
    else if (id === "outfitter") openOutfitter();
    else if (id === "studio") onOpenStudio();
    else if (id === "travel") onOpenTravel();
    else if (id === "settings") setHubModal("settings");
    else if (id === "editor" && onOpenEditor) onOpenEditor();
    else if (id === "capsule") setHubModal("capsule");
  };

  const openOutfitter = () => {
    setDraft(voyager);
    setOutfitterStage("look");
    setHubModal("outfitter");
  };

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
            />
          </div>
        }
        topLeft={
          <div className="flex items-center gap-2">
            <button type="button" onClick={openOutfitter} aria-label="Open Outfitter">
              <CharacterAvatar character={voyager} size={40} animationStyle="capital-default" />
            </button>
            <WealthHud totalCoins={userProfile.totalCoins} compact={simplified} />
            <VoyagerLedgerHud ledger={ensureLedger(save.voyagerLedger)} compact />
            <div className="hidden sm:block">
              <HudChip title={voyager.name || "Adventurer"} subtitle={hudSubtitle} />
            </div>
          </div>
        }
        topRight={
          <>
            <HudBadge>
              {profile.icon} {profile.label}
            </HudBadge>
            {onReplayIntro ? (
              <GameButton variant="ghost" size="sm" onClick={onReplayIntro} title="Replay opening animation">
                ↻ Intro
              </GameButton>
            ) : null}
          </>
        }
        bottom={
          <div className="flex w-full max-w-lg flex-col items-center gap-[var(--game-gap)] px-2">
            <GameButton
              variant="primary"
              size="lg"
              onClick={onOpenTravel}
              className="w-full max-w-xs shadow-xl"
              data-testid="hub-travel-map"
            >
              🪄 Board carpet / Archipelago
            </GameButton>
            <InputPromptHint action="map" className="text-white/80">
              or press M in the plaza · WASD to walk
            </InputPromptHint>
            {save.currentIslandId && save.currentIslandId !== HUB_ISLAND_ID ? (
              <GameButton variant="secondary" size="lg" onClick={onResume} className="w-full max-w-xs shadow-lg">
                ▶️ Resume voyage: {getIslandById(content, save.currentIslandId)?.name || save.currentIslandId}
              </GameButton>
            ) : null}
            {onPlayHarborBoard ? (
              <GameButton
                variant="ghost"
                size="sm"
                onClick={onPlayHarborBoard}
                className="w-full max-w-xs text-white/90"
              >
                🎲 Fortune Party board (Harbor practice)
              </GameButton>
            ) : null}
          </div>
        }
      >
        <div className="pointer-events-none flex h-full min-h-0 flex-col items-center justify-start pt-2">
          <div className="rounded-xl bg-black/35 px-4 py-2 text-center text-white backdrop-blur-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">
              Fortune Archipelago · Harbor Haven
            </div>
            <h1 className="text-2xl font-black tracking-wide sm:text-3xl">Walk your Voyager</h1>
            <p className="text-xs text-white/80">
              Approach stalls in 3D · {boat.emoji} {boat.label} waiting at the dock
            </p>
            {highlightOutfitter ? (
              <p className="mt-1 text-sm font-bold text-amber-200">Walk to the Outfitter stall (front center)</p>
            ) : null}
            {freed ? (
              <p className="mt-1 text-[10px] text-emerald-200">Freedom seal earned — carpet upgraded</p>
            ) : null}
          </div>
          {/* keep test hook for smoke tests */}
          <div className="sr-only" data-testid="harbor-plaza" data-plaza-room="plaza" />
        </div>
      </GameHudLayout>

      <GameModal
        open={hubModal !== null}
        onClose={() => setHubModal(null)}
        maxWidth="md"
        usePanel={hubModal !== "settings" && hubModal !== "outfitter"}
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
            <GamePanel padding="default" className="text-left text-sm space-y-2">
              <div>🛡️ <strong>Emergency Ledger</strong> — block a raid</div>
              <div>🧲 <strong>Dividend Magnet</strong> — double a payday</div>
              <div>📜 <strong>Fee Writ</strong> — take coins from a rival</div>
              <div className="font-bold pt-2">Your balance: 🪙 {userProfile.totalCoins}</div>
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
