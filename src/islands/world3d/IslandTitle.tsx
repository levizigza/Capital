import { Billboard } from "@react-three/drei";
import { SafeText } from "./SafeText";

type Props = {
  title: string;
  subtitle?: string;
  /** World Y — keep well above canopy */
  height?: number;
  position?: [number, number, number];
  accent?: string;
  ink?: string;
};

/**
 * Always-readable island name — billboarded high above trees/props.
 */
export function IslandTitle({
  title,
  subtitle,
  height = 9.5,
  position = [0, 0, 0],
  accent = "#f4a629",
  ink = "#16283b",
}: Props) {
  return (
    <group position={[position[0], height, position[2]]}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Soft plaque so letters never sink into foliage */}
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[subtitle ? 6.4 : 5.2, subtitle ? 1.7 : 1.15]} />
          <meshBasicMaterial color="#fef3c7" transparent opacity={0.88} depthWrite={false} />
        </mesh>
        <SafeText
          position={[0, subtitle ? 0.28 : 0, 0]}
          fontSize={0.72}
          color={ink}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#ffffff"
          renderOrder={20}
          depthOffset={-2}
        >
          {title}
        </SafeText>
        {subtitle ? (
          <SafeText
            position={[0, -0.4, 0]}
            fontSize={0.32}
            color={accent}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor={ink}
            renderOrder={20}
            depthOffset={-2}
          >
            {subtitle}
          </SafeText>
        ) : null}
      </Billboard>
    </group>
  );
}
