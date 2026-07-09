import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

type Props = {
  onComplete: () => void;
};

type Patch = {
  id: string;
  label: string;
  year: string;
  caption: string;
};

/**
 * ONE mural of the same resort, painted six times — once per generation of game
 * graphics (1983 CGA → today). Each vertical slice is a window onto the same
 * continuous panorama, so the pieces lock together into a single picture while
 * each renders that picture in its own era's art style. A real, clock-driven
 * sun/moon arcs across the whole mural and is re-drawn in each era as it crosses.
 */
const PATCHES: Patch[] = [
  { id: "e8bit", label: "1983 · 8-bit CGA", year: "1983", caption: "4 colors, chunky pixels, checkerboard dither" },
  { id: "e16bit", label: "1991 · 16-bit", year: "1991", caption: "Dithered skies, 256 colors, Mode-7 tides" },
  { id: "e3d", label: "1998 · Early 3D", year: "1998", caption: "Warping textures & fog on wobbly polygons" },
  { id: "eflash", label: "2005 · Flash web", year: "2005", caption: "Vector gloss, thick strokes, tween bounce" },
  { id: "ehd", label: "2014 · HD flat", year: "2014", caption: "Material flat design & long shadows" },
  { id: "blank", label: "New Gen", year: "New Gen", caption: "A blank plot — the new gen paints this one" },
];

/* ------------------------------------------------------------------ */
/* Clock-driven celestial body (sun by day, moon by night)            */
/* ------------------------------------------------------------------ */

type Celestial = {
  isDay: boolean;
  x: number; // 0..100 across the whole mural
  y: number; // top %, smaller = higher in the sky
  altitude: number; // 0 at horizon, 1 at zenith
  phase: "dawn" | "day" | "dusk" | "night";
};

const DAY_START = 360; // 06:00
const DAY_END = 1080; // 18:00

function computeCelestial(): Celestial {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const isDay = mins >= DAY_START && mins < DAY_END;

  let t: number;
  if (isDay) {
    t = (mins - DAY_START) / (DAY_END - DAY_START);
  } else {
    const nightLen = 1440 - DAY_END + DAY_START;
    const nm = mins >= DAY_END ? mins - DAY_END : mins + (1440 - DAY_END);
    t = nm / nightLen;
  }

  const clamped = Math.min(Math.max(t, 0), 1);
  const altitude = Math.sin(clamped * Math.PI);
  const x = clamped * 100;
  const y = 46 - altitude * 39;

  let phase: Celestial["phase"] = "night";
  if (isDay) {
    if (t < 0.14) phase = "dawn";
    else if (t > 0.86) phase = "dusk";
    else phase = "day";
  }

  return { isDay, x, y, altitude, phase };
}

function useCelestial(): Celestial {
  const [cel, setCel] = useState<Celestial>(() => computeCelestial());
  useEffect(() => {
    const id = window.setInterval(() => setCel(computeCelestial()), 15000);
    return () => window.clearInterval(id);
  }, []);
  return cel;
}

/* ------------------------------------------------------------------ */
/* Jigsaw clip paths — interlocking tabs/slots at alternating heights  */
/* ------------------------------------------------------------------ */

const PUZZLE_CLIP_IDS = [
  "cap-puzzle-0",
  "cap-puzzle-1",
  "cap-puzzle-2",
  "cap-puzzle-3",
  "cap-puzzle-4",
  "cap-puzzle-5",
] as const;

