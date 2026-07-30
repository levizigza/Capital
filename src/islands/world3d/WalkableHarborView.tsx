import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

import type { CapitalCharacter } from "../character";
import { VoyagerMesh, HarborNpcMesh } from "./VoyagerMesh";
import { getMascot, varyMascot } from "../moneyCast";
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
import { LedgerBankLandmark } from "./LedgerBankLandmark";
import {
  MoneyCarpetGate,
  OutfitterPavilion,
  ArcadePavilion,
  HarborNoticeBoard,
  MemoryPlinthMesh,
  HarborSignpost,
} from "./HarborLandmarks";
import { buildIslandTerrain, islandSeedFromId } from "./islandTerrain";
import { KENNEY_ENABLED } from "./kenneyFlag";
import { MoneyBagGuide, guideTargetForHighlight } from "./MoneyBagGuide";
import { GuideProjector } from "../views/GuideWayfinder";
import type { GuideProjection } from "../views/GuideWayfinder";
import type { NpcEmote } from "../story/dialogueActionSync";
import { HARBOR_KEEPER_MASCOT_ID } from "../story/hubGuidedIntro";
import { isKilled, reportHarborReady, shouldDegradeForBudget } from "@/sre";

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
  /** Cashflow weather — soft fog density */
  weatherFog?: { near: number; far: number } | null;
  /** Per-NPC Talk Battle memory for ambient greetings */
  npcMemory?: Record<string, { talks?: number; lastChoiceIds?: string[] }> | null;
  /** Latest plaque echo so plaza locals name the scar (day-2 memory) */
  scarEcho?: { label: string; dayOffset: "same" | "later" } | null;
};

const LOOK = getEraLook3D("capital-default");
const SPEED = 6.5;
const INTERACT_R = 2.85;
const PLAZA_R = 16;

