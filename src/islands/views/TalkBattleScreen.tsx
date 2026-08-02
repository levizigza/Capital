/**
 * Talk Battle — conversation stage among living money.
 * Full-screen: just you and them until the turn-based convo ends (or you Leave).
 * Fantasy law: Voyager among Money Mascots — never combat HP bars or a sterile void.
 */

import { useCallback, useEffect, useState } from "react";
import { GameButton } from "@/game-ui";
import { useInputAction } from "@/input";
import { CharacterAvatar } from "./CharacterAvatar";
import type { CapitalCharacter } from "../character";
import type { DialogueChoice, DialogueNode } from "../types";
import type { LearningProfileId } from "../learningProfile";
import { resolveProfileText } from "../learningProfile";
import { nextTalkPhase } from "./talkBattleRules";
import {
  CAPITAL_BRAND,
  MONEY_IS_ALIVE_HERE,
  spineShortName,
} from "../titleVoice";
import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "../islandIds";

export type TalkBattleProps = {
  open: boolean;
  npcName: string;
  npcIcon?: string;
  npcTagline?: string;
  player: CapitalCharacter;
  node: DialogueNode;
  learningProfile: LearningProfileId;
  /** Island underfoot — paints Memory courtyard vs organ shores */
  placeId?: string | null;
  onChoice: (choiceId: string) => void;
  onContinue: () => void;
  onSkip: () => void;
};

type Phase = "listen" | "choose";

function stageSky(placeId?: string | null): string {
  const place = placeId ?? HARBOR_HAVEN_ID;
  if (place === HARBOR_HAVEN_ID) {
    // Memory Courtyard — warm harbor day, not a dark duel void
    return "radial-gradient(ellipse 90% 70% at 50% 18%, #7dd3fc 0%, #38bdf8 38%, #0ea5e9 72%, #0c4a6e 100%)";
  }
  if (place === PAYCHECK_PENINSULA_ID) {
    return "radial-gradient(ellipse 90% 70% at 50% 20%, #bae6fd 0%, #38bdf8 45%, #0369a1 100%)";
  }
  if (place === CREDIT_KINGDOM_ID) {
    return "radial-gradient(ellipse 90% 70% at 50% 20%, #ddd6fe 0%, #a78bfa 42%, #5b21b6 100%)";
  }
  if (place === COVE_ISLAND_ID) {
    return "radial-gradient(ellipse 90% 70% at 50% 20%, #fde68a 0%, #fbbf24 40%, #b45309 100%)";
  }
  // Fallback — Memory courtyard
  return "radial-gradient(ellipse 90% 70% at 50% 18%, #7dd3fc 0%, #38bdf8 38%, #0ea5e9 72%, #0c4a6e 100%)";
}

/**
 * Turn-based talk:
 * 1) Listen — NPC line fills the box (Continue)
 * 2) Choose — your reply options (or auto-continue if none)
 * Leave (Esc) abandons the whole encounter — plaza courtesy, not SaaS Skip.
 */
