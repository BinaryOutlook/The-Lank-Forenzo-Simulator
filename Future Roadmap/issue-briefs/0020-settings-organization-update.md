---
id: FR-0020
title: Settings organization update
status: In Progress
category: Settings / UI
reward: Keeps the options page readable as theme, font, and UI design choices expand.
effort: S
technical_difficulty: Low
conflict_risk: Low
core_system_risk: Low
dependencies: [Current options page layout, theme and font controls, UI design control inventory]
parallelism_class: Green
priority: P1
github_issue: https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/90
owner: null
last_decision: Promoted to GitHub issue #90 as the first implementation step before adding more theme options.
---

# Candidate Issue: Settings Organization Update

## Summary

Rearrange the settings/options page so theme, font, and UI design controls are presented under separate headings instead of being bundled together. The current grouping can become messy as more settings are planned.

The immediate example is the boardroom presentation options page, where the three choices should be separated to keep future growth manageable.

## User / Project Value

Players get a cleaner settings experience, and future options can be added without making a single dense control group harder to scan.

## Why Now?

Theme and font options have already expanded, and more design options are planned. A small organization pass now prevents the options page from becoming cluttered later.

## Scope

In scope:

- Separate theme, font, and UI design controls into distinct headings.
- Keep the existing settings behavior intact.
- Improve visual spacing and scan order for the affected options page.
- Preserve current selections and storage behavior.

## Out of Scope

Not included:

- Adding new themes.
- Adding new fonts.
- Changing backgrounds.
- Redesigning every settings surface in the app.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Options page or boardroom presentation settings component.
- Settings layout styles.
- Tests or screenshots covering settings if present.

## Technical Difficulty

Low. This should primarily be layout and labeling work around existing controls.

## Conflict Risk

Low. The work is small, but may overlap with theme or options-page changes.

## Core-System Risk

Low. This should not touch simulation rules, persistence, content schemas, routing, or build tooling.

## Dependencies

- Current settings layout.
- Existing theme, font, and UI design controls.
- Decision on final heading labels.

## Suggested Parallelism Class

Green. The task is localized and can be implemented independently if the touched component is clearly owned.

## Suggested Agent Assignment

One owner.

## Acceptance Criteria

- [ ] Observable outcome: theme, font, and UI design settings appear under separate headings.
- [ ] Required behavior: existing settings still apply and persist exactly as before.
- [ ] Required documentation: README or PRD notes are updated only if settings structure is documented there.

## Test Plan

- Run existing frontend checks.
- Manually verify the options page on desktop and small screens.
- Confirm changing theme, font, and UI design still works.

## Documentation Impact

Which docs need updates if this lands?

- [ ] `README.md`
- [ ] `AGENTS.md`
- [ ] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [ ] `docs/reference/`
- [ ] Other:

## Rollback / Revert Plan

Revert the settings layout change. Since behavior should remain unchanged, rollback should not affect saved preferences.

## Open Questions

- [ ] Should the headings use product-facing labels or short utility labels?
- [ ] Does the same grouping need to apply outside the boardroom presentation options page?

## Promotion Decision

- [x] Keep in roadmap
- [ ] Needs clarification
- [ ] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
