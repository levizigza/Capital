import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { EraLook3D } from "./eraLooks";

type Props = {
  look: EraLook3D;
  title: string;
  subtitle?: string;
  position: [number, number, number];
  scale?: number;
  selected?: boolean;
  locked?: boolean;
  current?: boolean;
  seed?: string;
  onSelect?: () => void;
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

const HOUSE_BODIES = ["#fef3c7", "#ecfccb", "#e0f2fe", "#ffe4e6", "#f5f5f4", "#fce7f3"];

/**
 * Floating isometric diorama block — geological strata base, rocky peaks,
 * moss, tiny buildings, winding path, and pin markers. Label sits on top.
 */
export function DioramaIslandMesh({
  look,
  title,
  subtitle,
  position,
  scale = 1,
  selected,
  locked,
  current,
  seed = "diorama",
  onSelect,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const wire = look.shading === "wire" || look.shading === "vector";
  const rock = look.shading === "neon" ? look.accent : "#8a8580";
  const moss = look.land;
  const sand = look.shore;
  const strata = ["#4a3728", "#6b4f2a", "#8b6914", "#c4a574", "#e8d5b5"];

  const peaks = useMemo(() => {
    const n = 5 + Math.floor(hash(seed) * 3);
    return Array.from({ length: n }, (_, i) => {
      const a = hash(`${seed}-p${i}`) * Math.PI * 2;
      const r = 0.3 + hash(`${seed}-r${i}`) * 1.15;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r * 0.85,
        h: 0.5 + hash(`${seed}-h${i}`) * 1.2,
        w: 0.4 + hash(`${seed}-w${i}`) * 0.55,
      };
    });
  }, [seed]);

  const houses = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      x: -1.05 + hash(`${seed}-hx${i}`) * 2.1,
      z: -0.55 + hash(`${seed}-hz${i}`) * 1.35,
      rot: hash(`${seed}-hr${i}`) * Math.PI,
      s: 0.11 + hash(`${seed}-hs${i}`) * 0.09,
      body: HOUSE_BODIES[Math.floor(hash(`${seed}-hb${i}`) * HOUSE_BODIES.length)]!,
    }));
  }, [seed]);

  const palms = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const a = hash(`${seed}-pa${i}`) * Math.PI * 2;
      const r = 1.15 + hash(`${seed}-pr${i}`) * 0.45;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r * 0.8,
        s: 0.35 + hash(`${seed}-ps${i}`) * 0.25,
      };
    });
  }, [seed]);

  const pins = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const t = i / 5;
      return {
        x: -1.1 + t * 2.2 + (hash(`${seed}-px${i}`) - 0.5) * 0.25,
        z: -0.3 + Math.sin(t * Math.PI) * 0.7 + (hash(`${seed}-pz${i}`) - 0.5) * 0.2,
      };
    });
  }, [seed]);

  const cliffs = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + hash(`${seed}-ca${i}`) * 0.3;
      return {
        x: Math.cos(a) * 1.7,
        z: Math.sin(a) * 1.2,
        h: 0.35 + hash(`${seed}-ch${i}`) * 0.45,
        rot: -a,
      };
    });
  }, [seed]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const bob = Math.sin(clock.elapsedTime * 0.8 + hash(seed) * 10) * 0.04;
    group.current.position.y = position[1] + bob + (hovered || selected ? 0.12 : 0);
  });

  const dim = locked ? 0.45 : 1;

  return (
    <group
      ref={group}
      position={position}
      scale={scale * (hovered || selected ? 1.06 : 1)}
      onClick={(e) => {
        e.stopPropagation();
        if (!locked) onSelect?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = locked ? "not-allowed" : "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Soft drop shadow under floating block */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]}>
        <circleGeometry args={[2.55, 24]} />
        <meshBasicMaterial color="#0c1622" transparent opacity={0.2} />
      </mesh>

      {/* Geological strata base (cross-section look) */}
      {strata.map((c, i) => (
        <mesh key={c} castShadow receiveShadow position={[0, -0.9 + i * 0.16, 0]}>
          <boxGeometry args={[3.7 - i * 0.06, 0.18, 2.8 - i * 0.05]} />
          <meshStandardMaterial
            color={c}
            roughness={0.9}
            flatShading
            wireframe={wire}
            transparent={locked}
            opacity={dim}
          />
        </mesh>
      ))}

      {/* Cliff edge chunks */}
      {!wire &&
        cliffs.map((c, i) => (
          <mesh
            key={`cliff-${i}`}
            castShadow
            position={[c.x, -0.15, c.z]}
            rotation={[0.2, c.rot, 0.1]}
          >
            <boxGeometry args={[0.45, c.h, 0.35]} />
            <meshStandardMaterial
              color={rock}
              roughness={0.94}
              flatShading
              transparent={locked}
              opacity={dim}
            />
          </mesh>
        ))}

      {/* Top plateau / soil */}
      <mesh castShadow receiveShadow position={[0, -0.02, 0]}>
        <boxGeometry args={[3.55, 0.16, 2.65]} />
        <meshStandardMaterial
          color={sand}
          roughness={0.85}
          flatShading
          wireframe={wire}
          transparent={locked}
          opacity={dim}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[3.35, 0.1, 2.45]} />
        <meshStandardMaterial
          color={moss}
          roughness={0.8}
          flatShading
          wireframe={wire}
          transparent={locked}
          opacity={dim}
        />
      </mesh>
      {/* Shore crescent */}
      {!wire && (
        <mesh rotation={[-Math.PI / 2, 0, 0.2]} position={[0.2, 0.12, 1.05]} receiveShadow>
          <planeGeometry args={[2.4, 0.55]} />
          <meshStandardMaterial color={sand} roughness={0.92} transparent={locked} opacity={dim} />
        </mesh>
      )}

      {/* Rocky peaks */}
      {peaks.map((p, i) => (
        <group key={i} position={[p.x, 0.1, p.z]}>
          <mesh castShadow position={[0, p.h * 0.45, 0]}>
            <coneGeometry args={[p.w, p.h, look.shading === "lowpoly" ? 5 : 7]} />
            <meshStandardMaterial
              color={rock}
              roughness={0.92}
              flatShading
              wireframe={wire}
              transparent={locked}
              opacity={dim}
            />
          </mesh>
          {!wire && (
            <mesh castShadow position={[0, p.h * 0.75, 0]}>
              <sphereGeometry args={[p.w * 0.45, 8, 6]} />
              <meshStandardMaterial
                color={moss}
                roughness={0.75}
                flatShading
                transparent={locked}
                opacity={dim}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Tiny palms along the shore */}
      {!wire &&
        palms.map((p, i) => (
          <group key={`palm-${i}`} position={[p.x, 0.12, p.z]} scale={p.s}>
            <mesh castShadow position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.04, 0.07, 0.7, 5]} />
              <meshStandardMaterial color="#6b4a2a" roughness={0.9} flatShading transparent={locked} opacity={dim} />
            </mesh>
            {[0, 1, 2, 3].map((j) => (
              <mesh
                key={j}
                castShadow
                position={[
                  Math.cos((j / 4) * Math.PI * 2) * 0.22,
                  0.72,
                  Math.sin((j / 4) * Math.PI * 2) * 0.22,
                ]}
                rotation={[0.7, (j / 4) * Math.PI * 2, 0]}
              >
                <coneGeometry args={[0.14, 0.4, 4]} />
                <meshStandardMaterial color={moss} roughness={0.75} flatShading transparent={locked} opacity={dim} />
              </mesh>
            ))}
          </group>
        ))}

      {/* Mini pier */}
      {!wire && (
        <group position={[0.15, 0.12, 1.25]} rotation={[0, 0.15, 0]}>
          {[-0.12, 0.12].map((x) => (
            <mesh key={x} castShadow receiveShadow position={[x, 0.04, 0.25]}>
              <boxGeometry args={[0.1, 0.05, 0.7]} />
              <meshStandardMaterial color="#8b5a2b" roughness={0.88} flatShading transparent={locked} opacity={dim} />
            </mesh>
          ))}
          {[-0.18, 0.18].map((x) =>
            [0.05, 0.45].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, -0.08, z]}>
                <cylinderGeometry args={[0.03, 0.035, 0.25, 5]} />
                <meshStandardMaterial color="#5c3a1e" roughness={0.9} flatShading transparent={locked} opacity={dim} />
              </mesh>
            )),
          )}
        </group>
      )}

      {/* Winding path */}
      {!wire &&
        pins.slice(0, -1).map((pin, i) => {
          const next = pins[i + 1]!;
          const mx = (pin.x + next.x) / 2;
          const mz = (pin.z + next.z) / 2;
          const dx = next.x - pin.x;
          const dz = next.z - pin.z;
          const len = Math.hypot(dx, dz);
          const ang = Math.atan2(dx, dz);
          return (
            <mesh
              key={`path-${i}`}
              rotation={[-Math.PI / 2, 0, -ang]}
              position={[mx, 0.14, mz]}
              receiveShadow
            >
              <planeGeometry args={[0.14, len]} />
              <meshStandardMaterial color="#9ca3af" roughness={0.95} transparent={locked} opacity={dim} />
            </mesh>
          );
        })}

      {/* Tiny houses with windows */}
      {!wire &&
        houses.map((h, i) => (
          <group key={i} position={[h.x, 0.18, h.z]} rotation={[0, h.rot, 0]} scale={h.s * 8}>
            <mesh castShadow position={[0, 0.12, 0]}>
              <boxGeometry args={[0.24, 0.22, 0.2]} />
              <meshStandardMaterial color={h.body} roughness={0.7} flatShading transparent={locked} opacity={dim} />
            </mesh>
            <mesh castShadow position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.2, 0.18, 4]} />
              <meshStandardMaterial
                color={look.accent}
                roughness={0.65}
                flatShading
                transparent={locked}
                opacity={dim}
              />
            </mesh>
            <mesh position={[0, 0.12, 0.11]}>
              <boxGeometry args={[0.06, 0.1, 0.02]} />
              <meshStandardMaterial color="#5c3a1e" roughness={0.8} transparent={locked} opacity={dim} />
            </mesh>
            <mesh position={[-0.07, 0.14, 0.11]}>
              <boxGeometry args={[0.05, 0.05, 0.015]} />
              <meshStandardMaterial color="#7dd3fc" roughness={0.3} transparent={locked} opacity={dim} />
            </mesh>
          </group>
        ))}

      {/* Pin markers */}
      {!wire &&
        pins.map((pin, i) => (
          <group key={`pin-${i}`} position={[pin.x, 0.2, pin.z]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.035, 0.035, 0.28, 8]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.5} transparent={locked} opacity={dim} />
            </mesh>
            <mesh castShadow position={[0, 0.18, 0]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshStandardMaterial
                color={current ? look.accent : "#ffffff"}
                roughness={0.35}
                metalness={0.15}
                transparent={locked}
                opacity={dim}
              />
            </mesh>
          </group>
        ))}

      {/* Soft clouds tucked near peaks */}
      {!wire &&
        [
          [-1.2, 1.4, -0.4],
          [1.0, 1.6, 0.3],
          [0.2, 1.85, -0.8],
          [-0.4, 1.55, 0.6],
        ].map((c, i) => (
          <mesh key={`cloud-${i}`} position={c as [number, number, number]}>
            <sphereGeometry args={[0.22 + (i % 2) * 0.08, 8, 6]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.85} roughness={1} />
          </mesh>
        ))}

      {/* Selection ring */}
      {(selected || hovered || current) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
          <ringGeometry args={[2.4, 2.6, 32]} />
          <meshBasicMaterial
            color={current ? look.accent : selected || hovered ? "#fef08a" : "#fff"}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Label ON TOP of the diorama */}
      <Billboard position={[0, 2.65, 0]} follow>
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[2.8, locked || subtitle ? 0.85 : 0.55]} />
          <meshBasicMaterial color="#fef3c7" transparent opacity={0.92} depthWrite={false} />
        </mesh>
        <Text
          fontSize={0.28}
          color="#16283b"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#ffffff"
          position={[0, subtitle || locked ? 0.12 : 0, 0]}
        >
          {locked ? `🔒 ${title}` : title}
        </Text>
        {(subtitle || current) && (
          <Text
            fontSize={0.16}
            color={look.accent}
            anchorX="center"
            anchorY="middle"
            position={[0, -0.18, 0]}
            outlineWidth={0.01}
            outlineColor="#16283b"
          >
            {current ? "You are here" : subtitle || ""}
          </Text>
        )}
      </Billboard>
    </group>
  );
}

/** Decorative contact blob under a diorama row (optional). */
export function DioramaGroundShadow({ position }: { position: [number, number, number] }) {
  return (
    <ContactShadows
      position={position}
      opacity={0.35}
      scale={12}
      blur={2.5}
      far={4}
      color="#0c1622"
    />
  );
}
