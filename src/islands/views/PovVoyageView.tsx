import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { UserProfile } from "@/App";
import type { IslandDefinition, IslandSaveV1 } from "../types";
import { getIslandTheme, type IslandTheme } from "../themes/islandThemes";
import { getBoatTier } from "../boats";

type Props = {
  userProfile: UserProfile;
  islands: IslandDefinition[];
  save: IslandSaveV1;
  onBack: () => void;
  onEnterIsland: (islandId: string) => void;
};

type Cadence = "normal" | "faster";

type WorldIsland = {
  island: IslandDefinition;
  theme: IslandTheme;
  x: number;
  y: number;
};

const FOV = 1.95; // ~112° field of view
const NORMAL_MAX = 165; // world units / sec
const FASTER_MAX = 330;
const TURN_RATE = 1.5; // rad / sec
const ARRIVE_DIST = 120;
const KNOTS_MAX = 60;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function normAngle(a: number) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/**
 * First-person POV voyage — you stand on your island, walk to the paddle boat,
 * then row across open water toward other islands. A speedometer shows your
 * knots and you can row at a normal or faster cadence.
 */
export function PovVoyageView({ userProfile, islands, save, onBack, onEnterIsland }: Props) {
  const [phase, setPhase] = useState<"beach" | "sail">("beach");
  const [cadence, setCadence] = useState<Cadence>("normal");
  const [arriving, setArriving] = useState<string | null>(null);

  const boatTier = getBoatTier(userProfile.totalCoins);

  const currentIsland = useMemo(
    () => islands.find((i) => i.id === save.currentIslandId) ?? null,
    [islands, save.currentIslandId],
  );

  // Lay out destination islands around the boat in world space.
  const world = useMemo<WorldIsland[]>(() => {
    const available = islands.filter((i) => {
      if (i.id === save.currentIslandId) return false;
      const missing = (i.requiredItems || []).some((id) => !save.inventory.includes(id));
      return !missing;
    });
    const list = available.length
      ? available
      : islands.filter((i) => i.id !== save.currentIslandId);
    const n = Math.max(1, list.length);
    return list.map((island, idx) => {
      // Fan the islands mostly ahead of the bow, spread across the horizon.
      const spread = ((idx + 0.5) / n - 0.5) * FOV * 1.5;
      const jitter = ((idx * 53) % 17) / 17 - 0.5;
      const bearing = spread + jitter * 0.25;
      const dist = 620 + ((idx * 173) % 620);
      return {
        island,
        theme: getIslandTheme(island.id, island.themeId),
        x: Math.sin(bearing) * dist,
        y: -Math.cos(bearing) * dist,
      };
    });
  }, [islands, save.currentIslandId, save.inventory]);

  // --- Live simulation refs (avoid re-renders per frame) --------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boat = useRef({ x: 0, y: 0, heading: 0, speed: 0 });
  const steer = useRef(0); // -1 left, +1 right
  const cadenceRef = useRef<Cadence>("normal");
  const arrivedRef = useRef(false);
  const waveScroll = useRef(0);
  const oarPhase = useRef(0);

  // HUD element refs (updated imperatively each frame)
  const knotsRef = useRef<HTMLSpanElement | null>(null);
  const needleRef = useRef<SVGGElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    cadenceRef.current = cadence;
  }, [cadence]);

  const board = useCallback(() => setPhase("sail"), []);

  // Keyboard steering + cadence
  useEffect(() => {
    if (phase !== "sail") return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") steer.current = -1;
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") steer.current = 1;
      else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        cadenceRef.current = "faster";
        setCadence("faster");
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        cadenceRef.current = "normal";
        setCadence("normal");
      } else if (e.key === "Escape") onBack();
    };
    const up = (e: KeyboardEvent) => {
      if (["ArrowLeft", "a", "A", "ArrowRight", "d", "D"].includes(e.key)) steer.current = 0;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [phase, onBack]);

  // Main render + physics loop
  useEffect(() => {
    if (phase !== "sail") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const drawPalm = (x: number, baseY: number, s: number, trunk: string, leaf: string) => {
      ctx.strokeStyle = trunk;
      ctx.lineWidth = Math.max(1, s * 0.09);
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.quadraticCurveTo(x - s * 0.1, baseY - s * 0.5, x + s * 0.06, baseY - s);
      ctx.stroke();
      const top = { x: x + s * 0.06, y: baseY - s };
      ctx.fillStyle = leaf;
      for (let i = 0; i < 5; i++) {
        const ang = -Math.PI / 2 + (i - 2) * 0.62;
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.quadraticCurveTo(
          top.x + Math.cos(ang) * s * 0.4,
          top.y + Math.sin(ang) * s * 0.4,
          top.x + Math.cos(ang) * s * 0.7,
          top.y + Math.sin(ang) * s * 0.7 + s * 0.08,
        );
        ctx.quadraticCurveTo(
          top.x + Math.cos(ang) * s * 0.4,
          top.y + Math.sin(ang) * s * 0.4 + s * 0.06,
          top.x,
          top.y,
        );
        ctx.fill();
      }
    };

    const drawIsland = (wi: WorldIsland, sx: number, baseY: number, size: number, fade: number) => {
      const t = wi.theme;
      ctx.save();
      ctx.globalAlpha = fade;
      // land mound
      const landW = size;
      const landH = size * 0.42;
      ctx.fillStyle = "#e7cf95";
      ctx.beginPath();
      ctx.ellipse(sx, baseY, landW * 0.5, landH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // green cap
      ctx.fillStyle = t.accent || "#3fae6b";
      ctx.beginPath();
      ctx.ellipse(sx, baseY - landH * 0.18, landW * 0.4, landH * 0.4, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      // palm
      if (size > 46) drawPalm(sx, baseY - landH * 0.15, size * 0.4, "#7a5230", "#2f9e57");
      // icon flag
      if (size > 30) {
        ctx.font = `${Math.round(size * 0.28)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(wi.island.icon, sx, baseY - landH * 0.05);
      }
      // name label
      if (size > 20) {
        const label = wi.island.name;
        ctx.font = `700 ${clamp(11, size * 0.14, 20)}px "Space Grotesk", sans-serif`;
        const w = ctx.measureText(label).width + 16;
        const ly = baseY - size * 0.62;
        ctx.fillStyle = "rgba(12,22,34,0.72)";
        ctx.beginPath();
        const r = 8;
        const lx = sx - w / 2;
        ctx.moveTo(lx + r, ly);
        ctx.arcTo(lx + w, ly, lx + w, ly + 22, r);
        ctx.arcTo(lx + w, ly + 22, lx, ly + 22, r);
        ctx.arcTo(lx, ly + 22, lx, ly, r);
        ctx.arcTo(lx, ly, lx + w, ly, r);
        ctx.fill();
        ctx.fillStyle = "#ffe9b8";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, sx, ly + 11);
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const b = boat.current;
      const cad = cadenceRef.current;
      const targetSpeed = cad === "faster" ? FASTER_MAX : NORMAL_MAX;
      // ease toward target speed (rowing cadence)
      b.speed += (targetSpeed - b.speed) * Math.min(1, dt * 1.8);
      // steering (a touch less agile at speed)
      b.heading += steer.current * TURN_RATE * dt * (1 - Math.min(0.35, b.speed / 900));
      // advance
      b.x += Math.sin(b.heading) * b.speed * dt;
      b.y -= Math.cos(b.heading) * b.speed * dt;

      waveScroll.current += b.speed * dt;
      oarPhase.current += dt * (cad === "faster" ? 7.5 : 4.2);

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const horizon = h * 0.46;

      // --- sky ---
      const sky = ctx.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, "#ffe3a0");
      sky.addColorStop(0.5, "#ffd07a");
      sky.addColorStop(1, "#bfe6f0");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, horizon);
      // sun
      const sunX = cx - Math.sin(b.heading) * w * 0.25;
      ctx.fillStyle = "rgba(255,236,170,0.95)";
      ctx.beginPath();
      ctx.arc(clamp(40, sunX, w - 40), horizon * 0.42, Math.min(60, w * 0.07), 0, Math.PI * 2);
      ctx.fill();

      // --- sea ---
      const sea = ctx.createLinearGradient(0, horizon, 0, h);
      sea.addColorStop(0, "#4fd8e6");
      sea.addColorStop(0.4, "#17a8c9");
      sea.addColorStop(1, "#0c5f8c");
      ctx.fillStyle = sea;
      ctx.fillRect(0, horizon, w, h - horizon);

      // perspective wave rows scrolling toward the viewer
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 26; i++) {
        const p = (i + (waveScroll.current * 0.02) % 1) / 26;
        const y = horizon + Math.pow(p, 2.2) * (h - horizon);
        const sway = Math.sin((y + waveScroll.current) * 0.05) * 6 * p;
        ctx.lineWidth = 0.5 + p * 2;
        ctx.globalAlpha = 0.15 + p * 0.35;
        ctx.beginPath();
        ctx.moveTo(0, y + sway);
        ctx.lineTo(w, y - sway);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // --- islands (painter's order: far → near) ---
      const projected = world
        .map((wi) => {
          const dx = wi.x - b.x;
          const dy = wi.y - b.y;
          const dist = Math.hypot(dx, dy);
          const worldBearing = Math.atan2(dx, -dy);
          const rel = normAngle(worldBearing - b.heading);
          return { wi, dist, rel };
        })
        .sort((a, z) => z.dist - a.dist);

      let nearest: { name: string; dist: number; rel: number } | null = null;
      const halfFov = FOV / 2;
      for (const p of projected) {
        if (!nearest || p.dist < nearest.dist)
          nearest = { name: p.wi.island.name, dist: p.dist, rel: p.rel };
        if (Math.abs(p.rel) > halfFov * 1.2) continue;
        const sx = cx + (p.rel / halfFov) * (w * 0.5);
        const size = clamp(10, 44000 / p.dist, 380);
        const baseY = horizon + size * 0.08;
        const fade = clamp(0.25, 1 - p.dist / 1800, 1);
        drawIsland(p.wi, sx, baseY, size, fade);

        // arrival
        if (p.dist < ARRIVE_DIST && Math.abs(p.rel) < 0.9 && !arrivedRef.current) {
          arrivedRef.current = true;
          running = false;
          setArriving(p.wi.island.name);
          window.setTimeout(() => onEnterIsland(p.wi.island.id), 950);
        }
      }

      // --- foreground: paddle boat bow + oars ---
      drawBow(ctx, w, h, oarPhase.current, b.speed);

      // --- HUD updates (imperative) ---
      const knots = clamp(0, Math.round(b.speed / (FASTER_MAX / KNOTS_MAX)), 99);
      if (knotsRef.current) knotsRef.current.textContent = String(knots);
      if (needleRef.current) {
        const ang = -90 + (knots / KNOTS_MAX) * 180;
        needleRef.current.setAttribute("transform", `rotate(${ang} 100 92)`);
      }
      if (headingRef.current) {
        const deg = Math.round(((b.heading * 180) / Math.PI + 360) % 360);
        headingRef.current.textContent = `${String(deg).padStart(3, "0")}°`;
      }
      if (hintRef.current && nearest) {
        const side = nearest.rel < -0.12 ? "◀ turn left" : nearest.rel > 0.12 ? "turn right ▶" : "▲ straight on";
        hintRef.current.textContent = `${nearest.name} · ${Math.round(nearest.dist)}m · ${side}`;
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [phase, world, onEnterIsland]);

  // ---- BEACH PHASE: first-person, walk to the paddle boat -----------------
  if (phase === "beach") {
    return (
      <div className="povv-beach relative h-full w-full overflow-hidden">
        <button type="button" className="povv-back" onClick={onBack}>
          ← Back
        </button>

        <div className="povv-beach-sky" />
        <div className="povv-beach-sea" />
        <div className="povv-beach-sand" />

        <div className="relative z-10 mx-auto flex h-full max-w-lg flex-col items-center justify-end pb-[14vh] text-center">
          <div className="povv-paddle-boat" aria-hidden>
            🛶
          </div>
          <div className="povv-dock-arrow" aria-hidden>
            ⬇
          </div>
          <div className="mb-4 max-w-sm rounded-2xl bg-[rgba(12,22,34,0.6)] px-5 py-3 text-white backdrop-blur">
            <div className="cap-eyebrow text-white/80">
              {currentIsland ? `On ${currentIsland.name}` : "On your island"}
            </div>
            <p className="mt-1 text-sm text-white/90">
              Your <b>{boatTier.label.toLowerCase()}</b> is waiting at the shore. Board it and row out to
              the other islands.
            </p>
          </div>
          <button type="button" className="povv-board-btn" onClick={board} autoFocus>
            🛶 Board the paddle boat
          </button>
        </div>
      </div>
    );
  }

  // ---- SAIL PHASE: first-person open-water rowing --------------------------
  return (
    <div className="povv-root relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="povv-canvas" />

      {/* top bar */}
      <button type="button" className="povv-back" onClick={onBack}>
        ← Shore
      </button>
      <div className="povv-compass">
        <div ref={hintRef} className="povv-compass__hint">
          Find an island
        </div>
        <div className="povv-compass__heading">
          HDG <span ref={headingRef}>000°</span>
        </div>
      </div>

      {/* speedometer */}
      <div className="povv-speedo">
        <svg viewBox="0 0 200 118" width="150" height="90">
          <path d="M20 92 A80 80 0 0 1 180 92" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" strokeLinecap="round" />
          <path d="M20 92 A80 80 0 0 1 100 12" fill="none" stroke="#12b3a6" strokeWidth="10" strokeLinecap="round" />
          <path d="M100 12 A80 80 0 0 1 180 92" fill="none" stroke="#f4a629" strokeWidth="10" strokeLinecap="round" />
          <g ref={needleRef} transform="rotate(-90 100 92)">
            <line x1="100" y1="92" x2="100" y2="28" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          </g>
          <circle cx="100" cy="92" r="7" fill="#16283b" stroke="#fff" strokeWidth="2" />
        </svg>
        <div className="povv-speedo__readout">
          <span ref={knotsRef}>0</span>
          <small>kn</small>
        </div>
      </div>

      {/* cadence control */}
      <div className="povv-cadence">
        <button
          type="button"
          className={cadence === "normal" ? "is-active" : ""}
          onClick={() => setCadence("normal")}
        >
          🚣 Normal
        </button>
        <button
          type="button"
          className={cadence === "faster" ? "is-active" : ""}
          onClick={() => setCadence("faster")}
        >
          💨 Faster
        </button>
      </div>

      {/* steering */}
      <button
        type="button"
        className="povv-steer povv-steer--l"
        aria-label="Steer left"
        onPointerDown={() => (steer.current = -1)}
        onPointerUp={() => (steer.current = 0)}
        onPointerLeave={() => (steer.current = 0)}
      >
        ◀
      </button>
      <button
        type="button"
        className="povv-steer povv-steer--r"
        aria-label="Steer right"
        onPointerDown={() => (steer.current = 1)}
        onPointerUp={() => (steer.current = 0)}
        onPointerLeave={() => (steer.current = 0)}
      >
        ▶
      </button>

      {arriving ? (
        <div className="povv-arrive">
          <div className="povv-arrive__card">
            <div className="text-3xl">🏝️</div>
            <div className="cap-display text-xl text-white">Land ho!</div>
            <p className="text-sm text-white/80">Coming ashore at {arriving}…</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Draw the paddle-boat bow and rowing oars in the foreground. */
function drawBow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  oar: number,
  speed: number,
) {
  const cx = w / 2;
  // oars stroke amplitude scales a bit with speed
  const amp = 0.4 + Math.min(0.25, speed / 1200);
  const swing = Math.sin(oar) * amp;

  // left + right oars
  for (const dir of [-1, 1]) {
    ctx.save();
    const pivotX = cx + dir * w * 0.16;
    const pivotY = h * 0.82;
    ctx.translate(pivotX, pivotY);
    ctx.rotate(dir * (0.5 + swing));
    ctx.strokeStyle = "#8a5a2b";
    ctx.lineWidth = Math.max(5, w * 0.012);
    ctx.lineCap = "round";
    const len = w * 0.26;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, len);
    ctx.stroke();
    // blade
    ctx.fillStyle = "#a56b34";
    ctx.beginPath();
    ctx.ellipse(0, len, w * 0.02, w * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
    // splash near blade when the oar dips
    if (Math.sin(oar) * dir > 0.3) {
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(0, len, w * 0.02 * (0.6 + Math.random() * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // wooden hull bow (paddle boat) — a rounded trapezoid at the very bottom
  const bowTop = h * 0.86;
  const grad = ctx.createLinearGradient(0, bowTop, 0, h);
  grad.addColorStop(0, "#b5813f");
  grad.addColorStop(1, "#7c5427");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.34, h);
  ctx.quadraticCurveTo(cx - w * 0.2, bowTop, cx, bowTop);
  ctx.quadraticCurveTo(cx + w * 0.2, bowTop, cx + w * 0.34, h);
  ctx.closePath();
  ctx.fill();
  // plank seams + rim
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.34, h);
  ctx.quadraticCurveTo(cx - w * 0.2, bowTop, cx, bowTop);
  ctx.quadraticCurveTo(cx + w * 0.2, bowTop, cx + w * 0.34, h);
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 2;
  for (let i = 1; i <= 2; i++) {
    const yy = bowTop + (h - bowTop) * (i / 3);
    ctx.beginPath();
    ctx.moveTo(cx - w * (0.2 + i * 0.05), yy);
    ctx.quadraticCurveTo(cx, yy - 6, cx + w * (0.2 + i * 0.05), yy);
    ctx.stroke();
  }
}
