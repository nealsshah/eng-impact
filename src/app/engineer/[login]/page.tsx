import { fetchMergedPRs } from "@/lib/github";
import { computeMetrics, scorePRs } from "@/lib/metrics";
import { scoreEngineers } from "@/lib/scoring";
import { DIMENSION_COLORS, PR_TYPE_LABELS, type PRType } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORIES: Record<string, { colors: string; description: string }> = {
  Builder: {
    colors: "bg-blue-100 text-blue-700",
    description: "Highest score in Product — drives features through high PR volume and broad code changes",
  },
  Multiplier: {
    colors: "bg-purple-100 text-purple-700",
    description: "Highest score in Leverage — delivers large, complex PRs that spark deep discussion",
  },
  Collaborator: {
    colors: "bg-orange-100 text-orange-700",
    description: "Highest score in Collaboration — active reviewer who unblocks teammates",
  },
  Closer: {
    colors: "bg-green-100 text-green-700",
    description: "Highest score in Velocity — ships fast with most PRs merged within 48 hours",
  },
};

const PR_TYPE_BADGE: Record<string, string> = {
  feat: "bg-emerald-100 text-emerald-700",
  fix: "bg-red-100 text-red-700",
  refactor: "bg-sky-100 text-sky-700",
  perf: "bg-amber-100 text-amber-700",
  chore: "bg-gray-100 text-gray-500",
  docs: "bg-gray-100 text-gray-500",
  ci: "bg-gray-100 text-gray-500",
  test: "bg-indigo-100 text-indigo-600",
  revert: "bg-pink-100 text-pink-600",
  style: "bg-gray-100 text-gray-500",
  other: "bg-gray-100 text-gray-500",
};

export default async function EngineerPage({
  params,
}: {
  params: Promise<{ login: string }>;
}) {
  const { login } = await params;
  const prs = await fetchMergedPRs();
  const metrics = computeMetrics(prs);
  const engineers = scoreEngineers(metrics);
  const engineer = engineers.find((e) => e.login === login);

  if (!engineer) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Engineer not found</h1>
        <Link href="/" className="text-blue-500 hover:text-blue-700">
          Back to dashboard
        </Link>
      </main>
    );
  }

  const rank = engineers.findIndex((e) => e.login === login) + 1;
  const topPRs = scorePRs(prs, login).slice(0, 10);
  const dims = engineer.dimensions;
  const maxDim = Math.max(dims.product, dims.leverage, dims.velocity, dims.collaboration, 1);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        href="/"
        className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block"
      >
        &larr; Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {engineer.avatarUrl && (
          <img
            src={engineer.avatarUrl}
            alt={engineer.name}
            className="w-16 h-16 rounded-full"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{engineer.name}</h1>
            <a
              href={`https://github.com/${engineer.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-700"
              title={`${engineer.login} on GitHub`}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORIES[engineer.category].colors}`}
              title={CATEGORIES[engineer.category].description}
            >
              {engineer.category}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            @{engineer.login} &middot; Rank #{rank} &middot; Score{" "}
            {engineer.normalizedScore}/100
          </p>
          <p className="text-xs text-gray-400 italic mt-0.5">
            {CATEGORIES[engineer.category].description}
          </p>
          <ul className="mt-2 text-sm text-gray-600 space-y-0.5">
            {engineer.narrative.map((bullet) => (
              <li key={bullet}>
                <span className="text-gray-400">&bull;</span> {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        {[
          { label: "Merged PRs", value: engineer.mergedPrs, tooltip: "Total merged PRs in 90 days" },
          { label: "Weighted PRs", value: engineer.weightedPrCount, tooltip: "PRs weighted by type (feat=1.5x, fix=1.2x, chore=0.5x)" },
          { label: "Avg Files", value: engineer.avgFilesChanged, tooltip: "Average files changed per PR" },
          { label: "Avg Merge Time", value: `${engineer.avgTimeToMerge}h`, tooltip: "Average hours from PR creation to merge" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-3 text-center"
            title={stat.tooltip}
          >
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: "Fast PRs", value: engineer.fastPrs, tooltip: "PRs merged within 48 hours" },
          { label: "Reviews Given", value: engineer.reviewsGiven, tooltip: "Total reviews on others' PRs" },
          { label: "Substantive Reviews", value: engineer.substantiveReviews, tooltip: "Approvals + change requests (not just comments)" },
          { label: "Scope Breadth", value: engineer.scopeBreadth, tooltip: "Unique areas/scopes touched (from conventional commit scopes)" },
          {
            label: "Reverted PRs",
            value: engineer.revertedPrs,
            tooltip: "PRs that were later reverted (penalty to score)",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-3 text-center"
          >
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* PR Type Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          PR Type Breakdown
          <span className="normal-case font-normal text-gray-400 ml-2">
            (weighted count: {engineer.weightedPrCount} / {engineer.mergedPrs} raw)
          </span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(engineer.prTypeBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <div
                key={type}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${PR_TYPE_BADGE[type] || PR_TYPE_BADGE.other}`}
              >
                {PR_TYPE_LABELS[type as PRType] || type}
                <span className="ml-1 font-bold">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Dimension breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Impact Dimensions
        </h2>
        <div className="space-y-2">
          {(
            [
              { key: "product", label: "Product", color: DIMENSION_COLORS.product },
              { key: "leverage", label: "Leverage", color: DIMENSION_COLORS.leverage },
              { key: "velocity", label: "Velocity", color: DIMENSION_COLORS.velocity },
              { key: "collaboration", label: "Collaboration", color: DIMENSION_COLORS.collaboration },
            ] as const
          ).map((dim) => (
            <div key={dim.key} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-24">{dim.label}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(dims[dim.key] / maxDim) * 100}%`,
                    backgroundColor: dim.color,
                  }}
                />
              </div>
              <span className="text-xs font-mono text-gray-500 w-10 text-right">
                {Math.round(dims[dim.key] * 10) / 10}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top PRs */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Top 10 Most Impactful PRs
        </h2>
        <div className="space-y-3">
          {topPRs.map((pr, i) => (
            <div
              key={pr.number}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400 shrink-0">
                      #{i + 1}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PR_TYPE_BADGE[pr.prType] || PR_TYPE_BADGE.other}`}
                    >
                      {PR_TYPE_LABELS[pr.prType as PRType] || pr.prType}
                    </span>
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 truncate"
                    >
                      {pr.title}
                    </a>
                  </div>

                  {/* Why this PR is impactful */}
                  <ul className="text-xs text-gray-600 space-y-0.5 mb-2">
                    {pr.reasons.map((reason) => (
                      <li key={reason} className="flex gap-1">
                        <span className="text-amber-500 shrink-0">&#9733;</span>
                        {reason}
                      </li>
                    ))}
                  </ul>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      +{pr.additions.toLocaleString()} /
                      -{pr.deletions.toLocaleString()}
                    </span>
                    <span>{pr.changedFiles} files</span>
                    <span>
                      {pr.commentCount + pr.reviewCommentCount} comments
                    </span>
                    <span>
                      merged{" "}
                      {new Date(pr.mergedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {pr.labels.length > 0 && (
                      <span className="truncate">
                        {pr.labels.slice(0, 3).join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Impact score badge */}
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-gray-700">
                    {pr.impactScore}
                  </span>
                  <p className="text-xs text-gray-400">impact</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
