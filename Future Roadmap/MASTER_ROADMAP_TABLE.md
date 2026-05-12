# Master Roadmap Table

Status: Authoritative candidate-work index
Last updated: 2026-05-12

This table is the active candidate queue. A row here does not mean the work is active. It means the work has been noticed, categorized, and given enough structure to decide whether it should wait, be clarified, receive architecture review, or be promoted to a GitHub issue.

Completed, rejected, or superseded records move to [`archive/`](archive/) after the post-merge or review audit. Keep this table focused on decisions still waiting in line.

## Status Values

- `Idea`: raw but worth keeping visible.
- `Candidate Brief`: has or needs a standalone brief under `issue-briefs/`.
- `Needs Clarification`: blocked on product, technical, or ownership questions.
- `Needs Architecture Review`: touches high-risk systems or durable boundaries.
- `Ready for GitHub Issue`: scoped and reviewed enough to promote.
- `Promoted to GitHub Issue`: active tracker item exists.
- `In Progress`: promoted work is actively underway.
- `Blocked`: cannot proceed until a dependency or decision clears.
- `Done`: complete and merged, waiting for archive cleanup.
- `Rejected / Archived`: deliberately not moving forward, waiting for or already represented by an archive record.

## Parallelism Class Legend

| Class | Meaning | Agent Guidance |
| --- | --- | --- |
| Green | Safe to parallelize aggressively. | Good for docs, isolated tests, content notes, or small local fixes with clear file ownership. |
| Yellow | Parallelize with clear file/module boundaries. | Split files or modules before assigning multiple agents. Coordinate merge order. |
| Orange | One main owner, helpers allowed. | The main owner controls integration. Helpers should produce bounded patches or research. |
| Red | Do not parallelize core mutation. | One owner only until the risky core change is merged or split by architecture review. |

## Candidate Queue

| ID | Title | Brief Link | Category | Reward / Value | Effort | Technical Difficulty | Conflict Risk | Core-System Risk | Dependencies | Parallelism Class | Priority | Status | Decision | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|      |       |            |          |                |        |                      |               |                  |              |                   |          |        |          |       |
|      |       |            |          |                |        |                      |               |                  |              |                   |          |        |          |       |
|      |       |            |          |                |        |                      |               |                  |              |                   |          |        |          |       |
|      |       |            |          |                |        |                      |               |                  |              |                   |          |        |          |       |
|      |       |            |          |                |        |                      |               |                  |              |                   |          |        |          |       |
|      |       |            |          |                |        |                      |               |                  |              |                   |          |        |          |       |
|      |       |            |          |                |        |                      |               |                  |              |                   |          |        |          |       |
|      |       |            |          |                |        |                      |               |                  |              |                   |          |        |          |       |
|      |       |            |          |                |        |                      |               |                  |              |                   |          |        |          |       |

## Notes For Maintainers

- Every row promoted after 2026-05-12 should gain a standalone brief before GitHub issue creation.
- Existing historical GitHub issues remain valid records, but this table is the queue for future candidate work.
- Red and orange rows should be split or architecture-reviewed before promotion.
- Green rows can be parallelized only when file ownership is explicit.
- Completed rows should move to [`archive/`](archive/) after issue -> PR -> merge to `main` -> post-merge audit.
