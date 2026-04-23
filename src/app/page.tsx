import { fetchMergedPRs } from "@/lib/github";
import { computeMetrics } from "@/lib/metrics";
import { scoreEngineers } from "@/lib/scoring";
import { EngineerCard } from "@/components/EngineerCard";
import { ImpactChart } from "@/components/ImpactChart";
import { TransparencyTable } from "@/components/TransparencyTable";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function Home() {
  let prs, metrics, engineers, top5;
  try {
    prs = await fetchMergedPRs();
    metrics = computeMetrics(prs);
    engineers = scoreEngineers(metrics);
    top5 = engineers.slice(0, 5);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Failed to load data</h1>
        <p className="text-red-600 font-mono text-sm mb-4">{msg}</p>
        <p className="text-gray-500 text-sm">
          Check that GITHUB_TOKEN is set correctly in .env.local with the
          public_repo scope.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Engineering Impact Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          PostHog/posthog &middot; Last 90 days &middot; {prs.length} merged PRs
          &middot; {metrics.length} engineers
        </p>
      </div>

      {/* Top 5 Cards */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Top 5 Most Impactful Engineers
        </h2>
        <div className="grid grid-cols-5 gap-3">
          {top5.map((eng, i) => (
            <EngineerCard key={eng.login} engineer={eng} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* Bottom 5 Cards */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Bottom 5
        </h2>
        <div className="grid grid-cols-5 gap-3">
          {engineers.slice(-5).reverse().map((eng) => (
            <EngineerCard
              key={eng.login}
              engineer={eng}
              rank={engineers.length - engineers.indexOf(eng)}
            />
          ))}
        </div>
      </section>

      {/* Chart + Table */}
      <div className="grid grid-cols-2 gap-4">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Impact Breakdown
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <ImpactChart engineers={top5} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Detailed Metrics
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
            <TransparencyTable engineers={engineers.slice(0, 15)} />
          </div>
        </section>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        Score = (merged_prs&times;2) + (avg_files&times;0.5) +
        (high_discussion_prs&times;3) + (reviews_given&times;1.5) +
        (fast_prs&times;2) + (large_pr_count&times;2), normalized 0&ndash;100
      </p>
    </main>
  );
}
