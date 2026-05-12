# Master Roadmap Table

Status: Authoritative candidate-work index
Last updated: 2026-05-13

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
| FR-0013 | Remove dashboard theme selector | [Brief](issue-briefs/0013-remove-dashboard-theme-selector.md) | UI / settings | Frees dashboard space, especially on smaller screens, while preserving theme control in the options menu. | S | Low | Low | Low | Existing options-menu theme control | Green | P1 | Candidate Brief | Keep in roadmap | Scoped UI cleanup requested on 2026-05-13; verify theme remains reachable from options before promotion. |
| FR-0014 | Font compatibility and expanded options | [Brief](issue-briefs/0014-font-compatibility-expanded-options.md) | Frontend / platform compatibility | Keeps the game's visual identity consistent across Windows 10, Windows 11, and modern macOS without harming performance. | M | Medium | Low | Low | Font inventory, platform test access, current typography tokens | Yellow | P1 | Candidate Brief | Keep in roadmap | Should include fallback stacks, option expansion, and platform checks before implementation. |
| FR-0015 | Small-screen UI optimization | [Brief](issue-briefs/0015-small-screen-ui-optimization.md) | Responsive UX | Reduces excessive tab-by-tab scrolling and makes dense screens usable on smaller displays. | L | Medium | High | Low | Responsive audit, screen inventory, decision between longer pages and reduced mobile density | Orange | P1 | Needs Clarification | Clarify responsive strategy first | Candidate includes two possible approaches; needs product/design direction before promotion. |
| FR-0016 | Game fairness and ending reachability audit | [Brief](issue-briefs/0016-game-fairness-ending-reachability-audit.md) | Simulation / balance | Prevents player frustration by checking whether events and paths can fairly reach the available endings. | L | High | High | High | Current reachability reports, event graph, ending conditions, balance tooling | Red | P1 | Needs Architecture Review | Research before promotion | Treat as core-system work; start with an audit/reporting pass before changing simulation or content rules. |
| FR-0017 | Unionization mechanics exploration | [Brief](issue-briefs/0017-unionization-mechanics-exploration.md) | Gameplay systems / historical texture | Adds historically grounded labor pressure through events or global state, enriching aviation-era strategy choices. | L | High | High | High | Product scope decision, faction/global-state design, event authoring model, balance review | Orange | P2 | Needs Architecture Review | Explore design first | New mechanic may affect global state and event structure; should be designed before any implementation issue is opened. |

## Notes For Maintainers

- Every row promoted after 2026-05-12 should gain a standalone brief before GitHub issue creation.
- Existing historical GitHub issues remain valid records, but this table is the queue for future candidate work.
- Red and orange rows should be split or architecture-reviewed before promotion.
- Green rows can be parallelized only when file ownership is explicit.
- Completed rows should move to [`archive/`](archive/) after issue -> PR -> merge to `main` -> post-merge audit.
