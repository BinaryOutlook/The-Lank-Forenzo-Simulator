---
id: FR-0025
title: Theme-adaptive landing poster filter
status: Done
category: UI / visual theming
reward: Lets the LFS halftone aircraft poster feel native in every current theme without duplicating artwork per theme.
effort: Medium
technical_difficulty: Medium
conflict_risk: Medium
core_system_risk: Low
dependencies: []
parallelism_class: Yellow
priority: P1
github_issue: https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/109
owner: BinaryOutlook / AO agents
last_decision: Implemented in PR #112 for GitHub issue #109; archived before merge so the active roadmap table does not keep a stale completed row.
---

# Candidate Issue: Theme-Adaptive Landing Poster Filter

This work adds the fictional LFS halftone aviation poster to the landing page and makes it blend with all first-class themes through a token-driven filtering system. The intended result is a single neutral, copyright-safe image asset that can be translated by theme variables instead of maintaining separate Earth, Armonk Blue, Highwire, and Civic Glass image exports.

The feature should preserve the current landing screen's board-packet mood while filling the large right-side poster space above `Operating doctrine` with a premium editorial image. The artwork must remain decorative, accessible, and resilient across desktop, tablet, and mobile layouts.

## User / Project Value

Players get a stronger first impression of the game's morally compromised airline premise, and maintainers get a scalable image-treatment pattern for future themes.

## Why Now?

The user has selected a copyright-safe LFS halftone direction and wants it tracked, implemented, assigned to AO agents, and merged immediately.

## Scope

In scope:

- Add the generated neutral LFS aircraft/executive halftone artwork as a project asset.
- Render the artwork in the landing poster panel above `Operating doctrine`.
- Add a theme-token-driven filter/color translation system that adapts the artwork to every current theme.
- Keep the image decorative for accessibility and avoid readable real-world branding beyond fictional `LFS`.
- Verify the landing page remains responsive and legible across current themes.

## Out of Scope

Not included:

- New theme creation.
- Runtime user controls for custom poster filters.
- Simulation, save, routing, or content-rule changes.
- Additional generated variants for each theme.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- `public/brand/`
- `src/screens/landing/LandingScreen.tsx`
- `src/screens/landing/LandingScreen.module.css`
- `src/theme/*/tokens.css`
- `README.md`
- `docs/TECH_STACK.md`
- landing/theme tests where practical

## Technical Difficulty

Medium. The implementation is mostly CSS and asset integration, but it needs careful theme-token design so dark and light themes both retain contrast without hard-coding per-component color hacks.

## Conflict Risk

Medium. The likely conflict zones are landing screen layout/CSS, theme token files, and public brand assets.

## Core-System Risk

Low. This does not touch simulation rules, persistence, content schemas, routing, or build tooling.

## Dependencies

Upstream work, decisions, docs, data, or issues:

- Neutral LFS halftone image asset already generated from the user's direction.

## Suggested Parallelism Class

Yellow. Parallel work is safe if split into clear lanes: one lane for asset/layout integration, one lane for theme token/filter review, and one lane for tests/docs.

## Suggested Agent Assignment

Independent parallel lanes:

- Asset/layout owner: landing page markup, CSS layout, public asset placement.
- Theme-system owner: token names, per-theme filter values, dark/light contrast behavior.
- Verification/docs owner: tests, README/TECH_STACK notes, responsive/theme screenshots.

## Acceptance Criteria

- [ ] Observable outcome: the landing poster panel displays the LFS halftone artwork above `Operating doctrine`.
- [ ] Required behavior: the artwork adapts through theme tokens for Earth, Armonk Blue, Highwire, and Civic Glass.
- [ ] Required behavior: the treatment does not introduce real airline branding, real-person claims, or non-fictional company marks.
- [ ] Required behavior: the poster remains decorative/accessibility-safe and does not block the doctrine copy.
- [ ] Required documentation: README or technical docs mention the theme-adaptive poster treatment where appropriate.

## Test Plan

Commands, reports, manual checks, screenshots, or fixtures:

- `npm run roadmap:generate`
- `npm run roadmap:check`
- `npm run check`
- `npm run build`
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

Remove the public poster asset, revert the landing screen markup/CSS and theme token additions, then regenerate the roadmap table if the brief status changes.

## Open Questions

- [ ] Should future generated poster art reuse the same theme-filter token names, or should this stay landing-specific until a second asset needs the pattern?

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [ ] Needs architecture review
- [x] Ready to promote to GitHub issue
- [ ] Reject / archive
