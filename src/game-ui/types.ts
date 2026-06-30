export type UiScale = "compact" | "standard" | "wide";
export type UiAspect = "tall" | "standard" | "ultrawide";

export type GameToastVariant = "info" | "success" | "warning" | "error";

export type GameToastItem = {
  id: string;
  message: string;
  variant?: GameToastVariant;
  durationMs?: number;
};
