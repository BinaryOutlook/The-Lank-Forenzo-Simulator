---
id: FR-0014
title: Font compatibility and expanded options
status: In Progress
category: Frontend / platform compatibility
reward: Keeps the game's visual identity consistent across Windows 10, Windows 11, and modern macOS without harming performance.
effort: M
technical_difficulty: Medium
conflict_risk: Low
core_system_risk: Low
dependencies: [Font inventory, platform test access, current typography tokens]
parallelism_class: Yellow
priority: P1
github_issue: https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/86
owner: null
last_decision: Promoted to GitHub issue #86; implementation adds system fallback stacks and player-facing font presets.
---

# Candidate Issue: Font Compatibility and Expanded Options

GitHub issue: [#86](https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/86)

## Summary

Development has happened primarily on macOS, and the game may render differently on Windows due to font availability and fallback behavior. This candidate adds stronger font compatibility across Windows 10, Windows 11, and modern macOS.

The work should cover expanded player-facing font options, robust fallback stacks, and platform checks that preserve the game's intended visual image without introducing avoidable performance cost.

## User / Project Value

Players see a consistent, legible interface regardless of platform. Maintainers gain a clearer typography baseline and fewer surprises when testing outside macOS.

## Why Now?

Platform polish matters before additional UI density and content expansion make typography inconsistencies harder to notice and unwind.

## Scope

In scope:

- Inventory current font usage and availability assumptions.
- Define fallback stacks for Windows 10, Windows 11, and modern macOS.
- Add or expose expanded font options where appropriate.
- Check visual consistency and performance impact.
- Document the supported typography baseline if it becomes a durable project rule.

## Out of Scope

Not included:

- A full visual redesign.
- Runtime web-font downloading unless explicitly reviewed for bundle and performance cost.
- Supporting legacy operating systems outside the stated baseline.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Global CSS or theme tokens.
- Options menu font controls, if present or added.
- UI components with hard-coded font assumptions.
- Documentation that describes supported platforms or visual settings.

## Technical Difficulty

Medium. The implementation may be straightforward, but validation requires cross-platform awareness and careful visual testing.

## Conflict Risk

Low. Most changes should be centralized in typography/theme files, though conflicts may appear if concurrent UI work edits the same design tokens.

## Core-System Risk

Low. This is frontend presentation work and should not affect simulation, content schemas, persistence, or architecture boundaries.

## Dependencies

- Access to, or reliable simulation of, Windows 10, Windows 11, and modern macOS font baselines.
- Current theme and typography token inventory.

## Suggested Parallelism Class

Yellow. Research, implementation, and visual checks can be split, but one owner should integrate the final token and settings decisions.

## Suggested Agent Assignment

Owner plus helper.

## Acceptance Criteria

- [ ] Observable outcome: the game has documented font fallback behavior for Windows 10, Windows 11, and modern macOS.
- [ ] Required behavior: missing platform fonts degrade to intentional, legible fallbacks.
- [ ] Required documentation: supported font baseline and any new options are documented where settings or platform support are described.

## Test Plan

- Run the normal frontend checks.
- Inspect representative UI screens with each supported font option.
- Verify fallback stacks on Windows and macOS, or document any unavailable platform test gaps.
- Check that typography changes do not introduce layout overflow on dense screens.

## Documentation Impact

Which docs need updates if this lands?

- [x] `README.md`
- [ ] `AGENTS.md`
- [x] `docs/PRD.md`
- [ ] `PRDs/vX.Y/vX.Y.md`
- [ ] `docs/reference/`
- [ ] Other: options/settings documentation if present.

## Rollback / Revert Plan

Revert font stack and options changes to the previous typography tokens. Remove any new font option UI if it causes layout or performance regressions.

## Open Questions

- [ ] Which font options should be player-facing versus internal fallback-only choices?
- [ ] Should the game bundle a font for consistency, or rely entirely on system stacks?

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [ ] Needs architecture review
- [x] Ready to promote to GitHub issue
- [ ] Reject / archive
