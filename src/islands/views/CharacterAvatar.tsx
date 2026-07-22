import { useEffect, useState } from "react";
import {
  type CapitalCharacter,
  baseEmoji,
  colorHex,
  accessoryEmoji,
  companionEmoji,
} from "../character";
import { getAnimationStyle, isHomeLook, type AnimationStyleId } from "../animationStyles";

type Props = {
  character: CapitalCharacter;
  size?: number;
  className?: string;
  /** Island art language — morphs the avatar on that island */
  animationStyle?: AnimationStyleId | string;
  /** When true, skip crossfade (a11y reduced motion) */
  reducedMotion?: boolean;
  /** Start from Harbor look, then morph into animationStyle (island enter) */
  morphFromHome?: boolean;
};

/**
 * Circular emoji avatar with era morph.
 * When animationStyle changes, crossfades home → era (or era → era) smoothly.
 */
export function CharacterAvatar({
  character,
  size = 96,
  className,
  animationStyle,
  reducedMotion = false,
  morphFromHome = false,
}: Props) {
  const accent = colorHex(character.color);
  const acc = accessoryEmoji(character.accessory);
  const pet = companionEmoji(character.companion);
  const targetStyle = animationStyle ?? "capital-default";

  const [shownStyle, setShownStyle] = useState(() => {
    if (morphFromHome && !reducedMotion && !isHomeLook(targetStyle)) {
      return "capital-default";
    }
    return targetStyle;
  });
  const [fadeStyle, setFadeStyle] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");

  useEffect(() => {
    if (targetStyle === shownStyle) return;
    if (reducedMotion) {
      setShownStyle(targetStyle);
      setFadeStyle(null);
      setPhase("idle");
      return;
    }
    setFadeStyle(shownStyle);
    setPhase("out");
    const outMs = 280;
    const inMs = 420;
    const t1 = window.setTimeout(() => {
      setShownStyle(targetStyle);
      setPhase("in");
    }, outMs);
    const t2 = window.setTimeout(() => {
      setFadeStyle(null);
      setPhase("idle");
    }, outMs + inMs);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [targetStyle, shownStyle, reducedMotion]);

  const morph = getAnimationStyle(shownStyle);
  const home = isHomeLook(shownStyle);
  const fading = fadeStyle ? getAnimationStyle(fadeStyle) : null;

  const renderFace = (morphClass: string, opacity: number, scale: number, z: number) => (
    <div
      className={["char-avatar-layer", morphClass].filter(Boolean).join(" ")}
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        transform: `scale(${scale})`,
        transition: reducedMotion
          ? undefined
          : "opacity 0.28s ease, transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
        zIndex: z,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 35%, ${accent}55, ${accent}22 60%, transparent 75%)`,
          border: `${Math.max(3, size * 0.045)}px solid ${accent}`,
          boxShadow: `0 8px 22px ${accent}55, inset 0 2px 8px rgba(255,255,255,0.35)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.52,
          lineHeight: 1,
        }}
      >
        <span>{baseEmoji(character.base)}</span>
      </div>
      {acc && (
        <span
          style={{
            position: "absolute",
            top: -size * 0.08,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: size * 0.34,
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))",
          }}
        >
          {acc}
        </span>
      )}
      {pet && (
        <span
          style={{
            position: "absolute",
            bottom: -size * 0.04,
            right: -size * 0.04,
            fontSize: size * 0.34,
            background: "#fff",
            borderRadius: "50%",
            padding: size * 0.02,
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          {pet}
        </span>
      )}
    </div>
  );

  const shownOpacity = phase === "out" ? 0 : 1;
  const shownScale = phase === "out" ? 0.86 : phase === "in" ? 1 : 1;
  const fadeOpacity = phase === "out" ? 1 : 0;
  const fadeScale = phase === "out" ? 1.06 : 0.9;

  return (
    <div
      className={["char-avatar-root", className].filter(Boolean).join(" ")}
      style={{ position: "relative", width: size, height: size }}
      aria-label={
        character.name
          ? `${character.name}'s avatar${home ? "" : ` · ${morph.eraLabel}`}`
          : "avatar"
      }
      title={home ? morph.characterForm : `${morph.eraLabel}: ${morph.characterForm}`}
      data-morph-phase={phase}
      data-era={morph.id}
    >
      {fading
        ? renderFace(fading.morphClass, fadeOpacity, fadeScale, 1)
        : null}
      {renderFace(morph.morphClass, shownOpacity, shownScale, 2)}
    </div>
  );
}