function Player({
  character,
  hotspots,
  npcBodies,
  onNear,
  onNearNpc,
  playerPosOut,
  inputFrozen = false,
}: {
  character?: CapitalCharacter | null;
  hotspots: HarborHotspot[];
  /** Live Unity-Behavior agent bodies (updated each frame by HarborBehaviorNpc) */
  npcBodies: MutableRefObject<Map<string, { position: Vec3; line: string; name: string }>>;
  onNear: (id: string | null) => void;
  onNearNpc: (npc: { id: string; name: string; line: string } | null) => void;
  playerPosOut: MutableRefObject<THREE.Vector3>;
  inputFrozen?: boolean;
}) {
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
      moving.current = false;
    }
  }, [inputFrozen]);

  useFrame((_, dt) => {
    if (!group.current) return;
    const p = group.current.position;
    if (frozenRef.current) {
      playerPosOut.current.set(p.x, p.y, p.z);
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
    const k = keys.current;
    const turn = (Number(k.l) - Number(k.r)) * 2.2 * dt;
    camYaw.current += turn;

    const forward = Number(k.f) - Number(k.b);
    moving.current = Math.abs(forward) > 0.01 || Math.abs(turn) > 0.001;
    if (Math.abs(forward) > 0.01) {
      facing.current = forward >= 0 ? camYaw.current : camYaw.current + Math.PI;
      const spd = SPEED * (k.b && !k.f ? 0.65 : 1);
      vel.current.set(
        Math.sin(camYaw.current) * forward * spd,
        0,
        Math.cos(camYaw.current) * forward * spd,
      );
      p.x += vel.current.x * dt;
      p.z += vel.current.z * dt;
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

    const back = near ? 10.5 : 8.5;
    const camH = near ? 5.4 : 4.9;
    const ideal = new THREE.Vector3(
      p.x - Math.sin(camYaw.current) * back,
      camH,
      p.z - Math.cos(camYaw.current) * back,
    );
    if (nearDoor) {
      const side = Math.sin(camYaw.current + Math.PI / 2) * 1.4;
      const sideZ = Math.cos(camYaw.current + Math.PI / 2) * 1.4;
      ideal.x += side;
      ideal.z += sideZ;
    }
    camera.position.lerp(ideal, 1 - Math.pow(0.0015, dt));
    camera.lookAt(p.x, near ? 1.55 : 1.25, p.z);
  });

  return (
    <group ref={group} position={[0, 0, 3]} rotation={[0, Math.PI, 0]}>
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
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[2.05, 2.25, 0.28, 20]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.82} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[1.55, 1.85, 0.4, 18]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.75} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.32, 0.42, 1.0, 10]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.7} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]}>
        <torusGeometry args={[0.55, 0.12, 8, 20]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.65} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.4, 14, 12]} />
        <meshStandardMaterial color="#f4a629" roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 0.1, 24]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.18} metalness={0.4} transparent opacity={0.78} />
      </mesh>
      {/* Splash rings */}
      {[0.7, 1.0].map((rad, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.64 + i * 0.02, 0]}>
          <ringGeometry args={[rad, rad + 0.08, 24]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.35} depthWrite={false} />
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
}) {
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
      .slice(0, 9)
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

  const cobbles = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const ang = (i / 10) * Math.PI * 2 + (i % 3) * 0.11;
      const rad = 2.6 + (i % 4) * 1.15;
      return {
        x: Math.cos(ang) * rad,
        z: Math.sin(ang) * rad,
        s: 0.38 + (i % 3) * 0.1,
      };
    });
  }, []);

  return (
    <>
      <WorldLighting look={look} contactShadows={false} shadowMapSize={512} />
      <OceanWater color={look.sea} shading={look.shading} size={400} calm />

      {/* Island land mass + cliff thickness */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color={look.land} roughness={0.92} flatShading />
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
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <ringGeometry args={[18.5, 20.5, 48]} />
        <meshStandardMaterial color="#0369a1" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Outer hills — fewer, intentional (negative space between) */}
      {[
        [13, 0.45, -11],
        [-14, 0.55, -7],
        [0, 0.65, -15.5],
        [12.5, 0.4, 11],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[2.1 + (i % 2) * 0.35, 12, 9]} />
            <meshStandardMaterial color={LOOK.land} roughness={0.88} flatShading />
          </mesh>
          <mesh castShadow position={[0.8, 0.3, 0.4]} rotation={[0.3, 0.5, 0.2]} scale={0.55}>
            <dodecahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial color="#78716c" roughness={0.94} flatShading />
          </mesh>
        </group>
      ))}

      {/* Stone plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[10.5, 56]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.88} flatShading />
      </mesh>
      {cobbles.map((c, i) => (
        <mesh
          key={`cobble-${i}`}
          rotation={[-Math.PI / 2, 0, (i % 5) * 0.3]}
          position={[c.x, 0.055, c.z]}
          receiveShadow
        >
          <circleGeometry args={[c.s, 6]} />
          <meshStandardMaterial
            color={i % 2 ? "#d6d3d1" : "#c4c0bc"}
            roughness={0.92}
            flatShading
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
        <ringGeometry args={[5.5, 8.2, 48]} />
        <meshStandardMaterial color={LOOK.shore} roughness={0.9} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, (i / 6) * Math.PI]}
          position={[0, 0.07, 0]}
          receiveShadow
        >
          <planeGeometry args={[0.55, 10]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
        </mesh>
      ))}

      <Fountain />

      <WoodenPier position={[0, 0.05, 14.2]} />

      {/* Seawall — intentional gaps (distill), lanterns at openings */}
      {Array.from({ length: 12 }).map((_, i) => {
        // Skip south pier mouth so the carpet gate reads clearly
        if (i === 3 || i === 4) return null;
        const ang = (i / 12) * Math.PI * 2 + Math.PI * 0.08;
        const r = 14.5;
        return (
          <group key={i}>
            <mesh
              castShadow
              position={[Math.cos(ang) * r, 0.35, Math.sin(ang) * r]}
              rotation={[0, -ang, 0]}
            >
              <boxGeometry args={[3.4, 0.75, 0.5]} />
              <meshStandardMaterial color="#a8a29e" roughness={0.85} flatShading />
            </mesh>
            <mesh
              castShadow
              position={[Math.cos(ang) * r, 0.78, Math.sin(ang) * r]}
              rotation={[0, -ang, 0]}
            >
              <boxGeometry args={[3.2, 0.12, 0.55]} />
              <meshStandardMaterial color="#78716c" roughness={0.8} flatShading />
            </mesh>
            {i % 3 === 0 ? (
              <PlazaLantern
                position={[Math.cos(ang) * (r - 0.55), 0.05, Math.sin(ang) * (r - 0.55)]}
              />
            ) : null}
          </group>
        );
      })}

      <NatureProps props={accentProps} look={LOOK} useKenney={KENNEY_ENABLED} />

      {/* Pier approach — one crate cluster, not a clutter pile */}
      <MarketCrate position={[2.1, 0.02, 10.4]} rot={0.3} />
      <mesh castShadow position={[-1.8, 0.28, 10.2]}>
        <cylinderGeometry args={[0.22, 0.24, 0.5, 10]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} flatShading />
      </mesh>

      {hotspots.map((h) => {
        // Face the door toward the plaza center so entrances are readable.
        const yaw = Math.atan2(-h.position[0], -h.position[2]);
        const pulsing = pulseHotspotId === h.id;
        const nearby = nearHotspotId === h.id;
        const kind = h.kind ?? "building";
        const hero =
          kind === "money_structure" || kind === "carpet_gate" || kind === "plinth";
        const showLabel = pulsing || nearby || hero;
        const labelY =
          kind === "money_structure"
            ? 4.4
            : kind === "carpet_gate"
              ? 3.6
              : kind === "signpost"
                ? 2.35
                : 3.15;
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
                <MemoryPlinthMesh active={nearby} guided={pulsing} />
              ) : (
                <HarborSignpost accent={h.accent ?? LOOK.accent} active={nearby || pulsing} />
              )}
            </group>
            {showLabel ? (
              <Billboard follow position={[0, labelY, 0]}>
                <SafeText
                  fontSize={hero ? 0.34 : 0.26}
                  color={pulsing ? "#92400e" : hero ? "#78350f" : "#16283b"}
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.02}
                  outlineColor="#ffffff"
                >
                  {`${h.icon} ${h.label}${pulsing ? " ←" : ""}`}
                </SafeText>
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
  weatherFog = null,
  npcMemory = null,
  scarEcho = null,
}: Props) {
  const [near, setNear] = useState<string | null>(null);
  const [nearNpcId, setNearNpcId] = useState<string | null>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
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
  const lives = useMemo(() => buildHarborNpcLives(), []);
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
  const playerPos = useRef(new THREE.Vector3(0, 0, 3));

  const guideTarget = useMemo(() => {
    if (guideLookAt) return guideLookAt;
    if (!guideHighlight) return null;
    return guideTargetForHighlight(guideHighlight, hotspots);
  }, [guideLookAt, guideHighlight, hotspots]);

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
  const [loadHint, setLoadHint] = useState("Loading Harbor Haven…");
  const [force2d, setForce2d] = useState(false);
  const readyRef = useRef(false);
  readyRef.current = ready;

  useEffect(() => {
    if (ready) return;
    const hint = window.setTimeout(() => {
      setLoadHint("Still loading… if this hangs, refresh the page (Esc won’t help here).");
    }, 8000);
    // Never leave players on an empty sky — fall back to hotspot buttons.
    const failsafe = window.setTimeout(() => {
      if (!readyRef.current) setForce2d(true);
    }, 6000);
    return () => {
      window.clearTimeout(hint);
      window.clearTimeout(failsafe);
    };
  }, [ready]);

  useEffect(() => {
    if (ready) reportHarborReady();
  }, [ready]);

  useEffect(() => {
    if (kill3d || force2d) setReady(true);
  }, [kill3d, force2d]);

  if (kill3d || force2d) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-b from-[#7dd3fc] to-[#bae6fd] px-6 text-center">
        <p className="text-lg font-bold text-[#16283b]">
          {force2d && !kill3d ? "Harbor Haven (quick map)" : "Harbor Haven (safe mode)"}
        </p>
        <p className="max-w-md text-sm text-[#16283b]/80">
          {force2d && !kill3d
            ? "3D is slow on this device — tap a place below. Ledger Bank is the money machine."
            : "3D Harbor is temporarily disabled for reliability. Use Travel, Settings, or hotspots below when available."}
        </p>
        <div className="flex max-w-lg flex-wrap justify-center gap-2">
          {hotspots.map((h) => (
            <button
              key={h.id}
              type="button"
              className="rounded-lg bg-white/80 px-3 py-2 text-sm font-semibold text-[#16283b] shadow"
              onClick={() => onHotspot(h.id)}
            >
              {h.icon} {h.label}
            </button>
          ))}
          <button
            type="button"
            className="rounded-lg bg-[#f4a629] px-3 py-2 text-sm font-bold text-[#16283b] shadow"
            onClick={onOpenTravel}
          >
            🗺️ Archipelago map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[#7dd3fc] px-4 text-center text-sm font-bold text-[#16283b]/70">
          {loadHint}
        </div>
      ) : null}
      <Canvas
        shadows={!perfSoft}
        dpr={perfSoft ? [1, 1] : [1, 1.25]}
        camera={{ position: [0, 5, 14], fov: 50 }}
        className="absolute inset-0 z-[2]"
        gl={{ antialias: !perfSoft, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#7dd3fc", 1);
          setReady(true);
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
        />
        <Suspense fallback={null}>
          <MoneyBagGuide
            lookAt={guideTarget}
            playerPos={playerPos}
            tip={guideTip ?? "Stay with me!"}
            reducedMotion={reduced}
            pointingEnabled={guideArrows}
          />
          <GuideProjector
            lookAt={guideTarget}
            enabled={guideArrows}
            onProject={onGuideProject ?? (() => {})}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
