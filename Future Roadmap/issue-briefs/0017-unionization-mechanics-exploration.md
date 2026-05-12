---
id: FR-0017
title: Unionization mechanics exploration
status: Needs Architecture Review
category: Gameplay systems / historical texture
reward: Adds historically grounded labor pressure through events or global state, enriching aviation-era strategy choices.
effort: L
technical_difficulty: High
conflict_risk: High
core_system_risk: High
dependencies: [Product scope decision, faction/global-state design, event authoring model, balance review]
parallelism_class: Orange
priority: P2
github_issue: null
owner: null
last_decision: Explore design first. New mechanic may affect global state and event structure; should be designed before any implementation issue is opened.
---

# Candidate Issue: Unionization Mechanics Exploration

## Summary

Frank Lorenzo's anti-union posture and the role of unionization in aviation history are central to the era the game evokes. This candidate explores adding union participation or labor pressure as a mechanic through events, global state, factions, or some combination of those systems.

The goal is not to bolt on a one-off theme, but to evaluate whether unionization can create meaningful strategic pressure while fitting the existing simulation and narrative structure.

## User / Project Value

Players get a richer aviation-management simulation with historically grounded labor tension. The mechanic could make decisions feel sharper by connecting operational moves, public pressure, workforce morale, and long-run consequences.

## Why Now?

The theme is historically important and naturally tied to existing event and global-state systems. It should be designed before related content expansions make labor mechanics harder to integrate coherently.

## Scope

In scope:

- Explore whether unionization should be modeled through events, global state, factions, or another existing system.
- Define possible player-facing effects and failure modes.
- Identify content needs and balance risks.
- Recommend whether to promote a scoped implementation issue.

## Out of Scope

Not included:

- Immediate implementation of a full labor simulation.
- Rewriting the entire faction or event system.
- Adding online, multiplayer, or external-data labor mechanics.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Event content and authoring rules.
- Global state or faction mechanics.
- Balance reports.
- PRD or versioned PRD packet for any major gameplay iteration.
- Historical/reference documentation if the mechanic is accepted.

## Technical Difficulty

High. The mechanic could span content, state, balance, and user-facing explanation, even if the first implementation is modest.

## Conflict Risk

High. This may overlap with event expansion, faction work, and global-state changes.

## Core-System Risk

High. If implemented through global state or event routing, this becomes core gameplay-system work.

## Dependencies

- Product decision on how prominent labor mechanics should be.
- Existing event and faction system constraints.
- Fairness and reachability considerations for endings affected by labor state.

## Suggested Parallelism Class

Orange. A design owner should control the mechanic shape; helpers can research history, draft content, or prototype bounded UI only after the model is chosen.

## Suggested Agent Assignment

Research first, implementation later.

## Acceptance Criteria

- [ ] Observable outcome: the project has a clear recommendation for whether and how to add unionization mechanics.
- [ ] Required behavior: proposed mechanics identify their effects on state, events, choices, and endings.
- [ ] Required documentation: accepted direction is recorded before implementation begins.

## Test Plan

- Review existing event and global-state systems.
- Run balance/reachability checks for any prototype or future implementation.
- Manually inspect player-facing copy for clarity and historical fit.

## Documentation Impact

Which docs need updates if this lands?

- [ ] `README.md`
- [ ] `AGENTS.md`
- [x] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [x] `docs/reference/`
- [ ] Other: historical content notes if introduced.

## Rollback / Revert Plan

Keep exploration separate from implementation. If a prototype is later rejected, revert the mechanic and preserve the design notes as an archive record or superseded brief.

## Open Questions

- [ ] Should unionization be a global pressure meter, event family, faction layer, or ending modifier?
- [ ] How much historical specificity should the game expose directly?
- [ ] How will the mechanic avoid making one strategy path obviously dominant?

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [x] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
