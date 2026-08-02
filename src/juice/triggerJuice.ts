/**
 * Imperative juice — SFX + viewport nudge/shake + optional burst particles.
 * Signature cinema (Take → Plinth → share) and fail chrome call this.
 */

import { juiceSfx } from "./juiceSfx";
import { loadJuiceSettings } from "./settings";
import type { JuiceEvent, JuiceLevel, JuiceTriggerOptions } from "./types";

const VIEWPORT_SEL = ".game-viewport, .juice-viewport";
const BURST_EMOJIS = ["✦", "★", "🪙", "✧"];

function prefersReducedMotion(): boolean {
  try {
    return Boolean(
      typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    );
  } catch {
    return false;
  }
}

function effectiveLevel(): JuiceLevel {
  const level = loadJuiceSettings().level;
  if (level === "off") return "off";
  if (prefersReducedMotion()) return "low";
  return level;
}

function viewportEl(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(VIEWPORT_SEL);
}

function pulseClass(el: HTMLElement, cls: string, ms: number) {
  el.classList.remove(cls);
  // Force reflow so re-triggering the same class restarts the animation.
  void el.offsetWidth;
  el.classList.add(cls);
  window.setTimeout(() => el.classList.remove(cls), ms);
}

function spawnBurst(opts: JuiceTriggerOptions, level: JuiceLevel) {
  if (level === "off") return;
  if (level === "low" && !opts.burst) return;
  if (prefersReducedMotion()) return;

  const count = level === "high" ? 8 : 4;
  const originX = opts.x ?? (typeof window !== "undefined" ? window.innerWidth * 0.5 : 0);
  const originY = opts.y ?? (typeof window !== "undefined" ? window.innerHeight * 0.42 : 0);

  for (let i = 0; i < count; i++) {
    const node = document.createElement("span");
    node.className = "juice-burst-particle";
    node.setAttribute("aria-hidden", "true");
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 36 + Math.random() * 70;
    node.style.left = `${originX}px`;
    node.style.top = `${originY}px`;
    node.style.setProperty("--jx", `${Math.cos(angle) * dist}px`);
    node.style.setProperty("--jy", `${Math.sin(angle) * dist - 24}px`);
    node.textContent = BURST_EMOJIS[i % BURST_EMOJIS.length]!;
    document.body.appendChild(node);
    window.setTimeout(() => node.remove(), 700);
  }
}

function bounceTarget(target?: HTMLElement | null) {
  if (!target) return;
  target.classList.remove("juice-ui-bounce");
  void target.offsetWidth;
  target.classList.add("juice-ui-bounce");
  window.setTimeout(() => target.classList.remove("juice-ui-bounce"), 240);
}

/** Fire juice for a named game-feel event. Safe to call outside React. */
export function triggerJuice(event: JuiceEvent, opts: JuiceTriggerOptions = {}): void {
  const level = effectiveLevel();
  if (level === "off") return;

  const vp = viewportEl();

  switch (event) {
    case "accept":
      juiceSfx.playAccept(level);
      bounceTarget(opts.target);
      break;
    case "complete":
      juiceSfx.playComplete(level);
      if (vp && level === "high") pulseClass(vp, "juice-nudge-active", 400);
      spawnBurst(opts, level);
      bounceTarget(opts.target);
      break;
    case "fail":
      juiceSfx.playFail(level);
      if (vp && level === "high") pulseClass(vp, "juice-shake-active", 450);
      break;
    case "reward":
      juiceSfx.playReward(level);
      if (vp && level === "high") pulseClass(vp, "juice-nudge-active", 400);
      spawnBurst({ ...opts, burst: opts.burst ?? true }, level);
      bounceTarget(opts.target);
      break;
    default:
      break;
  }
}

/** Sync data-juice-level onto the live viewport (Settings → Game Feel). */
export function syncJuiceViewportLevel(level?: JuiceLevel): void {
  const vp = viewportEl();
  if (!vp) return;
  const next = level ?? loadJuiceSettings().level;
  vp.dataset.juiceLevel = next;
  vp.classList.add("juice-viewport");
}
