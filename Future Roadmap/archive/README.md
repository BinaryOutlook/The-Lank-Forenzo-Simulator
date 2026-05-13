# Future Roadmap Archive

Status: Historical record store for completed, rejected, or superseded roadmap work
Last updated: 2026-05-13

This folder keeps finished roadmap documentation out of the active generated master table without losing the audit trail. The active queue stays readable, and future maintainers can still reconstruct what happened.

## What Belongs Here

Archive records belong here when a roadmap item is:

- completed and merged to `main`
- fully fixed by a PR that is being prepared for merge
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
-> issue fully fixed on branch
-> archive record
-> remove active brief
-> regenerate master table
-> merge to main
-> post-merge audit / verification
```

For rejected or superseded work, replace the issue or PR steps with the review decision that closed the candidate.

## Merge-Readiness Rule

A PR branch that fully closes a promoted roadmap issue should include the archive movement before it merges:

- add the archive record here
- remove the completed brief from [`../issue-briefs/`](../issue-briefs/)
- regenerate [`../MASTER_ROADMAP_TABLE.md`](../MASTER_ROADMAP_TABLE.md)
- run `npm run roadmap:check`

The archive record can link the PR before the merge commit exists. A later post-merge audit may add the final merge hash, but the active table should not keep a completed row just to wait for that hash.

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
| FR-0013 | Remove dashboard theme selector | Done | [Issue #85](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/85) | [PR #88](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/88), merge `a06fe7a` | [`FR-0013-remove-dashboard-theme-selector.md`](FR-0013-remove-dashboard-theme-selector.md) |
| FR-0014 | Font compatibility and expanded options | Done | [Issue #86](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/86) | [PR #88](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/88), merge `a06fe7a` | [`FR-0014-font-compatibility-expanded-options.md`](FR-0014-font-compatibility-expanded-options.md) |
| FR-0015 | Small-screen UI optimization | Done | [Issue #87](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/87) | [PR #88](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/88), merge `a06fe7a` | [`FR-0015-small-screen-ui-optimization.md`](FR-0015-small-screen-ui-optimization.md) |
| FR-0016 | Game fairness and ending reachability audit | Done | [Issue #97](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/97) | [PR #101](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/101), merge `6143a8a` | [`FR-0016-game-fairness-ending-reachability-audit.md`](FR-0016-game-fairness-ending-reachability-audit.md) |
| FR-0019 | New design themes | Done | [Issue #91](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/91) | [PR #94](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/94), merge `1dd5919` | [`FR-0019-new-design-themes.md`](FR-0019-new-design-themes.md) |
| FR-0020 | Settings organization update | Done | [Issue #90](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/90) | [PR #93](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/93), merge `efe0377` | [`FR-0020-settings-organization-update.md`](FR-0020-settings-organization-update.md) |
| FR-0022 | Overhauled sub-tab UI experience | Done | [Issue #98](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/98) | [PR #102](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/102), merge `72f1525` | [`FR-0022-overhauled-sub-tab-ui-experience.md`](FR-0022-overhauled-sub-tab-ui-experience.md) |
| FR-0023 | Full and minimal text display modes | Done | [Issue #99](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/99) | [PR #103](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/103), merge `a97cb8b` | [`FR-0023-text-display-density-modes.md`](FR-0023-text-display-density-modes.md) |
