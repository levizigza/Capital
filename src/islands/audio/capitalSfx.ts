/**
 * Lightweight Harbor SFX — Web Audio beeps (no asset pack required).
 * Complements capitalMusic BGM; never blocks UX.
 */

type SfxId = "harbor_cheer" | "scar_chime" | "plinth_hum";

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

export function playCapitalSfx(id: SfxId): void {
  try {
    if (typeof window !== "undefined") {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduced && id !== "scar_chime") return;
    }
    switch (id) {
      case "harbor_cheer":
        tone(523.25, 120, "triangle", 0.05, 0);
        tone(659.25, 140, "triangle", 0.045, 0.08);
        tone(783.99, 180, "sine", 0.04, 0.16);
        break;
      case "scar_chime":
        tone(392, 220, "sine", 0.055, 0);
        tone(587.33, 280, "sine", 0.04, 0.12);
        break;
      case "plinth_hum":
        tone(196, 400, "sine", 0.03, 0);
        break;
      default:
        break;
    }
  } catch {
    /* ignore */
  }
}
