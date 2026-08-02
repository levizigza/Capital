/**
 * Glyph labels for procedural mascots.
 *
 * drei <Text> (troika) spawns module workers. On GitHub Pages those workers
 * often fail to rehydrate (`importScripts` on blob: → 405), which black-screens
 * whole R3F canvases (boot Outfitter, sometimes Harbor).
 *
 * Production / Pages: skip Text entirely — silhouette + color carry the read.
 * Local dev: keep Text inside its own Suspense so a font miss doesn't blank the room.
 */
import { Suspense, type ComponentProps } from "react";
import { Text } from "@react-three/drei";

function troikaSafeHere(): boolean {
  if (typeof window === "undefined") return false;
  if (import.meta.env.PROD) return false;
  const host = window.location.hostname;
  if (host.endsWith("github.io")) return false;
  return true;
}

export function SafeText(props: ComponentProps<typeof Text>) {
  if (!troikaSafeHere()) return null;
  return (
    <Suspense fallback={null}>
      <Text {...props} />
    </Suspense>
  );
}
