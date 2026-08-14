import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  harborWeatherMood,
  weatherCoachLine,
  type HarborWeatherMood,
} from "./harborWeather";
import type { IslandSaveV1 } from "./types";

/**
 * Harbor weather HUD — ONE mood fiction driven by cashflow + scars.
 * Replaces dual boom/recession Markov chrome (GAME_DESIGN_COMPLEXITY.md).
 */

const MOOD_STYLE: Record<
  HarborWeatherMood,
  { label: string; icon: string; color: string }
> = {
  boom: { label: "Boom", icon: "☀️", color: "#22c55e" },
  fair: { label: "Fair", icon: "⛅", color: "#3b82f6" },
  tight: { label: "Tight", icon: "🌥", color: "#f59e0b" },
  storm: { label: "Storm", icon: "🌫", color: "#64748b" },
};

type Props = {
  /** Preferred — derives mood from ledger + scars. */
  save?: IslandSaveV1 | null;
  /** Legacy prop ignored when save is present. */
  economy?: unknown;
};

export default function EconomyWeatherIndicator({ save }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const mood: HarborWeatherMood = save ? harborWeatherMood(save) : "fair";
  const cfg = MOOD_STYLE[mood];

  return (
    <div
      className="relative inline-flex"
      data-testid="harbor-weather-indicator"
      data-weather-mood={mood}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-default transition-colors"
        style={{
          backgroundColor: `${cfg.color}15`,
          borderColor: `${cfg.color}40`,
          color: cfg.color,
        }}
      >
        <span className="text-sm">{cfg.icon}</span>
        <span>{cfg.label}</span>
      </div>

      <AnimatePresence>
        {showTooltip ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-40 top-full mt-1.5 right-0 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-xs"
          >
            <div className="font-bold text-gray-800 mb-1">
              {cfg.icon} Harbor {cfg.label}
            </div>
            <p className="text-gray-600">{weatherCoachLine(mood)}</p>
            <p className="mt-2 text-[10px] text-gray-500">
              Driven by cashflow — same weather as shop prices and sky.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
