import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SKILL_STAT_IDS,
  SKILL_STAT_META,
  type SkillStatsMap,
  type SkillStatId,
  type SkillStatChange,
} from "./skillStats";

// ---------------------------------------------------------------------------
// SkillStatsPanel — compact RPG-style stat bars with "how to improve" tooltips
// ---------------------------------------------------------------------------

type SkillStatsPanelProps = {
  stats: SkillStatsMap;
  history?: SkillStatChange[];
  compact?: boolean;
};

export default function SkillStatsPanel({ stats, history = [], compact = false }: SkillStatsPanelProps) {
  const [hoveredStat, setHoveredStat] = useState<SkillStatId | null>(null);

  return (
    <div className={`rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm ${compact ? "p-2" : "p-3"}`}>
      {!compact && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm font-bold text-gray-700">Skills</span>
          <span className="text-xs text-gray-400">RPG Stats</span>
        </div>
      )}

      <div className={`space-y-${compact ? "1" : "2"}`}>
        {SKILL_STAT_IDS.map((id) => {
          const meta = SKILL_STAT_META[id];
          const value = stats[id] ?? 0;
          const recentChanges = history
            .filter((h) => h.stat === id)
            .slice(-3);

          return (
            <div
              key={id}
              className="relative"
              onMouseEnter={() => setHoveredStat(id)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              {/* Stat bar row */}
              <div className="flex items-center gap-2">
                <span className="text-sm flex-shrink-0 w-5 text-center" title={meta.label}>
                  {meta.icon}
                </span>

                {!compact && (
                  <span className="text-xs font-medium text-gray-600 w-16 truncate">
                    {meta.label}
                  </span>
                )}

                {/* Bar */}
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: meta.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>

                <span className="text-xs font-mono font-bold text-gray-500 w-7 text-right">
                  {value}
                </span>
              </div>

              {/* Tooltip on hover */}
              <AnimatePresence>
                {hoveredStat === id && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 left-6 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs"
                  >
                    <div className="font-bold text-gray-800 mb-1">
                      {meta.icon} {meta.label} — {value}/100
                    </div>
                    <p className="text-gray-500 mb-2">{meta.description}</p>

                    <div className="bg-green-50 border border-green-200 rounded px-2 py-1.5 mb-2">
                      <span className="font-semibold text-green-700">How to improve: </span>
                      <span className="text-green-600">{meta.howToImprove}</span>
                    </div>

                    {recentChanges.length > 0 && (
                      <div>
                        <div className="font-semibold text-gray-500 mb-1">Recent changes:</div>
                        {recentChanges.map((ch, i) => (
                          <div key={i} className="flex items-center gap-1 text-gray-600">
                            <span className={ch.delta >= 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                              {ch.delta >= 0 ? `+${ch.delta}` : ch.delta}
                            </span>
                            <span className="truncate">{ch.reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
