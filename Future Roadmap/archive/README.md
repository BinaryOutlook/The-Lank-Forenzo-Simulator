# Future Roadmap Archive

Status: Historical record store for completed, rejected, or superseded roadmap work
Last updated: 2026-05-12

This folder keeps finished roadmap documentation out of the active generated master table without losing the audit trail. The active queue stays readable, and future maintainers can still reconstruct what happened.

## What Belongs Here

Archive records belong here when a roadmap item is:

- completed and merged to `main`
- rejected after review
- superseded by a newer candidate
- split into successor candidates
- moved out of active issue briefs after post-merge audit

Do not archive active work. A candidate still waiting, blocked, under review, or in progress belongs in [`../issue-briefs/`](../issue-briefs/) so it can appear in the generated [`../MASTER_ROADMAP_TABLE.md`](../MASTER_ROADMAP_TABLE.md).

## Archive Timing

Use this flow:

```text
candidate brief
-> GitHub issue
-> pull request
-> merge to main
-> post-merge audit
-> archive record
-> move or compact active brief
-> regenerate master table
```

For rejected or superseded work, replace the issue or PR steps with the review decision that closed the candidate.

## Naming Convention

Use the roadmap ID and a short kebab-case title:

```text
FR-0001-centralize-roadmap-workflow.md
FR-0004-run-archive-implementation.md
FR-0012-offline-content-assistant-workflow.md
```

If a candidate was split, keep the original ID in the archive record and link to successor IDs.

## Archive Record Contents

Each archive record should include:

- original roadmap ID and title
- final status
- category
- issue link, PR link, and merge commit when available
- final decision
- touched docs or systems
- verification performed
- conflict-risk notes
- follow-up candidates, if any
- short audit note explaining why the record moved out of the active table

## Archive Index

| ID | Title | Final Status | Issue | PR / Merge | Archive Record |
| --- | --- | --- | --- | --- | --- |
| FR-0001 | Centralize roadmap workflow | Done | None; direct user request | [PR #80](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/80), merge `57385dd` | [`FR-0001-centralize-roadmap-workflow.md`](FR-0001-centralize-roadmap-workflow.md) |
