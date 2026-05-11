# Future Report Implementation Plan

Status: Agent-ready roadmap breakdown
Owner: BinaryOutlook
Last updated: 2026-05-11
Parent issue: [#17](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/17)
Source report: [`docs/FUTURE_REPORT.md`](FUTURE_REPORT.md)

## 1. Purpose

This plan turns the Future Report into sequenced implementation work. It is the
bridge between the broad roadmap and focused GitHub issues that agents can pick
up without rediscovering the whole design space.

It does not replace:

- [`docs/PRD.md`](PRD.md) for durable product direction
- [`docs/TECHNICAL_BRIEF.md`](TECHNICAL_BRIEF.md) for system reasoning
- versioned PRDs under [`PRDs/`](../PRDs/) for milestone-specific acceptance
  criteria and change logs
- GitHub for live issue state, assignment, PRs, and review history

The planning rule is simple:

$$
\text{Roadmap Value} =
\frac{\text{Reachability Gain} \times \text{Strategic Clarity} \times \text{Testability}}
{\text{Scope Risk}}
$$

High-value issues should therefore widen playable paths, clarify causality, and
ship with report or test evidence before they add large new abstractions.

## 2. Global Execution Rules

Every roadmap issue should preserve the project's core thesis:

> The company and the player are not the same entity.

Roadmap work must also obey these guardrails:

1. Keep the simulation deterministic for a fixed seed, content hash, initial
   state, and selected decision sequence.
2. Do not introduce runtime LLM behavior inside the game loop.
3. Do not make gameplay server-dependent.
4. Keep React presentation separate from deterministic simulation rules.
5. Prefer explicit authored metadata over ID substring matching.
6. Update docs when product behavior, architecture boundaries, commands, or
   content authoring rules change.
7. Use reports and tests to make balance claims falsifiable.

## 3. Canonical Roadmap Issue Map

The following issues are the canonical slices derived from the Future Report.
GitHub remains the source of truth for live status, but this table records the
intended ownership boundary and why each issue exists.

| Issue | Milestone | Workstream | Intended outcome | Required evidence |
| --- | --- | --- | --- | --- |
| [#36](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/36) | V0.6 | PRD packet | Create the iteration packet for balance and reachability repair. | Versioned PRD with baseline, targets, and change log. |
| [#18](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/18) | V0.6 | Balance and reachability | Make all major endings and packs meaningfully reachable before adding large systems. | `balance:matrix`, `reachability:report`, focused regression tests. |
| [#19](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/19) | V0.6 | Archetype bots | Add deterministic bots for underused strategic lanes. | Bot behavior tests and matrix coverage deltas. |
| [#20](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/20) | V0.6 | Low-reachability packs | Repair `safetyDenial`, `shadowSubsidiaries`, and any documented successor low-reach lanes. | Pack coverage diagnostics and content validation. |
| [#21](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/21) | V0.7 | Tray composer V2 | Replace local greedy tray selection with deterministic set-aware composition. | Tray determinism, diversity, exit-preservation, and repeat-pressure tests. |
| [#22](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/22) | V0.7 | Tray diagnostics | Explain why each card entered the tray and why important candidates missed. | Pick-reason diagnostics in tests and/or reports. |
| [#24](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/24) | V0.8 | Hazard content and manifest | Author hazard rules and compile them into the manifest. | Schema/content validation plus manifest diagnostics. |
| [#23](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/23) | V0.8 | Hazard activation | Feed real hazard rules into active run resolution with cooldowns and stale-window handling. | Scheduler tests and scripted run evidence that hazards fire for traceable reasons. |
| [#26](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/26) | V0.9 | Faction metadata | Add explicit faction-effect metadata to content. | Schema validation and regression tests replacing substring assumptions. |
| [#25](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/25) | V0.9 | Faction planner V2 | Let factions form deterministic intents from memory, leverage, evidence, and cooldowns. | Faction behavior tests for repeated misconduct patterns. |
| [#27](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/27) | V0.9 | Operational metadata | Add authored operation-effect metadata to decisions and events. | Content validation and tests for metadata-driven operation effects. |
| [#28](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/28) | V0.9 | Operational cascades | Make operations break causally through backlog, fragility, weather, and visibility. | Deterministic cascade tests and recap/report traces. |
| [#29](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/29) | V1.0 | Dossier and scandal evidence | Expand dossier themes, evidence fragments, and gameplay effects before endings. | Dossier threshold tests and linked evidence samples. |
| [#30](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/30) | V1.0 | End-screen recap | Explain the run as a scandal case, not only an ending ID. | UI/component tests plus Playwright smoke if screens change. |
| [#31](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/31) | V1.0 | Run archive design | Specify local-first archives, gallery data, replay seeds, and storage constraints. | Architecture doc and save/migration plan before implementation. |
| [#32](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/32) | V1.0 | Simulation public API | Create a small stable simulation interface used by React, tests, reports, and future workers. | Type-level API tests and behavior parity tests. |
| [#33](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/33) | V1.0 | Package boundaries | Prepare package seams without a premature monorepo migration. | Boundary documentation and behavior-neutral refactor tests. |
| [#34](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/34) | V1.0 | CI gates | Add validation, build, test, and fast report checks to CI. | Green workflow run and documented commands. |
| [#35](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/35) | V1.0 | Nightly simulation reporting | Design deeper seeded reporting for long-run balance drift. | Workflow/design doc and artifact schema. |

## 4. Milestone Sequencing

### 4.1 V0.6: Widen The Existing Game

Purpose: repair content reachability and ending viability before new systems
increase the search space.

Recommended order:

1. Complete the V0.6 PRD packet and baseline notes ([#36](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/36)).
2. Add or tune archetype bots for neglected lanes ([#19](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/19)).
3. Repair low-reachability packs with content and tray tuning ([#20](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/20)).
4. Use the aggregate balance issue as the integration pass ([#18](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/18)).

Exit gate:

- no single ending exceeds the documented dominance threshold
- all five existing endings are reachable in the matrix or bounded report
- surfaced and selected decision coverage meet the V0.6 PRD targets or document
  an explicit exception

### 4.2 V0.7: Make The Tray Strategic

Purpose: make the decision tray a designed set of strategic opportunities rather
than a list of independently good cards.

Recommended order:

1. Implement the deterministic set optimizer behind the current public caller
   ([#21](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/21)).
2. Add pick reasons, candidate rejection explanations, and report hooks
   ([#22](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/22)).

Exit gate:

- exit cards remain visible when requirements are truly met
- exact tray repeats are suppressed when viable alternatives exist
- low-reachability pressure is explicit, bounded, and diagnosable

### 4.3 V0.8: Activate Hazards Without Making Them Feel Random

Purpose: turn scheduler scaffolding into active pressure that the player can
explain from prior choices and current state.

Recommended order:

1. Define the hazard rule schema and author the first hazard content
   ([#24](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/24)).
2. Wire active run resolution to consume hazard rules with deterministic budgets,
   cooldowns, and stale-window handling ([#23](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/23)).

If [#23](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/23)
starts first, it should use typed fixture rules and leave a clear manifest seam
for [#24](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/24).

Exit gate:

- hazards trigger in scripted simulations
- every hazard has an authored source family and explanation
- diagnostics can distinguish blocked, deferred, stale, and fired hazards

### 4.4 V0.9: Give Institutions And Operations Causal Memory

Purpose: let factions and operations respond to the player's method rather than
only to current metric levels.

Recommended order:

1. Add faction-effect metadata ([#26](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/26)).
2. Implement the faction planner on top of explicit metadata
   ([#25](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/25)).
3. Add operation-effect metadata ([#27](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/27)).
4. Expand operational cascades from metadata and state
   ([#28](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/28)).

Exit gate:

- repeated behavior creates distinct faction responses
- operational cascades can be traced to prior decisions and state
- metadata replaces brittle ID-substring matching in the changed paths

### 4.5 V1.0: Make Runs Memorable And The Architecture Ready To Grow

Purpose: convert deterministic run history into better recaps, local-first
memory, clearer API seams, and stronger automation.

Recommended order:

1. Expand dossiers and scandal evidence ([#29](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/29)).
2. Improve end-screen case summaries ([#30](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/30)).
3. Design the local-first run archive ([#31](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/31)).
4. Clean up the simulation public API ([#32](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/32)).
5. Prepare package boundaries only after the API seam is stable
   ([#33](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/33)).
6. Add CI gates for the normal release checks ([#34](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/34)).
7. Design nightly long-run simulation reports ([#35](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/35)).

Exit gate:

- end screens explain causality, missed windows, and evidence
- archive design is local-first and migration-aware
- CI catches deterministic, content, and build regressions before review

## 5. Dependency Notes

| Upstream work | Unlocks | Rationale |
| --- | --- | --- |
| V0.6 reachability repair | Tray V2, hazards, factions | New systems are easier to evaluate once existing content is reachable. |
| Tray diagnostics | Balance repair, hazard/faction tuning | Pick reasons explain whether content failed because it was ineligible, unoffered, or deprioritized. |
| Hazard manifest rules | Hazard activation | Runtime hazards need authored IDs, explanations, cooldowns, and requirements. |
| Faction metadata | Faction planner V2 | Planner inputs should be authored, not inferred from IDs. |
| Operational metadata | Operational cascades | Cascades should originate from content-declared effects. |
| Dossier evidence | End-screen recaps and archive | The recap and archive need durable proof trails, not only final metrics. |
| Simulation public API | Package-boundary preparation | Package seams should follow a proven API, not the other way around. |
| Fast CI gates | Nightly simulation reporting | Nightly jobs should supplement, not replace, fast PR checks. |

## 6. Agent-Ready Issue Template

Each roadmap issue should be small enough for one focused PR. Use this structure
when creating or refining child issues:

```markdown
## Goal
One or two sentences describing the player, tooling, or architecture outcome.

## Source Context
- Future Report section(s):
- Related PRD section(s):
- Existing files to inspect first:

## Scope
- Concrete implementation steps.
- Files or modules likely to change.

## Non-Goals
- Explicit exclusions that prevent scope creep.

## Acceptance Criteria
- Observable behavior.
- Required tests.
- Required report output or thresholds.
- Required docs updates.

## Verification
- npm run typecheck
- npm run lint
- npm test
- Additional commands such as content validation, balance matrix, reachability,
  build, or Playwright when the blast radius demands them.
```

## 7. Verification Matrix By Change Type

| Change type | Minimum verification | Extra verification when relevant |
| --- | --- | --- |
| Documentation-only | `npm run typecheck`, `npm run lint`, `npm test` | `git diff --check` for whitespace-sensitive doc edits. |
| Content schema or content packs | Minimum gate plus `npm run content:validate` and `npm run content:compile` | `npm run balance:matrix` and `npm run reachability:report` for balance-affecting packs. |
| Simulation rules | Minimum gate plus focused unit tests | Balance/reachability reports when surfacing, endings, hazards, factions, operations, or dossiers change. |
| UI surfaces | Minimum gate plus component tests where present | `npm run build` and `npm run test:e2e` for routed screens, layout, persistence, or responsive behavior. |
| Save or archive shape | Minimum gate plus migration tests | Manual fixture review and docs update for schema versions. |
| CI/tooling | Minimum gate plus local command dry run | Green GitHub Actions run after push. |

## 8. Parent Issue Definition Of Done

Issue [#17](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/17)
is complete when:

- the Future Report has a linked implementation plan
- the plan maps each roadmap child area to a focused issue boundary
- sequencing and dependencies are documented
- each milestone has an exit gate
- README points future agents to the plan

After that, implementation should proceed through the child issues rather than
expanding the parent issue into a catch-all PR.
