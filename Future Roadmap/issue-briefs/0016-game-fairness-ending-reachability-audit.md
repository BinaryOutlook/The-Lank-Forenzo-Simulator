# Candidate Issue: Game Fairness and Ending Reachability Audit

## Summary

The game should feel fair: events, choices, and state changes should not quietly trap players away from possible endings unless that restriction is deliberate and visible. This candidate explores whether all relevant event paths can lead to all intended endings, and where the structure may create frustrating dead ends.

The first pass should be an audit and reporting effort. Any changes to simulation rules, event content, or ending conditions should follow only after the fairness problem is measured.

## User / Project Value

Players get a more credible strategic experience where surprising outcomes feel earned rather than arbitrary. Maintainers get a clearer map of event-to-ending reachability before adding more content.

## Why Now?

Ending reachability becomes harder to reason about as event and content depth increases. A fairness audit now can prevent small content assumptions from becoming entrenched balance debt.

## Scope

In scope:

- Define what "fairness" and "all possible endings" mean for the current game.
- Audit event, choice, state, and ending reachability.
- Identify events or state transitions that block endings unexpectedly.
- Recommend targeted fixes or follow-up candidates.
- Preserve intentional locks, gates, or consequences where they are part of the design.

## Out of Scope

Not included:

- Rebalancing the entire game in the first pass.
- Guaranteeing every single run can reach every ending regardless of choices.
- Removing meaningful consequences from player decisions.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Simulation rules and ending conditions.
- Event content and state transitions.
- Balance, reachability, or matrix reporting tools.
- Documentation for fairness assumptions if they become design policy.

## Technical Difficulty

High. The work involves simulation logic, event graphs, balance interpretation, and player-facing design judgment.

## Conflict Risk

High. Any eventual fixes may touch shared content and simulation rules that other gameplay work also needs.

## Core-System Risk

High. This touches simulation rules, content structure, ending conditions, and balance tooling.

## Dependencies

- Current reachability and balance report outputs.
- Inventory of events, state changes, and endings.
- Product decision on which ending gates are intentional.

## Suggested Parallelism Class

Red. Core mutation should have one owner. Separate read-only research can happen first, but implementation should not be parallelized across simulation and content rules without a split plan.

## Suggested Agent Assignment

Research first, implementation later.

## Acceptance Criteria

- [ ] Observable outcome: maintainers can see which events and paths can reach which endings.
- [ ] Required behavior: suspected unfair locks are documented with evidence before fixes are proposed.
- [ ] Required documentation: fairness assumptions and follow-up recommendations are recorded.

## Test Plan

- Run current balance and reachability reports.
- Add or update report fixtures only after the expected fairness model is defined.
- Manually review representative event chains against ending requirements.

## Documentation Impact

Which docs need updates if this lands?

- [ ] `README.md`
- [ ] `AGENTS.md`
- [x] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [x] `docs/reference/`
- [ ] Other: balance/reachability report documentation if present.

## Rollback / Revert Plan

Keep audit output separate from behavior changes. If a later fix misfires, revert the targeted simulation/content change while preserving the diagnostic notes.

## Open Questions

- [ ] Does fairness mean every event can theoretically lead to every ending, or that every ending remains reachable from sufficiently broad event families?
- [ ] Which blocked paths are intentional consequences versus accidental traps?
- [ ] Should fairness checks become automated gates?

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [x] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
