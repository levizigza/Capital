import type * as THREE from "three";
import { Text } from "@react-three/drei";
import type { MoneyForm } from "../character";

type Mats = {
  body: THREE.Material;
  ink: THREE.Material;
  paper: THREE.Material;
  gold: THREE.Material;
  dark: THREE.Material;
  eye: THREE.Material;
  blush: THREE.Material;
  pink: THREE.Material;
};

type Props = {
  form: MoneyForm;
  materials: Mats;
  glyph?: string;
};

function Eyes({
  materials,
  y = 0.18,
  z = 0.12,
  spread = 0.14,
}: {
  materials: Mats;
  y?: number;
  z?: number;
  spread?: number;
}) {
  return (
    <>
      <mesh position={[-spread, y, z]} material={materials.eye}>
        <sphereGeometry args={[0.055, 10, 8]} />
      </mesh>
      <mesh position={[spread, y, z]} material={materials.eye}>
        <sphereGeometry args={[0.055, 10, 8]} />
      </mesh>
      <mesh position={[0, y - 0.14, z]} material={materials.blush}>
        <boxGeometry args={[0.12, 0.03, 0.01]} />
      </mesh>
    </>
  );
}

/**
 * Extra money-mascot silhouettes beyond the classic bill/coin/piggy/ledger set.
 * Shared limbs/accessories stay in VoyagerMesh.
 */
