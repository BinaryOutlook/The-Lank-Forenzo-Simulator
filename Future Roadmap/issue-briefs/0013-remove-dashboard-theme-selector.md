---
id: FR-0013
title: Remove dashboard theme selector
status: In Progress
category: UI / settings
reward: Frees dashboard space, especially on smaller screens, while preserving theme control in the options menu.
effort: S
technical_difficulty: Low
conflict_risk: Low
core_system_risk: Low
dependencies: [Existing options-menu theme control]
parallelism_class: Green
priority: P1
github_issue: https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/85
owner: null
last_decision: Promoted to GitHub issue #85; implementation PR verifies theme remains reachable from options.
---

# Candidate Issue: Remove Dashboard Theme Selector

GitHub issue: [#85](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/85)

## Summary

The dashboard currently shows a theme option at the top level across screens. Because theme selection is already available in the options menu, this duplicates control surface and consumes valuable space on smaller displays.

This candidate removes the dashboard-level theme selector while keeping theme selection fully available through the options menu.

## User / Project Value

Players get a cleaner dashboard with less persistent chrome. The payoff is strongest on compact screens, where every fixed control competes with run state and decision information.

## Why Now?

This is a small, visible usability cleanup that reduces clutter before broader small-screen layout work expands the responsive surface.

## Scope

In scope:

- Remove the top-level dashboard theme selector.
- Confirm the options menu still exposes all supported theme choices.
- Preserve current saved theme behavior.
- Check small and large viewport layouts after the control is removed.

## Out of Scope

Not included:

- Adding new themes.
- Redesigning the full options menu.
- Changing theme persistence or defaults.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Dashboard shell or layout components.
- Theme selector component usage.
- Options menu tests or snapshots, if present.
- README or PRD notes only if user-facing settings behavior is documented there.

## Technical Difficulty

Low. The work should be a localized UI removal if the options menu already owns theme selection correctly.

## Conflict Risk

Low. Likely conflicts are limited to shared dashboard layout components.

## Core-System Risk

Low. This should not touch simulation rules, content schemas, routing, persistence beyond existing theme storage, or architecture boundaries.

## Dependencies

- Existing options-menu theme control must remain functional.

## Suggested Parallelism Class

Green. This is a small, isolated UI cleanup with clear ownership.

## Suggested Agent Assignment

One owner.

## Acceptance Criteria

- [ ] Observable outcome: the dashboard no longer shows the top-level theme option.
- [ ] Required behavior: players can still choose themes from the options menu.
- [ ] Required documentation: any documented settings entry points remain accurate.

## Test Plan

- Run the normal frontend checks.
- Manually verify theme changes from the options menu.
- Inspect at least one compact viewport and one desktop viewport.

## Documentation Impact

Which docs need updates if this lands?

- [ ] `README.md`
- [ ] `AGENTS.md`
- [ ] `docs/PRD.md`
- [ ] `PRDs/vX.Y/vX.Y.md`
- [ ] `docs/reference/`
- [ ] Other: update only if the dashboard or options entry point is documented.

## Rollback / Revert Plan

Restore the dashboard selector usage and any removed tests or snapshots.

## Open Questions

- [ ] Is there any screen where the dashboard-level selector is the only reachable theme control?

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [ ] Needs architecture review
- [x] Ready to promote to GitHub issue
- [ ] Reject / archive
