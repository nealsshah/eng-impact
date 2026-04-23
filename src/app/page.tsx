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
      <main className="max-w-7xl mx-auto px-6 py-20 text-center">
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
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Engineering Impact Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          PostHog/posthog &middot; Last 90 days &middot;{" "}
          {prs.length.toLocaleString()} merged PRs &middot; {metrics.length}{" "}
          qualifying engineers
        </p>
      </div>

      {/* Scoring explanation */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          How Scoring Works
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Each engineer is scored across four dimensions based on their last 90 days of merged PRs. The raw sum is normalized 0&ndash;100 relative to the highest-scoring engineer. PRs are weighted by type (feat 1.5x, fix 1.2x, chore 0.5x, etc.). Click any engineer for a full breakdown.
        </p>
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="font-semibold text-blue-700 mb-1">Product</p>
            <p className="text-gray-500">weighted PRs &times; 2 + avg files &times; 0.5 + scope breadth &times; 1.5</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="font-semibold text-purple-700 mb-1">Leverage</p>
            <p className="text-gray-500">large PRs &times; 2 + complex PRs &times; 3 + cleanup bonus</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="font-semibold text-green-700 mb-1">Velocity</p>
            <p className="text-gray-500">fast PRs &times; 2 + reverts &times; -5</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="font-semibold text-orange-700 mb-1">Collaboration</p>
            <p className="text-gray-500">reviews &times; 1.5 + substantive reviews &times; 1.0</p>
          </div>
        </div>
      </div>

      {/* Top 5 Cards */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Top 5 Most Impactful Engineers
        </h2>
        <div className="grid grid-cols-5 gap-3">
          {top5.map((eng, i) => (
            <EngineerCard key={eng.login} engineer={eng} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* Chart + Table */}
      <div className="grid grid-cols-2 gap-5">
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Impact Breakdown
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <ImpactChart engineers={top5} />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Detailed Metrics
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
            <TransparencyTable engineers={engineers.slice(0, 15)} />
          </div>
        </section>
      </div>

    </main>
  );
}
