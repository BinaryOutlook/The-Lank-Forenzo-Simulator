# Future Roadmap

Status: Authoritative pre-GitHub-issue queue
Owner: BinaryOutlook
Last updated: 2026-05-13

## Purpose

`Future Roadmap/` is the project's buffer zone before GitHub issues. It is where ideas, feature requests, refactors, architectural moves, and agent tasks wait until they are scoped enough to deserve active tracker space.

Use the restaurant queue model:

- Normal ideas wait until their table is ready.
- Urgent or VIP items can move ahead, but the brief must say why.
- Unclear ideas stay in the waiting area until someone clarifies them.
- High-conflict work must be split or architecture-reviewed before promotion.

This folder is not a dumping ground. It is a controlled queue for reducing duplicate agent work, premature issue creation, merge conflicts, and architecture drift.

The operating rule is:

\[
\text{Promotion Readiness} =
\frac{\text{Value} \times \text{Clarity} \times \text{Reviewability}}
{\text{Effort} + \text{Conflict Risk} + \text{Core-System Risk}}
\]

If clarity is low, the work waits. If risk is high, the work gets review before it becomes active.

## Workflow

```text
Idea / request
-> candidate issue brief
-> frontmatter evaluation
-> generated master table index
-> priority decision
-> promotion to GitHub issue
-> agent assignment
-> PR review
-> merge
-> post-merge audit
-> archive or return to roadmap
```

### 1. Idea / Request

Capture the idea in plain language. Do not open a GitHub issue just because an idea exists.

Good inputs include:

- player-facing feature requests
- content expansion proposals
- system refactors
- documentation or tooling improvements
- agent work that needs sequencing
- suspected architecture debt

### 2. Candidate Issue Brief

Create a standalone brief under [`issue-briefs/`](issue-briefs/) using [`ISSUE_BRIEF_TEMPLATE.md`](ISSUE_BRIEF_TEMPLATE.md).

A brief must be understandable without reading a chat transcript. Its YAML frontmatter feeds the generated Supermaster table, and its body should explain the value, scope, risks, dependencies, likely touched areas, acceptance criteria, test plan, documentation impact, rollback path, and open questions.

### 3. Evaluation In Brief Frontmatter

Add or update the metadata in the issue brief frontmatter. Individual issue briefs are the source of truth for value, effort, difficulty, conflict risk, core-system risk, dependencies, parallelism class, priority, status, GitHub issue link, owner, and latest decision.

Do not manually edit [`MASTER_ROADMAP_TABLE.md`](MASTER_ROADMAP_TABLE.md). It is a generated dashboard. After changing issue brief frontmatter, run:

```bash
npm run roadmap:generate
npm run roadmap:check
```

The generated table answers:

- Is this valuable now?
- Is the scope reviewable?
- Can multiple agents work on it safely?
- Does it touch red-zone systems?
- What must land first?

### 4. Priority Decision

Priority is not just urgency. It is a decision about value, sequencing, and risk.

- **Normal**: stays in order until dependencies, clarity, and capacity line up.
- **VIP / Urgent**: can skip ahead only with a written reason in the brief and table notes.
- **Needs Clarification**: waits until the missing product, technical, or ownership detail is answered.
- **Needs Architecture Review**: cannot be promoted until the risky surface is reviewed.

### 5. Promotion To GitHub Issue

Promote only work that is specific enough for one focused PR or an explicitly staged series of PRs.

When promoting:

- copy the brief into the GitHub issue or link to it
- preserve scope, non-goals, risks, dependencies, and test plan
- add the GitHub issue link to the issue brief frontmatter
- change the brief frontmatter status to `Promoted to GitHub Issue`
- regenerate the master table with `npm run roadmap:generate`
- keep dependency order visible

GitHub issues are for actionable work, not raw possibilities.

### 6. Agent Assignment

Assign agents from promoted issues, not loose notes. Respect the parallelism class:

- green work can run in parallel aggressively
- yellow work needs clear file or module boundaries
- orange work needs one main owner with helpers
- red work should not be parallelized across core mutations

### 7. PR Review

PRs should be small, reviewable, and honest about conflict risk. PR summaries should mention:

- promoted issue or roadmap row
- touched modules
- tests or reports run
- conflict-risk notes
- documentation updates

### 8. Merge

Merge in dependency order, not completion order. A later PR that finishes early should wait if it depends on a foundation PR still under review.

### 9. Post-Merge Audit

After merge:

