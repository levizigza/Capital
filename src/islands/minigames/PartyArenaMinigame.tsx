import type { MinigameProps } from "../types";
import { PartyArenaWorld } from "../world3d/PartyArenaWorld";

/**
 * Full-screen 3D Mario Party action world — used when you dive a painting portal.
 * Move + jump + grab. Mastery quiz still gates literacy after clear.
 */
export default function PartyArenaMinigame({
  island,
  save,
  onComplete,
  onClose,
}: MinigameProps) {
  return (
    <div className="fixed inset-0 z-[5] h-[min(80vh,720px)] min-h-[420px] w-full overflow-hidden rounded-xl">
      <PartyArenaWorld
        island={island}
        character={save.character}
        title={`${island.name} · Painting Arena`}
        durationSec={50}
        goalCoins={8}
        onComplete={(ok, score) => onComplete(ok, score)}
        onExit={onClose}
      />
    </div>
  );
}
