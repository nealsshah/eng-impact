export interface GitHubPR {
  number: number;
  title: string;
  url: string;
  author: string;
  authorLogin: string;
  avatarUrl: string;
  createdAt: string;
  mergedAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commentCount: number;
  reviewCommentCount: number;
  labels: string[];
  reviews: GitHubReview[];
}

export interface GitHubReview {
  author: string;
  state: string;
  submittedAt: string;
}

export interface EngineerMetrics {
  login: string;
  name: string;
  avatarUrl: string;
  mergedPrs: number;
  avgFilesChanged: number;
  largePrCount: number;
  highDiscussionPrs: number;
  avgTimeToMerge: number;
  fastPrs: number;
  reviewsGiven: number;
  commentsMade: number;
  mostImpactfulPr: { title: string; url: string };
}

export interface ScoredPR {
  number: number;
  title: string;
  url: string;
  mergedAt: string;
  changedFiles: number;
  additions: number;
  deletions: number;
  commentCount: number;
  reviewCommentCount: number;
  timeToMergeHours: number;
  labels: string[];
  impactScore: number;
  reasons: string[];
}

export interface ScoredEngineer extends EngineerMetrics {
  rawScore: number;
  normalizedScore: number;
  dimensions: {
    product: number;
    leverage: number;
    velocity: number;
    collaboration: number;
  };
  narrative: string[];
  category: "Builder" | "Multiplier" | "Collaborator" | "Closer";
}
