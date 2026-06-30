import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ECONOMY_PHASE_CONFIG,
  PHASE_DURATION,
  type EconomyState,
  type EconomyPhase,
} from "./economy";

// ---------------------------------------------------------------------------
// EconomyWeatherIndicator — small HUD widget showing the current economy phase
// ---------------------------------------------------------------------------

type EconomyWeatherIndicatorProps = {
  economy: EconomyState;
};

export default function EconomyWeatherIndicator({ economy }: EconomyWeatherIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const cfg = ECONOMY_PHASE_CONFIG[economy.phase];
  const turnsLeft = Math.max(0, PHASE_DURATION - economy.turnsInPhase);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Compact badge */}
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
        <span
          className="text-[10px] font-normal opacity-70 ml-0.5"
          title={`${turnsLeft} turn(s) until potential shift`}
        >
          ({turnsLeft}t)
        </span>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-40 top-full mt-1.5 right-0 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-xs"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{cfg.icon}</span>
              <div>
                <div className="font-bold text-gray-800">{cfg.label} Economy</div>
                <div className="text-gray-500 text-[10px]">
                  Turn {economy.totalTurns} · {turnsLeft} turn(s) until shift check
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-2">{cfg.description}</p>

            <div
              className="rounded-lg px-2.5 py-1.5 mb-2 border"
              style={{
                backgroundColor: `${cfg.color}08`,
                borderColor: `${cfg.color}30`,
              }}
            >
              <span className="font-semibold" style={{ color: cfg.color }}>
                What it affects:{" "}
              </span>
              <span className="text-gray-600">{cfg.whatItAffects}</span>
            </div>

            {/* Phase history mini-timeline */}
            {economy.phaseHistory.length > 1 && (
              <div>
                <div className="font-semibold text-gray-500 mb-1">Phase history:</div>
                <div className="flex flex-wrap gap-1">
                  {economy.phaseHistory.slice(-5).map((ph, i) => {
                    const phCfg = ECONOMY_PHASE_CONFIG[ph.phase];
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${phCfg.color}10`,
                          borderColor: `${phCfg.color}30`,
                          color: phCfg.color,
                        }}
                      >
                        {phCfg.icon} T{ph.startedAtTurn}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
