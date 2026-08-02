/**
 * Lightweight Capital SFX — Web Audio beeps (no asset pack required).
 * Complements capitalMusic BGM; never blocks UX.
 * Organ stingers: Memory / Coin / Clock / Spiral.
 */

import type { MoneyOrganId } from "../moneyOrgans";

export type CapitalSfxId =
  | "harbor_cheer"
  | "scar_chime"
  | "plinth_hum"
  | "organ_memory"
  | "organ_coin"
  | "organ_clock"
  | "organ_spiral"
  | "soft_beat"
  /** Irreversible Take mark — not Soft Beat lookout */
  | "take_mark"
  /** Spectacle / share — “Harbor felt that” Memory resolve */
  | "harbor_felt";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  frequency: number,
  durationMs: number,
  type: OscillatorType,
  gain = 0.04,
  when = 0,
): void {
  const ac = getCtx();
  if (!ac) return;
  void ac.resume();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ac.destination);
  const t0 = ac.currentTime + when;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + durationMs / 1000);
  osc.start(t0);
  osc.stop(t0 + durationMs / 1000 + 0.02);
}

const ORGAN_SFX: Record<MoneyOrganId, CapitalSfxId> = {
  memory: "organ_memory",
  coin: "organ_coin",
  clock: "organ_clock",
  spiral: "organ_spiral",
};

export function playOrganSfx(organ: MoneyOrganId): void {
  playCapitalSfx(ORGAN_SFX[organ]);
}

export function playCapitalSfx(id: CapitalSfxId): void {
  try {
    if (typeof window !== "undefined") {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      // Keep scar + organ identity under reduced motion (quieter path via shorter tones below)
      if (reduced && id === "harbor_cheer") return;
    }
    const soft =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const g = soft ? 0.55 : 1;

    switch (id) {
      case "harbor_cheer":
        tone(523.25, 120, "triangle", 0.05 * g, 0);
        tone(659.25, 140, "triangle", 0.045 * g, 0.08);
        tone(783.99, 180, "sine", 0.04 * g, 0.16);
        break;
      case "scar_chime":
        tone(392, 220, "sine", 0.055 * g, 0);
        tone(587.33, 280, "sine", 0.04 * g, 0.12);
        break;
      case "plinth_hum":
        tone(196, 400, "sine", 0.03 * g, 0);
        break;
      case "organ_memory":
        // Warm ledger hum — amber memory
        tone(220, 320, "sine", 0.035 * g, 0);
        tone(330, 380, "triangle", 0.028 * g, 0.1);
        tone(440, 260, "sine", 0.022 * g, 0.22);
        break;
      case "organ_coin":
        // Bright metallic clinks — jar coins
        tone(880, 90, "square", 0.028 * g, 0);
        tone(1174.66, 110, "square", 0.024 * g, 0.07);
        tone(1396.91, 140, "triangle", 0.02 * g, 0.14);
        break;
      case "organ_clock":
        // Tick-tock pressure
        tone(640, 70, "square", 0.03 * g, 0);
        tone(480, 90, "square", 0.028 * g, 0.14);
        tone(640, 70, "square", 0.026 * g, 0.3);
        break;
      case "organ_spiral":
        // Descending interest swirl
        tone(740, 160, "sawtooth", 0.022 * g, 0);
        tone(554, 180, "sawtooth", 0.02 * g, 0.1);
        tone(415, 240, "triangle", 0.024 * g, 0.22);
        tone(311, 300, "sine", 0.02 * g, 0.36);
        break;
      case "soft_beat":
        // Quiet lookout settle — Soft Beat toys only
        tone(523.25, 160, "sine", 0.04 * g, 0);
        tone(392, 280, "triangle", 0.03 * g, 0.12);
        break;
      case "take_mark":
        // Irreversible Take — low hold then bright organ pierce (mute-test beat)
        tone(147, 200, "sine", 0.045 * g, 0);
        tone(196, 240, "triangle", 0.035 * g, 0.08);
        tone(784, 160, "square", 0.028 * g, 0.18);
        tone(988, 220, "triangle", 0.022 * g, 0.28);
        break;
      case "harbor_felt":
        // Memory resolve — warm ledger chord (not trailer cheer arpeggio)
        tone(220, 280, "sine", 0.04 * g, 0);
        tone(277.18, 320, "sine", 0.034 * g, 0.1);
        tone(329.63, 380, "triangle", 0.03 * g, 0.2);
        tone(440, 420, "sine", 0.026 * g, 0.32);
        break;
      default:
        break;
    }
  } catch {
    /* ignore */
  }
}
