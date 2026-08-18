import { useEffect, useState } from "react";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { capitalMusic } from "../audio/capitalMusic";
import { toggleCapitalMusicMute } from "../audio/musicMute";
import { pointerSafeActivate } from "../pointerSafeClick";

/**
 * Always-on top-right mute for Fortune soundtrack.
 * Mount once from App so title → cast → teach → carpet → Harbor all share it.
 */
export function GlobalMusicMuteButton() {
  const [enabled, setEnabled] = useState(() => capitalMusic.isEnabled());

  useEffect(() => {
    setEnabled(capitalMusic.isEnabled());
    return capitalMusic.subscribe(() => {
      setEnabled(capitalMusic.isEnabled());
    });
  }, []);

  return (
    <button
      type="button"
      data-testid="global-music-mute"
      aria-pressed={!enabled}
      aria-label={enabled ? "Mute music" : "Unmute music"}
      title={enabled ? "Mute music" : "Unmute music"}
      className="fixed z-[2147483600] flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border-2 border-[#1c1917]/80 bg-[#f4b942] text-[#1c1917] shadow-[2px_2px_0_rgba(28,25,23,0.45)] hover:bg-[#fbbf24] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
      style={{
        top: "max(0.75rem, env(safe-area-inset-top, 0px))",
        right: "max(0.75rem, env(safe-area-inset-right, 0px))",
      }}
      {...pointerSafeActivate(() => {
        toggleCapitalMusicMute();
      })}
    >
      {enabled ? (
        <SpeakerHigh className="h-5 w-5" weight="fill" aria-hidden />
      ) : (
        <SpeakerSlash className="h-5 w-5" weight="fill" aria-hidden />
      )}
    </button>
  );
}
