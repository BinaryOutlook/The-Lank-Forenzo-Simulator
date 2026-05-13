---
id: FR-0022
title: Overhauled sub-tab UI experience
status: Needs Architecture Review
category: UI architecture / responsive UX
reward: Lets each gameplay panel focus on its core job instead of forcing dense text and state into one cluttered adaptive surface.
effort: L
technical_difficulty: High
conflict_risk: High
core_system_risk: Medium
dependencies: [Current run-screen panel inventory, mobile and desktop navigation model, route and tab ownership decision, text-density direction]
parallelism_class: Orange
priority: P1
github_issue: null
owner: null
last_decision: Add as a concern after repeated density pressure in the current run UI. Needs architecture review before implementation because it changes navigation and panel ownership.
---

# Candidate Issue: Overhauled Sub-Tab UI Experience

## Summary

The current UI is carrying too much text and too many gameplay panels on one surface. Even when individual components are responsive, the overall page can become crowded because the layout is trying to preserve every panel at once across very different aspect ratios.

This candidate explores a broader UI experience built around many clickable sub-tabs or panel-level pages. The goal is to let each gameplay area focus on its core job instead of squeezing board packet text, state, decisions, feeds, and supporting details into one dense adaptive page.

## User / Project Value

Players get a clearer experience on phones, tablets, laptops, and desktop monitors because each tab can be optimized for the work it performs. Maintainers get a more durable layout model that does not require every new text block or panel to fit inside one crowded screen.

## Why Now?

The amount of authored text and supporting state has grown enough that the current single-surface pressure is visible. Future systems will make this worse unless the UI model gives panels more room and clearer ownership.

## Scope

In scope:

- Audit current gameplay panels and decide which deserve dedicated sub-tabs or pages.
- Define a clickable sub-tab model for run UI and related pages.
- Preserve access to core gameplay state while reducing on-screen clutter.
- Support phone, tablet, laptop, and desktop aspect ratios.
- Identify whether the model should be route-based, tab-based, or a hybrid.

## Out of Scope

Not included:

- Rewriting simulation rules.
- Removing important gameplay information.
- Implementing minimal text mode by itself.
- Adding new game modes.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Run screen layout and panel composition.
- Decision selection and board packet surfaces.
- App routing or tab state if the model becomes route-aware.
- Responsive CSS modules and shared layout tokens.
- PRD or versioned PRD packet for a major UI iteration.

## Technical Difficulty

High. The challenge is structural: the work needs a navigation and panel ownership model that remains understandable across devices.

## Conflict Risk

High. This may overlap with run-screen, decision-selection, tutorial, settings, and responsive-layout work.

## Core-System Risk

Medium. The candidate should not change simulation rules, but it may affect routing, state presentation, and interaction flows.

## Dependencies

- Current inventory of run-screen panels and dense text zones.
- Product decision on which information must remain globally visible.
- Decision on how this relates to minimal text mode.

## Suggested Parallelism Class

Orange. One owner should control the navigation model. Helpers can audit panel content, prototype isolated tabs, or review responsive behavior after the model is chosen.

## Suggested Agent Assignment

Research first, implementation later.

## Acceptance Criteria

- [ ] Observable outcome: the project has a proposed sub-tab/page model for gameplay panels.
- [ ] Required behavior: the model reduces clutter without hiding critical state or blocking core gameplay.
- [ ] Required documentation: navigation, panel ownership, and responsive assumptions are documented before implementation.

## Test Plan

- Audit current screens at phone, tablet, laptop, and desktop sizes.
- Prototype or document a tab model before changing shared layout.
- Add responsive and smoke coverage for any future implementation.

## Documentation Impact

Which docs need updates if this lands?

- [x] `README.md`
- [ ] `AGENTS.md`
- [x] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [x] `docs/reference/`
- [ ] Other:

## Rollback / Revert Plan

Keep the redesign behind a clear route or layout boundary if implementation proceeds. If the model misfires, revert the tab shell and restore the previous run-screen composition.

## Open Questions

- [ ] Which panels need their own sub-tabs versus remaining global context?
- [ ] Should sub-tabs be route-addressable or local UI state?
- [ ] What information must remain visible while moving between tabs?
- [ ] How should this coordinate with full/minimal text display modes?

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [x] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
