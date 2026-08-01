/**
 * Compact interior lighting for Money Structures — never outdoor Sky/shore fog.
 * Outdoor WorldLighting washed the vault into a flat navy void.
 * Fill light follows the organ accent (Coin gold / Clock sky / Spiral violet / Memory amber).
 */

type Props = {
  bg: string;
  accent?: string;
  fillLight?: string;
};

export function StructureInteriorLights({
  bg,
  accent = "#fbbf24",
  fillLight,
}: Props) {
  const fill = fillLight ?? accent;
  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 18, 42]} />
      <ambientLight intensity={0.72} />
      <hemisphereLight args={["#e2e8f0", "#0f172a", 0.55]} />
      <directionalLight position={[4, 10, 6]} intensity={1.15} color="#fff7ed" />
      <directionalLight position={[-6, 6, -4]} intensity={0.4} color={fill} />
      <pointLight position={[0, 5, 0]} intensity={0.85} distance={22} color={accent} />
      <pointLight position={[0, 2.2, 6]} intensity={0.5} distance={14} color={fill} />
    </>
  );
}
