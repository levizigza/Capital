/**
 * Pillar 10 — Money Structure part silhouettes.
 * Every pad must read in <1s without HUD labels (Pages skips troika Text).
 */

type Props = {
  partId: string;
};

/** Screw-top lid hatch — Cove Soft Beat (Lid Lookout). */
function LidLookoutSilhouette() {
  return (
    <group>
      <mesh castShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.16, 28]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.78, 0.82, 0.22, 24]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.45} roughness={0.35} />
      </mesh>
      {/* Screw ridges */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[0, 0.12 + i * 0.05, 0]}
          rotation={[0, (i * Math.PI) / 4, 0]}
        >
          <torusGeometry args={[0.88, 0.035, 6, 24]} />
          <meshStandardMaterial color="#d97706" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {/* Hatch eye / lookout slit */}
      <mesh castShadow position={[0, 0.38, 0.35]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.55, 0.22, 0.12]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.55}
          metalness={0.2}
          roughness={0.35}
        />
      </mesh>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.28, 0.35, 0.12]} />
        <meshStandardMaterial color="#b45309" roughness={0.65} />
      </mesh>
    </group>
  );
}

/** Payday stamp press — distinct from Coin Spring coil. */
function StampPressSilhouette() {
  return (
    <group>
      <mesh castShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[1.1, 0.25, 0.7]} />
        <meshStandardMaterial color="#78716c" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.9, 12]} />
        <meshStandardMaterial color="#a8a29e" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[0.7, 0.22, 0.55]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0, -0.02, 0.05]}>
        <boxGeometry args={[0.45, 0.08, 0.35]} />
        <meshStandardMaterial color="#fde68a" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** Crenellated battlement wall — Credit Soft Beat. */
function ScoreBattlementSilhouette() {
  return (
    <group>
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1.5, 0.7, 0.45]} />
        <meshStandardMaterial color="#78716c" metalness={0.25} roughness={0.55} />
      </mesh>
      {([-0.55, 0, 0.55] as const).map((x) => (
        <mesh key={x} castShadow position={[x, 0.7, 0]}>
          <boxGeometry args={[0.32, 0.4, 0.4]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 1.05, 0.05]}>
        <cylinderGeometry args={[0.12, 0.14, 0.55, 10]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={0.45}
          metalness={0.4}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

/**
 * Unique mesh per Money Structure part id.
 * Soft Beat pads (lid_lookout · teller_window · umbrella_loft · score_battlement)
 * must silhouette-read without Billboard text.
 */
export function StructurePartSilhouette({ partId }: Props) {
  if (partId === "lid_lookout") {
    return <LidLookoutSilhouette />;
  }
  if (partId === "cork_vault") {
    return (
      <mesh castShadow>
        <cylinderGeometry args={[0.55, 0.65, 1.1, 12]} />
        <meshStandardMaterial color="#b45309" roughness={0.75} metalness={0.05} />
      </mesh>
    );
  }
  if (partId === "vault_safe") {
    return (
      <group>
        <mesh castShadow>
          <cylinderGeometry args={[0.55, 0.65, 1.1, 12]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.45} metalness={0.55} />
        </mesh>
        <mesh castShadow position={[0, 0.15, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.12, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.65} roughness={0.3} />
        </mesh>
      </group>
    );
  }
  if (partId === "coin_spring") {
    return (
      <mesh rotation={[0.4, 0, 0]} castShadow>
        <torusGeometry args={[0.55, 0.14, 8, 24]} />
        <meshStandardMaterial color="#d97706" metalness={0.55} roughness={0.35} />
      </mesh>
    );
  }
  if (partId === "stamp_press") {
    return <StampPressSilhouette />;
  }
  if (partId === "teller_window") {
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.05, 0.18]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.25} roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 0.05, 0.12]}>
          <boxGeometry args={[1.15, 0.55, 0.06]} />
          <meshStandardMaterial
            color="#67e8f9"
            emissive="#0891b2"
            emissiveIntensity={0.35}
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh castShadow position={[0, -0.55, 0.2]}>
          <boxGeometry args={[1.6, 0.18, 0.55]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.15} roughness={0.5} />
        </mesh>
      </group>
    );
  }
  if (partId === "budget_press") {
    return (
      <group>
        {([-0.55, 0, 0.55] as const).map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.4, 0.85, 0.4]} />
            <meshStandardMaterial
              color={i === 0 ? "#22c55e" : i === 1 ? "#f59e0b" : "#38bdf8"}
              metalness={0.2}
              roughness={0.45}
            />
          </mesh>
        ))}
      </group>
    );
  }
  if (partId === "time_clock") {
    return (
      <group>
        <mesh castShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.22, 24]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.25} roughness={0.35} />
        </mesh>
        <mesh castShadow position={[0, 0.12, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.08, 0.45, 0.06]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh castShadow position={[0, 0.12, 0]} rotation={[0, 0, 0.9]}>
          <boxGeometry args={[0.06, 0.32, 0.06]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
      </group>
    );
  }
  if (partId === "umbrella_loft") {
    return (
      <group>
        <mesh castShadow position={[0, 0.15, 0]}>
          <coneGeometry args={[0.9, 1.15, 14]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.15} roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.7, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
      </group>
    );
  }
  if (partId === "debt_anvil") {
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.45, 0.7]} />
          <meshStandardMaterial color="#78716c" metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh castShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[0.7, 0.35, 0.45]} />
          <meshStandardMaterial color="#a8a29e" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 0.65, 0]}>
          <boxGeometry args={[0.35, 0.12, 0.35]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#7c3aed"
            emissiveIntensity={0.4}
            metalness={0.35}
            roughness={0.4}
          />
        </mesh>
      </group>
    );
  }
  if (partId === "dispatch_hatch") {
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[1.05, 0.85, 0.18]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.2} roughness={0.45} />
        </mesh>
        <mesh castShadow position={[0.35, 0.05, 0.12]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.35, 0.45, 0.06]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.7} />
        </mesh>
      </group>
    );
  }
  if (partId === "score_battlement") {
    return <ScoreBattlementSilhouette />;
  }
  // Unknown part — tall marker so a missing silhouette never reads as a flat disc.
  return (
    <mesh castShadow>
      <cylinderGeometry args={[0.35, 0.45, 1.2, 12]} />
      <meshStandardMaterial color="#f43f5e" metalness={0.2} roughness={0.45} />
    </mesh>
  );
}

/** Every live Money Structure part id must have a named silhouette branch above. */
export const STRUCTURE_PART_SILHOUETTE_IDS = [
  "lid_lookout",
  "cork_vault",
  "vault_safe",
  "coin_spring",
  "stamp_press",
  "teller_window",
  "budget_press",
  "time_clock",
  "umbrella_loft",
  "debt_anvil",
  "dispatch_hatch",
  "score_battlement",
] as const;
