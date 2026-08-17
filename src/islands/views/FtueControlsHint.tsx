/**
 * FTUE control hints — binding-aware, multi-channel (icon + text label).
 */

import { cn } from "@/lib/utils";
import { InputPrompt, useInputOptional, useInputPrompt } from "@/input";
import {
  formatMovePhrase,
  type ActionHintContext,
} from "@/input/actionHints";
import type { InputActionId } from "@/input/types";
import { useMemo } from "react";

function hintCtxFromInput(): ActionHintContext | null {
  const ctx = useInputOptional();
  if (!ctx) return null;
  return {
    bindings: ctx.bindings,
    device: ctx.activeDevice,
  };
}

type HintProps = {
  className?: string;
  showMap?: boolean;
  /** Short whisper under mobile HUD */
  compact?: boolean;
};

/** Harbor / shore whisper: move · talk · optional map */
export function MoveTalkMapHint({ className, showMap = false, compact = false }: HintProps) {
  const inputCtx = hintCtxFromInput();
  const move = useMemo(
    () => (inputCtx ? formatMovePhrase(inputCtx) : "move keys · walk pad"),
    [inputCtx],
  );
  const interact = useInputPrompt("interact");
  const map = useInputPrompt("map");

  if (compact) {
    return (
      <span className={cn("inline-flex flex-wrap items-center justify-center gap-1", className)}>
        <span>{move}</span>
        <span aria-hidden>·</span>
        <InputPrompt action="interact" size="sm" />
        <span>talk</span>
        {showMap ? (
          <>
            <span aria-hidden>·</span>
            <InputPrompt action="map" size="sm" />
            <span>map</span>
          </>
        ) : null}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center justify-center gap-1.5", className)}>
      <span>{move}</span>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <InputPrompt action="interact" size="sm" aria-hidden={false} />
        <span>talk{interact.label !== "?" ? ` (${interact.label})` : ""}</span>
      </span>
      {showMap ? (
        <>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <InputPrompt action="map" size="sm" />
            <span>map{map.label !== "?" ? ` (${map.label})` : ""}</span>
          </span>
        </>
      ) : null}
    </span>
  );
}

type ActionRowProps = {
  action: InputActionId;
  label: string;
  className?: string;
};

export function BoundActionHint({ action, label, className }: ActionRowProps) {
  const { label: keyLabel } = useInputPrompt(action);
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <InputPrompt action={action} size="sm" />
      <span>
        {label}
        {keyLabel !== "?" ? ` (${keyLabel})` : ""}
      </span>
    </span>
  );
}
