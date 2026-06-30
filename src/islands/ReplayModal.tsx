import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GameButton, GameModal, GamePanel, HudBadge } from "@/game-ui";
import type { DecisionTimeline, DecisionEntry } from "./decisionTimeline";
import { saveTimeline, exportTimelinesJSON } from "./decisionTimeline";
import { SKILL_STAT_META, type SkillStatChange } from "./skillStats";

// ---------------------------------------------------------------------------
// ReplayModal — "Why it happened" post-quest/minigame decision review
// ---------------------------------------------------------------------------
// Shows 3–7 key decision points with:
//   - what the player chose vs alternatives
//   - state-diff summary
//   - causal explanation
//   - optional learning note
// ---------------------------------------------------------------------------

type ReplayModalProps = {
  timeline: DecisionTimeline;
  onClose: () => void;
};

export default function ReplayModal({ timeline, onClose }: ReplayModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  const entry = timeline.entries[activeIndex];
  const total = timeline.entries.length;

  const handleSave = () => {
    saveTimeline(timeline);
    setSaved(true);
  };

  const handleExport = () => {
    const json = exportTimelinesJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decision-timelines-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <GameModal open onClose={onClose} maxWidth="lg" zIndex={60} usePanel={false}>
      <GamePanel className="max-h-[85vh] overflow-y-auto border-2 border-indigo-200">
        <div className="space-y-4 p-[var(--game-panel-pad)]">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-xl font-black text-gray-900">
                  🔍 Why It Happened
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  {timeline.context.minigameName} on {timeline.context.islandName}
                  {timeline.score != null && (
                    <span className="ml-2 font-semibold text-indigo-600">
                      Score: {timeline.score}
                    </span>
                  )}
                </p>
              </div>
              <GameButton variant="ghost" size="sm" onClick={onClose} motionEnabled={false}>
                ✕
              </GameButton>
            </div>

            {/* Story summary */}
            {timeline.storySummary && (
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-900">
                <span className="font-bold">📖 Your story: </span>
                {timeline.storySummary}
              </div>
            )}

            {/* Timeline stepper */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {timeline.entries.map((e, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`flex-shrink-0 w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    i === activeIndex
                      ? "bg-indigo-600 text-white shadow-lg scale-110"
                      : i < activeIndex
                        ? "bg-indigo-200 text-indigo-700"
                        : "bg-gray-100 text-gray-400"
                  }`}
                  title={e.action.eventTitle}
                >
                  {e.action.eventIcon || (i + 1)}
                </button>
              ))}
            </div>

            {/* Active decision card */}
            {entry && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <DecisionCard entry={entry} index={activeIndex} />
                </motion.div>
              </AnimatePresence>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <GameButton
                variant="outline"
                size="sm"
                motionEnabled={false}
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                disabled={activeIndex === 0}
              >
                ← Previous
              </GameButton>
              <span className="text-xs text-gray-400">
                {activeIndex + 1} / {total}
              </span>
              {activeIndex < total - 1 ? (
                <GameButton
                  variant="outline"
                  size="sm"
                  motionEnabled={false}
                  onClick={() => setActiveIndex((i) => Math.min(total - 1, i + 1))}
                >
                  Next →
                </GameButton>
              ) : (
                <GameButton size="sm" variant="primary" onClick={onClose} motionEnabled={false}>
                  Done
                </GameButton>
              )}
            </div>

            {/* Session skill summary */}
            {timeline.skillChanges && timeline.skillChanges.length > 0 && (
              <SkillChangeSummary changes={timeline.skillChanges} />
            )}

            {/* Save / Export bar */}
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
              <GameButton
                variant="outline"
                size="sm"
                motionEnabled={false}
                onClick={handleSave}
                disabled={saved}
              >
                {saved ? "✓ Saved" : "💾 Save Replay"}
              </GameButton>
              <GameButton variant="outline" size="sm" motionEnabled={false} onClick={handleExport}>
                📥 Export All
              </GameButton>
            </div>
        </div>
      </GamePanel>
    </GameModal>
  );
}

// ---------------------------------------------------------------------------
// DecisionCard — renders a single decision entry
// ---------------------------------------------------------------------------

function StatDeltaBadge({ label, before, after, prefix }: { label: string; before: number; after: number; prefix?: string }) {
  const delta = after - before;
  if (delta === 0) return null;
  const p = prefix ?? "$";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
        delta >= 0
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-red-50 border-red-200 text-red-600"
      }`}
    >
      {label}: {p}{before} → {p}{after}
    </span>
  );
}

function DecisionCard({ entry, index }: { entry: DecisionEntry; index: number }) {
  const before = entry.stateBefore;
  const after = entry.stateAfter;
  const hasCausal = entry.causalExplanation && entry.causalExplanation !== entry.explanation;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 space-y-3 border border-indigo-100">
      {/* Title + impact badge */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{entry.action.eventIcon || "📌"}</span>
        <h3 className="font-bold text-gray-900">{entry.action.eventTitle}</h3>
        <HudBadge className="ml-auto">
          Decision #{index + 1}
        </HudBadge>
      </div>

      {/* State snapshot: before → after */}
      {before && after && (
        <div className="flex flex-wrap gap-1.5">
          <StatDeltaBadge label="Cash" before={before.money} after={after.money} />
          <StatDeltaBadge label="Debt" before={before.debt} after={after.debt} />
          <StatDeltaBadge label="Score" before={before.score} after={after.score} prefix="" />
        </div>
      )}

      {/* What you chose */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your choice</div>
        <div className="bg-white rounded-lg px-3 py-2 border border-indigo-200 font-medium text-indigo-800 text-sm">
          ✅ {entry.action.chosenLabel}
        </div>
      </div>

      {/* Alternatives */}
      {entry.alternatives.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Alternatives you didn't pick
          </div>
          <div className="space-y-1">
            {entry.alternatives.map((alt, i) => (
              <div
                key={i}
                className="bg-white/60 rounded-lg px-3 py-1.5 text-sm text-gray-500 border border-gray-200"
              >
                ○ {alt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State diff */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-gray-600">Impact:</span>
        <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
          {entry.stateDiff}
        </span>
      </div>

      {/* Personalized causal explanation (preferred over generic) */}
      {hasCausal ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-900">
          <span className="font-bold">🔗 Because of what you did:</span> {entry.causalExplanation}
        </div>
      ) : entry.explanation ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-900">
          <span className="font-bold">💡 Why it happened:</span> {entry.explanation}
        </div>
      ) : null}

      {/* Learning note */}
      {entry.learningNote && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-900">
          <span className="font-bold">📚 Takeaway:</span> {entry.learningNote}
        </div>
      )}

      {/* Skill stat changes */}
      {entry.skillChanges && entry.skillChanges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.skillChanges.map((sc, i) => {
            const meta = SKILL_STAT_META[sc.stat];
            return (
              <span
                key={i}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  sc.delta >= 0
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                {meta?.icon ?? "📊"} {meta?.label ?? sc.stat} {sc.delta >= 0 ? "+" : ""}{sc.delta}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkillChangeSummary — aggregated skill stat changes for the session
// ---------------------------------------------------------------------------

function SkillChangeSummary({ changes }: { changes: SkillStatChange[] }) {
  // Aggregate deltas per stat
  const totals: Record<string, number> = {};
  for (const ch of changes) {
    totals[ch.stat] = (totals[ch.stat] ?? 0) + ch.delta;
  }

  const entries = Object.entries(totals).filter(([, d]) => d !== 0);
  if (entries.length === 0) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 space-y-1">
      <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
        Skill Stats This Session
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.map(([stat, delta]) => {
          const meta = SKILL_STAT_META[stat as keyof typeof SKILL_STAT_META];
          return (
            <span
              key={stat}
              className={`inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${
                delta >= 0
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {meta?.icon ?? "📊"} {meta?.label ?? stat} {delta >= 0 ? "+" : ""}{delta}
            </span>
          );
        })}
      </div>
    </div>
  );
}