- update the issue brief frontmatter status and latest decision
- create or update an archive record under [`archive/`](archive/) for completed, rejected, or superseded work
- move or compact completed source briefs once their archive record exists
- regenerate the master table
- mark the brief as promoted, done, archived, or replaced by successor candidates
- update docs if commands, architecture, product scope, or workflow changed
- close any stale roadmap notes that are now superseded
- record follow-up candidates as new briefs rather than expanding completed issues

### 10. Archive Or Return To Roadmap

Completed work moves to [`archive/`](archive/) after the issue, PR, merge, and post-merge audit are complete. The active table should stay focused on work that still needs a decision.

If a PR only partially resolves a candidate, keep the active brief and update `last_decision` for the remaining scope. If the work was split, archive the original candidate and create successor briefs with new IDs.

## Audit Summary

The 2026-05-12 documentation audit found roadmap-like material in these places:

| Location | What It Contains | Current Authority |
| --- | --- | --- |
| [`README.md`](../README.md) | Repo overview, setup, scripts, layout, and previous links to roadmap documents. | Authoritative for current setup and contributor orientation. Updated to point planning work here. |
| [`AGENTS.md`](../AGENTS.md) | Agent maintenance rules and PRD workflow. | Authoritative for agent behavior. Updated with the Future Roadmap queue rules. |
| [`docs/PRD.md`](../docs/PRD.md) | Stable product direction, scope, non-goals, and guardrails. | Authoritative for durable product intent. Updated to recognize this folder as the pre-issue queue. |
| [`PRDs/`](../PRDs/) | Version-scoped iteration packets and change logs. | Authoritative for their specific shipped or active iteration only. Not a general issue queue. |
| [`docs/FUTURE_REPORT.md`](../docs/FUTURE_REPORT.md) | Long-term technical and product rationale. | Still useful as strategic rationale. It is not the active issue queue. |
| [`docs/FUTURE_REPORT_IMPLEMENTATION_PLAN.md`](../docs/FUTURE_REPORT_IMPLEMENTATION_PLAN.md) | Historical issue breakdown derived from the Future Report. | Superseded for new candidate work. Preserved as a promoted-issue map and historical sequencing record. |
| [`idea.md`](../idea.md) | Broad expansion proposal and six-month action plan. | Historical/reference material. New work derived from it must enter this queue first. |
| [`docs/reference/run-archive.md`](../docs/reference/run-archive.md) | Local-first archive design note for later implementation. | System-specific reference. Future implementation work needs a candidate brief before promotion. |
| [`docs/decisions/ADR-001-prepare-future-package-boundaries.md`](../docs/decisions/ADR-001-prepare-future-package-boundaries.md) | Architecture decision for future package boundaries. | Authoritative ADR for that decision. It does not authorize migration work by itself. |
| [`docs/reference/`](../docs/reference/) | System reference notes for factions, operations, dossiers, events, decisions, reporting, and archives. | Authoritative for local system behavior where current. Not a global planning workflow. |

Docs updated during the conversion:

- `README.md`
- `AGENTS.md`
- `docs/PRD.md`
- `docs/FUTURE_REPORT.md`
- `docs/FUTURE_REPORT_IMPLEMENTATION_PLAN.md`
- `docs/reference/run-archive.md`
- `idea.md`

Docs marked superseded or historical:

- `docs/FUTURE_REPORT_IMPLEMENTATION_PLAN.md` is superseded as the place to create or refine new issues.
- `idea.md` is marked as a historical expansion draft, not the live roadmap queue.
- `docs/FUTURE_REPORT.md` is marked as strategic rationale, not the promotion workflow.

## Source Of Truth

- **Pre-issue queue**: this folder.
- **Candidate ranking and status source**: issue brief frontmatter under [`issue-briefs/`](issue-briefs/).
- **Generated candidate index**: [`MASTER_ROADMAP_TABLE.md`](MASTER_ROADMAP_TABLE.md).
- **Candidate brief format**: [`ISSUE_BRIEF_TEMPLATE.md`](ISSUE_BRIEF_TEMPLATE.md).
- **Completed, rejected, and superseded records**: [`archive/`](archive/).
- **Active work**: promoted GitHub issues.
- **Durable product direction**: [`docs/PRD.md`](../docs/PRD.md).
- **Iteration contracts**: [`PRDs/`](../PRDs/).
- **Architecture decisions**: [`docs/decisions/`](../docs/decisions/).
- **Current repo setup**: [`README.md`](../README.md).

## Roadmap Commands

| Command | Purpose |
| --- | --- |
| `npm run roadmap:generate` | Regenerates `MASTER_ROADMAP_TABLE.md` from `issue-briefs/*.md` frontmatter. |
| `npm run roadmap:check` | Validates required metadata, duplicate IDs, allowed parallelism classes, and whether the generated table is current. |
