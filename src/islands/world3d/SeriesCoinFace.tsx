import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SERIES_SHEET_SPECS } from "../../art/seriesCast/seriesLeadArt";
import { getMascot } from "../moneyCast";
import { colorHex } from "../character";

type Props = {
  id: string;
  /** World radius of the coin disc */
  radius?: number;
  spin?: boolean;
  selected?: boolean;
};

/**
 * Face-forward spinning coin portrait — distinct silhouette hooks per series lead.
 * Used on the Street Fighter select grid (lightweight vs full VoyagerMesh).
 */
export function SeriesCoinFace({ id, radius = 0.42, spin = true, selected = false }: Props) {
  const group = useRef<THREE.Group>(null);
  const spec = SERIES_SHEET_SPECS[id];
  const mascot = getMascot(id);
  const coin = spec?.coin ?? "#f4b942";
  const eye = spec?.eye ?? "#14532d";
  const accent = spec?.accent ?? "#fde68a";
  const coat = spec?.coat ?? colorHex(mascot.color);
  const glyph = mascot.glyph ?? "$";
  const thick = radius * 0.22;

  useFrame((_, dt) => {
    if (!group.current || !spin) return;
    group.current.rotation.y += dt * (selected ? 1.35 : 0.7);
  });

  return (
    <group ref={group}>
      {/* Disc faces camera when rotation.y ≈ 0; spins for select flair */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, thick, 36]} />
        <meshStandardMaterial color={coin} metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, thick * 0.52]}>
        <ringGeometry args={[radius * 0.78, radius * 0.98, 36]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, thick * 0.5]}>
        <circleGeometry args={[radius * 0.78, 36]} />
        <meshStandardMaterial color={coin} metalness={0.45} roughness={0.35} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-radius * 0.28, radius * 0.12, thick * 0.62]}>
        <sphereGeometry args={[radius * 0.14, 12, 10]} />
        <meshStandardMaterial color="#fffbeb" roughness={0.4} />
      </mesh>
      <mesh position={[radius * 0.28, radius * 0.12, thick * 0.62]}>
        <sphereGeometry args={[radius * 0.14, 12, 10]} />
        <meshStandardMaterial color="#fffbeb" roughness={0.4} />
      </mesh>
      <mesh position={[-radius * 0.28, radius * 0.12, thick * 0.72]}>
        <sphereGeometry args={[radius * 0.07, 10, 8]} />
        <meshStandardMaterial color={eye} emissive={eye} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[radius * 0.28, radius * 0.12, thick * 0.72]}>
        <sphereGeometry args={[radius * 0.07, 10, 8]} />
        <meshStandardMaterial color={eye} emissive={eye} emissiveIntensity={0.35} />
      </mesh>

      {/* Per-lead face hooks */}
      <CoinHooks id={id} radius={radius} thick={thick} coat={coat} accent={accent} glyph={glyph} />

      {selected ? (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -thick * 0.2]}>
          <torusGeometry args={[radius * 1.12, radius * 0.06, 8, 28]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.65} />
        </mesh>
      ) : null}
    </group>
  );
}

