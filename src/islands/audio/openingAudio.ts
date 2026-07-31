/**
 * Opening title foley — Web Audio bed + stingers for the Capital mural.
 * Complements capitalMusic BGM; respects reduced-motion (fewer / quieter hits)
 * and the same music enabled preference as capitalMusic.
 */

import { capitalMusic } from "./capitalMusic";

type OpeningFoleyId =
  | "surf_bed"
  | "piece_lock"
  | "mural_settle"
  | "title_reveal"
  | "board_carpet"
  | "stop_bed";

let ctx: AudioContext | null = null;
let surfNodes: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

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

function reducedMotion(): boolean {
  return Boolean(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
}

function tone(
  ac: AudioContext,
  frequency: number,
  durationMs: number,
  type: OscillatorType,
  gain = 0.04,
  when = 0,
): void {
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

function makeNoiseBuffer(ac: AudioContext, seconds = 2): AudioBuffer {
  const rate = ac.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ac.createBuffer(1, len, rate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.35;
  }
  return buf;
}

function startSurfBed(ac: AudioContext): void {
  stopSurfBed();
  const src = ac.createBufferSource();
  src.buffer = makeNoiseBuffer(ac, 2.5);
  src.loop = true;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.7;
  const gain = ac.createGain();
  gain.gain.value = 0;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  src.start();
  const now = ac.currentTime;
  const bedGain = (reducedMotion() ? 0.012 : 0.028) * Math.min(1, Math.max(0.35, capitalMusic.getVolume() / 0.42));
  gain.gain.linearRampToValueAtTime(bedGain, now + 1.2);
  // Gentle wave motion via filter
  filter.frequency.setValueAtTime(380, now);
  filter.frequency.linearRampToValueAtTime(520, now + 4);
  filter.frequency.linearRampToValueAtTime(380, now + 8);
  surfNodes = { src, gain };
}

function stopSurfBed(): void {
  if (!surfNodes) return;
  const { src, gain } = surfNodes;
  const ac = getCtx();
  try {
    if (ac) {
      gain.gain.cancelScheduledValues(ac.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ac.currentTime + 0.45);
    }
    window.setTimeout(() => {
      try {
        src.stop();
      } catch {
        /* ignore */
      }
    }, 500);
  } catch {
    /* ignore */
  }
  surfNodes = null;
}

/** Phase-synced title foley. Safe to spam; never throws into UX. */
export function playOpeningFoley(id: OpeningFoleyId, pieceIndex = 0): void {
  try {
    if (id === "stop_bed") {
      stopSurfBed();
      return;
    }
    if (!capitalMusic.isEnabled()) {
      stopSurfBed();
      return;
    }
    const ac = getCtx();
    if (!ac) return;
    void ac.resume();
    const soft = reducedMotion();
    const volScale = Math.min(1, Math.max(0.35, capitalMusic.getVolume() / 0.42));

    switch (id) {
      case "surf_bed":
        startSurfBed(ac);
        // Soft welcome pad under the surf
        if (!soft) {
          tone(ac, 130.81, 1800, "sine", 0.018 * volScale, 0);
          tone(ac, 196.0, 1600, "triangle", 0.012 * volScale, 0.15);
          tone(ac, 261.63, 1400, "sine", 0.01 * volScale, 0.35);
        }
        break;
      case "piece_lock": {
        const base = 220 + pieceIndex * 28;
        tone(ac, base, soft ? 80 : 110, "triangle", (soft ? 0.02 : 0.035) * volScale, 0);
        tone(ac, base * 1.5, soft ? 70 : 90, "sine", (soft ? 0.012 : 0.022) * volScale, 0.04);
        break;
      }
      case "mural_settle":
        tone(ac, 196.0, 280, "sine", 0.04 * volScale, 0);
        tone(ac, 246.94, 320, "triangle", 0.032 * volScale, 0.08);
        tone(ac, 392.0, 400, "sine", 0.028 * volScale, 0.16);
        break;
      case "title_reveal":
        tone(ac, 261.63, 180, "triangle", 0.045 * volScale, 0);
        tone(ac, 329.63, 220, "sine", 0.04 * volScale, 0.1);
        tone(ac, 392.0, 280, "triangle", 0.035 * volScale, 0.2);
        tone(ac, 523.25, 420, "sine", 0.03 * volScale, 0.32);
        break;
      case "board_carpet":
        // Bill flutter + coin
        tone(ac, 180, 90, "sawtooth", 0.02 * volScale, 0);
        tone(ac, 320, 120, "triangle", 0.028 * volScale, 0.05);
        tone(ac, 520, 160, "sine", 0.04 * volScale, 0.12);
        tone(ac, 780, 200, "sine", 0.025 * volScale, 0.22);
        stopSurfBed();
        break;
      default:
        break;
    }
  } catch {
    /* ignore */
  }
}
