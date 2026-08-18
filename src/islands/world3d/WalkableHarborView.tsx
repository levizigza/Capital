import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

import type { CapitalCharacter } from "../character";
import { VoyagerMesh, HarborNpcMesh } from "./VoyagerMesh";
import { getMascot, isSeriesLeadMascot, varyMascot } from "../moneyCast";
import { colorHex, type MoneyForm } from "../character";
import { SafeText } from "./SafeText";
import {
  buildHarborNpcLives,
  currentHarborHour,
  harborNpcPose,
  NPC_TALK_RADIUS,
  type HarborNpcLife,
} from "../harborNpcLives";
import { HarborBehaviorNpc } from "../npcBehavior/NpcBrainViews";
import type { Vec3 } from "../npcBehavior";
import { getEraLook3D } from "./eraLooks";
import { WorldLighting } from "./WorldLighting";
import { OceanWater } from "./OceanWater";
import { EraIslandMesh } from "./EraIslandMesh";
import { WoodenPier, NatureProps } from "./NatureProps";
import { hotspotPlazaYaw } from "../harborPlazaPlan";
import { pointerSafeActivate } from "../pointerSafeClick";
import { LedgerBankLandmark } from "./LedgerBankLandmark";
import {
  MoneyCarpetGate,
  OutfitterPavilion,
  ArcadePavilion,
  HarborNoticeBoard,
  MemoryPlinthMesh,
  HarborSignpost,
} from "./HarborLandmarks";
import {
  PlazaTier,
  CoinEyePath,
  ShoreBerms,
  HarborBanners,
  HarborFlags,
  UtilityQuay,
  EastUtilityLedge,
  PlazaToyCoins,
  PierMouthFrame,
} from "./HarborPlazaCraft";
import { plazaLifeAmp } from "../a11yMotion";
import { OrganLedgerLines } from "./OrganShoreMotifs";
import { buildIslandTerrain, islandSeedFromId } from "./islandTerrain";
import { clearTouchWalkIntent, mergeWalkIntent } from "../input/walkIntent";
import { stepWalkVelocity } from "../input/walkFeel";
import { playCapitalSfx } from "../audio/capitalSfx";
import { KENNEY_ENABLED } from "./kenneyFlag";
import { MoneyBagGuide, guideTargetForHighlight } from "./MoneyBagGuide";
import { GuideProjector } from "../views/GuideWayfinder";
import type { GuideProjection } from "../views/GuideWayfinder";
import type { NpcEmote } from "../story/dialogueActionSync";
import { HARBOR_KEEPER_MASCOT_ID } from "../story/hubGuidedIntro";
import { isKilled, reportHarborReady, shouldDegradeForBudget } from "@/sre";
import { HarborMythFallback } from "../views/HarborMythFallback";
import type { HarborFallbackMode } from "../harborFirstMeet";
import {
  ENTER_HARBOR_HAVEN,
  HARBOR_LOADING_ASHORE,
  HARBOR_LOADING_HINT,
  HARBOR_LOADING_SLOW,
} from "../titleVoice";
import { HARBOR_PIGGY_POS } from "../moneyCast";
import {
  HARBOR_3D_FAIL_KEY,
  HARBOR_3D_OK_KEY,
  HARBOR_CANVAS_WATCHDOG_MS,
  HARBOR_DEFER_BEFORE_PROBE_MS,
  HARBOR_HARD_FAILSAFE_MS,
  HARBOR_LOAD_HINT_MS,
} from "./harborLoadFailsafe";
import { prefersReducedMotion } from "../a11yMotion";
import { scarOrganName } from "../worldMemory";

export type HarborLandmarkKind =
  | "building"
  | "money_structure"
  | "carpet_gate"
  | "outfitter"
  | "arcade"
  | "notice_board"
  | "plinth"
  | "signpost";

export type HarborHotspot = {
  id: string;
  label: string;
  icon: string;
  position: [number, number, number];
  /** Plaza craft — unique silhouettes; signpost for utilities */
  kind?: HarborLandmarkKind;
  /** Signpost accent color */
  accent?: string;
  /**
   * Planned façade yaw (radians). Civic buildings use harborPlazaPlan so doors
   * face the court from a setback — never auto-yaw a vault into the fountain.
   */
  yaw?: number;
};