export function TalkBattleScreen({
  open,
  npcName,
  npcIcon = "💬",
  npcTagline,
  player,
  node,
  learningProfile,
  placeId = HARBOR_HAVEN_ID,
  onChoice,
  onContinue,
  onSkip,
}: TalkBattleProps) {
  const [phase, setPhase] = useState<Phase>("listen");
  const choices = node.choices ?? [];
  const body = resolveProfileText(node.text, learningProfile);
  const place = spineShortName(placeId);
  const harbor = !placeId || placeId === HARBOR_HAVEN_ID;

  // Reset to listen whenever the dialogue node changes
  useEffect(() => {
    setPhase("listen");
  }, [node.id]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const advanceFromListen = useCallback(() => {
    const next = nextTalkPhase(node, "listen");
    if (next === "choose") {
      setPhase("choose");
      return;
    }
    onContinue();
  }, [node, onContinue]);

  useInputAction("cancel", onSkip);
  useInputAction("confirm", () => {
    if (phase === "listen") advanceFromListen();
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      data-testid="talk-battle-screen"
      data-place={placeId ?? HARBOR_HAVEN_ID}
      role="dialog"
      aria-modal="true"
      aria-label={`Talk with ${npcName}`}
    >
      {/* Living-money stage — place sky + soft plaza silhouette */}
      <div
        className="absolute inset-0"
        style={{ background: stageSky(placeId) }}
        aria-hidden
      />
      {/* Soft island / courtyard underfoot so talk never reads as a blank app void */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
        aria-hidden
        style={{
          background: harbor
            ? "radial-gradient(ellipse 120% 80% at 50% 100%, #86efac 0%, #4ade80 35%, #16a34a 70%, transparent 100%)"
            : "radial-gradient(ellipse 120% 70% at 50% 100%, rgba(255,255,255,0.35) 0%, rgba(15,23,42,0.15) 55%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[14%] left-1/2 h-[18%] w-[118%] -translate-x-1/2 rounded-[100%]"
        aria-hidden
        style={{
          background: harbor ? "rgba(148,163,184,0.55)" : "rgba(255,255,255,0.22)",
        }}
      />
      {/* Gentle sun / lamp — Memory glow without combat arena rings */}
      <div
        className="pointer-events-none absolute left-[18%] top-[12%] h-24 w-24 rounded-full opacity-40 blur-2xl"
        aria-hidden
        style={{ background: harbor ? "#fde68a" : "#fff7ed" }}
      />

      {/* Brand + place — title voice, not RPG duel chrome */}
      <div className="relative z-10 flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/90 drop-shadow">
            {CAPITAL_BRAND} · {place}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-white/80 drop-shadow">
            {MONEY_IS_ALIVE_HERE}
          </p>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="shrink-0 rounded-full border border-white/35 bg-black/45 px-3.5 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-sm hover:bg-black/60"
          data-testid="talk-battle-skip"
          title="Leave talk (Esc)"
        >
          Leave
        </button>
      </div>

      {/* Arena: NPC top-right, player bottom-left — faces only, no fake HP */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between px-4 pb-2 pt-2 sm:px-8">
        <div className="flex items-start justify-end gap-3">
          <div className="max-w-[14rem] text-right">
            <div className="rounded-2xl bg-[#fef9e7]/95 px-3 py-2 shadow-lg ring-1 ring-black/10">
              <div className="text-sm font-black text-[#16283b]">{npcName}</div>
              {npcTagline ? (
                <div className="text-[11px] font-medium text-[#4b5c6e]">{npcTagline}</div>
              ) : null}
            </div>
          </div>
          <div
            className="flex h-28 w-28 items-center justify-center rounded-full bg-white/25 text-6xl shadow-[0_8px_32px_rgba(15,23,42,0.25)] ring-4 ring-white/40 sm:h-36 sm:w-36 sm:text-7xl"
            aria-hidden
          >
            {npcIcon}
          </div>
        </div>

        <div className="flex items-end justify-start gap-3">
          <div className="relative">
            <div className="rounded-full bg-white/30 p-2 ring-4 ring-white/35 shadow-[0_8px_28px_rgba(15,23,42,0.2)]">
              <CharacterAvatar character={player} size={112} />
            </div>
          </div>
          <div className="max-w-[14rem]">
            <div className="rounded-2xl bg-[#fffdf6]/95 px-3 py-2 shadow-lg ring-1 ring-black/10">
              <div className="text-sm font-black text-[#16283b]">{player.name || "Voyager"}</div>
              <div className="text-[11px] font-medium text-[#4b5c6e]">Listening among living money</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue box */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-3 pb-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border-2 border-[#1c1917]/80 bg-[#fffdf6] shadow-[4px_4px_0_rgba(28,25,23,0.35)]">
          <div className="flex items-center justify-between border-b border-[#e7e5e4] bg-[#fef3c7]/70 px-4 py-2">
            <span className="text-xs font-black uppercase tracking-wide text-[#78350f]">
              {phase === "listen" ? node.speaker || npcName : "Your turn"}
            </span>
            <span className="text-[10px] font-semibold text-[#92400e]/80">
              {phase === "listen" ? "Listening…" : "Choose a reply"}
            </span>
          </div>

          {phase === "listen" ? (
            <div className="space-y-4 px-4 py-4">
              <p className="min-h-[4.5rem] text-base font-medium leading-relaxed text-[#16283b] sm:text-lg">
                {body}
              </p>
              <GameButton
                variant="primary"
                className="w-full"
                onClick={advanceFromListen}
                data-testid="talk-battle-continue"
              >
                {choices.length > 0 ? "Continue ▾" : "Done"}
              </GameButton>
            </div>
          ) : (
            <div className="space-y-2 px-4 py-4">
              <p className="mb-2 text-sm font-medium text-[#4b5c6e] line-clamp-2">{body}</p>
              {choices.map((choice: DialogueChoice) => (
                <GameButton
                  key={choice.id}
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => onChoice(choice.id)}
                  data-testid={`talk-choice-${choice.id}`}
                >
                  {resolveProfileText(choice.text, learningProfile)}
                </GameButton>
              ))}
            </div>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] font-semibold text-white/90 drop-shadow">
          Enter continue · Esc · Leave
        </p>
      </div>
    </div>
  );
}
