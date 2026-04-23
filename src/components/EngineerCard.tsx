"use client";

import { ScoredEngineer } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/constants";
import Link from "next/link";

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
  const cat = CATEGORY_CONFIG[engineer.category];

  return (
    <Link
      href={`/engineer/${engineer.login}`}
      className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-2 hover:border-gray-300 hover:shadow-md transition-[border-color,box-shadow] duration-200"
    >
      {/* Rank + Category */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400">#{rank}</span>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cat.colors}`}
          title={cat.description}
        >
          {engineer.category}
        </span>
      </div>

      {/* Avatar + Name + GitHub link */}
      <div className="flex items-center gap-2.5">
        {engineer.avatarUrl ? (
          <img
            src={engineer.avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate leading-tight">
            {engineer.name}
          </p>
          <p className="text-xs text-gray-400 leading-tight">
            @{engineer.login}
          </p>
        </div>
        <a
          href={`https://github.com/${engineer.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-gray-600 shrink-0 transition-colors duration-150"
          title={`${engineer.login} on GitHub`}
          onClick={(e) => e.stopPropagation()}
        >
          <GitHubIcon />
        </a>
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full score-fill"
            style={{ width: `${engineer.normalizedScore}%` }}
          />
        </div>
        <span className="text-xs font-bold text-gray-600 tabular-nums text-right">
          {engineer.normalizedScore}<span className="text-gray-400 font-normal">/100</span>
        </span>
      </div>

      {/* Narrative bullets */}
      <ul className="text-[11px] text-gray-500 space-y-0.5 leading-snug">
        {engineer.narrative.map((bullet) => (
          <li key={bullet} className="flex gap-1">
            <span className="text-gray-300 shrink-0">&bull;</span>
            {bullet}
          </li>
        ))}
      </ul>

      {/* Most impactful PR */}
      <p
        className="text-[11px] text-blue-500 truncate mt-auto leading-snug"
        title={engineer.mostImpactfulPr.title}
      >
        Top PR: {engineer.mostImpactfulPr.title}
      </p>
    </Link>
  );
}
