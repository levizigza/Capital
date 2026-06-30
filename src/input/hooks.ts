import { useEffect, useMemo } from "react";

import { useInput, useInputOptional } from "./InputContext";
import type { InputActionId, PhysicalBinding } from "./types";
import { formatBindingLabel, resolvePromptPath } from "./prompts/manifest";

export function useInputAction(action: InputActionId, handler: () => void, enabled = true) {
  const ctx = useInputOptional();

  useEffect(() => {
    if (!ctx || !enabled) return;
    return ctx.subscribe(action, handler);
  }, [ctx, action, handler, enabled]);
}

export function usePrimaryBinding(action: InputActionId): PhysicalBinding | null {
  const ctx = useInputOptional();
  const bindings = ctx?.bindings;
  const activeDevice = ctx?.activeDevice ?? "keyboard";

  return useMemo(() => {
    if (!bindings) return null;
    const set = bindings[action];
    if (!set) return null;
    if (activeDevice === "gamepad" && set.gamepad?.[0]) return set.gamepad[0];
    if (activeDevice === "mouse" && set.mouse?.[0]) return set.mouse[0];
    return set.keyboard?.[0] ?? set.mouse?.[0] ?? set.gamepad?.[0] ?? null;
  }, [bindings, action, activeDevice]);
}

export function useInputPrompt(action: InputActionId) {
  const ctx = useInputOptional();
  const binding = usePrimaryBinding(action);

  if (!ctx || !binding) {
    return { src: null, label: "?", binding: null as PhysicalBinding | null };
  }

  const src = resolvePromptPath(
    binding,
    ctx.activeDevice,
    ctx.gamepadLayout,
    ctx.promptTheme
  );
  return { src, label: formatBindingLabel(binding), binding };
}
