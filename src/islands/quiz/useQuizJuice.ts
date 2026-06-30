import { useCallback } from "react";
import { juiceSfx } from "@/juice/juiceSfx";
import { loadJuiceSettings } from "@/juice/settings";

export function useQuizJuice() {
  const level = loadJuiceSettings().level;

  return {
    lock: useCallback(() => juiceSfx.playReward(level), [level]),
    correct: useCallback(() => juiceSfx.playAccept(level), [level]),
    wrong: useCallback(() => juiceSfx.playFail(level), [level]),
    complete: useCallback(() => juiceSfx.playComplete(level), [level]),
    streak: useCallback(() => juiceSfx.playReward(level), [level]),
  };
}
