/**
 * Coin Bag emotes — endearing faces for carpet rides & idle moments.
 */

export type CoinBagEmote =
  | "chill"
  | "lookBack"
  | "sleep"
  | "wave"
  | "excited"
  | "curious"
  | "blush"
  | "dizzy"
  | "smug";

export type CoinBagEmoteBeat = {
  emote: CoinBagEmote;
  /** Seconds to hold this face */
  duration: number;
  /** Soft caption over his head (optional) */
  caption?: string;
};

/** Default carpet ride playlist — loops forever. */
export const CARPET_EMOTE_PLAYLIST: CoinBagEmoteBeat[] = [
  { emote: "chill", duration: 4.2, caption: "Just vibing…" },
  { emote: "lookBack", duration: 3.4, caption: "You good back there?" },
  { emote: "curious", duration: 3.0, caption: "Ooh, what’s that island?" },
  { emote: "sleep", duration: 5.5, caption: "Zzz…" },
  { emote: "wave", duration: 2.8, caption: "Hi friend!" },
  { emote: "blush", duration: 2.6, caption: "Hehe — wind in my ears" },
  { emote: "smug", duration: 3.2, caption: "Best seat on the bill" },
  { emote: "lookBack", duration: 2.5, caption: "Boo." },
  { emote: "excited", duration: 3.0, caption: "Faster! Faster!" },
  { emote: "dizzy", duration: 2.4, caption: "Whoooa—" },
  { emote: "chill", duration: 3.8, caption: "Back to chilling" },
  { emote: "sleep", duration: 4.8, caption: "Zzz w…" },
];

/** When rushing, bias toward wilder faces. */
export const CARPET_RUSH_EMOTES: CoinBagEmote[] = ["excited", "dizzy", "wave", "lookBack", "curious"];

export function captionForEmote(emote: CoinBagEmote): string {
  switch (emote) {
    case "chill":
      return "Just vibing…";
    case "lookBack":
      return "You good back there?";
    case "sleep":
      return "Zzz…";
    case "wave":
      return "Hi friend!";
    case "excited":
      return "Wheee!";
    case "curious":
      return "Hmm…";
    case "blush":
      return "Hehe";
    case "dizzy":
      return "Whoooa—";
    case "smug":
      return "Best seat!";
    default:
      return "…";
  }
}

/** Advance playlist index; optionally force a rush emote. */
export function pickCarpetEmoteBeat(
  playlistIndex: number,
  rushing: boolean,
  playlist: CoinBagEmoteBeat[] = CARPET_EMOTE_PLAYLIST,
): { beat: CoinBagEmoteBeat; nextIndex: number } {
  if (rushing) {
    const emote = CARPET_RUSH_EMOTES[playlistIndex % CARPET_RUSH_EMOTES.length]!;
    return {
      beat: { emote, duration: 2.2, caption: captionForEmote(emote) },
      nextIndex: playlistIndex + 1,
    };
  }
  const beat = playlist[playlistIndex % playlist.length]!;
  return { beat, nextIndex: playlistIndex + 1 };
}
