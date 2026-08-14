/**
 * Talk Battle — conversation stage among living money.
 * Full-screen: just you and them until the turn-based convo ends (or you Leave).
 * Fantasy law: Voyager among Money Mascots — never combat HP bars or a sterile void.
 */

import { useCallback, useEffect, useRef, useState } from "react";
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
import { moneyOrganForIsland } from "../moneyOrgans";
import { organVerbChip } from "../worldMemory";
import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "../islandIds";
import { pointerSafeActivate } from "../pointerSafeClick";
import { playActionFeedback } from "../actionFeedback";

/** Opening click (Talk CTA) must not land on I hear you / Walk on in the same gesture. */
const TALK_INPUT_ARM_MS = 220;

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

function organAccent(placeId?: string | null): string {
  const organ = moneyOrganForIsland(placeId)?.id;
  if (organ === "coin") return "#fbbf24";
  if (organ === "clock") return "#38bdf8";
  if (organ === "spiral") return "#a78bfa";
  return "#fde68a";
}

/**
 * Turn-based talk:
 * 1) Listen — NPC line fills the box
 * 2) Choose — your reply options (or walk on if none)
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
  const inputArmed = useRef(false);
  const choices = node.choices ?? [];
  const body = resolveProfileText(node.text, learningProfile);
  const place = spineShortName(placeId);
  const harbor = !placeId || placeId === HARBOR_HAVEN_ID;
  const organ = moneyOrganForIsland(placeId);
  const organChip = organ ? organVerbChip(organ.id) : null;
  const accent = organAccent(placeId);

  // Reset to listen whenever the dialogue node changes
  useEffect(() => {
    setPhase("listen");
  }, [node.id]);

  useEffect(() => {
    if (!open) {
      inputArmed.current = false;
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Arm after the opening Talk gesture finishes — keeps first listen readable.
    inputArmed.current = false;
    const arm = window.setTimeout(() => {
      inputArmed.current = true;
    }, TALK_INPUT_ARM_MS);
    return () => {
      window.clearTimeout(arm);
      document.body.style.overflow = prev;
      inputArmed.current = false;
    };
  }, [open]);

  const advanceFromListen = useCallback(() => {
    if (!inputArmed.current) return;
    const next = nextTalkPhase(node, "listen");
    if (next === "choose") {
      setPhase("choose");
      return;
    }
    onContinue();
  }, [node, onContinue]);

  const chooseReply = useCallback(
    (choiceId: string) => {
      if (!inputArmed.current) return;
      playActionFeedback("talk_choice");
      onChoice(choiceId);
    },
    [onChoice],
  );

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
      data-organ={organ?.id ?? "memory"}
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
        style={{ background: accent }}
      />

      {/* Brand + organ — title voice, not RPG duel chrome */}
      <div className="relative z-10 flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/90 drop-shadow">
            {CAPITAL_BRAND} · {place}
            {organChip ? (
              <span data-testid="talk-battle-organ"> · {organChip}</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-white/80 drop-shadow">
            {MONEY_IS_ALIVE_HERE}
          </p>
        </div>
        <button
          type="button"
          {...pointerSafeActivate(onSkip)}
          className="shrink-0 touch-manipulation rounded-xl border-2 border-white/40 bg-black/45 px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.35)] backdrop-blur-sm hover:bg-black/60"
          data-testid="talk-battle-leave"
          title="Leave talk (Esc)"
        >
          Leave
        </button>
      </div>

      {/* Compact stage — dialogue stays above the fold on short viewports */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between gap-2 px-4 pb-1 pt-1 sm:px-8">
        <div className="flex items-start justify-end gap-2">
          <div className="max-w-[12rem] text-right sm:max-w-[14rem]">
            <div className="rounded-2xl bg-[#fef9e7]/95 px-3 py-1.5 shadow-lg ring-1 ring-black/10">
              <div className="text-sm font-black text-[#16283b]">{npcName}</div>
              {npcTagline ? (
                <div className="text-[11px] font-medium text-[#4b5c6e]">{npcTagline}</div>
              ) : null}
            </div>
          </div>
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white/25 text-5xl shadow-[0_8px_32px_rgba(15,23,42,0.25)] ring-4 ring-white/40 sm:h-28 sm:w-28 sm:text-6xl"
            aria-hidden
            style={{ boxShadow: `0 8px 32px rgba(15,23,42,0.25), 0 0 0 4px ${accent}55` }}
          >
            {npcIcon}
          </div>
        </div>

        <div className="flex items-end justify-start gap-2">
          <div className="relative">
            <div className="rounded-full bg-white/30 p-1.5 ring-4 ring-white/35 shadow-[0_8px_28px_rgba(15,23,42,0.2)] sm:p-2">
              <CharacterAvatar character={player} size={88} />
            </div>
          </div>
          <div className="max-w-[12rem] sm:max-w-[14rem]">
            <div className="rounded-2xl bg-[#fffdf6]/95 px-3 py-1.5 shadow-lg ring-1 ring-black/10">
              <div className="text-sm font-black text-[#16283b]">{player.name || "Voyager"}</div>
              <div className="text-[11px] font-medium text-[#4b5c6e]">
                {organChip
                  ? `Listening · ${organChip}`
                  : "Listening among living money"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue pinned low — replies always in the first job of the viewport */}
      <div className="relative z-20 mx-auto w-full max-w-3xl shrink-0 px-3 pb-3 sm:px-6">
        <div
          className="overflow-hidden rounded-2xl border-2 border-[#1c1917]/80 bg-[#fffdf6] shadow-[4px_4px_0_rgba(28,25,23,0.35)]"
          style={{ borderTopColor: accent }}
        >
          <div
            className="flex items-center justify-between border-b border-[#e7e5e4] px-4 py-2"
            style={{ background: `${accent}33` }}
          >
            <span className="text-xs font-black uppercase tracking-wide text-[#78350f]">
              {phase === "listen" ? node.speaker || npcName : "Your reply"}
            </span>
            <span className="text-[10px] font-semibold text-[#92400e]/80">
              {phase === "listen" ? "Listening…" : "Speak among living money"}
            </span>
          </div>

          {phase === "listen" ? (
            <div className="space-y-3 px-4 py-3">
              <p className="max-h-[28vh] overflow-y-auto text-base font-medium leading-relaxed text-[#16283b] sm:text-lg">
                {body}
              </p>
              <button
                type="button"
                className="min-h-12 w-full touch-manipulation rounded-2xl border-2 border-[#1c1917] px-4 py-3 text-base font-black text-[#1c1917] shadow-[3px_3px_0_#1c1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                style={{ background: accent }}
                {...pointerSafeActivate(advanceFromListen)}
                data-testid="talk-battle-continue"
              >
                {choices.length > 0 ? "I hear you ▾" : "Walk on"}
              </button>
            </div>
          ) : (
            <div className="max-h-[42vh] space-y-2 overflow-y-auto px-4 py-3">
              <p className="mb-1 text-sm font-medium text-[#4b5c6e] line-clamp-2">{body}</p>
              {choices.map((choice: DialogueChoice) => (
                <button
                  key={choice.id}
                  type="button"
                  className="min-h-12 w-full touch-manipulation rounded-2xl border-2 border-[#1c1917]/70 bg-white px-4 py-3 text-left text-sm font-bold text-[#16283b] shadow-[2px_2px_0_rgba(28,25,23,0.2)] hover:bg-[#fffbeb] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  style={{ borderLeftWidth: 6, borderLeftColor: accent }}
                  {...pointerSafeActivate(() => chooseReply(choice.id))}
                  data-testid={`talk-choice-${choice.id}`}
                >
                  {resolveProfileText(choice.text, learningProfile)}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] font-semibold text-white/90 drop-shadow">
          Enter listen · Esc · Leave
        </p>
      </div>
    </div>
  );
}
