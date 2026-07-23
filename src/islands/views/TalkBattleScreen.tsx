/**
 * Talk Battle — Pokémon-style conversation stage.
 * Full-screen: just you and them until the turn-based convo ends (or you Skip).
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

export type TalkBattleProps = {
  open: boolean;
  npcName: string;
  npcIcon?: string;
  npcTagline?: string;
  player: CapitalCharacter;
  node: DialogueNode;
  learningProfile: LearningProfileId;
  onChoice: (choiceId: string) => void;
  onContinue: () => void;
  onSkip: () => void;
};

type Phase = "listen" | "choose";

/**
 * Turn-based talk:
 * 1) Listen — NPC line fills the box (Continue)
 * 2) Choose — your reply options (or auto-continue if none)
 * Skip abandons the whole encounter.
 */
export function TalkBattleScreen({
  open,
  npcName,
  npcIcon = "💬",
  npcTagline,
  player,
  node,
  learningProfile,
  onChoice,
  onContinue,
  onSkip,
}: TalkBattleProps) {
  const [phase, setPhase] = useState<Phase>("listen");
  const choices = node.choices ?? [];
  const body = resolveProfileText(node.text, learningProfile);

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
      role="dialog"
      aria-modal="true"
      aria-label={`Talk with ${npcName}`}
    >
      {/* Stage backdrop — ocean ledger duel arena */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, #1d4f6e 0%, #0b2a3c 45%, #071820 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255,255,255,0.04) 12px)",
        }}
      />

      {/* Skip */}
      <div className="relative z-10 flex items-start justify-between px-4 pt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-100/70">
          Talk Battle
        </p>
        <GameButton
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="bg-black/35 text-white hover:bg-black/50"
          data-testid="talk-battle-skip"
        >
          Skip ▸
        </GameButton>
      </div>

      {/* Arena: NPC top-right, player bottom-left */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between px-4 pb-2 pt-2 sm:px-8">
        <div className="flex items-start justify-end gap-3">
          <div className="max-w-[14rem] text-right">
            <div className="rounded-2xl bg-[#fef9e7]/95 px-3 py-2 shadow-lg ring-1 ring-black/10">
              <div className="text-sm font-black text-[#16283b]">{npcName}</div>
              {npcTagline ? (
                <div className="text-[11px] font-medium text-[#4b5c6e]">{npcTagline}</div>
              ) : null}
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#dbe4ea]">
                <div className="h-full w-[88%] rounded-full bg-[#2dd4bf]" />
              </div>
            </div>
          </div>
          <div
            className="flex h-28 w-28 items-center justify-center rounded-full bg-[#0ea5e9]/25 text-6xl shadow-[0_0_40px_rgba(14,165,233,0.35)] ring-4 ring-white/25 sm:h-36 sm:w-36 sm:text-7xl"
            aria-hidden
          >
            {npcIcon}
          </div>
        </div>

        <div className="flex items-end justify-start gap-3">
          <div className="relative">
            <div className="rounded-full bg-[#f4a629]/25 p-2 ring-4 ring-white/20 shadow-[0_0_36px_rgba(244,166,41,0.3)]">
              <CharacterAvatar character={player} size={112} />
            </div>
          </div>
          <div className="max-w-[14rem]">
            <div className="rounded-2xl bg-[#e8f6ff]/95 px-3 py-2 shadow-lg ring-1 ring-black/10">
              <div className="text-sm font-black text-[#16283b]">{player.name || "Voyager"}</div>
              <div className="text-[11px] font-medium text-[#4b5c6e]">Ready to listen</div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#dbe4ea]">
                <div className="h-full w-full rounded-full bg-[#f4a629]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue box */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-3 pb-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border-2 border-[#0f766e] bg-[#f8fafc] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#cce3e0] bg-[#ecfdf5] px-4 py-2">
            <span className="text-xs font-black uppercase tracking-wide text-[#0f766e]">
              {phase === "listen" ? node.speaker || npcName : "Your turn"}
            </span>
            <span className="text-[10px] font-semibold text-[#5b7a78]">
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
        <p className="mt-2 text-center text-[10px] font-semibold text-white/55">
          Enter continue · Esc skip
        </p>
      </div>
    </div>
  );
}
