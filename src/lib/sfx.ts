import { Howl } from 'howler';

// Create sound effects with fallback to prevent errors when files don't exist
function createSfx(src: string, volume: number = 0.5): Howl | null {
  try {
    return new Howl({ 
      src: [src], 
      volume,
      onloaderror: () => {
        console.warn(`Sound file not found: ${src}`)
      }
    });
  } catch (e) {
    console.warn(`Failed to create sound: ${src}`)
    return null;
  }
}

// Synthetic sound generation using Web Audio API as fallback
class SynthSfx {
  private audioContext: AudioContext | null = null;
  
  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }
  
  playClick() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Silently fail
    }
  }
  
  playSuccess() {
    try {
      const ctx = this.getContext();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.2);
      });
    } catch (e) {
      // Silently fail
    }
  }
  
  playError() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 200;
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Silently fail
    }
  }
  
  playCoin() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1);
      osc.type = 'square';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // Silently fail
    }
  }
  
  playPop() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Silently fail
    }
  }
}

const synthSfx = new SynthSfx();

// Wrapper that uses Howl if available, otherwise falls back to synth
class SfxWrapper {
  private howl: Howl | null;
  private synthMethod: () => void;
  
  constructor(howl: Howl | null, synthMethod: () => void) {
    this.howl = howl;
    this.synthMethod = synthMethod;
  }
  
  play() {
    if (this.howl) {
      try {
        this.howl.play();
      } catch (e) {
        this.synthMethod();
      }
    } else {
      this.synthMethod();
    }
  }
}

export const sfx = {
  click: new SfxWrapper(null, () => synthSfx.playClick()),
  success: new SfxWrapper(null, () => synthSfx.playSuccess()),
  error: new SfxWrapper(null, () => synthSfx.playError()),
  coin: new SfxWrapper(null, () => synthSfx.playCoin()),
  pop: new SfxWrapper(null, () => synthSfx.playPop()),
};
