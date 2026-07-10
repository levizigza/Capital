import { Suspense, lazy } from "react";
import { motion } from "framer-motion";

import {
  GameHudLayout,
  GameButton,
  GameModal,
  GamePanel,
  HudBadge,
  HudChip,
  useGameMotion,
  useGameUi,
} from "@/game-ui";
import { useInputAction, InputPromptHint } from "@/input";

import type { UserProfile } from "@/App";
import type { IslandSaveV1, IslandsContent } from "../types";
import { getIslandById } from "../content/loader";
import { getBoatTier } from "../boats";
import { getProfileDef, type LearningProfileId } from "../learningProfile";
import type { AccessibilitySettings } from "../settings";
import type { CapitalCharacter } from "../character";
import { CharacterCreator } from "./CharacterCreator";
import { CharacterAvatar } from "./CharacterAvatar";
import { WealthHud } from "./WealthHud";

const LazySettingsPanel = lazy(() => import("../SettingsPanel"));

type HubModal = "avatar" | "shop" | "settings" | null;

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
  onOpenEditor?: () => void;
  onOpenAnalytics?: () => void;
  a11y: AccessibilitySettings;
  updateA11y: (next: AccessibilitySettings) => void;
  updateLearningProfile: (id: LearningProfileId) => void;
};

function HubInteractable({
  icon,
  label,
  accentClass,
  onClick,
}: {
  icon: string;
  label: string;
  accentClass: string;
  onClick: () => void;
}) {
  const { hover, tap, reduced } = useGameMotion();
  const { uiScale } = useGameUi();
  const size =
    uiScale === "compact" ? "w-[var(--game-interactable)] h-[calc(var(--game-interactable)*1.15)]" : "w-24 h-28";
  const halo = uiScale === "compact" ? "w-12 h-12 text-3xl" : "w-16 h-16 text-4xl";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 group min-w-0"
      whileHover={reduced ? undefined : hover}
      whileTap={reduced ? undefined : tap}
    >
      <div
        className={`${size} cap-card flex flex-col items-center justify-center transition-transform group-hover:-translate-y-1`}
      >
        <span
          className={`flex items-center justify-center rounded-2xl ${accentClass} ${halo} border-2 border-[var(--cap-ink)]/15`}
        >
          {icon}
        </span>
      </div>
      <span className="text-sm font-bold text-[var(--cap-ink)] truncate max-w-[6rem]">{label}</span>
    </motion.button>
  );
}

