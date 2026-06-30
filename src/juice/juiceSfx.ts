import type { JuiceLevel } from "./types";

/** Web Audio stingers — no external files required. */
class JuiceSynth {
  private ctx: AudioContext | null = null;

  private ac(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    slideTo?: number
  ) {
    try {
      const ctx = this.ac();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideTo != null) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + duration);
      }
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      /* silent */
    }
  }

  private chord(freqs: number[], volume: number) {
    freqs.forEach((f, i) => this.tone(f, 0.18, "sine", volume * 0.7, undefined));
  }

  playAccept(level: JuiceLevel) {
    if (level === "off") return;
    const v = level === "low" ? 0.06 : 0.1;
    this.tone(660, 0.06, "sine", v);
  }

  playComplete(level: JuiceLevel) {
    if (level === "off") return;
    const v = level === "low" ? 0.05 : 0.12;
    this.chord([523.25, 659.25, 783.99], v);
    window.setTimeout(() => this.tone(1046.5, 0.12, "sine", v * 0.8), 80);
  }

  playFail(level: JuiceLevel) {
    if (level === "off" || level === "low") return;
    this.tone(180, 0.08, "square", 0.08, 120);
    window.setTimeout(() => this.tone(140, 0.14, "sawtooth", 0.06), 60);
  }

  playReward(level: JuiceLevel) {
    if (level === "off") return;
    const v = level === "low" ? 0.05 : 0.09;
    this.tone(880, 0.05, "square", v, 1320);
  }
}

const synth = new JuiceSynth();

export const juiceSfx = {
  playAccept: (level: JuiceLevel) => synth.playAccept(level),
  playComplete: (level: JuiceLevel) => synth.playComplete(level),
  playFail: (level: JuiceLevel) => synth.playFail(level),
  playReward: (level: JuiceLevel) => synth.playReward(level),
};
