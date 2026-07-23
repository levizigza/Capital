/**
 * Capital Music — Howler-backed BGM with gentle crossfades.
 * Unlocks after first user gesture (browser autoplay policy).
 */

import { Howl } from "howler";
import {
  SOUNDTRACK,
  type MusicCueId,
  type MusicPlace,
  cueForPlace,
} from "./soundtrackCatalog";

const STORAGE_KEY = "capital_music_v1";

type MusicPrefs = {
  enabled: boolean;
  volume: number; // 0–1 master
};

const DEFAULT_PREFS: MusicPrefs = {
  enabled: true,
  volume: 0.42,
};

function loadPrefs(): MusicPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<MusicPrefs>;
    return {
      enabled: parsed.enabled !== false,
      volume: typeof parsed.volume === "number" ? Math.min(1, Math.max(0, parsed.volume)) : DEFAULT_PREFS.volume,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function savePrefs(p: MusicPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function assetUrl(rel: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const cleaned = rel.replace(/^\//, "");
  return `${base}${cleaned}`;
}

class CapitalMusic {
  private prefs: MusicPrefs = loadPrefs();
  private current: Howl | null = null;
  private currentCue: MusicCueId | null = null;
  private fadingOut: Howl | null = null;
  private unlocked = false;
  private pendingCue: MusicCueId | null = null;
  private listeners = new Set<() => void>();

  constructor() {
    if (typeof window !== "undefined") {
      const unlock = () => this.unlock();
      window.addEventListener("pointerdown", unlock, { once: true, capture: true });
      window.addEventListener("keydown", unlock, { once: true, capture: true });
    }
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) fn();
  }

  isEnabled(): boolean {
    return this.prefs.enabled;
  }

  getVolume(): number {
    return this.prefs.volume;
  }

  getCurrentCue(): MusicCueId | null {
    return this.currentCue;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  setEnabled(enabled: boolean): void {
    this.prefs.enabled = enabled;
    savePrefs(this.prefs);
    if (!enabled) this.stop(true);
    else if (this.pendingCue) this.playCue(this.pendingCue);
    else if (this.currentCue) this.playCue(this.currentCue);
    this.emit();
  }

  setVolume(volume: number): void {
    this.prefs.volume = Math.min(1, Math.max(0, volume));
    savePrefs(this.prefs);
    if (this.current && this.currentCue) {
      const track = SOUNDTRACK[this.currentCue];
      this.current.volume(this.prefs.volume * (track.gain ?? 0.5));
    }
    this.emit();
  }

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    if (this.pendingCue && this.prefs.enabled) {
      const cue = this.pendingCue;
      this.pendingCue = null;
      this.playCue(cue);
    }
    this.emit();
  }

  playPlace(place: MusicPlace): void {
    const cue = cueForPlace(place);
    if (!cue) {
      this.stop(false);
      return;
    }
    this.playCue(cue);
  }

  playCue(cue: MusicCueId): void {
    this.pendingCue = cue;
    if (!this.prefs.enabled) {
      this.emit();
      return;
    }
    if (!this.unlocked) {
      this.emit();
      return;
    }
    if (this.currentCue === cue && this.current?.playing()) return;

    const track = SOUNDTRACK[cue];
    const url = assetUrl(track.file);
    const targetVol = this.prefs.volume * (track.gain ?? 0.5);

    // Crossfade out previous
    if (this.current) {
      const prev = this.current;
      this.fadingOut?.unload();
      this.fadingOut = prev;
      prev.fade(prev.volume(), 0, 900);
      window.setTimeout(() => {
        try {
          prev.stop();
          prev.unload();
        } catch {
          /* ignore */
        }
        if (this.fadingOut === prev) this.fadingOut = null;
      }, 1000);
    }

    const howl = new Howl({
      src: [url],
      loop: true,
      volume: 0,
      html5: true, // stream large OGGs; friendlier on mobile
      onloaderror: () => {
        console.warn("[capital-music] failed to load", cue, url);
      },
    });
    this.current = howl;
    this.currentCue = cue;
    howl.play();
    howl.fade(0, targetVol, 1100);
    this.emit();
  }

  stop(immediate = false): void {
    this.pendingCue = null;
    this.currentCue = null;
    if (!this.current) {
      this.emit();
      return;
    }
    const cur = this.current;
    this.current = null;
    if (immediate) {
      cur.stop();
      cur.unload();
    } else {
      cur.fade(cur.volume(), 0, 700);
      window.setTimeout(() => {
        try {
          cur.stop();
          cur.unload();
        } catch {
          /* ignore */
        }
      }, 800);
    }
    this.emit();
  }
}

export const capitalMusic = new CapitalMusic();
