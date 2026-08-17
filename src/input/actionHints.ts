/**
 * Binding-aware control copy — never hard-code E / WASD when displaying instructions.
 * Uses saved remaps from financequest_input_v1.
 */

import { DEFAULT_BINDINGS } from "./defaultBindings";
import { formatBindingLabel } from "./prompts/manifest";
import { loadInputSettings } from "./storage";
import type { InputActionId, InputBindingsMap, InputDeviceKind, PhysicalBinding } from "./types";

export type ActionHintContext = {
  bindings: InputBindingsMap;
  device: InputDeviceKind;
};

export function loadActionHintContext(): ActionHintContext {
  const settings = loadInputSettings();
  return { bindings: settings.bindings, device: "keyboard" };
}

function primaryBinding(
  ctx: ActionHintContext,
  action: InputActionId,
): PhysicalBinding | null {
  const set = ctx.bindings[action];
  if (!set) return null;
  if (ctx.device === "gamepad" && set.gamepad?.[0]) return set.gamepad[0];
  if (ctx.device === "mouse" && set.mouse?.[0]) return set.mouse[0];
  return set.keyboard?.[0] ?? set.mouse?.[0] ?? set.gamepad?.[0] ?? null;
}

export function actionBindingLabel(
  action: InputActionId,
  ctx: ActionHintContext = loadActionHintContext(),
): string {
  const binding = primaryBinding(ctx, action);
  if (!binding) return "?";
  return formatBindingLabel(binding);
}

/** Compact move instruction — keyboard remaps, gamepad stick, or walk pad. */
export function formatMovePhrase(ctx: ActionHintContext = loadActionHintContext()): string {
  if (ctx.device === "gamepad") {
    return "left stick · D-pad · or walk pad";
  }
  const codes = new Set<string>();
  for (const id of ["move_up", "move_down", "move_left", "move_right"] as const) {
    const set = ctx.bindings[id];
    for (const b of set?.keyboard ?? []) {
      if (b.type === "keyboard") codes.add(formatBindingLabel(b));
    }
  }
  const keys = [...codes].filter(Boolean);
  const letterKeys = keys.filter((k) => /^[A-Z]$/.test(k));
  const display = letterKeys.length >= 2 ? letterKeys : keys;
  if (display.length === 0) {
    return "move keys · walk pad";
  }
  if (display.length <= 4) {
    return `${display.join(" · ")} · walk pad`;
  }
  return "move keys · walk pad";
}

/** "Talk — E" or "Talk — A" (gamepad) using current interact binding. */
export function formatInteractPhrase(
  opts?: { verb?: string; ctx?: ActionHintContext },
): string {
  const ctx = opts?.ctx ?? loadActionHintContext();
  const label = actionBindingLabel("interact", ctx);
  const verb = opts?.verb ?? "Talk";
  if (ctx.device === "gamepad") {
    return `${verb} · ${label}`;
  }
  return `${verb} · ${label}`;
}

/** Near-NPC bubble: "Press F when you're ready" style without hard-coded E. */
export function formatNearTalkBubble(
  npcName = "Piggy Penny",
  ctx: ActionHintContext = loadActionHintContext(),
): string {
  const label = actionBindingLabel("interact", ctx);
  if (ctx.device === "gamepad") {
    return `${npcName}: Want to talk? ${label} when you're ready.`;
  }
  return `${npcName}: Want to talk? ${label} when you're ready.`;
}

/** Resolve {move} / {interact} placeholders in tutorial strings. */
export function resolveControlPlaceholders(
  text: string,
  ctx: ActionHintContext = loadActionHintContext(),
): string {
  return text
    .replace(/\{move\}/g, formatMovePhrase(ctx))
    .replace(/\{interact\}/g, actionBindingLabel("interact", ctx))
    .replace(/\{interactPhrase\}/g, formatInteractPhrase({ ctx }))
    .replace(/\{map\}/g, actionBindingLabel("map", ctx))
    .replace(/\{cancel\}/g, actionBindingLabel("cancel", ctx));
}

/** Default bindings fallback for tests / SSR. */
export const DEFAULT_HINT_CTX: ActionHintContext = {
  bindings: DEFAULT_BINDINGS,
  device: "keyboard",
};