export function HomeHubView({
  userProfile,
  save,
  content,
  learningProfile,
  character,
  onSaveCharacter,
  hubModal,
  setHubModal,
  onExit,
  onOpenTravel,
  onOpenArcade,
  onOpenStudio,
  onReplayIntro,
  onResume,
  onOpenEditor,
  onOpenAnalytics,
  a11y,
  updateA11y,
  updateLearningProfile,
}: HomeHubViewProps) {
  useInputAction("map", onOpenTravel);
  useInputAction("menu", () => setHubModal("settings"));

  const profile = getProfileDef(learningProfile);
  const boat = getBoatTier(userProfile.totalCoins);
  const simplified = profile.hudMode === "simplified";
  const hudSubtitle = `⭐ Level ${userProfile.level} · ${boat.emoji} ${boat.label}`;

  const background = (
    <div className="cap-surface absolute inset-0">
      <div className="absolute bottom-0 left-0 right-0 h-2/5 rounded-t-[45%] bg-gradient-to-t from-[color-mix(in_oklab,var(--cap-tide)_22%,var(--cap-paper))] to-transparent" />
    </div>
  );

  return (
    <>
      <GameHudLayout
        background={background}
        topLeft={
          <div className="flex items-center gap-2">
            {character ? (
              <button type="button" onClick={() => setHubModal("avatar")} aria-label="Edit character">
                <CharacterAvatar character={character} size={40} />
              </button>
            ) : null}
            <WealthHud totalCoins={userProfile.totalCoins} compact={simplified} />
            <div className="hidden sm:block">
              <HudChip title={character?.name || userProfile.name || "Adventurer"} subtitle={hudSubtitle} />
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
            <GameButton variant="outline" size="sm" onClick={onExit}>
              Exit
            </GameButton>
          </>
        }
        bottom={
          <div className="flex w-full max-w-lg flex-col items-center gap-[var(--game-gap)] px-2">
            <GameButton variant="primary" size="lg" onClick={onOpenTravel} className="w-full max-w-xs shadow-xl" data-testid="hub-travel-map">
              🗺️ Island Map
            </GameButton>
            <InputPromptHint action="map" className="text-[var(--cap-ink-soft)]">
              or press
            </InputPromptHint>
            {save.currentIslandId ? (
              <GameButton variant="secondary" size="lg" onClick={onResume} className="w-full max-w-xs shadow-lg">
                ▶️ Resume: {getIslandById(content, save.currentIslandId)?.name || save.currentIslandId}
              </GameButton>
            ) : null}
            {onOpenEditor ? (
              <GameButton variant="outline" size="sm" onClick={onOpenEditor} className="border-orange-300 bg-orange-100 text-orange-800">
                🛠️ Island Editor (dev)
              </GameButton>
            ) : null}
            {onOpenAnalytics ? (
              <GameButton variant="outline" size="sm" onClick={onOpenAnalytics} className="border-blue-300 bg-blue-100 text-blue-900">
                📊 Analytics & Funnels
              </GameButton>
            ) : null}
          </div>
        }
      >
        <div className="flex h-full min-h-0 flex-col items-center justify-center gap-[var(--game-gap-lg)] px-2 py-4">
          <div className="text-center shrink-0">
            <div className="cap-eyebrow mb-1">Your party home base</div>
            <h1 className="cap-display text-[var(--cap-ink)]" style={{ fontSize: "var(--game-title-size)" }}>
              Capital
              <span className="ml-2 inline-block h-[0.55em] w-[0.55em] -translate-y-[0.1em] rounded-sm bg-[var(--cap-gold)]" />
            </h1>
          </div>
          <p className="text-center text-sm text-[var(--cap-ink-soft)] max-w-md shrink-0">
            Pick an island on the world map, roll dice on its party board, and launch minigames — Mario Party style.
            Use the Arcade for free play anytime.
          </p>
          <div className="flex flex-wrap items-end justify-center gap-[var(--game-gap-lg)] max-w-full overflow-x-auto pb-2">
            <HubInteractable icon="🧑" label="Character" accentClass="bg-amber-200" onClick={() => setHubModal("avatar")} />
            <HubInteractable icon="🛒" label="Shop" accentClass="bg-violet-200" onClick={() => setHubModal("shop")} />
            <HubInteractable icon="🕹️" label="Arcade" accentClass="bg-rose-200" onClick={onOpenArcade} />
            <HubInteractable icon="✨" label="VibeCode" accentClass="bg-cyan-200" onClick={onOpenStudio} />
            <HubInteractable icon="⚙️" label="Settings" accentClass="bg-slate-200" onClick={() => setHubModal("settings")} />
          </div>
        </div>
      </GameHudLayout>

      <GameModal
        open={hubModal !== null}
        onClose={() => setHubModal(null)}
        maxWidth="md"
        usePanel={hubModal !== "settings"}
      >
        {hubModal === "avatar" ? (
          <div className="space-y-4">
            <CharacterCreator
              character={character}
              defaultName={userProfile.name}
              onSave={(c) => {
                onSaveCharacter(c);
                setHubModal(null);
              }}
              onCancel={() => setHubModal(null)}
            />
            <GamePanel padding="default" className="text-left text-sm">
              <div><span className="font-bold">Level:</span> {userProfile.level} · <span className="font-bold">Coins:</span> 🪙 {userProfile.totalCoins} · <span className="font-bold">XP:</span> ✨ {userProfile.xp} · <span className="font-bold">Items:</span> {save.inventory.length}</div>
            </GamePanel>
          </div>
        ) : null}
        {hubModal === "shop" ? (
          <div className="space-y-4 text-center">
            <div className="text-5xl">🛒</div>
            <div className="text-xl font-black">Shop</div>
            <p className="text-sm text-muted-foreground">Spend coins on cosmetics. Coming soon!</p>
            <GamePanel padding="default" className="text-sm">
              <div className="font-bold">Your balance: 🪙 {userProfile.totalCoins}</div>
            </GamePanel>
            <GameButton variant="primary" className="w-full" onClick={() => setHubModal(null)}>
              Close
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
