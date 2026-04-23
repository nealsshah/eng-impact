import { fetchMergedPRs } from "@/lib/github";
import { computeMetrics, scorePRs } from "@/lib/metrics";
import { scoreEngineers } from "@/lib/scoring";
import { DIMENSION_COLORS } from "@/lib/constants";
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
    description: "Highest score in Velocity — ships fast with most PRs merged within 24 hours",
  },
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
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[engineer.category]}`}
            >
              {engineer.category}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            @{engineer.login} &middot; Rank #{rank} &middot; Score{" "}
            {engineer.normalizedScore}/100
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
      <div className="grid grid-cols-6 gap-3 mb-6">
        {[
          { label: "Merged PRs", value: engineer.mergedPrs },
          { label: "Avg Files", value: engineer.avgFilesChanged },
          { label: "Large PRs", value: engineer.largePrCount },
          { label: "Fast PRs", value: engineer.fastPrs },
          { label: "Reviews Given", value: engineer.reviewsGiven },
          {
            label: "Avg Merge Time",
            value: `${engineer.avgTimeToMerge}h`,
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
