---
id: FR-0000
title: Candidate title
status: Candidate Brief
category: Category
reward: Short value statement
effort: Medium
technical_difficulty: Medium
conflict_risk: Medium
core_system_risk: Medium
dependencies: []
parallelism_class: Yellow
priority: P2
github_issue: null
owner: null
last_decision: null
---

# Candidate Issue: <Title>

This metadata feeds the generated Supermaster table. Do not add candidate work directly to the Supermaster table.

Agents may edit issue briefs, but only the generation script may edit `MASTER_ROADMAP_TABLE.md`. After changing frontmatter, run `npm run roadmap:generate` and verify with `npm run roadmap:check`.

## Frontmatter Field Guide

| Field | Guidance |
| --- | --- |
| `id` | Stable roadmap ID in `FR-0000` format. Match the four-digit filename prefix where practical. |
| `title` | Short, human-readable table title. |
| `status` | Current queue state, such as `Idea`, `Candidate Brief`, `Needs Clarification`, `Needs Architecture Review`, `Ready for GitHub Issue`, `Promoted to GitHub Issue`, `In Progress`, `Blocked`, `Done`, or `Rejected / Archived`. |
| `category` | Primary work area, such as UI, simulation, content, docs, tooling, or architecture. |
| `reward` | Concise value statement for the player, maintainer, content author, or agent workflow. |
| `effort` | Expected implementation size. Use existing roadmap scale labels where possible, such as `S`, `M`, `L`, `Low`, `Medium`, or `High`. |
| `technical_difficulty` | `Low`, `Medium`, or `High`; explain the rating in the body. |
| `conflict_risk` | `Low`, `Medium`, or `High`; name likely merge-conflict zones in the body. |
| `core_system_risk` | `Low`, `Medium`, or `High`; state whether this touches simulation rules, persistence, content schemas, routing, build tooling, or architecture boundaries. |
| `dependencies` | Inline YAML array of prerequisite work, decisions, docs, data, or issues. Use `[]` when none are known. |
| `parallelism_class` | Use `Green`, `Yellow`, `Orange`, or `Red` based on the class guide below. |
| `priority` | Queue priority, such as `P0`, `P1`, `P2`, or `P3`. |
| `github_issue` | GitHub issue URL or shorthand once promoted; use `null` before promotion. |
| `owner` | Current owner if assigned; use `null` if unassigned. |
| `last_decision` | Latest queue decision, review note, or promotion/archive rationale; use `null` if no decision exists yet. |

## Parallelism Classes

| Class | Meaning | Use When |
| --- | --- | --- |
| `Green` | Safe to parallelize aggressively. | Work is isolated, low-risk, and has clear file ownership. |
| `Yellow` | Parallelize with clear file/module boundaries. | Multiple agents can work safely after ownership boundaries are named. |
| `Orange` | One main owner, helpers allowed. | Integration is sensitive, but bounded research or patches can help. |
| `Red` | Do not parallelize core mutation. | Core-system changes need one owner until the risky surface is split or merged. |

## Summary

State the candidate work in one or two concrete paragraphs. Explain what changes for the player, maintainer, content author, or agent workflow.

## User / Project Value

What value does this create? Name the reward, not only the activity.

## Why Now?

Why should this move ahead of other work in the queue? If it is urgent or VIP, state the reason explicitly.

## Scope

In scope:

- TBD

## Out of Scope

Not included:

- TBD

## Expected Touched Areas

Likely files, folders, systems, or docs:

- TBD

## Technical Difficulty

Low / Medium / High. Explain the rating.

## Conflict Risk

Low / Medium / High. Name likely merge-conflict zones.

## Core-System Risk

Low / Medium / High. State whether this touches simulation rules, persistence, content schemas, routing, build tooling, or architecture boundaries.

## Dependencies

Upstream work, decisions, docs, data, or issues:

- TBD

## Suggested Parallelism Class

Green / Yellow / Orange / Red. Explain why.

## Suggested Agent Assignment

Name the preferred ownership model:

- one owner
- owner plus helper
- independent parallel lanes
- research first, implementation later

## Acceptance Criteria

- [ ] Observable outcome:
- [ ] Required behavior:
- [ ] Required documentation:

## Test Plan

Commands, reports, manual checks, screenshots, or fixtures:

- TBD

## Documentation Impact

Which docs need updates if this lands?

- [ ] `README.md`
- [ ] `AGENTS.md`
- [ ] `docs/PRD.md`
- [ ] `PRDs/vX.Y/vX.Y.md`
- [ ] `docs/reference/`
- [ ] Other:

## Rollback / Revert Plan

How can the project back out if the work misfires?

## Open Questions

- [ ] Question:

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [ ] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
