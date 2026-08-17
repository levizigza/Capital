import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { piggyGuidedGraph } from "./story/harborTalks";
import { resolveControlPlaceholders, DEFAULT_HINT_CTX } from "@/input";

describe("FTUE accessibility contracts", () => {
  const ashore = readFileSync(
    join(__dirname, "views/AshoreComprehensionTutorial.tsx"),
    "utf8",
  );
  const hub = readFileSync(join(__dirname, "views/HomeHubView.tsx"), "utf8");
  const talk = readFileSync(join(__dirname, "views/TalkBattleScreen.tsx"), "utf8");
  const hush = readFileSync(join(__dirname, "views/TakeHushOverlay.tsx"), "utf8");
  const settings = readFileSync(join(__dirname, "SettingsPanel.tsx"), "utf8");
  const app = readFileSync(join(__dirname, "IslandsApp.tsx"), "utf8");

  it("Ashore uses binding-aware copy and interact action — not hard-coded KeyE only", () => {
    expect(ashore).toMatch(/useInputAction\(\s*["']interact["']/);
    expect(ashore).toMatch(/formatMovePhrase/);
    expect(ashore).not.toMatch(/Press E to talk/);
    expect(ashore).toMatch(/TouchWalkPad/);
  });

  it("Harbor HUD whisper uses MoveTalkMapHint", () => {
    expect(hub).toMatch(/MoveTalkMapHint/);
    expect(hub).not.toMatch(/WASD \/ walk pad · E talk/);
  });

  it("Piggy guided dialogue resolves control placeholders", () => {
    const g = piggyGuidedGraph("meet_guide");
    const text = String(g.nodes[0]!.text);
    expect(text).not.toMatch(/\{move\}/);
    expect(text).toMatch(/walk pad|W|S|A|D/i);
  });

  it("keeper bubble template resolves interact binding", () => {
    const resolved = resolveControlPlaceholders(
      "Piggy Penny: Want to talk? {interact} when you're ready.",
      DEFAULT_HINT_CTX,
    );
    expect(resolved).toMatch(/E|Talk/i);
    expect(resolved).not.toMatch(/\{interact\}/);
  });

  it("Talk Battle exposes SR labels and binding hints", () => {
    expect(talk).toMatch(/aria-label=/);
    expect(talk).toMatch(/InputPromptHint/);
    expect(talk).not.toMatch(/Enter listen · Esc · Leave/);
  });

  it("Take hush captions are aria-live and binding-aware leave", () => {
    expect(hush).toMatch(/aria-live/);
    expect(hush).toMatch(/actionBindingLabel/);
    expect(hush).not.toMatch(/Esc · Leave · board/);
  });

  it("Settings offers replayable Ashore chambers", () => {
    expect(settings).toMatch(/replay-ashore-chambers/);
    expect(settings).toMatch(/Tutorial replay/);
    expect(app).toMatch(/ashoreReplayOpen/);
    expect(app).toMatch(/AshoreComprehensionTutorial/);
  });

  it("accessibility audit doc exists", () => {
    const doc = readFileSync(join(__dirname, "../../docs/ftue/FTUE_ACCESSIBILITY_AUDIT.md"), "utf8");
    expect(doc).toMatch(/multi-channel|Multi-channel/i);
    expect(doc).toMatch(/replay/i);
  });
});
