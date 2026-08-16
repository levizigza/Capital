import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("global music mute chrome", () => {
  it("mounts mute on boot + islands and wires capitalMusic toggle", () => {
    const app = readFileSync(join(__dirname, "../../App.tsx"), "utf8");
    const btn = readFileSync(join(__dirname, "GlobalMusicMuteButton.tsx"), "utf8");
    const mute = readFileSync(join(__dirname, "../audio/musicMute.ts"), "utf8");
    expect(app).toMatch(/GlobalMusicMuteButton/);
    expect(app).toMatch(/showCapitalIntro/);
    expect(btn).toMatch(/global-music-mute/);
    expect(btn).toMatch(/Mute music/);
    expect(btn).toMatch(/toggleCapitalMusicMute/);
    expect(mute).toMatch(/persistAccessibilitySettings/);
    expect(mute).toMatch(/capitalMusic\.setEnabled/);
  });

  it("uses GlobalMusicMuteButton on the islands product path", () => {
    const app = readFileSync(join(__dirname, "../../App.tsx"), "utf8");
    const start = app.indexOf('if (currentMode === "islands" && ISLANDS_ENABLED)');
    expect(start).toBeGreaterThan(-1);
    const islandsBlock = app.slice(start, start + 800);
    expect(islandsBlock).toMatch(/GlobalMusicMuteButton/);
    expect(islandsBlock).not.toMatch(/MusicPlayer/);
  });
});