export function MascotBody({ form, materials, glyph }: Props) {
  const g = glyph ?? "$";

  if (form === "currency") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.body}>
          <boxGeometry args={[0.72, 1.05, 0.18]} />
        </mesh>
        <mesh position={[0, 0.02, 0.1]} material={materials.paper}>
          <boxGeometry args={[0.55, 0.82, 0.02]} />
        </mesh>
        <Text
          position={[0, 0.08, 0.12]}
          fontSize={0.55}
          color="#16283b"
          anchorX="center"
          anchorY="middle"
        >
          {g}
        </Text>
        <Eyes materials={materials} y={0.32} z={0.13} />
      </group>
    );
  }

  if (form === "stack") {
    return (
      <group position={[0, 0.85, 0]}>
        {[0, 0.12, 0.24, 0.36].map((y, i) => (
          <mesh key={i} castShadow position={[0, y, 0]} material={i % 2 ? materials.paper : materials.body}>
            <boxGeometry args={[0.78, 0.11, 0.36]} />
          </mesh>
        ))}
        <mesh position={[0, 0.48, 0.19]} material={materials.gold}>
          <circleGeometry args={[0.12, 16]} />
        </mesh>
        <Eyes materials={materials} y={0.55} z={0.2} />
      </group>
    );
  }

  if (form === "bag") {
    return (
      <group position={[0, 0.85, 0]}>
        <mesh castShadow material={materials.body}>
          <sphereGeometry args={[0.42, 16, 12]} />
        </mesh>
        <mesh castShadow position={[0, 0.42, 0]} material={materials.ink}>
          <cylinderGeometry args={[0.12, 0.22, 0.22, 10]} />
        </mesh>
        <mesh position={[0, 0.05, 0.4]} material={materials.gold}>
          <circleGeometry args={[0.14, 16]} />
        </mesh>
        <Text position={[0, 0.05, 0.42]} fontSize={0.18} color="#16283b" anchorX="center" anchorY="middle">
          $
        </Text>
        <Eyes materials={materials} y={0.12} z={0.4} />
      </group>
    );
  }

  if (form === "vault") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]} material={materials.body}>
          <cylinderGeometry args={[0.48, 0.48, 0.22, 28]} />
        </mesh>
        <mesh position={[0, 0, 0.12]} material={materials.dark}>
          <circleGeometry args={[0.34, 24]} />
        </mesh>
        <mesh position={[0, 0, 0.14]} material={materials.gold}>
          <torusGeometry args={[0.16, 0.04, 8, 20]} />
        </mesh>
        <mesh position={[0.12, 0, 0.16]} material={materials.ink}>
          <boxGeometry args={[0.14, 0.05, 0.04]} />
        </mesh>
        <Eyes materials={materials} y={0.18} z={0.18} spread={0.16} />
      </group>
    );
  }

  if (form === "receipt") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.paper}>
          <boxGeometry args={[0.55, 1.1, 0.08]} />
        </mesh>
        {[-0.25, -0.1, 0.05, 0.2].map((y, i) => (
          <mesh key={i} position={[0, y, 0.05]} material={materials.ink}>
            <boxGeometry args={[0.38 - i * 0.04, 0.035, 0.01]} />
          </mesh>
        ))}
        <mesh position={[0, -0.55, 0]} material={materials.paper}>
          <coneGeometry args={[0.28, 0.12, 4]} />
        </mesh>
        <Eyes materials={materials} y={0.35} z={0.06} />
      </group>
    );
  }

  if (form === "card") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.body}>
          <boxGeometry args={[0.95, 0.62, 0.1]} />
        </mesh>
        <mesh position={[-0.28, 0.12, 0.06]} material={materials.gold}>
          <boxGeometry args={[0.22, 0.16, 0.02]} />
        </mesh>
        <mesh position={[0.2, -0.12, 0.06]} material={materials.paper}>
          <boxGeometry args={[0.35, 0.05, 0.01]} />
        </mesh>
        <Eyes materials={materials} y={0.08} z={0.07} spread={0.18} />
      </group>
    );
  }

  if (form === "wallet") {
    return (
      <group position={[0, 0.9, 0]}>
        <mesh castShadow material={materials.body}>
          <boxGeometry args={[0.85, 0.55, 0.22]} />
        </mesh>
        <mesh position={[0, 0.08, 0.12]} material={materials.ink}>
          <boxGeometry args={[0.7, 0.08, 0.04]} />
        </mesh>
        <mesh position={[0.1, 0.02, 0.14]} material={materials.gold}>
          <boxGeometry args={[0.35, 0.28, 0.04]} />
        </mesh>
        <Eyes materials={materials} y={0.05} z={0.14} />
      </group>
    );
  }

  if (form === "coupon") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.body}>
          <boxGeometry args={[0.7, 0.85, 0.1]} />
        </mesh>
        <mesh position={[0, 0.05, 0.06]} material={materials.paper}>
          <boxGeometry args={[0.55, 0.55, 0.02]} />
        </mesh>
        <Text
          position={[0, 0.08, 0.08]}
          fontSize={0.28}
          color="#be123c"
          anchorX="center"
          anchorY="middle"
        >
          20%
        </Text>
        <Eyes materials={materials} y={0.32} z={0.08} />
      </group>
    );
  }

  if (form === "ingot") {
    return (
      <group position={[0, 0.85, 0]}>
        <mesh castShadow material={materials.gold}>
          <boxGeometry args={[0.85, 0.45, 0.4]} />
        </mesh>
        <mesh position={[0, 0.12, 0.21]} material={materials.body}>
          <boxGeometry args={[0.55, 0.12, 0.02]} />
        </mesh>
        <Eyes materials={materials} y={0.05} z={0.22} />
      </group>
    );
  }

  if (form === "calc") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.body}>
          <boxGeometry args={[0.7, 0.95, 0.22]} />
        </mesh>
        <mesh position={[0, 0.28, 0.12]} material={materials.dark}>
          <boxGeometry args={[0.55, 0.22, 0.04]} />
        </mesh>
        {[-0.18, 0, 0.18].map((x, i) =>
          [-0.05, -0.22].map((y, j) => (
            <mesh key={`${i}-${j}`} position={[x, y, 0.12]} material={materials.ink}>
              <boxGeometry args={[0.14, 0.1, 0.03]} />
            </mesh>
          )),
        )}
        <Eyes materials={materials} y={0.28} z={0.16} spread={0.12} />
      </group>
    );
  }

  if (form === "cloud") {
    return (
      <group position={[0, 1.0, 0]}>
        <mesh castShadow material={materials.body}>
          <sphereGeometry args={[0.38, 14, 12]} />
        </mesh>
        <mesh castShadow position={[-0.28, -0.05, 0]} material={materials.body}>
          <sphereGeometry args={[0.28, 12, 10]} />
        </mesh>
        <mesh castShadow position={[0.28, -0.05, 0]} material={materials.body}>
          <sphereGeometry args={[0.28, 12, 10]} />
        </mesh>
        <mesh position={[0.2, -0.55, 0]} material={materials.gold}>
          <coneGeometry args={[0.08, 0.35, 5]} />
        </mesh>
        <mesh position={[0.2, -0.85, 0]} material={materials.dark}>
          <sphereGeometry args={[0.14, 10, 8]} />
        </mesh>
        <Text position={[0.2, -0.85, 0.15]} fontSize={0.1} color="#fbbf24" anchorX="center" anchorY="middle">
          DEBT
        </Text>
        <Eyes materials={materials} y={0.05} z={0.32} />
      </group>
    );
  }

  if (form === "chest") {
    return (
      <group position={[0, 0.75, 0]}>
        <mesh castShadow material={materials.body}>
          <boxGeometry args={[0.85, 0.55, 0.55]} />
        </mesh>
        <mesh castShadow position={[0, 0.38, 0]} rotation={[-0.4, 0, 0]} material={materials.body}>
          <boxGeometry args={[0.85, 0.2, 0.55]} />
        </mesh>
        <mesh position={[0, 0.55, 0.05]} material={materials.gold}>
          <sphereGeometry args={[0.1, 8, 6]} />
        </mesh>
        <mesh position={[0.15, 0.55, 0.1]} material={materials.gold}>
          <sphereGeometry args={[0.07, 8, 6]} />
        </mesh>
        <Eyes materials={materials} y={0.05} z={0.3} />
      </group>
    );
  }

  if (form === "safe") {
    return (
      <group position={[0, 0.9, 0]}>
        <mesh castShadow material={materials.body}>
          <boxGeometry args={[0.7, 1.0, 0.45]} />
        </mesh>
        <mesh position={[0, 0.1, 0.24]} material={materials.gold}>
          <circleGeometry args={[0.16, 20]} />
        </mesh>
        <mesh position={[0.1, 0.1, 0.26]} material={materials.ink}>
          <boxGeometry args={[0.12, 0.04, 0.03]} />
        </mesh>
        <Eyes materials={materials} y={0.35} z={0.25} />
      </group>
    );
  }

  if (form === "chart") {
    return (
      <group position={[0, 0.85, 0]}>
        {[0.25, 0.45, 0.7].map((h, i) => (
          <mesh key={i} castShadow position={[-0.25 + i * 0.25, h / 2 - 0.1, 0]} material={materials.body}>
            <boxGeometry args={[0.18, h, 0.18]} />
          </mesh>
        ))}
        <mesh position={[0.35, 0.55, 0]} rotation={[0, 0, -0.6]} material={materials.gold}>
          <coneGeometry args={[0.12, 0.35, 5]} />
        </mesh>
        <Eyes materials={materials} y={0.55} z={0.12} spread={0.12} />
      </group>
    );
  }

  if (form === "jar") {
    return (
      <group position={[0, 0.85, 0]}>
        <mesh castShadow material={materials.paper}>
          <cylinderGeometry args={[0.32, 0.28, 0.7, 16]} />
        </mesh>
        <mesh castShadow position={[0, 0.42, 0]} material={materials.ink}>
          <cylinderGeometry args={[0.3, 0.32, 0.12, 16]} />
        </mesh>
        <mesh position={[0, 0, 0.3]} material={materials.gold}>
          <boxGeometry args={[0.22, 0.35, 0.05]} />
        </mesh>
        <Text position={[0, 0.15, 0.33]} fontSize={0.1} color="#16283b" anchorX="center" anchorY="middle">
          TIPS
        </Text>
        <Eyes materials={materials} y={0.05} z={0.3} />
      </group>
    );
  }

  if (form === "crypto") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.gold}>
          <cylinderGeometry args={[0.48, 0.48, 0.16, 28]} />
        </mesh>
        <Text
          position={[0, 0.02, 0.1]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.42}
          color="#16283b"
          anchorX="center"
          anchorY="middle"
        >
          {g}
        </Text>
        <mesh position={[-0.22, 0.12, 0.1]} material={materials.dark}>
          <boxGeometry args={[0.18, 0.06, 0.04]} />
        </mesh>
        <mesh position={[0.22, 0.12, 0.1]} material={materials.dark}>
          <boxGeometry args={[0.18, 0.06, 0.04]} />
        </mesh>
        <Eyes materials={materials} y={-0.05} z={0.1} />
      </group>
    );
  }

  if (form === "certificate" || form === "loan") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.paper}>
          <boxGeometry args={[0.7, 0.95, 0.1]} />
        </mesh>
        <mesh position={[0, 0.28, 0.06]} material={materials.gold}>
          <circleGeometry args={[0.12, 16]} />
        </mesh>
        <Text
          position={[0, -0.05, 0.07]}
          fontSize={0.12}
          color="#16283b"
          anchorX="center"
          anchorY="middle"
        >
          {form === "loan" ? "LOAN" : "DIVIDEND"}
        </Text>
        {form === "loan" ? (
          <mesh castShadow position={[0, 0.62, 0]} material={materials.body}>
            <cylinderGeometry args={[0.22, 0.26, 0.18, 12]} />
          </mesh>
        ) : null}
        <Eyes materials={materials} y={0.35} z={0.08} />
      </group>
    );
  }

  if (form === "rocket") {
    return (
      <group position={[0, 0.9, 0]}>
        <mesh castShadow material={materials.body}>
          <capsuleGeometry args={[0.28, 0.7, 6, 12]} />
        </mesh>
        <mesh castShadow position={[0, 0.55, 0]} material={materials.paper}>
          <coneGeometry args={[0.28, 0.35, 10]} />
        </mesh>
        <mesh castShadow position={[-0.28, -0.15, 0]} rotation={[0, 0, 0.5]} material={materials.ink}>
          <boxGeometry args={[0.08, 0.35, 0.2]} />
        </mesh>
        <mesh castShadow position={[0.28, -0.15, 0]} rotation={[0, 0, -0.5]} material={materials.ink}>
          <boxGeometry args={[0.08, 0.35, 0.2]} />
        </mesh>
        <mesh position={[0, -0.55, 0]} material={materials.gold}>
          <coneGeometry args={[0.16, 0.28, 6]} />
        </mesh>
        <Eyes materials={materials} y={0.15} z={0.28} />
      </group>
    );
  }

  if (form === "star") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.gold}>
          <octahedronGeometry args={[0.55, 0]} />
        </mesh>
        <mesh castShadow rotation={[0, 0, Math.PI / 4]} material={materials.gold}>
          <octahedronGeometry args={[0.45, 0]} />
        </mesh>
        <Eyes materials={materials} y={0.05} z={0.35} />
      </group>
    );
  }

  if (form === "shopbag") {
    return (
      <group position={[0, 0.85, 0]}>
        <mesh castShadow material={materials.body}>
          <boxGeometry args={[0.7, 0.75, 0.35]} />
        </mesh>
        <mesh castShadow position={[-0.18, 0.48, 0]} material={materials.ink}>
          <torusGeometry args={[0.14, 0.03, 6, 14, Math.PI]} />
        </mesh>
        <mesh castShadow position={[0.18, 0.48, 0]} material={materials.ink}>
          <torusGeometry args={[0.14, 0.03, 6, 14, Math.PI]} />
        </mesh>
        <mesh position={[-0.35, 0.1, 0.15]} material={materials.gold}>
          <boxGeometry args={[0.2, 0.25, 0.12]} />
        </mesh>
        <mesh position={[0.35, 0.05, 0.15]} material={materials.blush}>
          <boxGeometry args={[0.18, 0.22, 0.12]} />
        </mesh>
        <Eyes materials={materials} y={0.1} z={0.2} />
      </group>
    );
  }

  if (form === "shield") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.body}>
          <cylinderGeometry args={[0.42, 0.5, 0.95, 6]} />
        </mesh>
        <mesh position={[0, 0.1, 0.28]} material={materials.gold}>
          <circleGeometry args={[0.16, 16]} />
        </mesh>
        <Text position={[0, 0.1, 0.3]} fontSize={0.22} color="#16283b" anchorX="center" anchorY="middle">
          $
        </Text>
        <Eyes materials={materials} y={0.35} z={0.3} />
      </group>
    );
  }

  if (form === "clipboard") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.body}>
          <boxGeometry args={[0.65, 0.95, 0.12]} />
        </mesh>
        <mesh position={[0, 0.48, 0.02]} material={materials.ink}>
          <boxGeometry args={[0.28, 0.12, 0.08]} />
        </mesh>
        <mesh position={[0, 0.05, 0.07]} material={materials.paper}>
          <boxGeometry args={[0.5, 0.65, 0.02]} />
        </mesh>
        <Text
          position={[0, 0.2, 0.09]}
          fontSize={0.14}
          color="#16283b"
          anchorX="center"
          anchorY="middle"
        >
          TAX
        </Text>
        <mesh position={[0.35, -0.1, 0.1]} material={materials.gold}>
          <boxGeometry args={[0.06, 0.35, 0.06]} />
        </mesh>
        <Eyes materials={materials} y={0.35} z={0.1} />
      </group>
    );
  }

  if (form === "globe") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.body}>
          <sphereGeometry args={[0.48, 20, 16]} />
        </mesh>
        <mesh rotation={[0.3, 0.4, 0]} material={materials.gold}>
          <torusGeometry args={[0.5, 0.03, 6, 24]} />
        </mesh>
        <mesh position={[0.15, 0.1, 0.4]} material={materials.gold}>
          <sphereGeometry args={[0.12, 10, 8]} />
        </mesh>
        <Eyes materials={materials} y={0.1} z={0.42} />
      </group>
    );
  }

  if (form === "hourglass") {
    return (
      <group position={[0, 0.95, 0]}>
        <mesh castShadow position={[0, 0.35, 0]} material={materials.paper}>
          <cylinderGeometry args={[0.28, 0.08, 0.4, 12]} />
        </mesh>
        <mesh castShadow position={[0, -0.35, 0]} material={materials.paper}>
          <cylinderGeometry args={[0.08, 0.28, 0.4, 12]} />
        </mesh>
        <mesh position={[0, 0.2, 0]} material={materials.gold}>
          <sphereGeometry args={[0.1, 8, 6]} />
        </mesh>
        <mesh castShadow position={[0, 0.55, 0]} material={materials.ink}>
          <cylinderGeometry args={[0.3, 0.3, 0.08, 12]} />
        </mesh>
        <mesh castShadow position={[0, -0.55, 0]} material={materials.ink}>
          <cylinderGeometry args={[0.3, 0.3, 0.08, 12]} />
        </mesh>
        <Eyes materials={materials} y={0.15} z={0.22} />
      </group>
    );
  }

  return null;
}

export const EXTENDED_MASCOT_FORMS: MoneyForm[] = [
  "currency",
  "stack",
  "bag",
  "vault",
  "receipt",
  "card",
  "wallet",
  "coupon",
  "ingot",
  "calc",
  "cloud",
  "chest",
  "safe",
  "chart",
  "jar",
  "crypto",
  "certificate",
  "loan",
  "rocket",
  "star",
  "shopbag",
  "shield",
  "clipboard",
  "globe",
  "hourglass",
];
