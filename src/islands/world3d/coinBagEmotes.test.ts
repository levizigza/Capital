import { describe, expect, it } from "vitest";
import {
  CARPET_EMOTE_PLAYLIST,
  captionForEmote,
  pickCarpetEmoteBeat,
} from "./coinBagEmotes";

describe("coinBagEmotes", () => {
  it("has a rich carpet playlist", () => {
    expect(CARPET_EMOTE_PLAYLIST.length).toBeGreaterThanOrEqual(8);
    const kinds = new Set(CARPET_EMOTE_PLAYLIST.map((b) => b.emote));
    expect(kinds.has("sleep")).toBe(true);
    expect(kinds.has("lookBack")).toBe(true);
    expect(kinds.has("wave")).toBe(true);
  });

  it("advances playlist and supports rush faces", () => {
    const calm = pickCarpetEmoteBeat(0, false);
    expect(calm.beat.emote).toBe(CARPET_EMOTE_PLAYLIST[0]!.emote);
    expect(calm.nextIndex).toBe(1);

    const rush = pickCarpetEmoteBeat(0, true);
    expect(["excited", "dizzy", "wave", "lookBack", "curious"]).toContain(rush.beat.emote);
  });

  it("captions sleep as Zzz", () => {
    expect(captionForEmote("sleep")).toMatch(/Zzz/i);
  });
});
