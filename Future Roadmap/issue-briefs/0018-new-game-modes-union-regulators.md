---
id: FR-0018
title: New game modes: union and regulators
status: Needs Architecture Review
category: Gameplay modes / expansion
reward: Expands replayability with reverse-play perspectives where players can act through labor or regulatory pressure instead of the current management lens.
effort: L
technical_difficulty: High
conflict_risk: High
core_system_risk: High
dependencies: [Upstreaming mode completion, FR-0017 unionization mechanics direction, role-specific victory conditions, event and ending model]
parallelism_class: Orange
priority: P2
github_issue: null
owner: null
last_decision: Explore after Upstreaming stabilizes. Likely split Union mode and Regulators mode into separate promoted issues once the mode architecture is clearer.
---

# Candidate Issue: New Game Modes: Union and Regulators

## Summary

The existing Upstreaming mode is nearing completion, so the next gameplay expansion should explore new perspectives rather than only adding more content to the current role. This candidate considers two reverse-play modes: a Union mode focused on labor power and worker coordination, and a Regulators mode focused on investigating, constraining, and potentially jailing the target operation.

These modes should be treated as game-mode design work first. They may require different victory conditions, player resources, event framing, and endings from the current experience.

## User / Project Value

Players get fresh replay value by engaging the same world from opposing institutional perspectives. The project also gains a design path for "reverse play" without immediately committing to a large rewrite.

## Why Now?

Once the current Upstreaming mode is stable, new modes are a natural next layer. Planning the mode architecture early helps avoid hard-coding assumptions that only support the current player role.

## Scope

In scope:

- Explore Union mode as a labor-side player role.
- Explore Regulators mode as an enforcement-side player role.
- Define how reverse-play victory, failure, and ending conditions might work.
- Identify which systems would need to become mode-aware.
- Recommend whether these should split into separate roadmap items.

## Out of Scope

Not included:

- Immediate full implementation of either mode.
- Replacing the current Upstreaming mode.
- Building a multiplayer or online competitive structure.
- Final historical event writing for either mode.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Game mode routing and start flow.
- Scenario and event selection.
- Victory, failure, and ending logic.
- State model for player role and available actions.
- PRD or versioned PRD packet for any major mode iteration.

## Technical Difficulty

High. New modes can change the player objective, available choices, event graph, and ending logic.

## Conflict Risk

High. This may overlap with ongoing work on events, endings, fairness, and unionization mechanics.

## Core-System Risk

High. Mode selection and reverse-play rules could affect simulation architecture, event content, and ending reachability.

## Dependencies

- Upstreaming mode completion or stabilization.
- FR-0017 unionization mechanics direction for Union mode.
- Product decision on whether Union and Regulators modes share a framework.
- A clear model for mode-specific endings.

## Suggested Parallelism Class

Orange. One design owner should control the mode architecture. Helpers can research role concepts, draft event ideas, or review existing state assumptions.

## Suggested Agent Assignment

Research first, implementation later.

## Acceptance Criteria

- [ ] Observable outcome: the project has a recommended shape for Union mode and Regulators mode.
- [ ] Required behavior: the proposal identifies mode-specific resources, actions, endings, and failure states.
- [ ] Required documentation: follow-up implementation candidates are split if the modes are too large for one issue.

## Test Plan

- Review current game mode and scenario assumptions.
- Map existing events and endings against possible reverse-play roles.
- Run reachability reports for any future prototype that changes ending paths.

## Documentation Impact

Which docs need updates if this lands?

- [ ] `README.md`
- [ ] `AGENTS.md`
- [x] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [x] `docs/reference/`
- [ ] Other: mode-design notes if introduced.

## Rollback / Revert Plan

Keep design exploration separate from implementation. If a future prototype misfires, revert the mode entry points and preserve design notes as a superseded roadmap record.

## Open Questions

- [ ] Should Union mode and Regulators mode be separate roadmap items before promotion?
- [ ] Does reverse play reuse the same event engine or need a mode-specific layer?
- [ ] What does "jail them" mean mechanically: ending condition, enforcement meter, event outcome, or courtroom phase?
- [ ] How much of the current state model assumes the player is on the management side?

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [x] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
