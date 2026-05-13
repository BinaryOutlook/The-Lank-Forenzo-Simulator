---
id: FR-0023
title: Full and minimal text display modes
status: In Progress
category: Settings / accessibility / responsive UX
reward: Gives players a full explanatory mode and a minimal phone-friendly mode so the game remains usable across aspect ratios and device sizes.
effort: L
technical_difficulty: High
conflict_risk: High
core_system_risk: Medium
dependencies: [Settings model, UI copy inventory, mobile rendering audit, content summarization strategy, FR-0022 panel model decision]
parallelism_class: Orange
priority: P1
github_issue: https://github.com/BinaryOutlook/The-Lank-Forenzo-Simulator/issues/99
owner: null
last_decision: Promoted to GitHub issue #99 for a text-density design contract before broad UI copy changes.
---

# Candidate Issue: Full and Minimal Text Display Modes

## Summary

The game currently uses a full-text display style: explanations, consequences, summaries, and supporting text are written with detailed wording. This is strong for atmosphere and learning, but it creates pressure on phone layouts and smaller aspect ratios.

This candidate explores a settings expansion with two display modes:

- Full text display: the current detailed presentation.
- Minimal text display: a bare-bones, compact presentation for phone compatibility and low-density screens.

The goal is universal accessibility across screen aspect ratios and device sizes without deleting the richer writing for players who want it.

## User / Project Value

Players can choose the level of explanation that fits their device and play context. Phone players get a cleaner, faster interface, while desktop players can keep the full boardroom-style detail.

## Why Now?

Text volume is becoming a major factor in responsive design. A display-density setting can reduce layout strain while preserving the game's written identity.

## Scope

In scope:

- Define full text and minimal text display modes.
- Decide whether minimal text is separately authored, derived from existing copy, or rendered through component-level truncation.
- Add a settings model proposal for text display density.
- Identify which surfaces need minimal variants first.
- Preserve full text as the default or current baseline unless product review decides otherwise.

## Out of Scope

Not included:

- Removing the full writing style.
- Rewriting all content in the first pass.
- Building an AI summarization pipeline without review.
- Solving the entire sub-tab UI overhaul by itself.

## Expected Touched Areas

Likely files, folders, systems, or docs:

- Settings model and Options UI.
- Run screen, board packet, decision cards, event feed, tutorial, and ending text.
- Content schema or content conventions if minimal text is authored.
- Responsive CSS for compact text surfaces.
- PRD or versioned PRD packet for a major accessibility/responsive iteration.

## Technical Difficulty

High. A durable mode needs consistent behavior across content, UI components, persistence, and tests. If minimal text requires authored summaries, this may also affect content conventions.

## Conflict Risk

High. The work can touch many user-facing text surfaces and may overlap with UI tab redesign, tutorial updates, and content expansion.

## Core-System Risk

Medium. This should not change simulation outcomes, but it may affect settings persistence, content rendering, and possibly content schemas.

## Dependencies

- Inventory of high-pressure text surfaces.
- Product decision on whether minimal text is authored or mechanically shortened.
- FR-0022 decision on whether panels move into sub-tabs/pages.
- Accessibility review for whether minimal text still communicates required gameplay meaning.

## Suggested Parallelism Class

Orange. One owner should define the text-density contract. Helpers can inventory copy, draft minimal text examples, or add isolated component support after the contract is set.

## Suggested Agent Assignment

Research first, implementation later.

## Acceptance Criteria

- [ ] Observable outcome: the project has a documented plan for full and minimal text display modes.
- [ ] Required behavior: minimal mode improves phone compatibility without hiding critical gameplay meaning.
- [ ] Required documentation: settings behavior, affected surfaces, and content-authoring expectations are documented before implementation.

## Test Plan

- Audit current dense text surfaces on phone and tablet viewports.
- Compare full and minimal examples for comprehension.
- Add settings persistence and responsive UI tests for any future implementation.

## Documentation Impact

Which docs need updates if this lands?

- [x] `README.md`
- [ ] `AGENTS.md`
- [x] `docs/PRD.md`
- [x] `PRDs/vX.Y/vX.Y.md`
- [x] `docs/reference/`
- [ ] Other: content authoring guidance if minimal copy is authored.

## Rollback / Revert Plan

If implementation misfires, remove the minimal display setting and keep the existing full-text presentation. If minimal copy fields are added, keep migrations reversible and default missing minimal copy to full text.

## Open Questions

- [ ] Should minimal text be authored explicitly or derived from existing full text?
- [ ] Which screens must support minimal mode in the first implementation?
- [ ] Should phones default to minimal text or only suggest it?
- [ ] How much explanatory meaning can be removed before gameplay becomes unclear?

## Promotion Decision

- [ ] Keep in roadmap
- [ ] Needs clarification
- [x] Needs architecture review
- [ ] Ready to promote to GitHub issue
- [ ] Reject / archive
