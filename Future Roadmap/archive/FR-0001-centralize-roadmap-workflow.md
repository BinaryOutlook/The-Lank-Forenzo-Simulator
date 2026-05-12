# FR-0001: Centralize Roadmap Workflow

## Final Status

Done.

## Category

Documentation / process.

## Summary

Created the `Future Roadmap/` workflow as the project's pre-GitHub-issue queue. The work centralized candidate planning, added a master roadmap table, created an issue brief template, documented issue-brief naming, and normalized older roadmap-like documents so they point back to the new queue.

## Value Delivered

- Reduced premature GitHub issue creation.
- Gave agents a clear pre-issue triage path.
- Added parallelism-class guidance to reduce merge conflicts.
- Preserved historical roadmap documents while marking superseded workflow instructions.
- Made `Future Roadmap/` the source of truth for candidate ranking and promotion.

## Issue / PR / Merge

- Issue: none; direct user request.
- PR: [#80](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/pull/80)
- Merge commit: `57385dd`
- Merge target: `main`

## Touched Areas

- `Future Roadmap/README.md`
- `Future Roadmap/MASTER_ROADMAP_TABLE.md`
- `Future Roadmap/ISSUE_BRIEF_TEMPLATE.md`
- `Future Roadmap/issue-briefs/README.md`
- `README.md`
- `AGENTS.md`
- `docs/PRD.md`
- `docs/FUTURE_REPORT.md`
- `docs/FUTURE_REPORT_IMPLEMENTATION_PLAN.md`
- `docs/reference/run-archive.md`
- `idea.md`

## Verification

- `git diff --check`
- `npm run check`
- GitHub CI for PR #80:
  - Core checks
  - Playwright smoke
  - Balance and reachability diagnostics

## Conflict-Risk Notes

Low. This was documentation-only governance work. The main risk was future process confusion from leaving older roadmap documents looking authoritative, which the update addressed with explicit planning workflow notes.

## Follow-Up Candidates

- FR-0002: Refresh balance and reachability thresholds.
- FR-0004: Run archive implementation.
- FR-0006: Package-boundary migration decision.

## Archive Decision

Move this item out of the active master table because it is complete and merged. Keep this archive record so future re-audits can see why the roadmap workflow exists, which docs were normalized, and which PR introduced the policy.