function PuzzleClipDefs() {
  return (
    <svg className="cap-puzzle-defs" aria-hidden width="0" height="0">
      <defs>
        <clipPath id="cap-puzzle-0" clipPathUnits="objectBoundingBox">
          <path d="M0,0.02 C0.35,0 0.65,0 1,0.02 L1,0.28 C1.14,0.32 1.14,0.4 1,0.44 L1,0.98 C0.65,1 0.35,1 0,0.98 Z" />
        </clipPath>
        <clipPath id="cap-puzzle-1" clipPathUnits="objectBoundingBox">
          <path d="M0,0.02 C0.35,0 0.65,0 1,0.02 L1,0.56 C1.14,0.6 1.14,0.68 1,0.72 L1,0.98 C0.65,1 0.35,1 0,0.98 L0,0.44 C-0.14,0.4 -0.14,0.32 0,0.28 Z" />
        </clipPath>
        <clipPath id="cap-puzzle-2" clipPathUnits="objectBoundingBox">
          <path d="M0,0.02 C0.35,0 0.65,0 1,0.02 L1,0.2 C1.14,0.24 1.14,0.32 1,0.36 L1,0.98 C0.65,1 0.35,1 0,0.98 L0,0.72 C-0.14,0.68 -0.14,0.6 0,0.56 Z" />
        </clipPath>
        <clipPath id="cap-puzzle-3" clipPathUnits="objectBoundingBox">
          <path d="M0,0.02 C0.35,0 0.65,0 1,0.02 L1,0.48 C1.14,0.52 1.14,0.6 1,0.64 L1,0.98 C0.65,1 0.35,1 0,0.98 L0,0.36 C-0.14,0.32 -0.14,0.24 0,0.2 Z" />
        </clipPath>
        <clipPath id="cap-puzzle-4" clipPathUnits="objectBoundingBox">
          <path d="M0,0.02 C0.35,0 0.65,0 1,0.02 L1,0.34 C1.14,0.38 1.14,0.46 1,0.5 L1,0.98 C0.65,1 0.35,1 0,0.98 L0,0.64 C-0.14,0.6 -0.14,0.52 0,0.48 Z" />
        </clipPath>
        <clipPath id="cap-puzzle-5" clipPathUnits="objectBoundingBox">
          <path d="M0,0.02 C0.35,0 0.65,0 1,0.02 L1,0.98 C0.65,1 0.35,1 0,0.98 L0,0.5 C-0.14,0.46 -0.14,0.38 0,0.34 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The shared mural — identical layout, era-specific rendering         */
/* ------------------------------------------------------------------ */

function MuralScene({ era, cel }: { era: string; cel: Celestial }) {
  return (
    <div className={`mural mural--${era}`} aria-hidden>
      <div className="m-sky" />
      <div className="m-stars" />
      <div className="m-clouds" />

      <div
        className={`m-cel ${cel.isDay ? "m-cel--sun" : "m-cel--moon"}`}
        style={{ left: `${cel.x}%`, top: `${cel.y}%` }}
      >
        <div className="m-cel-glow" />
        <div className="m-cel-core" />
        <div className="m-cel-flare" />
      </div>

      <div className="m-hills" />
      <div className="m-sea" />
      <div className="m-sea-glint" />
      <div className="m-beach" />

      <div className="m-palm m-palm--a">
        <div className="m-palm-trunk" />
        <div className="m-palm-crown" />
      </div>
      <div className="m-hotel">
        <div className="m-hotel-roof" />
        <div className="m-hotel-windows" />
      </div>
      <div className="m-pool" />
      <div className="m-palm m-palm--b">
        <div className="m-palm-trunk" />
        <div className="m-palm-crown" />
      </div>
      <div className="m-dock" />
      <div className="m-boat">
        <div className="m-boat-sail" />
      </div>

      <div className="m-fx" />
    </div>
  );
}

function IslandPatch({
  patch,
  pieceIndex,
  cel,
  spotlight,
  dimmed,
  assembled,
}: {
  patch: Patch;
  pieceIndex: number;
  cel: Celestial;
  spotlight: boolean;
  dimmed: boolean;
  assembled: boolean;
}) {
  const clipId = PUZZLE_CLIP_IDS[pieceIndex] ?? PUZZLE_CLIP_IDS[0];

  return (
    <div
      className={[
        "isle-patch",
        `isle-patch--${patch.id}`,
        `isle-patch--piece-${pieceIndex}`,
        spotlight ? "is-spot" : "",
        dimmed ? "is-dim" : "",
        assembled ? "is-assembled" : "is-floating",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--piece-i": pieceIndex,
          clipPath: `url(#${clipId})`,
          WebkitClipPath: `url(#${clipId})`,
        } as React.CSSProperties
      }
    >
      <div
        className="mural-window"
        style={{ width: "600%", left: `${-pieceIndex * 100}%` }}
      >
        <MuralScene era={patch.id} cel={cel} />
      </div>

      <div className="isle-patch__seam" aria-hidden />
      <div className="isle-patch__year">{patch.year}</div>
      <div className="isle-patch__tag">{patch.label}</div>
    </div>
  );
}

export function CapitalOpeningIntro({ onComplete }: Props) {
  const reduced = useReducedMotion();
  const cel = useCelestial();
  const [stage, setStage] = useState<number | "settle" | "reveal">(0);
  const [entering, setEntering] = useState(false);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 16, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 16, mass: 0.6 });
  const bgX = useTransform(sx, (v) => v * 14);
  const bgY = useTransform(sy, (v) => v * 8);
  const fgX = useTransform(sx, (v) => v * -22);
  const fgY = useTransform(sy, (v) => v * -12);

  const handlePointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduced) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      px.set(nx);
      py.set(ny);
    },
    [px, py, reduced],
  );

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem("capital_intro_seen_v1", "1");
    } catch {
      /* ignore */
    }
    onComplete();
  }, [onComplete]);

  const enter = useCallback(() => {
    if (entering) return;
    setEntering(true);
    window.setTimeout(finish, reduced ? 250 : 950);
  }, [entering, finish, reduced]);

  const sweepMs = 700;
  useEffect(() => {
    const timers: number[] = [];
    PATCHES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStage(i), 600 + i * sweepMs));
    });
    const afterSweep = 600 + PATCHES.length * sweepMs;
    timers.push(window.setTimeout(() => setStage("settle"), afterSweep));
    timers.push(window.setTimeout(() => setStage("reveal"), afterSweep + 700));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [sweepMs]);

  const isReveal = stage === "reveal";
  const isAssembled = stage === "settle" || isReveal;
  const sweeping = typeof stage === "number";
  const currentPatch = sweeping ? PATCHES[stage] : null;

  const timeLabel = useMemo(() => {
    const map = { dawn: "Dawn", day: "Midday sun", dusk: "Dusk", night: "Moonlit" };
    return map[cel.phase];
  }, [cel.phase]);

  return (
    <motion.div
      className={`cap-opening-root cap-opening-grain${isReveal ? " cap-opening-root--revealed" : ""}${isAssembled ? " cap-opening-root--assembled" : ""}`}
      data-phase={cel.phase}
      role="dialog"
      aria-label="Welcome to Capital"
      onPointerMove={handlePointer}
      initial={{ opacity: 1 }}
      animate={{ opacity: entering ? 0 : 1 }}
      transition={{ duration: reduced ? 0.25 : 0.85, ease: "easeInOut" }}
    >
      <motion.div className="cap-bg-layer" style={{ x: bgX, y: bgY }} aria-hidden>
        <div className="cap-sky" />
      </motion.div>

      <div className="cap-sea" aria-hidden />

      <motion.div className="cap-fg-layer" style={{ x: fgX, y: fgY }}>
        <PuzzleClipDefs />
        <motion.div
          className="cap-isle-wrap"
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.3 : 0.9, type: "spring", stiffness: 120 }}
        >
          <div className="cap-isle cap-isle--puzzle">
            {PATCHES.map((patch, i) => (
              <IslandPatch
                key={patch.id}
                patch={patch}
                pieceIndex={i}
                cel={cel}
                spotlight={sweeping && stage === i}
                dimmed={sweeping && stage !== i}
                assembled={isAssembled}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      <div className="cap-opening-vignette" />

      <AnimatePresence>
        {entering && !reduced ? (
          <motion.div
            className="cap-sail-away"
            aria-hidden
            initial={{ bottom: "16%", opacity: 1, scale: 1 }}
            animate={{ bottom: "52%", opacity: 0, scale: 0.35 }}
            transition={{ duration: 0.95, ease: "easeIn" }}
          >
            ⛵
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isReveal && !entering ? (
          <motion.div
            className="cap-opening-reveal"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.25 : 0.6 }}
          >
            <div className="cap-opening-reveal__plate">
              <div className="cap-opening-eyebrow">
                One resort, every era · 1983 → now · {timeLabel.toLowerCase()}
              </div>
              <h1 className="cap-opening-title">
                Capital
                <span
                  className="ml-2 inline-block h-[0.5em] w-[0.5em] -translate-y-[0.06em] rounded-sm"
                  style={{ background: "var(--cap-gold, #f4a629)" }}
                />
              </h1>
              <p className="mt-3 max-w-md text-sm text-white/80 md:text-base">
                One mural of humans and games — painted six times, once per
                generation of graphics. The last piece is blank, waiting for the
                new gen to paint their own.
              </p>
              <div className="cap-enter">
                <button type="button" className="cap-enter-boat" onClick={enter} autoFocus>
                  <span className="cap-enter-boat__icon" aria-hidden>
                    ⛵
                  </span>
                  Set sail to enter
                </button>
                <span className="cap-enter-hint">Click the boat to come ashore</span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!isReveal && !entering ? (
        <div className="cap-opening-caption">
          {currentPatch ? `${currentPatch.year} — ${currentPatch.caption}` : "One mural, painted piece by piece"}
        </div>
      ) : null}
    </motion.div>
  );
}

export function hasSeenCapitalIntro(): boolean {
  if (typeof window === "undefined") return true;
  if (new URLSearchParams(window.location.search).get("replayIntro") === "1") return false;
  try {
    return sessionStorage.getItem("capital_intro_seen_v1") === "1";
  } catch {
    return false;
  }
}

export function markCapitalIntroSeen(): void {
  try {
    sessionStorage.setItem("capital_intro_seen_v1", "1");
  } catch {
    /* ignore */
  }
}
