---
id: FR-0019
title: New design themes
status: In Progress
category: UI / visual design
reward: Adds two more polished visual themes so players have broader presentation options without changing fonts or backgrounds.
effort: M
technical_difficulty: Medium
conflict_risk: Medium
core_system_risk: Low
dependencies: [Existing theme token inventory, design direction, accessibility contrast review]
parallelism_class: Yellow
priority: P2
github_issue: https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/91
owner: null
last_decision: Promoted to GitHub issue #91 for implementation after the settings organization cleanup. Keep scoped to design themes only; do not add font choices or background changes.
---

# Candidate Issue: New Design Themes

## Summary

Add two new design themes to complement the existing theme set. This should be a visual design overhaul focused on theme tokens, UI colors, borders, emphasis states, and component styling.

This candidate explicitly excludes font choices and background systems. Those should remain separate so theme design does not become a broad settings rewrite.

## User / Project Value

Players get more control over the game's presentation, and the project gains a stronger theme system that can support future visual options without becoming messy.

## Why Now?

Recent settings and theme work makes this a good moment to expand the theme model in a controlled way. It should be easier to add two well-scoped themes now than after more unrelated visual options accumulate.

## Scope

In scope:

- Add two new design themes.
- Define theme tokens for core UI surfaces and controls.
- Verify contrast, focus, hover, and selected states.
- Keep existing themes intact unless small token alignment is needed.

## Out of Scope

Not included:

- New fonts or font presets.
- New backgrounds or art assets.
- Reworking settings information architecture.
- Replacing the entire design system.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Theme token definitions.
- Options menu theme list.
- Shared UI components that consume theme tokens.
- Visual QA notes or screenshots if the implementation becomes a promoted issue.

## Technical Difficulty

Medium. The main challenge is design consistency and coverage across the interface, not complex logic.

## Conflict Risk

Medium. Theme tokens and shared UI styles may overlap with other frontend work.

## Core-System Risk

Low. The candidate should not touch simulation, persistence, routing, or content schemas.

## Dependencies

- Current inventory of theme tokens and existing themes.
- Decision on the two new theme directions.
- Accessibility contrast review for all new theme states.

## Suggested Parallelism Class

Yellow. Designers or agents can explore separate theme directions, but implementation should coordinate shared token ownership.

## Suggested Agent Assignment

Independent parallel lanes for concept exploration, then one owner for integration.

## Acceptance Criteria

- [ ] Observable outcome: two new themes are defined and available for selection.
- [ ] Required behavior: the new themes do not alter font choices or backgrounds.
- [ ] Required documentation: any new theme conventions are documented if token structure changes.

## Test Plan

- Manual visual pass across dashboard, options, boardroom presentation, and dense UI screens.
- Verify contrast for primary text, muted text, selected states, warnings, and focus outlines.
- Run existing frontend checks after implementation.

## Documentation Impact

Which docs need updates if this lands?

- [x] `README.md`
- [ ] `AGENTS.md`
- [ ] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [ ] `docs/reference/`
- [ ] Other:

## Rollback / Revert Plan

Remove the new theme options and token definitions. Existing themes should continue working if implementation stays additive.

## Open Questions

- [ ] What two theme directions best complement the current set?
- [ ] Should theme previews be added before or after expanding the theme list?
- [ ] Are any current components hard-coded in ways that prevent complete theme coverage?

## Promotion Decision

- [x] Keep in roadmap
- [ ] Needs clarification
- [ ] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
