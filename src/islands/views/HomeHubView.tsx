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
import { getProfileDef, type LearningProfileId } from "../learningProfile";
import type { AccessibilitySettings } from "../settings";

const LazySettingsPanel = lazy(() => import("../SettingsPanel"));

type HubModal = "avatar" | "shop" | "settings" | null;

export type HomeHubViewProps = {
  userProfile: UserProfile;
  save: IslandSaveV1;
  content: IslandsContent;
  learningProfile: LearningProfileId;
  hubModal: HubModal;
  setHubModal: (m: HubModal) => void;
  onExit: () => void;
  onOpenTravel: () => void;
  onOpenArcade: () => void;
  onOpenStudio: () => void;
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
  borderClass,
  onClick,
}: {
  icon: string;
  label: string;
  borderClass: string;
  onClick: () => void;
}) {
  const { hover, tap, reduced } = useGameMotion();
  const { uiScale } = useGameUi();
  const size =
    uiScale === "compact" ? "w-[var(--game-interactable)] h-[calc(var(--game-interactable)*1.15)]" : "w-24 h-28";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 group min-w-0"
      whileHover={reduced ? undefined : hover}
      whileTap={reduced ? undefined : tap}
    >
      <div
        className={`${size} rounded-2xl bg-white/90 shadow-xl border-4 flex flex-col items-center justify-center transition-colors ${borderClass}`}
      >
        <span className={uiScale === "compact" ? "text-4xl" : "text-5xl"}>{icon}</span>
      </div>
      <span className="text-sm font-bold text-white drop-shadow truncate max-w-[6rem]">{label}</span>
    </motion.button>
  );
}

export function HomeHubView({
  userProfile,
  save,
  content,
  learningProfile,
  hubModal,
  setHubModal,
  onExit,
  onOpenTravel,
  onOpenArcade,
  onOpenStudio,
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
  const hudSubtitle =
    profile.hudMode === "simplified"
      ? `⭐ Level ${userProfile.level}`
      : `⭐ Level ${userProfile.level} · 🪙 ${userProfile.totalCoins} · ✨ ${userProfile.xp} XP`;

  const background = (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-200" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-400 to-emerald-200 rounded-t-[40%]" />
    </>
  );

  return (
    <>
      <GameHudLayout
        background={background}
        topLeft={<HudChip title={userProfile.name || "Adventurer"} subtitle={hudSubtitle} />}
        topRight={
          <>
            <HudBadge>
              {profile.icon} {profile.label}
            </HudBadge>
            <GameButton variant="outline" size="sm" onClick={onExit}>
              Exit
            </GameButton>
          </>
        }
        bottom={
          <div className="flex w-full max-w-lg flex-col items-center gap-[var(--game-gap)] px-2">
            <GameButton variant="primary" size="lg" onClick={onOpenTravel} className="w-full max-w-xs shadow-xl" data-testid="hub-travel-map">
              🧭 Open Travel Map
            </GameButton>
            <InputPromptHint action="map" className="text-white drop-shadow">
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
          <h1
            className="text-center font-black text-white drop-shadow-lg shrink-0"
            style={{ fontSize: "var(--game-title-size)", textShadow: "2px 2px 0 #0008" }}
          >
            🏠 Home Hub
          </h1>
          <p className="text-center text-sm text-white/90 max-w-md shrink-0">
            Your clubhouse — customize, shop, play arcade games, or hop the blimp to distinct islands.
          </p>
          <div className="flex flex-wrap items-end justify-center gap-[var(--game-gap-lg)] max-w-full overflow-x-auto pb-2">
            <HubInteractable icon="🧑" label="Character" borderClass="border-amber-300 group-hover:border-amber-400" onClick={() => setHubModal("avatar")} />
            <HubInteractable icon="🛒" label="Shop" borderClass="border-violet-300 group-hover:border-violet-400" onClick={() => setHubModal("shop")} />
            <HubInteractable icon="🕹️" label="Arcade" borderClass="border-rose-300 group-hover:border-rose-400" onClick={onOpenArcade} />
            <HubInteractable icon="✨" label="VibeCode" borderClass="border-cyan-300 group-hover:border-cyan-400" onClick={onOpenStudio} />
            <HubInteractable icon="⚙️" label="Settings" borderClass="border-slate-300 group-hover:border-slate-400" onClick={() => setHubModal("settings")} />
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
          <div className="space-y-4 text-center">
            <div className="text-5xl">🧑</div>
            <div className="text-xl font-black">Character / Avatar</div>
            <p className="text-muted-foreground text-sm">Customize your look and view your stats. Coming soon!</p>
            <GamePanel padding="default" className="text-left text-sm">
              <div><span className="font-bold">Name:</span> {userProfile.name || "Adventurer"}</div>
              <div><span className="font-bold">Level:</span> {userProfile.level}</div>
              <div><span className="font-bold">Coins:</span> {userProfile.totalCoins}</div>
              <div><span className="font-bold">XP:</span> {userProfile.xp}</div>
              <div><span className="font-bold">Items:</span> {save.inventory.length}</div>
            </GamePanel>
            <GameButton variant="primary" className="w-full" onClick={() => setHubModal(null)}>
              Close
            </GameButton>
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
