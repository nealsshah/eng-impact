# Engineering Impact Dashboard

Analyzes the last 90 days of merged PRs in [PostHog/posthog](https://github.com/PostHog/posthog) and ranks engineers by impact.

## How Ranking Works

### Philosophy

Impact is not output. Raw commit counts and lines of code don't tell you who moves the product forward. This dashboard approximates impact across four dimensions: **Product**, **Leverage**, **Velocity**, and **Collaboration**.

### Data Collection

We pull all merged PRs from the last 90 days via GitHub's GraphQL API. For each PR we collect: author, timestamps, files changed, additions/deletions, comments, reviews, and labels. Bots are excluded (dependabot, github-actions, greptile-apps, etc.). Engineers with fewer than 3 merged PRs are filtered out.

### PR Type Detection

Each PR is classified by its conventional commit prefix (`feat`, `fix`, `chore`, `refactor`, `perf`, etc.) and assigned a type weight. This means a feature PR contributes more to an engineer's score than a chore.

| Type | Weight | Type | Weight |
|------|--------|------|--------|
| feat | 1.5x | chore | 0.5x |
| perf | 1.3x | revert | 0.5x |
| fix | 1.2x | docs | 0.4x |
| refactor | 1.1x | ci | 0.4x |
| other | 1.0x | style | 0.3x |
| test | 0.6x | | |

### Per-Engineer Metrics

| Metric | Definition |
|--------|-----------|
| **Weighted PR Count** | Sum of type weights across all merged PRs (not raw count) |
| **Avg Files Changed** | Mean files changed per PR |
| **Large PR Count** | PRs changing more than 5 files |
| **High Discussion PRs** | PRs with more than 10 total comments + review comments |
| **Fast PRs** | PRs merged within 24 hours of creation |
| **Reviews Given** | Total reviews left on other engineers' PRs |
| **Substantive Reviews** | Reviews that are APPROVED or CHANGES_REQUESTED (not just COMMENTED) |
| **Scope Breadth** | Number of unique scopes from conventional commit titles, e.g. `feat(pipeline)`, `fix(api)` |
| **Reverted PRs** | PRs authored by this engineer that were later reverted |
| **Net Lines Changed** | Additions minus deletions (negative = net code removal/cleanup) |

### Impact Score Formula

The raw score is the sum of four dimensions:

```
Product       = (weightedPrCount * 2) + (avgFilesChanged * 0.5) + (scopeBreadth * 1.5)
Leverage      = (largePrCount * 2) + (highDiscussionPrs * 3) + codeCleanupBonus
Velocity      = (fastPrs * 2) + (revertedPrs * -5)
Collaboration = (reviewsGiven * 1.5) + (substantiveReviews * 1.0)

Raw Score     = Product + Leverage + Velocity + Collaboration  (floored at 0)
```

Where `codeCleanupBonus = abs(netLinesChanged / 100) * 0.3` only when net lines are negative (engineer is removing more code than adding).

Scores are **normalized 0-100** by dividing each engineer's raw score by the maximum raw score across all qualifying engineers.

### Engineer Categories

Each engineer is assigned a category based on their highest-scoring dimension:

| Category | Dominant Dimension | Meaning |
|----------|-------------------|---------|
| **Builder** | Product | Drives features through high PR volume and broad code changes |
| **Multiplier** | Leverage | Delivers large, complex PRs that spark deep discussion |
| **Closer** | Velocity | Ships fast with most PRs merged quickly |
| **Collaborator** | Collaboration | Active reviewer who unblocks teammates |

### Narrative Generation

Each engineer gets 2-3 descriptive bullets based on which of their metrics are above the 75th percentile relative to all qualifying engineers. Examples: "Works across many areas of the codebase", "Gives thorough reviews", "Ships quickly".

### What This Doesn't Capture

- Quality of code (no static analysis)
- Business impact of specific features
- Mentoring, pairing, or Slack help
- On-call, incident response, or operational work
- Design docs, RFCs, or planning contributions

This is a starting point for understanding engineering contribution patterns, not a performance review.

## Setup

1. Generate a GitHub personal access token at https://github.com/settings/tokens (classic, `public_repo` scope)
2. Copy it into `.env.local`:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   ```
3. Install dependencies and fetch data:
   ```
   npm install
   npm run fetch-data
   ```
4. Start the dashboard:
   ```
   npm run dev
   ```

Data is cached in `.cache-prs.json`. Re-run `npm run fetch-data` to refresh.
