import { ScoredEngineer } from "@/lib/types";

const COLUMNS = [
  { key: "name", label: "Engineer", tooltip: "GitHub username" },
  { key: "normalizedScore", label: "Score", tooltip: "Normalized impact score (0-100)" },
  { key: "mergedPrs", label: "Merged PRs", tooltip: "Number of PRs merged in last 90 days" },
  { key: "avgFilesChanged", label: "Avg Files", tooltip: "Average files changed per PR" },
  { key: "avgTimeToMerge", label: "Avg Merge (h)", tooltip: "Average hours from PR creation to merge" },
  { key: "reviewsGiven", label: "Reviews", tooltip: "Number of code reviews given on others' PRs" },
  { key: "highDiscussionPrs", label: "Complex PRs", tooltip: "PRs with >10 comments + review comments" },
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
              className="text-left py-2 px-2 font-semibold text-gray-500 cursor-help"
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
            <td className="py-1.5 px-2 font-medium">{eng.name}</td>
            <td className="py-1.5 px-2 font-bold text-blue-600">
              {eng.normalizedScore}
            </td>
            <td className="py-1.5 px-2">{eng.mergedPrs}</td>
            <td className="py-1.5 px-2">{eng.avgFilesChanged}</td>
            <td className="py-1.5 px-2">{eng.avgTimeToMerge}</td>
            <td className="py-1.5 px-2">{eng.reviewsGiven}</td>
            <td className="py-1.5 px-2">{eng.highDiscussionPrs}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