function CoinHooks({
  id,
  radius: r,
  thick: t,
  coat,
  accent,
  glyph,
}: {
  id: string;
  radius: number;
  thick: number;
  coat: string;
  accent: string;
  glyph: string;
}) {
  const z = t * 0.7;
  const brow = (
    <>
      <mesh position={[-r * 0.28, r * 0.28, z]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[r * 0.22, r * 0.04, r * 0.03]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[r * 0.28, r * 0.28, z]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[r * 0.22, r * 0.04, r * 0.03]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </>
  );

  if (id === "cashwell") {
    return (
      <group>
        {/* Tall top-hat silhouette on crown */}
        <mesh position={[0, r * 0.95, 0]}>
          <cylinderGeometry args={[r * 0.28, r * 0.32, r * 0.55, 14]} />
          <meshStandardMaterial color={coat} roughness={0.5} />
        </mesh>
        <mesh position={[0, r * 0.68, 0]}>
          <cylinderGeometry args={[r * 0.55, r * 0.55, r * 0.08, 18]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0, r * 0.78, r * 0.34]}>
          <circleGeometry args={[r * 0.12, 14]} />
          <meshStandardMaterial color={accent} />
        </mesh>
        {/* Mustache */}
        <mesh position={[-r * 0.18, -r * 0.05, z]} rotation={[0, 0, 0.4]}>
          <capsuleGeometry args={[r * 0.04, r * 0.18, 4, 6]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[r * 0.18, -r * 0.05, z]} rotation={[0, 0, -0.4]}>
          <capsuleGeometry args={[r * 0.04, r * 0.18, 4, 6]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <Glyph mark="$" y={r * 0.42} z={z} r={r} color={coat} />
      </group>
    );
  }

  if (id === "cashmere") {
    return (
      <group>
        {brow}
        {/* Blonde waves */}
        <mesh position={[-r * 0.85, 0, 0]}>
          <sphereGeometry args={[r * 0.32, 12, 10]} />
          <meshStandardMaterial color="#f4b942" roughness={0.55} />
        </mesh>
        <mesh position={[r * 0.85, 0, 0]}>
          <sphereGeometry args={[r * 0.32, 12, 10]} />
          <meshStandardMaterial color="#f4b942" roughness={0.55} />
        </mesh>
        {/* Cocktail hat */}
        <mesh position={[r * 0.25, r * 0.85, r * 0.1]}>
          <cylinderGeometry args={[r * 0.22, r * 0.26, r * 0.1, 14]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[r * 0.25, r * 0.95, r * 0.1]}>
          <sphereGeometry args={[r * 0.08, 8, 6]} />
          <meshStandardMaterial color={accent} />
        </mesh>
        {/* Lips */}
        <mesh position={[0, -r * 0.22, z]}>
          <boxGeometry args={[r * 0.22, r * 0.06, r * 0.03]} />
          <meshStandardMaterial color="#9f1239" />
        </mesh>
        {/* Pearl */}
        <mesh position={[0, -r * 0.55, z]}>
          <sphereGeometry args={[r * 0.08, 8, 6]} />
          <meshStandardMaterial color="#fafaf9" metalness={0.3} />
        </mesh>
      </group>
    );
  }

  if (id === "peso_pedro") {
    return (
      <group>
        <mesh position={[0, r * 0.75, 0]}>
          <cylinderGeometry args={[r * 1.15, r * 1.05, r * 0.1, 24]} />
          <meshStandardMaterial color={coat} roughness={0.5} />
        </mesh>
        <mesh position={[0, r * 0.95, 0]}>
          <cylinderGeometry args={[r * 0.35, r * 0.42, r * 0.28, 16]} />
          <meshStandardMaterial color={coat} />
        </mesh>
        <mesh position={[-r * 0.18, -r * 0.08, z]} rotation={[0, 0, 0.45]}>
          <capsuleGeometry args={[r * 0.035, r * 0.16, 4, 6]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[r * 0.18, -r * 0.08, z]} rotation={[0, 0, -0.45]}>
          <capsuleGeometry args={[r * 0.035, r * 0.16, 4, 6]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <Glyph mark="P" y={r * 0.35} z={z} r={r} color={coat} />
      </group>
    );
  }

  if (id === "fortuna_fernanda") {
    return (
      <group>
        {brow}
        <mesh position={[-r * 0.8, -r * 0.05, 0]}>
          <sphereGeometry args={[r * 0.3, 12, 10]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>
        <mesh position={[r * 0.8, -r * 0.05, 0]}>
          <sphereGeometry args={[r * 0.3, 12, 10]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>
        {[-0.35, 0, 0.35].map((x, i) => (
          <mesh key={i} position={[r * x, r * 0.9, r * 0.05]}>
            <sphereGeometry args={[r * 0.14, 10, 8]} />
            <meshStandardMaterial color={i === 1 ? accent : "#b91c1c"} />
          </mesh>
        ))}
        <mesh position={[0, -r * 0.22, z]}>
          <boxGeometry args={[r * 0.2, r * 0.05, r * 0.03]} />
          <meshStandardMaterial color="#9f1239" />
        </mesh>
      </group>
    );
  }

  if (id === "billionaire_bao") {
    return (
      <group>
        {brow}
        <mesh position={[0, r * 0.75, -r * 0.1]}>
          <sphereGeometry args={[r * 0.45, 14, 12]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <Glyph mark="BB" y={r * 0.4} z={z} r={r} color={coat} size={0.28} />
        <mesh position={[0, -r * 0.2, z]}>
          <boxGeometry args={[r * 0.16, r * 0.04, r * 0.02]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      </group>
    );
  }

  if (id === "jade_fortune") {
    return (
      <group>
        {brow}
        <mesh position={[0, r * 0.85, 0]}>
          <sphereGeometry args={[r * 0.35, 12, 10]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        {/* Square hole */}
        <mesh position={[0, r * 0.42, z]}>
          <boxGeometry args={[r * 0.2, r * 0.2, r * 0.06]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[-r * 0.45, r * 0.95, 0]} rotation={[0, 0, 0.4]}>
          <capsuleGeometry args={[r * 0.03, r * 0.25, 3, 5]} />
          <meshStandardMaterial color={accent} metalness={0.4} />
        </mesh>
        <mesh position={[r * 0.45, r * 0.95, 0]} rotation={[0, 0, -0.4]}>
          <capsuleGeometry args={[r * 0.03, r * 0.25, 3, 5]} />
          <meshStandardMaterial color="#f4b942" />
        </mesh>
      </group>
    );
  }

  if (id === "sultan_stacks") {
    return (
      <group>
        <mesh position={[0, r * 0.85, 0]}>
          <sphereGeometry args={[r * 0.5, 16, 12]} />
          <meshStandardMaterial color={accent} roughness={0.65} />
        </mesh>
        <mesh position={[0, r * 0.95, 0]}>
          <sphereGeometry args={[r * 0.35, 14, 12]} />
          <meshStandardMaterial color={coat} />
        </mesh>
        <mesh position={[0, r * 1.25, 0]}>
          <torusGeometry args={[r * 0.12, r * 0.04, 6, 14, Math.PI * 1.4]} />
          <meshStandardMaterial color="#f4b942" />
        </mesh>
        <mesh position={[-r * 0.18, -r * 0.05, z]} rotation={[0, 0, 0.4]}>
          <capsuleGeometry args={[r * 0.04, r * 0.16, 4, 6]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[r * 0.18, -r * 0.05, z]} rotation={[0, 0, -0.4]}>
          <capsuleGeometry args={[r * 0.04, r * 0.16, 4, 6]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0, -r * 0.28, z]}>
          <capsuleGeometry args={[r * 0.035, r * 0.12, 4, 6]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <Glyph mark="$" y={r * 0.35} z={z} r={r} color={coat} />
      </group>
    );
  }

  if (id === "dinar_dahlia") {
    return (
      <group>
        {brow}
        <mesh position={[-r * 0.75, 0, 0]}>
          <sphereGeometry args={[r * 0.28, 12, 10]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[r * 0.75, 0, 0]}>
          <sphereGeometry args={[r * 0.28, 12, 10]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0, r * 0.95, 0]}>
          <cylinderGeometry args={[r * 0.4, r * 0.48, r * 0.14, 12]} />
          <meshStandardMaterial color="#f4b942" />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          return (
            <mesh key={i} position={[Math.cos(a) * r * 0.35, r * 1.1, Math.sin(a) * r * 0.1]}>
              <coneGeometry args={[r * 0.06, r * 0.14, 5]} />
              <meshStandardMaterial color="#f4b942" />
            </mesh>
          );
        })}
        <Glyph mark="DD" y={r * 0.38} z={z} r={r} color={coat} size={0.26} />
        <mesh position={[0, -r * 0.22, z]}>
          <boxGeometry args={[r * 0.2, r * 0.05, r * 0.03]} />
          <meshStandardMaterial color="#9f1239" />
        </mesh>
      </group>
    );
  }

  if (id === "mansa_moneybaggs") {
    return (
      <group>
        <mesh position={[0, r * 0.85, 0]}>
          <sphereGeometry args={[r * 0.48, 14, 12]} />
          <meshStandardMaterial color={accent} />
        </mesh>
        <mesh position={[0, r * 1.15, 0]}>
          <cylinderGeometry args={[r * 0.2, r * 0.28, r * 0.12, 10]} />
          <meshStandardMaterial color="#f4b942" />
        </mesh>
        {/* Gold mask */}
        <mesh position={[0, r * 0.18, z]}>
          <boxGeometry args={[r * 0.85, r * 0.35, r * 0.06]} />
          <meshStandardMaterial color="#f4b942" metalness={0.5} />
        </mesh>
        <mesh position={[0, -r * 0.4, z * 0.8]}>
          <sphereGeometry args={[r * 0.35, 12, 10]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <Glyph mark="M" y={r * 0.48} z={z * 1.1} r={r} color={coat} />
      </group>
    );
  }

  if (id === "kandake_kash") {
    return (
      <group>
        {brow}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          return (
            <group key={i} position={[Math.cos(a) * r * 0.55, r * 0.75 + Math.sin(a) * r * 0.15, 0]}>
              <mesh>
                <capsuleGeometry args={[r * 0.08, r * 0.28, 4, 6]} />
                <meshStandardMaterial color="#0a0a0a" />
              </mesh>
              <mesh position={[0, r * 0.08, 0]}>
                <torusGeometry args={[r * 0.09, r * 0.025, 6, 10]} />
                <meshStandardMaterial color="#f4b942" />
              </mesh>
            </group>
          );
        })}
        <Glyph mark="KK" y={r * 0.35} z={z} r={r} color={coat} size={0.26} />
        <mesh position={[0, -r * 0.22, z]}>
          <boxGeometry args={[r * 0.2, r * 0.05, r * 0.03]} />
          <meshStandardMaterial color="#9f1239" />
        </mesh>
      </group>
    );
  }

  if (id === "moneybagg_bro") {
    return (
      <group>
        {brow}
        {/* Durag */}
        <mesh position={[0, r * 0.7, -r * 0.05]}>
          <sphereGeometry args={[r * 0.55, 14, 12]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0, r * 0.35, -r * 0.55]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[r * 0.2, r * 0.3, r * 0.08]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        {/* Mini $ crown */}
        <mesh position={[0, r * 0.95, r * 0.25]}>
          <cylinderGeometry args={[r * 0.14, r * 0.18, r * 0.12, 8]} />
          <meshStandardMaterial color="#f4b942" />
        </mesh>
        <Glyph mark="MB" y={r * 0.35} z={z} r={r} color={coat} size={0.26} />
        {/* Grin */}
        <mesh position={[0, -r * 0.22, z]}>
          <boxGeometry args={[r * 0.4, r * 0.08, r * 0.04]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0, -r * 0.22, z * 1.1]}>
          <boxGeometry args={[r * 0.28, r * 0.04, r * 0.03]} />
          <meshStandardMaterial color="#fffbeb" />
        </mesh>
      </group>
    );
  }

  if (id === "mula_mami") {
    return (
      <group>
        {brow}
        <mesh position={[0, r * 0.95, 0]}>
          <sphereGeometry args={[r * 0.28, 12, 10]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0, r * 0.7, -r * 0.05]}>
          <sphereGeometry args={[r * 0.5, 14, 12]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        {/* $ hoops */}
        {([-1, 1] as const).map((side) => (
          <mesh key={side} position={[side * r * 0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[r * 0.2, r * 0.04, 8, 18]} />
            <meshStandardMaterial color="#f4b942" metalness={0.5} />
          </mesh>
        ))}
        <Glyph mark="MM" y={r * 0.35} z={z} r={r} color={coat} size={0.26} />
        <mesh position={[0, -r * 0.22, z]}>
          <boxGeometry args={[r * 0.2, r * 0.05, r * 0.03]} />
          <meshStandardMaterial color="#9f1239" />
        </mesh>
      </group>
    );
  }

  // Classics / fallback
  return (
    <group>
      <Glyph mark={glyph.slice(0, 2)} y={r * 0.35} z={z} r={r} color={coat} size={glyph.length > 1 ? 0.28 : 0.38} />
      <mesh position={[0, -r * 0.22, z]}>
        <boxGeometry args={[r * 0.22, r * 0.05, r * 0.03]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}

/** Lightweight crest — boxes/tori only (no troika Text on Pages). */
function Glyph({
  mark,
  y,
  z,
  r,
  color,
  size = 0.34,
}: {
  mark: string;
  y: number;
  z: number;
  r: number;
  color: string;
  size?: number;
}) {
  const ink = color === "#f4b942" || color === "#fde68a" ? "#14532d" : "#fde68a";
  if (mark === "$") {
    return (
      <group position={[0, y, z]}>
        <mesh>
          <torusGeometry args={[r * size * 0.28, r * 0.05, 6, 14]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh>
          <boxGeometry args={[r * 0.07, r * size * 1.1, r * 0.05]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  }
  if (mark === "P" || mark === "M") {
    return (
      <group position={[0, y, z]}>
        <mesh position={[-r * 0.1, 0, 0]}>
          <boxGeometry args={[r * 0.1, r * size, r * 0.05]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[r * 0.08, r * size * 0.15, 0]}>
          <torusGeometry args={[r * size * 0.22, r * 0.05, 6, 12, Math.PI]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  }
  // Multi-letter crests — medallion + twin bars
  return (
    <group position={[0, y, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * size * 0.55, r * size * 0.55, r * 0.05, 20]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-r * 0.12, 0, r * 0.04]}>
        <boxGeometry args={[r * 0.08, r * size * 0.7, r * 0.04]} />
        <meshStandardMaterial color={ink} />
      </mesh>
      <mesh position={[r * 0.12, 0, r * 0.04]}>
        <boxGeometry args={[r * 0.08, r * size * 0.7, r * 0.04]} />
        <meshStandardMaterial color={ink} />
      </mesh>
    </group>
  );
}
