import { describe, expect, it } from "vitest";
import { canOpenSignatureCinema } from "./signatureCinemaGate";

describe("signature cinema gate", () => {
  it("blocks spectacle under the Harbor loading veil", () => {
    expect(
      canOpenSignatureCinema({
        plazaReady: false,
        guidedComplete: true,
      }),
    ).toBe(false);
  });

  it("allows spectacle once plaza is ready (3D or myth)", () => {
    expect(
      canOpenSignatureCinema({
        plazaReady: true,
        guidedComplete: true,
      }),
    ).toBe(true);
  });

  it("never stacks cinema over talk or an open modal", () => {
    expect(
      canOpenSignatureCinema({
        plazaReady: true,
        guidedComplete: true,
        talkOpen: true,
      }),
    ).toBe(false);
    expect(
      canOpenSignatureCinema({
        plazaReady: true,
        guidedComplete: true,
        hubModal: true,
      }),
    ).toBe(false);
  });

  it("waits for Castle Grounds to finish — unless an unshown scar owns the plaza", () => {
    expect(
      canOpenSignatureCinema({
        plazaReady: true,
        guidedComplete: false,
      }),
    ).toBe(false);
    expect(
      canOpenSignatureCinema({
        plazaReady: true,
        guidedComplete: false,
        unshownScar: true,
      }),
    ).toBe(true);
  });
});
