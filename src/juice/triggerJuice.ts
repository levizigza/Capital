/**
 * Imperative juice — SFX + viewport nudge/shake + optional burst particles.
 * Signature cinema (Take → Plinth → share) and fail chrome call this.
 * Layer flags let actionFeedback stack Capital SFX without double beeps.
 */

import { prefersReducedMotion } from "@/islands/a11yMotion";
import { juiceSfx } from "./juiceSfx";
import { loadJuiceSettings } from "./settings";
import type { JuiceEvent, JuiceLevel, JuiceTriggerOptions } from "./types";

const VIEWPORT_SEL = ".game-viewport, .juice-viewport";
const BURST_EMOJIS = ["✦", "★", "🪙", "✧"];

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
  void el.offsetWidth;
  el.classList.add(cls);
  window.setTimeout(() => el.classList.remove(cls), ms);
}

function spawnBurst(opts: JuiceTriggerOptions, level: JuiceLevel) {
  if (level === "off") return;
  if (level === "low" && !opts.burst) return;
  if (prefersReducedMotion()) return;
  if (opts.layers?.burst === false) return;

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
  if (!target || prefersReducedMotion()) return;
  target.classList.remove("juice-ui-bounce");
  void target.offsetWidth;
  target.classList.add("juice-ui-bounce");
  window.setTimeout(() => target.classList.remove("juice-ui-bounce"), 240);
}

function layerOn(
  opts: JuiceTriggerOptions,
  key: "sfx" | "motion" | "burst" | "shake",
  fallback: boolean,
): boolean {
  const v = opts.layers?.[key];
  return v === undefined ? fallback : v;
}

/** Fire juice for a named game-feel event. Safe to call outside React. */
export function triggerJuice(event: JuiceEvent, opts: JuiceTriggerOptions = {}): void {
  const level = effectiveLevel();
  if (level === "off") return;

  const vp = viewportEl();
  const sfx = layerOn(opts, "sfx", true);
  const motion = layerOn(opts, "motion", true);

  switch (event) {
    case "accept":
      if (sfx) juiceSfx.playAccept(level);
      if (motion) bounceTarget(opts.target);
      break;
    case "complete":
      if (sfx) juiceSfx.playComplete(level);
      if (motion && vp && level === "high") pulseClass(vp, "juice-nudge-active", 400);
      if (layerOn(opts, "burst", true)) spawnBurst(opts, level);
      if (motion) bounceTarget(opts.target);
      break;
    case "fail":
      if (sfx) juiceSfx.playFail(level);
      if (layerOn(opts, "shake", level === "high") && vp && level === "high") {
        pulseClass(vp, "juice-shake-active", 450);
      }
      break;
    case "reward":
      if (sfx) juiceSfx.playReward(level);
      if (motion && vp && level === "high") pulseClass(vp, "juice-nudge-active", 400);
      if (layerOn(opts, "burst", opts.burst ?? true)) {
        spawnBurst({ ...opts, burst: opts.burst ?? true }, level);
      }
      if (motion) bounceTarget(opts.target);
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
