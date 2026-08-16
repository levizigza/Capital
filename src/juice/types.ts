export type JuiceLevel = "off" | "low" | "high";

export type JuiceEvent = "accept" | "complete" | "fail" | "reward";

export type JuiceTriggerOptions = {
  /** Screen coordinates for burst origin */
  x?: number;
  y?: number;
  /** Element to apply UI bounce */
  target?: HTMLElement | null;
  /** Force burst even at low (complete/reward) */
  burst?: boolean;
  /**
   * Layer switches — reusable feedback architecture.
   * Defaults: sfx+motion on; burst follows event; shake only on fail@high.
   */
  layers?: {
    sfx?: boolean;
    motion?: boolean;
    burst?: boolean;
    shake?: boolean;
  };
};


export type BurstParticle = {
  id: string;
  x: number;
  y: number;
  emoji: string;
  color: string;
};
