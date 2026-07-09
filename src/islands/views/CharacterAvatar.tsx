import {
  type CapitalCharacter,
  baseEmoji,
  colorHex,
  accessoryEmoji,
  companionEmoji,
} from "../character";
import { getAnimationStyle, type AnimationStyleId } from "../animationStyles";

type Props = {
  character: CapitalCharacter;
  size?: number;
  className?: string;
  /** Island art language — morphs the avatar on that island */
  animationStyle?: AnimationStyleId | string;
};

/** Circular emoji avatar with a colored aura, accessory, companion, and optional island morph. */
export function CharacterAvatar({ character, size = 96, className, animationStyle }: Props) {
  const accent = colorHex(character.color);
  const acc = accessoryEmoji(character.accessory);
  const pet = companionEmoji(character.companion);
  const morph = getAnimationStyle(animationStyle);

  return (
    <div
      className={[className, morph.morphClass].filter(Boolean).join(" ")}
      style={{ position: "relative", width: size, height: size }}
      aria-label={character.name ? `${character.name}'s avatar` : "avatar"}
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
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {pet}
        </span>
      )}
    </div>
  );
}
