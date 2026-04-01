type ScoreTier = "good" | "warning" | "critical";

type ScoreTierClasses = {
  text: string;
  bg: string;
  border: string;
  stroke: string;
};

const classesByTier: Record<ScoreTier, ScoreTierClasses> = {
  good: {
    text: "text-emerald-700",
    bg: "bg-emerald-500",
    border: "border-emerald-700",
    stroke: "stroke-emerald-700",
  },
  warning: {
    text: "text-yellow-800",
    bg: "bg-yellow-500",
    border: "border-yellow-800",
    stroke: "stroke-yellow-800",
  },
  critical: {
    text: "text-red-700",
    bg: "bg-red-500",
    border: "border-red-700",
    stroke: "stroke-red-700",
  },
};

function scoreTier(score: number): ScoreTier {
  if (score >= 90) return "good";
  if (score >= 50) return "warning";
  return "critical";
}

export function scoreColor(score: number): string {
  return classesByTier[scoreTier(score)].text;
}

export function scoreBg(score: number): string {
  return classesByTier[scoreTier(score)].bg;
}

export function scoreBorder(score: number): string {
  return classesByTier[scoreTier(score)].border;
}

export function scoreStroke(score: number): string {
  return classesByTier[scoreTier(score)].stroke;
}
