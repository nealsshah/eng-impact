import { ScoredEngineer } from "@/lib/types";
import Link from "next/link";

const COLUMNS = [
  { key: "name", label: "Engineer", tooltip: "GitHub username" },
  { key: "normalizedScore", label: "Score", tooltip: "Normalized impact score (0-100)" },
  { key: "weightedPrCount", label: "W.PRs", tooltip: "Type-weighted PR count (feat=1.5x, fix=1.2x, chore=0.5x)" },
  { key: "scopeBreadth", label: "Scope", tooltip: "Unique areas/scopes touched" },
  { key: "avgTimeToMerge", label: "Merge(h)", tooltip: "Average hours to merge" },
  { key: "substantiveReviews", label: "Reviews", tooltip: "Substantive reviews (approvals + change requests)" },
  { key: "highDiscussionPrs", label: "Complex", tooltip: "PRs with >10 comments" },
  { key: "revertedPrs", label: "Reverts", tooltip: "PRs that were later reverted" },
] as const;

export function TransparencyTable({
  engineers,
}: {
  engineers: ScoredEngineer[];
}) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-gray-200">
          {COLUMNS.map((col) => (
            <th
              key={col.key}
              className="text-left py-2 px-1.5 font-semibold text-gray-400 cursor-help text-[11px] uppercase tracking-wider"
              title={col.tooltip}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {engineers.map((eng, i) => (
          <tr
            key={eng.login}
            className={`border-b border-gray-100 hover:bg-gray-50 ${i < 5 ? "bg-blue-50/30" : ""}`}
          >
            <td className="py-2 px-1.5 font-medium">
              <Link
                href={`/engineer/${eng.login}`}
                className="hover:text-blue-600 transition-colors duration-150"
              >
                {eng.name}
              </Link>
            </td>
            <td className="py-2 px-1.5 font-bold tabular-nums text-blue-600">
              {eng.normalizedScore}
            </td>
            <td className="py-2 px-1.5 tabular-nums">{eng.weightedPrCount}</td>
            <td className="py-2 px-1.5 tabular-nums">{eng.scopeBreadth}</td>
            <td className="py-2 px-1.5 tabular-nums">{eng.avgTimeToMerge}</td>
            <td className="py-2 px-1.5 tabular-nums">{eng.substantiveReviews}</td>
            <td className="py-2 px-1.5 tabular-nums">{eng.highDiscussionPrs}</td>
            <td className="py-2 px-1.5 tabular-nums">
              {eng.revertedPrs > 0 ? (
                <span className="text-red-500">{eng.revertedPrs}</span>
              ) : (
                <span className="text-gray-300">0</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
