import { describe, expect, it } from "vitest";
import { nextTalkPhase } from "./talkBattleRules";

describe("Talk Battle turn rules", () => {
  it("moves from listen to choose when choices exist", () => {
    expect(
      nextTalkPhase({ choices: [{ id: "a", text: "Hi" }], end: false }, "listen"),
    ).toBe("choose");
  });

  it("ends from listen when there are no choices", () => {
    expect(nextTalkPhase({ end: true }, "listen")).toBe("done");
  });

  it("ends after a choose phase", () => {
    expect(
      nextTalkPhase({ choices: [{ id: "a", text: "Hi" }] }, "choose"),
    ).toBe("done");
  });
});
