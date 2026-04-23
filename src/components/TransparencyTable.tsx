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
              className="text-left py-2 px-1.5 font-semibold text-gray-500 cursor-help"
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
            className={`border-b border-gray-100 ${i < 5 ? "bg-blue-50/40" : ""}`}
          >
            <td className="py-1.5 px-1.5 font-medium">
              <Link
                href={`/engineer/${eng.login}`}
                className="hover:text-blue-600"
              >
                {eng.name}
              </Link>
            </td>
            <td className="py-1.5 px-1.5 font-bold text-blue-600">
              {eng.normalizedScore}
            </td>
            <td className="py-1.5 px-1.5">{eng.weightedPrCount}</td>
            <td className="py-1.5 px-1.5">{eng.scopeBreadth}</td>
            <td className="py-1.5 px-1.5">{eng.avgTimeToMerge}</td>
            <td className="py-1.5 px-1.5">{eng.substantiveReviews}</td>
            <td className="py-1.5 px-1.5">{eng.highDiscussionPrs}</td>
            <td className="py-1.5 px-1.5">
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