type Props = {
  character?: CapitalCharacter | null;
  hotspots: HarborHotspot[];
  onHotspot: (id: string) => void;
  onOpenTravel: () => void;
  /** Lift near-store state into the HUD so Enter is clickable above the footer. */
  onNearChange?: (id: string | null, label: string | null) => void;
  /** Ambient Money Mascot chat when walking near a local. */
  onNearNpc?: (npc: { id: string; name: string; line: string } | null) => void;
  /** Castle Grounds guide — Coin Bag hops toward this highlight */
  guideHighlight?: "outfitter" | "capsule" | "travel" | "practice" | "guide" | "pavilion" | string;
  /** Direct world look-at (wins over highlight when set) — keeps buddy pointing after tutorial */
  guideLookAt?: [number, number, number] | null;
  guideTip?: string;
  /** Piggy body language — must match coach/dialogue claims */
  keeperEmote?: NpcEmote;
  /** Speech bubble over Piggy (3D) — same words as HUD when near */
  keeperSpeech?: string | null;
  /** Hotspot that pulses so "go here" is visible */
  pulseHotspotId?: string | null;
  /** Soft wayfinder — Coin Bag point + off-screen edge cue (mute for free roam) */
  guideArrows?: boolean;
  onGuideProject?: (p: GuideProjection | null) => void;
  /** Freeze WASD / Enter / M while Talk Battle owns the screen */
  inputFrozen?: boolean;
  /**
   * Scar spectacle / Plinth afterglow — lock camera on Memory Plinth
   * (look-at + optional dedicated eye). World cinema, not player follow.
   */
  cinemaFocus?: [number, number, number] | null;
  cinemaEye?: [number, number, number] | null;
  /** Stronger Plinth scar lamp during spectacle lock */
  plinthSpectacleActive?: boolean;
  /** Cashflow weather — soft fog density */
  weatherFog?: { near: number; far: number } | null;
  /** Per-NPC Talk Battle memory for ambient greetings */
  npcMemory?: Record<string, { talks?: number; lastChoiceIds?: string[] }> | null;
  /** Latest plaque echo so plaza locals name the scar (day-2 / organ memory) */
  scarEcho?: {
    label: string;
    dayOffset: "same" | "later";
    organ?: import("../moneyOrgans").MoneyOrganId;
  } | null;
  /** Slow-device composition — myth first, never a hotspot dashboard */
  fallbackMode?: HarborFallbackMode;
  onFallbackTalkPiggy?: () => void;
  onFallbackEnterBank?: () => void;
  /**
   * First meet / quiet homecoming — hide series lead (Cashwell) so Piggy
   * owns the one-job plaza beat.
   */
  piggyPresenceBeat?: boolean;
  /** Plaza playable flag (3D ready or myth) — gates signature cinema; false while veiled. */
  onPlazaReady?: (ready: boolean) => void;
  /** Spectacle / share / day-2 — myth path stays a quiet Memory stage, not Piggy meet. */
  cinemaActive?: boolean;
};

const LOOK = getEraLook3D("capital-default");
const SPEED = 6.5;
const INTERACT_R = 2.85;
const PLAZA_R = 16;

/** Soft first-meet spawn — near Piggy, west of Memory Plinth so E never opens the shelf. */
const FIRST_MEET_SPAWN: [number, number, number] = [-0.35, 0.02, 0.55];
const DEFAULT_SPAWN: [number, number, number] = [0, 0.02, 3];

