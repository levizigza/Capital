import { useState } from "react";

import { GameButton, GamePanel } from "@/game-ui";
import { ControlsSettingsPanel } from "@/input";
import { CreditsAttributions } from "@/components/CreditsAttributions";

import type { AccessibilitySettings, TextSize } from "./settings";
import {
  PROFILE_IDS,
  PROFILES,
  loadLearningProfile,
  persistLearningProfile,
  type LearningProfileId,
} from "./learningProfile";

type Props = {
  settings: AccessibilitySettings;
  onChange: (next: AccessibilitySettings) => void;
  onClose: () => void;
  learningProfile?: LearningProfileId;
  onProfileChange?: (id: LearningProfileId) => void;
  onOpenAnalytics?: () => void;
};

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large" },
  { value: "xl", label: "Extra Large" },
];

export default function SettingsPanel({
  settings,
  onChange,
  onClose,
  learningProfile: propProfile,
  onProfileChange,
  onOpenAnalytics,
}: Props) {
  const [localProfile, setLocalProfile] = useState<LearningProfileId>(() => propProfile ?? loadLearningProfile());

  const handleProfileChange = (id: LearningProfileId) => {
    setLocalProfile(id);
    persistLearningProfile(id);
    onProfileChange?.(id);
  };

  const toggle = (key: "reducedMotion" | "highContrast" | "guideArrows") =>
    onChange({ ...settings, [key]: !settings[key] });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-black">⚙️ Settings</div>
        <GameButton onClick={onClose} variant="outline" size="sm" motionEnabled={false}>
          Close
        </GameButton>
      </div>

      <GamePanel title="Learning Profile">
        <p className="mb-3 text-xs text-gray-600">
          Choose your age-group track. This adjusts text complexity, number formatting, and challenge difficulty.
        </p>
        <div className="grid gap-2">
          {PROFILE_IDS.map((pid) => {
            const p = PROFILES[pid];
            const selected = localProfile === pid;
            return (
              <button
                key={pid}
                type="button"
                onClick={() => handleProfileChange(pid)}
                className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all min-h-11 ${
                  selected
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                aria-pressed={selected}
              >
                <span className="text-2xl mt-0.5">{p.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{p.label}</span>
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">{p.ageRange}</span>
                  </div>
                  <div className="mt-0.5 text-xs leading-snug text-gray-600">{p.description}</div>
                </div>
                {selected ? <span className="mt-1 text-sm font-bold text-blue-600">✓</span> : null}
              </button>
            );
          })}
        </div>
      </GamePanel>

      <GamePanel title="Accessibility">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" id="text-size-label">
              Text Size
            </label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="text-size-label">
              {TEXT_SIZES.map((ts) => (
                <GameButton
                  key={ts.value}
                  size="sm"
                  variant={settings.textSize === ts.value ? "primary" : "outline"}
                  motionEnabled={false}
                  onClick={() => onChange({ ...settings, textSize: ts.value })}
                  aria-pressed={settings.textSize === ts.value}
                >
                  {ts.label}
                </GameButton>
              ))}
            </div>
          </div>

          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={() => toggle("reducedMotion")}
              className="h-5 w-5 rounded accent-blue-600"
              aria-label="Reduced motion"
            />
            <div>
              <div className="text-sm font-medium">Reduced Motion</div>
              <div className="text-xs text-gray-600">Disable animations and transitions</div>
            </div>
          </label>

          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={settings.guideArrows !== false}
              onChange={() => toggle("guideArrows")}
              className="h-5 w-5 rounded accent-blue-600"
              aria-label="Guide arrows"
            />
            <div>
              <div className="text-sm font-medium">Guide arrows</div>
              <div className="text-xs text-gray-600">
                Soft edge cue + Coin Bag point — turn off for free roam / side quests
              </div>
            </div>
          </label>

          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={() => toggle("highContrast")}
              className="h-5 w-5 rounded accent-blue-600"
              aria-label="High contrast mode"
            />
            <div>
              <div className="text-sm font-medium">High Contrast</div>
              <div className="text-xs text-gray-600">Increase contrast for colorblind-friendly UI</div>
            </div>
          </label>
        </div>
      </GamePanel>

      <GamePanel title="Soundtrack">
        <div className="space-y-4">
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={settings.musicEnabled !== false}
              onChange={() =>
                onChange({
                  ...settings,
                  musicEnabled: settings.musicEnabled === false ? true : false,
                })
              }
              className="h-5 w-5 rounded accent-blue-600"
              aria-label="Fortune soundtrack"
            />
            <div>
              <div className="text-sm font-medium">Fortune soundtrack</div>
              <div className="text-xs text-gray-600">
                Distinct CC0 themes for Harbor, map, and each genre shore
              </div>
            </div>
          </label>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="music-volume">
              Music volume
            </label>
            <input
              id="music-volume"
              type="range"
              min={0}
              max={100}
              value={Math.round((settings.musicVolume ?? 0.42) * 100)}
              disabled={settings.musicEnabled === false}
              onChange={(e) =>
                onChange({
                  ...settings,
                  musicVolume: Number(e.target.value) / 100,
                })
              }
              className="w-full accent-teal-600"
            />
          </div>
        </div>
      </GamePanel>

      <ControlsSettingsPanel />

      {onOpenAnalytics ? (
        <GamePanel title="Analytics">
          <p className="mb-3 text-xs text-gray-600">
            Inspect onboarding funnels, drop-off points in the first 5 minutes, and export event data.
          </p>
          <GameButton variant="primary" size="sm" motionEnabled={false} onClick={onOpenAnalytics}>
            Open funnel export
          </GameButton>
        </GamePanel>
      ) : null}

      <CreditsAttributions />

      <GamePanel title="⚠️ Disclaimer" className="border-amber-200 bg-amber-50">
        <p className="text-sm leading-relaxed text-amber-900">
          This is an <strong>educational simulation</strong> designed to teach financial literacy
          concepts through gameplay. It does <strong>not</strong> constitute financial advice,
          investment recommendations, or solicitation to buy or sell any financial instruments.
          All market data, prices, and scenarios are simulated and fictional.
          Always consult a qualified financial professional before making real investment decisions.
        </p>
      </GamePanel>

      <div className="sticky bottom-0 border-t border-black/10 bg-[color-mix(in_oklab,#fffdf6_94%,transparent)] pt-3">
        <GameButton className="w-full" variant="primary" onClick={onClose} motionEnabled={false}>
          Done — back to Harbor
        </GameButton>
      </div>
    </div>
  );
}
