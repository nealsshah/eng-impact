import { graphql } from "@octokit/graphql";
import * as fs from "fs";
import * as path from "path";

const DAYS_LOOKBACK = 90;
const CACHE_FILE = path.join(process.cwd(), ".cache-prs.json");

const QUERY = `
  query($cursor: String, $searchQuery: String!) {
    search(
      query: $searchQuery
      type: ISSUE
      first: 100
      after: $cursor
    ) {
      issueCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on PullRequest {
          number
          title
          url
          author {
            login
            avatarUrl
            ... on User { name }
          }
          createdAt
          mergedAt
          additions
          deletions
          changedFiles
          comments { totalCount }
          reviews(first: 10) {
            nodes {
              author { login }
              state
              submittedAt
            }
          }
          labels(first: 10) {
            nodes { name }
          }
        }
      }
    }
  }
`;

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

// Split 90 days into weekly windows to stay under GitHub's 1000-result cap
function getDateWindows(): Array<{ from: string; to: string }> {
  const windows: Array<{ from: string; to: string }> = [];
  const now = new Date();
  const start = new Date();
  start.setDate(start.getDate() - DAYS_LOOKBACK);

  const cursor = new Date(start);
  while (cursor < now) {
    const windowEnd = new Date(cursor);
    windowEnd.setDate(windowEnd.getDate() + 7);
    if (windowEnd > now) windowEnd.setTime(now.getTime());

    windows.push({
      from: formatDate(cursor),
      to: formatDate(windowEnd),
    });
    cursor.setDate(cursor.getDate() + 7);
  }
  return windows;
}

function parsePR(node: any) {
  if (!node.author) return null;

  const reviews = (node.reviews?.nodes || [])
    .filter((r: any) => r.author)
    .map((r: any) => ({
      author: r.author.login,
      state: r.state,
      submittedAt: r.submittedAt,
    }));

  return {
    number: node.number,
    title: node.title,
    url: node.url,
    author: node.author.name || node.author.login,
    authorLogin: node.author.login,
    avatarUrl: node.author.avatarUrl,
    createdAt: node.createdAt,
    mergedAt: node.mergedAt,
    additions: node.additions,
    deletions: node.deletions,
    changedFiles: node.changedFiles,
    commentCount: node.comments.totalCount,
    reviewCommentCount: reviews.length,
    labels: node.labels.nodes.map((l: any) => l.name),
    reviews,
  };
}

async function fetchWindow(
  gql: any,
  from: string,
  to: string
): Promise<any[]> {
  const searchQuery = `repo:PostHog/posthog is:pr is:merged merged:${from}..${to}`;
  const prs: any[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const response: any = await gql(QUERY, { cursor, searchQuery });

      for (const node of response.search.nodes) {
        const pr = parsePR(node);
        if (pr) prs.push(pr);
      }

      hasNextPage = response.search.pageInfo.hasNextPage;
      cursor = response.search.pageInfo.endCursor;
    } catch (err: any) {
      if (err.status === 403) {
        console.log("    Rate limited, waiting 60s...");
        await new Promise((r) => setTimeout(r, 60000));
        continue;
      }
      if (err.status === 502 || err.status === 503) {
        console.log(`    Got ${err.status}, retrying in 5s...`);
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      throw err;
    }
  }

  return prs;
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("Set GITHUB_TOKEN in .env.local");
    process.exit(1);
  }

  const gql = graphql.defaults({
    headers: { authorization: `token ${token}` },
  });

  const windows = getDateWindows();
  console.log(
    `Fetching PRs in ${windows.length} weekly windows (${windows[0].from} to ${windows[windows.length - 1].to})...`
  );

  const allPRs: any[] = [];
  const seen = new Set<number>();

  for (let i = 0; i < windows.length; i++) {
    const w = windows[i];
    const prs = await fetchWindow(gql, w.from, w.to);

    // Deduplicate
    for (const pr of prs) {
      if (!seen.has(pr.number)) {
        seen.add(pr.number);
        allPRs.push(pr);
      }
    }

    console.log(
      `  Window ${i + 1}/${windows.length} (${w.from} to ${w.to}): ${prs.length} PRs (total: ${allPRs.length})`
    );
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(allPRs, null, 2));
  console.log(`\nDone! ${allPRs.length} PRs saved to ${CACHE_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