function Player({
  character,
  hotspots,
  npcBodies,
  onNear,
  onNearNpc,
  playerPosOut,
  inputFrozen = false,
  cinemaFocus = null,
  cinemaEye = null,
  softMeetSpawn = false,
}: {
  character?: CapitalCharacter | null;
  hotspots: HarborHotspot[];
  /** Live Unity-Behavior agent bodies (updated each frame by HarborBehaviorNpc) */
  npcBodies: MutableRefObject<Map<string, { position: Vec3; line: string; name: string }>>;
  onNear: (id: string | null) => void;
  onNearNpc: (npc: { id: string; name: string; line: string } | null) => void;
  playerPosOut: MutableRefObject<THREE.Vector3>;
  inputFrozen?: boolean;
  cinemaFocus?: [number, number, number] | null;
  cinemaEye?: [number, number, number] | null;
  softMeetSpawn?: boolean;
}) {
  const spawn = softMeetSpawn ? FIRST_MEET_SPAWN : DEFAULT_SPAWN;
  const group = useRef<THREE.Group>(null);
  const keys = useRef({ f: false, b: false, l: false, r: false });
  /** Stable orbit yaw — does not flip when walking backward. */
  const camYaw = useRef(Math.PI);
  const facing = useRef(Math.PI);
  const vel = useRef(new THREE.Vector3());
  const { camera } = useThree();
  const moving = useRef(false);
  const nearNpcRef = useRef<string | null>(null);
  const frozenRef = useRef(inputFrozen);
  frozenRef.current = inputFrozen;
  const cinemaFocusRef = useRef(cinemaFocus);
  cinemaFocusRef.current = cinemaFocus;
  const cinemaEyeRef = useRef(cinemaEye);
  cinemaEyeRef.current = cinemaEye;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (frozenRef.current) return;
      if (e.key === "w" || e.key === "ArrowUp") keys.current.f = true;
      if (e.key === "s" || e.key === "ArrowDown") keys.current.b = true;
      if (e.key === "a" || e.key === "ArrowLeft") keys.current.l = true;
      if (e.key === "d" || e.key === "ArrowRight") keys.current.r = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "ArrowUp") keys.current.f = false;
      if (e.key === "s" || e.key === "ArrowDown") keys.current.b = false;
      if (e.key === "a" || e.key === "ArrowLeft") keys.current.l = false;
      if (e.key === "d" || e.key === "ArrowRight") keys.current.r = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    if (inputFrozen) {
      keys.current = { f: false, b: false, l: false, r: false };
      clearTouchWalkIntent();
      moving.current = false;
    }
  }, [inputFrozen]);

  useFrame((_, dt) => {
    if (!group.current) return;
    const p = group.current.position;
    if (frozenRef.current) {
      playerPosOut.current.set(p.x, p.y, p.z);
      const focus = cinemaFocusRef.current;
      if (focus) {
        const eye = cinemaEyeRef.current;
        const ideal = eye
          ? new THREE.Vector3(eye[0], eye[1], eye[2])
          : new THREE.Vector3(focus[0] - 2.8, 3.6, focus[2] + 5.0);
        camera.position.lerp(ideal, 1 - Math.pow(0.00055, dt));
        camera.lookAt(focus[0], focus[1], focus[2]);
        return;
      }
      // Keep camera framing while frozen
      const back = 8.5;
      const camH = 4.9;
      const ideal = new THREE.Vector3(
        p.x - Math.sin(camYaw.current) * back,
        camH,
        p.z - Math.cos(camYaw.current) * back,
      );
      camera.position.lerp(ideal, 1 - Math.pow(0.0015, dt));
      camera.lookAt(p.x, 1.25, p.z);
      return;
    }
    const k = mergeWalkIntent(keys.current);
    const turn = (Number(k.l) - Number(k.r)) * 2.2 * dt;
    camYaw.current += turn;

    const forward = Number(k.f) - Number(k.b);
    if (Math.abs(forward) > 0.01) {
      facing.current = forward >= 0 ? camYaw.current : camYaw.current + Math.PI;
    }
    const stepped = stepWalkVelocity(
      { x: vel.current.x, z: vel.current.z },
      { forward, yaw: camYaw.current, dt, speed: SPEED },
    );
    vel.current.set(stepped.vel.x, 0, stepped.vel.z);
    p.x += vel.current.x * dt;
    p.z += vel.current.z * dt;
    moving.current = stepped.moving || Math.abs(turn) > 0.001;
    if (stepped.justStopped) {
      playCapitalSfx("walk_stop");
    }
    group.current.rotation.y = facing.current;
    playerPosOut.current.set(p.x, p.y, p.z);

    const r = Math.hypot(p.x, p.z);
    if (r > PLAZA_R) {
      p.x *= PLAZA_R / r;
      p.z *= PLAZA_R / r;
    }
    p.y = 0.02;

    let near: string | null = null;
    let best = INTERACT_R;
    let nearDoor: { x: number; z: number } | null = null;
    for (const h of hotspots) {
      const hx = h.position[0];
      const hz = h.position[2];
      const len = Math.hypot(hx, hz) || 1;
      const doorX = hx - (hx / len) * 1.35;
      const doorZ = hz - (hz / len) * 1.35;
      const reach = h.kind === "money_structure" ? INTERACT_R * 1.65 : INTERACT_R;
      const d = Math.hypot(doorX - p.x, doorZ - p.z);
      if (d < reach && d < best) {
        best = d;
        near = h.id;
        nearDoor = { x: doorX, z: doorZ };
      }
    }
    onNear(near);

    let npcNear: { id: string; name: string; line: string; position: Vec3 } | null = null;
    let npcBest = NPC_TALK_RADIUS;
    if (!near) {
      for (const [id, body] of npcBodies.current) {
        const d = Math.hypot(body.position[0] - p.x, body.position[2] - p.z);
        if (d < npcBest) {
          npcBest = d;
          npcNear = { id, name: body.name, line: body.line, position: body.position };
        }
      }
    }
    const npcKey = npcNear?.id ?? null;
    if (npcKey !== nearNpcRef.current) {
      nearNpcRef.current = npcKey;
      onNearNpc(npcNear ? { id: npcNear.id, name: npcNear.name, line: npcNear.line } : null);
    }

    const back = near ? 9.2 : 7.4;
    const camH = near ? 4.85 : 4.35;
    const ideal = new THREE.Vector3(
      p.x - Math.sin(camYaw.current) * back,
      camH,
      p.z - Math.cos(camYaw.current) * back,
    );
    if (nearDoor) {
      const side = Math.sin(camYaw.current + Math.PI / 2) * 1.15;
      const sideZ = Math.cos(camYaw.current + Math.PI / 2) * 1.15;
      ideal.x += side;
      ideal.z += sideZ;
    }
    camera.position.lerp(ideal, 1 - Math.pow(0.0022, dt));
    camera.lookAt(p.x, near ? 1.45 : 1.2, p.z);
  });

  return (
    <group ref={group} position={spawn} rotation={[0, Math.PI, 0]}>
      <VoyagerMesh character={character} pose={moving.current ? "run" : "stand"} scale={1} />
    </group>
  );
}

function HotspotPulse({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const s = 1.15 + Math.sin(clock.elapsedTime * 4) * 0.12;
    ref.current.scale.set(s, 1, s);
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.35 + Math.sin(clock.elapsedTime * 4) * 0.15;
  });
  if (!active) return null;
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 1.1]}>
      <ringGeometry args={[0.85, 1.25, 28]} />
      <meshStandardMaterial color="#fbbf24" transparent opacity={0.45} depthWrite={false} />
    </mesh>
  );
}

function emoteToPose(emote: NpcEmote): "stand" | "wave" | "talk" | "nod" | "cheer" | "point" {
  if (emote === "idle") return "stand";
  return emote;
}

