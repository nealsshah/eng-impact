import type { EngineerMetrics, ScoredEngineer } from "./types";
import { WEIGHTS } from "./constants";
import { generateNarrative, assignCategory } from "./narrative";

export function scoreEngineers(engineers: EngineerMetrics[]): ScoredEngineer[] {
  const scored = engineers.map((eng) => {
    // Use weightedPrCount (type-adjusted) instead of raw mergedPrs
    const product =
      eng.weightedPrCount * WEIGHTS.mergedPrs +
      eng.avgFilesChanged * WEIGHTS.avgFilesChanged +
      eng.scopeBreadth * WEIGHTS.scopeBreadth;
    const leverage =
      eng.largePrCount * WEIGHTS.largePrCount +
      eng.highDiscussionPrs * WEIGHTS.highDiscussionPrs +
      (eng.netLinesChanged < 0 ? Math.abs(eng.netLinesChanged / 100) * WEIGHTS.codeCleanup : 0);
    const velocity =
      eng.fastPrs * WEIGHTS.fastPrs +
      eng.revertedPrs * WEIGHTS.revertPenalty;
    const collaboration =
      eng.reviewsGiven * WEIGHTS.reviewsGiven +
      eng.substantiveReviews * WEIGHTS.substantiveReviews;

    const rawScore = Math.max(0, product + leverage + velocity + collaboration);

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
