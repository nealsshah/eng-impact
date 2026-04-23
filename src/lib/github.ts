import { GitHubPR } from "./types";
import * as fs from "fs";
import * as path from "path";

const CACHE_FILE = path.join(process.cwd(), ".cache-prs.json");

export async function fetchMergedPRs(): Promise<GitHubPR[]> {
  if (!fs.existsSync(CACHE_FILE)) {
    throw new Error(
      "No cached data found. Run: npx tsx scripts/fetch-data.ts"
    );
  }

  const data = fs.readFileSync(CACHE_FILE, "utf-8");
  const prs: GitHubPR[] = JSON.parse(data);
  console.log(`[github] Loaded ${prs.length} PRs from cache`);
  return prs;
}