function Fountain() {
  const water = useRef<THREE.Mesh>(null);
  const jet = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const amp = plazaLifeAmp();
    if (water.current) {
      const mat = water.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.72 + Math.sin(clock.elapsedTime * 2.2) * 0.06 * amp;
    }
    if (jet.current) {
      jet.current.position.y = 2.15 + Math.sin(clock.elapsedTime * 3.1) * 0.12 * amp;
      jet.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4.2) * 0.08 * amp);
    }
  });
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[2.2, 2.45, 0.32, 24]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.78} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.65, 2.0, 0.42, 20]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.28, 0.4, 1.15, 12]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh castShadow position={[0, 1.75, 0]}>
        <torusGeometry args={[0.58, 0.14, 10, 22]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.42, 16, 14]} />
        <meshStandardMaterial color="#f4a629" roughness={0.28} metalness={0.45} emissive="#b45309" emissiveIntensity={0.15} />
      </mesh>
      <group ref={jet} position={[0, 2.15, 0]}>
        <mesh>
          <sphereGeometry args={[0.18, 10, 8]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.65} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.55} roughness={0.12} />
        </mesh>
      </group>
      <mesh ref={water} position={[0, 0.68, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.12, 28]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.12} metalness={0.45} transparent opacity={0.78} />
      </mesh>
      {[0.75, 1.05, 1.3].map((rad, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.75 + i * 0.02, 0]}>
          <ringGeometry args={[rad, rad + 0.07, 28]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.4 - i * 0.08} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function PlazaLantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.1, 8]} />
        <meshStandardMaterial color="#44403c" roughness={0.7} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.22, 0.28, 0.22]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={0.5}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

function MarketCrate({ position, rot = 0 }: { position: [number, number, number]; rot?: number }) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.55, 0.4, 0.45]} />
        <meshStandardMaterial color="#a16207" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.4]} />
        <meshStandardMaterial color="#854d0e" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

