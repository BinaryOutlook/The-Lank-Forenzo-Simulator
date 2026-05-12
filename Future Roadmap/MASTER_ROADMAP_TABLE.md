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
| FR-0002 | Refresh balance and reachability thresholds | Brief needed | Balance / tooling | Keeps dominant paths and low-reachability content visible before new systems expand the search space. | M | Medium | Medium | Medium | Current `balance:matrix` and `reachability:report` baselines | Yellow | P1 | Idea | Keep in roadmap | Distilled from `docs/FUTURE_REPORT.md`, `PRDs/v0.6/`, and historical issue #18 work. Promote only with current report output. |
| FR-0003 | Decision tray diagnostics follow-up | Brief needed | Simulation / diagnostics | Explains why choices surface or miss, improving balance tuning and player-facing causality. | M | Medium | Medium | Medium | Existing tray composer and report hooks | Yellow | P2 | Idea | Keep in roadmap | Related to historical issue #22; require a fresh brief if expanding beyond shipped diagnostics. |
| FR-0004 | Run archive implementation | Brief needed | Persistence / UX | Lets completed runs become durable local records instead of disappearing after the ending screen. | L | High | High | High | `docs/reference/run-archive.md`, current save model, archive storage decision | Orange | P2 | Needs Architecture Review | Wait for scoped implementation brief | Design reference exists, but no runtime archive should be implemented without storage, migration, and rollback review. |
| FR-0005 | Long-run simulation worker boundary | Brief needed | Tooling / architecture | Keeps heavy Monte Carlo, reachability, and report jobs from blocking browser UX or local development. | L | High | High | High | Stable simulation public API, report command inventory | Orange | P3 | Needs Architecture Review | Split before promotion | Mentioned in `idea.md` and `docs/FUTURE_REPORT.md`; likely needs a staged design brief before code. |
| FR-0006 | Package-boundary migration decision | Brief needed | Architecture | Clarifies when a monorepo or package split is worth its churn. | XL | High | High | High | ADR-001, stable public simulation API, content compiler contract | Red | P4 | Needs Architecture Review | Do not promote yet | ADR-001 explicitly prepares boundaries without authorizing migration. Treat actual migration as red-zone work. |
| FR-0007 | Content compiler and authoring diagnostics expansion | Brief needed | Content tooling | Turns authored content into richer indexed assets with stronger validation and reachability hints. | L | High | Medium | Medium | Existing manifest/compiler, content schema ownership | Yellow | P2 | Idea | Keep in roadmap | Candidate should separate behavior-neutral manifest work from runtime gameplay changes. |
| FR-0008 | Dossier and scandal evidence expansion | Brief needed | Gameplay systems / content | Makes runs read more like scandal biographies with visible evidence chains and missed windows. | L | Medium | Medium | Medium | Existing dossier primitives, ending recap, content metadata | Yellow | P2 | Idea | Keep in roadmap | Can split content authoring from UI and simulation effects. |
| FR-0009 | Operational network depth pass | Brief needed | Gameplay systems | Deepens operational consequences without turning the game into route dispatch. | L | High | High | High | Current operation primitives, board packet UX, balance reports | Orange | P3 | Needs Clarification | Clarify product surface first | Needs a crisp executive-level scope before any issue is opened. |
| FR-0010 | Challenge seeds and local replay loop | Brief needed | Retention / UX | Gives players intentional reruns and comparison points without server dependency. | M | Medium | Medium | Low | Run seed exposure, archive or recap persistence decision | Yellow | P3 | Idea | Keep in roadmap | Should not depend on online services for first pass. |
| FR-0011 | Route-level code splitting and bundle hygiene | Brief needed | Performance / frontend | Controls bundle growth as routes and screens expand. | M | Medium | Low | Low | Current Vite build warnings and route inventory | Green | P3 | Idea | Keep in roadmap | Promote when bundle growth becomes a recurring review cost or before major routed UI expansion. |
| FR-0012 | Offline content-assistant workflow | Brief needed | Tooling / content process | Could speed authored content drafting while preserving deterministic reviewed assets. | M | Medium | Medium | Low | Content guidelines, review policy, no-runtime-LLM rule | Yellow | P4 | Needs Clarification | Define review boundary first | Must remain offline/tooling-only; no runtime LLM behavior in the game loop. |

## Notes For Maintainers

- Every row promoted after 2026-05-12 should gain a standalone brief before GitHub issue creation.
- Existing historical GitHub issues remain valid records, but this table is the queue for future candidate work.
- Red and orange rows should be split or architecture-reviewed before promotion.
- Green rows can be parallelized only when file ownership is explicit.
- Completed rows should move to [`archive/`](archive/) after issue -> PR -> merge to `main` -> post-merge audit.
