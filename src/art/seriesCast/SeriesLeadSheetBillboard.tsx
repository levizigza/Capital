import { useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";

import { SeriesLeadPortrait } from "./SeriesLeadPortrait";
import { castSheetPngUrl, hasSheetArtId } from "./seriesLeadArt";

type Props = {
  id: string;
  /** World height of the sheet card */
  height?: number;
  selected?: boolean;
};

/**
 * Bake the series sheet (PNG drop-in or SVG recreation) into a canvas texture
 * so Outfitter fighters read as the illustrated cast — not emoji capsules.
 */
function useSheetTexture(id: string): THREE.CanvasTexture | THREE.Texture | null {
  const [tex, setTex] = useState<THREE.CanvasTexture | THREE.Texture | null>(null);

  useEffect(() => {
    if (!hasSheetArtId(id)) {
      setTex(null);
      return;
    }
    let disposed = false;
    const png = castSheetPngUrl(id);

    const finish = (source: HTMLCanvasElement | HTMLImageElement) => {
      if (disposed) return;
      const texture = new THREE.CanvasTexture(
        source instanceof HTMLCanvasElement
          ? source
          : (() => {
              const c = document.createElement("canvas");
              c.width = 512;
              c.height = 640;
              const ctx = c.getContext("2d");
              if (ctx) {
                ctx.clearRect(0, 0, c.width, c.height);
                ctx.drawImage(source, 0, 0, c.width, c.height);
              }
              return c;
            })(),
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.needsUpdate = true;
      setTex((prev) => {
        prev?.dispose();
        return texture;
      });
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => finish(img);
    img.onerror = () => {
      // SVG recreation → offscreen mount → canvas
      const host = document.createElement("div");
      host.style.cssText =
        "position:fixed;left:-9999px;top:0;width:256px;height:320px;pointer-events:none;opacity:0";
      document.body.appendChild(host);
      const root = createRoot(host);
      flushSync(() => {
        root.render(
          <div style={{ width: 256, height: 320 }}>
            <SeriesLeadPortrait id={id} className="h-full w-full" />
          </div>,
        );
      });
      const svg = host.querySelector("svg");
      if (!svg) {
        root.unmount();
        host.remove();
        return;
      }
      const xml = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const svgImg = new Image();
      svgImg.onload = () => {
        const c = document.createElement("canvas");
        c.width = 512;
        c.height = 640;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, c.width, c.height);
          ctx.drawImage(svgImg, 0, 0, c.width, c.height);
        }
        URL.revokeObjectURL(url);
        root.unmount();
        host.remove();
        finish(c);
      };
      svgImg.onerror = () => {
        URL.revokeObjectURL(url);
        root.unmount();
        host.remove();
      };
      svgImg.src = url;
    };
    img.src = png;

    return () => {
      disposed = true;
      setTex((prev) => {
        prev?.dispose();
        return null;
      });
    };
  }, [id]);

  return tex;
}

export function SeriesLeadSheetBillboard({ id, height = 1.85, selected = false }: Props) {
  const texture = useSheetTexture(id);
  const aspect = 96 / 120;
  const width = height * aspect;
  const mat = useMemo(() => {
    if (!texture) return null;
    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
  }, [texture]);

  useFrame(({ camera }) => {
    // Mild billboard — face camera yaw only so the card stays upright
    // (parent group may spin when selected; we counter only pitch/roll).
    void camera;
  });

  if (!mat) {
    // Loading placeholder — gold coin silhouette
    return (
      <group position={[0, height * 0.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.1, 24]} />
          <meshStandardMaterial color="#f4b942" metalness={0.45} roughness={0.35} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, height * 0.52 + (selected ? 0.04 : 0), 0]}>
      {/* Soft card back so edges read */}
      <mesh position={[0, 0, -0.02]} castShadow>
        <planeGeometry args={[width + 0.06, height + 0.06]} />
        <meshStandardMaterial color="#1c1917" roughness={0.85} />
      </mesh>
      <mesh castShadow>
        <planeGeometry args={[width, height]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {selected ? (
        <mesh position={[0, -height * 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.38, 28]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.55}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}
    </group>
  );
}