function PlazaScene({
  hotspots,
  onHotspot,
  locals,
  lives,
  keeperEmote = "idle",
  keeperSpeech,
  pulseHotspotId,
  nearHotspotId,
  nearNpcId,
  playerPos,
  npcBodies,
  look,
  scarEcho = null,
  npcMemory = null,
  plinthSpectacleActive = false,
  piggyPresenceBeat = false,
}: {
  hotspots: HarborHotspot[];
  onHotspot: (id: string) => void;
  locals: {
    mascotId: string;
    mascot: { name: string };
    look: import("../character").CapitalCharacter;
    coat: string;
    form: MoneyForm;
    glyph?: string;
    line: string;
    name: string;
  }[];
  lives: HarborNpcLife[];
  keeperEmote?: NpcEmote;
  keeperSpeech?: string | null;
  pulseHotspotId?: string | null;
  nearHotspotId?: string | null;
  nearNpcId?: string | null;
  playerPos: MutableRefObject<THREE.Vector3>;
  npcBodies: MutableRefObject<Map<string, { position: Vec3; line: string; name: string }>>;
  look: ReturnType<typeof getEraLook3D>;
  scarEcho?: {
    label: string;
    dayOffset: "same" | "later";
    organ?: import("../moneyOrgans").MoneyOrganId;
  } | null;
  npcMemory?: Record<string, { talks?: number; lastChoiceIds?: string[] }> | null;
  plinthSpectacleActive?: boolean;
  piggyPresenceBeat?: boolean;
}) {
  const memoryLit = Boolean(scarEcho);
  // Distill: vegetation in 3 outer clusters — never a full prop ring.
  const accentProps = useMemo(() => {
    const t = buildIslandTerrain(islandSeedFromId("harbor-props"), LOOK, "near");
    const clusters: [number, number][] = [
      [11.5, -9.5],
      [-12.2, -6.5],
      [10.8, 10.2],
    ];
    return t.props
      .filter((p) => p.kind !== "hut")
      .slice(0, 6)
      .map((p, i) => {
        const [cx, cz] = clusters[i % clusters.length]!;
        const jig = ((i * 37) % 10) * 0.12;
        return {
          ...p,
          kind: i % 3 === 0 && (p.kind === "palm" || p.kind === "tree") ? ("bush" as const) : p.kind,
          position: [cx + Math.cos(i) * jig, 0.02, cz + Math.sin(i) * jig] as [
            number,
            number,
            number,
          ],
          scale: (p.kind === "palm" || p.kind === "tree" ? 0.8 : 1) * p.scale * 0.95,
        };
      });
  }, []);

  return (
    <>
      <WorldLighting look={look} contactShadows shadowMapSize={1024} />
      <OceanWater color={look.sea} shading={look.shading} size={400} calm />

      {/* Island land mass + cliff thickness */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color={look.land} roughness={0.92} />
      </mesh>
      <mesh position={[0, -0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[17.2, 18.8, 1.3, 48]} />
        <meshStandardMaterial color="#6b6560" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, -1.45, 0]} castShadow>
        <cylinderGeometry args={[18.8, 20.2, 0.4, 48]} />
        <meshStandardMaterial color="#4b5563" roughness={0.98} flatShading />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]} receiveShadow>
        <ringGeometry args={[14, 18.8, 64]} />
        <meshStandardMaterial color={LOOK.shore} roughness={0.9} />
      </mesh>
      {/* Foam line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[17.6, 18.6, 64]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <ringGeometry args={[18.5, 20.5, 48]} />
        <meshStandardMaterial color="#0369a1" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Outer hills — asymmetric vertical skyline */}
      {[
        [13.5, 0.55, -11.5],
        [-14.2, 0.7, -6.5],
        [1.5, 0.85, -15.8],
        [12.8, 0.45, 10.5],
        [-12.5, 0.5, 10.8],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[2.0 + (i % 3) * 0.4, 12, 9]} />
            <meshStandardMaterial color={LOOK.land} roughness={0.88} flatShading />
          </mesh>
          <mesh castShadow position={[0.8, 0.35, 0.4]} rotation={[0.3, 0.5, 0.2]} scale={0.55}>
            <dodecahedronGeometry args={[0.95, 0]} />
            <meshStandardMaterial color="#78716c" roughness={0.94} flatShading />
          </mesh>
        </group>
      ))}

      <ShoreBerms />
      <PlazaTier />
      <CoinEyePath />
      <PlazaToyCoins />
      <HarborBanners />
      <HarborFlags />
      <UtilityQuay />
      <EastUtilityLedge />
      {/* Memory organ — ledger lines appear when Harbor carries a scar */}
      <OrganLedgerLines accent="#f59e0b" active={memoryLit} harborScale />

      {/* Soft radial spokes under coin path */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, (i / 6) * Math.PI]}
          position={[0, 0.125, 0]}
          receiveShadow
        >
          <planeGeometry args={[0.35, 8.5]} />
          <meshStandardMaterial
            color={memoryLit ? "#fde68a" : "#d6d3d1"}
            roughness={0.85}
            transparent
            opacity={memoryLit ? 0.85 : 0.7}
          />
        </mesh>
      ))}

      <Fountain />
      <PierMouthFrame />
      <WoodenPier position={[0, 0.05, 14.2]} />

      {/* Seawall — ~11 segments with intentional gaps (pier mouth + vista windows) */}
      {Array.from({ length: 14 }).map((_, i) => {
        // Open pier mouth (south) and two side vistas for negative space
        if (i === 3 || i === 4 || i === 10) return null;
        const ang = (i / 14) * Math.PI * 2 + Math.PI * 0.08;
        const r = 14.6;
        return (
          <group key={i}>
            <mesh
              castShadow
              position={[Math.cos(ang) * r, 0.4, Math.sin(ang) * r]}
              rotation={[0, -ang, 0]}
            >
              <boxGeometry args={[3.1, 0.85, 0.55]} />
              <meshStandardMaterial color="#a8a29e" roughness={0.82} />
            </mesh>
            <mesh
              castShadow
              position={[Math.cos(ang) * r, 0.88, Math.sin(ang) * r]}
              rotation={[0, -ang, 0]}
            >
              <boxGeometry args={[2.9, 0.14, 0.6]} />
              <meshStandardMaterial color="#78716c" roughness={0.75} />
            </mesh>
            {i % 3 === 0 ? (
              <PlazaLantern
                position={[Math.cos(ang) * (r - 0.6), 0.05, Math.sin(ang) * (r - 0.6)]}
              />
            ) : null}
          </group>
        );
      })}

      <NatureProps props={accentProps} look={LOOK} useKenney={KENNEY_ENABLED} />

      {/* Pier approach props — tight cluster */}
      <MarketCrate position={[2.2, 0.02, 10.2]} rot={0.3} />
      <MarketCrate position={[2.7, 0.02, 10.7]} rot={-0.4} />
      <mesh castShadow position={[-2.0, 0.28, 10.0]}>
        <cylinderGeometry args={[0.24, 0.26, 0.55, 10]} />
        <meshStandardMaterial color="#78350f" roughness={0.75} />
      </mesh>

      {hotspots.map((h) => {
        const yaw = hotspotPlazaYaw(h.id, h.position, h.yaw);
        const pulsing = pulseHotspotId === h.id;
        const nearby = nearHotspotId === h.id;
        const kind = h.kind ?? "building";
        const hero =
          kind === "money_structure" || kind === "carpet_gate" || kind === "plinth";
        // First-meet plaza: hide hero labels (Plinth etc.) — coach + Talk own the read.
        const showLabel =
          !piggyPresenceBeat && (pulsing || nearby || hero);
        const labelY =
          kind === "money_structure"
            ? 5.2
            : kind === "carpet_gate"
              ? 3.85
              : kind === "signpost"
                ? 2.55
                : kind === "outfitter" || kind === "arcade"
                  ? 3.45
                  : 3.25;
        return (
          <group key={h.id} position={h.position}>
            <HotspotPulse active={pulsing} />
            <group
              rotation={[0, yaw, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onHotspot(h.id);
              }}
              onPointerOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              {kind === "money_structure" ? (
                <LedgerBankLandmark
                  position={[0, 0, 0]}
                  active={nearby}
                  guided={pulsing}
                  label={h.label}
                />
              ) : kind === "carpet_gate" ? (
                <MoneyCarpetGate active={nearby} guided={pulsing} />
              ) : kind === "outfitter" ? (
                <OutfitterPavilion active={nearby} guided={pulsing} />
              ) : kind === "arcade" ? (
                <ArcadePavilion active={nearby} guided={pulsing} />
              ) : kind === "notice_board" ? (
                <HarborNoticeBoard active={nearby} guided={pulsing} />
              ) : kind === "plinth" ? (
                <MemoryPlinthMesh
                  active={nearby}
                  guided={pulsing}
                  scarRemembered={memoryLit}
                  spectacleActive={plinthSpectacleActive}
                  scarOrgan={scarEcho?.organ ?? null}
                  scarLabel={
                    scarEcho?.label
                      ? scarEcho.organ
                        ? `${scarOrganName(scarEcho.organ)} · ${scarEcho.label}`
                        : scarEcho.label
                      : undefined
                  }
                />
              ) : (
                <HarborSignpost accent={h.accent ?? LOOK.accent} active={nearby || pulsing} />
              )}
            </group>
            {showLabel ? (
              <Billboard follow position={[0, labelY, 0]}>
                {/* Troika + Billboard often reads mirrored in local/dev — flip X. */}
                <group scale={[-1, 1, 1]}>
                  <SafeText
                    fontSize={hero ? 0.34 : 0.26}
                    color={pulsing ? "#92400e" : hero ? "#78350f" : "#16283b"}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#ffffff"
                    depthOffset={-1}
                  >
                    {`${h.icon} ${h.label}${pulsing ? " ←" : ""}`}
                  </SafeText>
                </group>
              </Billboard>
            ) : null}
          </group>
        );
      })}

      {locals.map((npc) => {
        const isKeeper = npc.mascotId === HARBOR_KEEPER_MASCOT_ID;
        const life = lives.find((l) => l.mascotId === npc.mascotId);
        if (!life) return null;
        return (
          <HarborBehaviorNpc
            key={npc.mascotId}
            life={life}
            look={npc.look}
            coat={npc.coat}
            form={npc.form}
            glyph={npc.glyph}
            guidedEmote={isKeeper ? keeperEmote : "idle"}
            keeperSpeech={isKeeper ? keeperSpeech : null}
            showPulse={Boolean(isKeeper && pulseHotspotId === "guide")}
            nearPlayer={nearNpcId === npc.mascotId}
            playerPos={playerPos}
            bodyOut={npcBodies}
            memory={npcMemory?.[npc.mascotId] ?? null}
            scarEcho={scarEcho}
          />
        );
      })}

      <EraIslandMesh
        look={getEraLook3D("era-1990s")}
        seed="horizon-a"
        position={[-38, -0.2, -42]}
        scale={2.2}
        detail="far"
      />
      <EraIslandMesh
        look={getEraLook3D("era-2000s")}
        seed="horizon-b"
        position={[42, -0.2, -36]}
        scale={2.6}
        detail="far"
      />
      <EraIslandMesh
        look={getEraLook3D("era-1980s")}
        seed="horizon-c"
        position={[8, -0.2, -55]}
        scale={1.8}
        detail="far"
      />
    </>
  );
}

