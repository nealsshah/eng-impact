import { GitHubPR, EngineerMetrics, ScoredPR } from "./types";
import { isBot, MIN_PRS, THRESHOLDS } from "./constants";

export function computeMetrics(prs: GitHubPR[]): EngineerMetrics[] {
  const prsByAuthor = new Map<string, GitHubPR[]>();
  const reviewsByReviewer = new Map<string, number>();
  const commentsByAuthor = new Map<string, number>();
  const nameMap = new Map<string, string>();
  const avatarMap = new Map<string, string>();

  for (const pr of prs) {
    const login = pr.authorLogin;
    if (isBot(login)) continue;

    nameMap.set(login, pr.author);
    avatarMap.set(login, pr.avatarUrl);

    if (!prsByAuthor.has(login)) {
      prsByAuthor.set(login, []);
    }
    prsByAuthor.get(login)!.push(pr);

    // Count reviews given by others on this PR
    for (const review of pr.reviews) {
      if (isBot(review.author) || review.author === login) continue;
      reviewsByReviewer.set(
        review.author,
        (reviewsByReviewer.get(review.author) || 0) + 1
      );
      // Ensure reviewer appears in name/avatar maps
      if (!nameMap.has(review.author)) {
        nameMap.set(review.author, review.author);
        avatarMap.set(review.author, "");
      }
    }
  }

  const engineers: EngineerMetrics[] = [];

  for (const [login, authorPrs] of prsByAuthor) {
    if (authorPrs.length < MIN_PRS) continue;

    const totalFiles = authorPrs.reduce((s, pr) => s + pr.changedFiles, 0);
    const avgFilesChanged = totalFiles / authorPrs.length;

    const largePrCount = authorPrs.filter(
      (pr) => pr.changedFiles > THRESHOLDS.largePrFiles
    ).length;

    const highDiscussionPrs = authorPrs.filter(
      (pr) =>
        pr.commentCount + pr.reviewCommentCount >
        THRESHOLDS.highDiscussionComments
    ).length;

    const mergeTimes = authorPrs.map((pr) => {
      const created = new Date(pr.createdAt).getTime();
      const merged = new Date(pr.mergedAt).getTime();
      return (merged - created) / (1000 * 60 * 60); // hours
    });
    const avgTimeToMerge =
      mergeTimes.reduce((s, t) => s + t, 0) / mergeTimes.length;

    const fastPrs = mergeTimes.filter(
      (t) => t < THRESHOLDS.fastMergeHours
    ).length;

    // Find most impactful PR (highest changedFiles + discussion)
    const mostImpactful = authorPrs.reduce((best, pr) => {
      const score =
        pr.changedFiles + pr.commentCount + pr.reviewCommentCount;
      const bestScore =
        best.changedFiles + best.commentCount + best.reviewCommentCount;
      return score > bestScore ? pr : best;
    }, authorPrs[0]);

    engineers.push({
      login,
      name: nameMap.get(login) || login,
      avatarUrl: avatarMap.get(login) || "",
      mergedPrs: authorPrs.length,
      avgFilesChanged: Math.round(avgFilesChanged * 10) / 10,
      largePrCount,
      highDiscussionPrs,
      avgTimeToMerge: Math.round(avgTimeToMerge * 10) / 10,
      fastPrs,
      reviewsGiven: reviewsByReviewer.get(login) || 0,
      commentsMade: 0, // tracked via PR comments
      mostImpactfulPr: {
        title: mostImpactful.title,
        url: mostImpactful.url,
      },
    });
  }

  return engineers;
}

export function scorePRs(prs: GitHubPR[], login: string): ScoredPR[] {
  const authorPrs = prs.filter((pr) => pr.authorLogin === login);

  return authorPrs
    .map((pr) => {
      const timeToMergeHours =
        (new Date(pr.mergedAt).getTime() - new Date(pr.createdAt).getTime()) /
        (1000 * 60 * 60);

      const totalDiscussion = pr.commentCount + pr.reviewCommentCount;

      // Score each PR on the same dimensions as the overall formula
      let impactScore = 0;
      const reasons: string[] = [];

      // Large scope
      if (pr.changedFiles > THRESHOLDS.largePrFiles) {
        impactScore += pr.changedFiles * 0.5;
        reasons.push(
          `Touched ${pr.changedFiles} files across ${pr.additions.toLocaleString()}+ / ${pr.deletions.toLocaleString()}- lines`
        );
      }

      // High discussion = complex/important
      if (totalDiscussion > THRESHOLDS.highDiscussionComments) {
        impactScore += totalDiscussion * 0.8;
        reasons.push(
          `Sparked ${totalDiscussion} comments — high-discussion, complex change`
        );
      }

      // Fast merge = efficient execution
      if (timeToMergeHours < THRESHOLDS.fastMergeHours) {
        impactScore += 5;
        reasons.push(
          `Merged in ${timeToMergeHours < 1 ? "under an hour" : `${Math.round(timeToMergeHours)}h`} — fast turnaround`
        );
      }

      // Multi-reviewer = high-confidence change
      const uniqueReviewers = new Set(pr.reviews.map((r) => r.author)).size;
      if (uniqueReviewers >= 2) {
        impactScore += uniqueReviewers * 2;
        reasons.push(
          `Reviewed by ${uniqueReviewers} engineers — broad consensus`
        );
      }

      // Base score from size
      impactScore += Math.log2(pr.additions + pr.deletions + 1) * 2;

      // Fallback reason if none triggered
      if (reasons.length === 0) {
        reasons.push(
          `${pr.additions + pr.deletions} lines changed across ${pr.changedFiles} files`
        );
      }

      return {
        number: pr.number,
        title: pr.title,
        url: pr.url,
        mergedAt: pr.mergedAt,
        changedFiles: pr.changedFiles,
        additions: pr.additions,
        deletions: pr.deletions,
        commentCount: pr.commentCount,
        reviewCommentCount: pr.reviewCommentCount,
        timeToMergeHours: Math.round(timeToMergeHours * 10) / 10,
        labels: pr.labels,
        impactScore: Math.round(impactScore * 10) / 10,
        reasons,
      };
    })
    .sort((a, b) => b.impactScore - a.impactScore);
}
