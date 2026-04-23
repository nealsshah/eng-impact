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
  "greptile-apps",
  "mendral-app",
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
  substantiveReviews: 1.0, // bonus for APPROVED/CHANGES_REQUESTED on top of reviewsGiven
  fastPrs: 2,
  largePrCount: 2,
  scopeBreadth: 1.5, // unique areas/scopes touched
  revertPenalty: -5, // per PR that got reverted
  codeCleanup: 0.3, // bonus for net-negative line changes (refactoring)
};

export type PRType = "feat" | "fix" | "refactor" | "perf" | "chore" | "docs" | "ci" | "test" | "revert" | "style" | "other";

// Weight multiplier per PR type — applied to each PR's contribution to the score
export const PR_TYPE_WEIGHTS: Record<PRType, number> = {
  feat: 1.5,
  fix: 1.2,
  refactor: 1.1,
  perf: 1.3,
  revert: 0.5,
  chore: 0.5,
  docs: 0.4,
  ci: 0.4,
  test: 0.6,
  style: 0.3,
  other: 1.0,
};

export const PR_TYPE_LABELS: Record<PRType, string> = {
  feat: "Feature",
  fix: "Bug Fix",
  refactor: "Refactor",
  perf: "Performance",
  revert: "Revert",
  chore: "Chore",
  docs: "Documentation",
  ci: "CI/CD",
  test: "Test",
  style: "Style",
  other: "Other",
};

export function detectPRType(title: string): PRType {
  const match = title.match(/^(\w+)[\(:\s]/);
  if (!match) return "other";
  const prefix = match[1].toLowerCase();
  if (prefix in PR_TYPE_WEIGHTS) return prefix as PRType;
  return "other";
}

export const CATEGORY_CONFIG: Record<
  string,
  { colors: string; description: string }
> = {
  Builder: {
    colors: "bg-blue-100 text-blue-700",
    description:
      "Highest score in Product — drives features through high PR volume and broad code changes",
  },
  Multiplier: {
    colors: "bg-purple-100 text-purple-700",
    description:
      "Highest score in Leverage — delivers large, complex PRs that spark deep discussion",
  },
  Collaborator: {
    colors: "bg-orange-100 text-orange-700",
    description:
      "Highest score in Collaboration — active reviewer who unblocks teammates",
  },
  Closer: {
    colors: "bg-green-100 text-green-700",
    description:
      "Highest score in Velocity — ships fast with most PRs merged within 24 hours",
  },
};

export const DIMENSION_COLORS = {
  product: "#3b82f6",
  leverage: "#8b5cf6",
  velocity: "#22c55e",
  collaboration: "#f97316",
};
