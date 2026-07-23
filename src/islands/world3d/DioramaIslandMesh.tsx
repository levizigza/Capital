import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { EraLook3D } from "./eraLooks";
import { getMapDioramaKit, type MapArchStyle, type MapEcologyStyle, type MapDioramaKit } from "./mapDioramaKits";

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
  /** Island id drives architecture + ecology kit */
  islandId?: string;
  onSelect?: () => void;
  /** Skip drei Text labels (avoids font Suspense blanking the map) */
  hideLabels?: boolean;
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

function ArchBuilding({
  arch,
  look,
  body,
  accent,
  dim,
  locked,
  wire,
}: {
  arch: MapArchStyle;
  look: EraLook3D;
  body: string;
  accent: string;
  dim: number;
  locked?: boolean;
  wire: boolean;
}) {
  const a = accent || look.accent;
  if (arch === "neon_slabs") {
    return (
      <group>
        <mesh castShadow position={[0, 0.35, 0]}>
          <boxGeometry args={[0.22, 0.7, 0.22]} />
          <meshStandardMaterial
            color={body}
            roughness={0.35}
            metalness={0.45}
            emissive={a}
            emissiveIntensity={0.25}
            wireframe={wire}
            transparent={locked}
            opacity={dim}
          />
        </mesh>
        <mesh position={[0, 0.72, 0.12]}>
          <boxGeometry args={[0.18, 0.06, 0.04]} />
          <meshStandardMaterial color={a} emissive={a} emissiveIntensity={0.85} transparent={locked} opacity={dim} />
        </mesh>
      </group>
    );
  }
  if (arch === "solar_domes") {
    return (
      <group>
        <mesh castShadow position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.14, 0.16, 0.18, 8]} />
          <meshStandardMaterial color={body} roughness={0.7} flatShading wireframe={wire} transparent={locked} opacity={dim} />
        </mesh>
        <mesh castShadow position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.16, 10, 8]} />
          <meshStandardMaterial
            color={a}
            emissive={a}
            emissiveIntensity={0.2}
            roughness={0.4}
            metalness={0.35}
            transparent={locked}
            opacity={dim}
          />
        </mesh>
      </group>
    );
  }
  if (arch === "gene_bulbs") {
    return (
      <group>
        <mesh castShadow position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.2, 10, 8]} />
          <meshStandardMaterial
            color={body}
            emissive={a}
            emissiveIntensity={0.35}
            transparent
            opacity={0.75 * dim}
            roughness={0.25}
          />
        </mesh>
        <mesh castShadow position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.12, 6]} />
          <meshStandardMaterial color="#052e16" roughness={0.8} flatShading transparent={locked} opacity={dim} />
        </mesh>
      </group>
    );
  }
  if (arch === "upload_spires") {
    return (
      <group>
        <mesh castShadow position={[0, 0.45, 0]}>
          <coneGeometry args={[0.12, 0.9, 5]} />
          <meshStandardMaterial
            color={body}
            emissive={a}
            emissiveIntensity={0.35}
            roughness={0.3}
            metalness={0.4}
            flatShading
            wireframe={wire}
            transparent={locked}
            opacity={dim}
          />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial color={a} emissive={a} emissiveIntensity={0.9} transparent={locked} opacity={dim} />
        </mesh>
      </group>
    );
  }
  if (arch === "orbital_habitats") {
    return (
      <group>
        <mesh castShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.28, 10]} />
          <meshStandardMaterial color={body} roughness={0.4} metalness={0.55} wireframe={wire} transparent={locked} opacity={dim} />
        </mesh>
        <mesh castShadow position={[0, 0.42, 0]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.16, 0.03, 6, 12]} />
          <meshStandardMaterial color={a} emissive={a} emissiveIntensity={0.4} metalness={0.5} transparent={locked} opacity={dim} />
        </mesh>
      </group>
    );
  }
  if (arch === "scrap_shacks") {
    return (
      <group>
        <mesh castShadow position={[0, 0.14, 0]} rotation={[0.05, 0.2, 0.08]}>
          <boxGeometry args={[0.28, 0.22, 0.22]} />
          <meshStandardMaterial color={body} roughness={0.95} metalness={0.25} flatShading transparent={locked} opacity={dim} />
        </mesh>
        <mesh castShadow position={[0.05, 0.32, -0.02]} rotation={[0, 0.3, 0.4]}>
          <boxGeometry args={[0.2, 0.06, 0.24]} />
          <meshStandardMaterial color={a} roughness={0.8} metalness={0.35} transparent={locked} opacity={dim} />
        </mesh>
      </group>
    );
  }
  if (arch === "ai_terminals") {
    return (
      <group>
        <mesh castShadow position={[0, 0.28, 0]}>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshStandardMaterial color={body} roughness={0.35} metalness={0.5} wireframe={wire} transparent={locked} opacity={dim} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.28, 0.05, 0.28]} />
          <meshStandardMaterial color={a} emissive={a} emissiveIntensity={0.7} transparent={locked} opacity={dim} />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh castShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[0.24, 0.22, 0.2]} />
        <meshStandardMaterial color={body} roughness={0.7} flatShading transparent={locked} opacity={dim} />
      </mesh>
      <mesh castShadow position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.2, 0.18, 4]} />
        <meshStandardMaterial color={a} roughness={0.65} flatShading transparent={locked} opacity={dim} />
      </mesh>
      <mesh position={[0, 0.12, 0.11]}>
        <boxGeometry args={[0.06, 0.1, 0.02]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} transparent={locked} opacity={dim} />
      </mesh>
    </group>
  );
}

