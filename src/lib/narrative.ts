import { ScoredEngineer } from "./types";

interface NarrativeRule {
  metric: keyof ScoredEngineer;
  label: string;
}

const RULES: NarrativeRule[] = [
  { metric: "avgFilesChanged", label: "Works on large, cross-cutting changes" },
  { metric: "fastPrs", label: "Ships quickly — most PRs merged within 24 hours" },
  { metric: "reviewsGiven", label: "Active code reviewer who unblocks teammates" },
  { metric: "substantiveReviews", label: "Gives thorough reviews — approvals and change requests, not just comments" },
  { metric: "highDiscussionPrs", label: "Tackles complex, high-discussion work" },
  { metric: "mergedPrs", label: "Consistently high throughput of merged contributions" },
  { metric: "largePrCount", label: "Regularly delivers substantial changes" },
  { metric: "scopeBreadth", label: "Works across many areas of the codebase" },
];

function percentile(values: number[], value: number): number {
  const below = values.filter((v) => v < value).length;
  return below / values.length;
}

export function generateNarrative(
  engineer: ScoredEngineer,
  allEngineers: ScoredEngineer[]
): string[] {
  const scored: Array<{ label: string; pct: number }> = [];

  for (const rule of RULES) {
    const values = allEngineers.map((e) => e[rule.metric] as number);
    const pct = percentile(values, engineer[rule.metric] as number);
    if (pct >= 0.75) {
      scored.push({ label: rule.label, pct });
    }
  }

  scored.sort((a, b) => b.pct - a.pct);
  return scored.slice(0, 3).map((s) => s.label);
}

export function assignCategory(
  engineer: ScoredEngineer
): ScoredEngineer["category"] {
  const { product, leverage, velocity, collaboration } = engineer.dimensions;
  const max = Math.max(product, leverage, velocity, collaboration);

  if (max === collaboration) return "Collaborator";
  if (max === velocity) return "Closer";
  if (max === leverage) return "Multiplier";
  return "Builder";
}
