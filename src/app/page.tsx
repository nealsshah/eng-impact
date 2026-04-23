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

  const bottom5 = engineers.slice(-5).reverse();

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

      {/* Bottom 5 Cards */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Bottom 5
        </h2>
        <div className="grid grid-cols-5 gap-3">
          {bottom5.map((eng) => {
            const actualRank =
              engineers.findIndex((e) => e.login === eng.login) + 1;
            return (
              <EngineerCard
                key={eng.login}
                engineer={eng}
                rank={actualRank}
              />
            );
          })}
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

      {/* Footer */}
      <p className="text-[11px] text-gray-400 mt-6 text-center leading-relaxed">
        Score = Product + Leverage + Velocity + Collaboration, where Product =
        (weighted_prs&times;2 + avg_files&times;0.5 + scope&times;1.5),
        Leverage = (large_prs&times;2 + complex_prs&times;3 + cleanup_bonus),
        Velocity = (fast_prs&times;2 + reverts&times;-5), Collaboration =
        (reviews&times;1.5 + substantive&times;1.0). Normalized 0&ndash;100.
      </p>
    </main>
  );
}