/**
 * Walkable Harbor plaza — third-person money mascot, approach stalls to enter.
 */
export function WalkableHarborView({
  character,
  hotspots,
  onHotspot,
  onOpenTravel,
  onNearChange,
  onNearNpc,
  guideHighlight,
  guideLookAt = null,
  guideTip,
  keeperEmote = "idle",
  keeperSpeech = null,
  pulseHotspotId = null,
  guideArrows = true,
  onGuideProject,
  inputFrozen = false,
  cinemaFocus = null,
  cinemaEye = null,
  plinthSpectacleActive = false,
  weatherFog = null,
  npcMemory = null,
  scarEcho = null,
  fallbackMode = "utility",
  onFallbackTalkPiggy,
  onFallbackEnterBank,
  piggyPresenceBeat = false,
  onPlazaReady,
  cinemaActive = false,
}: Props) {
  const [near, setNear] = useState<string | null>(null);
  const [nearNpcId, setNearNpcId] = useState<string | null>(null);
  const reduced = prefersReducedMotion();
  /** Mid-phone budget: also soften when deviceMemory is low */
  const lowMem =
    typeof navigator !== "undefined" &&
    typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === "number" &&
    ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
  /** SRE: error-budget burn or kill switch forces soft/2D path. */
  const kill3d = isKilled("harbor3d");
  const budgetDegrade = shouldDegradeForBudget();
  const perfSoft = reduced || lowMem || budgetDegrade;

  const hour = currentHarborHour();
  const lives = useMemo(() => {
    const all = buildHarborNpcLives();
    if (!piggyPresenceBeat) return all;
    // Series leads wait offstage until Piggy presence clears.
    return all.filter((l) => !isSeriesLeadMascot(l.mascotId));
  }, [piggyPresenceBeat]);
  const look = useMemo(() => {
    const base = { ...LOOK };
    if (weatherFog) {
      base.fogNear = weatherFog.near;
      base.fogFar = weatherFog.far;
    }
    return base;
  }, [weatherFog]);
  const locals = useMemo(
    () =>
      lives.map((life) => {
        const pose = harborNpcPose(life, hour, npcMemory?.[life.mascotId], scarEcho);
        const mascot = getMascot(life.mascotId);
        const lookChar = varyMascot(life.mascotId, `harbor:${life.mascotId}:${hour}`);
        return {
          mascotId: life.mascotId,
          mascot,
          look: lookChar,
          coat: colorHex(lookChar.color),
          form: mascot.form as MoneyForm,
          glyph: mascot.glyph,
          line: pose.line,
          name: pose.name,
        };
      }),
    [lives, hour, npcMemory, scarEcho],
  );
  const npcBodies = useRef(new Map<string, { position: Vec3; line: string; name: string }>());
  const playerPos = useRef(
    new THREE.Vector3(
      ...(piggyPresenceBeat ? FIRST_MEET_SPAWN : DEFAULT_SPAWN),
    ),
  );

  const guideTarget = useMemo(() => {
    if (guideLookAt) return guideLookAt;
    if (!guideHighlight) return null;
    const piggyHome =
      lives.find((l) => l.mascotId === HARBOR_KEEPER_MASCOT_ID)?.home ?? HARBOR_PIGGY_POS;
    return guideTargetForHighlight(guideHighlight, hotspots, piggyHome);
  }, [guideLookAt, guideHighlight, hotspots, lives]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (inputFrozen) return;
      if ((e.key === "e" || e.key === "E" || e.key === "Enter") && near) {
        e.preventDefault();
        onHotspot(near);
      }
      if (e.key === "m" || e.key === "M") onOpenTravel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [near, onHotspot, onOpenTravel, inputFrozen]);

  useEffect(() => {
    const label = hotspots.find((h) => h.id === near)?.label ?? null;
    onNearChange?.(near, label);
  }, [near, hotspots, onNearChange]);

  const [ready, setReady] = useState(false);
  const [loadHint, setLoadHint] = useState(HARBOR_LOADING_HINT);
  const [force2d, setForce2d] = useState(() => {
    try {
      return sessionStorage.getItem(HARBOR_3D_FAIL_KEY) === "1";
    } catch {
      return false;
    }
  });
  /**
   * Reliability gate: never mount R3F until Continue has painted and a cheap
   * WebGL probe passes. createContext on a hung GPU can freeze the main thread
   * so Continue never receives clicks — defer + probe + hard myth escape.
   */
  const [allowCanvas, setAllowCanvas] = useState(false);
  const readyRef = useRef(false);
  const force2dRef = useRef(force2d);
  const escapedRef = useRef(false);
  readyRef.current = ready;
  force2dRef.current = force2d;

  /** soft = this visit only; sticky = remember for the session (context lost / probe fail). */
  const escapeToMyth = useCallback((mode: "soft" | "sticky" = "soft") => {
    if (escapedRef.current) return;
    escapedRef.current = true;
    try {
      sessionStorage.removeItem(HARBOR_3D_OK_KEY);
      if (mode === "sticky") {
        sessionStorage.setItem(HARBOR_3D_FAIL_KEY, "1");
      }
    } catch {
      /* ignore */
    }
    setAllowCanvas(false);
    setForce2d(true);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready || force2d || kill3d) return;
    setLoadHint(HARBOR_LOADING_HINT);
    let cancelled = false;
    let idleId: number | undefined;
    let mountTimer: number | undefined;
    let canvasWatch: number | undefined;

    /** Worker / importScripts failures on Pages — bail to myth instead of a dead veil. */
    const onWindowError = (ev: ErrorEvent) => {
      const msg = String(ev.message || ev.error || "");
      if (/importScripts|Worker|rehydrate|OffscreenCanvas/i.test(msg)) {
        escapeToMyth("sticky");
      }
    };
    const onRejection = (ev: PromiseRejectionEvent) => {
      const msg = String(ev.reason?.message || ev.reason || "");
      if (/importScripts|Worker|rehydrate|OffscreenCanvas/i.test(msg)) {
        escapeToMyth("sticky");
      }
    };
    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onRejection);

    const probeWebGL = (): boolean => {
      try {
        const c = document.createElement("canvas");
        const gl =
          c.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
          c.getContext("webgl", { failIfMajorPerformanceCaveat: false });
        if (!gl) return false;
        // Free the probe context so R3F can claim a real one.
        const lose = gl.getExtension("WEBGL_lose_context");
        lose?.loseContext();
        return true;
      } catch {
        return false;
      }
    };

    const scheduleCanvas = () => {
      if (cancelled || force2dRef.current || readyRef.current) return;
      if (!probeWebGL()) {
        escapeToMyth("sticky");
        return;
      }
      setAllowCanvas(true);
      // If R3F never reports onCreated, tear Canvas down and play myth — don't veil forever.
      canvasWatch = window.setTimeout(() => {
        if (!readyRef.current) escapeToMyth("soft");
      }, HARBOR_CANVAS_WATCHDOG_MS);
    };

    // Double-rAF + idle: Enter Harbor paints and stays tappable before WebGL hitch.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        const ric = (
          window as Window & {
            requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
          }
        ).requestIdleCallback;
        if (typeof ric === "function") {
          idleId = ric(() => {
            mountTimer = window.setTimeout(scheduleCanvas, HARBOR_DEFER_BEFORE_PROBE_MS);
          }, { timeout: 400 });
        } else {
          mountTimer = window.setTimeout(scheduleCanvas, 280);
        }
      });
    });

    const hint = window.setTimeout(() => {
      setLoadHint(HARBOR_LOADING_SLOW);
    }, HARBOR_LOAD_HINT_MS);
    // Hard myth escape — iconic reliability gate: playable Harbor < ~2.5s.
    const failsafe = window.setTimeout(() => {
      if (!readyRef.current) escapeToMyth("soft");
    }, HARBOR_HARD_FAILSAFE_MS);
    return () => {
      cancelled = true;
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onRejection);
      if (idleId !== undefined) {
        const cic = (
          window as Window & { cancelIdleCallback?: (id: number) => void }
        ).cancelIdleCallback;
        cic?.(idleId);
      }
      if (mountTimer !== undefined) window.clearTimeout(mountTimer);
      if (canvasWatch !== undefined) window.clearTimeout(canvasWatch);
      window.clearTimeout(hint);
      window.clearTimeout(failsafe);
    };
  }, [ready, force2d, kill3d, escapeToMyth]);

  useEffect(() => {
    if (ready) reportHarborReady();
  }, [ready]);

  useEffect(() => {
    onPlazaReady?.(ready);
  }, [ready, onPlazaReady]);

  useEffect(() => {
    if (kill3d || force2d) setReady(true);
  }, [kill3d, force2d]);

  // When sticky myth is active, never hide Talk/Carpet behind Plinth cinema stage.
  // Cinema overlays own z-index; plaza must stay the myth fallback for navigability.
  if (kill3d || force2d) {
    return (
      <HarborMythFallback
        mode={fallbackMode}
        killSwitch={kill3d}
        onTalkPiggy={() => {
          if (onFallbackTalkPiggy) onFallbackTalkPiggy();
          else onHotspot("guide");
        }}
        onBoardCarpet={onOpenTravel}
        onEnterBank={
          onFallbackEnterBank
            ? onFallbackEnterBank
            : () => onHotspot("ledger_bank")
        }
      />
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden" data-testid="harbor-3d-shell">
      {!ready ? (
        <div
          className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-[#7dd3fc] px-4 text-center"
          style={{ pointerEvents: "auto", touchAction: "manipulation" }}
          data-testid="harbor-loading-veil"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#16283b]/70">
            Harbor Haven
          </p>
          <p className="max-w-sm text-base font-black text-[#16283b]" data-testid="harbor-loading">
            {loadHint}
          </p>
          <p
            className="max-w-xs text-sm font-medium text-[#16283b]/80"
            data-testid="harbor-loading-ashore"
          >
            {HARBOR_LOADING_ASHORE}
          </p>
          <button
            type="button"
            data-testid="harbor-skip-3d"
            className="pointer-events-auto relative z-[110] min-h-14 min-w-[16rem] rounded-2xl bg-[#16283b] px-7 py-4 text-base font-black text-white shadow-[4px_4px_0_rgba(22,40,59,0.35)]"
            style={{ touchAction: "manipulation" }}
            {...pointerSafeActivate(() => escapeToMyth("soft"))}
          >
            {ENTER_HARBOR_HAVEN}
          </button>
          <p className="max-w-xs text-[11px] font-medium text-[#16283b]/65">
            Don’t wait on 3D — tap Enter for Talk Piggy · Carpet · Cove (plaza sketch included).
          </p>
        </div>
      ) : null}
      {allowCanvas ? (
      <Canvas
        shadows={!perfSoft}
        dpr={perfSoft ? [1, 1] : [1, 1.25]}
        camera={{ position: [0, 5, 14], fov: 50 }}
        className="absolute inset-0 z-[2]"
        gl={{ antialias: !perfSoft, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          if (force2dRef.current || escapedRef.current) {
            try {
              gl.dispose();
            } catch {
              /* ignore */
            }
            return;
          }
          gl.setClearColor("#7dd3fc", 1);
          setReady(true);
          try {
            sessionStorage.setItem(HARBOR_3D_OK_KEY, "1");
            sessionStorage.removeItem(HARBOR_3D_FAIL_KEY);
          } catch {
            /* ignore */
          }
          const canvas = gl.domElement;
          const onLost = (e: Event) => {
            e.preventDefault();
            escapeToMyth("sticky");
          };
          canvas.addEventListener("webglcontextlost", onLost, { once: true });
        }}
      >
        {/* Meshes outside Text Suspense — CDN font blocks must not blank Harbor on Pages. */}
        <PlazaScene
          hotspots={hotspots}
          onHotspot={onHotspot}
          locals={locals}
          lives={lives}
          keeperEmote={keeperEmote}
          keeperSpeech={keeperSpeech}
          pulseHotspotId={pulseHotspotId}
          nearHotspotId={near}
          nearNpcId={nearNpcId}
          playerPos={playerPos}
          npcBodies={npcBodies}
          look={look}
          scarEcho={scarEcho}
          npcMemory={npcMemory}
          plinthSpectacleActive={plinthSpectacleActive}
          piggyPresenceBeat={piggyPresenceBeat}
        />
        <Player
          character={character}
          hotspots={hotspots}
          npcBodies={npcBodies}
          onNear={setNear}
          onNearNpc={(n) => {
            setNearNpcId(n?.id ?? null);
            onNearNpc?.(n);
          }}
          playerPosOut={playerPos}
          inputFrozen={inputFrozen}
          cinemaFocus={cinemaFocus}
          cinemaEye={cinemaEye}
          softMeetSpawn={piggyPresenceBeat}
        />
        <Suspense fallback={null}>
          <MoneyBagGuide
            lookAt={guideTarget}
            playerPos={playerPos}
            tip={guideTip ?? "Stay with me!"}
            reducedMotion={reduced}
            pointingEnabled={guideArrows && !plinthSpectacleActive}
          />
          <GuideProjector
            lookAt={guideTarget}
            enabled={guideArrows && !plinthSpectacleActive}
            onProject={onGuideProject ?? (() => {})}
          />
        </Suspense>
      </Canvas>
      ) : null}
    </div>
  );
}
