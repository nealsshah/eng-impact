export const REPO = "PostHog/posthog";
export const DAYS_LOOKBACK = 90;
export const MIN_PRS = 3;

export const BOT_LOGINS = new Set([
  "dependabot",
  "dependabot[bot]",
  "github-actions",
  "github-actions[bot]",
  "posthog-bot",
  "posthog-bot[bot]",
  "renovate",
  "renovate[bot]",
  "codecov[bot]",
  "vercel[bot]",
  "stale[bot]",
]);

export function isBot(login: string): boolean {
  return BOT_LOGINS.has(login) || login.endsWith("[bot]");
}

export const THRESHOLDS = {
  largePrFiles: 5,
  highDiscussionComments: 10,
  fastMergeHours: 24,
};

export const WEIGHTS = {
  mergedPrs: 2,
  avgFilesChanged: 0.5,
  highDiscussionPrs: 3,
  reviewsGiven: 1.5,
  fastPrs: 2,
  largePrCount: 2,
};

export const DIMENSION_COLORS = {
  product: "#3b82f6",
  leverage: "#8b5cf6",
  velocity: "#22c55e",
  collaboration: "#f97316",
};
