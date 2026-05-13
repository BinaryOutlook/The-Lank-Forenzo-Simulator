---
id: FR-0026
title: Two-tone dotted landing poster
status: In Progress
category: UI / visual theming
reward: Replaces the heavy photo-style poster with a lightweight two-color dotted composition that adapts cleanly to every theme.
effort: Medium
technical_difficulty: Medium
conflict_risk: Medium
core_system_risk: Low
dependencies: [FR-0025]
parallelism_class: Yellow
priority: P1
github_issue: https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/113
owner: BinaryOutlook / sub-agents
last_decision: Promoted to GitHub issue #113 and started immediately per user request.
---

# Candidate Issue: Two-Tone Dotted Landing Poster

Replace the current raster/photo-style LFS landing poster with a lightweight two-tone dotted display. The new treatment should still suggest the executive-airline figure and aircraft tail, but it should be composed from theme-driven dot layers rather than a full image asset that needs inversion, sepia, blend-mode, and opacity tuning.

The goal is a cleaner story-space graphic: a board-packet halftone figure made from two colors per theme, with predictable contrast in dark and light themes and less browser work on the landing screen.

## User / Project Value

Players keep the immediate visual read of “fictional airline executive disaster,” while maintainers get simpler theme behavior and a smaller performance footprint.

## Why Now?

FR-0025 proved the landing panel concept, but the photo-like asset is heavier and more complicated than the product needs. This follow-up should simplify the asset strategy before more theme work depends on it.

## Scope

In scope:

- Remove the raster landing poster dependency from the landing panel.
- Build a two-tone dotted figure/aircraft composition using CSS or a lightweight inline/SVG component.
- Drive the composition through theme tokens, preferably `--landing-poster-*`, with no multi-color raster filtering.
- Preserve responsive layout and the `Operating doctrine` copy.
- Update docs and tests for the simpler poster system.

## Out of Scope

Not included:

- New generated imagery.
- New theme creation.
- Runtime player controls for poster density, shape, or colors.
- Simulation, save, routing, or content-rule changes.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- `public/brand/`
- `src/screens/landing/`
- `src/theme/*/tokens.css`
- `README.md`
- `docs/TECH_STACK.md`
- landing/theme tests where useful

## Technical Difficulty

Medium. The main work is front-end rendering and CSS token design, but the dotted image needs enough recognizable composition to replace the raster poster without becoming brittle or visually noisy.

## Conflict Risk

Medium. The likely conflict zones are the landing screen and theme token files. The work should avoid shared simulation and settings systems.

## Core-System Risk

Low. This is a presentation-layer change only and should not touch simulation rules, persistence, content schemas, or routing.

## Dependencies

Upstream work, decisions, docs, data, or issues:

- FR-0025 introduced the landing poster slot and theme-token vocabulary.

## Suggested Parallelism Class

Yellow. Split into visual implementation, theme-token simplification, and verification/docs lanes.

## Suggested Agent Assignment

Independent parallel lanes:

- Visual owner: two-tone dotted composition in landing markup/CSS.
- Theme owner: simplify per-theme tokens to two colors and minimal surface variables.
- Verification/docs owner: tests, README/TECH_STACK notes, and responsive/theme screenshots.

## Acceptance Criteria

- [ ] Observable outcome: the landing poster no longer depends on the raster photo-style asset.
- [ ] Required behavior: the poster is composed from dotted two-tone graphics that adapt to Earth, Armonk Blue, Highwire, and Civic Glass.
- [ ] Required behavior: the visual still suggests a fictional LFS airline/executive board-packet figure without real branding or real-person likeness claims.
- [ ] Required behavior: the doctrine text remains legible and responsive layout remains stable.
- [ ] Required documentation: README or technical docs describe the two-tone dotted poster treatment.

## Test Plan

Commands, reports, manual checks, screenshots, or fixtures:

- `npm run roadmap:generate`
- `npm run roadmap:check`
- `npm run check`
- `npm run build`
- `npm run test:e2e`
- Browser check landing page across every current theme.

## Documentation Impact

Which docs need updates if this lands?

- [x] `README.md`
- [ ] `AGENTS.md`
- [ ] `docs/PRD.md`
- [ ] `PRDs/vX.Y/vX.Y.md`
- [ ] `docs/reference/`
- [x] Other: `docs/TECH_STACK.md`

## Rollback / Revert Plan

Restore the FR-0025 raster asset and poster CSS, then regenerate the roadmap table if the brief status changes.

## Open Questions

- [ ] Should the dotted composition become a reusable brand primitive for future screens, or remain landing-specific until a second use case appears?

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [ ] Needs architecture review
- [x] Ready to promote to GitHub issue
- [ ] Reject / archive
