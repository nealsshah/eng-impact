# Engineering Impact Dashboard — Technical Specification

## Overview
Build a single-page dashboard that analyzes the last 90 days of activity in the PostHog GitHub repository and identifies the top 5 most impactful engineers.

Repository:
https://github.com/PostHog/posthog

The goal is not to measure output (commits, LOC), but to approximate **engineering impact**, defined as:

> How much an engineer moves the product forward for others.

This spec is designed to be executed quickly (~1.5 hours scope) with clear tradeoffs and explainability.

---

## Core Principles

1. **Explainability over complexity**
   Every metric must be understandable at a glance.

2. **Impact ≠ Output**
   Avoid raw counts like commits or LOC as primary signals.

3. **Single screen UX**
   Must fit on one laptop screen.

4. **Fast load (<10s)**
   Precompute if needed.

---

## Definition of Impact

Impact is composed of 4 dimensions:

### 1. Product Impact
Signals that code meaningfully changes the product.

- Merged PRs
- PR size (files changed)
- Cross-cutting changes

### 2. Leverage (Multiplier Effect)
Signals that enable others.

- PRs touching many files
- PRs with high discussion
- Foundational changes

### 3. Velocity
Signals execution speed and reliability.

- Time to merge
- PR completion rate

### 4. Collaboration
Signals working with others.

- Reviews given
- Comment participation
- Being involved in discussions

---

## Data Requirements

Pull data from GitHub for the last 90 days:

### Pull Requests
- author
- created_at
- merged_at
- additions
- deletions
- changed_files
- comments
- review_comments
- requested_reviewers
- labels

### Reviews
- reviewer
- state
- submitted_at

### Comments
- author
- body
- created_at

---

## Data Collection Approach

Use GitHub GraphQL API (preferred) or REST API.

Filter:
- Only PRs merged within last 90 days

Pagination required.

Store data in memory or simple JSON.

---

## Derived Metrics Per Engineer

For each engineer:

### Basic
- merged_prs
- opened_prs
- merge_rate = merged / opened

### Size / Scope
- avg_files_changed
- large_pr_count (files_changed > 5)

### Discussion / Complexity
- high_discussion_prs (comments + review_comments > 10)

### Velocity
- avg_time_to_merge (hours)
- fast_prs (merged < 24h)

### Collaboration
- reviews_given
- comments_made

---

## Impact Score (Explainable Formula)

Impact Score =

(merged_prs * 2)
+ (avg_files_changed * 0.5)
+ (high_discussion_prs * 3)
+ (reviews_given * 1.5)
+ (fast_prs * 2)
+ (large_pr_count * 2)

Normalize scores across engineers.

---

## Impact Narrative Generation

For each top engineer, generate 2–3 bullets:

Examples:

- "Works on large, cross-cutting changes"
- "Frequently unblocks others quickly"
- "Highly active in code reviews"
- "Handles complex PRs with high discussion"

Rules:

IF avg_files_changed high → "large, cross-cutting changes"
IF fast_prs high → "moves quickly"
IF reviews_given high → "strong collaborator"
IF high_discussion_prs high → "handles complex work"

---

## Dashboard Requirements

Single page layout:

### Section 1: Top Engineers (Cards)

Top 5 engineers ranked by impact score.

Each card shows:
- Name
- Impact score
- 2–3 bullet explanation
- Link to most impactful PR

---

### Section 2: Impact Breakdown Chart

Stacked bar chart per engineer:
- Product
- Leverage
- Velocity
- Collaboration

---

### Section 3: Transparency Table

Columns:
- Engineer
- Merged PRs
- Avg files changed
- Avg time to merge
- Reviews given
- High discussion PRs

---

## UI Requirements

- Clean, minimal
- No scrolling ideally
- Fast load
- Hover tooltips for metrics

---

## Tech Stack (Recommended)

Fastest path:

### Option A (Preferred)
- Next.js
- TypeScript
- GitHub GraphQL API
- Recharts
- Vercel deploy

### Option B (Even faster)
- Python
- Streamlit
- requests + GitHub API

---

## Performance Considerations

- Cache API results locally
- Limit to last 90 days
- Avoid unnecessary fields

---

## Edge Cases

- Bots → exclude
- Very small contributors → optional filter (min PRs = 3)
- Missing data → default to 0

---

## Deliverables

- Hosted dashboard URL
- This logic implemented
- Clear explanation of scoring

---

## Stretch Ideas (Optional)

- Categorize engineers:
  - Builder
  - Multiplier
  - Collaborator
  - Closer

- Show most impactful PR per engineer

---

## Success Criteria

A busy engineering leader should be able to answer:

> Who are the most impactful engineers and why?

in under 30 seconds.

---

## End
