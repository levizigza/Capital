import type { LearningProfileId } from "../learningProfile";

export function learningProfileToTier(
  profile: LearningProfileId,
): "elementary" | "middle" | "adult" {
  if (profile === "explorer") return "elementary";
  if (profile === "strategist") return "adult";
  return "middle";
}

export function clampScore(score: number, max = 100): number {
  return Math.max(0, Math.min(max, Math.round(score)));
}
