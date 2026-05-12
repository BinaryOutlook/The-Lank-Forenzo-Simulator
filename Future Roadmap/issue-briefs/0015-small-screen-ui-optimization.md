---
id: FR-0015
title: Small-screen UI optimization
status: Needs Clarification
category: Responsive UX
reward: Reduces excessive tab-by-tab scrolling and makes dense screens usable on smaller displays.
effort: L
technical_difficulty: Medium
conflict_risk: High
core_system_risk: Low
dependencies: [Responsive audit, screen inventory, decision between longer pages and reduced mobile density]
parallelism_class: Orange
priority: P1
github_issue: null
owner: null
last_decision: Clarify responsive strategy first. Candidate includes two possible approaches; needs product/design direction before promotion.
---

# Candidate Issue: Small-Screen UI Optimization

## Summary

The UI works well on larger screens, but smaller screens can force too much scrolling across many tabs and compact card regions. The current density makes it harder for players to scan state, compare choices, and move through a run comfortably.

This candidate evaluates and implements a small-screen strategy. Two possible directions are under consideration: make screens longer so users scroll through a fuller page, or reduce information density and font size based on device constraints.

## User / Project Value

Players on compact displays get a calmer, more readable game experience. The project also gains a responsive pattern that future screens can follow instead of solving layout pressure one tab at a time.

## Why Now?

Small-screen strain is already visible, and upcoming gameplay/UI additions will make the problem harder if no responsive baseline is chosen.

## Scope

In scope:

- Audit major screens and tabs at compact viewport sizes.
- Choose a primary small-screen strategy.
- Reduce excessive nested scrolling and tiny card regions.
- Adjust information density, font sizing, spacing, or page flow where needed.
- Verify that large-screen layouts remain strong.

## Out of Scope

Not included:

- Redesigning the entire visual identity.
- Removing core gameplay information from all viewports.
- Adding new gameplay systems.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Dashboard and tab layout components.
- Card/list components used across screens.
- Responsive CSS and design tokens.
- Screenshots or visual verification notes.
- PRD or versioned PRD packet if treated as a major UI iteration.

## Technical Difficulty

Medium. The difficulty is less about individual CSS edits and more about choosing a coherent responsive pattern across many screens.

## Conflict Risk

High. The work may touch shared layout components used by many tabs and could conflict with parallel UI changes.

## Core-System Risk

Low. This should remain a presentation-layer change without simulation, content schema, persistence, or architecture impact.

## Dependencies

- Product/design decision between longer pages, reduced mobile information density, or a hybrid strategy.
- Current inventory of the most problematic small-screen tabs.

## Suggested Parallelism Class

Orange. One main owner should control the responsive pattern; helpers can audit screens or provide bounded patches after ownership is clear.

## Suggested Agent Assignment

Research first, implementation later.

## Acceptance Criteria

- [ ] Observable outcome: compact viewports require less tab-by-tab fighting and fewer tiny scroll boxes.
- [ ] Required behavior: key run information and actions remain accessible on small screens.
- [ ] Required documentation: the chosen responsive strategy is recorded if it becomes a durable UI rule.

## Test Plan

- Run the normal frontend checks.
- Capture or inspect representative compact and desktop viewports.
- Manually navigate the major tabs and confirm no critical controls are hidden, overlapping, or trapped in awkward scroll containers.

## Documentation Impact

Which docs need updates if this lands?

- [ ] `README.md`
- [ ] `AGENTS.md`
- [x] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [ ] `docs/reference/`
- [ ] Other: visual QA notes if the repo has a screenshot workflow.

## Rollback / Revert Plan

Revert responsive layout changes screen by screen, preserving any audit notes that remain useful for a future design pass.

## Open Questions

- [ ] Should compact screens prefer longer full-page scrolling or reduced information density?
- [ ] Which tabs are the highest-friction targets for the first pass?
- [ ] What minimum viewport should define the supported small-screen baseline?

## Promotion Decision

- [ ] Keep in roadmap
- [x] Needs clarification
- [ ] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