function EcologyProp({
  ecology,
  look,
  moss,
  dim,
  locked,
  wire,
}: {
  ecology: MapEcologyStyle;
  look: EraLook3D;
  moss: string;
  dim: number;
  locked?: boolean;
  wire: boolean;
}) {
  const a = look.accent;
  if (ecology === "neon_pylons") {
    return (
      <group>
        <mesh castShadow position={[0, 0.55, 0]}>
          <boxGeometry args={[0.08, 1.1, 0.08]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.5} roughness={0.4} transparent={locked} opacity={dim} />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.22, 0.06, 0.06]} />
          <meshStandardMaterial color={a} emissive={a} emissiveIntensity={0.9} transparent={locked} opacity={dim} />
        </mesh>
      </group>
    );
  }
  if (ecology === "solar_trees") {
    return (
      <group>
        <mesh castShadow position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.7, 5]} />
          <meshStandardMaterial color="#365314" roughness={0.85} flatShading transparent={locked} opacity={dim} />
        </mesh>
        <mesh castShadow position={[0, 0.75, 0]} rotation={[0.45, 0.2, 0]}>
          <boxGeometry args={[0.45, 0.04, 0.28]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#38bdf8" emissiveIntensity={0.35} metalness={0.5} transparent={locked} opacity={dim} />
        </mesh>
      </group>
    );
  }
  if (ecology === "gene_mangrove") {
    return (
      <group>
        <mesh castShadow position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 0.7, 5]} />
          <meshStandardMaterial color="#14532d" roughness={0.85} flatShading transparent={locked} opacity={dim} />
        </mesh>
        <mesh castShadow position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.22, 8, 6]} />
          <meshStandardMaterial color={a} emissive={a} emissiveIntensity={0.4} transparent opacity={0.7 * dim} />
        </mesh>
      </group>
    );
  }
  if (ecology === "ice_nodes") {
    return (
      <group>
        <mesh castShadow position={[0, 0.45, 0]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial
            color="#e2e8f0"
            emissive={a}
            emissiveIntensity={0.35}
            metalness={0.3}
            roughness={0.25}
            wireframe={wire}
            transparent={locked}
            opacity={dim}
          />
        </mesh>
      </group>
    );
  }
  if (ecology === "scrap_wrecks") {
    return (
      <group>
        <mesh castShadow position={[0, 0.18, 0]} rotation={[0.2, 0.4, 0.1]}>
          <boxGeometry args={[0.4, 0.14, 0.22]} />
          <meshStandardMaterial color="#57534e" metalness={0.4} roughness={0.9} transparent={locked} opacity={dim} />
        </mesh>
        <mesh castShadow position={[0.1, 0.4, 0]} rotation={[0, 0.2, 0.5]}>
          <boxGeometry args={[0.08, 0.45, 0.08]} />
          <meshStandardMaterial color={a} metalness={0.35} roughness={0.7} transparent={locked} opacity={dim} />
        </mesh>
      </group>
    );
  }
  if (ecology === "orbital_dishes") {
    return (
      <group>
        <mesh castShadow position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 0.55, 6]} />
          <meshStandardMaterial color="#64748b" metalness={0.55} roughness={0.4} transparent={locked} opacity={dim} />
        </mesh>
        <mesh castShadow position={[0, 0.7, 0]} rotation={[0.6, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.35} transparent={locked} opacity={dim} />
        </mesh>
      </group>
    );
  }
  if (ecology === "mind_crystals") {
    return (
      <group>
        <mesh castShadow position={[0, 0.4, 0]}>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#ddd6fe" emissive={a} emissiveIntensity={0.55} roughness={0.25} transparent={locked} opacity={dim} />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 0.7, 5]} />
        <meshStandardMaterial color="#6b4a2a" roughness={0.9} flatShading transparent={locked} opacity={dim} />
      </mesh>
      {[0, 1, 2, 3].map((j) => (
        <mesh
          key={j}
          castShadow
          position={[Math.cos((j / 4) * Math.PI * 2) * 0.22, 0.72, Math.sin((j / 4) * Math.PI * 2) * 0.22]}
          rotation={[0.7, (j / 4) * Math.PI * 2, 0]}
        >
          <coneGeometry args={[0.14, 0.4, 4]} />
          <meshStandardMaterial color={moss} roughness={0.75} flatShading transparent={locked} opacity={dim} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Floating isometric diorama — genre kits swap architecture + ecology
 * so each mini-world reads distinct on the voyage map.
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
  islandId,
  onSelect,
  hideLabels = false,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const wire = look.shading === "wire" || look.shading === "vector";
  const rock = look.shading === "neon" ? look.accent : "#8a8580";
  const moss = look.land;
  const sand = look.shore;
  const kit: MapDioramaKit = useMemo(() => getMapDioramaKit(islandId ?? seed), [islandId, seed]);
  const strata = useMemo(() => {
    if (kit.arch === "neon_slabs") return ["#1e1b4b", "#312e81", "#4c1d95", "#86198f", "#22d3ee"];
    if (kit.arch === "scrap_shacks") return ["#1c1917", "#44403c", "#78716c", "#a8a29e", "#fb923c"];
    if (kit.arch === "ai_terminals") return ["#020617", "#0f172a", "#1e293b", "#334155", "#94a3b8"];
    if (kit.arch === "upload_spires") return ["#4c1d95", "#6b21a8", "#a855f7", "#ddd6fe", "#f5f3ff"];
    if (kit.arch === "orbital_habitats") return ["#0c4a6e", "#0369a1", "#38bdf8", "#cbd5e1", "#e2e8f0"];
    if (kit.arch === "gene_bulbs") return ["#022c22", "#064e3b", "#14532d", "#166534", "#34d399"];
    if (kit.arch === "solar_domes") return ["#365314", "#4d7c0f", "#65a30d", "#a3e635", "#fef08a"];
    return ["#4a3728", "#6b4f2a", "#8b6914", "#c4a574", "#e8d5b5"];
  }, [kit.arch]);

  const peaks = useMemo(() => {
    const n = kit.arch === "orbital_habitats" || kit.arch === "ai_terminals" ? 3 : 5 + Math.floor(hash(seed) * 3);
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
  }, [seed, kit.arch]);

  const buildings = useMemo(() => {
    return Array.from({ length: kit.buildingCount }, (_, i) => ({
      x: -1.05 + hash(`${seed}-hx${i}`) * 2.1,
      z: -0.55 + hash(`${seed}-hz${i}`) * 1.35,
      rot: hash(`${seed}-hr${i}`) * Math.PI,
      s: 0.55 + hash(`${seed}-hs${i}`) * 0.45,
      body: kit.houseBodies[Math.floor(hash(`${seed}-hb${i}`) * kit.houseBodies.length)]!,
    }));
  }, [seed, kit]);

  const ecology = useMemo(() => {
    return Array.from({ length: kit.ecologyCount }, (_, i) => {
      const a = hash(`${seed}-pa${i}`) * Math.PI * 2;
      const r = 1.15 + hash(`${seed}-pr${i}`) * 0.45;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r * 0.8,
        s: 0.55 + hash(`${seed}-ps${i}`) * 0.4,
      };
    });
  }, [seed, kit]);

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
  const roofAccent = look.accent || kit.roofAccentFallback;

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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]}>
        <circleGeometry args={[2.55, 24]} />
        <meshBasicMaterial color="#0c1622" transparent opacity={0.2} />
      </mesh>

      {strata.map((c, i) => (
        <mesh key={`${c}-${i}`} castShadow receiveShadow position={[0, -0.9 + i * 0.16, 0]}>
          <boxGeometry args={[3.7 - i * 0.06, 0.18, 2.8 - i * 0.05]} />
          <meshStandardMaterial color={c} roughness={0.9} flatShading wireframe={wire} transparent={locked} opacity={dim} />
        </mesh>
      ))}

      {!wire &&
        cliffs.map((c, i) => (
          <mesh key={`cliff-${i}`} castShadow position={[c.x, -0.15, c.z]} rotation={[0.2, c.rot, 0.1]}>
            <boxGeometry args={[0.45, c.h, 0.35]} />
            <meshStandardMaterial color={rock} roughness={0.94} flatShading transparent={locked} opacity={dim} />
          </mesh>
        ))}

      <mesh castShadow receiveShadow position={[0, -0.02, 0]}>
        <boxGeometry args={[3.55, 0.16, 2.65]} />
        <meshStandardMaterial color={sand} roughness={0.85} flatShading wireframe={wire} transparent={locked} opacity={dim} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[3.35, 0.1, 2.45]} />
        <meshStandardMaterial color={moss} roughness={0.8} flatShading wireframe={wire} transparent={locked} opacity={dim} />
      </mesh>
      {!wire && (
        <mesh rotation={[-Math.PI / 2, 0, 0.2]} position={[0.2, 0.12, 1.05]} receiveShadow>
          <planeGeometry args={[2.4, 0.55]} />
          <meshStandardMaterial color={sand} roughness={0.92} transparent={locked} opacity={dim} />
        </mesh>
      )}

      {peaks.map((p, i) => (
        <group key={i} position={[p.x, 0.1, p.z]}>
          <mesh castShadow position={[0, p.h * 0.45, 0]}>
            <coneGeometry args={[p.w, p.h, look.shading === "lowpoly" ? 5 : 7]} />
            <meshStandardMaterial color={rock} roughness={0.92} flatShading wireframe={wire} transparent={locked} opacity={dim} />
          </mesh>
          {!wire && kit.ecology !== "ice_nodes" && kit.ecology !== "neon_pylons" ? (
            <mesh castShadow position={[0, p.h * 0.75, 0]}>
              <sphereGeometry args={[p.w * 0.45, 8, 6]} />
              <meshStandardMaterial color={moss} roughness={0.75} flatShading transparent={locked} opacity={dim} />
            </mesh>
          ) : null}
        </group>
      ))}

      {!wire &&
        ecology.map((p, i) => (
          <group key={`eco-${i}`} position={[p.x, 0.12, p.z]} scale={p.s}>
            <EcologyProp ecology={kit.ecology} look={look} moss={moss} dim={dim} locked={locked} wire={wire} />
          </group>
        ))}

      {!wire && (kit.arch === "harbor_cottages" || kit.arch === "solar_domes" || kit.arch === "scrap_shacks") ? (
        <group position={[0.15, 0.12, 1.25]} rotation={[0, 0.15, 0]}>
          {[-0.12, 0.12].map((x) => (
            <mesh key={x} castShadow receiveShadow position={[x, 0.04, 0.25]}>
              <boxGeometry args={[0.1, 0.05, 0.7]} />
              <meshStandardMaterial color="#8b5a2b" roughness={0.88} flatShading transparent={locked} opacity={dim} />
            </mesh>
          ))}
        </group>
      ) : null}

      {!wire && (kit.arch === "neon_slabs" || kit.arch === "orbital_habitats" || kit.arch === "ai_terminals") ? (
        <mesh position={[0, 0.14, 1.2]}>
          <boxGeometry args={[1.4, 0.06, 0.35]} />
          <meshStandardMaterial
            color={roofAccent}
            emissive={roofAccent}
            emissiveIntensity={0.45}
            metalness={0.4}
            transparent={locked}
            opacity={dim}
          />
        </mesh>
      ) : null}

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
            <mesh key={`path-${i}`} rotation={[-Math.PI / 2, 0, -ang]} position={[mx, 0.14, mz]} receiveShadow>
              <planeGeometry args={[0.14, len]} />
              <meshStandardMaterial color="#9ca3af" roughness={0.95} transparent={locked} opacity={dim} />
            </mesh>
          );
        })}

      {!wire &&
        buildings.map((h, i) => (
          <group key={i} position={[h.x, 0.18, h.z]} rotation={[0, h.rot, 0]} scale={h.s}>
            <ArchBuilding
              arch={kit.arch}
              look={look}
              body={h.body}
              accent={roofAccent}
              dim={dim}
              locked={locked}
              wire={wire}
            />
          </group>
        ))}

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

      {!hideLabels ? (
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
      ) : null}
    </group>
  );
}

export function DioramaGroundShadow({ position }: { position: [number, number, number] }) {
  return (
    <ContactShadows position={position} opacity={0.35} scale={12} blur={2.5} far={4} color="#0c1622" />
  );
}
