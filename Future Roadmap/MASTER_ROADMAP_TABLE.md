<!-- GENERATED FILE - DO NOT EDIT MANUALLY -->
<!-- Source: Future Roadmap/issue-briefs/*.md -->
<!-- Regenerate using the documented roadmap generation command. -->

# Master Roadmap Table

Status: Generated candidate-work index

This table is the active candidate queue. A row here does not mean the work is active. It means the work has been noticed, categorized, and given enough structure to decide whether it should wait, be clarified, receive architecture review, or be promoted to a GitHub issue.

Individual issue briefs are the source of truth. To change this table, edit the frontmatter in the relevant brief under [`issue-briefs/`](issue-briefs/) and run `npm run roadmap:generate`.

Completed, rejected, or superseded records move to [`archive/`](archive/) after the post-merge or review audit. Keep this table focused on decisions still waiting in line.

## Status Values

- `Idea`: raw but worth keeping visible.
- `Candidate Brief`: has a standalone brief under `issue-briefs/`.
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

| ID | Title | Brief Link | Category | Reward | Effort | Technical Difficulty | Conflict Risk | Core-System Risk | Dependencies | Parallelism Class | Priority | Status | GitHub Issue | Owner | Last Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FR-0013 | Remove dashboard theme selector | [Brief](issue-briefs/0013-remove-dashboard-theme-selector.md) | UI / settings | Frees dashboard space, especially on smaller screens, while preserving theme control in the options menu. | S | Low | Low | Low | Existing options-menu theme control | Green | P1 | In Progress | [Link](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/85) | Unassigned | Promoted to GitHub issue #85; implementation PR verifies theme remains reachable from options. |
| FR-0014 | Font compatibility and expanded options | [Brief](issue-briefs/0014-font-compatibility-expanded-options.md) | Frontend / platform compatibility | Keeps the game's visual identity consistent across Windows 10, Windows 11, and modern macOS without harming performance. | M | Medium | Low | Low | Font inventory, platform test access, current typography tokens | Yellow | P1 | In Progress | [Link](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/86) | Unassigned | Promoted to GitHub issue #86; implementation adds system fallback stacks and player-facing font presets. |
| FR-0015 | Small-screen UI optimization | [Brief](issue-briefs/0015-small-screen-ui-optimization.md) | Responsive UX | Reduces excessive tab-by-tab scrolling and makes dense screens usable on smaller displays. | L | Medium | High | Low | Responsive audit, screen inventory, decision between longer pages and reduced mobile density | Orange | P1 | In Progress | [Link](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/87) | Unassigned | Promoted to GitHub issue #87; implementation uses a hybrid compact-header and density pass before deeper redesign. |
| FR-0016 | Game fairness and ending reachability audit | [Brief](issue-briefs/0016-game-fairness-ending-reachability-audit.md) | Simulation / balance | Prevents player frustration by checking whether events and paths can fairly reach the available endings. | L | High | High | High | Current reachability reports, event graph, ending conditions, balance tooling | Red | P1 | Needs Architecture Review | None | Unassigned | Research before promotion. Treat as core-system work; start with an audit/reporting pass before changing simulation or content rules. |
| FR-0017 | Unionization mechanics exploration | [Brief](issue-briefs/0017-unionization-mechanics-exploration.md) | Gameplay systems / historical texture | Adds historically grounded labor pressure through events or global state, enriching aviation-era strategy choices. | L | High | High | High | Product scope decision, faction/global-state design, event authoring model, balance review | Orange | P2 | Needs Architecture Review | None | Unassigned | Explore design first. New mechanic may affect global state and event structure; should be designed before any implementation issue is opened. |
| FR-0018 | New game modes: union and regulators | [Brief](issue-briefs/0018-new-game-modes-union-regulators.md) | Gameplay modes / expansion | Expands replayability with reverse-play perspectives where players can act through labor or regulatory pressure instead of the current management lens. | L | High | High | High | Upstreaming mode completion, FR-0017 unionization mechanics direction, role-specific victory conditions, event and ending model | Orange | P2 | Needs Architecture Review | None | Unassigned | Explore after Upstreaming stabilizes. Likely split Union mode and Regulators mode into separate promoted issues once the mode architecture is clearer. |
| FR-0019 | New design themes | [Brief](issue-briefs/0019-new-design-themes.md) | UI / visual design | Adds two more polished visual themes so players have broader presentation options without changing fonts or backgrounds. | M | Medium | Medium | Low | Existing theme token inventory, design direction, accessibility contrast review | Yellow | P2 | In Progress | [Link](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/91) | Unassigned | Promoted to GitHub issue #91 for implementation after the settings organization cleanup. Keep scoped to design themes only; do not add font choices or background changes. |
| FR-0020 | Settings organization update | [Brief](issue-briefs/0020-settings-organization-update.md) | Settings / UI | Keeps the options page readable as theme, font, and UI design choices expand. | S | Low | Low | Low | Current options page layout, theme and font controls, UI design control inventory | Green | P1 | In Progress | [Link](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/90) | Unassigned | Promoted to GitHub issue #90 as the first implementation step before adding more theme options. |
| FR-0021 | Local save options exploration | [Brief](issue-briefs/0021-local-save-options-exploration.md) | Persistence / player experience | Lets players resume sessions while creating a path toward future save integrity protections. | L | High | Medium | High | State serialization inventory, save versioning decision, storage target decision, tamper policy | Orange | P1 | Needs Architecture Review | None | Unassigned | Start with an unencrypted local-save exploration and versioned schema. Treat encrypted or tamper-resistant saves as a later follow-up. |

## Notes For Maintainers

- Individual issue briefs are the roadmap source of truth.
- Agents may edit issue briefs, but only the generation script may edit `MASTER_ROADMAP_TABLE.md`.
- Do not add candidate work directly to this table.
- Use `npm run roadmap:generate` after changing issue brief frontmatter.
- Use `npm run roadmap:check` before opening a PR.
- PRs should include both issue brief metadata changes and the regenerated table when the table is committed.
- Completed rows should move to [`archive/`](archive/) after issue -> PR -> merge to `main` -> post-merge audit, then this table should be regenerated.
