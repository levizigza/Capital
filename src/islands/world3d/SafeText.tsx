/**
 * drei <Text> loads a webfont and suspends. On GitHub Pages our CSP blocks
 * CDN font fetches, which left whole R3F Suspense trees blank (Harbor sky only).
 * Nest each Text in its own Suspense so meshes still paint.
 */
import { Suspense, type ComponentProps } from "react";
import { Text } from "@react-three/drei";

export function SafeText(props: ComponentProps<typeof Text>) {
  return (
    <Suspense fallback={null}>
      <Text {...props} />
    </Suspense>
  );
}
