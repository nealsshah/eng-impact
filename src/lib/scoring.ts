import type { EngineerMetrics, ScoredEngineer } from "./types";
import { WEIGHTS } from "./constants";
import { generateNarrative, assignCategory } from "./narrative";

export function scoreEngineers(engineers: EngineerMetrics[]): ScoredEngineer[] {
  const scored = engineers.map((eng) => {
    const product =
      eng.mergedPrs * WEIGHTS.mergedPrs +
      eng.avgFilesChanged * WEIGHTS.avgFilesChanged;
    const leverage =
      eng.largePrCount * WEIGHTS.largePrCount +
      eng.highDiscussionPrs * WEIGHTS.highDiscussionPrs;
    const velocity = eng.fastPrs * WEIGHTS.fastPrs;
    const collaboration = eng.reviewsGiven * WEIGHTS.reviewsGiven;

    const rawScore = product + leverage + velocity + collaboration;

    return {
      ...eng,
      rawScore,
      normalizedScore: 0,
      dimensions: { product, leverage, velocity, collaboration },
      narrative: [] as string[],
      category: "Builder" as ScoredEngineer["category"],
    };
  });

  const maxScore = Math.max(...scored.map((e) => e.rawScore), 1);
  for (const eng of scored) {
    eng.normalizedScore = Math.round((eng.rawScore / maxScore) * 100);
  }

  scored.sort((a, b) => b.rawScore - a.rawScore);

  // Generate narratives using all engineers for percentile context
  for (const eng of scored) {
    eng.narrative = generateNarrative(eng, scored);
    eng.category = assignCategory(eng);
  }

  return scored;
}
