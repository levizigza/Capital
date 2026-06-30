import { useMemo } from "react";
import { motion } from "framer-motion";

export type OscilloscopeProps = {
  /** 0–100 tuning dial position */
  dial: number;
  /** Target frequency to lock (0–100) */
  target: number;
  locked: boolean;
  label: string;
};

function wavePath(seed: number, amplitude: number, phase: number, width: number): string {
  const points: string[] = [];
  for (let x = 0; x <= width; x += 4) {
    const t = x / width;
    const y =
      60 +
      Math.sin(t * Math.PI * 4 + phase + seed) * amplitude * 0.6 +
      Math.sin(t * Math.PI * 9 + phase * 1.3) * amplitude * 0.25;
    points.push(`${x === 0 ? "M" : "L"}${x},${y}`);
  }
  return points.join(" ");
}

export function Oscilloscope({ dial, target, locked, label }: OscilloscopeProps) {
  const distance = Math.abs(dial - target);
  const lockStrength = Math.max(0, 1 - distance / 18);
  const amplitude = locked ? 28 : 8 + lockStrength * 20;
  const phase = dial / 100 * Math.PI * 2;

  const mainPath = useMemo(() => wavePath(target * 0.07, amplitude, phase, 320), [target, amplitude, phase]);
  const noisePath = useMemo(
    () => (locked ? "" : wavePath(2.1, 14 - lockStrength * 10, phase + 1, 320)),
    [locked, lockStrength, phase],
  );

  return (
    <div className="lq-oscilloscope">
      <svg viewBox="0 0 320 120" className="w-full h-full" preserveAspectRatio="none">
        {!locked && noisePath ? (
          <path d={noisePath} className="lq-wave lq-wave-noise" />
        ) : null}
        <motion.path
          d={mainPath}
          className={`lq-wave ${locked ? "lq-wave-locked" : ""}`}
          animate={locked ? { opacity: [0.8, 1, 0.8] } : { opacity: 1 }}
          transition={{ duration: 1.2, repeat: locked ? Infinity : 0 }}
        />
      </svg>
      <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[10px] font-mono text-cyan-400/80">
        <span>{label}</span>
        <span>{locked ? "◆ LOCKED" : `△ ${Math.round(lockStrength * 100)}% clarity`}</span>
      </div>
    </div>
  );
}
