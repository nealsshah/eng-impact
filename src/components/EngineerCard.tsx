"use client";

import { ScoredEngineer } from "@/lib/types";
import Link from "next/link";

const CATEGORIES: Record<
  string,
  { colors: string; description: string }
> = {
  Builder: {
    colors: "bg-blue-100 text-blue-700",
    description:
      "Highest score in Product — drives features through high PR volume and broad code changes",
  },
  Multiplier: {
    colors: "bg-purple-100 text-purple-700",
    description:
      "Highest score in Leverage — delivers large, complex PRs that spark deep discussion",
  },
  Collaborator: {
    colors: "bg-orange-100 text-orange-700",
    description:
      "Highest score in Collaboration — active reviewer who unblocks teammates",
  },
  Closer: {
    colors: "bg-green-100 text-green-700",
    description:
      "Highest score in Velocity — ships fast with most PRs merged within 24 hours",
  },
};

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function EngineerCard({
  engineer,
  rank,
}: {
  engineer: ScoredEngineer;
  rank: number;
}) {
  const cat = CATEGORIES[engineer.category];

  return (
    <Link
      href={`/engineer/${engineer.login}`}
      className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-2 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Rank + Category */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400">#{rank}</span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.colors}`}
          title={cat.description}
        >
          {engineer.category}
        </span>
      </div>

      {/* Avatar + Name + GitHub link */}
      <div className="flex items-center gap-2">
        {engineer.avatarUrl && (
          <img
            src={engineer.avatarUrl}
            alt={engineer.name}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{engineer.name}</p>
          <p className="text-xs text-gray-400">@{engineer.login}</p>
        </div>
        <a
          href={`https://github.com/${engineer.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-gray-700 shrink-0"
          title={`${engineer.login} on GitHub`}
          onClick={(e) => e.stopPropagation()}
        >
          <GitHubIcon />
        </a>
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${engineer.normalizedScore}%` }}
          />
        </div>
        <span className="text-sm font-bold text-gray-700">
          {engineer.normalizedScore}
        </span>
      </div>

      {/* Narrative bullets */}
      <ul className="text-xs text-gray-600 space-y-0.5">
        {engineer.narrative.map((bullet) => (
          <li key={bullet} className="flex gap-1">
            <span className="text-gray-400 shrink-0">&bull;</span>
            {bullet}
          </li>
        ))}
      </ul>

      {/* Most impactful PR */}
      <p
        className="text-xs text-blue-500 truncate mt-auto"
        title={engineer.mostImpactfulPr.title}
      >
        Top PR: {engineer.mostImpactfulPr.title}
      </p>
    </Link>
  );
}
